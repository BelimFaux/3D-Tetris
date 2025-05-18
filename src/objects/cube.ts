import * as glm from '../gl-matrix/index.js';
import type { Shader } from '../shader.js';
import { DIM } from '../utils/constants.js';
import { getFile } from '../utils/files.js';
import { ObjParser, type ObjData } from './objparser.js';

let cubeData: ObjData;

export function parseObjData() {
    const parser = new ObjParser();
    cubeData = parser.parse(getFile('ressources/cube.obj'));
}

/**
 * Creates a Cube Shape
 *
 * @returns {Cube} the resulting cube
 */
export function getRandomColors(): Float32Array {
    // generate random colors for each face
    const color = [Math.random(), Math.random(), Math.random(), 1];
    return new Float32Array(Array(cubeData.vertices.length).fill(color).flat());
}

export class Cube {
    vertices;
    indices;
    normals;
    colors;
    displace;
    vaoIndex: WebGLVertexArrayObject = -1;

    constructor(displace: vec3, colors: Float32Array = getRandomColors()) {
        this.vertices = cubeData.vertices;
        this.indices = cubeData.indices;
        this.normals = cubeData.normals;
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

    getCoord(transform: mat4): vec3 {
        const center = glm.vec3.clone(this.displace);
        glm.vec3.transformMat4(center, center, transform);

        // undo displacement
        const [x, y, z] = DIM.size as [number, number, number];
        if (x % 2 == 0) center[0] -= 0.5;
        if (y % 2 == 0) center[1] -= 0.5;
        if (z % 2 == 0) center[2] -= 0.5;
        return center;
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
