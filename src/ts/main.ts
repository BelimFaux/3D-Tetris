import * as ui from './ui.js';
import { addImage, loadAllTextures, loadFile } from './utils/files.js';
import { resizeCanvas } from './utils/webgl.js';
import { Game } from './game.js';
import { loadShaders } from './shader.js';
import { parseObjData } from './objects/cube.js';

/**
 * Preloads all assets and initializes the rendering context
 *
 * @returns {Promise<WebGL2RenderingContext | null>} the rendering context or null if any error occured (no canvas or webgl not supported)
 */
async function setup(): Promise<WebGL2RenderingContext | null> {
    await loadFile('shaders/gouraud.frag');
    await loadFile('shaders/gouraud.vert');
    await loadFile('shaders/phong.frag');
    await loadFile('shaders/phong.vert');

    await loadFile('ressources/models/cube.obj');
    await loadFile('ressources/models/cylinder.obj');
    parseObjData();

    addImage('ressources/textures/crateTexture.webp');
    addImage('ressources/textures/barrelTexture.webp');

    // get the canvas object and handle null
    const canvas = document.getElementById(
        'canvas',
    ) as HTMLCanvasElement | null;
    if (!canvas) {
        ui.reportError('No Element with id #canvas could be found.');
        return null;
    }

    // get the webgl context and handle null
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        ui.reportError('WebGL is not supported.');
        return null;
    }

    loadShaders(gl);
    await loadAllTextures(gl);

    // configure viewport
    resizeCanvas(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set bg color to #1e1e2e
    gl.clearColor(0.118, 0.118, 0.18, 1.0);

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    return gl;
}

/**
 * Creates a new game and starts the game loop
 *
 * @param gl {WebGL2RenderingContext} - the webgl context
 */
function main(gl: WebGL2RenderingContext): void {
    ui.openStartPopUp();

    const game = new Game(gl);
    ui.registerGame(game);

    let lastTime = 0;
    let lastUpdate = 0;

    const draw = (time: number): void => {
        const deltaTime = time - lastTime;
        lastTime = time;
        if (time - lastUpdate >= 100) {
            ui.updateTime(deltaTime);
            lastUpdate = time;
        }

        game.tick(deltaTime);

        window.requestAnimationFrame(draw);
    };
    window.requestAnimationFrame(draw);
}

// handle all errors that get thrown
try {
    const gl = await setup();
    if (gl) main(gl);
} catch (error: unknown) {
    ui.reportError(`Unhandled Exception: ${error}`);
}
