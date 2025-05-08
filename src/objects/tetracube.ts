import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';
import { Cube, getRandomColors } from './cube.js';

export enum TETRACUBE_TYPE {
    IPIECE,
    OPIECE,
    LPIECE,
    TPIECE,
    NPIECE,
    TOWER_RIGHT,
    TOWER_LEFT,
    TRIPOD,
}

function buildIPiece(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([-2, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

function buildOPiece(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildLPiece(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildTPiece(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

function buildNPiece(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildTowerRight(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, -1], colors),
        new Cube([1, 0, -1], colors),
    ];
}

function buildTowerLeft(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([0, 1, -1], colors),
        new Cube([0, 0, -1], colors),
    ];
}

function buildTripod(): Array<Cube> {
    const colors = getRandomColors();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 1], colors),
        new Cube([0, 1, 0], colors),
    ];
}

function buildCubeList(type: TETRACUBE_TYPE): Array<Cube> {
    switch (type) {
        case TETRACUBE_TYPE.IPIECE:
            return buildIPiece();
        case TETRACUBE_TYPE.OPIECE:
            return buildOPiece();
        case TETRACUBE_TYPE.LPIECE:
            return buildLPiece();
        case TETRACUBE_TYPE.TPIECE:
            return buildTPiece();
        case TETRACUBE_TYPE.NPIECE:
            return buildNPiece();
        case TETRACUBE_TYPE.TOWER_RIGHT:
            return buildTowerRight();
        case TETRACUBE_TYPE.TOWER_LEFT:
            return buildTowerLeft();
        case TETRACUBE_TYPE.TRIPOD:
            return buildTripod();
        default:
            // unreachable
            return [];
    }
}

export class Tetracube {
    cubes: Array<Cube>;
    transform: mat4;

    constructor(initialPos: vec3, type: TETRACUBE_TYPE) {
        this.cubes = buildCubeList(type);
        this.transform = glm.mat4.create();
        glm.mat4.translate(this.transform, this.transform, initialPos);
    }

    initVaos(gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes.forEach((cube) => {
            cube.initVao(gl, shader);
        });
    }

    draw(gl: WebGL2RenderingContext, shader: Shader, viewMatrix: mat4) {
        this.cubes.forEach((cube) => {
            cube.draw(gl, shader, viewMatrix, this.transform);
        });
    }
}
