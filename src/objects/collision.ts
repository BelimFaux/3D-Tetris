import * as glm from '../gl-matrix/index.js';

import { DIM } from '../utils/constants.js';
import { Tetracube } from './tetracube.js';

export enum CollisionEvent {
    NO_COLLISION = 0,
    BOTTOM,
    SIDES,
    TOP,
}

class GridCube {
    coordinates;

    private constructor(coordinates: Array<vec3>) {
        this.coordinates = coordinates;
    }

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

    collisionTop(): boolean {
        return this.coordinates.every((coord) => {
            const [_x, y, _z] = coord as [number, number, number];
            if (y > DIM.max[1]) return false;
            return true;
        });
    }

    collisionBottom(): boolean {
        return this.coordinates.every((coord) => {
            const [_x, y, _z] = coord as [number, number, number];
            if (y <= DIM.min[1]) return false;
            return true;
        });
    }

    collisionOtherPiece(other: GridCube): CollisionEvent {
        for (let i = 0; i < this.coordinates.length; i++) {
            const thisCoord = this.coordinates[i] as vec3;
            for (let j = 0; j < other.coordinates.length; j++) {
                const otherCoord = other.coordinates[j] as vec3;
                if (overlapsY(thisCoord, otherCoord))
                    return CollisionEvent.BOTTOM;
                if (
                    overlapsX(thisCoord, otherCoord) ||
                    overlapsZ(thisCoord, otherCoord)
                )
                    return CollisionEvent.SIDES;
            }
        }
        return CollisionEvent.NO_COLLISION;
    }

    static fromTetracube(from: Tetracube, transform: mat4): GridCube {
        const cubes = from.cubes;
        const coordinates: Array<vec3> = [];
        cubes.forEach((cube) => {
            const center = glm.vec3.clone(cube.displace);
            glm.vec3.transformMat4(center, center, transform);

            // undo displacement
            const [x, y, z] = DIM.size as [number, number, number];
            if (x % 2 == 0) center[0] -= 0.5;
            if (y % 2 == 0) center[1] -= 0.5;
            if (z % 2 == 0) center[2] -= 0.5;

            coordinates.push(center);
        });

        return new GridCube(coordinates);
    }
}

function overlapsX(lhs: vec3, rhs: vec3): boolean {
    const [x1, y1, z1] = lhs as [number, number, number];
    const [x2, y2, z2] = rhs as [number, number, number];

    if (y1 == y2 && z1 == z2) return Math.abs(x1 - x2) <= 1.0;
    return false;
}

function overlapsY(lhs: vec3, rhs: vec3): boolean {
    const [x1, y1, z1] = lhs as [number, number, number];
    const [x2, y2, z2] = rhs as [number, number, number];

    if (x1 == x2 && z1 == z2) return Math.abs(y1 - y2) <= 1.0;
    return false;
}

function overlapsZ(lhs: vec3, rhs: vec3): boolean {
    const [x1, y1, z1] = lhs as [number, number, number];
    const [x2, y2, z2] = rhs as [number, number, number];

    if (x1 == x2 && y1 == y2) return Math.abs(z1 - z2) <= 1.0;
    return false;
}

export function collisionTest(
    piece: Tetracube,
    transform: mat4,
    against: Array<Tetracube>,
): CollisionEvent {
    const gridcube = GridCube.fromTetracube(piece, transform);

    if (!gridcube.collisionSides()) return CollisionEvent.SIDES;
    if (!gridcube.collisionTop()) return CollisionEvent.TOP;
    if (!gridcube.collisionBottom()) return CollisionEvent.BOTTOM;

    for (let i = 0; i < against.length; i++) {
        const elem = against[i] as Tetracube;
        if (glm.vec3.distance(elem.position, piece.position) > 4) continue; // Bounding sphere check (sphere if radius 2 from the midpoint)

        const other = GridCube.fromTetracube(elem, elem.getTransform());
        const collision = gridcube.collisionOtherPiece(other);
        if (collision != CollisionEvent.NO_COLLISION) return collision;
    }

    return CollisionEvent.NO_COLLISION;
}
