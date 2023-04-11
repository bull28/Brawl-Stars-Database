import {Request, Response, NextFunction} from "express";
import mysql2, {Connection, RowDataPacket, ResultSetHeader} from "mysql2";
import {
    LastInsertID, 
    LoginResult, 
    LoginValues, 
    NewUserValues, 
    UsernameValues, 
    BeforeUpdateResult, 
    UpdateAccountValues, 
    UnlockedCosmeticsResult, 
    ActiveCosmeticsResult, 
    UpdateCosmeticsValues, 
    LastClaimResult, 
    LastClaimValues, 
    ResourcesResult, 
    BeforeShopResult, 
    BrawlBoxResultValues, 
    FeaturedItemValues, 
    ShopValues, 
    BeforeTradeResult, 
    TradeIDValues, 
    TradeCreateValues, 
    TradeUpdateValues, 
    TradeAcceptValues, 
    TradeAcceptResult, 
    TradeCloseResult, 
    TradeAcceptUpdateValues, 
    TradeViewIDResult, 
    TradeViewUserResult, 
    TradeViewAllResult, 
    TradeViewAllValues, 
    DatabaseBrawlers, 
    TradePinValid
} from "../types";


// Custom error classes for common database errors

class EmptyResultsError extends Error{
    ash: number;

    constructor(message: string){
        super(message);
        this.stack = (new Error).stack;
        this.ash = 404;
    }
}

class NoUpdateError extends Error{
    frank: number;

    constructor(message: string){
        super(message);
        this.stack = (new Error).stack;
        this.frank = 500;
    }
}


const databaseLogin: mysql2.ConnectionOptions = {
    host: "localhost",
    port: 3306,
    user: "bull",
    password: "darryl_roll",
    database: "bull2"
};

let TABLE_NAME = "users";
let TRADE_TABLE_NAME = "trades";
let COSMETIC_TABLE_NAME = "cosmetics";


// Read environment variables first before connecting

if (typeof process.env.DATABASE_HOST != "undefined"){
    databaseLogin.host = process.env.DATABASE_HOST;
} if (typeof process.env.DATABASE_PORT != "undefined"){
    const portString = process.env.DATABASE_PORT;
    if (!isNaN(+portString)){
        databaseLogin.port = parseInt(portString);
    }
} if (typeof process.env.DATABASE_USER != "undefined"){
    databaseLogin.user = process.env.DATABASE_USER;
} if (typeof process.env.DATABASE_PASSWORD != "undefined"){
    databaseLogin.password = process.env.DATABASE_PASSWORD;
} if (typeof process.env.DATABASE_NAME != "undefined"){
    databaseLogin.database = process.env.DATABASE_NAME;
} if (typeof process.env.DATABASE_TABLE_NAME != "undefined"){
    TABLE_NAME = process.env.DATABASE_TABLE_NAME;
} if (typeof process.env.DATABASE_TRADE_TABLE_NAME != "undefined"){
    TRADE_TABLE_NAME = process.env.DATABASE_TRADE_TABLE_NAME;
} if (typeof process.env.DATABASE_COSMETIC_TABLE_NAME != "undefined"){
    COSMETIC_TABLE_NAME = process.env.DATABASE_COSMETIC_TABLE_NAME;
}


const connection = mysql2.createConnection(databaseLogin);

let success = true;

connection.connect((error) => {
    if (error != null){
        console.log("Could not connect to database.");
        success = false;
    }
});

function closeConnection(callback: () => void): void{
    connection.end((error) => {
        if (error != null){
            throw new Error("ASH THREW YOUR CONNECTION IN THE TRASH ! ! !");
        }
        console.log("Database connection ended");
    });   
    callback();
};

process.on("SIGINT", () => {
    if (!success){
        return;
    }
    closeConnection(() => {
        process.kill(process.pid, "SIGINT");
    });
});


function isDatabaseError(error: Error): error is mysql2.QueryError{
    if (typeof (error as mysql2.QueryError).errno != "undefined"){
        return true;
    }
    return false;
}

function isEmptyResultsError(error: Error): error is EmptyResultsError{
    return (typeof (error as EmptyResultsError).ash != "undefined");
}

function isNoUpdateError(error: Error): error is NoUpdateError{
    return (typeof (error as NoUpdateError).frank != "undefined");
}

type ExpressCallback<R, Q> = (req: Request<{}, {}, R, Q>, res: Response, next: NextFunction) => void;

/**
 * Error handler for async endpoint callbacks. This function will send
 * the appropriate error message to the user if anything fails while
 * getting data from the database. R is the type of the request body
 * and Q is the type of the query parameters.
 * @param callback callback for an endpoint
 * @returns callback with a promise
 */
