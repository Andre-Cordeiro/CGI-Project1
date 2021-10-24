attribute vec4 vPosition;
varying float charge;
uniform vec2 tableDimension;

void main()
{
    gl_Position = vPosition / vec4(tableDimension/2.0, 1.0, 1.0);
    gl_PointSize = 20.0;
    charge = vPosition.z;
}

