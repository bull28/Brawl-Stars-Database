import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {validateToken} from "./modules/authenticate";
import {getUnlockedUnitStats, getAllChallenges} from "./modules/accessories";

const router = express.Router();

router.use(cors());
router.use(bodyParser.urlencoded({extended: false}));

router.use((req, res, next) => {
    (bodyParser.json())(req, res, (error) => {
        if (typeof error !== "undefined"){
            res.status(400).send("Incorrectly formatted json.");
            return;
        }
        next();
    });
});


interface TokenReqBody{
    token: string;
}

// Get the users with the most challenge points
router.get("/leaderboard", (req, res) => {
    res.json([]);
    /*const results = await challengeLeaderboard({count: 50});
    res.json(results.map((value) => {
        return {
            username: value.username,
            avatar: AVATAR_IMAGE_DIR + value.active_avatar + IMAGE_FILE_EXTENSION,
            level: value.level,
            points: value.points,
            upgradePoints: getRequiredPoints(value.level)
        };
    }));*/
});

// Get all the units that a user can select
router.post<{}, {}, TokenReqBody>("/unit", (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        // checkChallengeRequirement contains at least as much information as necessary here
        /*const results = await checkChallengeRequirement({username: username});

        let accessories: DatabaseAccessories;
        try{
            accessories = parseStringArray(results[0].accessories);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        const units = getUnlockedUnitStats(accessories, results[0].level);*/
        const units = getUnlockedUnitStats([], 30);
        res.json(units);
    } else{
        res.status(401).send("Invalid token.");
    }
});

// Get all preset challenges
router.post<{}, {}, TokenReqBody>("/all", (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        /*const results = await completedChallenges({username: username});

        let completions: DatabaseCompletions;
        try{
            completions = parseNumberArray(results[0].completed);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        const challenges = getAllChallenges(completions);*/
        const challenges = getAllChallenges([]);
        res.json(challenges);
    } else{
        res.status(401).send("Invalid token.");
    }
});

// Get user's challenge win progress
router.post<{}, {}, TokenReqBody>("/progress", (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        /*const results = await completedChallenges({username: username});

        let nextReward = new SeasonTime(0, 0, 0, 0);
        const timeLeft = DAILY_CHALLENGE_REFRESH - Date.now() + results[0].last_win;

        if (timeLeft > 0){
            nextReward = addSeasonTimes(nextReward, new SeasonTime(0, 0, 0, Math.floor(Math.min(timeLeft, DAILY_CHALLENGE_REFRESH) / 1000)));
        }

        res.json({
            nextDailyBonus: nextReward,
            totalWins: results[0].total_wins
        });*/
        res.json({
            nextDailyBonus: {season: 1, hour: 0, minute: 0, second: 0, hoursPerSeason: 1, maxSeasons: 1},
            totalWins: 0
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);    
    next();
});

router.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
});

export default router;
