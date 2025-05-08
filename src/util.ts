import * as glm from './gl-matrix/index.js';

/**
 * Contains the standard basis vectors
 */
export const AXIS = {
    X: glm.vec3.fromValues(1, 0, 0),
    Y: glm.vec3.fromValues(0, 1, 0),
    Z: glm.vec3.fromValues(0, 0, 1),
};

export const DIM = {
    size: glm.vec3.fromValues(6, 12, 6),
    min: glm.vec3.fromValues(-3, -6, -3),
    max: glm.vec3.fromValues(3, 6, 3),
};

/**
 * Resizes the canvas to match the actual amount of pixels
 *
 * @param {HTMLCanvasElement} canvas - the html element of the canvas
 */
export function resizeCanvas(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    const desiredWidth = glm.glMatrix.round(width * dpr);
    const desiredHeight = glm.glMatrix.round(height * dpr);

    if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
    }
}
