import { Camera } from './camera.js';
import * as ui from './ui.js';

import { KeyboardHandler } from './input/keyboard.js';
import { MouseHandler } from './input/mouse.js';
import { CollisionEvent } from './objects/collision.js';
import { Grid } from './objects/grid.js';
import { Tetracube, TetracubeType } from './objects/tetracube.js';
import { getShader } from './shader.js';
import { DIM } from './utils/globals.js';
import { Slider } from './input/slider.js';
import { BlinkingEffect } from './objects/animation.js';
import { AxisOverlay } from './objects/axis.js';

/**
 * Interface for all game related options
 */
interface GameOptions {
    gravity: boolean;
    showGrid: boolean;
    perspective: boolean;
    gouraud: boolean;
    cylinders: boolean;
    axisOverlay: boolean;
    musicPlaying: boolean;
}

/**
 * construct an object with the default options for the game
 *
 * @returns {GameOptions} the constructed object
 */
function defaultOptions(): GameOptions {
    return {
        gravity: true,
        showGrid: false,
        perspective: false,
        gouraud: false,
        cylinders: false,
        axisOverlay: false,
        musicPlaying: false,
    };
}

/**
 * Class that represents a game of 3d tetris
 */
export class Game {
    gl;
    options;
    gameOver;
    camera;
    music;

    shader;
    sliders;

    nextPiece: TetracubeType;
    activePiece: Tetracube;
    pieces: Array<Tetracube> = [];
    grid;
    axis;
    animation;

    movePiecesBy;
    score;

    /**
     * construct a new game in the given webgl context
     *
     * @param gl {WebGL2RenderingContext} the webgl context
     */
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.options = defaultOptions();
        this.options.gravity = false; // before the game starts, the gravity is always off
        this.gameOver = false;
        this.camera = new Camera();
        this.music = new Audio('ressources/sounds/TetriX.wav');
        this.music.loop = true;
        if (this.options.musicPlaying) this.music.play();

        this.shader = getShader('gouraud');
        ui.updateShader('gouraud');
        this.sliders = new Slider();

        this.grid = new Grid();
        this.grid.initVao(gl, this.shader);
        this.axis = new AxisOverlay(this);
        this.axis.initVAO(gl, this.shader);

