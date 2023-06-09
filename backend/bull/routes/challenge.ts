import express from "express";
import {DAILY_CHALLENGE_REFRESH} from "../data/constants";
import {validateToken} from "../modules/authenticate";
import {SeasonTime, addSeasonTimes} from "../modules/maps";
import {getUnlockedUnitStats, getAllChallenges} from "../modules/accessories";
import {databaseErrorHandler, parseStringArray, parseNumberArray, checkChallengeRequirement, completedChallenges} from "../modules/database";
import {DatabaseAccessories, DatabaseCompletions} from "../types";

const router = express.Router();


interface TokenReqBody{
    token: string;
}

// Get all the units that a user can select
router.post<{}, {}, TokenReqBody>("/unit", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        // checkChallengeRequirement contains at least as much information as necessary here
        const results = await checkChallengeRequirement({username: username});

        let accessories: DatabaseAccessories;
        try{
            accessories = parseStringArray(results[0].accessories);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        const units = getUnlockedUnitStats(accessories, results[0].level);
        res.json(units);
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Get all preset challenges
router.post<{}, {}, TokenReqBody>("/all", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        const results = await completedChallenges({username: username});

        let completions: DatabaseCompletions;
        try{
            completions = parseNumberArray(results[0].completed);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        const challenges = getAllChallenges(completions);
        res.json(challenges);
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Get user's challenge win progress
router.post<{}, {}, TokenReqBody>("/progress", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        const results = await completedChallenges({username: username});

        let nextReward = new SeasonTime(0, 0, 0, 0);
        const timeLeft = DAILY_CHALLENGE_REFRESH - Date.now() + results[0].last_win;

        if (timeLeft > 0){
            nextReward = addSeasonTimes(nextReward, new SeasonTime(0, 0, 0, Math.floor(Math.min(timeLeft, DAILY_CHALLENGE_REFRESH) / 1000)));
        }

        res.json({
            nextDailyBonus: nextReward,
            totalWins: results[0].total_wins
        });
    } else{
        res.status(401).send("Invalid token.");
    }
}));

export default router;
