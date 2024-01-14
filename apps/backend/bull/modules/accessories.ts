import {ACCESSORY_IMAGE_DIR, IMAGE_FILE_EXTENSION, GAME_GEAR_IMAGE_DIR, GAME_BRAWLER_IMAGE_DIR, gameDifficulties, gameBrawlers, gameGears} from "../data/constants";
import {DatabaseAccessories, DatabaseBadges, CollectionAccessory, AccessoryPreview, AccessoryData, GameReport, ReportData, ReportPreview} from "../types";

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
    levels: [33, 81], enemies: [81, 106], length: [0, 106]
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
        {name: "hank", index: 22, score: 6},
        {name: "buster", index: 23, score: 14}
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
                multiplier = ((9/28*(t-0.5))*(t-0.5) - 121/112)*(t-0.5) + 1.5;
            } else if (t < 2){
                multiplier = ((-1/7*(t-1) + 27/56)*(t-1) - 47/56)*(t-1) + 1;
            } else if (t < 3){
                multiplier = (3/56*(t-2) - 17/56)*(t-2) + 0.5;
            } else if (t < 5){
                multiplier = ((-1/112*(t-3) + 3/56)*(t-3) - 11/56)*(t-3) + 0.25;
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
    // Last updated: version 67

    if (report.length !== 3){
        // Invalid report length
        return false;
    }
    if (report[0] < 67){
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

interface Accessory{
    name: string;
    category: string;
    displayName: string;
    image: string;
    badges: number;
}
const accessories: Accessory[] = [
    {name: "shelly", category: "enemy", displayName: "", image: "accessory_shelly", badges: 500},
    {name: "colt", category: "enemy", displayName: "", image: "accessory_colt", badges: 500},
    {name: "rt", category: "enemy", displayName: "", image: "accessory_rt", badges: 500},
    {name: "elprimo", category: "enemy", displayName: "", image: "accessory_elprimo", badges: 500},
    {name: "8bit", category: "enemy", displayName: "", image: "accessory_8bit", badges: 500},
    {name: "belle", category: "enemy", displayName: "", image: "accessory_belle", badges: 500},
    {name: "jessie", category: "enemy", displayName: "", image: "accessory_jessie", badges: 500},
    {name: "eve", category: "enemy", displayName: "", image: "accessory_eve", badges: 500},
    {name: "mortis", category: "enemy", displayName: "", image: "accessory_mortis", badges: 500},
    {name: "frank", category: "enemy", displayName: "", image: "accessory_frank", badges: 500},
    {name: "bea", category: "enemy", displayName: "", image: "accessory_bea", badges: 500},
    {name: "colette", category: "enemy", displayName: "", image: "accessory_colette", badges: 500},
    {name: "lola", category: "enemy", displayName: "", image: "accessory_lola", badges: 500},
    {name: "bibi", category: "enemy", displayName: "", image: "accessory_bibi", badges: 500},
    {name: "mandy", category: "enemy", displayName: "", image: "accessory_mandy", badges: 500},
    {name: "ash", category: "enemy", displayName: "", image: "accessory_ash", badges: 500},
    {name: "bonnie", category: "enemy", displayName: "", image: "accessory_bonnie", badges: 500},
    {name: "amber", category: "enemy", displayName: "", image: "accessory_amber", badges: 500},
    {name: "max", category: "enemy", displayName: "", image: "accessory_max", badges: 500},
    {name: "meg", category: "enemy", displayName: "", image: "accessory_meg", badges: 500},
    {name: "spike", category: "player", displayName: "", image: "accessory_spike", badges: 100},
    {name: "gus", category: "player", displayName: "", image: "accessory_gus", badges: 100},
    {name: "emz", category: "player", displayName: "", image: "accessory_emz", badges: 100},
    {name: "darryl", category: "player", displayName: "", image: "accessory_darryl", badges: 100},
    {name: "tara", category: "player", displayName: "", image: "accessory_tara", badges: 100},
    {name: "piper", category: "player", displayName: "", image: "accessory_piper", badges: 100},
    {name: "crow", category: "player", displayName: "", image: "accessory_crow", badges: 100},
    {name: "player8", category: "player", displayName: "", image: "", badges: 100},
    {name: "player9", category: "player", displayName: "", image: "", badges: 100},
    {name: "oldtown", category: "location", displayName: "", image: "accessory_oldtown", badges: 250},
    {name: "warehouse", category: "location", displayName: "", image: "accessory_warehouse", badges: 250},
    {name: "ghoststation", category: "location", displayName: "", image: "accessory_ghoststation", badges: 250},
    {name: "giftshop", category: "location", displayName: "", image: "accessory_giftshop", badges: 250},
    {name: "retropolis", category: "location", displayName: "", image: "accessory_retropolis", badges: 250},
    {name: "candyland", category: "location", displayName: "", image: "accessory_candyland", badges: 250},
    {name: "stuntshow", category: "location", displayName: "", image: "accessory_stuntshow", badges: 250},
    {name: "supercity", category: "location", displayName: "", image: "accessory_supercity", badges: 250},
    {name: "arcade", category: "location", displayName: "", image: "accessory_arcade", badges: 250},
    {name: "wins", category: "achievement", displayName: "", image: "accessory_wins", badges: 100},
    {name: "enemies", category: "achievement", displayName: "", image: "accessory_enemies", badges: 50000},
    {name: "nomove", category: "achievement", displayName: "", image: "accessory_nomove", badges: 1},
    {name: "noupgrades", category: "achievement", displayName: "", image: "accessory_noupgrades", badges: 1},
    {name: "nodamage", category: "achievement", displayName: "", image: "accessory_nodamage", badges: 1},
    {name: "fastwin", category: "achievement", displayName: "", image: "accessory_fastwin", badges: 1},
    {name: "perfect", category: "achievement", displayName: "", image: "accessory_perfect", badges: 1},
    {name: "mastery1", category: "mastery", displayName: "", image: "accessory_mastery1", badges: 1},
    {name: "mastery2", category: "mastery", displayName: "", image: "accessory_mastery2", badges: 1},
    {name: "mastery3", category: "mastery", displayName: "", image: "accessory_mastery3", badges: 1},
    {name: "mastery4", category: "mastery", displayName: "", image: "accessory_mastery4", badges: 1},
    {name: "mastery5", category: "mastery", displayName: "", image: "accessory_mastery5", badges: 1}
];

interface BadgeStorage{
    name: string;
    category: string;
    index: number;
    coins: [number, number];
}
const badgeList: BadgeStorage[] = [
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
    {name: "mortis", category: "enemy", index: 10, coins: [19, 23]},
    {name: "frank", category: "enemy", index: 11, coins: [22, 26]},
    {name: "bea", category: "enemy", index: 12, coins: [23, 27]},
    {name: "colette", category: "enemy", index: 13, coins: [24, 28]},
    {name: "lola", category: "enemy", index: 14, coins: [29, 35]},
    {name: "bibi", category: "enemy", index: 15, coins: [31, 37]},
    {name: "mandy", category: "enemy", index: 16, coins: [33, 39]},
    {name: "ash", category: "enemy", index: 17, coins: [36, 44]},
    {name: "bonnie", category: "enemy", index: 18, coins: [40, 48]},
    {name: "amber", category: "enemy", index: 19, coins: [65, 75]},
    {name: "max", category: "enemy", index: 20, coins: [50, 58]},
    {name: "meg", category: "enemy", index: 21, coins: [84, 96]},
    {name: "spike", category: "player", index: 0, coins: [0, 0]},
    {name: "gus", category: "player", index: 1, coins: [0, 0]},
    {name: "emz", category: "player", index: 2, coins: [0, 0]},
    {name: "darryl", category: "player", index: 3, coins: [0, 0]},
    {name: "tara", category: "player", index: 4, coins: [0, 0]},
    {name: "piper", category: "player", index: 5, coins: [0, 0]},
    {name: "crow", category: "player", index: 6, coins: [0, 0]},
    {name: "oldtown", category: "location", index: 2, coins: [0, 0]},
    {name: "warehouse", category: "location", index: 3, coins: [0, 0]},
    {name: "ghoststation", category: "location", index: 4, coins: [0, 0]},
    {name: "giftshop", category: "location", index: 5, coins: [0, 0]},
    {name: "retropolis", category: "location", index: 6, coins: [0, 0]},
    {name: "candyland", category: "location", index: 7, coins: [0, 0]},
    {name: "stuntshow", category: "location", index: 8, coins: [0, 0]},
    {name: "supercity", category: "location", index: 9, coins: [0, 0]},
    {name: "arcade", category: "location", index: 10, coins: [0, 0]}
];

export function getAccessoryPreview(name: string): AccessoryPreview | undefined{
    let index = -1;
    for (let x = 0; x < accessories.length; x++){
        if (accessories[x].name === name){
            index = x;
        }
    }
    if (index < 0){
        return undefined;
    }

    return {
        //name: accessories[index].name,
        //category: accessories[index].category,
        displayName: accessories[index].displayName,
        image: ACCESSORY_IMAGE_DIR + accessories[index].image + IMAGE_FILE_EXTENSION,
        //badges: accessories[index].badges
        description: "Rare drop from nothing"
    };
}

export function getAccessoryCollection(userAccessories: DatabaseAccessories): CollectionAccessory[]{
    const collection: CollectionAccessory[] = [];
    
    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];
        collection.push({
            name: a.name,
            displayName: a.displayName,
            image: ACCESSORY_IMAGE_DIR + a.image + IMAGE_FILE_EXTENSION,
            unlocked: userAccessories.includes(a.name)
        });
    }

    return collection;
}

