import {Request, Response, NextFunction} from "express";
import mysql2, {Pool, RowDataPacket, ResultSetHeader} from "mysql2";
import {Empty, DatabaseBrawlers, DatabaseBadges, TradePinValid} from "../types";

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


const databaseLogin: mysql2.PoolOptions = {
    host: "localhost",
    port: 3306,
    user: "username",
    password: "password",
    database: "database",
    connectionLimit: 12,
    maxIdle: 12
};

let TABLE_NAME = "users";
let TRADE_TABLE_NAME = "trades";
let COSMETIC_TABLE_NAME = "cosmetics";
let GAME_TABLE_NAME = "bullgame";
let REPORT_TABLE_NAME = "reports";


// Read environment variables first before connecting

if (process.env["DATABASE_HOST"] !== void 0){
    databaseLogin.host = process.env["DATABASE_HOST"];
} if (process.env["DATABASE_PORT"] !== void 0){
    const portString = process.env["DATABASE_PORT"];
    if (isNaN(+portString) === false){
        databaseLogin.port = parseInt(portString);
    }
} if (process.env["DATABASE_USER"] !== void 0){
    databaseLogin.user = process.env["DATABASE_USER"];
} if (process.env["DATABASE_PASSWORD"] !== void 0){
    databaseLogin.password = process.env["DATABASE_PASSWORD"];
} if (process.env["DATABASE_NAME"] !== void 0){
    databaseLogin.database = process.env["DATABASE_NAME"];
}

if (process.env["DATABASE_TABLE_NAME"] !== void 0){
    TABLE_NAME = process.env["DATABASE_TABLE_NAME"];
} if (process.env["DATABASE_TRADE_TABLE_NAME"] !== void 0){
    TRADE_TABLE_NAME = process.env["DATABASE_TRADE_TABLE_NAME"];
} if (process.env["DATABASE_COSMETIC_TABLE_NAME"] !== void 0){
    COSMETIC_TABLE_NAME = process.env["DATABASE_COSMETIC_TABLE_NAME"];
} if (process.env["GAME_TABLE_NAME"] !== void 0){
    COSMETIC_TABLE_NAME = process.env["GAME_TABLE_NAME"];
} if (process.env["REPORT_TABLE_NAME"] !== void 0){
    COSMETIC_TABLE_NAME = process.env["REPORT_TABLE_NAME"];
}


const connection = mysql2.createPool(databaseLogin);

let success = true;

connection.query("SELECT 69", [], (error) => {
    if (error !== null && error !== undefined){
        console.log("Could not connect to database.");
        success = false;
    }
});

function closeConnection(callback: () => void): void{
    connection.end((error) => {
        if (error !== null && error !== undefined){
            throw new Error("ASH THREW YOUR CONNECTION IN THE TRASH ! ! !");
        }
        console.log("Database connection ended");
    });   
    callback();
}

process.on("SIGINT", () => {
    closeConnection(() => {
        process.kill(process.pid, "SIGINT");
    });
});


function isDatabaseError(error: Error): error is mysql2.QueryError{
    if ((error as mysql2.QueryError).errno !== void 0){
        return true;
    }
    return false;
}

function isEmptyResultsError(error: Error): error is EmptyResultsError{
    return ((error as EmptyResultsError).ash !== void 0);
}

function isNoUpdateError(error: Error): error is NoUpdateError{
    return ((error as NoUpdateError).frank !== void 0);
}

type ExpressCallback<R, Q> = (req: Request<Empty, Empty, R, Q>, res: Response, next: NextFunction) => void;

/**
 * Error handler for async endpoint callbacks. This function will send
 * the appropriate error message to the user if anything fails while
 * getting data from the database. R is the type of the request body
 * and Q is the type of the query parameters.
 * @param callback callback for an endpoint
 * @returns callback with a promise
 */
export function databaseErrorHandler<R, Q = unknown>(callback: ExpressCallback<R, Q>): ExpressCallback<R, Q>{
    return (req: Request<Empty, Empty, R, Q>, res: Response, next: NextFunction) => {
        Promise.resolve(callback(req, res, next)).catch((reason) => {
            const error = reason as Error;
            if (isDatabaseError(error)){
                // This represents sql errors (duplicate primary key, foreign key violated, ...)
                if (error.errno === 1062){
                    // Duplicate primary key
                    res.status(401).send("Username (or something else) already exists.");
                    return;
                } else if (error.errno === 1644){
                    // Trigger threw an error
                    res.status(403).send(error.message);
                    return;
                }
                res.status(500).send("Could not connect to database.");    
            } else if (isEmptyResultsError(error)){
                res.status(error.ash).send(error.message);
            } else if (isNoUpdateError(error)){
                res.status(error.frank).send(error.message);
            } else{
                // This represents all other errors (no connection, king golm, ...)
                if (typeof reason === "string"){
                    // If a reason was provided then send that reason to the user
                    res.status(500).send(reason);
                } else{
                    // Otherwise, send a generic error message
                    res.status(500).send("Some other error occurred.");
                }
            }
        });
    }
}

