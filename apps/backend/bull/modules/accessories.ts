import accessoryList from "../data/accessories_data.json";
import {RESOURCE_IMAGE_DIR, ACCESSORY_IMAGE_DIR, IMAGE_FILE_EXTENSION, GAME_GEAR_IMAGE_DIR, GAME_BRAWLER_IMAGE_DIR, gameDifficulties, gameBrawlers, gameStarPowers, gameGears} from "../data/constants";
import {DatabaseAccessories, DatabaseBadges, BadgeReward, CollectionAccessory, AccessoryPreview, AccessoryData, MasteryData, GameReport, ReportData, ReportPreview} from "../types";

// Type used by the game when calculating scores
interface ScorePerformance{
    defeatedValue: number;
    totalValue: number;
    timeSpent: number;
    destination: number;
    healthPenalty: number;
    gearScore: number;
}

interface Accessory{
    name: string;
    category: string;
    displayName: string;
    description: string;
    unlock: string;
    badges: number;
}

const REPORT_FORMAT = {
    mode: [0, 2], player: [2, 6], gears: [6, 8], accessories: [8, 13], score: [13, 19],
    achievements: [19, 26], upgrades: [26, 32], stats: [32, 40], visited: [40, 48],
    levels: [48, 96], enemies: [96, 126], length: [0, 126]
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
        {name: "hank", index: 26, score: 6},
        {name: "buster", index: 27, score: 14}
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

            totalHealthPenalty += Math.min(40, report.healthPenalty / 500);

            if (report.totalValue <= 0){
                score.completion += stages[x].completion;
            } else{
                score.completion += stages[x].completion * report.defeatedValue / report.totalValue;
            }
            score.destination += report.destination;
            score.gear += report.gearScore;

            const t = Math.max(0.5, report.timeSpent / 1000);
            let multiplier = 0;
            if (t < 0.75){
                multiplier = ((-2156/481*(t-0.5))*(t-0.5) - 423/1924)*(t-0.5) + 1.5;
            } else if (t < 1){
                multiplier = ((3084/481*(t-0.75) -1617/481)*(t-0.75) - 510/481)*(t-0.75) + 1.375;
            } else if (t < 1.5){
                multiplier = ((-355/481*(t-1) + 696/481)*(t-1) - 2961/1924)*(t-1) + 1;
            } else if (t < 2){
                multiplier = ((-47/481*(t-1.5) + 327/962)*(t-1.5) - 621/962)*(t-1.5) + 0.5;
            } else if (t < 3){
                multiplier = ((-31/481*(t-2) + 93/481)*(t-2) - 729/1924)*(t-2) + 0.25;
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
        score.gear = 0;
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
    score.health = Math.min(maxScores.health, Math.max(0, Math.floor(maxScores.health - totalHealthPenalty + 30)));

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
    // Last updated: version 77

    if (report.length !== 3){
        // Invalid report length
        return false;
    }
    if (report[0] < 77){
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

    // The game mode must be 0 or 2
    const gameMode = data[format.mode[0]];
    if (gameMode !== 0 && gameMode !== 2){
        return false;
    }

    // The difficulty must be between 0 and 9
    const difficulty = data[format.player[0] + 1];
    if (difficulty < 0 || difficulty > 9){
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

    // The total enemies defeated cannot be more than 1000
    const enemiesDefeated = data[format.achievements[0] + 1];
    if (enemiesDefeated > 1000){
        return false;
    }

    // The enemy stats multiplier must not be decreasing for each level
    const stats = data.slice(format.stats[0], format.stats[1]);
    let maxStats = 0;
    for (let x = 0; x < stats.length; x++){
        if (stats[x] >= maxStats){
            maxStats = stats[x];
        } else if (stats[x] >= 0){
            // If fewer levels were played, all other entries will be -1 which shouldn't count as decreasing multiplier
            valid = false;
        }
    }

    // The visited levels must be unique and only certain values are allowed at certain indexes
    const visited = data.slice(format.visited[0], format.visited[1]);
    const visitedAllowed = [[0], [1], [2, 3, 4, 5], [3, 4, 5, 6], [7, 8, 9, 10], [8, 9, 10, 11], [12], [13]];
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
        } else if (gameMode === 0){
            if (visitedAllowed[x].includes(visited[x]) === false){
                // If an invalid entry is encountered, the only other values it is allowed to be are < 0
                if (visited[x] < 0){
                    // If the entry is < 0, the player lost on this level
                    hasLost = true;
                } else{
                    // If the entry is >= 0, the data is invalid
                    valid = false;
                }
            }
        } else if (gameMode === 2 && visited[x] < 0){
            // In game mode 2, there are no restrictions on which levels can be visited
            hasLost = true;
        }
    }

    // The meteor and robot enemies should not be defeated more than 80 times
    // The brawler enemies should not be defeated more than 12 times
    // The special (boss and bonus) enemies should not be defeated more than once
    const brawlerOffset = format.enemies[0] + 2;
    const specialOffset = format.enemies[0] + 26;
    for (let x = format.enemies[0]; x < format.enemies[1]; x++){
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

    if (gameMode === 0){
        // Accessories are not allowed on difficulty 5 or lower
        const accs = data.slice(format.accessories[0], format.accessories[1]);
        for (let x = 0; x < accs.length; x++){
            if (accs[x] >= 0 && difficulty <= 5){
                valid = false;
            }
        }

        // The upgrades cannot be more than each upgrade type limit
        const upgrades = data.slice(format.upgrades[0], format.upgrades[1]);
        const maxUpgrades = difficulty >= 6 ? [20, 20, 12, 8, 6, 7] : [16, 16, 10, 7, 5, 6];
        if (upgrades.length < maxUpgrades.length){
            return false;
        }
        for (let x = 0; x < maxUpgrades.length; x++){
            if (upgrades[x] > maxUpgrades[x] || upgrades[x] < 0){
                valid = false;
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
    }

    return valid;
}


const accessories: Accessory[] = [];
for (let x = 0; x < accessoryList.length; x++){
    const a = accessoryList[x];
    accessories.push({
        name: a.name, category: a.category, displayName: a.displayName,
        description: a.description, unlock: a.unlock, badges: a.badges
    });
}

const badgeList = [
    {name: "meteor", category: "enemy", index: 0, coins: [2, 2]},
    {name: "robot", category: "enemy", index: 1, coins: [4, 4]},
    {name: "shelly", category: "enemy", index: 2, coins: [7, 9]},
    {name: "colt", category: "enemy", index: 3, coins: [11, 13]},
    {name: "rt", category: "enemy", index: 4, coins: [12, 14]},
    {name: "elprimo", category: "enemy", index: 5, coins: [15, 17]},
    {name: "8bit", category: "enemy", index: 6, coins: [16, 18]},
    {name: "belle", category: "enemy", index: 7, coins: [17, 19]},
    {name: "jessie", category: "enemy", index: 8, coins: [18, 20]},
    {name: "eve", category: "enemy", index: 9, coins: [18, 22]},
    {name: "mortis", category: "enemy", index: 10, coins: [18, 22]},
    {name: "frank", category: "enemy", index: 11, coins: [22, 26]},
    {name: "jacky", category: "enemy", index: 12, coins: [19, 23]},
    {name: "mrp", category: "enemy", index: 13, coins: [22, 26]},
    {name: "bea", category: "enemy", index: 14, coins: [23, 27]},
    {name: "colette", category: "enemy", index: 15, coins: [24, 28]},
    {name: "lola", category: "enemy", index: 16, coins: [29, 35]},
    {name: "bibi", category: "enemy", index: 17, coins: [30, 36]},
    {name: "mandy", category: "enemy", index: 18, coins: [31, 37]},
    {name: "ash", category: "enemy", index: 19, coins: [36, 44]},
    {name: "pearl", category: "enemy", index: 20, coins: [33, 39]},
    {name: "leon", category: "enemy", index: 21, coins: [48, 56]},
    {name: "bonnie", category: "enemy", index: 22, coins: [40, 48]},
    {name: "amber", category: "enemy", index: 23, coins: [65, 75]},
    {name: "max", category: "enemy", index: 24, coins: [52, 60]},
    {name: "meg", category: "enemy", index: 25, coins: [84, 96]},
    {name: "siegebase", category: "enemy", index: 28, coins: [320, 400]},
    {name: "spike", category: "player", index: 0, coins: [0, 0]},
    {name: "gus", category: "player", index: 1, coins: [0, 0]},
    {name: "emz", category: "player", index: 2, coins: [0, 0]},
    {name: "darryl", category: "player", index: 3, coins: [0, 0]},
    {name: "tara", category: "player", index: 4, coins: [0, 0]},
    {name: "piper", category: "player", index: 5, coins: [0, 0]},
    {name: "crow", category: "player", index: 6, coins: [0, 0]},
    {name: "stu", category: "player", index: 7, coins: [0, 0]},
    {name: "maisie", category: "player", index: 8, coins: [0, 0]},
    {name: "oldtown", category: "location", index: 2, coins: [0, 0]},
    {name: "biodome", category: "location", index: 3, coins: [0, 0]},
    {name: "ghoststation", category: "location", index: 4, coins: [0, 0]},
    {name: "snowtel", category: "location", index: 5, coins: [0, 0]},
    {name: "giftshop", category: "location", index: 6, coins: [0, 0]},
    {name: "retropolis", category: "location", index: 7, coins: [0, 0]},
    {name: "candyland", category: "location", index: 8, coins: [0, 0]},
    {name: "rumblejungle", category: "location", index: 9, coins: [0, 0]},
    {name: "stuntshow", category: "location", index: 10, coins: [0, 0]},
    {name: "supercity", category: "location", index: 11, coins: [0, 0]},
    {name: "arcade", category: "location", index: 12, coins: [0, 0]}
];

const masteryLevels = [
           0,     2000,     6000,    10000,    20000,    30000,
       40000,    60000,    80000,   120000,   180000,   240000,
      300000,   400000,   500000,   600000,   800000,  1000000,
     1200000,  1500000,  1800000,  2400000,  3000000,  4000000,
     5000000,  6000000,  8000000, 10000000, 12000000, 16000000,
    20000000,       -1
];

const levelImages = [
    {minLevel: 0, color: "#808080", image: "mastery_empty"},
    {minLevel: 1, color: "#d67d59", image: "mastery_level_0"},
    {minLevel: 4, color: "#ff9900", image: "mastery_level_1"},
    {minLevel: 8, color: "#c9c6f1", image: "mastery_level_2"},
    {minLevel: 12, color: "#ffef49", image: "mastery_level_3"},
    {minLevel: 16, color: "#33ffff", image: "mastery_level_4"},
    {minLevel: 20, color: "#ff00ff", image: "mastery_level_5"},
    {minLevel: 25, color: "#f75363", image: "mastery_level_6"},
    {minLevel: 30, color: "#a67fff", image: "mastery_level_7"}
];

const pointsRewards = [
    [8, 8, 8, 8],
    [10, 12, 12, 12],
    [12, 16, 16, 18],
    [16, 24, 32, 36],
    [20, 40, 64, 80],
    [24, 60, 160, 240],
    [12, 30, 80, 120],
    [20, 50, 120, 200],
    [30, 72, 180, 300],
    [48, 96, 300, 600]
];

const strengthRewards = [
    [    0,   1], [  100,   2], [  200,   3], [  300,   4], [  400,   5], [  500,   6],
    [  600,   8], [  700,  10], [  800,  12], [  900,  14], [ 1000,  16], [ 1100,  18],
    [ 1200,  20], [ 1400,  22], [ 1600,  25], [ 1800,  28], [ 2100,  32], [ 2400,  36],
    [ 2800,  40], [ 3200,  45], [ 3600,  50], [ 4000,  56], [ 4400,  64], [ 4800,  72],
    [ 5400,  80], [ 6000,  90], [ 6600, 105], [ 7200, 120], [ 8000, 140], [ 9000, 160],
    [10000, 200], [12000, 250]
];

/**
 * Gets the mastery points reward multiplier for a challenge based on its strength
 * @param strength challenge strength
 * @returns mastery multiplier
 */
function getStrengthReward(strength: number): number{
    if (strength < 0){
        return 0;
    }

    let x = 0;
    let reward = 0;
    while (x < strengthRewards.length && reward === 0){
        // Find the first strength reward bracket where the current strength is lower than the bracket minimum. That
        // bracket is 1 higher than the current strength reward bracket.
        if (x < strengthRewards.length - 1 && strength < strengthRewards[x + 1][0]){
            // Strength is not in the maximum reward bracket (it is between two brackets)
            // Index 0 is the strength required, index 1 is the points multiplier at that strength
            const min = strengthRewards[x];
            const max = strengthRewards[x + 1];
            if (max[0] > min[0]){
                const multiplier = min[1] + Math.floor((strength - min[0]) * ((max[1] - min[1]) / (max[0] - min[0])));
                reward = multiplier;
            }
        } else if (x >= strengthRewards.length - 1){
            // Strength is in the maximum reward bracket, the maximum reward is always given in this case
            reward = strengthRewards[x][1];
        }
        x++;
    }
    return reward;
}

export function getMasteryLevel(points: number): MasteryData{
    points = Math.floor(Math.max(0, points));

    const result: MasteryData = {
        level: -1,
        points: points,
        currentLevel: 0,
        nextLevel: 1,
        image: "",
        color: "#000000"
    };

    let x = 0;
    while (x < masteryLevels.length && result.level < 0){
        // Find the first level where the user does not have enough points. That level is 1 higher than the user's
        // current level. Levels are the same as indexes in the array.
        if (points < masteryLevels[x] || masteryLevels[x] < 0){
            if (x >= 1){
                // Points required to get to the current level
                result.currentLevel = masteryLevels[x - 1];
            }
            // Points required to get to the next level
            result.nextLevel = masteryLevels[x];
            result.level = x - 1;
        }
        x++;
    }

    x = 0;
    while (x < levelImages.length && result.image === ""){
        // Find the first index in levelImages where the user's level is not higher than the next index's minLevel.
        // This index contains the user's current level image and color. If the end of the array is reached without
        // finding an index then the user has the highest available image and color level.
        if (x >= levelImages.length - 1 || (x < levelImages.length - 1 && result.level < levelImages[x + 1].minLevel)){
            result.image = RESOURCE_IMAGE_DIR + levelImages[x].image + IMAGE_FILE_EXTENSION;
            result.color = levelImages[x].color;
        }
        x++;
    }

    return result;
}

function accessoryImageName(name: string): string{
    return `${ACCESSORY_IMAGE_DIR}accessory_${name}${IMAGE_FILE_EXTENSION}`;
}

/**
 * Searches the list of accessories for one that matches the given name.
 * @param name accessory name
 * @returns reference to the accessory object
 */
function getAccessoryByName(name: string): Accessory | undefined{
    let index = -1;
    for (let x = 0; x < accessories.length; x++){
        if (accessories[x].name === name){
            index = x;
        }
    }
    if (index < 0){
        return undefined;
    }
    return accessories[index];
}

export function getAccessoryPreview(name: string): AccessoryPreview | undefined{
    // Used for accessories in brawl boxes
    const a = getAccessoryByName(name);
    if (a === undefined){
        return undefined;
    }

    return {
        displayName: a.displayName,
        image: accessoryImageName(a.name),
        description: `Passive ability for Bullgame challenges: \n${a.description}`
    };
}

export function getAccessoryCollection(userAccessories: DatabaseAccessories): CollectionAccessory[]{
    // Used for accessories in the collection object
    const collection: CollectionAccessory[] = [];

    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];
        collection.push({
            name: a.name,
            displayName: a.displayName,
            image: accessoryImageName(a.name),
            unlocked: userAccessories.includes(a.name)
        });
    }

    return collection;
}

export function getAccessoryData(userAccessories: DatabaseAccessories, badges: DatabaseBadges): AccessoryData[]{
    // Used for the endpoint that gets the list of accessories
    const collection: AccessoryData[] = [];

    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];

        let badgeCount = 0;
        if (Object.hasOwn(badges, a.name) === true){
            badgeCount = Math.min(badges[a.name], a.badges);
        }

        collection.push({
            name: a.name,
            category: a.category,
            displayName: a.displayName,
            image: accessoryImageName(a.name),
            description: a.description,
            unlocked: userAccessories.includes(a.name),
            badge: {
                collected: badgeCount,
                required: a.badges,
                image: "",
                unlockMethod: a.unlock
            }
        });
    }

    return collection;
}

