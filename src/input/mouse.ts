import * as glm from '../gl-matrix/index.js';

export class MouseHandler {
    canvas;
    worldMatrix;

    trackingMouse = false;

    start: vec3 = [0, 0, 0];
    lastPos: vec3 = [0, 0, 0];

    constructor(worldMatrix: mat4) {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.worldMatrix = worldMatrix;

        this.canvas.addEventListener('mousedown', (ev) => this.startMove(ev));
        this.canvas.addEventListener('mousemove', (ev) => this.whileMove(ev));
        this.canvas.addEventListener('mouseup', (ev) => this.stopMove(ev));
    }

    private startMove(ev: MouseEvent) {
        this.start = this.getPos(ev.clientX, ev.clientY);
        this.lastPos = this.start;
        this.trackingMouse = true;
    }

    private whileMove(ev: MouseEvent) {
        if (!this.trackingMouse) return;

        const curPos = this.getPos(ev.clientX, ev.clientY);
        const d = glm.vec3.create();
        glm.vec3.sub(d, curPos, this.lastPos);

        if (!glm.vec3.equals(d, [0, 0, 0])) {
            const angle = 0.5 * glm.vec3.length(d);
            const axis = glm.vec3.create();
            glm.vec3.cross(axis, this.lastPos, curPos);
            this.lastPos = curPos;

            glm.mat4.rotate(this.worldMatrix, this.worldMatrix, angle, axis);
        }
    }

    private stopMove(_: MouseEvent) {
        this.trackingMouse = false;
    }

    private getPos(x: number, y: number): vec3 {
        let curX = (2 * x) / this.canvas.width - 1;
        let curY = (2 * (this.canvas.height - y)) / this.canvas.height - 1;
        let curZ = 0;

        const d = curX * curX + curY * curY;
        if (d < 1.0) curZ = Math.sqrt(1.0 - d);
        else {
            const a = 1.0 / Math.sqrt(d);
            curX *= a;
            curY *= a;
        }
        return glm.vec3.fromValues(curX, curY, curZ);
    }
}
