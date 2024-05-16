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
    unlock: string;
    badges: number;
}

const REPORT_FORMAT = {
    mode: [0, 1], player: [1, 5], gears: [5, 7], accessories: [7, 11], score: [11, 17],
    achievements: [17, 24], upgrades: [24, 30], stats: [30, 38], visited: [38, 46],
    levels: [46, 94], enemies: [94, 124], length: [0, 124]
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
    // Last updated: version 75

    if (report.length !== 3){
        // Invalid report length
        return false;
    }
    if (report[0] < 75){
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

    // The total enemies defeated cannot be more than 750
    const enemiesDefeated = data[format.achievements[0] + 1];
    if (enemiesDefeated > 750){
        return false;
    }

    // Accessories are not allowed on difficulty 5 or lower
    const accs = data.slice(format.accessories[0], format.accessories[1]);
    for (let x = 0; x < accs.length; x++){
        if (accs[x] >= 0 && difficulty <= 5){
            // Enable this when adding difficulties 6 - 9
            //valid = false;
        }
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
        // The upgrades cannot be more than each upgrade type limit
        const upgrades = data.slice(format.upgrades[0], format.upgrades[1]);
        const maxUpgrades = [16, 16, 10, 7, 5, 6];
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


const accessories: Accessory[] = [
    {name: "default1", category: "", displayName: "Supply Drop", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "default2", category: "", displayName: "Green Supply Drop", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "default3", category: "", displayName: "Red Supply Drop", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "default4", category: "", displayName: "Defensive Potion", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "default5", category: "", displayName: "Offensive Potion", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "shop1", category: "", displayName: "Healing Potion", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop2", category: "", displayName: "Life Steal Potion", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop3", category: "", displayName: "Strength Potion", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop4", category: "", displayName: "Speed Potion", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop5", category: "", displayName: "Nani's Drone", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop6", category: "", displayName: "Brock's Rocket Launcher", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop7", category: "", displayName: "Pam's Healing Station", unlock: "Buy from the Shop.", badges: 1},
    {name: "shop8", category: "", displayName: "Iron Wall", unlock: "Buy from the Shop.", badges: 1},
    {name: "brawlbox1", category: "", displayName: "Angelo's Bow", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox2", category: "", displayName: "Healing Skull", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox3", category: "", displayName: "Power Skull", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox4", category: "", displayName: "Sam's Knuckle Busters", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox5", category: "", displayName: "Doug's Hot Dog", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox6", category: "", displayName: "Buster's Projector", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "brawlbox7", category: "", displayName: "Ability Juice", unlock: "Unlock from Brawl Boxes.", badges: 1},
    {name: "shelly", category: "enemy", displayName: "Shelly's Shotgun", unlock: "Defeat Shelly enemies.", badges: 500},
    {name: "colt", category: "enemy", displayName: "Colt's Revolvers", unlock: "Defeat Colt enemies.", badges: 500},
    {name: "rt", category: "enemy", displayName: "R-T's Camera", unlock: "Defeat R-T enemies.", badges: 500},
    {name: "elprimo", category: "enemy", displayName: "El Primo's Belt", unlock: "Defeat El Primo enemies.", badges: 500},
    {name: "8bit", category: "enemy", displayName: "8-Bit's Turret", unlock: "Defeat 8-Bit enemies.", badges: 500},
    {name: "belle", category: "enemy", displayName: "Belle's Rifle", unlock: "Defeat Belle enemies.", badges: 500},
    {name: "jessie", category: "enemy", displayName: "Jessie's Backpack", unlock: "Defeat Jessie enemies.", badges: 500},
    {name: "eve", category: "enemy", displayName: "Eve's Spaceship", unlock: "Defeat Eve enemies.", badges: 500},
    {name: "mortis", category: "enemy", displayName: "Mortis's Shovel", unlock: "Defeat Mortis enemies.", badges: 500},
    {name: "frank", category: "enemy", displayName: "Frank's Hammer", unlock: "Defeat Frank enemies.", badges: 500},
    {name: "jacky", category: "enemy", displayName: "Jacky's Drill", unlock: "Defeat Jacky enemies.", badges: 500},
    {name: "mrp", category: "enemy", displayName: "Mr. P's Suitcase", unlock: "Defeat Mr. P enemies.", badges: 500},
    {name: "bea", category: "enemy", displayName: "Bea's Bee", unlock: "Defeat Bea enemies.", badges: 500},
    {name: "colette", category: "enemy", displayName: "Colette's Scrapbook", unlock: "Defeat Colette enemies.", badges: 500},
    {name: "lola", category: "enemy", displayName: "Lola's Scarf", unlock: "Defeat Lola enemies.", badges: 500},
    {name: "bibi", category: "enemy", displayName: "Bibi's Bat", unlock: "Defeat Bibi enemies.", badges: 500},
    {name: "mandy", category: "enemy", displayName: "Mandy's Candy Dispenser", unlock: "Defeat Mandy enemies.", badges: 500},
    {name: "ash", category: "enemy", displayName: "Ash's Broom", unlock: "Defeat Ash enemies.", badges: 500},
    {name: "pearl", category: "enemy", displayName: "Pearl's Cookie", unlock: "Defeat Pearl enemies.", badges: 500},
    {name: "leon", category: "enemy", displayName: "Leon's Lollipop", unlock: "Defeat Leon enemies.", badges: 500},
    {name: "bonnie", category: "enemy", displayName: "Bonnie's Cannon", unlock: "Defeat Bonnie enemies.", badges: 500},
    {name: "amber", category: "enemy", displayName: "Amber's Fire Staff", unlock: "Defeat Amber enemies.", badges: 500},
    {name: "max", category: "enemy", displayName: "Max's Energy Drink", unlock: "Defeat Max enemies.", badges: 500},
    {name: "meg", category: "enemy", displayName: "Meg's Mech", unlock: "Defeat Meg enemies.", badges: 500},
    {name: "spike", category: "player", displayName: "Spike's Cactus", unlock: "Win with Spike.", badges: 100},
    {name: "gus", category: "player", displayName: "Gus's Balloon", unlock: "Win with Gus.", badges: 100},
    {name: "emz", category: "player", displayName: "Emz's Spray", unlock: "Win with Emz.", badges: 100},
    {name: "darryl", category: "player", displayName: "Darryl's Barrel", unlock: "Win with Darryl.", badges: 100},
    {name: "tara", category: "player", displayName: "Tara's Cards", unlock: "Win with Tara.", badges: 100},
    {name: "piper", category: "player", displayName: "Piper's Umbrella", unlock: "Win with Piper.", badges: 100},
    {name: "crow", category: "player", displayName: "Crow's Daggers", unlock: "Win with Crow.", badges: 100},
    {name: "stu", category: "player", displayName: "Stu's Wheel", unlock: "Win with Stu.", badges: 100},
    {name: "maisie", category: "player", displayName: "Maisie's Metal Arm", unlock: "Win with Maisie.", badges: 100},
    {name: "oldtown", category: "location", displayName: "Barley's Bottle", unlock: "Complete levels at Old Town.", badges: 250},
    {name: "biodome", category: "location", displayName: "Rosa's Gloves", unlock: "Complete levels at Biodome.", badges: 250},
    {name: "ghoststation", category: "location", displayName: "Train Tickets", unlock: "Complete levels at Ghost Station.", badges: 250},
    {name: "snowtel", category: "location", displayName: "Lou's Ice Cream", unlock: "Complete levels at Snowtel.", badges: 250},
    {name: "giftshop", category: "location", displayName: "Gift Shop Shirt", unlock: "Complete levels at Gift Shop.", badges: 250},
    {name: "retropolis", category: "location", displayName: "Neon Light", unlock: "Complete levels at Retropolis.", badges: 250},
    {name: "candyland", category: "location", displayName: "Starr Candy", unlock: "Complete levels at Candyland.", badges: 250},
    {name: "rumblejungle", category: "location", displayName: "Nita's Bear Hat", unlock: "Complete levels at Rumble Jungle.", badges: 250},
    {name: "stuntshow", category: "location", displayName: "Janet's Microphone", unlock: "Complete levels at Stunt Show.", badges: 250},
    {name: "supercity", category: "location", displayName: "Surge's Energy Drink", unlock: "Complete levels at Super City.", badges: 250},
    {name: "arcade", category: "location", displayName: "Arcade Machine", unlock: "Complete levels at Arcade.", badges: 250},
    {name: "wins", category: "achievement", displayName: "Bull's Shotgun", unlock: "Win in any difficulty.", badges: 100},
    {name: "enemies", category: "achievement", displayName: "Omega Box", unlock: "Defeat enemies.", badges: 50000},
    {name: "challenges", category: "achievement", displayName: "Starr Drop", unlock: "Complete challenges.", badges: 100},
    {name: "nomove", category: "achievement", displayName: "Charlie's Cocoon", unlock: "Win without moving. Abilities are allowed.", badges: 1},
    {name: "noupgrades", category: "achievement", displayName: "Bling Stack", unlock: "Win without purchasing upgrades or using gears.", badges: 1},
    {name: "nodamage", category: "achievement", displayName: "Poco's Guitar", unlock: "Win without taking any damage.", badges: 1},
    {name: "fastwin", category: "achievement", displayName: "Fang's Shoe", unlock: "Win in under 90 seconds.", badges: 1},
    {name: "perfect1", category: "achievement", displayName: "Championship Trophy", unlock: "Get a score of 600 on difficulty 6.", badges: 1},
    {name: "perfect2", category: "achievement", displayName: "Hypercharged Token", unlock: "Get a score of 600 on difficulty 10.", badges: 1},
    {name: "mastery1", category: "", displayName: "Bronze Medal", unlock: "Reach Mastery Level 4.", badges: 1},
    {name: "mastery2", category: "", displayName: "Silver Medal", unlock: "Reach Mastery Level 8.", badges: 1},
    {name: "mastery3", category: "", displayName: "Gold Medal", unlock: "Reach Mastery Level 12.", badges: 1},
    {name: "mastery4", category: "", displayName: "Diamond Medal", unlock: "Reach Mastery Level 16.", badges: 1},
    {name: "mastery5", category: "", displayName: "Mythic Medal", unlock: "Reach Mastery Level 20.", badges: 1},
    {name: "mastery6", category: "", displayName: "Legendary Medal", unlock: "Reach Mastery Level 25.", badges: 1},
    {name: "mastery7", category: "", displayName: "Masters Medal", unlock: "Reach Mastery Level 30.", badges: 1}
];

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
    {minLevel: 6, color: "#ff9900", image: "mastery_level_1"},
    {minLevel: 12, color: "#c9c6f1", image: "mastery_level_2"},
    {minLevel: 18, color: "#ffef49", image: "mastery_level_3"},
    {minLevel: 24, color: "#33ffff", image: "mastery_level_4"},
    {minLevel: 30, color: "#ff00ff", image: "mastery_level_5"}
];

const pointsRewards = [
    [8, 8, 8, 8],
    [10, 12, 12, 12],
    [12, 16, 16, 18],
    [16, 24, 32, 36],
    [20, 40, 64, 80],
    [24, 60, 160, 240],
    [120, 120, 120, 120],
    [200, 200, 200, 200],
    [300, 300, 300, 300],
    [600, 600, 600, 600]
];

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
        image: `${ACCESSORY_IMAGE_DIR}accessory_${a.name}${IMAGE_FILE_EXTENSION}`,
        description: "This item increases your collection score."
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
            image: `${ACCESSORY_IMAGE_DIR}accessory_${a.name}${IMAGE_FILE_EXTENSION}`,
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
            image: `${ACCESSORY_IMAGE_DIR}accessory_${a.name}${IMAGE_FILE_EXTENSION}`,
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

    const visited = data.slice(format.visited[0], format.visited[1]);
    const stages = convertLevelReports(data.slice(format.levels[0], format.levels[1]));
    const len = Math.min(visited.length, stages.length);

    const visitedWins = new Set<number>();
    for (let x = 0; x < len; x++){
        if (stages[x].defeatedValue === stages[x].totalValue && stages[x].totalValue > 0){
            visitedWins.add(visited[x]);
        }
    }

    let points = 0;
    let badgeMultiplier = 1;
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
            badgeMultiplier = 2 + difficulty;
        } else if (difficulty === 5){
            badgeMultiplier = 8;
        } else{
            badgeMultiplier = 6 + difficulty * 2 - 12;
        }
    } else if (gameMode === 2){
        // For challenges, points and badges given depend on the strength of the challenge
        points = 1;
        badgeMultiplier = 2;
    }
    points = Math.floor(points * data[p]);

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
            badges.set(b.name, Math.floor(badgeCount * badgeMultiplier));
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
        // Get a score of 600 on difficulty 6
        if (data[p] >= 600 && difficulty === 5){
            badges.set("perfect", 1);
        }
    }

    return {
        gameMode: gameMode,
        player: {
            difficulty: difficulty,
            brawler: data[p + 2],
            starPower: data[p + 3],
            gears: data.slice(format.gears[0], format.gears[1]),
            accessories: data.slice(format.accessories[0], format.accessories[1])
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
        points: points,
        badges: badges
    };
}
