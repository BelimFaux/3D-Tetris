import { Camera } from './camera.js';
import * as ui from './ui.js';

import { KeyboardHandler } from './input/keyboard.js';
import { MouseHandler } from './input/mouse.js';
import { CollisionEvent } from './objects/collision.js';
import { Grid } from './objects/grid.js';
import { Tetracube, TetracubeType } from './objects/tetracube.js';
import { getShader } from './shader.js';
import { DIM } from './utils/constants.js';
import { Slider } from './input/slider.js';

interface GameOptions {
    gravity: boolean;
    showGrid: boolean;
    perspective: boolean;
    gouraud: boolean;
    cylinders: boolean;
}

function defaultOptions(): GameOptions {
    return {
        gravity: false,
        showGrid: false,
        perspective: false,
        gouraud: false,
        cylinders: false,
    };
}

export class Game {
    gl;
    options;
    camera;

    shader;
    sliders;

    nextPiece: TetracubeType;
    activePiece: Tetracube;
    pieces: Array<Tetracube> = [];
    movePiecesBy;
    grid;
    score;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.options = defaultOptions();
        this.camera = new Camera();

        this.shader = getShader('gouraud');
        ui.updateShader('gouraud');
        this.sliders = new Slider();

        this.grid = new Grid();
        this.grid.initVao(gl, this.shader);
        this.nextPiece = Math.floor(Math.random() * 7);
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            this.nextPiece,
            this,
        );
        this.activePiece.initVaos(gl, this.shader);
        this.nextPiece = Math.floor(Math.random() * 7);
        ui.updateNextPiece(this.nextPiece);

        this.movePiecesBy = 0;
        this.score = 0;
        ui.updateScore(this.score);

        new MouseHandler(this.camera);
        new KeyboardHandler(this);
    }

    private spawnNewPiece() {
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            this.nextPiece,
            this,
        );
        this.activePiece.initVaos(this.gl, this.shader);
        this.nextPiece = Math.floor(Math.random() * 7);
        ui.updateNextPiece(this.nextPiece);
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

    toggleCylinders() {
        this.options.cylinders = !this.options.cylinders;
    }

    togglePerspective() {
        const persp = (this.options.perspective = !this.options.perspective);
        if (persp) this.camera.initPerspective();
        else this.camera.initOrthogonal();
    }

    toggleShader() {
        const gouraud = (this.options.gouraud = !this.options.gouraud);
        if (gouraud) this.shader = getShader('gouraud');
        else this.shader = getShader('phong');
        ui.updateShader(gouraud ? 'gouraud' : 'phong');

        this.activePiece.initVaos(this.gl, this.shader);
        this.grid.initVao(this.gl, this.shader);
        this.pieces.forEach((piece) => piece.initVaos(this.gl, this.shader));
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
        this.score = 0;
        ui.updateScore(this.score);
    }

    handleLandedPiece() {
        if (this.activePiece.testCollisions() & CollisionEvent.TOP) {
            this.gameOver();
            return;
        }
        this.activePiece.snapToGrid();
        this.pieces.push(this.activePiece);
        this.spawnNewPiece();
    }

    dropActive() {
        while (!(this.activePiece.translateY(-0.1) & CollisionEvent.BOTTOM)) {}
        this.handleLandedPiece();
    }

    gravity(deltaTime: number) {
        const amount = -deltaTime * 0.001;
        let collision = CollisionEvent.NO_COLLISION;
        if (this.options.gravity)
            collision = this.activePiece.translateY(amount);

        if (this.movePiecesBy > 0) {
            this.pieces.forEach((piece) => {
                if (piece.translateY(amount) & CollisionEvent.BOTTOM)
                    piece.snapToGrid();
            });
            this.movePiecesBy += amount;
        } else this.movePiecesBy = 0;

        if (!(collision & CollisionEvent.BOTTOM)) return;
        this.handleLandedPiece();
    }

    deleteCol(yVal: number) {
        this.pieces.forEach((piece) => {
            piece.removeY(yVal);
        });
        this.pieces = this.pieces.filter((piece) => !piece.isEmpty());
        console.log(`Deleted ${yVal}y xz-plane`);
    }

    testFullCols() {
        const targetCount = DIM.size[0] * DIM.size[2];
        const countYMap: Map<number, number> = new Map();
        this.pieces.forEach((piece) => {
            const coords = piece.getCoordinates();
            coords.forEach((coord) => {
                const y = Math.round(coord[1]);
                const cur = countYMap.get(y) || 0;
                countYMap.set(y, cur + 1);
            });
        });

        let killed = 0;
        countYMap.forEach((count, yVal) => {
            if (count >= targetCount) {
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
        this.gl.uniform3fv(this.shader.locUEye, this.camera.getEye());

        this.shader.initCoefficients(this.sliders);

        if (this.options.cylinders) {
            this.activePiece.drawCylinders(this.gl, this.shader, viewMatrix);
            this.pieces.forEach((piece) => {
                piece.drawCylinders(this.gl, this.shader, viewMatrix);
            });
        } else {
            this.activePiece.drawCubes(this.gl, this.shader, viewMatrix);
            this.pieces.forEach((piece) => {
                piece.drawCubes(this.gl, this.shader, viewMatrix);
            });
        }

        if (this.options.showGrid) {
            this.grid.draw(this.gl, this.shader, viewMatrix);
        } else {
            this.grid.maybeDraw(this.gl, this.shader, this.camera);
        }
    }

    tick(deltaTime: number) {
        this.gravity(deltaTime);
        this.testFullCols();
        this.drawObjects();
    }
}
