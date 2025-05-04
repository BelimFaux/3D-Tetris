precision mediump float;

varying vec4 v_vertexColor;

void main() {
    gl_FragColor = mix(v_vertexColor, selectionColor, u_colorMult);
}
