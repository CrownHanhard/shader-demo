uniform vec3 uColor;

void main(){
    float strength=distance(gl_PointCoord,vec2(.5));
    strength*=2.;
    strength=1.-strength;
    strength=step(.5,strength);
    gl_FragColor=vec4(uColor,strength);
    
}