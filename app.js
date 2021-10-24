import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/**
 * This project is the work of students
 * Ana Filipa Canelhas, 58081
 * André Cordeiro, 57797,
 * for the first project regarding the course CGI in FCT NOVA School. 
 */

/** @type {WebGLRenderingContext} */
/**Constant defining the table width */
const table_width = 3.0;
/**Constant defining the spacing between each line vertice in the table*/
const grid_spacing = 0.05;
/**Constant defining the half of a grid
 * This is used for the distortion of lines, i.e., to add lines
 * in a random location, yet inside a certain interval
 */
const interval = grid_spacing/2;
/**Constant defining the maximum amount of charges a user is allowed to place */
const MAX_CHARGES = 20;
/**Defining the variable to use for creating WebGL rendering context*/
let gl;
/**Defining the two programs we will use */
let program, program2;
/**Defining the buffer we will use.
 * The first one is used for placing the grid lines,
 * the second one is used for placing the charges.
*/
let gridBuffer, chargesBuffer;
/** */
let vPosition;
/**Defining the height of our table */
let table_height;
/**Defining the dimension of our table (w * h) */
let tableDimension;
/**Defining (future) arrays where we will place our grid lines and the charges */
let gridLines, chargesToAdd;
/**Defining an angle for the movement of our charges*/
const theta = 0.008;
/**Defining an index which will be used to keep track of how
 * many times an user has pressed space
*/
let spaceIndex = 0;


/**
 * This function will deal all processes regarding rendering/animation 
 * @param {*} time
 */
function animate(time)
{
    window.requestAnimationFrame(animate);   
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    /**
     * The first program deals with the drawing of the grid lines
     */
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);

    tableDimension = gl.getUniformLocation(program, "tableDimension");
    gl.uniform2f(tableDimension, table_width, table_height);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vPosition);

    /**
     * This for cycle will keep our shader updated with the new positions
     * the charges have, which are all kept in a vec3 named uPosition
     */
    for(let i=0; i<chargesToAdd.length; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform3fv(uPosition, MV.flatten(chargesToAdd[i]));
    } 

    gl.drawArrays(gl.LINES, 0, gridLines.length);

    /**
     * The second program deals with the drawing of the charges
     */
    gl.useProgram(program2);
    gl.bindBuffer(gl.ARRAY_BUFFER, chargesBuffer);

    tableDimension = gl.getUniformLocation(program2, "tableDimension");
    gl.uniform2f(tableDimension, table_width, table_height);

    vPosition = gl.getAttribLocation(program2, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    /**
     * This will hide/show the charges drawing
     */
    if(spaceIndex % 2 == 0)
        gl.drawArrays(gl.POINTS, 0, chargesToAdd.length);
    
    /**
     * This for cycle will deal with the charges movement and subsequently
     * update the array buffer with the new positions
     */
    for(let i=0; i<chargesToAdd.length; i++){
        let temp= chargesToAdd[i];

        if(temp[2] == 1.0)
            chargesToAdd[i] = MV.vec3(temp[1] * -Math.sin(theta) + Math.cos(theta) * temp[0], temp[0] * Math.sin(theta) + Math.cos(theta) * temp[1],temp[2]);
        else if(temp[2] == -1.0)
            chargesToAdd[i] = MV.vec3(temp[1] * Math.sin(theta) + Math.cos(theta) * temp[0], temp[0] * -Math.sin(theta) + Math.cos(theta) * temp[1],temp[2]);
        }
    gl.bufferSubData(gl.ARRAY_BUFFER,0, MV.flatten(chargesToAdd));
}

/**
 * This function will calculate a random float between a given interval
 * @param {*} min: minimum of the interval
 * @param {*} max: maximum of the interval
 * @returns float
 */
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * 
   * @param {*} shaders 
   */
function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    
    gridLines = [];
    chargesToAdd = [];

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    program2 = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = (canvas.height * table_width) / canvas.width;
    
    //Creates a number of vertex based on the current resolution of the canvas
    for(let x = 0; x <= table_width/2; x += grid_spacing) {
        for(let y = 0; y <= table_height/2; y += grid_spacing) {
            /*We use a random function to get random coordinates
            inside a specific range of values and to give a distortion
            effect to our eletric field lines.*/
            let newX = getRandomFloat(x - interval, x + interval);
            let newY = getRandomFloat(y - interval, y + interval);
    
            gridLines.push(MV.vec3(newX, newY,0.0));
            gridLines.push(MV.vec3(newX, newY,1.0));

            newX = getRandomFloat(x - interval, x + interval);
            newY = getRandomFloat(y - interval, y + interval);
            gridLines.push(MV.vec3(-newX, newY,0.0));
            gridLines.push(MV.vec3(-newX, newY,1.0));

            newX = getRandomFloat(x - interval, x + interval);
            newY = getRandomFloat(y - interval, y + interval);
            gridLines.push(MV.vec3(newX, -newY,0.0));
            gridLines.push(MV.vec3(newX, -newY,1.0));

            newX = getRandomFloat(x - interval, x + interval);
            newY = getRandomFloat(y - interval, y + interval);
            gridLines.push(MV.vec3(-newX, -newY,0.0));
            gridLines.push(MV.vec3(-newX, -newY,1.0));
        }
    }

    /*Creates buffer that will keep the data of the grid array.*/
    gridBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(gridLines), gl.STATIC_DRAW);

    /*Creates buffer that will keep the data of the charges array.*/
    chargesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chargesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES * MV.sizeof['vec3'], gl.STATIC_DRAW);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);
    /*Event that gets triggered when the window is resized,
    updating the dimensions of the canvas based on the current dimensions of the window.*/
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        table_height = (canvas.height * table_width) / canvas.width;        
        gl.viewport(0, 0, canvas.width, canvas.height);
    });
    /*Event that gets triggered when the user clicks inside the canvas,
     creates a new charge (positive - just a click,negative - click while holding shift key)
     where the user clicked.*/
    canvas.addEventListener("click", function(event) {

        /*Scales the window's coordinates to the table's dimensions.*/
        const x = (event.offsetX * table_width) / window.innerWidth  -  (table_width /2);
        const y = (event.offsetY * -1 * table_height) / window.innerHeight + (table_height / 2);

        /* We diferentiate the type of charges based on the third value of their coordinates,
        (1 = positive charge, -1 = negatie charge).*/
        if(!event.shiftKey)
            chargesToAdd.push(MV.vec3(x,y,1.0));
        else
            chargesToAdd.push(MV.vec3(x,y, -1.0));

        /*Activates/Selects the buffer which contains charge's data.*/
        gl.bindBuffer(gl.ARRAY_BUFFER, chargesBuffer);
        /*Adds the charge's data stored in the array into the active buffer.*/
        gl.bufferSubData(gl.ARRAY_BUFFER,0, MV.flatten(chargesToAdd));

    });

    /*Event that gets triggered when spacebar key is held down,
    it increments a variable which is later used in function animate to determine
    if charges will be shown on the canvas or not.*/
    document.addEventListener('keyup', event => {
        if (event.code === 'Space') {
            spaceIndex++;
        }
    });

}

const allshaders = ["shader1.frag", "shader1.vert", "shader2.vert", "shader2.frag"];
UTILS.loadShadersFromURLS(allshaders).then(shaders => setup(shaders));