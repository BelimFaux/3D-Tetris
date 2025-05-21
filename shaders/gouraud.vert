precision mediump float;

attribute vec3 a_color;
attribute vec3 a_coords;
attribute vec3 a_normal;
attribute vec2 a_texture;

uniform vec3 u_eye;
uniform mat4 u_modelview;
uniform mat4 u_projection;
uniform mat3 u_normal;

uniform float u_ambientCoefficient;
uniform float u_diffuseCoefficient;
uniform float u_specularCoefficient;

varying vec4 v_vertexColor;

// since we might need interpolated texture coords, calculate final color in vertex shader
// (lightning calculations are still done in fragment shader)
varying vec3 v_gouraudColor;
varying vec3 v_gouraudLight;
varying vec2 v_texcoord;

const vec3 lightDir = vec3(-1, -1, -1);

void main() {
    vec4 viewPosition = u_modelview * vec4(a_coords, 1.0);

    vec3 L = normalize(-lightDir);
    vec3 N = normalize(u_normal * a_normal);
    vec3 E = normalize(u_eye - viewPosition.xyz); // Eye vector
    vec3 R = reflect(-L, N); // reflection vector

    // ambient color
    vec3 ambientColor = vec3(1.0, 1.0, 1.0) * u_ambientCoefficient;

    // diffuse color
    float diffuseIntensity = max(dot(L, N), 0.0);
    vec3 diffuseColor = vec3(1.0, 1.0, 1.0) * diffuseIntensity * u_diffuseCoefficient;

    // specular component
    float specularIntensity = pow(max(dot(E, R), 0.0), 32.0); // (E * R)^n
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specularIntensity * u_specularCoefficient;

    // combine all components for the final color, that gets interpolated
    v_gouraudColor = ambientColor + diffuseColor;
    v_gouraudLight = specularColor;
    v_vertexColor = vec4(a_color, 1.0);
    v_texcoord = a_texture;

    if (a_normal == vec3(0, 0, 0)) {
        v_vertexColor = vec4(a_color, 1.0);
        v_gouraudColor = vec3(1.0);
    }

    gl_Position = u_projection * viewPosition;
}
