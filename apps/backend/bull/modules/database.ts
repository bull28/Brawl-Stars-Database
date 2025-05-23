import {Request, Response, NextFunction} from "express";
import {Query, ParamsDictionary} from "express-serve-static-core";
import mysql2, {Pool, PoolConnection, RowDataPacket, ResultSetHeader} from "mysql2/promise";
import {validateToken} from "./authenticate";
import {Empty, DatabaseBrawlers, DatabaseBadges, TradePinValid, ChallengeWave} from "../types";

// Custom error classes for common database errors

class EmptyResultsError extends Error{
    ash: number;

    constructor(message: string){
        super(message);
        this.ash = 404;
    }
}

class NoUpdateError extends Error{
    frank: number;

    constructor(message: string){
        super(message);
        this.frank = 500;
    }
}


export const databaseLogin: mysql2.PoolOptions = {
    host: "localhost",
    port: 3306,
    user: "username",
    password: "password",
    database: "database",
    connectionLimit: 12,
    maxIdle: 12
};

export const tables = {
    users: "users",
    trades: "trades",
    cosmetics: "cosmetics",
    bullgame: "bullgame",
    reports: "reports",
    challenges: "challenges",
    activechallenges: "activechallenges"
};


// Read environment variables first before connecting
let success = true;

if (process.env["DATABASE_HOST"] !== undefined){
    databaseLogin.host = process.env["DATABASE_HOST"];
} else{
    console.log("No database host provided.");
    success = false;
}

if (process.env["DATABASE_PORT"] !== undefined){
    const portString = process.env["DATABASE_PORT"];
    if (isNaN(+portString) === false){
        databaseLogin.port = parseInt(portString);
    }
} if (process.env["DATABASE_USER"] !== undefined){
    databaseLogin.user = process.env["DATABASE_USER"];
} if (process.env["DATABASE_PASSWORD"] !== undefined){
    databaseLogin.password = process.env["DATABASE_PASSWORD"];
}

if (process.env["NODE_ENV"] === "test"){
    if (process.env["V1_TEST_DATABASE_NAME"] !== undefined){
        databaseLogin.database = process.env["V1_TEST_DATABASE_NAME"];
    }
} else if (process.env["V1_DATABASE_NAME"] !== undefined){
    databaseLogin.database = process.env["V1_DATABASE_NAME"];
}

if (process.env["V1_TABLE_NAME"] !== undefined){
    tables.users = process.env["V1_TABLE_NAME"];
} if (process.env["V1_TRADE_TABLE_NAME"] !== undefined){
    tables.trades = process.env["V1_TRADE_TABLE_NAME"];
} if (process.env["V1_COSMETIC_TABLE_NAME"] !== undefined){
    tables.cosmetics = process.env["V1_COSMETIC_TABLE_NAME"];
} if (process.env["V1_GAME_TABLE_NAME"] !== undefined){
    tables.bullgame = process.env["V1_GAME_TABLE_NAME"];
} if (process.env["V1_REPORT_TABLE_NAME"] !== undefined){
    tables.reports = process.env["V1_REPORT_TABLE_NAME"];
} if (process.env["V1_CHALLENGE_TABLE_NAME"] !== undefined){
    tables.challenges = process.env["V1_CHALLENGE_TABLE_NAME"];
} if (process.env["V1_ACTIVE_TABLE_NAME"] !== undefined){
    tables.activechallenges = process.env["V1_ACTIVE_TABLE_NAME"];
}


const pool = mysql2.createPool(databaseLogin);


if (success === true){
    pool.query("SELECT 69", []).catch((error) => {
        if (error !== null && error !== undefined){
            console.log("Could not connect to database.");
            success = false;
        }
    });
}


process.on("SIGINT", async () => {
    try{
        await pool.end();
        console.log("Database connection ended");
    } catch(error){
        throw new Error("ASH THREW YOUR CONNECTION IN THE TRASH ! ! !");
    }
    process.kill(process.pid, "SIGINT");
});


function isDatabaseError(error: Error): error is mysql2.QueryError{
    return ((error as mysql2.QueryError).errno !== undefined);
}

function isEmptyResultsError(error: Error): error is EmptyResultsError{
    return ((error as EmptyResultsError).ash !== undefined);
}

function isNoUpdateError(error: Error): error is NoUpdateError{
    return ((error as NoUpdateError).frank !== undefined);
}

