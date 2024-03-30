import express from "express";
import {getMasteryLevel} from "../modules/accessories";
import {getGameMod, createChallengeData} from "../modules/challenges";
import {
    databaseErrorHandler, 
    loginErrorHandler, 
    transaction, 
    parseNumberArray, 
    parseChallengeWaves, 
    beforeAccessory, 
    getActiveChallenge, 
    acceptActiveChallenge, 
    createChallenge, 
    deleteChallenge
} from "../modules/database";
import {Empty, TokenReqBody, ChallengeWave, UserWaves} from "../types";

const router = express.Router();


interface ChallengeKeyReqBody{
    key: string;
}

interface ChallengeCreateReqBody extends TokenReqBody{
    waves: UserWaves;
}

// Get the list of all accessories
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(404).send("Challenge not found.");
        return;
    }
    const results = await getActiveChallenge({key: key});

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
    await acceptActiveChallenge({key: key});
    res.json(mod);
}));

router.post<Empty, Empty, ChallengeCreateReqBody>("/create", loginErrorHandler<ChallengeCreateReqBody>(async (req, res, username) => {
    if (req.body.waves === undefined || Array.isArray(req.body.waves) === false){
        res.status(400).send("Challenge waves incorrectly formatted.");
        return;
    }
    const userData = await beforeAccessory({username: username});
    const mastery = getMasteryLevel(userData[0].points);

    const challenge = createChallengeData(mastery.level, req.body.waves);
    const challengeData = challenge.data;

    if (challengeData === undefined){
        res.status(403).send(challenge.message);
        return;
    }

    await transaction(async (connection) => {
        // Each user can only have one challenge at a time so delete any existing challenge before creating a new one
        await deleteChallenge({username: username}, connection);
        await createChallenge({
            username: username,
            difficulty: challengeData.difficulty,
            levels: challengeData.levels,
            stats: JSON.stringify(challengeData.stats),
            waves: JSON.stringify(challengeData.waves)
        }, connection);
    });

    res.json("Challenge successfully created");
}));

export default router;
