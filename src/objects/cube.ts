import * as glm from '../gl-matrix/index.js';
import type { Shader } from '../shader.js';

const vertices = new Float32Array(
    [
        // Front face
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
        // Back face
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, -0.5, -0.5],
        // Top face
        [-0.5, 0.5, -0.5],
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        // Bottom face
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5],
        // Right face
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5],
        // Left face
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
    ].flat(),
);

const normals = new Float32Array(
    [
        // Front face
        [0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0],
        // Back face
        [0.0, 0.0, -1.0],
        [0.0, 0.0, -1.0],
        [0.0, 0.0, -1.0],
        [0.0, 0.0, -1.0],
        // Top face
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        // Bottom face
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
        // Right face
        [1.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        // Left face
        [-1.0, 0.0, 0.0],
        [-1.0, 0.0, 0.0],
        [-1.0, 0.0, 0.0],
        [-1.0, 0.0, 0.0],
    ].flat(),
);

const indices = new Uint16Array([
    // front
    0, 1, 2, 0, 2, 3,
    // back
    4, 5, 6, 4, 6, 7,
    // top
    8, 9, 10, 8, 10, 11,
    // bottom
    12, 13, 14, 12, 14, 15,
    // right
    16, 17, 18, 16, 18, 19,
    // left
    20, 21, 22, 20, 22, 23,
]);

/**
 * Creates a Cube Shape
 *
 * @returns {Cube} the resulting cube
 */
export function getRandomColors(): Float32Array {
    // generate random colors for each face
    const color = [Math.random(), Math.random(), Math.random(), 1];
    return new Float32Array(Array(vertices.length).fill(color).flat());
}

export class Cube {
    vertices;
    indices;
    normals;
    colors;
    displace;
    vaoIndex: WebGLVertexArrayObject = -1;

    constructor(displace: vec3, colors: Float32Array = getRandomColors()) {
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.colors = colors;
        this.displace = displace;
    }

    initVao(gl: WebGL2RenderingContext, shader: Shader) {
        this.vaoIndex = gl.createVertexArray();
        gl.bindVertexArray(this.vaoIndex);

        shader.bind();

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locACoord);
        gl.vertexAttribPointer(shader.locACoord, 3, gl.FLOAT, false, 0, 0);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locANormal);
        gl.vertexAttribPointer(shader.locANormal, 3, gl.FLOAT, false, 0, 0);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locAColor);
        gl.vertexAttribPointer(shader.locAColor, 4, gl.FLOAT, false, 0, 0);
    }

    update(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        parentTransform: mat4,
    ) {
        const modelViewMatrix = glm.mat4.create();

        glm.mat4.multiply(modelViewMatrix, modelViewMatrix, viewMatrix);
        glm.mat4.multiply(modelViewMatrix, modelViewMatrix, parentTransform);
        glm.mat4.translate(modelViewMatrix, modelViewMatrix, this.displace);

        gl.uniformMatrix4fv(shader.locUTransform, false, modelViewMatrix);
        if (shader.locUNormal != -1) {
            const normalMatrix = glm.mat3.create();
            glm.mat3.normalFromMat4(normalMatrix, modelViewMatrix);

            gl.uniformMatrix3fv(shader.locUNormal, false, normalMatrix);
        }
    }

    draw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        parentTransform: mat4,
    ) {
        this.update(gl, shader, viewMatrix, parentTransform);
        gl.bindVertexArray(this.vaoIndex);
        gl.drawElements(
            gl.TRIANGLES,
            this.indices.length,
            gl.UNSIGNED_SHORT,
            0,
        );
    }
}