/**
 * Gets the message and status code for an error when a route callback fails.
 * @param reason promise rejection reason
 * @returns error status code and message
 */
function getErrorMessage(error: Error): {status: number; message: string;}{
    if (isDatabaseError(error)){
        // This represents sql errors (duplicate primary key, foreign key violated, ...)
        if (error.errno === 1062){
            // Duplicate primary key
            return {status: 401, message: "Username (or something else) already exists."};
        } else if (error.errno === 1644){
            // Trigger threw an error
            return {status: 403, message: error.message};
        }
        return {status: 500, message: "Could not connect to database."};
    } else if (isEmptyResultsError(error)){
        return {status: error.ash, message: error.message};
    } else if (isNoUpdateError(error)){
        return {status: error.frank, message: error.message};
    } else if (typeof error.message === "string"){
        // This represents all other errors (no connection, king golm, ...)
        return {status: 500, message: error.message};
    }
    // Otherwise, send a generic error message
    return {status: 500, message: "Some other error occurred."};
}

type ExpressCallback<R, Q, P> = (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => void;

type UsernameCallback<R, Q, P> = (req: Request<P, Empty, R, Q>, res: Response, username: string, next: NextFunction) => void;

/**
 * Error handler for async endpoint callbacks that do not require authentication. This function will send the
 * appropriate error message to the user if anything fails while getting data from the database. R is the type of the
 * request body and Q is the type of the query and P is the type of the request parameters.
 * @param callback callback for an endpoint
 * @returns callback with a promise
 */
export function databaseErrorHandler<R = Empty, Q = Query, P = ParamsDictionary>(callback: ExpressCallback<R, Q, P>): ExpressCallback<R, Q, P>{
    return (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => {
        Promise.resolve(callback(req, res, next)).catch((reason) => {
            const errorData = getErrorMessage(reason);
            res.status(errorData.status).send(errorData.message);
        });
    }
}

/**
 * Error handler for async endpoint callbacks that require authentication. This function will send the appropriate error
 * message to the user if anything fails while getting data from the database or the provided token is invalid. R is the
 * type of the request body and Q is the type of the query and P is the type of the request parameters. R must have a
 * token: string property.
 * @param callback callback for an endpoint
 * @returns callback with a promise
 */
export function loginErrorHandler<R = Empty, Q = Query, P = ParamsDictionary>(callback: UsernameCallback<R, Q, P>): ExpressCallback<R, Q, P>{
    return (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => {
        if (typeof req.headers.authorization !== "string"){
            res.status(400).send("Token is missing.");
            return;
        }
        const [authType, token] = req.headers.authorization.split(" ");
        if (authType.toLowerCase() !== "bearer" || token === undefined){
            res.status(400).send("Token is missing.");
            return;
        }

        const username = validateToken(token);

        if (username === ""){
            res.status(401).send("Invalid token.");
            return;
        }

        Promise.resolve(callback(req, res, username, next)).catch((reason) => {
            const errorData = getErrorMessage(reason);
            res.status(errorData.status).send(errorData.message);
        });
    }
}

/**
 * Queries the database with the given prepared statement and values. Returns a promise that resolves to the result if
 * successful, or throws the error from the database if unsuccessful. This function should only be used when the query
 * returns results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowEmptyResults whether or not to allow an empty results array (true) or throw an error (false)
 * @param query sql query string
 * @returns promise resolving to the result
 */
export async function queryDatabase<Result extends RowDataPacket[]>(connection: Pool, values: (string | number)[], allowEmptyResults: boolean, query: string): Promise<Result>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    const [results] = await connection.query<Result>(query, values);
    if (results.length === 0 && allowEmptyResults === false){
        throw new EmptyResultsError("Could not find the content in the database.");
    } else{
        return results;
    }
}

/**
 * Executes an update to the database with the given prepared statement and values. Returns a promise that resolves to a
 * result set header if successful, or throws the error from the database if unsuccessful. This function should only be
 * used when the query does not return results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowNoUpdate whether or not to allow updating no rows (true) or to throw an error (false)
 * @param query sql query string
 * @returns promise resolving to the result set header
 */
export async function updateDatabase(connection: Pool, values: (string | number)[], allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    const [results] = await connection.query<ResultSetHeader>(query, values);
    if (results.affectedRows === 0 && allowNoUpdate === false){
        throw new NoUpdateError("Could not update the database.");
    } else{
        return results;
    }
}

/**
 * Executes an update to the database with the given prepared statement and values. Returns a promise that resolves to a
 * result set header if successful, or throws the error from the database if unsuccessful. This function should only be
 * used during a transaction involving multiple updates.
 * @param connection single connection from a pool
 * @param values prepared statement values
 * @param allowNoUpdate whether or not to throw an error when no rows were updated
 * @param query sql query string
 * @returns promise resolving to the result set header
 */
export async function transactionUpdate(connection: PoolConnection, values: (string | number)[], allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    const [results] = await connection.query<ResultSetHeader>(query, values);
    if (results.affectedRows === 0 && allowNoUpdate === false){
        //await connection.rollback();
        throw new NoUpdateError("Could not update the database.");
    } else{
        return results;
    }
}

/**
 * Starts a transaction, executes queries, then commits to the database. The queries executed in the callback should
 * use transactionUpdate instead of updateDatabase because they must rollback if there is an error.
 * @param callback function that executes the queries using transactionUpdate
 * @returns empty promise
 */
export async function transaction(callback: (connection: PoolConnection) => Promise<void>): Promise<void>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    try{
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try{
            await callback(connection);
        } catch (error){
            await connection.rollback();
            pool.releaseConnection(connection);
            throw error;
        }

        try{
            await connection.commit();
            pool.releaseConnection(connection);
            return;
        } catch (error){
            await connection.rollback();
            pool.releaseConnection(connection);
            throw error;
        }
    } catch(error){
        throw new Error("Could not connect to database.");
    }
}


// These functions parse objects that are stored in the database as text

export function parseStringArray(input: string): string[]{
    const result: string[] = [];
    try{
        const data = JSON.parse(input);

        if (Array.isArray(data) === true){
            for (let x = 0; x < data.length; x++){
                if (typeof data[x] === "string"){
                    result.push(data[x]);
                }
            }
        }
    } catch (error){
        throw new Error("Collection data could not be loaded.");
    }

    return result;
}

export function parseNumberArray(input: string): number[]{
    const result: number[] = [];
    try{
        const data = JSON.parse(input);

        if (Array.isArray(data) === true){
            for (let x = 0; x < data.length; x++){
                if (typeof data[x] === "number"){
                    result.push(data[x]);
                }
            }
        }
    } catch (error){
        throw new Error("Collection data could not be loaded.");
    }

    return result;
}

export function parseBrawlers(brawlerString: string): DatabaseBrawlers{
    const collection: DatabaseBrawlers = {};
    try{
        const data = JSON.parse(brawlerString);

        for (const x in data){
            if (typeof x === "string" && typeof data[x] === "object"){
                const pinMap: DatabaseBrawlers[string] = {};
                for (const y in data[x]){
                    if (typeof y === "string" && typeof data[x][y] === "number"){
                        pinMap[y] = data[x][y];
                    }
                }
                collection[x] = pinMap;
            }
        }
    } catch (error){
        throw new Error("Collection data could not be loaded.");
    }

    return collection;
}

export function parseTradePins(tradeString: string): TradePinValid[]{
    const tradeList: TradePinValid[] = [];
    try{
        const data = JSON.parse(tradeString);

        if (Array.isArray(data) === true){
            for (let x = 0; x < data.length; x++){
                const pin = data[x];

                if (typeof pin.brawler === "string" &&
                typeof pin.pin === "string" &&
                typeof pin.amount === "number" &&
                typeof pin.rarityValue === "number" &&
                typeof pin.rarityColor === "string"){
                    tradeList.push({
                        brawler: pin.brawler,
                        pin: pin.pin,
                        amount: pin.amount,
                        rarityValue: pin.rarityValue,
                        rarityColor: pin.rarityColor
                    });
                }
            }
        }
    } catch (error){
        throw new Error("Trade data could not be loaded.");
    }

    return tradeList;
}

export function parseBadges(badgesString: string): DatabaseBadges{
    const badges: DatabaseBadges = {};
    try{
        const data = JSON.parse(badgesString);

        for (const x in data){
            if (typeof x === "string" && typeof data[x] === "number"){
                badges[x] = data[x];
            }
        }
    } catch (error){
        throw new Error("Collection data could not be loaded.");
    }

    return badges;
}

export function parseChallengeWaves(wavesString: string): ChallengeWave[]{
    const waves: ChallengeWave[] = [];
    try{
        const data = JSON.parse(wavesString);

        if (Array.isArray(data) === true){
            for (let x = 0; x < data.length; x++){
                let valid = true;
                const enemies = data[x].enemies;
                if (Array.isArray(enemies) === true){
                    for (let i = 0; i < enemies.length; i++){
                        if (typeof enemies[i] !== "string"){
                            valid = false;
                        }
                    }
                } else{
                    valid = false;
                }
                if (valid === true && typeof data[x].level === "number"){
                    const wave: ChallengeWave = {level: data[x].level, enemies: enemies};
                    if (typeof data[x].delay === "number"){
                        wave.delay = data[x].delay;
                    } if (typeof data[x].maxEnemies === "number"){
                        wave.maxEnemies = data[x].maxEnemies;
                    }
                    waves.push(wave);
                } else{
                    // Either all or none of the waves must be valid. Having some of the waves valid will result in an
                    // easier challenge with fewer waves than intended.
                    throw new Error("Invalid wave");
                }
            }
        }
    } catch (error){
        throw new Error("Challenge data could not be loaded.");
    }
    return waves;
}

export function stringifyBrawlers(brawlers: DatabaseBrawlers): string{
    const result: DatabaseBrawlers = Object.keys(brawlers).sort().reduce((object, key) => {
        object[key] = brawlers[key];
        return object;
    }, {} as DatabaseBrawlers);

    return JSON.stringify(result);
}


// These functions send queries or updates to the database
interface UsernameValues{
    username: string;
}


interface LastInsertID extends RowDataPacket{
    lastid: string;
}
export async function selectLastID(): Promise<LastInsertID[]>{
    return queryDatabase<LastInsertID[]>(pool, [], false,
        "SELECT LAST_INSERT_ID() AS lastid");
}


interface LoginResult extends RowDataPacket{
    username: string;
    password: string;
}
export async function userLogin(values: UsernameValues): Promise<LoginResult[]>{
    return queryDatabase<LoginResult[]>(pool, [values.username], true,
        `SELECT username, password FROM ${tables.users} WHERE username = ?;`);
}


interface NewUserValues{
    username: string;
    password: string;
    active_avatar: string;
    brawlers: string;
}
export async function createNewUser(values: NewUserValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.username, values.password, values.active_avatar, values.brawlers, "[]", "[]", "[]", "[]", "[]", ""
    ], false,
        `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
}


interface BeforeUpdateResult extends RowDataPacket{
    username: string;
    password: string;
    active_avatar: string;
    brawlers: string;
    avatars: string;
    accessories: string;
}
export async function beforeUpdate(values: UsernameValues): Promise<BeforeUpdateResult[]>{
    return queryDatabase<BeforeUpdateResult[]>(pool, [values.username], false,
        `SELECT username, password, active_avatar, brawlers, avatars, accessories FROM ${tables.users} WHERE username = ?;`);
}


interface UpdateAccountValues{
    newPassword: string;
    newAvatar: string;
    username: string;
}
export async function updateAccount(values: UpdateAccountValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.newPassword, values.newAvatar, values.username
    ], false,
        `UPDATE ${tables.users} SET password = ?, active_avatar = ? WHERE username = ?;`);
}


interface UnlockedCosmeticsResult extends RowDataPacket{
    themes: string;
    scenes: string;
}
export async function getUnlockedCosmetics(values: UsernameValues): Promise<UnlockedCosmeticsResult[]>{
    return queryDatabase<UnlockedCosmeticsResult[]>(pool, [values.username], false,
        `SELECT themes, scenes FROM ${tables.users} WHERE username = ?;`);
}


interface ActiveCosmeticsResult extends RowDataPacket{
    background: string;
    icon: string;
    music: string;
    scene: string;
}
export async function getActiveCosmetics(values: UsernameValues): Promise<ActiveCosmeticsResult[]>{
    return queryDatabase<ActiveCosmeticsResult[]>(pool, [values.username], false,
        `SELECT background, icon, music, scene FROM ${tables.cosmetics} WHERE username = ?;`);
}


interface UpdateCosmeticsValues{
    background: string;
    icon: string;
    music: string;
    scene: string;
    username: string;
}
export async function updateCosmetics(values: UpdateCosmeticsValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.background, values.icon, values.music, values.scene, values.username
    ], false,
        `UPDATE ${tables.cosmetics} SET background = ?, icon = ?, music = ?, scene = ? WHERE username = ?;`);
}


interface LastClaimResult extends RowDataPacket{
    username: string;
    last_claim: number;
    tokens: number;
    token_doubler: number;
}
export async function getLastClaim(values: UsernameValues): Promise<LastClaimResult[]>{
    return queryDatabase<LastClaimResult[]>(pool, [values.username], false,
        `SELECT username, last_claim, tokens, token_doubler FROM ${tables.users} WHERE username = ?;`);
}


interface LastClaimValues{
    last_claim: number;
    tokens: number;
    token_doubler: number;
    username: string;
}
export async function updateLastClaim(values: LastClaimValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.last_claim, values.tokens, values.token_doubler, values.username
    ], false,
        `UPDATE ${tables.users} SET last_claim = ?, tokens = ?, token_doubler = ? WHERE username = ?;`);
}


interface ResourcesResult extends RowDataPacket{
    active_avatar: string;
    tokens: number;
    token_doubler: number;
    coins: number;
    trade_credits: number;
    points: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    accessories: string;
    wild_card_pins: string;
}
export async function getResources(values: UsernameValues): Promise<ResourcesResult[]>{
    return queryDatabase<ResourcesResult[]>(pool, [values.username], false,
        `SELECT active_avatar, tokens, token_doubler, coins, trade_credits, points, brawlers, avatars, themes, scenes, accessories, wild_card_pins FROM ${tables.users} WHERE username = ?;`);
}


interface ResourcesValues{
    tokens: number;
    token_doubler: number;
    coins: number;
    trade_credits: number;
    points: number;
    brawlers: string;
    avatars: string;
    wild_card_pins: string;
    themes: string;
    scenes: string;
    accessories: string;
    username: string;
}
export async function setResources(values: ResourcesValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.tokens, values.token_doubler, values.coins, values.trade_credits, values.points, values.brawlers, values.avatars, values.wild_card_pins, values.themes, values.scenes, values.accessories, values.username
    ];
    const query = `UPDATE ${tables.users} SET tokens = ?, token_doubler = ?, coins = ?, trade_credits = ?, points = ?, brawlers = ?, avatars = ?, wild_card_pins = ?, themes = ?, scenes = ?, accessories = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


export async function setPoints(values: Pick<ResourcesValues, "points" | "username">, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.points, values.username
    ];
    const query = `UPDATE ${tables.users} SET points = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


export async function setTokens(values: Pick<ResourcesValues, "tokens" | "username">, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.tokens, values.username
    ];
    const query = `UPDATE ${tables.users} SET tokens = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface BeforeShopResult extends RowDataPacket{
    last_login: number;
    coins: number;
    trade_credits: number;
    points: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    accessories: string;
    featured_item: string;
}
export async function beforeShop(values: UsernameValues): Promise<BeforeShopResult[]>{
    return queryDatabase<BeforeShopResult[]>(pool, [values.username], false,
        `SELECT last_login, coins, trade_credits, points, brawlers, avatars, themes, scenes, accessories, featured_item FROM ${tables.users} WHERE username = ?;`);
}


interface FeaturedItemValues{
    last_login: number;
    featured_item: string;
    username: string;
}
export async function updateFeaturedItem(values: FeaturedItemValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.last_login, values.featured_item, values.username
    ], false,
        `UPDATE ${tables.users} SET last_login = ?, featured_item = ? WHERE username = ?;`);
}