export function getAccessoryData(userAccessories: DatabaseAccessories, badges: DatabaseBadges): AccessoryData[]{
    const collection: AccessoryData[] = [];

    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];

        let badgeCount = 0;
        if (Object.hasOwn(badges, a.name) === true){
            badgeCount = badges[a.name];
        }

        collection.push({
            name: a.name,
            category: a.category,
            displayName: a.displayName,
            image: ACCESSORY_IMAGE_DIR + a.image + IMAGE_FILE_EXTENSION,
            unlocked: userAccessories.includes(a.name),
            badgesCollected: badgeCount,
            badgesRequired: a.badges,
            badgeImage: ""
        });
    }

    return collection;
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

    const selectedBrawler = data[p + 2];
    let brawler = {displayName: "", image: ""};
    if (selectedBrawler >= 0 && selectedBrawler < gameBrawlers.length){
        brawler.displayName = gameBrawlers[selectedBrawler].displayName;
        brawler.image = GAME_BRAWLER_IMAGE_DIR + gameBrawlers[selectedBrawler].image + IMAGE_FILE_EXTENSION;
    }

    // This contains an array of the gear numbers the player used 
    const gearIndex = data.slice(format.gears[0], format.gears[1]);

    let gears: {displayName: string; image: string;}[] = [];
    for (let x = 0; x < gearIndex.length; x++){
        if (gearIndex[x] >= 0 && gearIndex[x] < gameGears.length){
            gears.push({
                displayName: gameGears[gearIndex[x]].displayName,
                image: GAME_GEAR_IMAGE_DIR + gameGears[gearIndex[x]].image + IMAGE_FILE_EXTENSION
            });
        }
    }
    
    return {
        score: data[p],
        difficulty: (data[p + 1] < gameDifficulties.length ? gameDifficulties[data[p + 1]] : ""),
        brawler: brawler,
        starPower: data[p + 3],
        gears: gears
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
    const visited = data.slice(format.visited[0], format.visited[1]);
    const win = data[s] >= SCORE_CONSTANTS.maxScores.completion;
    const difficulty = data[p + 1];
    const enemiesDefeated = data[a + 1];

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
            if (visited.includes(b.index) === true){
                badgeCount = 1;
            }
        }

        if (badgeCount > 0 && difficulty >= 0){
            // More enemy, player, and location badges are given on higher difficulty
            let multiplier = 1;
            if (difficulty <= 4){
                multiplier = 2 + difficulty;
            } else{
                multiplier = 6 + difficulty * 2 - 8;
            }
            badges.set(b.name, Math.floor(badgeCount * multiplier));
        }

        if (b.coins[0] <= b.coins[1]){
            // Coin rewards are not affected by the difficulty
            minCoins += b.coins[0] * badgeCount;
            maxCoins += b.coins[1] * badgeCount;
        }
    }
    
    // Achivement badges depend on the values in the achievements section of the report

    // Win 100 times on any difficulty
    if (win === true){
        // If the completion score is maxed, the player won
        badges.set("wins", 1);
    }
    // Defeat 50000 enemies
    if (enemiesDefeated > 0){
        // The player gets progress towards this achievement by defeating at least one enemy
        badges.set("enemies", enemiesDefeated);
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
    if (data[a] < 90){
        badges.set("fastwin", 1);
    }
    // Get a score of 600 on difficulty 6
    if (data[p] >= 600 && difficulty >= 5){
        badges.set("perfect", 1);
    }

    return {
        player: {
            difficulty: difficulty,
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
        enemies: enemiesDefeated,
        coins: [minCoins, maxCoins],
        badges: badges
    };
}
