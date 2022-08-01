// This route contains operations relating to static information about maps and game modes

const express = require("express");
const router = express.Router();

// functions to load the map rotation and create EventSlot objects
const maps = require("../modules/maps");

// base directories of image files
const filePaths = require("../modules/filepaths");
const GAMEMODE_IMAGE_DIR = filePaths.GAMEMODE_IMAGE_DIR;
const MAP_IMAGE_DIR = filePaths.MAP_IMAGE_DIR;
const MAP_BANNER_DIR = filePaths.MAP_BANNER_DIR;


// Load the events json object
var eventList = [];
const eventListPromise = require("../modules/fileloader.js").eventListPromise;
eventListPromise.then((data) => {
    if (data !== undefined){
        eventList = data;
    }
});


/**
 * Checks whether a json object is empty.
 * @param {Object} x the object
 * @returns true if empty, false otherwise
 */
function isEmpty(x){
    var isEmpty = true;
    for (var y in x){
        isEmpty = false;
    }
    return isEmpty;
}


//----------------------------------------------------------------------------------------------------------------------


// Get the entire list of game modes
router.get("/gamemode", (req, res) => {
    var allGameModes = [];

    // used to make sure there are no duplicate game modes in the return value
    var alreadyChecked = [];

    // go through all the events and then go through every event's game modes
    // and add the game mode's name and display name

    for (let x of eventList){
        if (x.hasOwnProperty("gameModes")){
            for (let y of x.gameModes){
                if (y.hasOwnProperty("name") && y.hasOwnProperty("displayName")){
                    if (alreadyChecked.includes(y.name) == false){
                        alreadyChecked.push(y.name);
                        allGameModes.push({
                            "name":y.name,
                            "displayName":y.displayName
                        });
                    }                    
                }                
            }
        }
    }
    res.json(allGameModes);
});


// Get json data for a game mode, including its list of maps and icon
router.get("/gamemode/:gamemode", (req, res) => {
    const gameMode = req.params.gamemode;

    let gameModeData = maps.getModeInformation(eventList, gameMode);
    if (isEmpty(gameModeData)){
        res.status(404).send("Game mode not found.");
        return;
    }

    // directly modify gameModeData by adding the image's file path
    var gameModeInfo = maps.addPathGameMode(gameModeData, GAMEMODE_IMAGE_DIR);

    res.json(gameModeInfo);
});


// Get json data for a map, including its game mode and image
router.get("/map/:map", (req, res) => {
    const map = req.params.map;

    const currentTime = maps.realToTime(Date.now());

    
    let mapData = maps.getMapInformation(eventList, map, currentTime);
    if (isEmpty(mapData)){
        res.status(404).send("Map not found.");
        return;
    } if (!(mapData.hasOwnProperty("gameMode"))){
        res.status(404).send("Map does not know which game mode it is in!");
        return;
    }

    // directly modify mapData by adding the image and banner's file paths
    var mapInfo = maps.addPathMap(mapData, MAP_IMAGE_DIR, MAP_BANNER_DIR, GAMEMODE_IMAGE_DIR);

    res.json(mapInfo);
});


// Search for a specific map by its name
router.post("/mapsearch", (req, res) => {
    var search = req.body;
    //if the json is not formatted correctly, error will be thrown above
    
    const searchResult = maps.searchForMapName(eventList, search, GAMEMODE_IMAGE_DIR);
    res.json(searchResult);
});

module.exports = router;
