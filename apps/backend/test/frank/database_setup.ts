import mysql2, {Connection, ConnectionOptions, Pool} from "mysql2/promise";
import challengeList from "../../frank/data/challenges_data";
import {signToken} from "../../frank/modules/account_module";
import {databaseLogin, tables} from "../../frank/modules/database_access";

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
};

export const sampleGameReport = [
    0, // Game Mode
    500, 5, 0, 0, 1, // Player
    0, 1, // Gears
    -1, -1, -1, -1, -1, // Accessories
    300, 150, 0, 50, 0, 0, // Overall Score
    600000, 567, 0, 0, 1, 0, 0, // Achievements
    16, 16, 10, 7, 5, 6, // Upgrades
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
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Enemies
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
export const GAME_VERSION = 83;

// This challenge is only for testing and should not be playable by real users
challengeList.set("test", {
    config: {
        displayName: "Test Challenge",
        baseWinMastery: [3, 6],
        baseLossMastery: [2, 4],
        baseCoins: [2, 2]
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
                enemyStats: [100.0, 125.0, 150.0]
            }
        ],
        stages: [
            {completion: 100, time: 50, powerReward: 15, gearsReward: 1},
            {completion: 100, time: 50, powerReward: 25, gearsReward: 1},
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
                stages: [0, 0],
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
                stages: [1, 1],
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
                stages: [2, 2],
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
