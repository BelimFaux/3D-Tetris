import * as glm from './gl-matrix/index.js';
import { AXIS } from './utils/constants.js';

export class Camera {
    projectionMatrix;
    viewMatrix;
    eye;

    constructor() {
        this.projectionMatrix = glm.mat4.create();
        this.viewMatrix = glm.mat4.create();
        this.eye = glm.vec3.fromValues(7.0, 5.0, 7.0);

        this.initOrthogonal();
        this.initView();
    }

    private initView() {
        const target = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let up = AXIS.Y;
        if (this.eye[0] === target[0] && this.eye[2] === target[2]) {
            up = AXIS.Z; // Use Z-axis as up when looking straight down
        }
        glm.mat4.lookAt(this.viewMatrix, this.eye, target, up);
    }

    initOrthogonal() {
        const { width, height } = (
            document.getElementById('canvas') as HTMLElement
        ).getBoundingClientRect();
        const ratio = width / height;
        const halfWorldWidth = 15.0;
        glm.mat4.ortho(
            this.projectionMatrix,
            -halfWorldWidth,
            halfWorldWidth,
            -halfWorldWidth / ratio,
            halfWorldWidth / ratio,
            -50.0,
            50.0,
        );
    }

    initPerspective() {
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
        return this.viewMatrix;
    }

    getProjection(): mat4 {
        return this.projectionMatrix;
    }
}
