import type { Game } from './game.js';
import { TetracubeType } from './objects/tetracube.js';

/**
 * Adds the error message to the error box on screen and also prints it to the console.
 *
 * @param {string} errorMessage - the message that should be reported
 */
export function reportError(errorMessage: string): void {
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorMessage;
    if (errorBoxDiv !== null) {
        errorBoxDiv.appendChild(errorTextElement);
    }
    console.error(errorMessage);
}

/**
 * Displays the current deltaTime on the screen
 *
 * @param {number} deltaTime - current deltaTime
 */
export function updateTime(deltaTime: number): void {
    setValue('deltaTime', `time per frame: ${deltaTime}ms`);
}

/**
 * Displays the currently selected shader on the screen
 *
 * @param {string} selected - name of the current shader
 */
export function updateShader(selected: string): void {
    setValue('shader', `current shader: ${selected}`);
}

/**
 * Displays the current score on the screen
 *
 * @param {number} score - current score
 */
export function updateScore(score: number): void {
    setValue('score', `Score: ${score} Points`);
}

/**
 * Displays the next piece type on the screen
 *
 * @param {TetracubeType} type - current score
 */
export function updateNextPiece(type: TetracubeType): void {
    const names = [
        'I-Piece',
        'O-Piece',
        'L-Piece',
        'T-Piece',
        'N-Piece',
        'Tower Right',
        'Tower Left',
        'Tripod',
    ];
    const typeName = names[type] || '';
    setValue('nextPiece', `next Tetracube: ${typeName}`);
}

/**
 * Helper function to set the innerText of an HTML Element to any value
 *
 * @param {string} id - id of the HTML Element
 * @param {any} value - the value which should be displayed
 */
export function setValue(id: string, value: any): void {
    const pElement = document.getElementById(id);
    if (pElement !== null) {
        pElement.innerText = value;
    }
}

function setPopUp(visibility: string): void {
    const popUp = document.getElementById('popup');
    if (popUp) {
        popUp.style.visibility = visibility;
    }
}

export function openPopUp(finalScore: number): void {
    setPopUp('visible');
    setValue('finalScoreVal', finalScore);
}

export function registerGame(game: Game): void {
    const button = document.getElementById('newgame');
    if (!button) return;
    button.onclick = () => {
        game.restartGame();
        setPopUp('hidden');
        document.getElementById('canvas')?.focus();
    };
}
