// This module reads all the required data from files

const fspromises = require("fs/promises");
const maps = require("./maps");

async function readBrawlers(){
    return fspromises.readFile("assets/data/brawlers_data.json", "utf8")
    .then((result) => {
        const allSkins = JSON.parse(result);
        return allSkins;
    })
    .catch((error) => {
        // If unsuccessful, return an empty array instead of undefined
        return [];
    });
}

async function readMaps(){
    return fspromises.readFile("assets/data/maps_data.json", "utf8")
    .then((result) => {
        const eventData = JSON.parse(result);
        const eventList = maps.jsonToEvents(eventData);
        return eventList;
    })
    .catch((error) => {
        // If unsuccessful, return an empty array instead of undefined
        return [];
    });
}

async function readBrawlBox(){
    return fspromises.readFile("assets/data/brawlbox_data.json", "utf8")
    .then((result) => {
        const brawlBoxData = JSON.parse(result);
        return brawlBoxData;
    })
    .catch((error) => {
        return {};
    });
}

async function readShop(){
    return fspromises.readFile("assets/data/coinsshop_data.json", "utf8")
    .then((result) => {
        const shopData = JSON.parse(result);
        return shopData;
    })
    .catch((error) => {
        return {};
    });
}

async function readFileMaps(){
    return fspromises.readFile("assets/data/files_data.json", "utf8")
    .then((result) => {
        const fileMap = JSON.parse(result);
        return fileMap;
    })
    .catch((error) => {
        return {};
    });
}

async function readFreeAvatars(){
    return fspromises.readdir("assets/images/avatars/free")
    .then((result) => {
        for (let x in result){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

async function readSpecialAvatars(){
    return fspromises.readdir("assets/images/avatars/special")
    .then((result) => {
        for (let x in result){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

async function readFreeThemes(){
    return fspromises.readdir("assets/images/themes/free")
    .then((result) => {
        for (let x in result){
            result[x] = "free/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

async function readSpecialThemes(){
    return fspromises.readdir("assets/images/themes/special")
    .then((result) => {
        for (let x in result){
            result[x] = "special/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

async function readScenes(){
    return fspromises.readdir("assets/images/scenes")
    .then((result) => {
        return result;
    })
    .catch((error) => {
        return [];
    });
}

exports.allSkinsPromise = readBrawlers();
exports.eventListPromise = readMaps();
exports.dropChancesPromise = readBrawlBox();
exports.freeAvatarsPromise = readFreeAvatars();
exports.specialAvatarsPromise = readSpecialAvatars();
exports.freeThemesPromise = readFreeThemes();
exports.specialThemesPromise = readSpecialThemes();
exports.scenesPromise = readScenes();
exports.shopDataPromise = readShop();
exports.fileMapsPromise = readFileMaps();