interface ShopValues{
    last_login: number;
    coins: number;
    trade_credits: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    accessories: string;
    featured_item: string;
    username: string;
}
export async function afterShop(values: ShopValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.last_login, values.coins, values.trade_credits, values.brawlers, values.avatars, values.themes, values.scenes, values.accessories, values.featured_item, values.username
    ], false,
        `UPDATE ${tables.users} SET last_login = ?, coins = ?, trade_credits = ?, brawlers = ?, avatars = ?, themes = ?, scenes = ?, accessories = ?, featured_item = ? WHERE username = ?;`);
}


interface BeforeTradeResult extends RowDataPacket{
    brawlers: string;
    active_avatar: string;
    trade_credits: number;
    wild_card_pins: string;
    accessories: string;
}
export async function beforeTrade(values: UsernameValues): Promise<BeforeTradeResult[]>{
    return queryDatabase<BeforeTradeResult[]>(pool, [values.username], false,
        `SELECT brawlers, active_avatar, trade_credits, wild_card_pins, accessories FROM ${tables.users} WHERE username = ?;`);
}


interface TradeCreateValues{
    creator: string;
    creator_avatar: string;
    creator_color: string;
    offer: string;
    request: string;
    trade_credits: number;
    trade_credits_time: number;
    expiration: number;
}
export async function createTrade(values: TradeCreateValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [
        values.creator, values.creator_avatar, values.creator_color, values.offer, values.request, values.trade_credits, values.trade_credits_time, values.expiration
    ], false,
        `INSERT INTO ${tables.trades} (creator, creator_avatar, creator_color, offer, request, trade_credits, trade_credits_time, expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`);
}


