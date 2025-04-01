import express from "express";
import {validateReport, extractReportData, challengeRewards} from "../modules/report_module";
import {databaseErrorHandler, getActiveChallenge, getResources, deleteActiveChallenge} from "../modules/database";
import {Empty, UserResources, GameReport} from "../types";

const router = express.Router();


interface SaveReqBody{
    username: string;
    key?: string;
    title?: string;
    report: GameReport;
}

// Save a game report
router.post<Empty, Empty, SaveReqBody>("/", databaseErrorHandler<SaveReqBody>(async (req, res) => {
    const body = {message: "", mastery: 0, coins: 0};

    const inputUser = req.body.username;
    const key = req.body.key;
    const report = req.body.report;

    let saveToUser = "";
    let masteryMultiplier = 0;
    let coinsMultiplier = 0;

    if (validateReport(report) !== 0){
        body.message = "Invalid report.";
        res.status(403).json(body);
        return;
    }

    const reportData = extractReportData(report[2]);
    if (reportData === undefined){
        body.message = "Invalid report.";
        res.status(403).json(body);
        return;
    }

    const gameMode = reportData.gameMode;
    const endTime = report[1];
    if (typeof key === "string"){
        // In all other game modes, a key is used to identify the challenge. The key is stored in the database with its
        // corresponding username so the user to save the report to can be determined using only the key.

        // Get the username associated with the given challenge key then save the report with that username
        const challenge = await getActiveChallenge({key: key});
        if (challenge === undefined){
            body.message = "Challenge not found.";
            res.status(404).json(body);
            return;
        }
        if (challenge.accepted !== 1){
            body.message = "This challenge has not been accepted yet.";
            res.status(403).json(body);
            return;
        }

        saveToUser = challenge.accepted_by;

        const rewards = challengeRewards(challenge.challengeid, reportData.player.difficulty, reportData.score.win);
        masteryMultiplier = rewards.mastery;
        coinsMultiplier = rewards.coins;
    } else if (gameMode === 0){
        if (typeof inputUser !== "string" || inputUser.length === 0){
            body.message = "Username is missing.";
            res.status(400).json(body);
            return;
        }

        saveToUser = inputUser;
        masteryMultiplier = 1;
        coinsMultiplier = 1;
    } else{
        body.message = "Username is missing.";
        res.status(400).json(body);
        return;
    }

    // This endpoint needs to return json so override the default error handler in getResources that would send text
    let resources: UserResources;
    try{
        resources = await getResources({username: saveToUser});
    } catch (error){
        body.message = "User who started this game was not found.";
        res.status(404).json(body);
        return;
    }

    // If the current game ended before or at the same time as the last save in the database, the current report is a
    // duplicate and should not be added to the database. The value of last save should only ever increase.
    if (endTime <= resources.last_save){
        body.message = "Cannot save the same game more than once.";
        res.status(403).json(body);
        return;
    }

    // Add mastery
    const masteryReward = reportData.points * masteryMultiplier;
    resources.mastery += masteryReward;

    // Add coins
    const coinsReward = Math.floor((reportData.coins[0] + (reportData.coins[1] - reportData.coins[0]) / 2) * coinsMultiplier);
    resources.coins += coinsReward;

    // Add badges
    const badges = reportData.badges;
    for (let x = 0; x < resources.accessories.length; x++){
        const badgeReward = badges.get(resources.accessories[x].name);
        if (badgeReward !== undefined){
            resources.accessories[x].badges += badgeReward;
        }
    }

    // Set last save to now
    resources.last_save = endTime;

    // Delete challenge if it exists, then update resources
    await deleteActiveChallenge({key: key, resources: resources, username: saveToUser});

    body.message = "Score successfully saved.";
    body.mastery = masteryReward;
    body.coins = coinsReward;
    res.json(body);
}));


export default router;