        this.nextPiece = Math.floor(Math.random() * 7);
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            this.nextPiece,
            this,
            false,
        );
        this.activePiece.initVaos(gl, this.shader);
        this.nextPiece = Math.floor(Math.random() * 7);
        ui.updateNextPiece(this.nextPiece);

        this.animation = new BlinkingEffect([], 0);

        this.movePiecesBy = 0;
        this.score = 0;
        ui.updateScore(this.score);
    }

    /**
     * Helper function to spawn a new tetracube at the top of the grid
     */
    private spawnNewPiece(): void {
        this.activePiece = new Tetracube(
            [0, DIM.max[1], 0],
            this.nextPiece,
            this,
        );
        this.activePiece.initVaos(this.gl, this.shader);
        this.nextPiece = Math.floor(Math.random() * 7);
        ui.updateNextPiece(this.nextPiece);
    }

    /**
     * Adjust the score depending on how many rows were killed
     * Uses the original [BPS scoring system](https://tetris.wiki/Scoring)
     *
     * Might also update the score in the ui
     *
     * @param killed {number} the number of rows that were killed
     */
    private adjustScore(killed: number): void {
        if (killed == 0) return;
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

    /**
     * Handle a landed piece.
     * Will check for game end and spawn a new piece
     */
    private handleLandedPiece(): void {
        if (this.activePiece.testCollisions() & CollisionEvent.TOP) {
            this.gameOver = true;
            this.music.pause();
            ui.openGameoverPopUp(this.score);
            return;
        }
        this.activePiece.snapToGrid();
        const newPieces = this.activePiece.splitIntoSingles();
        newPieces.forEach((piece) => piece.initVaos(this.gl, this.shader));
        this.pieces.push(...newPieces); // once a piece lands, all of it's cubes are on their own...
        this.spawnNewPiece();
    }

    /**
     * Handle gravity
     * Drops the active piece by the gravity amount and handles collisions
     * Will also drop all landed pieces if `this.movePiecesBy` is greater than zero
     */
    private gravity(deltaTime: number): void {
        const amount = -deltaTime * 0.001;
        let collision = CollisionEvent.NO_COLLISION;
        if (this.options.gravity)
            collision = this.activePiece.translateY(amount);

        // move landed pieces down if lines have been killed
        if (this.movePiecesBy > 0) {
            this.pieces.forEach((piece) => {
                if (piece.translateY(amount * 2) & CollisionEvent.BOTTOM)
                    piece.snapToGrid();
            });
            this.movePiecesBy += amount * 2;
        } else this.movePiecesBy = 0;

        if (!(collision & CollisionEvent.BOTTOM)) return;
        this.handleLandedPiece();
    }

    /**
     * Delete all pieces in a row
     * Might start a new animation for deletion
     *
     * @param yVal {number} the y value of the row
     */
    private deleteRow(yVal: number): void {
        const cubesToDelete = this.pieces.filter((piece) => piece.isAt(yVal));
        this.pieces = this.pieces.filter((piece) => !piece.isAt(yVal));
        if (this.animation.isFinished())
            this.animation = new BlinkingEffect(cubesToDelete);
        else this.animation.addPieces(cubesToDelete);
    }

    /**
     * Test if any rows are full and deletes them.
     * Will also update score
     */
    private testFullRows(): void {
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
                this.deleteRow(yVal);
            }
        });
        // tell gravity how many lines landed pieces can move down by
        this.movePiecesBy += killed;
        this.adjustScore(killed);
    }

    /**
     * Draw all objects in the current webgl context using the current shader
     */
    private drawObjects(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const viewMatrix = this.camera.getView();

        this.shader.projMatrix(this.gl, this.camera.getProjection());
        this.gl.uniform3fv(this.shader.locUEye, this.camera.getEye());

        this.shader.initCoefficients(this.sliders);

        if (!this.animation.isFinished()) {
            this.animation.draw(
                this.gl,
                this.shader,
                viewMatrix,
                this.options.cylinders,
            );
        }

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

        if (this.options.axisOverlay)
            this.axis.draw(this.gl, this.shader, viewMatrix);
    }

    /**
     * Advance the game
     *
     * @param deltaTime {number} the time passed since the last tick
     */
    tick(deltaTime: number): void {
        if (this.gameOver) return;
        if (this.animation.isFinished()) {
            this.gravity(deltaTime);
            this.testFullRows();
        } else {
            this.animation.tick(deltaTime);
        }
        this.drawObjects();
    }

    /**
     * Drop the active piece until it collides with something on the bottom
     * Wont have any effect if an animation is currently playing
     */
    dropActive(): void {
        if (!this.animation.isFinished()) return;
        // just translate down until something is hit
        while (!(this.activePiece.translateY(-0.1) & CollisionEvent.BOTTOM)) {}
        this.handleLandedPiece();
    }

    /**
     * Restart the game by resetting the score and clearing all landed pieces
     *
     * Will also update the score in the ui
     */
    restartGame(): void {
        this.gameOver = false;
        this.spawnNewPiece();
        this.pieces = [];
        this.score = 0;
        if (this.options.musicPlaying) {
            this.music.currentTime = 0;
            this.music.play();
        }
        ui.updateScore(this.score);
    }

    /**
     * Starts the game, by initilizing the inputhandlers and setting gravity to it's default value
     * Will also reinitialize the grid and the first piece, because the dimensions might have changed
     */
    startGame(): void {
        new MouseHandler(this.camera);
        new KeyboardHandler(this);
        this.options.gravity = defaultOptions().gravity;
        this.spawnNewPiece();
        this.grid = new Grid();
        this.grid.initVao(this.gl, this.shader);
    }

    /**
     * Spawn an I-piece
     */
    cheatCode(): void {
        this.nextPiece = TetracubeType.IPIECE;
        this.spawnNewPiece();
    }

    /**
     * returns the active piece
     */
    getActive(): Tetracube {
        return this.activePiece;
    }

    /**
     * toggle the gravity
     */
    toggleGravity(): void {
        this.options.gravity = !this.options.gravity;
    }

    /**
     * toggle the grid
     * Will show the whole grid if enabled or just the sides facing away else
     */
    toggleGrid(): void {
        this.options.showGrid = !this.options.showGrid;
    }

    /**
     * toggle cylinders
     * Will render the tetracubes with cylinders instead of cubes
     */
    toggleCylinders(): void {
        this.options.cylinders = !this.options.cylinders;
    }

    /**
     * toggle axis overlay
     * this will overlay the games coordinate axis over the active piece
     */
    toggleAxis(): void {
        this.options.axisOverlay = !this.options.axisOverlay;
    }

    /**
     * toggle music
     * pause and unpause the music playing in the background
     */
    toggleMusic(): void {
        if (this.options.musicPlaying) this.music.pause();
        else this.music.play();
        this.options.musicPlaying = !this.options.musicPlaying;
    }

    /**
     * set music to a specific value to pause and unpause the music playing in the background
     *
     * @param playing {boolean} true if the music should play, false if not
     */
    setMusic(playing: boolean): void {
        this.options.musicPlaying = playing;
        if (this.options.musicPlaying) this.music.play();
        else this.music.pause();
    }

    /**
     * toggle between perspective and orthographic view
     */
    togglePerspective(): void {
        const persp = (this.options.perspective = !this.options.perspective);
        if (persp) this.camera.initPerspective();
        else this.camera.initOrthogonal();
    }

    /**
     * toggle between gouraud and phong shader to be used for rendering
     */
    toggleShader(): void {
        const gouraud = (this.options.gouraud = !this.options.gouraud);
        if (gouraud) this.shader = getShader('gouraud');
        else this.shader = getShader('phong');
        ui.updateShader(gouraud ? 'gouraud' : 'phong');

        this.activePiece.initVaos(this.gl, this.shader);
        this.grid.initVao(this.gl, this.shader);
        this.axis.initVAO(this.gl, this.shader);
        this.pieces.forEach((piece) => piece.initVaos(this.gl, this.shader));
    }
}
