import * as glm from '../gl-matrix/index.js';

/**
 * Contains the standard basis vectors
 */
export const AXIS = {
    X: glm.vec3.fromValues(1, 0, 0),
    Y: glm.vec3.fromValues(0, 1, 0),
    Z: glm.vec3.fromValues(0, 0, 1),
};

export const DIM = {
    size: glm.vec3.fromValues(4, 10, 4),
    min: glm.vec3.fromValues(-2, -5, -2),
    max: glm.vec3.fromValues(2, 5, 2),
};
