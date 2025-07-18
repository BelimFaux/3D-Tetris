import * as glm from '../gl-matrix/index.js';
import type { Shader } from '../shader.js';
import { DIM } from '../utils/globals.js';
import { getFile, getTexture } from '../utils/files.js';
import { ObjParser, type ObjData } from './objparser.js';

let cubeData: ObjData;
let cylinderData: ObjData;

/**
 * parse data for primitives (cube and cylinder)
 * will fail if the files have not been loaded before
 */
export function parseObjData(): void {
    const parser = new ObjParser();
    cubeData = parser.parse(getFile('ressources/models/cube.obj'));
    cylinderData = parser.parse(getFile('ressources/models/cylinder.obj'));
}

/**
 * get a random color
 *
 * @returns {vec4} the random color
 */
export function getRandomColor(): vec4 {
    return [Math.random(), Math.random(), Math.random(), 1];
}

/**
 * Class to represent a cube
 */
export class Cube {
    cubeData;
    cylinderData;
    color;
    displace;
    textured: boolean = false;
    cubeVaoIndex: WebGLVertexArrayObject = -1;
    cylinderVaoIndex: WebGLVertexArrayObject = -1;

    /**
     * construct a new cube
     *
     * @param displace {vec3} the displacement of the cube
     * @param [color=getRandomColor()] {vec4} the color of the cube
     */
    constructor(displace: vec3, color: vec4 = getRandomColor()) {
        this.cubeData = cubeData;
        this.cylinderData = cylinderData;
        this.color = color;
        this.displace = displace;
    }

    /**
     * init vao for an obj data object
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param data {ObjData} the data for the object
     * @returns {WebGLVertexArrayObject} the vao for the data
     */
    private initVaoFrom(
        gl: WebGL2RenderingContext,
        shader: Shader,
        data: ObjData,
    ): WebGLVertexArrayObject {
        const vaoIndex = gl.createVertexArray();
        gl.bindVertexArray(vaoIndex);

        shader.bind();

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locACoord);
        gl.vertexAttribPointer(shader.locACoord, 3, gl.FLOAT, false, 0, 0);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locANormal);
        gl.vertexAttribPointer(shader.locANormal, 3, gl.FLOAT, false, 0, 0);

        const colorBuffer = gl.createBuffer();
        const colors = new Float32Array(
            Array(data.vertices.length).fill(this.color).flat(),
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locAColor);
        gl.vertexAttribPointer(shader.locAColor, 4, gl.FLOAT, false, 0, 0);

        if (this.textured) {
            const texBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data.texturecoords, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(shader.locATexcoord);
            gl.vertexAttribPointer(
                shader.locATexcoord,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
        }

        return vaoIndex;
    }

    /**
     * initialize vaos for the cube
     *
     * @param gl {WebGLRenderingContext} the webgl context
     * @param shader {Shader} the shader
     */
    initVao(gl: WebGL2RenderingContext, shader: Shader): void {
        this.cubeVaoIndex = this.initVaoFrom(gl, shader, this.cubeData);
        this.cylinderVaoIndex = this.initVaoFrom(gl, shader, this.cylinderData);
    }

    /**
     * return the coordinate that the cube occupies
     *
     * @param transform {mat4} a transformation matrix that should be applied before
     * @returns {vec3} the coordinate
     */
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

    /**
     * calculate the final positions using the transform and view matrices and bind to the shader
     *
     * @param gl {WebGLRenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param viewMatrix {mat4} the view matrix
     * @param parentTransform {mat4} the transformation matrix
     */
    private update(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        parentTransform: mat4,
    ): void {
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

    /**
     * draw the cube as a cylinder
     *
     * @param gl {WebGLRenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param viewMatrix {mat4} the view matrix
     * @param parentTransform {mat4} the transformation matrix
     */
    drawCylinder(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        parentTransform: mat4,
    ): void {
        this.update(gl, shader, viewMatrix, parentTransform);
        if (this.textured) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(
                gl.TEXTURE_2D,
                getTexture('ressources/textures/barrelTexture.webp'),
            );
            gl.uniform1i(shader.locUTexture, 0);
            gl.uniform1i(shader.locUIsTextured, 1);
        }
        gl.bindVertexArray(this.cylinderVaoIndex);
        gl.drawElements(
            gl.TRIANGLES,
            this.cylinderData.indices.length,
            gl.UNSIGNED_SHORT,
            0,
        );
        gl.uniform1i(shader.locUIsTextured, 0);
    }

    /**
     * draw the cube as a cube
     *
     * @param gl {WebGLRenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param viewMatrix {mat4} the view matrix
     * @param parentTransform {mat4} the transformation matrix
     */
    drawCube(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        parentTransform: mat4,
    ) {
        this.update(gl, shader, viewMatrix, parentTransform);
        if (this.textured) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(
                gl.TEXTURE_2D,
                getTexture('ressources/textures/crateTexture.webp'),
            );
            gl.uniform1i(shader.locUTexture, 1);
            gl.uniform1i(shader.locUIsTextured, 1);
        }
        gl.bindVertexArray(this.cubeVaoIndex);
        gl.drawElements(
            gl.TRIANGLES,
            this.cubeData.indices.length,
            gl.UNSIGNED_SHORT,
            0,
        );
        gl.uniform1i(shader.locUIsTextured, 0);
    }
}
