import type { Camera } from '../camera.js';
import * as glm from '../gl-matrix/index.js';

export class MouseHandler {
    canvas;
    viewTransform;
    camera;

    trackingMouse = false;

    lastX: number = 0;
    sensi: number = 10;

    scrollX: number = 0;
    scrollY: number = 0;

    constructor(camera: Camera) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.viewTransform = camera.getTransform();
        this.camera = camera;

        this.canvas.addEventListener('mousedown', (ev) => this.startMove(ev));
        this.canvas.addEventListener('mousemove', (ev) => this.whileMove(ev));
        this.canvas.addEventListener('mouseup', (ev) => this.stopMove(ev));
        window.addEventListener('wheel', (ev) => this.scroll(ev));
    }

    private scroll(ev: WheelEvent) {
        if (ev.deltaY > 0) this.camera.zoomOut();
        else this.camera.zoomIn();
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
                this.viewTransform,
                this.viewTransform,
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