export function canClaimAccessory(userAccessories: DatabaseAccessories, badges: DatabaseBadges, name: string): boolean{
    const a = getAccessoryByName(name);
    if (a === undefined){
        return false;
    }

    if (Object.hasOwn(badges, a.name) === true){
        return userAccessories.includes(a.name) === false && badges[a.name] >= a.badges;
    }
    return false;
}

export function getBadgeRewardPreview(userAccessories: DatabaseAccessories, reward: Map<string, number>): BadgeReward[]{
    const preview: BadgeReward[] = [];

    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];
        // Only show progress towards accessories that are not unlocked
        if (userAccessories.includes(a.name) === false){
            const amount = reward.get(a.name);
            if (amount !== undefined){
                preview.push({
                    displayName: a.displayName,
                    unlock: a.unlock,
                    amount: amount
                });
            }
        }
    }

    return preview;
}

export function extractReportGameMode(data: number[]): number{
    // Gets the game mode from a valid report
    const format = REPORT_FORMAT;

    if (data.length !== format.length[1] - format.length[0]){
        return -1;
    }
    return data[format.mode[0]];
}

export function checkReportStrength(data: number[], expectedStrength: number): boolean{
    // Checks whether the challenge strength in a report matches the given value or is 0 (no reward)
    const format = REPORT_FORMAT;

    if (data.length !== format.length[1] - format.length[0]){
        return false;
    }
    return data[format.mode[0] + 1] === expectedStrength || data[format.mode[0] + 1] === 0;
}

