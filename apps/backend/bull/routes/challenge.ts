import express from "express";
import {getMasteryLevel} from "../modules/accessories";
import {getGameMod} from "../modules/challenges";
import {databaseErrorHandler, parseNumberArray, parseChallengeWaves, beforeAccessory, getChallenge, acceptChallenge} from "../modules/database";
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

    if (results[0].accepted !== 0){
        res.status(403).send("This challenge has already been accepted.");
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

    // When the game makes a request for the challenge data, it will set the active challenge's accepted value to 1. If
    // the accepted value is 1, any more requests for that same challenge will not be allowed. This prevents the user
    // from refreshing the page and restarting the challenge if they were about to lose.
    await acceptChallenge({key: key});
    res.json(mod);
}));

export default router;
