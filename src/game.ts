import { Camera } from './camera.js';
import * as glm from './gl-matrix/index.js';

import { KeyboardHandler } from './input/keyboard.js';
import { MouseHandler } from './input/mouse.js';
import { Grid } from './objects/grid.js';
import { Tetracube, TETRACUBE_TYPE } from './objects/tetracube.js';
import { Shader } from './shader.js';
import { DIM } from './utils/constants.js';
import { getFile } from './utils/files.js';

interface GameOptions {
    gravity: boolean;
    showGrid: boolean;
}

function defaultOptions(): GameOptions {
    return {
        gravity: false,
        showGrid: false,
    };
}

export class Game {
    gl;
    options;
    camera;
    globalTransformationMatrix;

    shader;

    activePiece: Tetracube;
    pieces: Array<Tetracube> = [];
    grid;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.options = defaultOptions();
        this.camera = new Camera();
        this.globalTransformationMatrix = glm.mat4.create();

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

    private spawnNewPiece() {
        const type: TETRACUBE_TYPE = Math.floor(Math.random() * 7 + 1);
        this.activePiece = new Tetracube([0, DIM.max[1], 0], type);
        this.activePiece.initVaos(this.gl, this.shader);
    }

    getActive(): Tetracube {
        return this.activePiece;
    }

    toggleGravity() {
        this.options.gravity = !this.options.gravity;
    }

    toggleGrid() {
        this.options.showGrid = !this.options.showGrid;
    }

    tick(deltaTime: number) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const updatedViewMatrix = glm.mat4.create();
        glm.mat4.multiply(
            updatedViewMatrix,
            this.camera.getView(),
            this.globalTransformationMatrix,
        );

        this.shader.projMatrix(this.gl, this.camera.getProjection());

        if (this.options.gravity) {
            if (this.activePiece.position[1] >= DIM.min[1] + 0.5)
                this.activePiece.translateY(-deltaTime * 0.003);
            else {
                this.pieces.push(this.activePiece);
                this.spawnNewPiece();
            }
        }

        this.activePiece.draw(this.gl, this.shader, updatedViewMatrix);

        if (this.options.showGrid) {
            this.grid.draw(this.gl, this.shader, updatedViewMatrix);
        } else {
            this.grid.maybeDraw(
                this.gl,
                this.shader,
                updatedViewMatrix,
                this.globalTransformationMatrix,
                this.camera.getEye(),
            );
        }

        this.pieces.forEach((piece) => {
            piece.draw(this.gl, this.shader, updatedViewMatrix);
        });
    }
}
