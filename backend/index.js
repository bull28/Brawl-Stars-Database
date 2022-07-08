const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// functions to search for brawlers and skins in json data
const skins = require("./modules/skins.js");

// functions to load the map rotation and create EventSlot objects
const maps = require("./modules/maps.js");

const app = express();
const port = 6969;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/image", express.static(path.join("assets", "images")));

// base directories of different files
const PORTRAIT_IMAGE_DIR = "portraits/";
const SKIN_IMAGE_DIR = "skins/";
const SKINGROUP_IMAGE_DIR = "misc/skingroups/backgrounds/";
const SKINGROUP_ICON_DIR = "misc/skingroups/icons/";
const GAMEMODE_IMAGE_DIR = "gamemodes/";
const MAP_IMAGE_DIR = "maps/";
const MAP_BANNER_DIR = "maps/banners/";


/**
 * Checks whether a json object is empty.
 * @param {Object} x 
 * @returns true if empty, false otherwise
 */
function isEmpty(x){
    var isEmpty = true;
    for (var y in x){
        isEmpty = false;
    }
    return isEmpty;
}

/**
 * Checks whether a time expressed as a string can be correctly
 * converted to an integer. If any of the expressions given for hour,
 * minute, and second are invalid, the function returns false.
 * @param {String} hour 
 * @param {String} minute 
 * @param {String} second 
 * @returns true if valid, false otherwise
 */
function isValidTime(hour, minute, second){
    var valid = true;
    if (isNaN(hour)){
        valid = false;
    } if (isNaN(minute)){
        valid = false;
    } if (isNaN(second)){
        valid = false;
    }
    return valid;
}

/**
 * Some skin images have an alternative image. This function checks
 * whether a skin has one and if so, return the path to it. The field
 * "exists" is also returned in the result, indicating whether the
 * image exists and the file path is valid.
 * @param {String} skinFile 
 * @returns json object
 */
function altImageExists(skinFile){
    var data = {
        "exists": false,
        "image": ""
    };

    const checkFile = skinFile.replace(".png", "_alt.png");
    data.exists = fs.existsSync("assets/images/" + checkFile);
    if (data.exists){
        data.image = checkFile;
    }
    return data;
}

/**
 * Goes through an array of event data and adds the correct directory
 * paths to all image files in each event.
 * @param {Array} events 
 */
function addAllPaths(events){
    for (x of events){
        x.gameMode = maps.addPathGameMode(x.gameMode, GAMEMODE_IMAGE_DIR);
        x.map = maps.addPathMap(x.map, MAP_IMAGE_DIR, MAP_BANNER_DIR);
    }
}



// Load the skins json object
var allSkins = [];
fs.readFile("assets/data/brawlers_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    allSkins = JSON.parse(data);
});

// Load the events json object
var eventList = [];
fs.readFile("assets/data/maps_data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let eventData = JSON.parse(data);

    eventList = maps.jsonToEvents(eventData);
});


// Does absolutely nothing
app.get("/", (req, res) => {
    res.send("frank bul el golm whac a king ash much fun");
});


//----------------------------------------------------------------------------------------------------------------------
// Operations relating to brawlers and skins


// Get the entire list of brawlers
app.get("/brawler", (req, res) => {
    var allBrawlers = [];

    for (let x of allSkins){
        // copy over the entire brawler's data, except for their skins
        // call /brawler/:brawler to get the skin list (too much data here)
        var brawlerData = {};
        for (let y in x){
            if (y != "skins"){
                brawlerData[y] = x[y];
            }
        }
        allBrawlers.push(brawlerData);
        /*
        if (x.hasOwnProperty("name") && x.hasOwnProperty("displayName")){
            allBrawlers.push({
                "name": x.name,
                "displayName": x.displayName
            });
        }
        */
    }
    res.json(allBrawlers);
});


