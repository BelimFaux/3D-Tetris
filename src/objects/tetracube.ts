import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';
import { Cube, getRandomColors } from './cube.js';

export enum TETRACUBE_TYPE {
    IPIECE,
    OPIECE,
    LPIECE,
    TPIECE,
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
        new Cube([-1, 0, 0], colors),
        new Cube([-1, -1, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, -1, 0], colors),
    ];
}

function buildCubeList(type: TETRACUBE_TYPE): Array<Cube> {
    switch (type) {
        case TETRACUBE_TYPE.IPIECE:
            return buildIPiece();
        case TETRACUBE_TYPE.OPIECE:
            return buildOPiece();

        default:
            return [];
    }
}

export class Tetracube {
    cubes: Array<Cube>;
    transform: mat4;

    constructor(type: TETRACUBE_TYPE) {
        this.cubes = buildCubeList(type);
        this.transform = glm.mat4.create();
    }

    initVaos(gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes.forEach((cube) => {
            cube.initVao(gl, shader);
        });
    }

    draw(gl: WebGL2RenderingContext, shader: Shader, viewMatrix: mat4) {
        this.cubes.forEach((cube) => {
            cube.draw(gl, shader, viewMatrix);
        });
    }
}
