precision mediump float;

uniform float u_ambientCoefficient;
uniform float u_diffuseCoefficient;
uniform float u_specularCoefficient;

varying vec4 v_vertexColor;
varying vec3 v_normal;
varying vec3 v_light;
varying vec3 v_eye;
varying float v_distToLight;

void main() {
    // normalize all vectors again
    vec3 N = normalize(v_normal);
    vec3 L = normalize(v_light);
    vec3 E = normalize(v_eye);
    vec3 R = reflect(-L, N); // reflection vector

    // ambient component
    vec3 ambientColor = v_vertexColor.rgb * u_ambientCoefficient;

    // diffuse component
    float diffuseIntensity = max(dot(L, N), 0.0);
    vec3 diffuseColor = v_vertexColor.rgb * diffuseIntensity * u_diffuseCoefficient;

    // specular component
    float specularIntensity = pow(max(dot(E, R), 0.0), 32.0); // (E * R)^n
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * specularIntensity * u_specularCoefficient;

    // combine all component for final color
    vec3 finalColor = ambientColor + diffuseColor + specularColor;

    if (v_normal == vec3(0.0)) finalColor = vec3(1.0);

    gl_FragColor = vec4(finalColor, 1.0);
}