export function extractReportPreviewStats(data: number[]): ReportPreview["stats"] | undefined{
    // Gets a report object that is only for displaying to the user
    // The report does not need to be validated because the report preview is only for displaying to the user and it is
    // never used to determine progression anywhere
    const format = REPORT_FORMAT;
    const p = format.player[0];

    if (data.length !== format.length[1] - format.length[0]){
        return undefined;
    }

    const win = data[format.score[0]] >= SCORE_CONSTANTS.maxScores.completion;
    const enemiesDefeated = data[format.achievements[0] + 1];

    const selectedBrawler = data[p + 2];
    const brawler = {displayName: "", image: ""};
    if (selectedBrawler >= 0 && selectedBrawler < gameBrawlers.length){
        brawler.displayName = gameBrawlers[selectedBrawler].displayName;
        brawler.image = GAME_BRAWLER_IMAGE_DIR + gameBrawlers[selectedBrawler].image + IMAGE_FILE_EXTENSION;
    }

    // The index is always 1 less than the star power number, star power 0 means no star power used
    const starPower = {displayName: "No Star Power", image: ""};
    const spIndex = data[p + 3] - 1;
    if (spIndex >= 0 && spIndex < gameStarPowers.length){
        // Star power images are stored in the same directory as gear images
        starPower.displayName = gameStarPowers[spIndex].displayName;
        starPower.image = GAME_GEAR_IMAGE_DIR + gameStarPowers[spIndex].image + IMAGE_FILE_EXTENSION;
    }

    // This contains an array of the gear numbers the player used 
    const gearIndex = data.slice(format.gears[0], format.gears[1]);
    const gears: {displayName: string; image: string;}[] = [];
    for (let x = 0; x < gearIndex.length; x++){
        if (gearIndex[x] >= 0 && gearIndex[x] < gameGears.length){
            gears.push({
                displayName: gameGears[gearIndex[x]].displayName,
                image: GAME_GEAR_IMAGE_DIR + gameGears[gearIndex[x]].image + IMAGE_FILE_EXTENSION
            });
        }
    }

    const accsIndex = data.slice(format.accessories[0], format.accessories[1]);
    const accsUsed: {displayName: string; image: string;}[] = [];
    for (let x = 0; x < accsIndex.length; x++){
        if (accsIndex[x] >= 0 && accsIndex[x] < accessories.length){
            accsUsed.push({
                displayName: accessories[accsIndex[x]].displayName,
                image: `${ACCESSORY_IMAGE_DIR}accessory_${accessories[accsIndex[x]].name}${IMAGE_FILE_EXTENSION}`
            });
        }
    }

    return {
        score: data[p],
        enemies: enemiesDefeated,
        win: win,
        difficulty: (data[p + 1] < gameDifficulties.length ? gameDifficulties[data[p + 1]] : ""),
        brawler: brawler,
        starPower: starPower,
        gears: gears,
        accessories: accsUsed
    };
}

