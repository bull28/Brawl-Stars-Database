import {GameReport, ReportData, ReportPreview} from "../types";

// Type used by the game when calculating scores
interface ScorePerformance{
    defeatedValue: number;
    totalValue: number;
    timeSpent: number;
    destination: number;
    healthPenalty: number;
    gearScore: number;
}

const REPORT_FORMAT = {
    player: [0, 4], gears: [4, 6], score: [6, 12],
    achievements: [12, 19], upgrades: [19, 25], visited: [25, 33],
    levels: [33, 81], enemies: [81, 105], length: [0, 105]
};
const SCORE_CONSTANTS = {
    stages: [
        {completion: 10, time: 0, baseReward: 10},
        {completion: 15, time: 15, baseReward: 15},
        {completion: 20, time: 15, baseReward: 20},
        {completion: 30, time: 20, baseReward: 25},
        {completion: 45, time: 20, baseReward: 30},
        {completion: 60, time: 25, baseReward: 40},
        {completion: 60, time: 25, baseReward: 60},
        {completion: 60, time: 30, baseReward: 0}
    ],
    maxScores: {completion: 300, time: 150, destination: 50, health: 50, gear: 30, enemy: 20},
    bonusEnemies: [
        {name: "hank", index: 22, score: 20}
    ]
};

function convertLevelReports(reports: number[]): ScorePerformance[]{
    // Number of stages and number of score categories per stage
    const stages = SCORE_CONSTANTS.stages.length;
    const scores = Object.keys(SCORE_CONSTANTS.maxScores).length;

    if (reports.length !== stages * scores){
        return [];
    }

    let converted: ScorePerformance[] = [];
    let hasLost = false;
    for (let level = 0; level < stages * scores; level += scores){
        for (let x = 0; x < scores; x++){
            // If any of the entries are < 0, the player lost and the remaining entries should not be added to the score
            if (reports[level + x] < 0){
                hasLost = true;
            }
        }

        if (hasLost === false){
            converted.push({
                defeatedValue: reports[level], totalValue: reports[level + 1], timeSpent: reports[level + 2],
                destination: reports[level + 3], healthPenalty: reports[level + 4], gearScore: reports[level + 5]
            });
        }
    }
    return converted;
}

function getFinalScore(reports: number[], enemyCounts: number[]): number[]{
    // This function's logic needs to be exactly the same as it is in the game.

    // Difference in input format from the function ingame: Instead of enemyCounts being a map from enemy names to
    // number defeated, enemyCounts is an array with only the numbers (values of the map).
    const levelReports = convertLevelReports(reports);

    const score = {completion: 0, time: 0, destination: 0, health: 0, gear: 0, enemy: 0};
    const stages = SCORE_CONSTANTS.stages;
    const maxScores = SCORE_CONSTANTS.maxScores;
    const bonusEnemies = SCORE_CONSTANTS.bonusEnemies;
    let success = true;
    let totalHealthPenalty = 0;
    let totalEnemyBonus = 0;
    for (let x = 0; x < stages.length; x++){
        if (x < levelReports.length){
            const report = levelReports[x];

            if (report.defeatedValue < report.totalValue){
                success = false;
            }

            totalHealthPenalty += Math.min(20, report.healthPenalty);

            if (report.totalValue <= 0){
                score.completion += stages[x].completion;
            } else{
                score.completion += stages[x].completion * report.defeatedValue / report.totalValue;
            }
            score.destination += report.destination;
            score.gear += report.gearScore;

            const t = Math.max(0.5, report.timeSpent / 1000);
            let multiplier = 0;
            if (t < 1){
                multiplier = 1.5 - 121/112*(t-0.5) + 9/28*(t-0.5)*(t-0.5)*(t-0.5);
            } else if (t < 2){
                multiplier = 1 - 47/56*(t-1) + 27/56*(t-1)*(t-1) - 1/7*(t-1)*(t-1)*(t-1);
            } else if (t < 3){
                multiplier = 0.5 - 17/56*(t-2) + 3/56*(t-2)*(t-2);
            } else if (t < 5){
                multiplier = 0.25 - 11/56*(t-3) + 3/56*(t-3)*(t-3) - 1/112*(t-3)*(t-3)*(t-3);
            }
            score.time += stages[x].time * multiplier;
        } else{
            success = false;
        }
    }
    if (success === false){
        score.completion = Math.min(maxScores.completion - 1, Math.floor(score.completion));
        score.time = 0;
        score.destination = 0;
        score.gear = Math.min(maxScores.gear, Math.floor(score.gear));
        score.enemy = 0;
        return [score.completion, score.time, score.destination, score.health, score.gear, score.enemy];
    }
    for (let x = 0; x < bonusEnemies.length; x++){
        if (enemyCounts[bonusEnemies[x].index] > 0){
            totalEnemyBonus += bonusEnemies[x].score;
        }
    }
    score.completion = Math.min(maxScores.completion, Math.floor(score.completion));
    score.time = Math.min(maxScores.time, Math.floor(score.time));
    score.destination = Math.min(maxScores.destination, Math.floor(score.destination));
    score.gear = Math.min(maxScores.gear, Math.floor(score.gear));
    score.enemy = Math.min(maxScores.enemy, Math.max(0, totalEnemyBonus));
    score.health = Math.min(maxScores.health, Math.max(0, Math.floor(maxScores.health - totalHealthPenalty + 20)));

    return [score.completion, score.time, score.destination, score.health, score.gear, score.enemy];
}

