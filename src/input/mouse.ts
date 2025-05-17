import * as glm from '../gl-matrix/index.js';

export class MouseHandler {
    canvas;
    worldMatrix;

    trackingMouse = false;

    lastX: number = 0;
    sensi: number = 10;

    constructor(worldMatrix: mat4) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.worldMatrix = worldMatrix;

        this.canvas.addEventListener('mousedown', (ev) => this.startMove(ev));
        this.canvas.addEventListener('mousemove', (ev) => this.whileMove(ev));
        this.canvas.addEventListener('mouseup', (ev) => this.stopMove(ev));
    }

    private startMove(ev: MouseEvent) {
        this.lastX = this.getYPos(ev);
        this.trackingMouse = true;
    }

    private whileMove(ev: MouseEvent) {
        if (!this.trackingMouse) return;
        const cur = this.getYPos(ev);
        const d = cur - this.lastX;

        if (Math.abs(d) > 0.001) {
            this.lastX = cur;

            glm.mat4.rotateY(
                this.worldMatrix,
                this.worldMatrix,
                this.sensi * d,
            );
        }
    }

    private stopMove(_: MouseEvent) {
        this.trackingMouse = false;
    }

    private getYPos(ev: MouseEvent) {
        return ev.clientX / this.canvas.width;
    }
}
