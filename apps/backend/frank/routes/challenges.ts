import express from "express";
import {randomUUID} from "crypto";
import {challengeExists, getChallengeList, getStaticGameMod} from "../modules/challenges_module";
import {databaseErrorHandler, loginErrorHandler, getResources, getActiveChallenge, acceptActiveChallenge, replaceActiveChallenge} from "../modules/database";
import {Empty} from "../types";

const router = express.Router();


interface ChallengeKeyReqBody{
    key: string;
}

interface ChallengeStartReqBody{
    challengeid: string;
}

// Get all challenges that can be started
router.get("/", loginErrorHandler(async (req, res, username) => {
    const challenges = getChallengeList();
    res.json(challenges);
}));

// Get game modification data for an active challenge
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(400).send("No Challenge specified.");
        return;
    }

    // Get the challenge ID from the active challenge record
    const challenge = await getActiveChallenge({key: key});

    if (challenge === undefined){
        res.status(404).send("Challenge not found.");
        return;
    }
    if (challenge.accepted !== 0){
        res.status(403).send("This challenge has already been accepted.");
        return;
    }

    const resources = await getResources({username: challenge.accepted_by});

    // Using the challenge ID, get the game modification object for that challenge
    const mod = getStaticGameMod(challenge.challengeid, key, resources);
    if (mod === undefined){
        res.status(404).send("Challenge not found");
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
        res.status(400).send("Invalid challenge ID.");
        return;
    }

    // Check that the challenge id is valid
    if (challengeExists(challengeid) === false){
        res.status(404).send("Challenge does not exist.");
        return;
    }

    const key: string = randomUUID();

    await replaceActiveChallenge({key: key, challengeid: challengeid, username: username});

    res.json({key: key});
}));


export default router;
