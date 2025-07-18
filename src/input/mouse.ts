import type { Camera } from '../camera.js';
import * as glm from '../gl-matrix/index.js';

/**
 * Class that handles mouse events
 */
export class MouseHandler {
    canvas;
    viewTransform;
    camera;

    trackingMouse = false;

    lastX: number = 0;
    sensi: number = 10;

    scrollX: number = 0;
    scrollY: number = 0;

    /**
     * initialize the mouse handler for a given camera
     * the object does not have to be kept, but will instead be active until new mouse event listeners are registered for the canvas
     *
     * @param camera {Camera} the camera for the mouse handler
     */
    constructor(camera: Camera) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.viewTransform = camera.getTransform();
        this.camera = camera;

        this.canvas.addEventListener('mousedown', (ev) => this.startMove(ev));
        this.canvas.addEventListener('mousemove', (ev) => this.whileMove(ev));
        this.canvas.addEventListener('mouseup', (ev) => this.stopMove(ev));
        window.addEventListener('wheel', (ev) => this.scroll(ev));
    }

    /**
     * handle scroll events
     */
    private scroll(ev: WheelEvent): void {
        if (ev.deltaY > 0) this.camera.zoomOut();
        else this.camera.zoomIn();
    }

    /**
     * start tracking the mouse movement
     *
     * @param ev {MouseEvent} the corresponding mouse event
     */
    private startMove(ev: MouseEvent): void {
        this.lastX = this.getXPos(ev);
        this.trackingMouse = true;
    }

    /**
     * handler for mouse movement while tracking
     *
     * @param ev {MouseEvent} the mouse event
     */
    private whileMove(ev: MouseEvent): void {
        if (!this.trackingMouse) return;
        const cur = this.getXPos(ev);
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

    /**
     * stop tracking mouse movement
     *
     * @param _ {MouseEvent} unused
     */
    private stopMove(_: MouseEvent) {
        this.trackingMouse = false;
    }

    /**
     * Calculate the x position of the mouse on the canvas
     *
     * @param ev {MouseEvent} the mouse event
     * @returns {number} the x position of the mouse on the canvas
     */
    private getXPos(ev: MouseEvent): number {
        return ev.clientX / this.canvas.width;
    }
}
