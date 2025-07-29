import * as ui from './../ui.js';
import { createTexture } from './webgl.js';

const textureMap: Map<string, WebGLTexture> = new Map();

const imageMap: Map<string, HTMLImageElement> = new Map();
const imagePromises: Array<Promise<void>> = [];

/**
 * preload an image from the path
 *
 * @param {string} path - the path of the image
 */
export function addImage(path: string): void {
    imagePromises.push(
        new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.src = path;
            imageMap.set(path, img);
        }),
    );
}

/**
 * load all textures into the given webgl context
 *
 * @param gl {WebGL2RenderingContext} the webgl context
 */
export async function loadAllTextures(
    gl: WebGL2RenderingContext,
): Promise<void> {
    await Promise.all(imagePromises);
    imageMap.forEach((img, path) => {
        const texture = createTexture(gl, img);
        textureMap.set(path, texture);
    });
}

/**
 * Return a preloaded texture
 * will report any errors directly to the ui
 *
 * @param path {string} the path of the image for the texture
 * @returns {WebGLTexture} the texture or -1 on failure
 */
export function getTexture(path: string): WebGLTexture {
    const ret = textureMap.get(path);
    if (!ret) {
        ui.reportError(`texture ${path} was not found in loaded textures.`);
    }
    return ret || -1;
}