/**
 * Queries the database with the given prepared statement and values.
 * Returns a promise that resolves to the result if successful, or
 * throws the error from the database if unsuccessful. This function
 * should only be used when the query returns results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowEmptyResults whether or not to throw an error when results are empty
 * @param query sql query string
 * @returns promise resolving to the result
 */
async function queryDatabase<Values, Result extends RowDataPacket[]>(connection: Pool, values: Values, allowEmptyResults: boolean, query: string): Promise<Result>{
    if (success === false){
        return new Promise<Result>((resolve, reject) => {
            reject("Could not connect to database.");
        });
    }
    return new Promise<Result>((resolve, reject) => {
        connection.query<Result>(query, values, (error, results) => {
            if (error !== null && error !== undefined){
                reject(error);
            } else{
                if (results.length === 0 && allowEmptyResults === false){
                    reject(new EmptyResultsError("Could not find the content in the database."));
                } else{
                    resolve(results);
                }
            }
        });
    });
}

/**
 * Executes an update to the database with the given prepared statement
 * and values. Returns a promise that resolves to a result set header if 
 * successful, or throws the error from the database if unsuccessful.
 * This function should only be used when the query does not return results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowNoUpdate whether or not to throw an error when no rows were updated
 * @param query sql query string
 * @returns promise resolving to the result set header
 */
async function updateDatabase<Values>(connection: Pool, values: Values, allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    if (success === false){
        return new Promise<ResultSetHeader>((resolve, reject) => {
            reject("Could not connect to database.");
        });
    }
    return new Promise<ResultSetHeader>((resolve, reject) => {
        connection.query<ResultSetHeader>(query, values, (error, results) => {
            if (error !== null && error !== undefined){
                reject(error);
            } else{
                if (results.affectedRows === 0 && allowNoUpdate === false){
                    reject(new NoUpdateError("Could not update the database."));
                } else{
                    resolve(results);
                }
            }
        });
    });
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
    return queryDatabase<never[], LastInsertID[]>(connection, [], false,
        "SELECT LAST_INSERT_ID() AS lastid");
}


interface LoginValues{
    username: string;
    password: string;
}
interface LoginResult extends RowDataPacket{
    username: string;
}
export async function userLogin(values: LoginValues): Promise<LoginResult[]>{
    const valuesArray = [
        values.username, values.password
    ];
    return queryDatabase<typeof valuesArray, LoginResult[]>(connection, valuesArray, true,
        `SELECT username FROM ${TABLE_NAME} WHERE username = ? AND password = ?;`);
}


interface NewUserValues{
    username: string;
    password: string;
    active_avatar: string;
    brawlers: string;
}
export async function createNewUser(values: NewUserValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.username, values.password, values.active_avatar, values.brawlers, "[]", "[]", "[]", "[]", "[]", ""
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `INSERT INTO ${TABLE_NAME} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
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
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeUpdateResult[]>(connection, valuesArray, false,
        `SELECT username, password, active_avatar, brawlers, avatars, accessories FROM ${TABLE_NAME} WHERE username = ?;`);
}


interface UpdateAccountValues{
    newPassword: string;
    newAvatar: string;
    username: string;
    currentPassword: string;
}
export async function updateAccount(values: UpdateAccountValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.newPassword, values.newAvatar, values.username, values.currentPassword
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, true,
        `UPDATE ${TABLE_NAME} SET password = ?, active_avatar = ? WHERE username = ? AND password = ?;`);
}


interface UnlockedCosmeticsResult extends RowDataPacket{
    themes: string;
    scenes: string;
}
export async function getUnlockedCosmetics(values: UsernameValues): Promise<UnlockedCosmeticsResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, UnlockedCosmeticsResult[]>(connection, valuesArray, false,
        `SELECT themes, scenes FROM ${TABLE_NAME} WHERE username = ?;`);
}


interface ActiveCosmeticsResult extends RowDataPacket{
    background: string;
    icon: string;
    music: string;
    scene: string;
}
export async function getActiveCosmetics(values: UsernameValues): Promise<ActiveCosmeticsResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, ActiveCosmeticsResult[]>(connection, valuesArray, false,
        `SELECT background, icon, music, scene FROM ${COSMETIC_TABLE_NAME} WHERE username = ?;`);
}


interface UpdateCosmeticsValues{
    background: string;
    icon: string;
    music: string;
    scene: string;
    username: string;
}
export async function updateCosmetics(values: UpdateCosmeticsValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.background, values.icon, values.music, values.scene, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${COSMETIC_TABLE_NAME} SET background = ?, icon = ?, music = ?, scene = ? WHERE username = ?;`);
}


