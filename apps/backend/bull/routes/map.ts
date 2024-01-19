import express from "express";
import {events, getModeData, getMapData, searchForMapName, realToTime} from "../modules/maps";
import {Empty, GameModePreview, MapSearchPreview} from "../types";

const router = express.Router();


interface MapSearchReqBody{
    search: string;
}


// Get the entire list of game modes
router.get("/gamemode", (req, res) => {
    const allGameModes: GameModePreview[] = [];
    const alreadyChecked: string[] = [];

    for (let x = 0; x < events.length; x++){
        for (let y = 0; y < events[x].gameModes.length; y++){
            const gameMode = events[x].gameModes[y];
            if (Object.hasOwn(gameMode, "name") === true && 
            Object.hasOwn(gameMode, "displayName") === true &&
            alreadyChecked.includes(gameMode.name) === false){
                alreadyChecked.push(gameMode.name);
                allGameModes.push({
                    name: gameMode.name,
                    displayName: gameMode.displayName
                });
            }
        }
    }

    res.json(allGameModes);
});

// Get data for a game mode, including its list of maps and icon
router.get("/gamemode/:gamemode", (req, res) => {
    const gameMode = req.params.gamemode;

    const gameModeData = getModeData(events, gameMode);
    if (gameModeData === undefined){
        res.status(404).send("Game mode not found.");
        return;
    }

    res.json(gameModeData);
});

// Get data for a map, including its game mode and image
router.get("/map/:map", (req, res) => {
    const map = req.params.map;

    const mapData = getMapData(events, map, realToTime(Date.now()));
    if (mapData === undefined){
        res.status(404).send("Map not found.");
        return;
    }

    res.json(mapData);
});

// Search for a specific map by its name
router.post<Empty, MapSearchPreview[], MapSearchReqBody>("/mapsearch", (req, res) => {
    const search = req.body;

    if (typeof search.search !== "string"){
        res.json([]);
        return;
    }

    const searchResult = searchForMapName(events, search);
    res.json(searchResult);
});

export default router;
