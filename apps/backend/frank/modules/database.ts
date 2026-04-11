import {Request, Response, NextFunction} from "express";
import {Query, ParamsDictionary} from "express-serve-static-core";
import accessoryList from "../data/accessories_data.json";
import characterList from "../data/characters_data.json";
import {createError, createCustomError} from "../modules/utils";
import {tables, getErrorMessage, queryDatabase, updateDatabase, transactionUpdate, transaction} from "./database_access";
import {validateToken} from "./account_module";
import {Empty, UserCharacter, UserAccessory, UserResources, TrialData} from "../types";

type ExpressCallback<R, Q, P> = (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => void;

type UsernameCallback<R, Q, P> = (req: Request<P, Empty, R, Q>, res: Response, username: string, next: NextFunction) => void;

export function databaseErrorHandler<R = Empty, Q = Query, P = ParamsDictionary>(callback: ExpressCallback<R, Q, P>): ExpressCallback<R, Q, P>{
    return (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => {
        Promise.resolve(callback(req, res, next)).catch((reason: unknown) => {
            const errorData = getErrorMessage(reason as Error);
            res.status(errorData.status).json(createCustomError("Error", errorData.message, errorData.message));
        });
    };
}

export function loginErrorHandler<R = Empty, Q = Query, P = ParamsDictionary>(callback: UsernameCallback<R, Q, P>): ExpressCallback<R, Q, P>{
    return (req: Request<P, Empty, R, Q>, res: Response, next: NextFunction) => {
        if (typeof req.headers.authorization !== "string"){
            res.status(400).json(createError("GeneralTokenMissing"));
            return;
        }
        const [authType, token] = req.headers.authorization.split(" ");
        if (authType.toLowerCase() !== "bearer" || token === undefined){
            res.status(400).json(createError("GeneralTokenMissing"));
            return;
        }

        const validateResult = validateToken(token);

        if (validateResult.status === 2){
            res.status(401).json(createError("GeneralTokenExpired"));
            return;
        }
        if (validateResult.status !== 0){
            res.status(401).json(createError("GeneralTokenInvalid"));
            return;
        }

        Promise.resolve(callback(req, res, validateResult.username, next)).catch((reason: unknown) => {
            const errorData = getErrorMessage(reason as Error);
            res.status(errorData.status).json(createCustomError("Error", errorData.message, errorData.message));
        });
    };
}


const CHARACTER_BYTES = 2;
const ACCESSORY_BYTES = 4;
const TRIAL_BYTES = 2;
const TRIAL_HEADER_VALUES = 5;
const TRIAL_VALUE_TYPES = 9;

function bufferToCharacters(buffer: Uint8Array): UserCharacter[]{
    const characters: UserCharacter[] = [];
    const len = characterList.length;

    if (buffer.length !== len * CHARACTER_BYTES){
        return [];
    }

    const array = new DataView(Uint8Array.from(buffer).buffer);

    for (let x = 0; x < len; x++){
        const tier = array.getUint16(x * CHARACTER_BYTES, true);
        characters.push({
            name: characterList[x].name, tier: tier
        });
    }
    return characters;
}

function charactersToBuffer(characters: UserCharacter[]): Uint8Array{
    const len = characterList.length;

    const buffer = new ArrayBuffer(len * CHARACTER_BYTES);
    const view = new DataView(buffer);

    if (characters.length !== len){
        return Buffer.from(buffer);
    }

    for (let x = 0; x < len; x++){
        view.setUint16(x * CHARACTER_BYTES, Math.min(0xffff, characters[x].tier), true);
    }

    return Buffer.from(buffer);
}

function bufferToAccessories(buffer: Uint8Array): UserAccessory[]{
    const accessories: UserAccessory[] = [];
    const len = accessoryList.length;

    if (buffer.length !== len * ACCESSORY_BYTES){
        return [];
    }

    const array = new DataView(Uint8Array.from(buffer).buffer);

    for (let x = 0; x < len; x++){
        const progress = array.getInt32(x * ACCESSORY_BYTES, true);
        accessories.push({
            name: accessoryList[x].name,
            badges: progress & 0x7fffffff,
            unlocked: (progress >>> 31) === 1
        });
    }
    return accessories;
}

function accessoriesToBuffer(accessories: UserAccessory[]): Uint8Array{
    const len = accessoryList.length;

    const buffer = new ArrayBuffer(len * ACCESSORY_BYTES);
    const view = new DataView(buffer);

    if (accessories.length !== len){
        return Buffer.from(buffer);
    }

    for (let x = 0; x < len; x++){
        const progress = ((accessories[x].unlocked ? 1 : 0) << 31) | Math.min(0x7fffffff, accessories[x].badges);
        view.setInt32(x * ACCESSORY_BYTES, progress, true);
    }

    return Buffer.from(buffer);
}

function bufferToTrial(buffer: Uint8Array): TrialData | undefined{
    if (buffer.length < (TRIAL_HEADER_VALUES + TRIAL_VALUE_TYPES) * TRIAL_BYTES){
        return undefined;
    }

    const array = new DataView(Uint8Array.from(buffer).buffer);
    const header: number[] = [];
    const values: number[][] = [];
    const valueLengths: number[] = [];

    let totalLength = TRIAL_HEADER_VALUES + TRIAL_VALUE_TYPES;
    for (let x = 0; x < TRIAL_VALUE_TYPES; x++){
        const l = array.getUint16((x + TRIAL_HEADER_VALUES) * TRIAL_BYTES, true);
        totalLength += l;
        valueLengths.push(l);
        values.push([]);
    }

    if (buffer.length !== totalLength * TRIAL_BYTES){
        return undefined;
    }

    for (let x = 0; x < TRIAL_HEADER_VALUES; x++){
        header.push(array.getUint16(x * TRIAL_BYTES, true));
    }

    const trial: TrialData = {
        trialid: header[0], level: header[1], state: header[2], progress: header[3], selected: header[4],
        scores: [], rewards: {lastScore: 0, coins: 0, mastery: 0, badges: 0, quality: 0, specialBoxes: 0},
        resources: {power: 0, gears: 0, accessories: 0, hyper: 0, credits: 0},
        upgrades: {health: 0, damage: 0, healing: 0, lifeSteal: 0, critical: 0, combo: 0, speed: 0, ability: 0},
        characterTiers: [], characterBuilds: [], accessories: [], powerups: [], maxBuilds: 0
    };

    let offset = header.length + values.length;
    let y = 0;
    for (let x = 0; x < values.length - 1; x++){
        for (y = 0; y < valueLengths[x]; y++){
            values[x].push(array.getUint16((offset + y) * TRIAL_BYTES, true));
        }
        offset += y;
    }

    const upgradesKeys = Object.keys(trial.upgrades) as (keyof TrialData["upgrades"])[];
    const rewardsKeys = Object.keys(trial.rewards) as (keyof TrialData["rewards"])[];
    const resourcesKeys = Object.keys(trial.resources) as (keyof TrialData["resources"])[];

    trial.scores = values[1];
    trial.accessories = values[4];
    trial.powerups = values[5];
    trial.characterTiers = values[6];
    trial.characterBuilds = values[7];

    for (y = 0; y < upgradesKeys.length; y++){
        trial.upgrades[upgradesKeys[y]] = values[0][y];
    }
    for (y = 0; y < rewardsKeys.length; y++){
        trial.rewards[rewardsKeys[y]] = values[2][y];
    }
    for (y = 0; y < resourcesKeys.length; y++){
        trial.resources[resourcesKeys[y]] = values[3][y];
    }
    trial.maxBuilds = trial.characterBuilds.length + valueLengths[valueLengths.length - 1];

    return trial;
}

function trialToBuffer(trial: TrialData): Uint8Array{
    const header: number[] = [
        trial.trialid, trial.level, trial.state, trial.progress, trial.selected
    ];
    const values: number[][] = [
        Object.values(trial.upgrades), trial.scores, Object.values(trial.rewards), Object.values(trial.resources),
        trial.accessories, trial.powerups, trial.characterTiers, trial.characterBuilds, []
    ];

    let totalLength = header.length + values.length;
    let offset = totalLength;
    const valueLengths: number[] = [];

    for (let x = 0; x < values.length - 1; x++){
        totalLength += values[x].length;
        valueLengths.push(values[x].length);
    }
    const padding = Math.max(0, trial.maxBuilds - trial.characterBuilds.length);
    totalLength += padding;
    valueLengths.push(padding);

    const buffer = new ArrayBuffer(totalLength * TRIAL_BYTES);
    const view = new DataView(buffer);

    if (values.length !== valueLengths.length){
        return Buffer.from(buffer);
    }

    for (let x = 0; x < header.length; x++){
        view.setUint16(x * TRIAL_BYTES, header[x], true);
    }

    let y = 0;
    for (let x = 0; x < valueLengths.length; x++){
        for (y = 0; y < values[x].length; y++){
            view.setUint16((offset + y) * TRIAL_BYTES, values[x][y], true);
        }
        view.setUint16((x + header.length) * TRIAL_BYTES, valueLengths[x], true);
        offset += y;
    }

    return Buffer.from(buffer);
}

export const bufferUtils = {
    CHARACTER_BYTES, ACCESSORY_BYTES, TRIAL_BYTES, TRIAL_HEADER_VALUES, TRIAL_VALUE_TYPES,
    bufferToCharacters, bufferToAccessories, bufferToTrial,
    charactersToBuffer, accessoriesToBuffer, trialToBuffer
};


interface UsernameValues{
    username: string;
}


interface LoginResult{
    username: string;
    password: string;
    menu_theme: string;
}
export async function userLogin(values: UsernameValues): Promise<LoginResult | undefined>{
    const results = await queryDatabase<LoginResult>([values.username], true,
        `SELECT username, password, menu_theme FROM ${tables.users} WHERE username = ?;`
    );
    if (results.length !== 1){
        return undefined;
    }
    return results[0];
}


interface NewUserValues{
    username: string;
    password: string;
}
export async function createNewUser(values: NewUserValues): Promise<void>{
    const characters = new ArrayBuffer(characterList.length * CHARACTER_BYTES);
    const accessories = new ArrayBuffer(accessoryList.length * ACCESSORY_BYTES);
    await updateDatabase([values.username, values.password, Buffer.from(characters), Buffer.from(accessories)], false,
        `INSERT INTO ${tables.users} (username, password, characters, accessories) VALUES(?, ?, ?, ?);`
    );
}


interface UpdateAccountValues{
    newPassword: string;
    newTheme: string;
    username: string;
}
export async function updateAccount(values: UpdateAccountValues): Promise<void>{
    await updateDatabase([values.newPassword, values.newTheme, values.username], false,
        `UPDATE ${tables.users} SET password = ?, menu_theme = ? WHERE username = ?;`
    );
}


interface ResourcesResult{
    mastery: number;
    coins: number;
    characters: Uint8Array;
    accessories: Uint8Array;
    last_save: number;
    menu_theme: string;
}
export async function getResources(values: UsernameValues): Promise<UserResources>{
    const results = await queryDatabase<ResourcesResult>([values.username], true,
        `SELECT mastery, coins, characters, accessories, last_save, menu_theme FROM ${tables.users} WHERE username = ?;`
    );

    if (results.length === 0){
        throw new Error("Could not get resources from the database.");
    }

    const resources = results[0];
    const characters = bufferToCharacters(resources.characters);
    const accessories = bufferToAccessories(resources.accessories);

    return {
        coins: resources.coins,
        mastery: resources.mastery,
        characters: characters,
        accessories: accessories,
        last_save: resources.last_save,
        menu_theme: resources.menu_theme
    };
}


interface SetResourcesValues{
    resources: UserResources;
    username: string;
}
export async function setResources(values: SetResourcesValues): Promise<void>{
    const resources = values.resources;
    const characters = charactersToBuffer(resources.characters);
    const accessories = accessoriesToBuffer(resources.accessories);
    await updateDatabase([resources.mastery, resources.coins, Buffer.from(characters.buffer), Buffer.from(accessories.buffer), resources.last_save, values.username], false,
        `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ?, accessories = ?, last_save = ? WHERE username = ?;`
    );
}


interface ActiveChallengeValues{
    key: string;
}
interface ActiveChallengeResult{
    challengeid: string;
    gamemode: number;
    accepted_by: string;
    accepted: number;
}

export async function getActiveChallenge(values: ActiveChallengeValues): Promise<ActiveChallengeResult | undefined>{
    const results = await queryDatabase<ActiveChallengeResult>([values.key], true,
        `SELECT challengeid, gamemode, accepted_by, accepted FROM ${tables.challenges} WHERE active_key = ?;`
    );
    if (results.length === 0){
        return undefined;
    }
    return results[0];
}


interface AcceptChallengeValues{
    key: string;
}
export async function acceptActiveChallenge(values: AcceptChallengeValues): Promise<void>{
    await updateDatabase([values.key], false,
        `UPDATE ${tables.challenges} SET accepted = 1 WHERE active_key = ?;`
    );
}


interface ReplaceChallengeValues{
    key: string;
    challengeid: string;
    gamemode: number;
    username: string;
}
export async function replaceActiveChallenge(values: ReplaceChallengeValues): Promise<void>{
    await transaction(async (connection) => {
        await transactionUpdate(connection, [values.username], true, `DELETE FROM ${tables.challenges} WHERE accepted_by = ?`);
        await transactionUpdate(connection, [values.key, values.challengeid, values.gamemode, values.username], false, `INSERT INTO ${tables.challenges} (active_key, challengeid, gamemode, accepted_by) VALUES (?, ?, ?, ?);`);
    });
}


interface DeleteChallengeValues{
    key: string | undefined;
    resources: UserResources;
    username: string;
}
export async function deleteActiveChallenge(values: DeleteChallengeValues): Promise<void>{
    // Deletes an active challenge and updates the user's resources
    await transaction(async (connection) => {
        const key = values.key;
        const resources = values.resources;
        const accessories = accessoriesToBuffer(resources.accessories);
        // If a key was provided then this game report was from a challenge
        if (key !== undefined){
            await transactionUpdate(connection, [key], true, `DELETE FROM ${tables.challenges} WHERE active_key = ?;`);
        }
        // Characters are never changed after saving a report so they are not updated here
        await transactionUpdate(connection, [resources.mastery, resources.coins, Buffer.from(accessories.buffer), resources.last_save, values.username], false,
            `UPDATE ${tables.users} SET mastery = ?, coins = ?, accessories = ?, last_save = ? WHERE username = ?;`
        );
    });
}


interface TrialResult{
    trial_data: Uint8Array;
}
export async function getActiveTrial(values: UsernameValues): Promise<TrialData | undefined>{
    const results = await queryDatabase<TrialResult>([values.username], true,
        `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`
    );
    if (results.length === 0){
        return undefined;
    }

    return bufferToTrial(results[0].trial_data);
}


interface UpdateTrialValues{
    trial: TrialData;
    username: string;
    replace?: boolean;
}
export async function updateActiveTrial(values: UpdateTrialValues): Promise<void>{
    const trial = trialToBuffer(values.trial);
    await transaction(async (connection) => {
        if (values.replace === true){
            await transactionUpdate(connection, [values.username], true, `DELETE FROM ${tables.trials} WHERE username = ?;`);
            await transactionUpdate(connection, [Buffer.from(trial.buffer), values.username], false,
                `INSERT INTO ${tables.trials} (trial_data, username) VALUES (?, ?);`
            );
        }
        await transactionUpdate(connection, [Buffer.from(trial.buffer), values.username], false,
            `UPDATE ${tables.trials} SET trial_data = ? WHERE username = ?;`
        );
    });
}


interface DeleteTrialValues{
    resources: UserResources;
    username: string;
}
export async function deleteActiveTrial(values: DeleteTrialValues): Promise<void>{
    await transaction(async (connection) => {
        const resources = values.resources;
        const accessories = accessoriesToBuffer(resources.accessories);

        await transactionUpdate(connection, [values.username], true, `DELETE FROM ${tables.trials} WHERE username = ?;`);
        await transactionUpdate(connection, [resources.mastery, resources.coins, Buffer.from(accessories.buffer), values.username], false,
            `UPDATE ${tables.users} SET mastery = ?, coins = ?, accessories = ? WHERE username = ?;`
        );
    })
}
