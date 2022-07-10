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
app.use(bodyParser.text());
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
 * @param {String} skinFile file path to the skin's default file
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
 * Accepts an array of events which each consist of a current game mode and map.
 * Then, goes through an event's game mode and map and applies the proper file
 * paths to any of their images. Finally, adds the season time provided and
 * returns a json object.
 * @param {Array} events list of EventSlot objects
 * @param {SeasonTime} seasonTime time used in the calculation of current and upcoming events
 * @returns json object
 */
function formatEvents(events, seasonTime){
    var eventsInfo = {};

    // events is an array of event objects
    for (let x of events){
        // y iterates through the individual event objects, going through their
        // "current", "upcoming", and "timeLeft". do not add images for the "timeLeft".
        for (let y in x){
            if (y == "current" || y == "upcoming"){
                //console.log(x[y]);
                x[y].gameMode = maps.addPathGameMode(x[y].gameMode, GAMEMODE_IMAGE_DIR);
                x[y].map = maps.addPathMap(x[y].map, MAP_IMAGE_DIR, MAP_BANNER_DIR);
            }
        }
    }

    eventsInfo["time"] = seasonTime;
    eventsInfo["events"] = events;

    return eventsInfo;
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
        // call /brawler/:brawler to get the skin list and description (too much data here)
        var brawlerData = {};
        for (let y in x){
            if (y != "skins" && y != "description"){
                brawlerData[y] = x[y];
            }
        }
        allBrawlers.push(brawlerData);
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

    
    let mapData = maps.getMapInformation(eventList, map, currentTime);
    if (isEmpty(mapData)){
        res.status(404).send("Map not found.");
        return;
    } if (!(mapData.hasOwnProperty("gameMode"))){
        res.status(404).send("Map does not know which game mode it is in!");
        return;
    }


    // copy mapData into mapInfo while adding the image and banner's file paths
    var mapInfo = maps.addPathMap(mapData, MAP_IMAGE_DIR, MAP_BANNER_DIR);

    res.json(mapInfo);
});


// Search for a specific map by its name
app.post("/mapsearch", (req, res) => {
    if (req.get("Content-Type") != "text/plain"){
        res.status(400).send("Map search query must be plain text.");
        return;
    }
    const searchResult = maps.searchForMapName(eventList, req.body);
    res.json(searchResult);
});


// Get currently active events
app.get("/event/current", (req, res) => {
    const currentTime = maps.realToTime(Date.now());
    
    let activeEvents = maps.getAllEvents(eventList, currentTime);
    let eventsInfo = formatEvents(activeEvents, currentTime);

    res.json(eventsInfo);
});


// Get events active using a season time
app.get("/event/seasontime/:hour/:minute/:second", (req, res) => {
    const hourString = req.params.hour;
    const minuteString = req.params.minute;
    const secondString = req.params.second;

    var time = new maps.SeasonTime(0, 0, 0, 0);


    if (isValidTime(hourString, minuteString, secondString) == false){
        res.status(400).send("Invalid input.");
        return;
    }

    time.hour = maps.mod(parseInt(hourString), maps.MAP_CYCLE_HOURS);
    time.minute = maps.mod(parseInt(minuteString), 60);
    time.second = maps.mod(parseInt(secondString), 60);

    let activeEvents = maps.getAllEvents(eventList, time);
    let eventsInfo = formatEvents(activeEvents, time);

    res.json(eventsInfo);
});


// Get events active a time interval later in the season
app.get("/event/later/:hour/:minute/:second", (req, res) => {
    const hourString = req.params.hour;
    const minuteString = req.params.minute;
    const secondString = req.params.second;

    const currentTime = maps.realToTime(Date.now());
    var deltaTime = new maps.SeasonTime(0, 0, 0, 0);

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

    let activeEvents = maps.getAllEvents(eventList, deltaTime);
    let eventsInfo = formatEvents(activeEvents, deltaTime);

    res.json(eventsInfo);
});


// Get currently active events
app.get("/event/worldtime/:second", (req, res) => {
    const realSeconds = req.params.second;

    if (isNaN(realSeconds)){
        res.status(400).send("Invalid input.");
        return;
    }

    const time = maps.realToTime(realSeconds * 1000);

    let activeEvents = maps.getAllEvents(eventList, time);
    let eventsInfo = formatEvents(activeEvents, time);

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