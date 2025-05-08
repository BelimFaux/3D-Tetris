import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';
import { AXIS, DIM } from '../util.js';
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
    center: vec3;
    translation: mat4;
    rotation: mat4;

    constructor(initialPos: vec3, type: TETRACUBE_TYPE) {
        this.cubes = buildCubeList(type);
        this.translation = glm.mat4.create();
        this.rotation = glm.mat4.create();
        this.center = initialPos;

        // make sure the coordinates are centered in the grid
        const [x, y, z] = DIM.size as [number, number, number];
        if (x % 2 == 0) initialPos[0] += 0.5;
        if (y % 2 != 0) initialPos[1] += 0.5;
        if (z % 2 == 0) initialPos[2] += 0.5;

        glm.mat4.translate(this.translation, this.translation, initialPos);
    }

    initVaos(gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes.forEach((cube) => {
            cube.initVao(gl, shader);
        });
    }

    private translate(diff: vec3) {
        glm.vec3.add(this.center, this.center, diff);
        glm.mat4.translate(this.translation, this.translation, diff);
    }

    translateX(amount: number) {
        this.translate([amount, 0, 0]);
    }

    translateY(amount: number) {
        this.translate([0, amount, 0]);
    }

    translateZ(amount: number) {
        this.translate([0, 0, amount]);
    }

    private rotate(deg: number, axis: vec3) {
        // translate back to the initial position (inverse is a translation in the opposite direction)
        const inv = glm.mat4.clone(this.translation);
        inv[12] *= -1;
        inv[13] *= -1;
        inv[14] *= -1;
        glm.mat4.multiply(this.rotation, this.rotation, this.translation);

        switch (axis) {
            case AXIS.X:
                glm.mat4.rotateX(
                    this.rotation,
                    this.rotation,
                    glm.glMatrix.toRadian(deg),
                );
                break;
            case AXIS.Y:
                glm.mat4.rotateY(
                    this.rotation,
                    this.rotation,
                    glm.glMatrix.toRadian(deg),
                );
                break;
            case AXIS.Z:
                glm.mat4.rotateZ(
                    this.rotation,
                    this.rotation,
                    glm.glMatrix.toRadian(deg),
                );
                break;
            default:
                glm.mat4.rotate(
                    this.rotation,
                    this.rotation,
                    glm.glMatrix.toRadian(deg),
                    axis,
                );
        }

        // translate to the origin
        glm.mat4.multiply(this.rotation, this.rotation, inv);
        return this;
    }

    rotateX(deg: number) {
        this.rotate(deg, AXIS.X);
    }

    rotateY(deg: number) {
        this.rotate(deg, AXIS.Y);
    }

    rotateZ(deg: number) {
        this.rotate(deg, AXIS.Z);
    }

    private getTransform(): mat4 {
        const transformMatrix = glm.mat4.create();
        glm.mat4.multiply(transformMatrix, this.translation, transformMatrix);
        glm.mat4.multiply(transformMatrix, this.rotation, transformMatrix);
        return transformMatrix;
    }

    draw(gl: WebGL2RenderingContext, shader: Shader, viewMatrix: mat4) {
        const transformMatrix = this.getTransform();
        this.cubes.forEach((cube) => {
            cube.draw(gl, shader, viewMatrix, transformMatrix);
        });
    }
}
