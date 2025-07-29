import type { Game } from '../game.js';
import type { vec3, mat4 } from 'gl-matrix';
import * as glm from 'gl-matrix';

import type { Shader } from '../shader';
import { AXIS, DIM } from '../utils/globals.js';
import { CollisionEvent, collisionTest } from './collision.js';
import { Cube, getRandomColor } from './cube.js';

// probability for a textured tetracube
const TEXTURED_PROBABILITY = 0.1;

/**
 * All possible types of tetracubes
 */
export enum TetracubeType {
    IPIECE,
    OPIECE,
    LPIECE,
    TPIECE,
    NPIECE,
    TOWER_RIGHT,
    TOWER_LEFT,
    TRIPOD,
    EMPTY,
}

/**
 * Helper to get all cubes for an I-Piece
 */
function buildIPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-2, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

/**
 * Helper to get all cubes for an I-Piece
 */
function buildOPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

/**
 * Helper to get all cubes for an O-Piece
 */
function buildLPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

/**
 * Helper to get all cubes for an T-Piece
 */
function buildTPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 0, 0], colors),
    ];
}

/**
 * Helper to get all cubes for an N-Piece
 */
function buildNPiece(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 0], colors),
        new Cube([0, 1, 0], colors),
        new Cube([1, 1, 0], colors),
    ];
}

/**
 * Helper to get all cubes for a Tower-Right Piece
 */
function buildTowerRight(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([1, 1, -1], colors),
        new Cube([1, 0, -1], colors),
    ];
}

/**
 * Helper to get all cubes for an Tower-Left Piece
 */
function buildTowerLeft(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([1, 0, 0], colors),
        new Cube([0, 1, -1], colors),
        new Cube([0, 0, -1], colors),
    ];
}

/**
 * Helper to get all cubes for a Tripod Piece
 */
function buildTripod(): Array<Cube> {
    const colors = getRandomColor();
    return [
        new Cube([0, 0, 0], colors),
        new Cube([-1, 0, 0], colors),
        new Cube([0, 0, 1], colors),
        new Cube([0, 1, 0], colors),
    ];
}

/**
 * Helper to get all cubes for a given tetracube type
 */
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
        case TetracubeType.EMPTY:
        default:
            return [];
    }
}

/**
 * Class to represent a Tetracube
 */
export class Tetracube {
    cubes: Array<Cube>;
    position: vec3;
    translation: mat4;
    rotation: mat4;
    game: Game;

    /**
     * Construct a new tetracube
     *
     * @param initialPos {vec3} the initial position
     * @param type {TetracubeType} the type of the tetracube
     * @param game {Game} the game that the tetracube belongs to
     * @param [textured=Math.random() <= TEXTURED_PROBABILITY] {boolean} if the cube is textured or not
     */
    constructor(
        initialPos: vec3,
        type: TetracubeType,
        game: Game,
        textured: boolean = Math.random() <= TEXTURED_PROBABILITY,
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

    /**
     * Initialize the vaos of the tetracube for the shader and context
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader initialize for
     */
    initVaos(gl: WebGL2RenderingContext, shader: Shader): void {
        this.cubes.forEach((cube) => {
            cube.initVao(gl, shader);
        });
    }

    /**
     * helper to translate the tetracube by a given value
     *
     * @param diff {vec3} how much to translate the tetracube by
     */
    private rawTranslate(diff: vec3): void {
        glm.vec3.add(this.position, this.position, diff);
        glm.mat4.translate(this.translation, this.translation, diff);
    }

    /**
     * helper to translate the tetracube by a given value and check for collisions
     * If a collision of the expected type took place, the translation will be undone
     *
     * @param diff {vec3} how much to translate the tetracube by
     * @param expectedCollision {CollisionEvent} the collision events to check for
     */
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

    /**
     * translate the tetracube in X direction
     * wont have any effect if a wall or other piece would have been hit (CollisionEvent.SIDES)
     *
     * @param amount {number} how much to translate by
     * @returns {CollisionEvent} the collision that occured
     */
    translateX(amount: number): CollisionEvent {
        return this.translate([amount, 0, 0], CollisionEvent.SIDES);
    }

    /**
     * translate the tetracube in Y direction
     * wont have any effect if the bottom would have been hit (CollisionEvent.BOTTOM)
     *
     * @param amount {number} how much to translate by
     * @returns {CollisionEvent} the collision that occured
     */
    translateY(amount: number): CollisionEvent {
        return this.translate([0, amount, 0], CollisionEvent.BOTTOM);
    }

    /**
     * translate the tetracube in Z direction
     * wont have any effect if a wall or other piece would have been hit (CollisionEvent.SIDES)
     *
     * @param amount {number} how much to translate by
     * @returns {CollisionEvent} the collision that occured
     */
    translateZ(amount: number): CollisionEvent {
        return this.translate([0, 0, amount], CollisionEvent.SIDES);
    }

    /**
     * Helper to rotate the object by the given degrees around the given axis
     *
     * @param rad {number} the radians to rotate by
     * @param axis {vec3} the axis to rotate around
     */
    private rawRotate(rad: number, axis: vec3): void {
        const inv = glm.mat4.create();
        const old = glm.mat4.clone(this.rotation);
        glm.mat4.transpose(inv, this.rotation); // rot matrix is orthogonal so transpose is inverse

        // undo previous rotation so the axes stay the same
        glm.mat4.multiply(this.rotation, this.rotation, inv);

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

        glm.mat4.multiply(this.rotation, this.rotation, old);
    }

    /**
     * helper to rotate the tetracube by a given degree around a given axis and check for collisions
     * If the block would collide with the sides or the top, the rotation will be undone
     *
     * @param deg {number} the number of degrees to rotate by
     * @param axis {vec3} the axis around which to rotate
     * @returns {CollisionEvent} the collision that occured
     */
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

    /**
     * rotate the tetracube by a given degree around the X-axis
     * If the block would collide with the sides or the top, this will have no effect
     *
     * @param deg {number} the number of degrees to rotate by
     * @returns {CollisionEvent} the collision that occured
     */
    rotateX(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.X);
    }

