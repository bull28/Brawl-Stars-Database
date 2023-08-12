import fspromises from "fs/promises";
import {ASSETS_ROOT_DIR} from "../data/constants";

export async function readFreeAvatars(): Promise<string[]>{
    return fspromises.readdir(`${ASSETS_ROOT_DIR}avatars/free`)
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readSpecialAvatars(): Promise<string[]>{
    return fspromises.readdir(`${ASSETS_ROOT_DIR}avatars/special`)
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readFreeThemes(): Promise<string[]>{
    return fspromises.readdir(`${ASSETS_ROOT_DIR}themes/free`)
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readSpecialThemes(): Promise<string[]>{
    return fspromises.readdir(`${ASSETS_ROOT_DIR}themes/special`)
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readScenes(): Promise<string[]>{
    return fspromises.readdir(`${ASSETS_ROOT_DIR}scenes`)
    .then((result) => ["default"].concat(result))
    .catch((error) => []);
}
