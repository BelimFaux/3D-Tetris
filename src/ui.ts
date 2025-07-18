import type { Game } from './game.js';
import { TetracubeType } from './objects/tetracube.js';
import { setDimension } from './utils/constants.js';

/**
 * Alert the user that an error occured and also prints it to the console.
 *
 * @param {string} errorMessage - the message that should be reported
 */
export function reportError(errorMessage: string): void {
    alert(errorMessage);
    console.error(errorMessage);
}

/**
 * Displays the current deltaTime on the screen
 *
 * @param {number} deltaTime - current deltaTime
 */
export function updateTime(deltaTime: number): void {
    setValue('deltaTime', `${deltaTime} ms/frame`);
}

/**
 * Displays the currently selected shader on the screen
 *
 * @param {string} selected - name of the current shader
 */
export function updateShader(selected: string): void {
    setValue('shader', `current: ${selected}`);
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

function setPopUp(popupname: string, visibility: string): void {
    const popUp = document.getElementById(popupname + 'Popup');
    if (popUp) {
        popUp.style.visibility = visibility;
    }
}

export function openGameoverPopUp(finalScore: number): void {
    setPopUp('gameover', 'visible');
    setValue('finalScoreVal', finalScore);
}

export function openStartPopUp(): void {
    setPopUp('start', 'visible');
}

export function registerGame(game: Game): void {
    const newGameButton = document.getElementById('newgame');
    if (newGameButton) {
        newGameButton.onclick = () => {
            game.restartGame();
            setPopUp('gameover', 'hidden');
            document.getElementById('canvas')?.focus();
        };
    }
    const startGameButton = document.getElementById('startgame');
    if (!startGameButton) return;
    startGameButton.onclick = () => {
        const playMusic = document.getElementById(
            'playMusic',
        ) as HTMLInputElement | null;
        if (playMusic) game.setMusic(playMusic.checked);

        const cylinders = document.getElementById(
            'enableCylinders',
        ) as HTMLInputElement | null;
        if (cylinders) game.options.cylinders = cylinders.checked;

        const axis = document.getElementById(
            'enableAxis',
        ) as HTMLInputElement | null;
        if (axis) game.options.axisOverlay = axis.checked;

        const size = document.getElementById(
            'fieldSize',
        ) as HTMLSelectElement | null;
        if (size) setDimension(size.value);

        game.startGame();
        setPopUp('start', 'hidden');
        document.getElementById('canvas')?.focus();
    };
}
