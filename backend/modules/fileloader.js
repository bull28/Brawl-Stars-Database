// This module reads all the required data from files

const fs = require("fs");
const maps = require("./maps");

async function readBrawlers(){
    return fs.promises.readFile("assets/data/brawlers_data.json", "utf8")
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
    return fs.promises.readFile("assets/data/maps_data.json", "utf8")
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

async function readFreeAvatars(){
    return fs.promises.readdir("assets/images/avatars/free")
    .then((result) => {
        for (let x in result){
            result[x] = "avatars/free/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

async function readSpecialAvatars(){
    return fs.promises.readdir("assets/images/avatars/special")
    .then((result) => {
        for (let x in result){
            result[x] = "avatars/special/" + result[x];
        }
        return result;
    })
    .catch((error) => {
        return [];
    });
}

exports.allSkinsPromise = readBrawlers();
exports.eventListPromise = readMaps();
exports.freeAvatarsPromise = readFreeAvatars();
exports.specialAvatarsPromise = readSpecialAvatars();
