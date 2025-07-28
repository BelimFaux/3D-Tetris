import * as glm from 'gl-matrix';
import { AXIS } from './utils/globals.js';

/**
 * Class to represent a Camera and handle view-related tasks
 */
export class Camera {
    projectionMatrix;
    viewMatrix;
    viewTransforms;
    perspective;
    halfWorldWidth;
    eye;

    /**
     * Construct a new camera
     * The eye will be on [7,5,7] by default and the view will be orthogonal
     */
    constructor() {
        this.projectionMatrix = glm.mat4.create();
        this.viewMatrix = glm.mat4.create();
        this.eye = glm.vec3.fromValues(7.0, 5.0, 7.0);
        this.viewTransforms = glm.mat4.create();

        this.halfWorldWidth = 15.0;
        this.perspective = false;
        this.initOrthogonal();
        this.initView();
    }

    /**
     * initialize the view matrix by looking at [0,0,0] from the eye
     * The Up vector will be the Y-Axis, or the negative Z-Axis if the view direction is exactly along the Y axis
     */
    private initView(): void {
        const target = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let up = AXIS.Y;
        if (this.eye[0] === target[0] && this.eye[2] === target[2]) {
            glm.vec3.negate(up, AXIS.Z); // Use negative Z-axis as up when looking straight down
        }
        glm.mat4.lookAt(this.viewMatrix, this.eye, target, up);
    }

    /**
     * Helper to zoom in by a given omount
     *
     * @param factor {number} the amount to zoom by
     */
    private zoom(factor: number): void {
        glm.vec3.scale(this.eye, this.eye, factor);
        this.halfWorldWidth *= factor;
        this.initView();
        if (!this.perspective) this.initOrthogonal();
    }

    /**
     * Zoom out by 10%
     */
    zoomOut(): void {
        this.zoom(1.1);
    }

    /**
     * Zoom in by 10%
     */
    zoomIn(): void {
        this.zoom(0.9);
    }

    /**
     * Initialize the view matrix as orthogonal
     */
    initOrthogonal(): void {
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

    /**
     * Initialize the view matrix as perspective
     */
    initPerspective(): void {
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

    /**
     * Return the current eye point
     */
    getEye(): vec3 {
        return this.eye;
    }

    /**
     * Return the current view matrix
     */
    getView(): mat4 {
        const updatedViewMatrix = glm.mat4.create();
        glm.mat4.multiply(
            updatedViewMatrix,
            this.viewMatrix,
            this.viewTransforms,
        );
        return updatedViewMatrix;
    }

    /**
     * Return the current projection matrix
     */
    getProjection(): mat4 {
        return this.projectionMatrix;
    }

    /**
     * Return the current view transformation matrix
     */
    getTransform(): mat4 {
        return this.viewTransforms;
    }
}
