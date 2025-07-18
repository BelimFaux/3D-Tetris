import * as glm from '../gl-matrix/index.js';

import { DIM } from '../utils/globals.js';

import type { Shader } from '../shader';
import type { Camera } from '../camera.js';

// color of the grid
const GRID_COLOR = [1, 1, 1, 1];

/**
 * A grid element that lies in one plane
 */
class GridElement {
    vertices;
    indices;
    midpoint;
    vaoIndex: WebGLVertexArrayObject = -1;

    /**
     * Construct a new gid element that from the vertices and indices with the given midpoint
     */
    constructor(vertices: Float32Array, indices: Uint16Array, midpoint: vec3) {
        this.vertices = vertices;
        this.indices = indices;
        this.midpoint = midpoint;
    }

    /**
     * Initialize the vertex array for the webgl context for the shader
     *
     * @param gl {WebGL2RenderingContext} th webgl context
     * @param shader {Shader} the shader
     */
    initVao(gl: WebGL2RenderingContext, shader: Shader): void {
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

        const colors = new Float32Array(
            Array(this.vertices.length).fill(GRID_COLOR).flat(),
        );
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.locAColor);
        gl.vertexAttribPointer(shader.locAColor, 3, gl.FLOAT, false, 0, 0);
    }

    /**
     * Draw the grid element if it does not block the view from the camera position to the midpoint
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param globalTransformationMatrix {mat4} a matrix containing all global transformations
     * @param camPos {vec3} the camera position in world space
     */
    maybeDraw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        globalTransformationMatrix: mat4,
        camPos: vec3,
    ): void {
        const mid = glm.vec3.clone(this.midpoint);
        glm.vec3.transformMat4(mid, mid, globalTransformationMatrix);

        // test if face is infront of insides
        if (glm.vec3.dot(mid, camPos) >= 0.0) return;
        this.draw(gl, shader);
    }

    /**
     * Draw the grid element
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     */
    draw(gl: WebGL2RenderingContext, shader: Shader): void {
        shader.bind();
        gl.bindVertexArray(this.vaoIndex);
        gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

// type alias for function that maps point to another point
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
        getPoint(0, 0, cVal),
    );
}

/**
 * Construct a grid in the xz-plane with the given sizes at the given y-coordinate
 *
 * @param xSize {number} the size in the x dimension
 * @param zSize {number} the size in the z dimension
 * @param yVal {number} the y-coordinate
 * @returns {GridElement} the constructed grid
 */
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

/**
 * Construct a grid in the xy-plane with the given sizes at the given z-coordinate
 *
 * @param xSize {number} the size in the x dimension
 * @param ySize {number} the size in the y dimension
 * @param zVal {number} the y-coordinate
 * @returns {GridElement} the constructed grid
 */
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

/**
 * Construct a grid in the zy-plane with the given sizes at the given x-coordinate
 *
 * @param ySize {number} the size in the y dimension
 * @param zSize {number} the size in the z dimension
 * @param xVal {number} the x-coordinate
 * @returns {GridElement} the constructed grid
 */
function constructZYGrid(
    ySize: number,
    zSize: number,
    xVal: number,
): GridElement {
    return constructABCGrid(
        zSize,
        ySize,
        xVal,
        (a: number, b: number, c: number) => [c, b, a],
    );
}

/**
 * Class to represent a full grid (with all sides)
 */
export class Grid {
    bottom: GridElement;
    top: GridElement;
    back: GridElement;
    front: GridElement;
    left: GridElement;
    right: GridElement;

    /**
     * Create a new grid
     * will take its size from the DIM global variable
     */
    constructor() {
        const [sizeX, sizeY, sizeZ] = DIM.size as [number, number, number];
        const [minX, minY, minZ] = DIM.min as [number, number, number];
        const [maxX, maxY, maxZ] = DIM.max as [number, number, number];

        this.bottom = constructXZGrid(sizeX, sizeZ, minY);
        this.top = constructXZGrid(sizeX, sizeZ, maxY);

        this.back = constructXYGrid(sizeX, sizeY, minZ);
        this.front = constructXYGrid(sizeX, sizeY, maxZ);

        this.left = constructZYGrid(sizeY, sizeZ, minX);
        this.right = constructZYGrid(sizeY, sizeZ, maxX);
    }

    /**
     * Initialize all vertex array for the webgl context for the shader
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     */
    initVao(gl: WebGL2RenderingContext, shader: Shader): void {
        this.bottom.initVao(gl, shader);
        this.top.initVao(gl, shader);
        this.back.initVao(gl, shader);
        this.front.initVao(gl, shader);
        this.left.initVao(gl, shader);
        this.right.initVao(gl, shader);
    }

    /**
     * Draw only the grid elements that don't block the view from the camera position to the midpoint
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param camera {Camera} the camera of the scene
     */
    maybeDraw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        camera: Camera,
    ): void {
        const viewMatrix = camera.getView();
        const camPos = camera.getEye();
        const transformationMatrix = camera.getTransform();
        shader.bind();
        gl.uniformMatrix4fv(shader.locUTransform, false, viewMatrix);

        this.bottom.maybeDraw(gl, shader, transformationMatrix, camPos);
        this.back.maybeDraw(gl, shader, transformationMatrix, camPos);
        this.left.maybeDraw(gl, shader, transformationMatrix, camPos);
        this.front.maybeDraw(gl, shader, transformationMatrix, camPos);
        this.top.maybeDraw(gl, shader, transformationMatrix, camPos);
        this.right.maybeDraw(gl, shader, transformationMatrix, camPos);
    }

    /**
     * Draw the grid
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param viewMatrix {mat4} the view matrix to draw with
     */
    draw(gl: WebGL2RenderingContext, shader: Shader, viewMatrix: mat4): void {
        shader.bind();
        gl.uniformMatrix4fv(shader.locUTransform, false, viewMatrix);

        this.bottom.draw(gl, shader);
        this.back.draw(gl, shader);
        this.left.draw(gl, shader);
        this.front.draw(gl, shader);
        this.top.draw(gl, shader);
        this.right.draw(gl, shader);
    }
}
