import {GameReport, ReportData} from "../types";

interface ScorePerformance{
    defeatedValue: number;
    totalValue: number;
    timeSpent: number;
    destination: number;
    healthPenalty: number;
    gearScore: number;
}

const REPORT_FORMAT = {
    version: [0, 2], mode: [2, 3], player: [3, 8], gears: [8, 10], accessories: [10, 20],
    score: [20, 26], achievements: [26, 33], resources: [33, 36], upgrades: [36, 43],
    stats: [43, 51], visited: [51, 59], levels: [59, 107], enemies: [107, 140], length: [0, 140]
};
const SCORE_CONSTANTS = {
    stages: [
        {completion: 10, time: 0},
        {completion: 15, time: 15},
        {completion: 20, time: 15},
        {completion: 30, time: 20},
        {completion: 45, time: 20},
        {completion: 60, time: 25},
        {completion: 60, time: 25},
        {completion: 60, time: 30}
    ],
    maxScores: {completion: 300, time: 150, destination: 50, health: 50, gear: 30, enemy: 20},
    bonusEnemies: [
        {name: "mico", index: 30, score: 6},
        {name: "buster", index: 31, score: 14}
    ]
};

const badgeList = [
    {name: "meteor", category: "enemy", index: 0, coins: [8, 8]},
    {name: "robot", category: "enemy", index: 1, coins: [16, 16]},
    {name: "shelly", category: "enemy", index: 2, coins: [30, 34]},
    {name: "colt", category: "enemy", index: 3, coins: [46, 50]},
    {name: "rt", category: "enemy", index: 4, coins: [50, 54]},
    {name: "elprimo", category: "enemy", index: 5, coins: [60, 68]},
    {name: "8bit", category: "enemy", index: 6, coins: [64, 72]},
    {name: "belle", category: "enemy", index: 7, coins: [68, 76]},
    {name: "jessie", category: "enemy", index: 8, coins: [72, 80]},
    {name: "eve", category: "enemy", index: 9, coins: [76, 84]},
    {name: "mortis", category: "enemy", index: 10, coins: [80, 88]},
    {name: "frank", category: "enemy", index: 11, coins: [96, 104]},
    {name: "jacky", category: "enemy", index: 12, coins: [84, 92]},
    {name: "mrp", category: "enemy", index: 13, coins: [100, 108]},
    {name: "bea", category: "enemy", index: 14, coins: [88, 96]},
    {name: "lola", category: "enemy", index: 15, coins: [104, 112]},
    {name: "bo", category: "enemy", index: 16, coins: [108, 116]},
    {name: "colette", category: "enemy", index: 17, coins: [112, 120]},
    {name: "pearl", category: "enemy", index: 18, coins: [132, 148]},
    {name: "bibi", category: "enemy", index: 19, coins: [136, 152]},
    {name: "brock", category: "enemy", index: 20, coins: [140, 156]},
    {name: "chester", category: "enemy", index: 21, coins: [172, 188]},
    {name: "ollie", category: "enemy", index: 22, coins: [144, 160]},
    {name: "leon", category: "enemy", index: 23, coins: [212, 236]},
    {name: "bonnie", category: "enemy", index: 24, coins: [184, 200]},
    {name: "amber", category: "enemy", index: 25, coins: [272, 304]},
    {name: "melodie", category: "enemy", index: 26, coins: [244, 268]},
    {name: "kaze", category: "enemy", index: 27, coins: [336, 368]},
    {name: "max", category: "enemy", index: 28, coins: [228, 252]},
    {name: "meg", category: "enemy", index: 29, coins: [340, 380]},
    //{name: "siegebase", category: "enemy", index: 28, coins: [0, 0]},
    {name: "spike", category: "player", index: 0, coins: [0, 0]},
    {name: "gus", category: "player", index: 1, coins: [0, 0]},
    {name: "emz", category: "player", index: 2, coins: [0, 0]},
    {name: "darryl", category: "player", index: 3, coins: [0, 0]},
    {name: "tara", category: "player", index: 4, coins: [0, 0]},
    {name: "piper", category: "player", index: 5, coins: [0, 0]},
    {name: "lily", category: "player", index: 6, coins: [0, 0]},
    {name: "stu", category: "player", index: 7, coins: [0, 0]},
    {name: "maisie", category: "player", index: 8, coins: [0, 0]},
    {name: "oldtown", category: "location", index: 2, coins: [0, 0]},
    {name: "biodome", category: "location", index: 3, coins: [0, 0]},
    {name: "ghoststation", category: "location", index: 4, coins: [0, 0]},
    {name: "deepsea", category: "location", index: 5, coins: [0, 0]},
    {name: "giftshop", category: "location", index: 6, coins: [0, 0]},
    {name: "retropolis", category: "location", index: 7, coins: [0, 0]},
    {name: "candyland", category: "location", index: 8, coins: [0, 0]},
    {name: "rumblejungle", category: "location", index: 9, coins: [0, 0]},
    {name: "stuntshow", category: "location", index: 10, coins: [0, 0]},
    {name: "supercity", category: "location", index: 11, coins: [0, 0]},
    {name: "arcade", category: "location", index: 12, coins: [0, 0]},
    {name: "enchantedforest", category: "location", index: 14, coins: [0, 0]},
    {name: "odditiesshop", category: "location", index: 15, coins: [0, 0]}
];

