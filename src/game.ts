import { Camera } from './camera.js';
import * as ui from './ui.js';

import { KeyboardHandler } from './input/keyboard.js';
import { MouseHandler } from './input/mouse.js';
import { CollisionEvent } from './objects/collision.js';
import { Grid } from './objects/grid.js';
import { Tetracube, TetracubeType } from './objects/tetracube.js';
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

function debugPieces(parent: Game): Array<Tetracube> {
    return [
        new Tetracube([-2, DIM.min[1], 2], TetracubeType.TPIECE, parent),
        new Tetracube([-2, DIM.min[1], 1], TetracubeType.TPIECE, parent),
        new Tetracube([-2, DIM.min[1], 0], TetracubeType.TPIECE, parent),
        new Tetracube([-2, DIM.min[1], -1], TetracubeType.TPIECE, parent),
        new Tetracube([-2, DIM.min[1], -2], TetracubeType.TPIECE, parent),
        new Tetracube([-2, DIM.min[1], -3], TetracubeType.TPIECE, parent),
        new Tetracube([1, DIM.min[1], 2], TetracubeType.TPIECE, parent),
        new Tetracube([1, DIM.min[1], 1], TetracubeType.TPIECE, parent),
        new Tetracube([1, DIM.min[1], -1], TetracubeType.TPIECE, parent),
        new Tetracube([1, DIM.min[1], -2], TetracubeType.TPIECE, parent),
        new Tetracube([1, DIM.min[1], -3], TetracubeType.TPIECE, parent),
    ];
}

export class Game {
    gl;
    options;
    camera;

    shader;

    activePiece: Tetracube;
    pieces: Array<Tetracube> = [];
    movePiecesBy;
    grid;
    score;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.options = defaultOptions();
        this.camera = new Camera();

        this.shader = new Shader(gl)
            .addShader(getFile('shaders/default.vert'), gl.VERTEX_SHADER)
            .addShader(getFile('shaders/default.frag'), gl.FRAGMENT_SHADER)
            .link();

        this.pieces = debugPieces(this);
        this.pieces.forEach((piece) => piece.initVaos(gl, this.shader));
        this.grid = new Grid();
        this.grid.initVao(gl, this.shader);
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            TetracubeType.IPIECE,
            this,
        ); // initialise just to shut up linter
        this.spawnNewPiece();

        this.movePiecesBy = 0;
        this.score = 0;
        ui.updateScore(this.score);

        new MouseHandler(this.camera.getTransform());
        new KeyboardHandler(this);
    }

    private spawnNewPiece() {
        const type: TetracubeType = Math.floor(Math.random() * 7 + 1);
        this.activePiece = new Tetracube([0, DIM.max[1], 0], type, this);
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

    adjustScore(killed: number) {
        if (killed == 0) return;
        // Original BPS scoring system:
        // see https://tetris.wiki/Scoring
        switch (killed) {
            case 1:
                this.score += 40;
                break;
            case 2:
                this.score += 100;
                break;
            case 3:
                this.score += 300;
                break;
            default:
                this.score += 1200;
        }
        ui.updateScore(this.score);
    }

    gameOver() {
        this.pieces = [];
        this.spawnNewPiece();
    }

    handleLandedPiece() {
        if (this.activePiece.testCollisions() == CollisionEvent.TOP) {
            this.gameOver();
            return;
        }
        this.activePiece.snapToGrid();
        this.pieces.push(this.activePiece);
        this.spawnNewPiece();
    }

    dropActive() {
        while (this.activePiece.translateY(-0.1) != CollisionEvent.BOTTOM) {}
        this.handleLandedPiece();
    }

    gravity(deltaTime: number) {
        const amount = -deltaTime * 0.003;
        const collision = this.activePiece.translateY(amount);

        if (this.movePiecesBy > 0) {
            this.pieces.forEach((piece) => piece.translateY(amount));
            this.movePiecesBy += amount;
        } else this.movePiecesBy = 0;

        if (collision != CollisionEvent.BOTTOM) return;
        this.handleLandedPiece();
    }

    deleteCol(yVal: number) {
        this.pieces.forEach((piece) => {
            piece.removeY(yVal);
        });
    }

    testFullCols() {
        const targetCount = DIM.size[0] * DIM.size[2];
        const countYMap: Map<number, number> = new Map();
        this.pieces.forEach((piece) => {
            const coords = piece.getCoordinates();
            coords.forEach((coord) => {
                const y = coord[1];
                const cur = countYMap.get(y) || 0;
                countYMap.set(y, cur + 1);
            });
        });

        let killed = 0;
        countYMap.forEach((count, yVal) => {
            if (count == targetCount) {
                killed++;
                this.deleteCol(yVal);
            }
        });
        this.movePiecesBy += killed;
        this.adjustScore(killed);
    }

    drawObjects() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const viewMatrix = this.camera.getView();

        this.shader.projMatrix(this.gl, this.camera.getProjection());
        this.activePiece.draw(this.gl, this.shader, viewMatrix);

        if (this.options.showGrid) {
            this.grid.draw(this.gl, this.shader, viewMatrix);
        } else {
            this.grid.maybeDraw(this.gl, this.shader, this.camera);
        }

        this.pieces.forEach((piece) => {
            piece.draw(this.gl, this.shader, viewMatrix);
        });
    }

    tick(deltaTime: number) {
        if (this.options.gravity) {
            this.gravity(deltaTime);
        }

        this.testFullCols();
        this.drawObjects();
    }
}
