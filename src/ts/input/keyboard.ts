import * as glm from 'gl-matrix';

import type { Game } from '../game.js';

/**
 * Class that handles keyboard presses
 */
export class KeyboardHandler {
    keySet: Set<string>;
    game;
    canvas;

    /**
     * initialize the keyboard handler for a given game
     * the object does not have to be kept, but will instead be active until new keydown/keyup event listeners are registered for the canvas
     *
     * @param game {Game} the game for the keyboard handler
     */
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

    /**
     * handle movement related key events
     */
    private movementHandler(): void {
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

        if (this.keySet.has('b')) this.game.toggleCylinders();

        if (this.keySet.has('#')) this.game.toggleAxis();

        if (this.keySet.has('m')) this.game.toggleMusic();

        if (this.keySet.has('.') && this.keySet.has(',')) this.game.cheatCode();
    }

    /**
     * handle view related key events
     */
    private viewHandler() {
        const viewTransform = this.game.camera.getTransform();
        const rad = glm.glMatrix.toRadian(5);

        // right-handed CS => neg. angle is clockwise rot.
        if (this.keySet.has('j'))
            glm.mat4.rotateY(viewTransform, viewTransform, -rad);
        if (this.keySet.has('l'))
            glm.mat4.rotateY(viewTransform, viewTransform, rad);

        if (this.keySet.has('i'))
            glm.mat4.rotateX(viewTransform, viewTransform, -rad);
        if (this.keySet.has('k'))
            glm.mat4.rotateX(viewTransform, viewTransform, rad);

        if (this.keySet.has('u'))
            glm.mat4.rotateZ(viewTransform, viewTransform, -rad);
        if (this.keySet.has('o'))
            glm.mat4.rotateZ(viewTransform, viewTransform, rad);

        if (this.keySet.has('v')) this.game.togglePerspective();

        if (this.keySet.has('+')) this.game.camera.zoomIn();
        if (this.keySet.has('-')) this.game.camera.zoomOut();

        if (this.keySet.has('g')) this.game.toggleGrid();

        if (this.keySet.has('f')) this.game.toggleShader();
    }
}