    /**
     * rotate the tetracube by a given degree around the Y-axis
     * If the block would collide with the sides or the top, this will have no effect
     *
     * @param deg {number} the number of degrees to rotate by
     * @returns {CollisionEvent} the collision that occured
     */
    rotateY(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.Y);
    }

    /**
     * rotate the tetracube by a given degree around the Z-axis
     * If the block would collide with the sides or the top, this will have no effect
     *
     * @param deg {number} the number of degrees to rotate by
     * @returns {CollisionEvent} the collision that occured
     */
    rotateZ(deg: number): CollisionEvent {
        return this.rotate(deg, AXIS.Z);
    }

    /**
     * Test if this tetracube collides with any other blocks or the playing field borders
     *
     * @param [others=[]] {Array<Tetracube>} the others to collide with
     * @returns {CollisionEvent} the collision that occured
     */
    testCollisions(others: Array<Tetracube> = []): CollisionEvent {
        return collisionTest(this, others);
    }

    /**
     * Test if this tetracube is at the given y-coordinate
     *
     * @param yVal {number} the y-coordinate to check at
     * @returns {boolean} true if tetracube is at the coordinate, false else
     */
    isAt(yVal: number): boolean {
        const transform = this.getTransform();
        return this.cubes.every((cube) => {
            const cubePos = cube.getCoord(transform);
            return Math.abs(cubePos[1] - yVal) <= 0.01;
        });
    }

    /**
     * Remove all cubes from the tetracube that are at the given y-coordinate
     *
     * @param yVal {number} the y-coordinate to remove blocks from
     */
    removeY(yVal: number): void {
        const transform = this.getTransform();
        this.cubes = this.cubes.filter((cube) => {
            const cubePos = cube.getCoord(transform);
            return Math.abs(cubePos[1] - yVal) >= 0.01;
        });
    }

    /**
     * Move the tetracube downwards by one if it is above the y-coordinate
     *
     * @param yVal {number} the y-coordinate to check against
     */
    moveIfAbove(yVal: number): void {
        const transform = this.getTransform();
        const shouldMove = this.cubes.every((cube) => {
            const cubePos = cube.getCoord(transform);
            return cubePos[1] > yVal;
        });

        if (shouldMove) this.rawTranslate([0, -1, 0]);
    }

    /**
     * Test if tetracube contains no more cubes
     *
     * @returns {boolean} true if tetracube is empty, false else
     */
    isEmpty(): boolean {
        return this.cubes.length == 0;
    }

    /**
     * Split the tetracube into a list of tetracubes consisting of only one cube each
     * the singles will keep their parents translation, rotation, color and texture
     *
     * @returns {Array<Tetracube>} the resulting list of tetracubes
     */
    splitIntoSingles(): Array<Tetracube> {
        const ret = this.cubes.map((cube) => {
            const pos = cube.getCoord(this.getTransform());
            const tcube = new Tetracube(
                pos,
                TetracubeType.EMPTY,
                this.game,
                false,
            );
            tcube.cubes.push(new Cube([0, 0, 0], cube.color));
            (tcube.cubes[0] as Cube).textured = cube.textured;
            tcube.rotation = this.rotation;
            return tcube;
        });
        this.cubes = [];
        return ret;
    }

    /**
     * Snap the cube to the nearest gridplaces if it got off-centered somehow
     * This should never result in a collision if there was no collision before
     */
    snapToGrid(): void {
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

    /**
     * Return the coordinates that the tetracube occupies
     *
     * @returns {Array<vec3>} a list of the coordinates
     */
    getCoordinates(): Array<vec3> {
        const cubes = this.cubes;
        const coordinates: Array<vec3> = [];
        const transform = this.getTransform();
        cubes.forEach((cube) => {
            coordinates.push(cube.getCoord(transform));
        });

        return coordinates;
    }

    /**
     * Return the transformation matrix of this tetracube
     *
     * @returns {mat4} the transformation matrix
     */
    getTransform(): mat4 {
        const transformMatrix = glm.mat4.create();
        glm.mat4.multiply(transformMatrix, this.rotation, transformMatrix);
        glm.mat4.multiply(transformMatrix, this.translation, transformMatrix);
        return transformMatrix;
    }

    /**
     * draw the tetracube with cubes in the given context with the given shader and view matrix
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shder to draw with
     * @param viewMatrix {mat4} the view matrix to draw with
     */
    drawCubes(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
    ): void {
        const transformMatrix = this.getTransform();
        this.cubes.forEach((cube) => {
            cube.drawCube(gl, shader, viewMatrix, transformMatrix);
        });
    }

    /**
     * draw the tetracube as cylinders in the given context with the given shader and view matrix
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shder to draw with
     * @param viewMatrix {mat4} the view matrix to draw with
     */
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
