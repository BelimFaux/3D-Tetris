import * as glm from './gl-matrix/index.js';

import * as util from './util.js';
import * as ui from './ui.js';
import { getCube } from './objects/cube.js';
import { getFile, loadFile } from './files.js';
import { Shader } from './shader.js';
import { getGrid } from './objects/grid.js';
import { MouseHandler } from './input/mouse.js';

async function setup(): Promise<WebGL2RenderingContext | null> {
    await loadFile('shaders/default.frag');
    await loadFile('shaders/default.vert');

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
    const projectionMatrix = glm.mat4.create();
    const globalTransformationMatrix = glm.mat4.create();
    const updatedViewMatrix = glm.mat4.create();
    const viewMatrix = glm.mat4.create();

    const eye = glm.vec3.fromValues(7.0, 10.0, 7.0);
    const target = glm.vec3.fromValues(0.0, 0.0, 0.0);
    glm.mat4.lookAt(viewMatrix, eye, target, util.AXIS.Y);

    const { width, height } = (
        document.getElementById('canvas') as HTMLElement
    ).getBoundingClientRect();
    const ratio = width / height;
    const halfWorldWidth = 15.0;
    glm.mat4.ortho(
        projectionMatrix,
        -halfWorldWidth,
        halfWorldWidth,
        -halfWorldWidth / ratio,
        halfWorldWidth / ratio,
        -50.0,
        50.0,
    );

    new MouseHandler(globalTransformationMatrix);

    const shader = new Shader(gl)
        .addShader(getFile('shaders/default.vert'), gl.VERTEX_SHADER)
        .addShader(getFile('shaders/default.frag'), gl.FRAGMENT_SHADER)
        .link();

    const cube = getCube();
    cube.initVao(gl, shader);

    const grid = getGrid();
    grid.initVao(gl, shader);

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

        glm.mat4.multiply(
            updatedViewMatrix,
            viewMatrix,
            globalTransformationMatrix,
        );

        shader.projViewMatrix(gl, projectionMatrix, updatedViewMatrix);

        cube.draw(gl, shader);
        grid.draw(gl, shader);
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
