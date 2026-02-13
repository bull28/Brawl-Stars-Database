import express from "express";
import {validateReport, extractReportData} from "../modules/report_module";
import {getRewards} from "../modules/challenges_module";
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
    const body = {message: "", status: 0, mastery: 0, coins: 0};

    const inputUser = req.body.username;
    const key = req.body.key;
    const report = req.body.report;

    let saveToUser = "";
    let baseMastery = 0;
    let baseCoins = 0;
    let baseBadges = 0;

    const reportStatus = validateReport(report);
    if (reportStatus !== 0){
        body.message = "Invalid report.";
        body.status = reportStatus;
        res.status(403).json(body);
        return;
    }

    const reportData = extractReportData(report);
    if (reportData === undefined){
        body.message = "Invalid report.";
        res.status(403).json(body);
        return;
    }

    // Last updated: version 103
    // The report's timestamp is the number of seconds after the version was released. To ensure the value stored in the
    // database is always increasing, add the time of the version's release to the report timestamp.
    const endTime = report[1] + 1770624000;

    const gameMode = reportData.gameMode;
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

        const rewards = getRewards(challenge.challengeid, reportData.player.difficulty, reportData.score.win);
        baseMastery = rewards.mastery;
        baseCoins = rewards.coins;
        baseBadges = rewards.badges;
    } else if (gameMode === 0){
        if (typeof inputUser !== "string" || inputUser.length === 0){
            body.message = "Username is missing.";
            res.status(400).json(body);
            return;
        }

        saveToUser = inputUser;
        baseMastery = 1;
        baseCoins = 1;
        baseBadges = 1;
    } else{
        body.message = "Username is missing.";
        res.status(400).json(body);
        return;
    }

    // This endpoint needs to return json so override the default error handler in getResources that would send text
    let resources: UserResources;
    try{
        resources = await getResources({username: saveToUser});
    } catch (_){
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
    // Mastery gained from a single challenge is capped at 40% of the user's current mastery to prevent them from
    // skipping too many levels at once.
    const maxMastery = Math.max(10000, Math.floor(resources.mastery * 2 / 5));
    const masteryReward = Math.min(
        maxMastery, Math.floor(reportData.mastery * baseMastery * reportData.multipliers.mastery / 100)
    );
    resources.mastery += masteryReward;

    // Add coins
    const r0 = Math.floor(reportData.coins[0] * reportData.multipliers.coins / 100);
    const r1 = Math.floor(reportData.coins[1] * reportData.multipliers.coins / 100);
    const r = (r1 - r0 + 1) / 2;
    const coinsReward = Math.floor(Math.floor(r0 + r * Math.random() + r * Math.random()) * baseCoins);
    resources.coins += coinsReward;

    // Add badges
    const badges = reportData.badges;
    const achievements = reportData.achievements;
    for (let x = 0; x < resources.accessories.length; x++){
        const accessory = resources.accessories[x];
        const badgesReward = badges.get(accessory.name);
        if (badgesReward !== undefined){
            if (accessory.name === "enemies"){
                accessory.badges += Math.floor(badgesReward);
            } else{
                accessory.badges += Math.floor(
                    badgesReward * baseBadges * reportData.multipliers.badges / 100
                );
            }
        } else if (achievements.has(accessory.name) === true){
            accessory.badges += 1;
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
