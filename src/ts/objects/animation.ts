import type { Shader } from '../shader.js';
import type { Tetracube } from './tetracube.js';

/**
 * Class to perform a blink effect on a list of pieces for a given duration
 */
export class BlinkingEffect {
    pieces;
    duration;
    deltaTime;

    /**
     * construct a new blink effect for the given pieces for the given duration
     *
     * @param pieces {Array<Tetracube>} the pieces that should have this effect
     * @param [duration=1000] {number} the duration in ms for which the animation plays
     */
    constructor(pieces: Array<Tetracube>, duration: number = 1000) {
        this.pieces = pieces;
        this.duration = duration;
        this.deltaTime = 0;
    }

    /**
     * Add pieces to the effect
     *
     * @param newPieces {Array<Tetracube>} the new pieces
     */
    addPieces(newPieces: Array<Tetracube>): void {
        this.pieces.push(...newPieces);
    }

    /**
     * Determine if the animation is finished
     *
     * @returns {boolean} true if the animation finished, else false
     */
    isFinished(): boolean {
        return this.duration <= 0;
    }

    /**
     * Advance the animation by one tick
     *
     * @param deltaTime {number} the time passed since last tick
     */
    tick(deltaTime: number): void {
        this.duration -= deltaTime;
        this.deltaTime = deltaTime;
    }

    /**
     * Draw the effect
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     * @param shader {Shader} the shader
     * @param viewMatrix {mat4} the view matrix of the world
     * @param cylinders {boolean} if the cubes should be drawn as cylinders
     */
    draw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        cylinders: boolean,
    ): void {
        gl.uniform1f(
            shader.locUMixWhite,
            0.5 * Math.sin(this.duration / 100) + 0.5,
        );
        if (cylinders) {
            this.pieces.forEach((piece) => {
                piece.drawCylinders(gl, shader, viewMatrix);
            });
        } else {
            this.pieces.forEach((piece) => {
                piece.drawCubes(gl, shader, viewMatrix);
            });
        }
        gl.uniform1f(shader.locUMixWhite, 0);
    }
}
