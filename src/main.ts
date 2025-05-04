import * as util from './util.js';
import * as ui from './ui.js';

async function setup(): Promise<WebGL2RenderingContext | null> {
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

    // configure viewport
    util.resizeCanvas(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // set bg color to #0e364f
    gl.clearColor(0.05, 0.21, 0.31, 1.0);

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    return gl;
}

async function main(gl: WebGL2RenderingContext): Promise<void> {
    let lastTime = 0;
    let lastUpdate = 0;
    const draw = (time: number): void => {
        const deltaTime = time - lastTime;
        lastTime = time;
        if (time - lastUpdate >= 100) {
            ui.updateTime(deltaTime);
            lastUpdate = time;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        window.requestAnimationFrame(draw);
    };
    window.requestAnimationFrame(draw);

    gl.clear(gl.COLOR_BUFFER_BIT);
}

// handle all errors that get thrown
try {
    const gl = await setup();
    if (gl) await main(gl);
} catch (error: unknown) {
    ui.reportError(`Unhandled Exception: ${error}`);
}
