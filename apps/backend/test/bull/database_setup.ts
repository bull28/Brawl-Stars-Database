import mysql2, {Connection, ConnectionOptions, Pool} from "mysql2/promise";
import {signToken} from "../../bull/modules/authenticate";
import {databaseLogin, tables} from "../../bull/modules/database";

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
    collection: signToken("collection").token,
    tradesCreate: signToken("tradesCreate").token,
    tradesAccept: signToken("tradesAccept").token,
    report: signToken("report").token,
    accessory: signToken("accessory").token,
    challenge: signToken("challenge").token,
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
export const GAME_VERSION = 82;

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
    .concat([tables.trades, tables.reports, tables.challenges].map((value) => `ALTER TABLE ${value} AUTO_INCREMENT = 1;`));
    const promises = queries.map((value) => connection.query(value));
    await Promise.all(promises);
    await connection.query(`DELETE FROM ${tables.users};`);
    console.log("Cleared database tables.");
}
