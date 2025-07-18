import * as glm from '../gl-matrix/index.js';

/**
 * Contains the standard basis vectors
 */
export const AXIS = {
    X: glm.vec3.fromValues(1, 0, 0),
    Y: glm.vec3.fromValues(0, 1, 0),
    Z: glm.vec3.fromValues(0, 0, 1),
};

/**
 * 6x6 playing field sizes
 */
const _6x6 = {
    size: glm.vec3.fromValues(6, 10, 6),
    min: glm.vec3.fromValues(-3, -5, -3),
    max: glm.vec3.fromValues(3, 5, 3),
};

/**
 * 5x5 playing field sizes
 */
const _5x5 = {
    size: glm.vec3.fromValues(5, 10, 5),
    min: glm.vec3.fromValues(-2.5, -5, -2.5),
    max: glm.vec3.fromValues(2.5, 5, 2.5),
};

/**
 * 4x4 playing field sizes
 */
const _4x4 = {
    size: glm.vec3.fromValues(4, 10, 4),
    min: glm.vec3.fromValues(-2, -5, -2),
    max: glm.vec3.fromValues(2, 5, 2),
};

/**
 * The Dimensions of the playing field
 */
export let DIM = _4x4;

/**
 * set the dimensions of the playing field
 *
 * @param dims {string} one of '4x4', '5x5' or '6x6'
 */
export function setDimension(dims: string): void {
    switch (dims) {
        case '4x4':
            DIM = _4x4;
            break;
        case '5x5':
            DIM = _5x5;
            break;
        case '6x6':
            DIM = _6x6;
            break;
    }
}
