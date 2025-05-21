import type { Shader } from '../shader.js';
import type { Tetracube } from './tetracube.js';

export class BlinkingEffect {
    pieces;
    duration;
    deltaTime;

    constructor(pieces: Array<Tetracube>, duration: number = 1000) {
        this.pieces = pieces;
        this.duration = duration;
        this.deltaTime = 0;
    }

    addPieces(newPieces: Array<Tetracube>) {
        this.pieces.push(...newPieces);
    }

    isFinished(): boolean {
        return this.duration <= 0;
    }

    tick(deltaTime: number) {
        this.duration -= deltaTime;
        this.deltaTime = deltaTime;
    }

    draw(
        gl: WebGL2RenderingContext,
        shader: Shader,
        viewMatrix: mat4,
        cylinders: boolean,
    ) {
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
