import express from "express";
import {randomUUID} from "crypto";
import allEnemies from "../data/enemies_data.json";
import {SKIN_IMAGE_DIR, PIN_IMAGE_DIR, CHALLENGE_REPORT_COST} from "../data/constants";
import {getMasteryLevel} from "../modules/accessories";
import {getChallengeUpgrades, createChallengeData, getChallengeStrength, getStaticGameMod, getKeyGameMod} from "../modules/challenges";
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
    getAllChallenges, 
    deleteChallenge
} from "../modules/database";
import {Empty, DatabaseAccessories, EnemyData, ChallengeWave, UserWaves} from "../types";

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

// Get the list of all enemies
router.get("/enemies", (req, res) => {
    const enemies: EnemyData[] = [];

    for (const x in allEnemies){
        const data = allEnemies[x as keyof typeof allEnemies];

        // The image is the a brawler pin, the full image is a brawler skin
        enemies.push({
            name: x,
            displayName: data.displayName,
            image: (data.image !== "" ? PIN_IMAGE_DIR + data.image : ""),
            fullImage: (data.fullImage !== "" ? SKIN_IMAGE_DIR + data.fullImage : ""),
            description: data.description,
            strengthTier: data.strengthTier,
            value: data.value,
            health: data.health,
            speed: data.speed,
            attacks: data.attacks,
            enemies: data.enemies
        });
    }

    res.json(enemies);
});

// Get upgrades for challenges
router.get("/upgrades", loginErrorHandler(async (req, res, username) => {
    const userData = await beforeAccessory({username: username});
    const upgrades = getChallengeUpgrades(getMasteryLevel(userData[0].points).level);
    res.json(upgrades);
}));

// Get all challenges that a player can directly play
router.get("/all", loginErrorHandler(async (req, res, username) => {
    const results = await getAllChallenges({username: username});
    res.json(results);
}));

// Get game modification data for an active challenge
router.post<Empty, Empty, ChallengeKeyReqBody>("/get", databaseErrorHandler<ChallengeKeyReqBody>(async (req, res) => {
    const key = req.body.key;
    if (typeof key !== "string"){
        res.status(404).send("Challenge not found.");
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

    const userData = await beforeAccessory({username: results[0].accepted_by});
    const mastery = getMasteryLevel(userData[0].points);
    const accessories: DatabaseAccessories = parseStringArray(userData[0].accessories);

    // Challenges with a non-empty preset value identify static levels that are not in the challenge game mode but
    // require some player progression/upgrades data. These challenges do not cost tokens to start and the player saves
    // their progress at the end of the level like in classic mode.
    if (results[0].preset !== ""){
        const mod = getStaticGameMod(results[0].preset, mastery.level, accessories);
        if (mod === undefined){
            res.status(404).send("Challenge not found.");
            return;
        }
        res.json(mod);
        return;
    }

    const stats: number[] = parseNumberArray(results[0].stats);
    const waves: ChallengeWave[] = parseChallengeWaves(results[0].waves);
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
            preset: "",
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
        res.status(400).send("Invalid challenge ID.");
        return;
    }

    const results = await getResources({username: username});
    let tokens = results[0].tokens;

    // Check that the challenge with the given id actually exists before adding an active challenge with that id
    const challenges = await getChallenge({challengeid: challengeid});
    if (challenges.length === 0){
        res.status(404).send("Challenge does not exist.");
        return;
    }

    let waves: ChallengeWave[] = [];
    const enemies = new Set<string>();

    if (challenges[0].preset === ""){
        // Non-preset challenges cost tokens to start but are free to claim
        if (tokens < CHALLENGE_REPORT_COST){
            res.status(403).send("You cannot afford to start a challenge!");
            return;
        }
        tokens -= CHALLENGE_REPORT_COST;

        // For non-preset challenges, send a list of enemies that will appear in the challenge to the user
        waves = parseChallengeWaves(challenges[0].waves);
        for (let x = 0; x < waves.length; x++){
            for (let i = 0; i < waves[x].enemies.length; i++){
                enemies.add(waves[x].enemies[i]);
            }
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
        displayName: (challenges[0].preset === "" ? `${challenges[0].username}'s Challenge` : challenges[0].username),
        enemies: Array.from(enemies)
    });
}));

export default router;