// Get json data for a brawler, including their skins and portrait
app.get("/brawler/:brawler", (req, res) => {
    const brawler = req.params.brawler;


    // 1. Get the data

    let brawlerData = skins.getBrawler(allSkins, brawler);
    if (isEmpty(brawlerData)){
        res.status(404).send("Brawler not found.");
        return;
    }

    
    // 2. Copy data and find the file name
    
    // since the skins array has to be modified, a copy of the brawlerData
    // must be created so that the original is not modified
    var brawlerInfo = {};
    var portraitFile = PORTRAIT_IMAGE_DIR;//, "assets", "images");

    for (var x in brawlerData){
        // the user can't do anything with the portrait file so don't send it
        if (x == "portrait"){
            portraitFile = portraitFile + brawlerData[x];
        }
        else if (x != "skins"){
            brawlerInfo[x] = brawlerData[x];
        }
    }

    // 3. Modify any additional data elements

    // all information is copied from the original brawlerData to the new one
    // except for skins which will be added in below
    brawlerInfo["skins"] = [];
    
    if (brawlerData.hasOwnProperty("skins")){
        // go through all the brawler's skins and add their name to the brawler's skin list
        let brawlerSkins = brawlerData.skins;
        for (var x = 0; x < brawlerSkins.length; x++){
            if (brawlerSkins[x].hasOwnProperty("name") && brawlerSkins[x].hasOwnProperty("displayName")){
                brawlerInfo["skins"].push({
                    "name": brawlerSkins[x].name,
                    "displayName": brawlerSkins[x].displayName
                });
            }
        }
    }

    // 4. Set the image (this must be done last)

    brawlerInfo["image"] = portraitFile;

    // 5. Send the json data

    res.send(brawlerInfo);
});


// Get json data for a skin, including its image
app.get("/skin/:brawler/:skin", (req, res) => {
    const brawler = req.params.brawler;
    const skin = req.params.skin;

    // 1. Get the data

    // first, search through the json to see if the brawler name is valid
    let brawlerData = skins.getBrawler(allSkins, brawler);
    if (isEmpty(brawlerData)){
        res.status(404).send("Brawler or skin not found.");
        return;
    } if (!(brawlerData.hasOwnProperty("name"))){
        res.status(404).send("Brawler has no name!");
        return;
    }

    // if the brawler name is valid, search through that brawler's skins
    let skinData = skins.getSkin(brawlerData, skin);
    if (isEmpty(skinData)){
        res.status(404).send("Skin not found.");
        return;
    }

    // 2. Copy data and find the file name
    
    var skinInfo = {};
    var skinFile = SKIN_IMAGE_DIR;
    var groupData = {};

    for (var x in skinData){
        // do not copy the image, instead add it to the file path
        if (x == "image"){
            skinFile = skinFile + brawlerData.name + "/" + skinData.image;
        }
        // for the group, go into the group object and change its image to match the path
        else if (x == "group"){
            for (var y in skinData[x]){
                if (y == "image"){
                    groupData[y] = SKINGROUP_IMAGE_DIR + skinData[x][y];
                } else if (y == "icon"){
                    groupData[y] = SKINGROUP_ICON_DIR + skinData[x][y];
                } else{
                    groupData[y] = skinData[x][y];
                }
            }
            skinInfo[x] = groupData;
        } else{
            skinInfo[x] = skinData[x];
        }
    }

    // 3. Modify any additional data elements (this step is not necesssary here)

    // 4. Set the image (this must be done last)

    skinInfo["image"] = skinFile;
    skinInfo["altImage"] = altImageExists(skinFile);

    // 5. Send the json data

    res.json(skinInfo);
});


//----------------------------------------------------------------------------------------------------------------------
// Operations relating to maps and game modes