const pointsRewards = [
    [8, 8, 8],
    [12, 12, 12],
    [18, 18, 18],
    [24, 36, 36],
    [32, 64, 80],
    [40, 120, 240],
    [40, 80, 120],
    [50, 120, 200],
    [60, 180, 300],
    [80, 320, 800]
];

const coinsRewards = [1, 1, 1.25, 1.25, 1.5, 2, 2, 3, 4, 5];
const bossCoins = [200, 300, 400, 600, 1000, 1600, 1000, 1600, 2400, 4000];

function convertLevelReports(reports: number[]): ScorePerformance[]{
    // Number of stages and number of score categories per stage
    const stages = SCORE_CONSTANTS.stages.length;
    const scores = Object.keys(SCORE_CONSTANTS.maxScores).length;

    if (reports.length !== stages * scores){
        return [];
    }

    const converted: ScorePerformance[] = [];
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
    const maxHealthPenalty = Math.max(80, 200 - stages.length * 40);
    for (let x = 0; x < stages.length; x++){
        if (x < levelReports.length){
            const report = levelReports[x];

            if (report.defeatedValue < report.totalValue){
                success = false;
            }

            totalHealthPenalty += Math.min(maxHealthPenalty, report.healthPenalty / 250);

            if (report.totalValue <= 0){
                score.completion += stages[x].completion;
            } else{
                score.completion += stages[x].completion * report.defeatedValue / report.totalValue;
            }
            score.destination += report.destination;
            score.gear += report.gearScore;

            const t = Math.max(2, report.timeSpent / 250);
            let multiplier = 0;
            if (t < 3){
                multiplier = ((-1*(t-2))*(t-2) - 2)*(t-2) + 60;
            } else if (t < 4){
                multiplier = ((-1*(t-3) - 3)*(t-3) - 5)*(t-3) + 57;
            } else if (t < 6){
                multiplier = ((2*(t-4) - 6)*(t-4) - 14)*(t-4) + 48;
            } else if (t < 8){
                multiplier = ((-1*(t-6) + 6)*(t-6) - 14)*(t-6) + 12;
            }
            score.time += Math.round(stages[x].time * multiplier * 6.25e7 / 3) / 1e9;
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
    const penaltyPercent = 100 - totalHealthPenalty + Math.min(80, stages.length * 8);
    score.completion = Math.min(maxScores.completion, Math.floor(score.completion));
    score.time = Math.min(maxScores.time, Math.floor(score.time));
    score.destination = Math.min(maxScores.destination, Math.floor(score.destination));
    score.gear = Math.min(maxScores.gear, Math.floor(score.gear));
    score.enemy = Math.min(maxScores.enemy, Math.max(0, totalEnemyBonus));
    score.health = Math.min(maxScores.health, Math.max(0, Math.floor(maxScores.health * penaltyPercent / 100)));

    return [score.completion, score.time, score.destination, score.health, score.gear, score.enemy];
}

export function validateReport(report: GameReport): number{
    // Last updated: version 102

    if (Array.isArray(report) === false){
        // Invalid report type
        return 1;
    }

    const data = report;// report[2] was the data object but data is now all in one array
    const format = REPORT_FORMAT;
    let valid = true;

    // All values in the report data must be integers
    for (let x = 0; x < data.length; x++){
        if (Number.isInteger(data[x]) === false){
            valid = false;
        }
    }
    if (valid === false){
        // Must return early because all other comparisons with the data require it to be integers
        return 2;
    }

    // The first number contains major version (16 bits), minor version (4 bits), and report length (12 bits)
    if ((report[0] >> 16) < 102){
        // Old report version
        return 3;
    }

    if (report[1] <= 0){
        // Invalid report time
        return 4;
    }

    if (data.length !== format.length[1] - format.length[0]){
        // Data length does not match the expected length for this version's format
        return 5;
    }

    if (data.length !== (report[0] & 4095)){
        // Data length does not match length in version
        return 6;
    }

    // These are simple checks that determine whether report data is definitely invalid. The upper bounds on the checks
    // are intentionally high so valid but rare cases are not rejected. Values above the upper bounds have no chance of
    // happening through normal gameplay and are guaranteed to be invalid. Many of the values here are set based on
    // various game mechanics. They need to be updated if those mechanics in the game are updated.

    // The game mode must be 0 or 2
    const gameMode = data[format.mode[0]];
    if (gameMode !== 0 && gameMode !== 2){
        return 7;
    }

    // The difficulty must be between 0 and 9
    const difficulty = data[format.player[0] + 1];
    if (difficulty < 0 || difficulty > 9){
        return 8;
    }

    // The character must be at least 0
    const character = data[format.player[0] + 2];
    if (character < 0){
        return 9;
    }

    // The tier must be at least 0
    const tier = data[format.player[0] + 3];
    if (tier < 0){
        return 10;
    }

    // The star power must be between 0 and 3
    const starPower = data[format.player[0] + 4];
    if (starPower < 0 || starPower > 3){
        return 11;
    }

    // The total enemies defeated cannot be more than 1000
    const enemiesDefeated = data[format.achievements[0] + 1];
    if (enemiesDefeated > 1000){
        return 12;
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
    if (valid === false){
        return 13;
    }

    // The visited levels must be unique and only certain values are allowed at certain indexes
    const visited = data.slice(format.visited[0], format.visited[1]);
    const visitedAllowed = [[0], [1], [2, 3, 4, 5], [3, 4, 5, 6], [7, 8, 9, 10], [8, 9, 10, 11], [12, 14, 15], [13]];
    if (visited.length < visitedAllowed.length){
        return 5;
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
    if (valid === false){
        return 14;
    }

    // The meteor and robot enemies should not be defeated more than 80 times
    // The brawler enemies should not be defeated more than 12 times
    // The special (boss and bonus) enemies should not be defeated more than once
    const brawlerOffset = format.enemies[0] + 2;
    const specialOffset = format.enemies[0] + 30;
    for (let x = format.enemies[0]; x < format.enemies[1]; x++){
        if (x < brawlerOffset){
            if (data[x] > 80){
                valid = false;
            }
        } else if (x < specialOffset){
            if (data[x] > 12){
                valid = false;
            }
        } else if (data[x] > 1){
            valid = false;
        }
    }
    if (valid === false){
        return 15;
    }

    if (gameMode === 0){
        // Accessories are not allowed on difficulty 5 or lower
        const accs = data.slice(format.accessories[0], format.accessories[1]);
        for (let x = 0; x < accs.length; x++){
            if (accs[x] >= 0 && difficulty <= 5){
                valid = false;
            }
        }
        if (valid === false){
            return 16;
        }

        // Character upgrades are not allowed on difficulty 5 or lower
        if (tier > 0 && difficulty <= 5){
            return 17;
        }

        // Hypercharges are not allowed on difficulty 5 or lower
        if (data[format.achievements[0] + 4] > 0 && difficulty <= 5){
            return 18;
        }

        // The upgrades cannot be more than each upgrade type limit
        const upgrades = data.slice(format.upgrades[0], format.upgrades[1]);
        const maxUpgrades = difficulty >= 6 ? [20, 16, 11, 11, 8, 14, 6] : [16, 12, 8, 8, 6, 10, 5];
        if (upgrades.length < maxUpgrades.length){
            return 6;
        }
        for (let x = 0; x < maxUpgrades.length; x++){
            if (upgrades[x] > maxUpgrades[x] || upgrades[x] < 0){
                valid = false;
            }
        }
        if (valid === false){
            return 19;
        }

        // Calculating the overall score from the level reports should equal the overall score calculated by the game
        let totalScore = 0;
        const finalScore = getFinalScore(data.slice(format.levels[0], format.levels[1]), data.slice(format.enemies[0], format.enemies[1]));
        if (finalScore.length !== format.score[1] - format.score[0]){
            return 6;
        }
        for (let x = 0; x < finalScore.length; x++){
            if (finalScore[x] !== data[format.score[0] + x]){
                valid = false;
            } else{
                totalScore += finalScore[x];
            }
        }
        if (valid === false || data[format.player[0]] !== totalScore){
            // The sum of all score categories should equal the sum calculated by the game
            return 20;
        }
    }

    return 0;
    //return valid;
}

export function extractReportData(data: GameReport): ReportData | undefined{
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
    let pointsMultiplier = 100;
    let coinsMultiplier = 100;
    let badgesMultiplier = 100;
    if (accs.includes(74) === true){
        badgesMultiplier = 150;
    }
    if (accs.includes(75) === true){
        pointsMultiplier = 150;
    }
    //const coinsAccs = [2, 4, 6, 10, 15, 20, 25, 30];
    const coinsAccs = [6, 8, 12, 15, 20, 24, 30, 40];
    // Accessories increasing coins are from 84 to 91
    for (let x = 0; x < coinsAccs.length; x++){
        if (accs.includes(84 + x) === true){
            coinsMultiplier += coinsAccs[x];
        }
    }

    let points = 0;
    let baseCoins = 0;
    let bonusCoins = 0;
    let baseBadges = 1;
    if (gameMode === 0){
        // The number of points given is based on the difficulty. If the player lost, the points will be decreased
        // depending on how early in the game they lost.
        if (difficulty < pointsRewards.length && pointsRewards[difficulty].length >= 3){
            const m = pointsRewards[difficulty];
            if (win === true && visitedWins.size >= SCORE_CONSTANTS.stages.length){
                points = m[2];
            } else if (visitedWins.size >= 4){
                points = m[1];
            } else{
                points = m[0];
            }
        }
        // More coins are given per enemy defeated on higher difficulty
        if (difficulty < coinsRewards.length){
            baseCoins = coinsRewards[difficulty];
        }
        // Defeating the boss (and completing the run) gives some extra coins
        if (win === true && difficulty < bossCoins.length){
            bonusCoins = bossCoins[difficulty];
        }
        // More enemy, player, and location badges are given on higher difficulty
        if (difficulty <= 4){
            baseBadges = 2 + difficulty;
        } else if (difficulty === 5){
            baseBadges = 8;
        } else{
            baseBadges = difficulty * 2 - 6;
        }
    } else if (gameMode === 2){
        // For challenges, mastery, coins, and badges rewards depend on the base mastery stored in the challenge config
        points = 1;
        baseCoins = 1;
    }
    //points = Math.floor(points * data[p] * pointsMultiplier / 100);
    points = Math.floor(points * data[p]);

    let minCoins = 0;
    let maxCoins = 0;
    // All badges in this map are affected by the difficulty multiplier
    const badges = new Map<string, number>();
    // All accessories in this set will only receive 1 badge
    const achievements = new Set<string>();

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
            badges.set(b.name, Math.floor(badgeCount * baseBadges));
        }

        if (b.coins[0] <= b.coins[1]){
            // Coin rewards are not affected by the difficulty
            minCoins += b.coins[0] * badgeCount;
            maxCoins += b.coins[1] * badgeCount;
        }
    }
    //minCoins = Math.floor((minCoins * baseCoins + bonusCoins) * coinsMultiplier / 100);
    //maxCoins = Math.floor((maxCoins * baseCoins + bonusCoins) * coinsMultiplier / 100);
    minCoins = Math.floor(minCoins * baseCoins + bonusCoins);
    maxCoins = Math.floor(maxCoins * baseCoins + bonusCoins);

    // Achivement badges depend on the values in the achievements section of the report

    // Win 100 times on any difficulty
    if (win === true){
        // If the completion score is maxed, the player won
        achievements.add("wins");
        // Win challenges
        if (gameMode === 2){
            achievements.add("challenges");
        }
    }
    // Defeat 50000 enemies
    if (enemiesDefeated > 0){
        // The player gets progress towards this achievement by defeating at least one enemy
        badges.set("enemies", enemiesDefeated);
    }

    // Some achievements are only available in the default game mode
    if (gameMode === 0 && win === true){
        // Win on difficulties 1, 2, or 3
        if (difficulty === 0){
            achievements.add("default1");
        } else if (difficulty === 1){
            achievements.add("default2");
            achievements.add("default3");
        } else if (difficulty === 2){
            achievements.add("default4");
            achievements.add("default5");
        }
        // Win without moving
        if (data[a + 6] === 0){
            achievements.add("nomove");
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
                achievements.add("noupgrades");
            }
        }
        // Win without taking any damage
        if (data[a + 5] === 0){
            achievements.add("nodamage");
        }
        // Win in under 90 seconds
        if (data[a] < 90000){
            achievements.add("fastwin");
        }
        // Win while using at least 20 max level combos
        if (data[a + 3] >= 20){
            achievements.add("usecombo");
        }
        // Get a perfect score
        if (data[p] >= 600){
            // Get a score of 600 on difficulties 6 or 10
            if (difficulty === 5){
                achievements.add("perfect1");
            } else if (difficulty === 9){
                achievements.add("perfect2");
            }
        }
    }

    return {
        gameMode: gameMode,
        player: {
            difficulty: difficulty,
            brawler: data[p + 2],
            upgradeTier: data[p + 3],
            starPower: data[p + 4],
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
        mastery: points,
        coins: [minCoins, maxCoins],
        badges: badges,
        achievements: achievements,
        multipliers: {
            mastery: pointsMultiplier,
            coins: coinsMultiplier,
            badges: badgesMultiplier
        }
    };
}
