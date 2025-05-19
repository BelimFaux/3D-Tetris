precision mediump float;

varying vec4 v_vertexColor;
varying vec3 v_gouraud;
varying vec2 v_texcoord;

uniform int u_istextured;
uniform sampler2D u_texture;

void main() {
    vec3 color = u_istextured != 0 ? texture2D(u_texture, v_texcoord).rgb : v_vertexColor.rgb;
    color *= v_gouraud;
    gl_FragColor = vec4(color, 1.0);
}
