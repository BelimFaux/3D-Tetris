// How many records should the leaderboard save at max
const SAVED_RECORDS: number = 3;

/**
 * A record of the leaderboard consisting of player name and score
 */
interface LeaderboardRecord {
    name: string;
    score: number;
}

/**
 * A leaderboard consisting of multiple records
 */
interface Leaderboard {
    records: Array<LeaderboardRecord>;
}

/**
 * Create a new empty leaderboard
 * @returns leaderboard {Leaderboard} the newly created leaderboard
 */
function createLeaderboard(): Leaderboard {
    const leaderboard = {
        records: new Array<LeaderboardRecord>(),
    } satisfies Leaderboard;
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    return leaderboard;
}

/**
 * Retrieve the leaderboard stored in localStorage or create a new one
 */
function getLeaderboard(): Leaderboard {
    const leaderboardJson = localStorage.getItem('leaderboard');
    if (!leaderboardJson) return createLeaderboard();
    const leaderboard = JSON.parse(leaderboardJson);
    if (!(leaderboard satisfies Leaderboard)) return createLeaderboard();
    return leaderboard;
}

/**
 * Register a new highscore to the leaderboard.
 * If the highscore is not in the top `SAVED_RECORDS` of records, this function has no effect.
 *
 * @param name {string} the name for the new record
 * @param score {number} the score for the new record
 */
export function registerNewScore(name: string, score: number): void {
    const leaderboard = getLeaderboard();
    if (leaderboard.records.length < SAVED_RECORDS) {
        leaderboard.records.push({ name: name, score: score });
    } else {
        leaderboard.records.push({ name: name, score: score });
        leaderboard.records.sort((lhs, rhs) => rhs.score - lhs.score).pop();
    }
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

/**
 * Check if the given score would be a highscore, i.e. ranks anywhere in the leaderboard
 *
 * @param score {number} the score to check
 * @returns {boolean} true if the score is a highscore else false
 */
export function isHighscore(score: number): boolean {
    const leaderboard = getLeaderboard();
    return (
        leaderboard.records.length < SAVED_RECORDS ||
        leaderboard.records.some((rec) => rec.score < score)
    );
}
