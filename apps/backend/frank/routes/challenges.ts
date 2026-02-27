import express from "express";
import {randomUUID} from "crypto";
import {createError} from "../modules/utils";
import {challengeExists, getChallengeList, validateUserGameMod, getGameMod} from "../modules/challenges_module";
import {databaseErrorHandler, loginErrorHandler, getResources, getActiveChallenge, acceptActiveChallenge, replaceActiveChallenge} from "../modules/database";
import {Empty, UserSetGameMod} from "../types";

const router = express.Router();


interface ChallengeKeyReqBody{
    key: string;
    settings: UserSetGameMod;
}

interface ChallengeStartReqBody{
    challengeid: string;
}

// Get all challenges that can be started
router.get("/", loginErrorHandler(async (req, res) => {
    const challenges = getChallengeList();
    res.json({challenges: challenges});
}));

// Get game modification data for an active challenge
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(400).json(createError("ChallengesGetMissing"));
        return;
    }

    // Only add the game preferences settings to the game modification if the object is valid
    const settings = req.body.settings;
    const prefs: UserSetGameMod = validateUserGameMod(settings) ? settings : {};

    // Get the challenge ID from the active challenge record
    const challenge = await getActiveChallenge({key: key});

    if (challenge === undefined){
        res.status(404).json(createError("ChallengesGetNotFound"));
        return;
    }
    if (challenge.accepted !== 0){
        res.status(403).json(createError("ChallengesAccepted"));
        return;
    }

    const resources = await getResources({username: challenge.accepted_by});

    // Using the challenge ID, get the game modification object for that challenge
    const mod = getGameMod(challenge.challengeid, key, resources, prefs);
    if (mod === undefined){
        res.status(404).json(createError("ChallengesGetNotFound"));
        return;
    }

    // Accept the challenge in the database
    await acceptActiveChallenge({key: key});

    res.json(mod);
}));

// Find a challenge and set it as active for the current user
router.post<Empty, Empty, ChallengeStartReqBody>("/start", loginErrorHandler<ChallengeStartReqBody>(async (req, res, username) => {
    const challengeid = req.body.challengeid;
    if (typeof challengeid !== "string"){
        res.status(400).json(createError("ChallengesStartMissing"));
        return;
    }

    // Check that the challenge id is valid
    if (challengeExists(challengeid) === false){
        res.status(404).json(createError("ChallengesStartNotFound"));
        return;
    }

    const key: string = randomUUID();

    await replaceActiveChallenge({key: key, challengeid: challengeid, gamemode: 2, username: username});

    res.json({key: key});
}));


export default router;