export function extractReportData(data: number[]): ReportData | undefined{
    // Gets a report object that the server uses, this object is not shown to the user
    const format = REPORT_FORMAT;
    const p = format.player[0];
    const s = format.score[0];
    const a = format.achievements[0];

    if (data.length !== format.length[1] - format.length[0]){
        return undefined;
    }

    const enemies = data.slice(format.enemies[0], format.enemies[1]);
    const win = data[s] >= SCORE_CONSTANTS.maxScores.completion;
    const difficulty = data[p + 1];
    const enemiesDefeated = data[a + 1];
    const gameMode = data[format.mode[0]];
    const accs = data.slice(format.accessories[0], format.accessories[1]);

    const visited = data.slice(format.visited[0], format.visited[1]);
    const stages = convertLevelReports(data.slice(format.levels[0], format.levels[1]));
    const len = Math.min(visited.length, stages.length);

    const visitedWins = new Set<number>();
    for (let x = 0; x < len; x++){
        if (stages[x].defeatedValue === stages[x].totalValue && stages[x].totalValue > 0){
            visitedWins.add(visited[x]);
        }
    }

    // Certain accessories increase the amount of coins and mastery points given
    let badgeMultiplier = 100;
    let pointsMultiplier = 100;
    let coinsMultiplier = 100;
    if (accs.includes(66) === true){
        pointsMultiplier = 120;
    }
    const coinsAccs = [102, 104, 106, 110, 115, 120, 125];
    // Accessories increasing coins are from 73 to 79. These do not stack so only the last accessory checked is used.
    for (let x = 0; x < coinsAccs.length; x++){
        if (accs.includes(73 + x) === true){
            coinsMultiplier = coinsAccs[x];
        }
    }

    let points = 0;
    if (gameMode === 0){
        // The number of points given is based on the difficulty. If the player lost, the points will be decreased
        // depending on how early in the game they lost.
        if (difficulty < pointsRewards.length && pointsRewards[difficulty].length >= 4){
            const m = pointsRewards[difficulty];
            if (win === true && visitedWins.size >= SCORE_CONSTANTS.stages.length){
                points = m[3];
            } else if (visitedWins.size >= 7){
                points = m[2];
            } else if (visitedWins.size >= 4){
                points = m[1];
            } else{
                points = m[0];
            }
        }
        // More enemy, player, and location badges are given on higher difficulty
        if (difficulty <= 4){
            badgeMultiplier = 200 + difficulty * 100;
        } else if (difficulty === 5){
            badgeMultiplier = 800;
        } else{
            badgeMultiplier = 600 + difficulty * 200 - 1200;
        }
    } else if (gameMode === 2){
        // For challenges, mastery rewards depend on the overall strength of the challenge
        // Badge rewards depend on the enemy strength tier (this value is stored in the difficulty)
        points = getStrengthReward(data[format.mode[0] + 1]);
        badgeMultiplier = 200 + difficulty * 200;
    }
    points = Math.floor(points * data[p] * pointsMultiplier / 100);

    let minCoins = 0;
    let maxCoins = 0;
    const badges = new Map<string, number>();

    for (let x = 0; x < badgeList.length; x++){
        const b = badgeList[x];
        let badgeCount = 0;

        if (b.category === "enemy"){
            if (b.index < enemies.length && enemies[b.index] > 0){
                badgeCount = enemies[b.index];
            }
        } else if (b.category === "player"){
            if (b.index === data[p + 2] && win === true){
                badgeCount = 1;
            }
        } else if (b.category === "location"){
            if (visitedWins.has(b.index) === true){
                badgeCount = 1;
            }
        }

        if (badgeCount > 0 && difficulty >= 0){
            badges.set(b.name, Math.floor(badgeCount * badgeMultiplier / 100));
        }

        if (b.coins[0] <= b.coins[1]){
            // Coin rewards are not affected by the difficulty
            minCoins += b.coins[0] * badgeCount;
            maxCoins += b.coins[1] * badgeCount;
        }
    }
    minCoins = Math.floor(minCoins * coinsMultiplier / 100);
    maxCoins = Math.floor(maxCoins * coinsMultiplier / 100);

    // Achivement badges depend on the values in the achievements section of the report

    // Win 100 times on any difficulty
    if (win === true){
        // If the completion score is maxed, the player won
        badges.set("wins", 1);
        // Win challenges
        if (gameMode === 2){
            badges.set("challenges", 1);
        }
    }
    // Defeat 50000 enemies
    if (enemiesDefeated > 0){
        // The player gets progress towards this achievement by defeating at least one enemy
        badges.set("enemies", enemiesDefeated);
    }

    // Some achievements are only available in the default game mode
    if (gameMode === 0 && win === true){
        // Win on difficulty 1
        if (difficulty === 0){
            badges.set("default1", 1);
        }
        // Win on difficulty 2
        if (difficulty === 1){
            badges.set("default2", 1);
            badges.set("default3", 1);
        }
        // Win on difficulty 3
        if (difficulty === 2){
            badges.set("default4", 1);
            badges.set("default5", 1);
        }
        // Win without moving
        if (data[a + 4] === 0){
            badges.set("nomove", 1);
        }
        // Win without purchasing upgrades or using gears
        if (data[a + 2] === 0){
            // First, check if the player used gears. If they did not use any, check upgrade levels.
            let upgraded = false;
            for (let x = format.upgrades[0]; x < format.upgrades[1]; x++){
                if (data[x] > 0){
                    upgraded = true;
                }
            }
            if (upgraded === false){
                badges.set("noupgrades", 1);
            }
        }
        // Win without taking any damage
        if (data[a + 3] === 0){
            badges.set("nodamage", 1);
        }
        // Win in under 90 seconds
        if (data[a] < 90000){
            badges.set("fastwin", 1);
        }
        // Get a perfect score
        if (data[p] >= 600){
            // Get a score of 600 on difficulty 6
            if (difficulty === 5){
                badges.set("perfect1", 1);
            }
            // Get a score of 600 on difficulty 10
            if (difficulty === 9){
                badges.set("perfect2", 1);
            }
        }
    }

    return {
        gameMode: gameMode,
        player: {
            difficulty: difficulty,
            brawler: data[p + 2],
            starPower: data[p + 3],
            gears: data.slice(format.gears[0], format.gears[1]),
            accessories: accs
        },
        score: {
            win: win,
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
        enemies: enemiesDefeated,
        coins: [minCoins, maxCoins],
        points: points,
        badges: badges
    };
}
