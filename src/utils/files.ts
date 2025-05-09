import * as ui from './../ui.js';

const filesMap: Map<string, string> = new Map();

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
