attribute vec4 vPosition;
varying vec4 fColor;
/**Constant defining the maximum amount of charges a user is allowed to place */
const int MAX_CHARGES=20;
/*Array which contains every charge currently inserted.*/
uniform vec3 uPosition[MAX_CHARGES];
/*Constant which contains the dimension of the table.*/
uniform vec2 tableDimension;

/*Constant which represents the double of pi.*/
#define TWOPI 6.28318530718
/*Constant of Coloumb.*/
#define KE pow(8.9875517923, 9.0)
/*Defines the size of the eletric field lines.*/
#define scale 0.06

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

void main()
{
    /*Verifies if is the vertex that will be moved based on the current charges,
    if the vertex has the third coordinate(z) equal to 1 it means is the vertex that will be moved.*/
    if(vPosition.z == 1.0){
        float allFields;
        vec2 allVectors = vec2(0.0,0.0);

        /*Iterates through every charge*/
        for(int i=0;i<MAX_CHARGES;i++){

            /*Calculates distance from vertex to charge.*/
            float r=  distance(vec2(vPosition.x, vPosition.y),vec2(uPosition[i].x, uPosition[i].y));
            /*Calculates eletric field caused by the charge.*/
            float eletricField = KE * uPosition[i].z / (r*r);
            /*Calculates vector caused by the charge*/
            vec2 vector = vec2(vPosition.x - uPosition[i].x, vPosition.y - uPosition[i].y) * eletricField;
            /*Sums up all the vectors to get the final one.*/
            allVectors += vector;
        }
        
        /*Scales down the eletric field lines.*/
        if(length(allVectors) >= 1.0){
            allVectors = normalize(allVectors) * scale;
        }
        fColor = colorize(allVectors);
        /*Calculates the final position of the vertex using the final vector, and redimensions it's coordinates to the table dimensions.*/
        gl_Position = (vPosition + vec4(allVectors,0.0,0.0)) / vec4(tableDimension/2.0, 1.0, 1.0);
        gl_Position.z = vPosition.z *scale;
    }
    else{
        /*Redimensions the vertex positions to the table dimensions.*/
        gl_Position = vPosition / vec4(tableDimension/2.0, 1.0, 1.0);
        fColor = vec4(0.0,0.0,0.0,1.0);
    }
    gl_PointSize = 4.0;
}