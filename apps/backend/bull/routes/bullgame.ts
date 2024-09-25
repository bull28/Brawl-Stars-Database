import express from "express";
import path from "path";
import fs from "fs/promises";
import {GAME_ASSETS_DIR} from "../data/constants";
import {Empty} from "../types";

const router = express.Router();


const rootPath = path.join(__dirname, "../..", GAME_ASSETS_DIR);


interface BullgameReqBody{
    data: string;
}


// Get the classic game with no modifications
router.get("/", (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"));
});

// Get a modified version of the game
router.post<Empty, string, BullgameReqBody>("/", async (req, res) => {
    if (req.body.data === undefined){
        res.status(400).send("No game modification provided.");
        return;
    }

    let gameMod = "{}";

    try{
        const gameModObject = JSON.parse(req.body.data);
        if (typeof gameModObject !== "object" || Array.isArray(gameModObject) === true){
            throw new Error();
        }

        gameMod = JSON.stringify(gameModObject);
    } catch (error){
        res.status(403).send("Invalid game modification provided.");
        return;
    }

    let text = "";

    try{
        text = await fs.readFile(path.join(rootPath, "custom.html"), {encoding: "utf-8"});
    } catch (error){
        res.status(500).send("An error occurred while setting up the game.");
        return;
    }

    const page = text.replace("`{}`", `\`${gameMod}\``);
    res.send(page);
});

// Get a custom level from a file
router.get<{level: string;}>("/:level", async (req, res) => {
    const levelName = req.params.level;

    if (levelName === undefined || levelName === ""){
        res.status(400).send("No level provided.");
        return;
    }

    const fileName = path.join(rootPath, "levels", `${levelName}.html`);

    try{
        await fs.access(fileName, fs.constants.R_OK);
    } catch (error){
        res.status(404).send("Could not find the level.");
        return;
    }

    res.sendFile(fileName);
});

export default router;