interface LastClaimResult extends RowDataPacket{
    username: string;
    last_claim: number;
    tokens: number;
    token_doubler: number;
}
export async function getLastClaim(values: UsernameValues): Promise<LastClaimResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, LastClaimResult[]>(connection, valuesArray, false,
        `SELECT username, last_claim, tokens, token_doubler FROM ${TABLE_NAME} WHERE username = ?;`);
}


interface LastClaimValues{
    last_claim: number;
    tokens: number;
    token_doubler: number;
    username: string;
}
export async function updateLastClaim(values: LastClaimValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_claim, values.tokens, values.token_doubler, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TABLE_NAME} SET last_claim = ?, tokens = ?, token_doubler = ? WHERE username = ?;`);
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
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, ResourcesResult[]>(connection, valuesArray, false,
        `SELECT active_avatar, tokens, token_doubler, coins, trade_credits, points, brawlers, avatars, themes, scenes, accessories, wild_card_pins FROM ${TABLE_NAME} WHERE username = ?;`);
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
export async function setResources(values: ResourcesValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.tokens, values.token_doubler, values.coins, values.trade_credits, values.points, values.brawlers, values.avatars, values.wild_card_pins, values.themes, values.scenes, values.accessories, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TABLE_NAME} SET tokens = ?, token_doubler = ?, coins = ?, trade_credits = ?, points = ?, brawlers = ?, avatars = ?, wild_card_pins = ?, themes = ?, scenes = ?, accessories = ? WHERE username = ?;`);
}


interface BeforeShopResult extends RowDataPacket{
    last_login: number;
    coins: number;
    trade_credits: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    featured_item: string;
}
export async function beforeShop(values: UsernameValues): Promise<BeforeShopResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeShopResult[]>(connection, valuesArray, false,
        `SELECT last_login, coins, trade_credits, brawlers, avatars, themes, scenes, featured_item FROM ${TABLE_NAME} WHERE username = ?;`);
}


interface FeaturedItemValues{
    last_login: number;
    featured_item: string;
    username: string;
}
export async function updateFeaturedItem(values: FeaturedItemValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_login, values.featured_item, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TABLE_NAME} SET last_login = ?, featured_item = ? WHERE username = ?;`);
}


interface ShopValues{
    last_login: number;
    coins: number;
    trade_credits: number;
    brawlers: string;
    avatars: string;
    themes: string;
    scenes: string;
    featured_item: string;
    username: string;
}
export async function afterShop(values: ShopValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_login, values.coins, values.trade_credits, values.brawlers, values.avatars, values.themes, values.scenes, values.featured_item, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TABLE_NAME} SET last_login = ?, coins = ?, trade_credits = ?, brawlers = ?, avatars = ?, themes = ?, scenes = ?, featured_item = ? WHERE username = ?;`);
}


interface BeforeTradeResult extends RowDataPacket{
    brawlers: string;
    active_avatar: string;
    trade_credits: number;
    wild_card_pins: string;
    accessories: string;
}
export async function beforeTrade(values: UsernameValues): Promise<BeforeTradeResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeTradeResult[]>(connection, valuesArray, false,
        `SELECT brawlers, active_avatar, trade_credits, wild_card_pins, accessories FROM ${TABLE_NAME} WHERE username = ?;`);
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
    const valuesArray = [
        values.creator, values.creator_avatar, values.creator_color, values.offer, values.request, values.trade_credits, values.trade_credits_time, values.expiration
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `INSERT INTO ${TRADE_TABLE_NAME} (creator, creator_avatar, creator_color, offer, request, trade_credits, trade_credits_time, expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`);
}


interface TradeUpdateValues{
    brawlers: string;
    wild_card_pins: string;
    trade_credits: number;
    username: string;
}
export async function afterTrade(values: TradeUpdateValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.brawlers, values.wild_card_pins, values.trade_credits, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TABLE_NAME} SET brawlers = ?, wild_card_pins = ?, trade_credits = ? WHERE username = ?;`);
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
    const valuesArray = [
        values.tradeid, values.minExpiration, values.accepted
    ];
    return queryDatabase<typeof valuesArray, TradeAcceptResult[]>(connection, valuesArray, false,
        `SELECT creator, offer, request, trade_credits FROM ${TRADE_TABLE_NAME} WHERE tradeid = ? AND expiration > ? AND accepted = ?;`);
}


interface TradeAcceptUpdateValues{
    expiration: number;
    accepted: number;
    accepted_by: string;
    tradeid: number;
}
export async function afterTradeAccept(values: TradeAcceptUpdateValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.expiration, values.accepted, values.accepted_by, values.tradeid
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${TRADE_TABLE_NAME} SET expiration = ?, accepted = ?, accepted_by = ? WHERE tradeid = ?;`);
}