export function databaseErrorHandler<R, Q = {}>(callback: ExpressCallback<R, Q>): ExpressCallback<R, Q>{
    return (req: Request<{}, {}, R, Q>, res: Response, next: NextFunction) => {
        Promise.resolve(callback(req, res, next)).catch((reason) => {
            const error = reason as Error;
            if (isDatabaseError(error)){
                // This represents sql errors (duplicate primary key, foreign key violated, ...)
                if (error.errno == 1062){
                    res.status(401).send("Username (or something else) already exists.");
                    return;
                }
                res.status(500).send("Could not connect to database.");    
            } else if (isEmptyResultsError(error)){
                res.status(error.ash).send(error.message);
            } else if (isNoUpdateError(error)){
                res.status(error.frank).send(error.message);
            } else{
                // This represents all other errors (no connection, king golm, ...)
                if (typeof reason == "string"){
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
async function queryDatabase<Values, Result extends RowDataPacket[]>(connection: Connection, values: Values, allowEmptyResults: boolean, query: string): Promise<Result>{
    if (!success){
        return new Promise<Result>((resolve, reject) => {
            reject("Could not connect to database.");
        });
    }
    return new Promise<Result>((resolve, reject) => {
        connection.query<Result>(query, values, (error, results) => {
            if (error != null){
                reject(error);
            } else{
                if (results.length == 0 && !allowEmptyResults){
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
async function updateDatabase<Values>(connection: Connection, values: Values, allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    if (!success){
        return new Promise<ResultSetHeader>((resolve, reject) => {
            reject("Could not connect to database.");
        });
    }
    return new Promise<ResultSetHeader>((resolve, reject) => {
        connection.query<ResultSetHeader>(query, values, (error, results) => {
            if (error != null){
                reject(error);
            } else{
                if (results.affectedRows == 0 && !allowNoUpdate){
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

        if (Array.isArray(data)){
            for (let x = 0; x < data.length; x++){
                if (typeof data[x] == "string"){
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

        if (Array.isArray(data)){
            for (let x = 0; x < data.length; x++){
                if (typeof data[x] == "number"){
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
    const collection: DatabaseBrawlers = new Map<string, Map<string, number>>();
    try{
        const data = JSON.parse(brawlerString);

        for (let x in data){
            if (typeof x == "string" && typeof data[x] == "object"){
                const pinMap = new Map<string, number>();
                for (let y in data[x]){
                    if (typeof y == "string" && typeof data[x][y] == "number"){
                        pinMap.set(y, data[x][y]);
                    }
                }
                collection.set(x, pinMap);
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

    if (Array.isArray(data)){
        for (let x = 0; x < data.length; x++){
            const pin = data[x];

            if (typeof pin.brawler == "string" &&
            typeof pin.pin == "string" &&
            typeof pin.amount == "number" &&
            typeof pin.rarityValue == "number" &&
            typeof pin.rarityColor == "string"){
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

export function stringifyBrawlers(brawlers: DatabaseBrawlers): string{
    let result: {
        [k: string]: {
            [k: string]: number;
        };
    } = {};

    brawlers.forEach((value, key) => {
        result[key] = Object.fromEntries(value);
    });

    result = Object.keys(result).sort().reduce((object, key) => {
        object[key] = result[key];
        return object;
    }, {} as typeof result);
    
    return JSON.stringify(result);
}


// These functions send queries or updates to the database

export async function selectLastID(): Promise<LastInsertID[]>{
    return queryDatabase<never[], LastInsertID[]>(connection, [], false,
        "SELECT LAST_INSERT_ID() AS lastid");
}

export async function userLogin(values: LoginValues): Promise<LoginResult[]>{
    const valuesArray = [
        values.username, values.password
    ];
    return queryDatabase<typeof valuesArray, LoginResult[]>(connection, valuesArray, false,
        "SELECT username FROM " + TABLE_NAME + " WHERE username = ? AND password = ?;");
}

export async function createNewUser(values: NewUserValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.username, values.password, values.active_avatar, values.brawlers, "[]", "[]", "[]", "[]", ""
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "INSERT INTO " + TABLE_NAME + " (username, password, active_avatar, brawlers, avatars, themes, scenes, wild_card_pins, featured_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);");
}

export async function beforeUpdate(values: UsernameValues): Promise<BeforeUpdateResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeUpdateResult[]>(connection, valuesArray, false,
        "SELECT username, password, active_avatar, brawlers, avatars FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function updateAccount(values: UpdateAccountValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.newPassword, values.newAvatar, values.username, values.currentPassword
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET password = ?, active_avatar = ? WHERE username = ? AND password = ?;");
}

export async function getUnlockedCosmetics(values: UsernameValues): Promise<UnlockedCosmeticsResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, UnlockedCosmeticsResult[]>(connection, valuesArray, false,
        "SELECT themes, scenes FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function getActiveCosmetics(values: UsernameValues): Promise<ActiveCosmeticsResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, ActiveCosmeticsResult[]>(connection, valuesArray, false,
        "SELECT background, icon, music, scene FROM " + COSMETIC_TABLE_NAME + " WHERE username = ?;");
}

export async function updateCosmetics(values: UpdateCosmeticsValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.background, values.icon, values.music, values.scene, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + COSMETIC_TABLE_NAME + " SET background = ?, icon = ?, music = ?, scene = ? WHERE username = ?;");
}

export async function getLastClaim(values: UsernameValues): Promise<LastClaimResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, LastClaimResult[]>(connection, valuesArray, false,
        "SELECT username, last_claim, tokens, token_doubler FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function updateLastClaim(values: LastClaimValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_claim, values.tokens, values.token_doubler, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET last_claim = ?, tokens = ?, token_doubler = ? WHERE username = ?;");
}

export async function getResources(values: UsernameValues): Promise<ResourcesResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, ResourcesResult[]>(connection, valuesArray, false,
        "SELECT username, active_avatar, tokens, token_doubler, coins, trade_credits, brawlers, avatars, wild_card_pins FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function beforeShop(values: UsernameValues): Promise<BeforeShopResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeShopResult[]>(connection, valuesArray, false,
        "SELECT last_login, coins, trade_credits, brawlers, avatars, themes, scenes, featured_item FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function afterBrawlBox(values: BrawlBoxResultValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.brawlers, values.avatars, values.wild_card_pins, values.tokens, values.token_doubler, values.coins, values.trade_credits, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET brawlers = ?, avatars = ?, wild_card_pins = ?, tokens = ?, token_doubler = ?, coins = ?, trade_credits = ? WHERE username = ?;");
}

export async function updateFeaturedItem(values: FeaturedItemValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_login, values.featured_item, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET last_login = ?, featured_item = ? WHERE username = ?;");
}

export async function afterShop(values: ShopValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.last_login, values.coins, values.trade_credits, values.brawlers, values.avatars, values.themes, values.scenes, values.featured_item, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET last_login = ?, coins = ?, trade_credits = ?, brawlers = ?, avatars = ?, themes = ?, scenes = ?, featured_item = ? WHERE username = ?;");
}

export async function beforeTrade(values: UsernameValues): Promise<BeforeTradeResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, BeforeTradeResult[]>(connection, valuesArray, false,
        "SELECT brawlers, active_avatar, trade_credits, wild_card_pins FROM " + TABLE_NAME + " WHERE username = ?;");
}

export async function createTrade(values: TradeCreateValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.creator, values.creator_avatar, values.creator_color, values.offer, values.request, values.trade_credits, values.trade_credits_time, values.expiration
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "INSERT INTO " + TRADE_TABLE_NAME + " (creator, creator_avatar, creator_color, offer, request, trade_credits, trade_credits_time, expiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
}

export async function afterTrade(values: TradeUpdateValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.brawlers, values.wild_card_pins, values.trade_credits, values.username
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TABLE_NAME + " SET brawlers = ?, wild_card_pins = ?, trade_credits = ? WHERE username = ?;");
}

export async function getTradeAccept(values: TradeAcceptValues): Promise<TradeAcceptResult[]>{
    const valuesArray = [
        values.tradeid, values.minExpiration, values.accepted
    ];
    return queryDatabase<typeof valuesArray, TradeAcceptResult[]>(connection, valuesArray, false,
        "SELECT creator, offer, request, trade_credits FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ? AND expiration > ? AND accepted = ?;");
}

export async function afterTradeAccept(values: TradeAcceptUpdateValues): Promise<ResultSetHeader>{
    const valuesArray = [
        values.expiration, values.accepted, values.accepted_by, values.tradeid
    ];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "UPDATE " + TRADE_TABLE_NAME + " SET expiration = ?, accepted = ?, accepted_by = ? WHERE tradeid = ?;");
}

export async function getTradeClose(values: TradeIDValues): Promise<TradeCloseResult[]>{
    const valuesArray = [values.tradeid];
    return queryDatabase<typeof valuesArray, TradeCloseResult[]>(connection, valuesArray, false,
        "SELECT creator, offer, request, trade_credits, trade_credits_time, expiration, accepted, accepted_by FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ?;");
}

export async function afterTradeClose(values: TradeIDValues): Promise<ResultSetHeader>{
    const valuesArray = [values.tradeid];
    return updateDatabase<typeof valuesArray>(connection, valuesArray, false,
        "DELETE FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ?;");
}

export async function viewTradeID(values: TradeIDValues): Promise<TradeViewIDResult[]>{
    const valuesArray = [values.tradeid];
    return queryDatabase<typeof valuesArray, TradeViewIDResult[]>(connection, valuesArray, false,
        "SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration, accepted, accepted_by FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ?;");
}

export async function viewTradeUser(values: UsernameValues): Promise<TradeViewUserResult[]>{
    const valuesArray = [values.username];
    return queryDatabase<typeof valuesArray, TradeViewUserResult[]>(connection, valuesArray, true,
        "SELECT tradeid, offer, request, trade_credits, expiration, accepted FROM " + TRADE_TABLE_NAME + " WHERE creator = ?;");
}

export async function viewTradeAll(values: TradeViewAllValues): Promise<TradeViewAllResult[]>{
    const valuesArray = [
        values.filterString, values.minExpiration, values.limitStart, values.limitAmount
    ];
    return queryDatabase<typeof valuesArray, TradeViewAllResult[]>(connection, valuesArray, true,
        "SELECT tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration FROM " + TRADE_TABLE_NAME + " WHERE " + values.filterColumn + " LIKE ? AND expiration > ? ORDER BY " + values.sortString + " LIMIT ?, ?;");
}
