import * as glm from '../gl-matrix/index.js';

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
