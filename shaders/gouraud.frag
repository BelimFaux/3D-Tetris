precision mediump float;

varying vec4 v_vertexColor;
varying vec2 v_texcoord;

uniform int u_istextured;
uniform sampler2D u_texture;

void main() {
    if (u_istextured != 0) gl_FragColor = texture2D(u_texture, v_texcoord);
    else gl_FragColor = v_vertexColor;
}
