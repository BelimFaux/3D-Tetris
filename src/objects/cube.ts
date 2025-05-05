import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';

const vertices = new Float32Array(
    [
        // Front face
        [-0.5, 0.0, 0.5],
        [0.5, 0.0, 0.5],
        [0.5, 1.0, 0.5],
        [-0.5, 1.0, 0.5],
        // Back face
        [-0.5, 0.0, -0.5],
        [-0.5, 1.0, -0.5],
        [0.5, 1.0, -0.5],
        [0.5, 0.0, -0.5],
        // Top face
        [-0.5, 1.0, -0.5],
        [-0.5, 1.0, 0.5],
        [0.5, 1.0, 0.5],
        [0.5, 1.0, -0.5],
        // Bottom face
        [-0.5, 0.0, -0.5],
        [0.5, 0.0, -0.5],
        [0.5, 0.0, 0.5],
        [-0.5, 0.0, 0.5],
        // Right face
        [0.5, 0.0, -0.5],
        [0.5, 1.0, -0.5],
        [0.5, 1.0, 0.5],
        [0.5, 0.0, 0.5],
        // Left face
        [-0.5, 0.0, -0.5],
        [-0.5, 0.0, 0.5],
        [-0.5, 1.0, 0.5],
        [-0.5, 1.0, -0.5],
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

export class Cube {
    vertices;
    indices;
    colors;
    vaoIndex: WebGLVertexArrayObject = -1;

    constructor(
        vertices: Float32Array,
        indices: Uint16Array,
        colors: Float32Array,
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
    }

    initVao(gl: WebGL2RenderingContext, shader: Shader) {
        this.vaoIndex = gl.createVertexArray();
        gl.bindVertexArray(this.vaoIndex);

        shader.bind();

        const cubeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locACoord);
        gl.vertexAttribPointer(shader.locACoord, 3, gl.FLOAT, false, 0, 0);

        const cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        const cubeColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locAColor);
        gl.vertexAttribPointer(shader.locAColor, 4, gl.FLOAT, false, 0, 0);
    }

    draw(gl: WebGL2RenderingContext, shader: Shader) {
        const modelMatrix = glm.mat4.create();
        glm.mat4.translate(modelMatrix, modelMatrix, [-1.5, -5.0, -1.5]);
        gl.uniformMatrix4fv(shader.locUTransform, false, modelMatrix);

        gl.bindVertexArray(this.vaoIndex);
        gl.drawElements(
            gl.TRIANGLES,
            this.indices.length,
            gl.UNSIGNED_SHORT,
            0,
        );
    }
}

/**
 * Creates a Cube Shape
 *
 * @returns {Cube} the resulting cube
 */
export function getCube(): Cube {
    // generate random colors for each face
    const randomColors = [];
    const colors = [Math.random(), Math.random(), Math.random(), 1];
    for (let i = 0; i < indices.length / 4; ++i) {
        randomColors.push(colors);
        randomColors.push(colors);
        randomColors.push(colors);
        randomColors.push(colors);
    }

    return new Cube(vertices, indices, new Float32Array(randomColors.flat()));
}
