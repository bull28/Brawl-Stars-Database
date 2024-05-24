import express from "express";
import {randomUUID} from "crypto";
import {CHALLENGE_REPORT_COST} from "../data/constants";
import {getMasteryLevel} from "../modules/accessories";
import {createChallengeData, getChallengeStrength, getStaticGameMod, getKeyGameMod} from "../modules/challenges";
import {
    databaseErrorHandler, 
    loginErrorHandler, 
    transaction, 
    parseStringArray, 
    parseNumberArray, 
    parseChallengeWaves, 
    getResources, 
    setTokens, 
    beforeAccessory, 
    createActiveChallenge, 
    getActiveChallenge, 
    acceptActiveChallenge, 
    deleteActiveChallenge, 
    createChallenge, 
    getChallenge, 
    deleteChallenge
} from "../modules/database";
import {Empty, DatabaseAccessories, ChallengeWave, UserWaves} from "../types";

const router = express.Router();


interface ChallengeKeyReqBody{
    key: string;
}

interface ChallengeCreateReqBody{
    waves: UserWaves;
}

interface ChallengeStartReqBody{
    // Later, this will not be necessary when there is automatic challenge matchmaking
    challengeid: number;
}

// Get game modification data for an active challenge
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(404).send("Challenge not found.");
        return;
    }

    // Challenge keys with length less than 30 identify static challenges that are the same for all players. They can be
    // played as many times as the player wishes to for free. If one of these challenges allows the player to save their
    // score, they input their username at the end of the game like in classic mode.
    if (key.length <= 30){
        const mod = getStaticGameMod(key);
        if (mod === undefined){
            res.status(404).send("Challenge not found.");
            return;
        }
        res.json(mod);
        return;
    }

    const results = await getActiveChallenge({key: key});

    if (results.length === 0){
        res.status(404).send("Challenge not found.");
        return;
    }
    if (results[0].accepted !== 0){
        res.status(403).send("This challenge has already been accepted.");
        return;
    }

    const stats: number[] = parseNumberArray(results[0].stats);
    const waves: ChallengeWave[] = parseChallengeWaves(results[0].waves);

    const userData = await beforeAccessory({username: results[0].accepted_by});
    const mastery = getMasteryLevel(userData[0].points);
    const accessories: DatabaseAccessories = parseStringArray(userData[0].accessories);

    const mod = getKeyGameMod(key, mastery.level, accessories, {
        owner: results[0].owner,
        difficulty: results[0].difficulty,
        levels: results[0].levels,
        stats: stats,
        waves: waves
    });

    // When the game makes a request for the challenge data, it will set the active challenge's accepted value to 1. If
    // the accepted value is 1, any future requests for that same challenge will not be allowed. This prevents the user
    // from refreshing the page and trying the challenge again if they were about to lose.
    await acceptActiveChallenge({key: key});
    res.json(mod);
}));

// Create a new challenge
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

    const strength = getChallengeStrength(challengeData);

    await transaction(async (connection) => {
        // Each user can only have one challenge at a time so delete any existing challenge before creating a new one
        await deleteChallenge({username: username}, connection);
        await createChallenge({
            username: username,
            strength: strength,
            difficulty: challengeData.difficulty,
            levels: challengeData.levels,
            stats: JSON.stringify(challengeData.stats),
            waves: JSON.stringify(challengeData.waves)
        }, connection);
    });

    res.send("Challenge successfully created");
}));

// Find a challenge and set it as active for the current user
router.post<Empty, Empty, ChallengeStartReqBody>("/start", loginErrorHandler<ChallengeStartReqBody>(async (req, res, username) => {
    const challengeid = req.body.challengeid;
    if (typeof challengeid !== "number"){
        res.status(400).send("Invalid challenge id.");
        return;
    }

    // Tokens are deducted when creating a challenge but claiming the reward from that challenge is free
    const results = await getResources({username: username});
    let tokens = results[0].tokens;

    if (tokens < CHALLENGE_REPORT_COST){
        res.status(403).send("You cannot afford to start a challenge!");
        return;
    }
    tokens -= CHALLENGE_REPORT_COST;

    // Check that the challenge with the given id actually exists before adding an active challenge with that id
    const challenges = await getChallenge({challengeid: challengeid});
    if (challenges.length === 0){
        res.status(404).send("Challenge does not exist.");
        return;
    }

    // Send a list of enemies that will appear in the challenge to the user
    const waves: ChallengeWave[] = parseChallengeWaves(challenges[0].waves);
    const enemies = new Set<string>();
    for (let x = 0; x < waves.length; x++){
        for (let i = 0; i < waves[x].enemies.length; i++){
            enemies.add(waves[x].enemies[i]);
        }
    }

    const key: string = randomUUID();

    await transaction(async (connection) => {
        await setTokens({tokens: tokens, username: username}, connection);
        await deleteActiveChallenge({key: "", username: username}, connection);
        await createActiveChallenge({
            key: key,
            challengeid: challengeid,
            username: username
        }, connection);
    });

    res.json({
        key: key,
        displayName: `${challenges[0].username}'s Challenge`,
        enemies: Array.from(enemies)
    });
}));

export default router;
