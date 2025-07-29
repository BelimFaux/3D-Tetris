precision mediump float;

varying vec4 v_vertexColor;
varying vec3 v_gouraudColor;
varying vec3 v_gouraudLight;
varying vec2 v_texcoord;

uniform int u_istextured;
uniform float u_mixWhite;
uniform sampler2D u_texture;

void main() {
    vec3 color = u_istextured != 0 ? texture2D(u_texture, v_texcoord).rgb : v_vertexColor.rgb;
    color *= v_gouraudColor;
    color += v_gouraudLight;
    color = mix(color, vec3(1.0, 1.0, 1.0), u_mixWhite);
    // if (u_istextured != 0) color = vec3(v_texcoord, 1.0);
    gl_FragColor = vec4(color, 1.0);
}