interface TradeUpdateValues{
    brawlers: string;
    wild_card_pins: string;
    trade_credits: number;
    username: string;
}
export async function afterTrade(values: TradeUpdateValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.brawlers, values.wild_card_pins, values.trade_credits, values.username
    ];
    const query = `UPDATE ${tables.users} SET brawlers = ?, wild_card_pins = ?, trade_credits = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface TradeIDValues{
    tradeid: number;
}
interface TradeAcceptValues extends TradeIDValues{
    minExpiration: number;
    accepted: number;
}
interface TradeAcceptResult extends RowDataPacket{
    creator: string;
    offer: string;
    request: string;
    trade_credits: number;
}
export async function getTradeAccept(values: TradeAcceptValues): Promise<TradeAcceptResult[]>{
    return queryDatabase<TradeAcceptResult[]>(pool, [
        values.tradeid, values.minExpiration, values.accepted
    ], false,
        `SELECT creator, offer, request, trade_credits FROM ${tables.trades} WHERE tradeid = ? AND expiration > ? AND accepted = ?;`);
}


interface TradeAcceptUpdateValues{
    expiration: number;
    accepted: number;
    accepted_by: string;
    tradeid: number;
}
export async function afterTradeAccept(values: TradeAcceptUpdateValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.expiration, values.accepted, values.accepted_by, values.tradeid
    ];
    const query = `UPDATE ${tables.trades} SET expiration = ?, accepted = ?, accepted_by = ? WHERE tradeid = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface TradeCloseResult extends TradeAcceptResult{
    trade_credits_time: number;
    expiration: number;
    accepted: number;
    accepted_by: string;
}
export async function getTradeClose(values: TradeIDValues): Promise<TradeCloseResult[]>{
    return queryDatabase<TradeCloseResult[]>(pool, [values.tradeid], false,
        `SELECT creator, offer, request, trade_credits, trade_credits_time, expiration, accepted, accepted_by FROM ${tables.trades} WHERE tradeid = ?;`);
}


