import fspromises from "fs/promises";

export async function readFreeAvatars(): Promise<string[]>{
    return fspromises.readdir("assets/images/avatars/free")
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readSpecialAvatars(): Promise<string[]>{
    return fspromises.readdir("assets/images/avatars/special")
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readFreeThemes(): Promise<string[]>{
    return fspromises.readdir("assets/images/themes/free")
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readSpecialThemes(): Promise<string[]>{
    return fspromises.readdir("assets/images/themes/special")
    .then((result) => {
        for (let x = 0; x < result.length; x++){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => []);
}

export async function readScenes(){
    return fspromises.readdir("assets/images/scenes")
    .then((result) => result)
    .catch((error) => []);
}