/**
 * Checks whether a game report is valid. A report is valid if the data has the correct length, all the numbers are
 * integers, and the numbers represent a valid game result. Since there are many possible game outcomes that depend
 * on randomness and player skill, this function cannot perfectly check whether a report is valid. It only rejects
 * data that it knows is definitely impossible to produce from a valid game playthrough.
 * @param report report from the game in [version, time, data] format
 * @returns false if the report is definitely invalid, true if it is reasonable enough
 */
export function validateReport(report: GameReport): boolean{
    // Last updated: version 64

    if (report.length !== 3){
        // Invalid report length
        return false;
    }
    if (report[0] < 64){
        // Old report version
        return false;
    }
    if (report[1] > Date.now()){
        // Invalid report time
        return false;
    }

    const data = report[2];
    const format = REPORT_FORMAT;
    let valid = true;

    if (data.length !== format.length[1] - format.length[0]){
        // Invalid data length
        return false;
    }

    // All values in the report data must be integers
    for (let x = 0; x < data.length; x++){
        if (Number.isInteger(data[x]) === false){
            valid = false;
        }
    }
    if (valid === false){
        // Must return early because all other comparisons with the data require it to be integers
        return false;
    }

    // These are simple checks that determine whether report data is definitely invalid. The upper bounds on the checks
    // are intentionally high so valid but rare cases are not rejected. Values above the upper bounds have no chance of
    // happening through normal gameplay and are guaranteed to be invalid. Many of the values here are set based on
    // various game mechanics. They need to be updated if those mechanics in the game are updated.

    // The difficulty must be between 0 and 5
    const difficulty = data[format.player[0] + 1];
    if (difficulty < 0 || difficulty > 5){
        return false;
    }

    // The character must be at least 0
    const character = data[format.player[0] + 2];
    if (character < 0){
        return false;
    }

    // The star power must be between 1 and 2
    const starPower = data[format.player[0] + 3];
    if (starPower < 1 || starPower > 2){
        return false;
    }

    // The total enemies defeated cannot be more than 750
    const enemiesDefeated = data[format.achievements[0] + 1];
    if (enemiesDefeated > 750){
        return false;
    }

    // The upgrades cannot be more than each upgrade type limit
    const upgrades = data.slice(format.upgrades[0], format.upgrades[1]);
    const maxUpgrades = [16, 16, 12, 5, 5, 6];
    if (upgrades.length < maxUpgrades.length){
        return false;
    }
    for (let x = 0; x < maxUpgrades.length; x++){
        if (upgrades[x] > maxUpgrades[x] || upgrades[x] < 0){
            valid = false;
        }
    }

    // The visited levels must be unique and only certain values are allowed at certain indexes
    const visited = data.slice(format.visited[0], format.visited[1]);
    const visitedAllowed = [[0], [1], [2, 3, 4, 5], [2, 3, 4, 5], [6, 7, 8, 9], [6, 7, 8, 9], [10], [11]];
    if (visited.length < visitedAllowed.length){
        return false;
    }
    let hasLost = false;
    for (let x = 0; x < visited.length; x++){
        if (hasLost === true){
            // If the player has already lost, all entries that follow must be < 0
            if (visited[x] >= 0){
                valid = false;
            }
        } else if (visitedAllowed[x].includes(visited[x]) === false){
            // If an invalid entry is encountered, the only other values it is allowed to be are < 0
            if (visited[x] < 0){
                // If the entry is < 0, the player lost on this level
                hasLost = true;
            } else{
                // If the entry is >= 0, the data is invalid
                valid = false;
            }
        }
    }

    // The meteor and robot enemies should not be defeated more than 80 times
    // The brawler enemies should not be defeated more than 12 times
    // The special (boss and bonus) enemies should not be defeated more than once
    const brawlerOffset = format.enemies[0] + 2;
    const specialOffset = format.enemies[0] + 22;
    for (let x = format["enemies"][0]; x < format.enemies[1]; x++){
        if (x < brawlerOffset){
            if (data[x] > 80){
                valid = false;
            }
        } else if (x < specialOffset){
            if (data[x] > 12){
                valid = false;
            }
        } else{
            if (data[x] > 1){
                valid = false;
            }
        }
    }

    // Calculating the overall score from the level reports should equal the overall score calculated by the game
    let totalScore = 0;
    const finalScore = getFinalScore(data.slice(format.levels[0], format.levels[1]), data.slice(format.enemies[0], format.enemies[1]));
    if (finalScore.length !== format.score[1] - format.score[0]){
        return false;
    }
    for (let x = 0; x < finalScore.length; x++){
        if (finalScore[x] !== data[format.score[0] + x]){
            valid = false;
        } else{
            totalScore += finalScore[x];
        }
    }
    if (data[format.player[0]] !== totalScore){
        // The sum of all score categories should equal the sum calculated by the game
        return false;
    }
    
    return valid;
}


