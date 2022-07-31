// This module reads all the required data from files

const fs = require("fs");
const maps = require("./maps.js");

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

exports.allSkinsPromise = readBrawlers();
exports.eventListPromise = readMaps();
