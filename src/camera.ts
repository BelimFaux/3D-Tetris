import * as glm from './gl-matrix/index.js';
import { AXIS } from './utils/constants.js';

export class Camera {
    projectionMatrix;
    viewMatrix;
    viewTransforms;
    perspective;
    halfWorldWidth;
    eye;

    constructor() {
        this.projectionMatrix = glm.mat4.create();
        this.viewMatrix = glm.mat4.create();
        this.eye = glm.vec3.fromValues(0.0, 12.0, 0.0);
        this.viewTransforms = glm.mat4.create();

        this.halfWorldWidth = 15.0;
        this.perspective = false;
        this.initOrthogonal();
        this.initView();
    }

    private initView() {
        const target = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let up = AXIS.Y;
        if (this.eye[0] === target[0] && this.eye[2] === target[2]) {
            glm.vec3.negate(up, AXIS.Z); // Use negative Z-axis as up when looking straight down
        }
        glm.mat4.lookAt(this.viewMatrix, this.eye, target, up);
    }

    private zoom(factor: number) {
        glm.vec3.scale(this.eye, this.eye, factor);
        this.halfWorldWidth *= factor;
        this.initView();
        if (!this.perspective) this.initOrthogonal();
    }

    zoomOut() {
        this.zoom(1.1);
    }

    zoomIn() {
        this.zoom(0.9);
    }

    initOrthogonal() {
        this.perspective = false;
        const { width, height } = (
            document.getElementById('canvas') as HTMLElement
        ).getBoundingClientRect();
        const ratio = width / height;
        glm.mat4.ortho(
            this.projectionMatrix,
            -this.halfWorldWidth,
            this.halfWorldWidth,
            -this.halfWorldWidth / ratio,
            this.halfWorldWidth / ratio,
            -50.0,
            50.0,
        );
    }

    initPerspective() {
        this.perspective = true;
        const { width, height } = (
            document.getElementById('canvas') as HTMLElement
        ).getBoundingClientRect();
        glm.mat4.perspective(
            this.projectionMatrix,
            glm.glMatrix.toRadian(80),
            width / height,
            0.1,
            100.0,
        );
    }

    getEye(): vec3 {
        return this.eye;
    }

    getView(): mat4 {
        const updatedViewMatrix = glm.mat4.create();
        glm.mat4.multiply(
            updatedViewMatrix,
            this.viewMatrix,
            this.viewTransforms,
        );
        return updatedViewMatrix;
    }

    getProjection(): mat4 {
        return this.projectionMatrix;
    }

    getTransform(): mat4 {
        return this.viewTransforms;
    }
}
