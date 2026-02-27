import {Request, Response, NextFunction} from "express";
import {Query, ParamsDictionary} from "express-serve-static-core";
import accessoryList from "../data/accessories_data.json";
import characterList from "../data/characters_data.json";
import {createError, createCustomError} from "../modules/utils";
import {tables, getErrorMessage, queryDatabase, updateDatabase, transactionUpdate, transaction} from "./database_access";
import {validateToken} from "./account_module";
import {Empty, UserCharacter, UserAccessory, UserResources} from "../types";

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
        view.setUint16(x * CHARACTER_BYTES, characters[x].tier, true);
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
        const progress = ((accessories[x].unlocked ? 1 : 0) << 31) | accessories[x].badges;
        view.setInt32(x * ACCESSORY_BYTES, progress, true);
    }

    return Buffer.from(buffer);
}

export const bufferUtils = {
    CHARACTER_BYTES, ACCESSORY_BYTES,
    bufferToCharacters, bufferToAccessories, charactersToBuffer, accessoriesToBuffer
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
    })
}
