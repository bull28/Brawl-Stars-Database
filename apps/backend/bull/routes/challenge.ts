import express from "express";
import {getMasteryLevel} from "../modules/accessories";
import {getGameMod} from "../modules/challenges";
import {databaseErrorHandler, parseNumberArray, parseChallengeWaves, beforeAccessory, getChallenge} from "../modules/database";
import {Empty, TokenReqBody, ChallengeWave} from "../types";

const router = express.Router();


interface ChallengeKeyReqBody{
    key: string;
}

// Get the list of all accessories
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(404).send("Challenge not found.");
        return;
    }
    const results = await getChallenge({key: key});

    if (results.length === 0){
        res.status(404).send("Challenge not found.");
        return;
    }
    const stats: number[] = parseNumberArray(results[0].stats);
    const waves: ChallengeWave[] = parseChallengeWaves(results[0].waves);

    // Only the mastery points are required from this data
    const userData = await beforeAccessory({username: results[0].accepted_by});
    const mastery = getMasteryLevel(userData[0].points);

    const mod = getGameMod(key, mastery.level, {
        owner: results[0].owner,
        difficulty: results[0].difficulty,
        levels: results[0].levels,
        stats: stats,
        waves: waves
    });
    res.json(mod);
}));

export default router;
