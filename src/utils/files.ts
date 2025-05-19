import * as ui from './../ui.js';

const filesMap: Map<string, string> = new Map();
const textureMap: Map<string, WebGLTexture> = new Map();

const imageMap: Map<string, HTMLImageElement> = new Map();
const imagePromises: Array<Promise<void>> = [];

/**
 * reads in a file from a path
 *
 * @param {string} path - the path of the file
 * @returns {Promise<string>} the contents of the file
 */
async function getFileContents(path: string): Promise<string> {
    return await fetch(path).then((response) => response.text());
}

/**
 * preload a file from the path
 *
 * @param {string} path - the path of the file
 */
export async function loadFile(path: string): Promise<void> {
    filesMap.set(path, await getFileContents(path));
}

/**
 * return a already loaded file from the path
 *
 * @param {string} path - the path of the file
 * @returns {string | null} the contents of the file if they are loaded
 */
export function getFile(path: string): string {
    const ret = filesMap.get(path);
    if (!ret) {
        ui.reportError(
            `file ${path} was not found in loaded files. Returning empty string`,
        );
    }
    return ret || '';
}

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

export async function loadAllTextures(
    gl: WebGL2RenderingContext,
): Promise<void> {
    await Promise.all(imagePromises);
    imageMap.forEach((img, path) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img,
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        textureMap.set(path, texture);
    });
}

export function getTexture(path: string): WebGLTexture {
    const ret = textureMap.get(path);
    if (!ret) {
        ui.reportError(`texture ${path} was not found in loaded textures.`);
    }
    return ret || -1;
}
