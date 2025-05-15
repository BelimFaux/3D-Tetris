import type { Game } from '../game.js';

export class KeyboardHandler {
    keySet: Set<string>;
    game;
    canvas;

    constructor(game: Game) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.game = game;
        this.keySet = new Set();

        this.canvas.addEventListener('keydown', (ev) => {
            this.keySet.add(ev.key);
            this.movementHandler();
            this.viewHandler();
        });
        this.canvas.addEventListener('keyup', (ev) => {
            this.keySet.delete(ev.key);
        });
    }

    private movementHandler() {
        if (this.keySet.has('d') || this.keySet.has('ArrowRight'))
            this.game.getActive().translateX(1);

        if (this.keySet.has('a') || this.keySet.has('ArrowLeft'))
            this.game.getActive().translateX(-1);

        if (this.keySet.has('w') || this.keySet.has('ArrowUp'))
            this.game.getActive().translateZ(-1);

        if (this.keySet.has('s') || this.keySet.has('ArrowDown'))
            this.game.getActive().translateZ(1);

        if (this.keySet.has('x')) this.game.getActive().rotateX(90);
        if (this.keySet.has('X')) this.game.getActive().rotateX(-90);

        if (this.keySet.has('y')) this.game.getActive().rotateY(90);
        if (this.keySet.has('Y')) this.game.getActive().rotateY(-90);

        if (this.keySet.has('z')) this.game.getActive().rotateZ(90);
        if (this.keySet.has('Z')) this.game.getActive().rotateZ(-90);

        if (this.keySet.has('p')) this.game.toggleGravity();

        if (this.keySet.has(' ')) this.game.dropActive();
    }

    private viewHandler() {
        if (this.keySet.has('g')) this.game.toggleGrid();
    }
}
