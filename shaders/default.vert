attribute vec3 a_color;
attribute vec3 a_coords;
attribute vec3 a_normal;

uniform mat4 u_modelview;
uniform mat4 u_projection;
uniform mat3 u_normal;

varying vec4 v_vertexColor;

const float u_ambientCoefficient = 0.2;
const float u_diffuseCoefficient = 0.7;
const vec3 lightDir = vec3(-1, -1, -1);

void main() {
    vec3 L = normalize(-lightDir);
    vec3 N = normalize(u_normal * a_normal);

    // ambient color
    vec3 ambientColor = a_color.rgb * u_ambientCoefficient;

    // diffuse color
    float diffuseIntensity = max(dot(L, N), 0.0);
    vec3 diffuseColor = a_color.rgb * diffuseIntensity * u_diffuseCoefficient;

    v_vertexColor = vec4(ambientColor + diffuseColor, 1.0);

    if (a_normal == vec3(0, 0, 0))
        v_vertexColor = vec4(a_color, 1.0);

    gl_Position = u_projection * u_modelview * vec4(a_coords, 1.0);
}