// Get the entire list of game modes
app.get("/gamemode", (req, res) => {
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
app.get("/gamemode/:gamemode", (req, res) => {
    const gameMode = req.params.gamemode;

    let gameModeData = maps.getModeInformation(eventList, gameMode);
    if (isEmpty(gameModeData)){
        res.status(404).send("Game mode not found.");
        return;
    }

    // copy gameModeData into gameModeInfo while adding the image's file path
    var gameModeInfo = maps.addPathGameMode(gameModeData, GAMEMODE_IMAGE_DIR);

    res.json(gameModeInfo);
});


// Get json data for a map, including its game mode and image
app.get("/map/:map", (req, res) => {
    const map = req.params.map;

    const currentTime = maps.realToTime(Date.now());

    
    let mapData = maps.getMapInformation(eventList, map);
    if (isEmpty(mapData)){
        res.status(404).send("Map not found.");
        return;
    } if (!(mapData.hasOwnProperty("gameMode"))){
        res.status(404).send("Map does not know which game mode it is in!");
        return;
    }


    // copy mapData into mapInfo while adding the image and banner's file paths
    var mapInfo = maps.addPathMap(mapData, MAP_IMAGE_DIR, MAP_BANNER_DIR);

    // Add the next appearance time
    const mapTime = maps.getMapStartDelay(eventList, map, currentTime);

    if (mapTime.season > 0){
        res.status(404).send("Map either does not exist or never appears.");
        return;
    }
    mapInfo["next"] = mapTime;


    res.json(mapInfo);
});


// Get currently active events
app.get("/event/current", (req, res) => {
    const currentTime = maps.realToTime(Date.now());

    var eventsInfo = {};

    let activeEvents = maps.getAllActiveEvents(eventList, currentTime);
    addAllPaths(activeEvents);

    eventsInfo["time"] = currentTime;
    eventsInfo["events"] = activeEvents;

    res.json(eventsInfo);
});


// Get the next event starting in every event slot
app.get("/event/upcoming", (req, res) => {
    const currentTime = maps.realToTime(Date.now());

    var eventsInfo = {};

    let activeEvents = maps.getAllUpcomingEvents(eventList, currentTime);
    addAllPaths(activeEvents);

    eventsInfo["time"] = currentTime;
    eventsInfo["events"] = activeEvents;

    res.json(eventsInfo);
});


// Get events active at any time in the season
app.get("/event/time/:hour/:minute/:second", (req, res) => {
    const hourString = req.params.hour;
    const minuteString = req.params.minute;
    const secondString = req.params.second;

    var time = new maps.SeasonTime(0, 0, 0, 0);

    var eventsInfo = {};

    if (isValidTime(hourString, minuteString, secondString) == false){
        res.status(400).send("Invalid input.");
        return;
    }

    time.hour = maps.mod(parseInt(hourString), maps.MAP_CYCLE_HOURS);
    time.minute = maps.mod(parseInt(minuteString), 60);
    time.second = maps.mod(parseInt(secondString), 60);

    let activeEvents = maps.getAllActiveEvents(eventList, time);
    addAllPaths(activeEvents);

    eventsInfo["time"] = time;
    eventsInfo["events"] = activeEvents;

    res.json(eventsInfo);
});


// Get events active a time interval later in the season
app.get("/event/later/:hour/:minute/:second", (req, res) => {
    const hourString = req.params.hour;
    const minuteString = req.params.minute;
    const secondString = req.params.second;

    const currentTime = maps.realToTime(Date.now());
    var deltaTime = new maps.SeasonTime(0, 0, 0, 0);

    var eventsInfo = {};

    if (isValidTime(hourString, minuteString, secondString) == false){
        res.status(400).send("Invalid input.");
        return;
    }

    const deltaHours = parseInt(hourString);

    deltaTime.season = Math.floor(deltaHours / maps.MAP_CYCLE_HOURS);
    deltaTime.hour = maps.mod(deltaHours, maps.MAP_CYCLE_HOURS);
    deltaTime.minute = maps.mod(parseInt(minuteString), 60);
    deltaTime.second = maps.mod(parseInt(secondString), 60);

    deltaTime = maps.addSeasonTimes(currentTime, deltaTime);

    let activeEvents = maps.getAllActiveEvents(eventList, deltaTime);
    addAllPaths(activeEvents);

    eventsInfo["time"] = deltaTime;
    eventsInfo["events"] = activeEvents;

    res.json(eventsInfo);
});

//----------------------------------------------------------------------------------------------------------------------
// Error handler for missing and invalid files


app.use((error, req, res, next) => {
    console.error(error.stack);//??????????????
    if (error.type == "FILE_DOES_NOT_EXIST"){
        res.send("ASH THREW THAT FILE IN THE TRASH ! ! !");
    }
    
    next();
});


//----------------------------------------------------------------------------------------------------------------------

app.listen(port, () => console.log(port));