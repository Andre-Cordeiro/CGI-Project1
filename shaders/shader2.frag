precision highp float;
varying float charge;

/*Verifies if a pixel is outside a circle based on the distance from the center.*/
void discPixOutOfCircle(){
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    if(dot(fragmentPosition,fragmentPosition) > 1.0){
      discard;
    }
}

/*Creates a positive charge texture*/
void positiveCharge(){
  if((gl_PointCoord.x>=0.15 &&gl_PointCoord.x<=0.85 && gl_PointCoord.y>=0.40 && gl_PointCoord.y<=0.6)
     || (gl_PointCoord.x>=0.40 && gl_PointCoord.x<=0.6 && gl_PointCoord.y>=0.15 && gl_PointCoord.y<=0.85))
     gl_FragColor = vec4( 0.0,0.0,0.0, 1.0);
    else
      gl_FragColor = vec4( 0.0,1.0,0.0, 1.0);
}

/*Creates a negative charge texture*/
void negativeCharge(){
  if(gl_PointCoord.x>=0.15 &&gl_PointCoord.x<=0.85 && gl_PointCoord.y>=0.40 && gl_PointCoord.y<=0.6)
     gl_FragColor = vec4( 0.0,0.0,0.0, 1.0 );
    else
      gl_FragColor = vec4( 1.0,0.0,0.0, 1.0);
}

void main()
{
    discPixOutOfCircle();
    if(charge == 1.0)
       positiveCharge();
    else
     negativeCharge();
}
