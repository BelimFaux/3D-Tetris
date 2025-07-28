import * as glm from 'gl-matrix';

/**
 * Resizes the canvas to match the actual amount of pixels
 *
 * @param {HTMLCanvasElement} canvas - the html element of the canvas
 */
export function resizeCanvas(canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    const desiredWidth = Math.round(width * dpr);
    const desiredHeight = Math.round(height * dpr);

    if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
    }
}

/**
 * creates a webgl texture for the given context from an image
 *
 * @param gl {WebGL2RenderingContext} the webgl context
 * @param img {HTMLImageElement} the image for the texture
 * @returns {WebGLTexture} the created texture
 */
export function createTexture(
    gl: WebGL2RenderingContext,
    img: HTMLImageElement,
): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    if (isPowerOfTwo(img.width) && isPowerOfTwo(img.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
}

/**
 * Helper to determine if a value is a power of two
 */
function isPowerOfTwo(value: number) {
    return (value & (value - 1)) === 0;
}