const badgeList = [
    //{name: "meteor", category: "enemy"},
    //{name: "robot", category: "enemy"},
    {name: "shelly", category: "enemy", value: 2},
    {name: "colt", category: "enemy", value: 3},
    {name: "rt", category: "enemy", value: 4},
    {name: "elprimo", category: "enemy", value: 5},
    {name: "8bit", category: "enemy", value: 6},
    {name: "belle", category: "enemy", value: 7},
    {name: "jessie", category: "enemy", value: 8},
    {name: "eve", category: "enemy", value: 9},
    {name: "mortis", category: "enemy", value: 10},
    {name: "frank", category: "enemy", value: 11},
    {name: "bea", category: "enemy", value: 12},
    {name: "colette", category: "enemy", value: 13},
    {name: "lola", category: "enemy", value: 14},
    {name: "bibi", category: "enemy", value: 15},
    {name: "mandy", category: "enemy", value: 16},
    {name: "ash", category: "enemy", value: 17},
    {name: "bonnie", category: "enemy", value: 18},
    {name: "amber", category: "enemy", value: 19},
    {name: "max", category: "enemy", value: 20},
    {name: "meg", category: "enemy", value: 21},
    //{name: "hank", category: "enemy"},
    //{name: "bull", category: "enemy"},
    {name: "spike", category: "player", value: 0},
    {name: "gus", category: "player", value: 1},
    {name: "emz", category: "player", value: 2},
    {name: "darryl", category: "player", value: 3},
    {name: "tara", category: "player", value: 4},
    {name: "piper", category: "player", value: 5},
    {name: "crow", category: "player", value: 6},
    {name: "oldtown", category: "location", value: 2},
    {name: "warehouse", category: "location", value: 3},
    {name: "ghoststation", category: "location", value: 4},
    {name: "giftshop", category: "location", value: 5},
    {name: "retropolis", category: "location", value: 6},
    {name: "candyland", category: "location", value: 7},
    {name: "stuntshow", category: "location", value: 8},
    {name: "supercity", category: "location", value: 9},
    {name: "arcade", category: "location", value: 10}
];/////////////////////////////////////////////////

function extractReportPreview(report: GameReport): ReportPreview | undefined{
    // Gets a report object that is only for displaying to the user
    return undefined;
}

function extractReportData(report: GameReport): ReportData | undefined{
    // Gets a report object that the server uses, this object is not shown to the user
    if (validateReport(report) === false){
        return undefined;
    }

    const data = report[2];
    const format = REPORT_FORMAT;
    const p = format.player[0];
    const s = format.score[0];
    const a = format.achievements[0];

    const enemies = data.slice(format.enemies[0], format.enemies[1]);
    const visited = data.slice(format.visited[0], format.visited[1]);

    const achievements = new Set<string>();

    const badges = new Map<string, number>();

    for (let x = 0; x < badgeList.length; x++){
        const b = badgeList[x];
        if (b.category === "enemy"){
            if (b.value < enemies.length && enemies[b.value] > 0){
                badges.set(b.name, enemies[b.value]);
            }
        } else if (b.category === "player"){
            if (b.value === data[p + 2]){
                badges.set(b.name, 1);
            }
        } else if (b.category === "location"){
            if (visited.includes(b.value) === true){
                badges.set(b.name, 1);
            }
        }
    }

    return {
        player: {
            difficulty: data[p + 1],
            brawler: data[p + 2],
            starPower: data[p + 3],
            gears: data.slice(format.gears[0], format.gears[1])
        },
        score: {
            total: data[p],
            categories: {
                completion: data[s],
                time: data[s + 1],
                destination: data[s + 2],
                health: data[s + 3],
                gear: data[s + 4],
                enemy: data[s + 5]
            }
        },
        achievements: achievements,
        badges: badges
    };
}