export async function afterTradeClose(values: TradeIDValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [values.tradeid];
    const query = `DELETE FROM ${tables.trades} WHERE tradeid = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface TradeViewResult extends RowDataPacket{
    tradeid: number;
    offer: string;
    request: string;
    trade_credits: number;
    expiration: number;
}
interface TradeViewIDResult extends TradeViewResult{
    creator: string;
    creator_avatar: string;
    creator_color: string;
    accepted: number;
    accepted_by: string;
}
export async function viewTradeID(values: TradeIDValues): Promise<TradeViewIDResult[]>{
    return queryDatabase<TradeViewIDResult[]>(pool, [values.tradeid], false,
        `SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration, accepted, accepted_by FROM ${tables.trades} WHERE tradeid = ?;`);
}


interface TradeViewUserResult extends TradeViewResult{
    accepted: number;
}
export async function viewTradeUser(values: UsernameValues): Promise<TradeViewUserResult[]>{
    return queryDatabase<TradeViewUserResult[]>(pool, [values.username], true,
        `SELECT tradeid, offer, request, trade_credits, expiration, accepted FROM ${tables.trades} WHERE creator = ?;`);
}


interface TradeViewAllValues{
    filterColumn: string;
    sortString: string;
    filterString: string;
    minExpiration: number;
    limitStart: number;
    limitAmount: number;
}
interface TradeViewAllResult extends TradeViewResult{
    creator: string;
    creator_avatar: string;
    creator_color: string;
}
export async function viewTradeAll(values: TradeViewAllValues): Promise<TradeViewAllResult[]>{
    return queryDatabase<TradeViewAllResult[]>(pool, [
        values.filterString, values.minExpiration, values.limitStart, values.limitAmount
    ], true,
        `SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration FROM ${tables.trades} WHERE ${values.filterColumn} LIKE ? AND expiration > ? ORDER BY ${values.sortString} LIMIT ?, ?;`);
}


interface GameProgressResult extends RowDataPacket{
    rating: number;
    last_rating: number;
    last_game: number;
    badges: string;
    best_scores: string;
}
export async function getGameProgress(values: UsernameValues): Promise<GameProgressResult[]>{
    return queryDatabase<GameProgressResult[]>(pool, [values.username], true,
        `SELECT rating, last_rating, last_game, badges, best_scores FROM ${tables.bullgame} WHERE username = ?;`);
}


interface GameProgressValues{
    last_game: number;
    badges: string;
    best_scores: string;
    username: string;
}
export async function setGameProgress(values: GameProgressValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_game, values.badges, values.best_scores, values.username
    ];
    const query = `UPDATE ${tables.bullgame} SET last_game = ?, badges = ?, best_scores = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface GameRatingValues{
    rating: number;
    last_rating: number;
    username: string;
}
export async function setGameRating(values: GameRatingValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.rating, values.last_rating, values.username
    ];
    const query = `UPDATE ${tables.bullgame} SET rating = ?, last_rating = ? WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface ReportValues{
    username: string;
    end_time: number;
    version: number;
    title: string;
    stats: string;
}
export async function addReport(values: ReportValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.username, values.end_time, values.version, values.title, values.stats
    ];
    const query = `INSERT INTO ${tables.reports} (username, end_time, version, title, stats) VALUES (?, ?, ?, ?, ?);`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface ReportIDValues{
    reportid: number;
}
interface ReportStatsResult extends RowDataPacket{
    username: string;
    version: number;
    stats: string;
}
export async function getReport(values: ReportIDValues): Promise<ReportStatsResult[]>{
    return queryDatabase<ReportStatsResult[]>(pool, [values.reportid], false,
        `SELECT username, version, stats FROM ${tables.reports} WHERE reportid = ?;`);
}


interface ReportAllResult extends RowDataPacket{
    reportid: number;
    end_time: number;
    version: number;
    title: string;
    stats: string;
}
export async function getAllReports(values: UsernameValues): Promise<ReportAllResult[]>{
    return queryDatabase<ReportAllResult[]>(pool, [values.username], true,
        `SELECT reportid, end_time, version, title, stats FROM ${tables.reports} WHERE username = ?;`);
}


export async function deleteReport(values: ReportIDValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [values.reportid];
    const query = `DELETE FROM ${tables.reports} WHERE reportid = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, true, query);
    }
    return updateDatabase(pool, valuesArray, true, query);
}


