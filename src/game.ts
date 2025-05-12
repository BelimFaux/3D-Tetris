import { RANDOM } from './gl-matrix/common.js';
import * as glm from './gl-matrix/index.js';

import { KeyboardHandler } from './input/keyboard.js';
import { MouseHandler } from './input/mouse.js';
import { Grid } from './objects/grid.js';
import { Tetracube, TETRACUBE_TYPE } from './objects/tetracube.js';
import { Shader } from './shader.js';
import { AXIS, DIM } from './utils/constants.js';
import { getFile } from './utils/files.js';

interface GameOptions {
    gravity: boolean;
}

function defaultOptions(): GameOptions {
    return {
        gravity: false,
    };
}

export class Game {
    gl;
    options;

    projectionMatrix;
    globalTransformationMatrix;
    viewMatrix;

    shader;

    activePiece: Tetracube;
    pieces: Array<Tetracube> = [];
    grid;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.options = defaultOptions();
        this.projectionMatrix = glm.mat4.create();
        this.globalTransformationMatrix = glm.mat4.create();
        this.viewMatrix = glm.mat4.create();

        this.initOrthogonal();
        this.initView();

        this.shader = new Shader(gl)
            .addShader(getFile('shaders/default.vert'), gl.VERTEX_SHADER)
            .addShader(getFile('shaders/default.frag'), gl.FRAGMENT_SHADER)
            .link();

        this.grid = new Grid();
        this.grid.initVao(gl, this.shader);
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            TETRACUBE_TYPE.IPIECE,
        ); // initialise just to shut up linter
        this.spawnNewPiece();

        new MouseHandler(this.globalTransformationMatrix);
        new KeyboardHandler(this);
    }

    private initView() {
        const eye = glm.vec3.fromValues(7.0, 5.0, 7.0);
        const target = glm.vec3.fromValues(0.0, 0.0, 0.0);
        let up = AXIS.Y;
        if (eye[0] === target[0] && eye[2] === target[2]) {
            up = AXIS.Z; // Use Z-axis as up when looking straight down
        }
        glm.mat4.lookAt(this.viewMatrix, eye, target, up);
    }

    private initOrthogonal() {
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

    private spawnNewPiece() {
        const type: TETRACUBE_TYPE = Math.floor(RANDOM() * 7 + 1);
        this.activePiece = new Tetracube([0, DIM.max[1], 0], type);
        this.activePiece.initVaos(this.gl, this.shader);
    }

    getActive(): Tetracube {
        return this.activePiece;
    }

    tick(deltaTime: number) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const updatedViewMatrix = glm.mat4.create();
        glm.mat4.multiply(
            updatedViewMatrix,
            this.viewMatrix,
            this.globalTransformationMatrix,
        );

        this.shader.projMatrix(this.gl, this.projectionMatrix);

        if (this.options.gravity) {
            if (this.activePiece.position[1] >= DIM.min[1] + 0.5)
                this.activePiece.translateY(-deltaTime * 0.003);
            else {
                this.pieces.push(this.activePiece);
                this.spawnNewPiece();
            }
        }

        this.activePiece.draw(this.gl, this.shader, updatedViewMatrix);
        this.grid.draw(
            this.gl,
            this.shader,
            updatedViewMatrix,
            this.globalTransformationMatrix,
            [7, 5, 7],
        );

        this.pieces.forEach((piece) => {
            piece.draw(this.gl, this.shader, updatedViewMatrix);
        });
    }
}
