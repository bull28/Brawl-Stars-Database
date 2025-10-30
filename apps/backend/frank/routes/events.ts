import express from "express";
import {createError} from "../modules/utils";
import {getMapData, getModeData, searchForMapName, getAllModes, getCurrentEvents} from "../modules/events_module";
import {Empty, ApiError, MapSearchPreview, CurrentEvents} from "../types";

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

router.get<EventsParams, ApiError | CurrentEvents, Empty, TimeQuery>("/events/:time", (req, res) => {
    const timeSetting = req.params.time;
    const currentTime = Date.now();

    const secondString = req.query.second;

    if (timeSetting === "current"){
        const activeEvents = getCurrentEvents(currentTime);
        res.json(activeEvents);
        return;
    } else if (timeSetting === "worldtime"){
        if (isNaN(Number(secondString)) === true){
            res.status(400).json(createError("EventsInvalidWorldTime"));
            return;
        }

        const time = parseInt(secondString) * 1000;

        const activeEvents = getCurrentEvents(time);
        res.json(activeEvents);
        return;
    }

    res.status(400).json(createError("EventsInvalidSetting"));
});

// Get the entire list of game modes
router.get("/gamemodes", (req, res) => {
    const allGameModes = getAllModes();
    res.json({gamemodes: allGameModes});
});

// Get data for a game mode, including its list of maps and icon
router.get("/gamemodes/:gamemode", (req, res) => {
    const gameMode = req.params.gamemode;

    const gameModeData = getModeData(gameMode);
    if (gameModeData === undefined){
        res.status(404).json(createError("GameModesNotFound"));
        return;
    }

    res.json(gameModeData);
});

// Get data for a map, including its game mode and image
router.get("/maps/:map", (req, res) => {
    const map = req.params.map;

    const mapData = getMapData(map, Date.now());
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

    const searchResult = searchForMapName(search);
    res.json({results: searchResult});
});


export default router;
