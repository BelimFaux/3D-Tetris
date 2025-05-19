import type { Game } from '../game.js';
import * as glm from '../gl-matrix/index.js';

import type { Shader } from '../shader';
import { AXIS, DIM } from '../utils/constants.js';
import { CollisionEvent, collisionTest } from './collision.js';
import { Cube, getRandomColor } from './cube.js';

export enum TetracubeType {
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
    const colors = getRandomColor();
    return [
        new Cube([-2, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

function buildOPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildLPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildTPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

function buildNPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

function buildTowerRight(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, -1], colors),
        new Cube([1, 0, -1], colors),
    ];
}

function buildTowerLeft(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([0, 1, -1], colors),
        new Cube([0, 0, -1], colors),
    ];
}

function buildTripod(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 1], colors),
        new Cube([0, 1, 0], colors),
    ];
}

function buildCubeList(type: TetracubeType): Array<Cube> {
    switch (type) {
        case TetracubeType.IPIECE:
            return buildIPiece();
        case TetracubeType.OPIECE:
            return buildOPiece();
        case TetracubeType.LPIECE:
            return buildLPiece();
        case TetracubeType.TPIECE:
            return buildTPiece();
        case TetracubeType.NPIECE:
            return buildNPiece();
        case TetracubeType.TOWER_RIGHT:
            return buildTowerRight();
        case TetracubeType.TOWER_LEFT:
            return buildTowerLeft();
        case TetracubeType.TRIPOD:
            return buildTripod();
        default:
            // unreachable
            return [];
    }
}

export class Tetracube {
    cubes;
    position;
    translation;
    rotation;
    game;

    constructor(
        initialPos: vec3,
        type: TetracubeType,
        game: Game,
        textured: boolean,
    ) {
        this.cubes = buildCubeList(type);
        this.cubes.forEach((cube) => (cube.textured = textured));
        this.position = initialPos;
        this.translation = glm.mat4.create();
        this.rotation = glm.mat4.create();
        this.game = game;

        // make sure the coordinates are centered in the grid
        const [x, y, z] = DIM.size as [number, number, number];
        if (x % 2 == 0) this.position[0] += 0.5;
        if (y % 2 == 0) this.position[1] += 0.5;
        if (z % 2 == 0) this.position[2] += 0.5;

        glm.mat4.translate(this.translation, this.translation, this.position);
    }

    initVaos(gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes.forEach((cube) => {
            cube.initVao(gl, shader);
        });
    }

    private rawTranslate(diff: vec3) {
        glm.vec3.add(this.position, this.position, diff);
        glm.mat4.translate(this.translation, this.translation, diff);
    }

    private translate(
        diff: vec3,
        expectedCollision: CollisionEvent,
    ): CollisionEvent {
        const temp = glm.mat4.clone(this.translation);
        this.rawTranslate(diff);

        const collision = collisionTest(this, this.game.pieces);
        if (collision & expectedCollision) {
            // undo translation if there was a collision
            glm.vec3.sub(this.position, this.position, diff);
            this.translation = temp;
        }
        return collision;
    }

    translateX(amount: number): CollisionEvent {
        return this.translate([amount, 0, 0], CollisionEvent.SIDES);
    }

    translateY(amount: number): CollisionEvent {
        return this.translate([0, amount, 0], CollisionEvent.BOTTOM);
    }

    translateZ(amount: number): CollisionEvent {
        return this.translate([0, 0, amount], CollisionEvent.SIDES);
    }

    private rawRotate(rad: number, axis: vec3) {
        switch (axis) {
            case AXIS.X:
                glm.mat4.rotateX(this.rotation, this.rotation, rad);
                break;
            case AXIS.Y:
                glm.mat4.rotateY(this.rotation, this.rotation, rad);
                break;
            case AXIS.Z:
                glm.mat4.rotateZ(this.rotation, this.rotation, rad);
                break;
            default:
                glm.mat4.rotate(this.rotation, this.rotation, rad, axis);
        }
    }

    private rotate(deg: number, axis: vec3): CollisionEvent {
        const temp = glm.mat4.clone(this.rotation);
        this.rawRotate(glm.glMatrix.toRadian(deg), axis);
        const collision = collisionTest(this, this.game.pieces);
        if (
            collision &
            (CollisionEvent.SIDES | CollisionEvent.BOTTOM) // exclude top since elements spawn at top
        ) {
            // undo rotation if there was a collision
            this.rotation = temp;
        }
        return collision;
    }

    rotateX(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.X);
    }

    rotateY(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.Y);
    }

    rotateZ(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.Z);
    }

    testCollisions(others: Array<Tetracube> = []): CollisionEvent {
        return collisionTest(this, others);
    }

    removeY(yVal: number) {
        const transform = this.getTransform();
        this.cubes = this.cubes.filter((cube) => {
            const cubePos = cube.getCoord(transform);
            return Math.abs(cubePos[1] - yVal) >= 0.001;
        });
    }

    moveIfAbove(yVal: number) {
        const transform = this.getTransform();
        const shouldMove = this.cubes.every((cube) => {
            const cubePos = cube.getCoord(transform);
            return cubePos[1] > yVal;
        });

        if (shouldMove) this.rawTranslate([0, -1, 0]);
    }

    isEmpty(): boolean {
        return this.cubes.length == 0;
    }

    snapToGrid() {
        // reverse centering of coordinate to not disturb rounding
        const [x, y, z] = DIM.size as [number, number, number];
        if (x % 2 == 0) this.position[0] -= 0.5;
        if (y % 2 == 0) this.position[1] -= 0.5;
        if (z % 2 == 0) this.position[2] -= 0.5;

        this.position[0] = Math.round(this.position[0]);
        this.position[1] = Math.round(this.position[1]);
        this.position[2] = Math.round(this.position[2]);

        if (x % 2 == 0) this.position[0] += 0.5;
        if (y % 2 == 0) this.position[1] += 0.5;
        if (z % 2 == 0) this.position[2] += 0.5;

        glm.mat4.identity(this.translation);
        glm.mat4.translate(this.translation, this.translation, this.position);
    }

    getCoordinates(): Array<vec3> {
        const cubes = this.cubes;
        const coordinates: Array<vec3> = [];
        const transform = this.getTransform();
        cubes.forEach((cube) => {
            coordinates.push(cube.getCoord(transform));
        });

        return coordinates;
    }

    getTransform(): mat4 {
        const transformMatrix = glm.mat4.create();
        glm.mat4.multiply(transformMatrix, this.rotation, transformMatrix);
        glm.mat4.multiply(transformMatrix, this.translation, transformMatrix);
        return transformMatrix;
    }

    drawCubes(gl: WebGL2RenderingContext, shader: Shader, viewMatrix: mat4) {
        const transformMatrix = this.getTransform();
        this.cubes.forEach((cube) => {
            cube.drawCube(gl, shader, viewMatrix, transformMatrix);
        });
    }

    drawCylinders(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
    ) {
        const transformMatrix = this.getTransform();
        this.cubes.forEach((cube) => {
            cube.drawCylinder(gl, shader, viewMatrix, transformMatrix);
        });
    }
}