interface ResourcesProgressResult extends RowDataPacket{
    tokens: number;
    token_doubler: number;
    coins: number;
    trade_credits: number;
    points: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    accessories: string;
    wild_card_pins: string;
    last_game: number;
    badges: string;
    best_scores: string;
}
export async function getResourcesAndProgress(values: UsernameValues): Promise<ResourcesProgressResult[]>{
    return queryDatabase<ResourcesProgressResult[]>(pool, [values.username, values.username], false,
        `SELECT U.active_avatar, U.tokens, U.token_doubler, U.coins, U.trade_credits, U.points, U.brawlers, U.avatars, U.themes, U.scenes, U.accessories, U.wild_card_pins, G.last_game, G.badges, G.best_scores FROM ${tables.users} U, ${tables.bullgame} G WHERE U.username = ? AND G.username = ?;`);
}


interface BeforeAccessoryResult extends RowDataPacket{
    points: number;
    accessories: string;
    rating: number;
    badges: string;
}
export async function beforeAccessory(values: UsernameValues): Promise<BeforeAccessoryResult[]>{
    return queryDatabase<BeforeAccessoryResult[]>(pool, [values.username, values.username], false,
        `SELECT U.points, U.accessories, G.rating, G.badges FROM ${tables.users} U, ${tables.bullgame} G WHERE U.username = ? AND G.username = ?;`);
}


