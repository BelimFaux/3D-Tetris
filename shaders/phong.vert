precision mediump float;

attribute vec3 a_color;
attribute vec3 a_coords;
attribute vec3 a_normal;

uniform vec3 u_eye;
uniform mat4 u_modelview;
uniform mat4 u_projection;
uniform mat3 u_normal;

varying vec4 v_vertexColor;
varying vec3 v_normal;
varying vec3 v_light;
varying vec3 v_eye;

const vec3 lightDir = vec3(-1, -1, -1);

void main() {
    // Transform vertex position and normal vector to view space
    vec4 viewPosition = u_modelview * vec4(a_coords, 1.0);

    v_light = normalize(-lightDir); // light vector
    if (a_normal == vec3(0.0)) v_normal = a_normal;
    else v_normal = normalize(u_normal * a_normal); // normal vector

    v_eye = normalize(u_eye - viewPosition.xyz); // Eye vector
    v_vertexColor = vec4(a_color, 1.0);

    gl_Position = u_projection * viewPosition;
}
