// This route contains operations relating to the rotation of maps and game modes

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
const eventListPromise = require("../modules/fileloader").eventListPromise;
eventListPromise.then((data) => {
    if (data !== undefined){
        eventList = data;
    }
});


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
                // these should all be copies of the original data so modifying them directly
                // should not cause any problems...
                x[y].gameMode = maps.addPathGameMode(x[y].gameMode, GAMEMODE_IMAGE_DIR);
                x[y].map = maps.addPathMap(x[y].map, MAP_IMAGE_DIR, MAP_BANNER_DIR, GAMEMODE_IMAGE_DIR);
            }
        }
    }

    eventsInfo["time"] = seasonTime;
    eventsInfo["events"] = events;

    return eventsInfo;
}


//----------------------------------------------------------------------------------------------------------------------


// Get currently active events
router.get("/current", (req, res) => {
    const currentTime = maps.realToTime(Date.now());
    
    let activeEvents = maps.getAllEvents(eventList, currentTime);
    let eventsInfo = formatEvents(activeEvents, currentTime);

    res.json(eventsInfo);
});


// Get events active using a season time
router.get("/seasontime", (req, res) => {
    const hourString = req.query.hour;
    const minuteString = req.query.minute;
    const secondString = req.query.second;

    if (isValidTime(hourString, minuteString, secondString) == false){
        res.status(400).send("Invalid input.");
        return;
    }

    const time = maps.addSeasonTimes(
        new maps.SeasonTime(0, 0, 0, 0), 
        new maps.SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
    );

    let activeEvents = maps.getAllEvents(eventList, time);
    let eventsInfo = formatEvents(activeEvents, time);

    res.json(eventsInfo);
});


// Get events active a time interval later in the season
router.get("/later", (req, res) => {
    const hourString = req.query.hour;
    const minuteString = req.query.minute;
    const secondString = req.query.second;

    const currentTime = maps.realToTime(Date.now());

    if (isValidTime(hourString, minuteString, secondString) == false){
        res.status(400).send("Invalid input.");
        return;
    }

    const deltaTime = maps.addSeasonTimes(
        currentTime,
        new maps.SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
    );

    let activeEvents = maps.getAllEvents(eventList, deltaTime);
    let eventsInfo = formatEvents(activeEvents, deltaTime);

    res.json(eventsInfo);
});


// Get currently active events
router.get("/worldtime", (req, res) => {
    const realSeconds = req.query.second;

    if (isNaN(realSeconds)){
        res.status(400).send("Invalid input.");
        return;
    }

    const time = maps.realToTime(realSeconds * 1000);

    let activeEvents = maps.getAllEvents(eventList, time);
    let eventsInfo = formatEvents(activeEvents, time);

    res.json(eventsInfo);
});

module.exports = router;
