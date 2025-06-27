import express from "express";
import {createError} from "../modules/utils";
import {events, SeasonTime, realToTime, getAllEvents, addSeasonTimes, isValidTimeQuery, getModeData, getMapData, searchForMapName} from "../modules/events_module";
import {Empty, ApiError, CurrentEventsData, GameModePreview, MapSearchPreview} from "../types";

const router = express.Router();


interface EventsParams{
    time: string;
}

interface TimeQuery{
    hour: string;
    minute: string;
    second: string;
}

interface MapSearchQuery{
    search: string;
}

interface MapSearchResult{
    results: MapSearchPreview[];
}

router.get<EventsParams, ApiError | CurrentEventsData, Empty, TimeQuery>("/events/:time", (req, res) => {
    const timeSetting = req.params.time;
    const currentTime = realToTime(Date.now());

    const hourString = req.query.hour;
    const minuteString = req.query.minute;
    const secondString = req.query.second;

    if (timeSetting === "current"){
        const activeEvents = getAllEvents(events, currentTime);
        res.json(activeEvents);
        return;
    }

    let time: SeasonTime | undefined;

    if (timeSetting === "worldtime"){
        if (isNaN(Number(secondString)) === true){
            res.status(400).json(createError("EventsInvalidWorldTime"));
            return;
        }
    
        const time = realToTime(parseInt(secondString) * 1000);
    
        const activeEvents = getAllEvents(events, time);
    
        res.json(activeEvents);
        return;
    }

    if (isValidTimeQuery(hourString, minuteString, secondString) === false){
        res.status(400).json(createError("EventsInvalidSeasonTime"));
        return;
    }

    if (timeSetting === "seasontime"){
        time = addSeasonTimes(
            new SeasonTime(0, 0, 0, 0), 
            new SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
        );
    } else if (timeSetting === "later"){
        time = addSeasonTimes(
            currentTime,
            new SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
        );
    }

    if (time === undefined){
        res.status(400).json(createError("EventsInvalidSetting"));
        return;
    }

    const activeEvents = getAllEvents(events, time);
    res.json(activeEvents);
});

// Get the entire list of game modes
router.get("/gamemodes", (req, res) => {
    const allGameModes: GameModePreview[] = [];
    const alreadyChecked = new Set<string>();

    for (let x = 0; x < events.length; x++){
        for (let y = 0; y < events[x].gameModes.length; y++){
            const gameMode = events[x].gameModes[y];
            if (Object.hasOwn(gameMode, "name") === true && 
            Object.hasOwn(gameMode, "displayName") === true &&
            alreadyChecked.has(gameMode.name) === false){
                alreadyChecked.add(gameMode.name);
                allGameModes.push({
                    name: gameMode.name,
                    displayName: gameMode.displayName
                });
            }
        }
    }

    res.json({gamemodes: allGameModes});
});

// Get data for a game mode, including its list of maps and icon
router.get("/gamemodes/:gamemode", (req, res) => {
    const gameMode = req.params.gamemode;

    const gameModeData = getModeData(events, gameMode);
    if (gameModeData === undefined){
        res.status(404).json(createError("GameModesNotFound"));
        return;
    }

    res.json(gameModeData);
});

// Get data for a map, including its game mode and image
router.get("/maps/:map", (req, res) => {
    const map = req.params.map;

    const mapData = getMapData(events, map, realToTime(Date.now()));
    if (mapData === undefined){
        res.status(404).json(createError("MapsNotFound"));
        return;
    }

    res.json(mapData);
});

// Search for a specific map by its name
router.get<Empty, MapSearchResult, Empty, MapSearchQuery>("/mapsearch", (req, res) => {
    const search = req.query.search;

    if (typeof search !== "string"){
        res.json({results: []});
        return;
    }

    const searchResult = searchForMapName(events, search);
    res.json({results: searchResult});
});


export default router;