interface TradeCloseResult extends TradeAcceptResult{
    trade_credits_time: number;
    expiration: number;
    accepted: number;
    accepted_by: string;
}
export async function getTradeClose(values: TradeIDValues): Promise<TradeCloseResult[]>{
    const valuesArray = [values.tradeid];
    return queryDatabase<typeof valuesArray, TradeCloseResult[]>(connection, valuesArray, false,
        `SELECT creator, offer, request, trade_credits, trade_credits_time, expiration, accepted, accepted_by FROM ${TRADE_TABLE_NAME} WHERE tradeid = ?;`);
}


export async function afterTradeClose(values: TradeIDValues): Promise<ResultSetHeader>{
    const valuesArray = [values.tradeid];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `DELETE FROM ${TRADE_TABLE_NAME} WHERE tradeid = ?;`);
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
    const valuesArray = [values.tradeid];
    return queryDatabase<typeof valuesArray, TradeViewIDResult[]>(connection, valuesArray, false,
        `SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration, accepted, accepted_by FROM ${TRADE_TABLE_NAME} WHERE tradeid = ?;`);
}


interface TradeViewUserResult extends TradeViewResult{
    accepted: number;
}
export async function viewTradeUser(values: UsernameValues): Promise<TradeViewUserResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, TradeViewUserResult[]>(connection, valuesArray, true,
        `SELECT tradeid, offer, request, trade_credits, expiration, accepted FROM ${TRADE_TABLE_NAME} WHERE creator = ?;`);
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
    const valuesArray = [
        values.filterString, values.minExpiration, values.limitStart, values.limitAmount
    ];
    return queryDatabase<typeof valuesArray, TradeViewAllResult[]>(connection, valuesArray, true,
        `SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration FROM ${TRADE_TABLE_NAME} WHERE ${values.filterColumn} LIKE ? AND expiration > ? ORDER BY ${values.sortString} LIMIT ?, ?;`);
}


interface GameProgressResult extends RowDataPacket{
    last_game: number;
    enemy: string;
    player: string;
    location: string;
    achievement: string;
    best_scores: string;
}
export async function getGameProgress(values: UsernameValues): Promise<GameProgressResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, GameProgressResult[]>(connection, valuesArray, true,
        `SELECT last_game, enemy, player, location, achievement, best_scores FROM ${GAME_TABLE_NAME} WHERE username = ?;`);
}


interface GameProgressValues{
    last_game: number;
    enemy: string;
    player: string;
    location: string;
    achievement: string;
    best_scores: string;
    username: string;
}
export async function setGameProgess(values: GameProgressValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_game, values.enemy, values.player, values.location, values.achievement, values.best_scores, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `UPDATE ${GAME_TABLE_NAME} SET last_game = ?, enemy = ?, player = ?, location = ?, achievement = ?, best_scores = ? WHERE username = ?;`);
}


interface ReportValues{
    username: string;
    end_time: number;
    version: number;
    stats: string;
}
export async function addReport(values: ReportValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.username, values.end_time, values.version, values.stats
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `INSERT INTO ${REPORT_TABLE_NAME} (username, end_time, version, stats) VALUES (?, ?, ?, ?);`);
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
    const valuesArray = [values.reportid];
    return queryDatabase<typeof valuesArray, ReportStatsResult[]>(connection, valuesArray, false,
        `SELECT username, version, stats FROM ${REPORT_TABLE_NAME} WHERE reportid = ?;`);
}


interface ReportAllResult extends RowDataPacket{
    reportid: number;
    end_time: number;
    version: number;
    stats: string;
}
export async function getAllReports(values: UsernameValues): Promise<ReportAllResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, ReportAllResult[]>(connection, valuesArray, true,
        `SELECT reportid, end_time, version, stats FROM ${REPORT_TABLE_NAME} WHERE username = ?;`);
}


export async function deleteReport(values: ReportIDValues): Promise<ResultSetHeader>{
    const valuesArray = [values.reportid];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        `DELETE FROM ${REPORT_TABLE_NAME} WHERE reportid = ?;`);
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
    player: string;
    location: string;
    achievement: string;
    best_scores: string;
}
export async function getResourcesAndProgress(values: UsernameValues): Promise<ResourcesProgressResult[]>{
    const valuesArray = [values.username, values.username];
    return queryDatabase<typeof valuesArray, ResourcesProgressResult[]>(connection, valuesArray, false,
        `SELECT U.active_avatar, U.tokens, U.token_doubler, U.coins, U.trade_credits, U.points, U.brawlers, U.avatars, U.themes, U.scenes, U.accessories, U.wild_card_pins, G.enemy, G.player, G.location, G.achievement, G.best_scores FROM ${TABLE_NAME} U, ${GAME_TABLE_NAME} G WHERE U.username = ? AND G.username = ?;`);
}
