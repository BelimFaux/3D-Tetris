import type { Tetracube } from '../objects/tetracube.js';

export class KeyboardHandler {
    keySet: Set<string>;
    canvas;
    piece;

    constructor(piece: Tetracube) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.piece = piece;
        this.keySet = new Set();

        this.canvas.addEventListener('keydown', (ev) => {
            this.keySet.add(ev.key);
            this.movementHandler();
        });
        this.canvas.addEventListener('keyup', (ev) => {
            this.keySet.delete(ev.key);
        });
    }

    private movementHandler() {
        if (this.keySet.has('d') || this.keySet.has('ArrowRight'))
            this.piece.translateX(1);

        if (this.keySet.has('a') || this.keySet.has('ArrowLeft'))
            this.piece.translateX(-1);

        if (this.keySet.has('w') || this.keySet.has('ArrowUp'))
            this.piece.translateZ(-1);

        if (this.keySet.has('s') || this.keySet.has('ArrowDown'))
            this.piece.translateZ(1);

        if (this.keySet.has('x')) this.piece.rotateX(90);
        if (this.keySet.has('X')) this.piece.rotateX(-90);

        if (this.keySet.has('y')) this.piece.rotateY(90);
        if (this.keySet.has('Y')) this.piece.rotateY(-90);

        if (this.keySet.has('z')) this.piece.rotateZ(90);
        if (this.keySet.has('Z')) this.piece.rotateZ(-90);
    }
}
