import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';

class GridElement {
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

        gl.uniformMatrix4fv(shader.locUTransform, false, modelMatrix);

        gl.bindVertexArray(this.vaoIndex);
        gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

type PointMapper = (a: number, b: number, c: number) => number[];

/**
 * Helper function to create a GridElement in a AB Plane with a stationary C value.
 * Requires a function to map (a, b, c) to (x, y, z) points
 * @param {number} aSize - the size of the A dimension
 * @param {number} bSize - the size of the B dimension
 * @param {number} cVal - the stationary C value
 * @param {PointMapper} getPoint - a function that maps an (a, b, c) point to an (x, y, z) point
 * @returns {GridElement} a grid of the specified size in the plane that PointMapper translates the AB Plane to
 */
function constructABCGrid(
    aSize: number,
    bSize: number,
    cVal: number,
    getPoint: PointMapper,
): GridElement {
    let vertices = [];
    let indices = [];

    const maxA = aSize / 2;
    const minA = -maxA;
    const maxB = bSize / 2;
    const minB = -maxB;

    // connect corners
    vertices.push(getPoint(minA, minB, cVal));
    vertices.push(getPoint(minA, maxB, cVal));
    vertices.push(getPoint(maxA, maxB, cVal));
    vertices.push(getPoint(maxA, minB, cVal));
    indices.push([0, 1, 1, 2, 2, 3, 3, 0]);

    for (let a = minA + 1; a < maxA; a++) {
        let i: number = vertices.length;
        vertices.push(getPoint(a, minB, cVal));
        vertices.push(getPoint(a, maxB, cVal));
        indices.push([i, i + 1]);
    }
    for (let b = minB + 1; b < maxB; b++) {
        let i: number = vertices.length;
        vertices.push(getPoint(minA, b, cVal));
        vertices.push(getPoint(maxA, b, cVal));
        indices.push([i, i + 1]);
    }

    return new GridElement(
        new Float32Array(vertices.flat()),
        new Uint16Array(indices.flat()),
        new Float32Array(Array(vertices.length).fill([1, 1, 1, 1]).flat()),
    );
}

function constructXZGrid(
    xSize: number,
    zSize: number,
    yVal: number,
): GridElement {
    return constructABCGrid(
        xSize,
        zSize,
        yVal,
        (a: number, b: number, c: number) => [a, c, b],
    );
}
function constructXYGrid(
    xSize: number,
    ySize: number,
    zVal: number,
): GridElement {
    return constructABCGrid(
        xSize,
        ySize,
        zVal,
        (a: number, b: number, c: number) => [a, b, c],
    );
}

function constructZYGrid(ySize: number, zSize: number, xVal: number) {
    return constructABCGrid(
        zSize,
        ySize,
        xVal,
        (a: number, b: number, c: number) => [c, b, a],
    );
}

export class Grid {
    bottom: GridElement;
    top: GridElement;
    back: GridElement;
    front: GridElement;
    left: GridElement;
    right: GridElement;

    constructor() {
        this.bottom = constructXZGrid(4, 4, -5);
        this.top = constructXZGrid(4, 4, 5);
        this.back = constructXYGrid(4, 10, -2);
        this.front = constructXYGrid(4, 10, 2);
        this.left = constructZYGrid(10, 4, -2);
        this.right = constructZYGrid(10, 4, 2);
    }

    initVao(gl: WebGL2RenderingContext, shader: Shader) {
        this.bottom.initVao(gl, shader);
        this.top.initVao(gl, shader);
        this.back.initVao(gl, shader);
        this.front.initVao(gl, shader);
        this.left.initVao(gl, shader);
        this.right.initVao(gl, shader);
    }

    draw(gl: WebGL2RenderingContext, shader: Shader) {
        this.bottom.draw(gl, shader);
        this.back.draw(gl, shader);
        this.left.draw(gl, shader);
        // this.front.draw(gl, shader);
        // this.top.draw(gl, shader);
        // this.right.draw(gl, shader);
    }
}

/**
 * Creates a Cube Shape
 *
 * @returns {Cube} the resulting cube
 */
export function getGrid(): Grid {
    return new Grid();
}