interface AccessoryClaimValues{
    accessories: string;
    username: string;
}
export async function updateAccessories(values: AccessoryClaimValues): Promise<ResultSetHeader>{
    return updateDatabase(pool, [values.accessories, values.username], false,
        `UPDATE ${tables.users} SET accessories = ? WHERE username = ?;`);
}


interface ActiveChallengeValues{
    key: string;
}
interface CreateActiveValues extends ActiveChallengeValues{
    challengeid: number;
    username: string;
}
interface ActiveChallengeResult extends RowDataPacket{
    owner: string;
    accepted_by: string;
    accepted: number;
    preset: string;
    strength: number;
    difficulty: number;
    levels: number;
    stats: string;
    waves: string;
}
export async function createActiveChallenge(values: CreateActiveValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.key, values.challengeid, values.username
    ];
    const query = `INSERT INTO ${tables.activechallenges} (active_key, challengeid, accepted_by) VALUES (?, ?, ?);`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


export async function getActiveChallenge(values: ActiveChallengeValues): Promise<ActiveChallengeResult[]>{
    return queryDatabase<ActiveChallengeResult[]>(pool, [values.key], true,
        `SELECT C.username AS owner, A.accepted_by, A.accepted, C.preset, C.strength, C.difficulty, C.levels, C.stats, C.waves FROM ${tables.challenges} C, ${tables.activechallenges} A WHERE C.challengeid = A.challengeid AND A.active_key = ?;`);
}


