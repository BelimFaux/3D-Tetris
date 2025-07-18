import * as glm from '../gl-matrix/index.js';

import { DIM } from '../utils/globals.js';
import { Tetracube } from './tetracube.js';

/*
 * CollisionEvent
 *
 * Should be used as a bitfield to test multiple collisiontypes
 */
export enum CollisionEvent {
    NO_COLLISION = 0,
    BOTTOM = 1,
    SIDES = 2,
    OTHER_BLOCK = 4,
    TOP = 8,
}

/**
 * Class to represent a cube in the grid as a list of coordinates
 */
class GridCube {
    coordinates;

    /**
     * construct a new gridcube from a list of coordinates
     */
    constructor(coordinates: Array<vec3>) {
        this.coordinates = coordinates;
    }

    /**
     * Test if the cube collides with the grid sides
     *
     * @returns {boolean} true if it collides, false else
     */
    collisionSides(): boolean {
        const min = DIM.min;
        const max = DIM.max;

        return this.coordinates.every((coord) => {
            const [x, _y, z] = coord as [number, number, number];
            if (x >= max[0] || x < min[0]) return false;
            if (z >= max[2] || z < min[2]) return false;
            return true;
        });
    }

    /**
     * Test if the cube collides with the grid top
     *
     * @returns {boolean} true if it collides, false else
     */
    collisionTop(): boolean {
        return this.coordinates.every((coord) => {
            const [_x, y, _z] = coord as [number, number, number];
            if (y > DIM.max[1]) return false;
            return true;
        });
    }

    /**
     * Test if the cube collides with the grid bottom
     *
     * @returns {boolean} true if it collides, false else
     */
    collisionBottom(): boolean {
        return this.coordinates.every((coord) => {
            const [_x, y, _z] = coord as [number, number, number];
            if (y <= DIM.min[1]) return false;
            return true;
        });
    }

    /**
     * Test if the cube collides with another piece
     *
     * @param other {GridCube} the other cube to collide with
     * @returns {CollisionEvent} the collision event
     */
    collisionOtherPiece(other: GridCube): CollisionEvent {
        for (let i = 0; i < this.coordinates.length; i++) {
            const thisCoord = this.coordinates[i] as vec3;
            for (let j = 0; j < other.coordinates.length; j++) {
                const otherCoord = other.coordinates[j] as vec3;
                if (overlaps(thisCoord, otherCoord))
                    return CollisionEvent.BOTTOM | CollisionEvent.SIDES;
            }
        }
        return CollisionEvent.NO_COLLISION;
    }
}

/**
 * Helper function to determine if two coordinates are in the same cell
 *
 * @param lhs {vec3} first coordinate
 * @param rhs {vec3} second coordinate
 * @returns {boolean} true if the coordinates are in the same cell, else false
 */
function overlaps(lhs: vec3, rhs: vec3): boolean {
    const [x1, y1, z1] = lhs as [number, number, number];
    const [x2, y2, z2] = rhs as [number, number, number];

    if (y1 == y2 && z1 == z2) return Math.abs(x1 - x2) <= 0.9;
    if (x1 == x2 && z1 == z2) return Math.abs(y1 - y2) <= 0.9;
    if (x1 == x2 && y1 == y2) return Math.abs(z1 - z2) <= 0.9;
    return false;
}

/**
 * Test if a Tetracube collides with other Tetracubes or the grid
 *
 * @param piece {Tetracube} piece to check collisions for
 * @param against {Array<Tetracube>} other tetracube to check against
 * @returns {CollisionEvent} the collisions that occured
 */
export function collisionTest(
    piece: Tetracube,
    against: Array<Tetracube>,
): CollisionEvent {
    const gridcube = new GridCube(piece.getCoordinates());

    let collision = CollisionEvent.NO_COLLISION;
    if (!gridcube.collisionSides()) collision |= CollisionEvent.SIDES;
    if (!gridcube.collisionTop()) collision |= CollisionEvent.TOP;
    if (!gridcube.collisionBottom()) collision |= CollisionEvent.BOTTOM;

    if (collision & (CollisionEvent.SIDES | CollisionEvent.BOTTOM))
        return collision; // no need to test further

    for (let i = 0; i < against.length; i++) {
        const elem = against[i] as Tetracube;

        if (elem == piece) continue; // don't test against yourself
        if (glm.vec3.distance(elem.position, piece.position) > 4) continue; // Bounding sphere check (sphere if radius 2 from the midpoint)

        const other = new GridCube(elem.getCoordinates());
        const blockCollision = gridcube.collisionOtherPiece(other);
        if (blockCollision != CollisionEvent.NO_COLLISION)
            return collision | blockCollision;
    }

    return collision;
}
