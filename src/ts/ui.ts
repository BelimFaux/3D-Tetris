import type { Game } from './game.js';
import { getLeaderboardRecords } from './leaderboard.js';
import { TetracubeType } from './objects/tetracube.js';
import { setDimension } from './utils/globals.js';

/**
 * Alert the user that an error occured and also prints it to the console.
 *
 * @param {string} errorMessage - the message that should be reported
 */
export function reportError(errorMessage: string): void {
    alert(`Oops, an error occured. Error message was:\n${errorMessage}`);
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

/**
 * Helper function to set a popup (element with id suffix 'Popup') to the given visibility
 *
 * @param popupname {string} - the id prefix (e.g. for id 'testPopup' it should be 'test')
 * @param visibility {string} - the visibility to set the element to ('visible' / 'hidden')
 */
function setPopUp(popupname: string, visibility: string): void {
    const popUp = document.getElementById(popupname + 'Popup');
    if (popUp) {
        popUp.style.visibility = visibility;
    }
}

/**
 * Populate the leaderboard element with the saved records
 */
function populateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;
    const leaderboardRecords = getLeaderboardRecords();
    leaderboard.innerHTML = '';
    leaderboardRecords.forEach((rec) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const nameTag = document.createTextNode(rec.name);
        nameCell.appendChild(nameTag);
        const scoreCell = document.createElement('td');
        const scoreTag = document.createTextNode(`${rec.score}`);
        scoreCell.appendChild(scoreTag);

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        leaderboard.appendChild(row);
    });
}

/**
 * Opens the Game over popup and displays the final score
 *
 * @param finalScore {number} the score to display
 */
export function openGameoverPopUp(finalScore: number): void {
    populateLeaderboard();
    setPopUp('gameover', 'visible');
    setValue('finalScoreVal', finalScore);
}

/**
 * Opens the start popup
 */
export function openStartPopUp(): void {
    setPopUp('start', 'visible');
}

/**
 * Registers the game object with the new game and restart popups.
 * If this function is not called, the new game buttons won't have any effect on the game.
 *
 * Might change the dimensions of the grid, so the grid and objects of the game might have to be reinitilized
 *
 * @param game {Game} the game object to register
 */
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

/**
 * Prompt the player for a name and return the given string
 */
export function promptPlayerName(): string {
    return prompt('Please enter your name:') ?? '';
}