export async function acceptActiveChallenge(values: ActiveChallengeValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [values.key];
    const query = `UPDATE ${tables.activechallenges} SET accepted = 1 WHERE active_key = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


export async function deleteActiveChallenge(values: ActiveChallengeValues & Partial<UsernameValues>, connection?: PoolConnection): Promise<ResultSetHeader>{
    let query = `DELETE FROM ${tables.activechallenges} WHERE active_key = ?;`;
    const valuesArray: (string | number)[] = [];
    if (values.username !== undefined){
        valuesArray.push(values.username);
        query = `DELETE FROM ${tables.activechallenges} WHERE accepted_by = ?;`;
    } else{
        valuesArray.push(values.key);
    }

    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, true, query);
    }
    return updateDatabase(pool, valuesArray, true, query);
}


interface CreateChallengeValues{
    username: string;
    preset: string;
    strength: number;
    difficulty: number;
    levels: number;
    stats: string;
    waves: string;
}
export async function createChallenge(values: CreateChallengeValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [
        values.username, values.preset, values.strength, values.difficulty, values.levels, values.stats, values.waves
    ];
    const query = `INSERT INTO ${tables.challenges} (username, preset, strength, difficulty, levels, stats, waves) VALUES (?, ?, ?, ?, ?, ?, ?);`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, false, query);
    }
    return updateDatabase(pool, valuesArray, false, query);
}


interface ChallengeIDValues{
    challengeid: number;
}
interface ChallengeResult extends ChallengeIDValues, CreateChallengeValues, RowDataPacket{}
export async function getChallenge(values: ChallengeIDValues & Partial<UsernameValues>): Promise<ChallengeResult[]>{
    if (values.username !== undefined){
        return queryDatabase<ChallengeResult[]>(pool, [values.username], true,
            `SELECT challengeid, username, preset, strength, difficulty, levels, stats, waves FROM ${tables.challenges} WHERE username = ?;`);
    }
    return queryDatabase<ChallengeResult[]>(pool, [values.challengeid], true,
        `SELECT challengeid, username, preset, strength, difficulty, levels, stats, waves FROM ${tables.challenges} WHERE challengeid = ?;`);
}


interface ChallengeAllResult extends RowDataPacket{
    challengeid: number;
    username: string;
    preset: string;
    strength: number;
}
export async function getAllChallenges(values: UsernameValues): Promise<ChallengeAllResult[]>{
    return queryDatabase<ChallengeAllResult[]>(pool, [values.username, ""], true,
        `SELECT challengeid, username, preset, strength FROM ${tables.challenges};`);
}


export async function deleteChallenge(values: UsernameValues, connection?: PoolConnection): Promise<ResultSetHeader>{
    const valuesArray = [values.username];
    const query = `DELETE FROM ${tables.challenges} WHERE username = ?;`;
    if (connection !== undefined){
        return transactionUpdate(connection, valuesArray, true, query);
    }
    return updateDatabase(pool, valuesArray, true, query);
}
