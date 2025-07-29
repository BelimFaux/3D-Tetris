import * as glm from 'gl-matrix';

import type { mat4 } from 'gl-matrix';
import type { Game } from '../game.js';
import type { Shader } from '../shader.js';

const vertices = new Float32Array(
    [
        // X-Axis
        [0, 0, 0],
        [1, 0, 0],
        // Y-Axis
        [0, 0, 0],
        [0, 1, 0],
        // Z-Axis
        [0, 0, 0],
        [0, 0, 1],
    ].flat(),
);

const colors = new Float32Array(
    [
        // X-Axis: red
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        // Y-Axis: blue
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        // Z-Axis: green
        [0, 1, 0, 1],
        [0, 1, 0, 1],
    ].flat(),
);

const indices = new Uint16Array([0, 1, 2, 3, 4, 5]);

/**
 * Class to manage an overlay, that shows the Axis of the current shape if present
 */
export class AxisOverlay {
    vaoIndex: WebGLVertexArrayObject = -1;
    game: Game;

    /**
     * Initialize axis overlay with or without a current shape
     *
     * @param game {Game} the game for the overlay
     */
    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Initializes a Vertex Array Object for the overlay and creates and binds the necessary buffers to draw the object with the provided shader.
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader object with which the overlay should be drawn
     */
    initVAO(gl: WebGL2RenderingContext, shader: Shader): void {
        this.vaoIndex = gl.createVertexArray();
        gl.bindVertexArray(this.vaoIndex);

        shader.bind();

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(shader.locACoord);
        gl.vertexAttribPointer(shader.locACoord, 3, gl.FLOAT, false, 0, 0);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(shader.locAColor);
        gl.vertexAttribPointer(shader.locAColor, 4, gl.FLOAT, false, 0, 0);
    }

    /**
     * Draw the overlay on top of the selected shape with the given shader
     * If no shape is selected, nothing is rendered
     *
     * @param gl {WebGL2RenderingContext} The webgl context
     * @param shader {Shader} The shader object with which the overlay should be drawn
     * @param viewMatrix {mat4} the view matrix of the world
     * @param [scaleFactor=1.5] {number} the factor by which to scale the axis
     */
    draw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        scaleFactor: number = 1.5,
    ): void {
        // the axis 'steals' the model matrix of the active so it appears at the same position/rotation/scale
        const modelMatrix = glm.mat4.clone(this.game.activePiece.translation);
        glm.mat4.scale(modelMatrix, modelMatrix, [
            scaleFactor,
            scaleFactor,
            scaleFactor,
        ]);
        const modelView = glm.mat4.create();
        glm.mat4.multiply(modelView, modelView, viewMatrix);
        glm.mat4.multiply(modelView, modelView, modelMatrix);

        shader.bind();
        gl.uniformMatrix4fv(shader.locUTransform, false, modelView);

        // turn off depth test to draw on top of the shape
        gl.disable(gl.DEPTH_TEST);
        gl.bindVertexArray(this.vaoIndex);
        gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
        gl.enable(gl.DEPTH_TEST);
    }
}
