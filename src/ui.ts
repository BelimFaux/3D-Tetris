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
 * Helper function to set the innerText of an HTML Element to any value
 *
 * @param {string} id - id of the HTML Element
 * @param {any} value - the value which should be displayed
 */
function setValue(id: string, value: any): void {
    const pElement = document.getElementById(id);
    if (pElement !== null) {
        pElement.innerText = value;
    }
}
