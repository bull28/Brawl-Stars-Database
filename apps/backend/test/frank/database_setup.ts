import mysql2, {Connection, ConnectionOptions, Pool} from "mysql2/promise";
import staticChallenges from "../../frank/data/static_challenges_data";
import randomChallenges from "../../frank/data/random_challenges_data";
import itemList from "../../frank/data/trials_items_data.json";
import {signToken} from "../../frank/modules/account_module";
import {databaseLogin, tables} from "../../frank/modules/database_access";
import {GameReport, TrialData} from "../../frank/types";

const testDatabaseLogin: ConnectionOptions = {
    host: databaseLogin.host,
    port: databaseLogin.port,
    user: databaseLogin.user,
    password: databaseLogin.password,
    database: databaseLogin.database
};

export const tokens = {
    database: signToken("database").token,
    account: signToken("account").token,
    accountUpdate: signToken("accountUpdate").token,
    report: signToken("report").token,
    accessories: signToken("accessory").token,
    resources: signToken("resources").token,
    challenges: signToken("challenges").token,
    trials: signToken("trials").token
};

export const GAME_VERSION = (104 << 16) + 144;
export const sampleGameReport: GameReport = [
    GAME_VERSION, 1, // Version
    0, // Game Mode
    500, 5, 0, 0, 1, // Player
    0, 1, // Gears
    //-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // Accessories
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Accessories
    300, 150, 0, 50, 0, 0, // Overall Score
    11, 600000, 567, 0, 0, 0, 0, 1, // Achievements
    0, 0, 0, // Resources
    16, 10, 6, 6, 6, 6, 5, 4, // Upgrades
    8, 10, 12, 15, 18, 21, 24, 24, // Enemy Stats
    0, 1, 2, 3, 7, 8, 12, 13, // Visited Levels
    20, 20, 1000, 0, 0, 0, // Level Reports
    36, 36, 1000, 0, 0, 0,
    48, 48, 1000, 0, 0, 0,
    52, 52, 1000, 0, 0, 0,
    72, 72, 1000, 0, 0, 0,
    80, 80, 1000, 0, 0, 0,
    115, 115, 1000, 0, 0, 0,
    144, 144, 1000, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Enemies
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

export const TEST_STATIC_ID = "statictest";
export const TEST_RANDOM_ID = "randomtest";
export const TEST_TRIAL_ID = "trialtest";

// This challenge is only for testing and should not be playable by real users
staticChallenges.set(TEST_STATIC_ID, {
    config: {
        displayName: "Test Static Challenge",
        baseWinMastery: [3, 6],
        baseLossMastery: [2, 4],
        baseCoins: [2, 2],
        baseBadges: [2, 3],
        recommendedLvl: 0
    },
    gameMod: {
        options: {
            gameMode: 0,
            bonusResources: false
        },
        difficulties: [
            {
                difficultyid: 6,
                name: "Test Difficulty",
                countTier: 0,
                strengthTier: 2,
                healthBonusReq: 0.5,
                timePerEnemy: 0.75,
                enemyStats: [8, 10, 12]
            }
        ],
        stages: [
            {completion: 100, time: 50, powerReward: 15, gearsReward: 100},
            {completion: 100, time: 50, powerReward: 25, gearsReward: 100},
            {completion: 100, time: 50, powerReward: 0, gearsReward: 0}
        ],
        levels: [
            {
                levelid: 0,
                waves: [
                    {names: [["firstmeteor"]], multiple: []},
                    {names: [], multiple: [{name: "meteor", count: [1]}, {name: "meleerobot", count: [1]}], delay: 1},
                    {names: [["shelly", "colt"]], multiple: [], delay: 2, maxEnemies: 10},
                    {names: [[], [], ["rt"]], multiple: [{name: "rangedrobot", count: [0, 1]}, {name: "fastrobot", count: [0, 1]}], delay: 5, maxEnemies: 2}
                ],
                background: "entrance",
                displayName: "Starr Park Entrance",
                stages: [0],
                destination: 0
            },
            {
                levelid: 1,
                waves: [
                    {names: [], multiple: [{name: "meleerobot", count: [0, 0, 1]}, {name: "rangedrobot", count: [0, 2]}, {name: "fastrobot", count: [2]}]},
                    {names: [["shelly", "colt"]], multiple: [], delay: 5, maxEnemies: 10},
                    {names: [[], [], ["r10"]], multiple: [], delay: 5, maxEnemies: 2},
                    {names: [["rt", "elprimo"]], multiple: [], delay: 1}
                ],
                background: "hub",
                displayName: "Starr Park Hub",
                stages: [1],
                destination: 0
            },
            {
                levelid: 2,
                waves: [
                    {names: [], multiple: [{name: "meteor", count: [3]}, {name: "r2", count: [2]}]},
                    {names: [[], ["r8"], ["r4"]], multiple: [], delay: 4, maxEnemies: 10},
                    {names: [["r12"], [], ["r8"]], multiple: [], delay: 6, maxEnemies: 2},
                    {names: [["8bit"]], multiple: [], delay: 1},
                    {names: [["belle"]], multiple: [], delay: 4, maxEnemies: 1}
                ],
                background: "oldtown",
                displayName: "Old Town",
                stages: [2],
                destination: 0
            }
        ],
        maxScores: {
            completion: 300, time: 150, destination: 0, health: 50, gear: 0, enemy: 0
        },
        playerUpgradeValues: {
            health: {
                cost: [3, 3, 3, 3, 4],
                maxLevel: 5
            },
            damage: {
                cost: [3, 3, 3, 3, 4],
                maxLevel: 5
            },
            healing: {
                cost: [4, 4, 5],
                maxLevel: 3
            },
            speed: {
                cost: [5, 6, 8],
                maxLevel: 3
            },
            ability: {
                cost: [6, 10, 14],
                maxLevel: 3
            },
            lifeSteal: {
                cost: [6, 8, 10],
                maxLevel: 3
            }
        }
    }
});

randomChallenges.set(TEST_RANDOM_ID, {
    config: {
        displayName: "Test Random Challenge", recommendedLvl: 0,
        baseWinMastery: [3], baseLossMastery: [2], baseCoins: [2], baseBadges: [2]
    },
    difficulty: {
        strengthTier: 0, healthBonusReq: 0, timePerEnemy: 1,
        completion: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        time: [18, 18, 18, 18, 18, 18, 18, 18, 18, 18]
    },
    stages: [
        [{index: 0}],
        [{index: 1}],
        [{index: 2}],
        [{index: 3}],
        [{index: 4}],
        [{index: 5}],
        [{index: 6}],
        [{index: 7}],
        [{index: 8}],
        [{index: 9}]
    ],
    location: 0,
    options: {level: 0, power: 10, accs: 2}
});

export function generateSampleTrial(): TrialData{
    const accessories: TrialData["accessories"] = [];
    const powerups: TrialData["powerups"] = [];
    for (let x = 0; x < itemList.length; x++){
        if (itemList[x].type === "accessory"){
            accessories.push(0);
        } else if (itemList[x].type === "powerup"){
            powerups.push(0);
        }
    }
    const tiers: TrialData["characterTiers"] = [
        0x000, 0x102, 0x601, 0x300, 0x00a, 0x612, 0x405, 0x50c, 0x001, 0x20a, 0x503, 0x50a
    ];
    const builds: TrialData["characterBuilds"] = [
        0x0000,// Index 0, nothing unlocked
        0x2513,// Index 2, star powers 1, 3, gears 0, 1, 4
        0x7e36 // Index 7, star powers 2, 3, gears 1, 2, 4, 5, accessory unlocked
    ];
    return {
        trialid: 1, level: 0, state: 0, progress: 2, selected: 0, scores: [504, 550, 0, 0],
        rewards: {lastScore: 500, coins: 25, mastery: 30, badges: 10, quality: 50, specialBoxes: 6},
        resources: {power: 28, gears: 6, accessories: 30, hyper: 69, credits: 16},
        upgrades: {health: 4, damage: 3, healing: 1, lifeSteal: 2, critical: 3, combo: 0, speed: 3, ability: 1},
        characterTiers: tiers, characterBuilds: builds, accessories: accessories, powerups: powerups, maxBuilds: 10
    };
}

export async function createConnection(): Promise<Connection>{
    if (process.env["NODE_ENV"] !== "test"){
        throw new Error("Server is not running in test mode.");
    }
    return mysql2.createConnection(testDatabaseLogin);
}

export async function closeConnection(connection: Connection): Promise<void>{
    return connection.end();
}

export async function createPool(): Promise<Pool>{
    if (process.env["NODE_ENV"] !== "test"){
        throw new Error("Server is not running in test mode.");
    }
    return mysql2.createPool(testDatabaseLogin);
}

export async function closePool(pool: Pool): Promise<void>{
    return pool.end();
}

export async function clearTables(connection: Connection): Promise<void>{
    if (process.env["NODE_ENV"] !== "test"){
        throw new Error("Server is not running in test mode.");
    }

    const queries = Object.values(tables).map((value) => `DELETE FROM ${value};`)
    .concat([tables.users].map((value) => `ALTER TABLE ${value} AUTO_INCREMENT = 1;`));
    const promises = queries.map((value) => connection.query(value));
    await Promise.all(promises);
    await connection.query(`DELETE FROM ${tables.users};`);
    console.log("Cleared database tables.");
}
