import express from "express";
import {DEFAULT_REPORT_COST} from "../data/constants";
import {validateReport, getBadgeRewardPreview, extractReportGameMode, extractReportScore, checkReportStrength, extractReportPreviewStats, extractReportData} from "../modules/accessories";
import {getRatingChange} from "../modules/challenges";
import {getGameReward} from "../modules/brawlbox";
import {
    databaseErrorHandler, 
    loginErrorHandler, 
    transaction, 
    parseBrawlers, 
    parseNumberArray, 
    parseStringArray, 
    parseBadges, 
    stringifyBrawlers, 
    setResources, 
    setPoints, 
    getGameProgress, 
    setGameProgress, 
    setGameRating, 
    addReport, 
    getReport, 
    getAllReports, 
    deleteReport, 
    getResourcesAndProgress,
    getActiveChallenge,
    deleteActiveChallenge
} from "../modules/database";
import {Empty, UserResources, DatabaseBadges, GameReport, ReportPreview} from "../types";

const router = express.Router();


interface SaveReqBody{
    username: string;
    key?: string;
    title?: string;
    report: GameReport;
}

interface ClaimReportReqBody{
    reportid: number;
    claim: boolean;
}

// Save a game report
router.post<Empty, Empty, SaveReqBody>("/save", databaseErrorHandler<SaveReqBody>(async (req, res) => {
    const inputUser = req.body.username;
    const key = req.body.key;
    const report = req.body.report;

    let reportTitle = "";
    let saveToUser = "";
    let strength = 0;
    let ratingChange = 0;
    let isChallenge = false;

    const body = {message: "", rating: 0, ratingChange: 0};

    if (typeof req.body.title === "string" && req.body.title.length < 50){
        reportTitle = req.body.title;
    }

    if (validateReport(report) === false){
        body.message = "Invalid report.";
        res.status(403).json(body);
        return;
    }

    const gameMode = extractReportGameMode(report[2]);
    const score = extractReportScore(report[2]);
    if (gameMode === 0){
        // In the default game mode, no key is required and the username can be sent from the game to the server
        if (typeof inputUser !== "string" || inputUser.length === 0){
            body.message = "Username is missing.";
            res.status(400).json(body);
            return;
        }
        saveToUser = inputUser;
    } else{
        // In all other game modes, a key is used to identify the challenge. The key is stored in the database with its
        // corresponding username so the user to save the report to can be determined using only the key.
        if (typeof key !== "string"){
            body.message = "Username is missing.";
            res.status(400).json(body);
            return;
        }

        // Get the username associated with the given challenge key then save the report with that username
        const challenges = await getActiveChallenge({key: key});
        if (challenges.length === 0){
            body.message = "Challenge not found.";
            res.status(404).json(body);
            return;
        }
        if (challenges[0].accepted !== 1){
            body.message = "This challenge has not been accepted yet.";
            res.status(403).json(body);
            return;
        }

        // Make sure the strength value in the database matches the strength value given in the report before saving it
        if (checkReportStrength(report[2], challenges[0].strength) === false){
            body.message = "Invalid report.";
            res.status(403).json(body);
            return;
        }

        saveToUser = challenges[0].accepted_by;

        // All active challenges except those with no owner are deleted once completed
        if (challenges[0].owner !== ""){
            isChallenge = true;
            strength = challenges[0].strength;
        }
    }

    const results = await getGameProgress({username: saveToUser});
    if (results.length === 0){
        body.message = "Could not find the user.";
        res.status(404).json(body);
        return;
    }

    // If the current game ended before or at the same time as the last game in the database, the current report is a
    // duplicate and should not be added to the database. The value of last_game should only ever increase.
    if (report[1] <= results[0].last_game){
        body.message = "Cannot save the same game more than once.";
        res.status(403).json(body);
        return;
    }

    if (isChallenge === true){
        // Rating changes when playing challenges from other players
        ratingChange = getRatingChange(results[0].last_rating, strength, score);
    }

    const newRating = results[0].last_rating + ratingChange;

    await transaction(async (connection) => {
        await addReport({
            username: saveToUser,
            end_time: report[1],
            version: report[0],
            title: reportTitle,
            stats: JSON.stringify(report[2])
        }, connection);
        await setGameProgress({
            last_game: report[1],
            badges: results[0].badges,
            best_scores: results[0].best_scores,
            username: saveToUser
        }, connection);
        await setGameRating({
            rating: newRating,
            last_rating: newRating,
            username: saveToUser
        }, connection);

        if (isChallenge === true && typeof key === "string"){
            await deleteActiveChallenge({key: key}, connection);
        }
    });

    body.message = "Score successfully saved.";
    body.rating = newRating;
    body.ratingChange = ratingChange;
    res.json(body);
}));

// Get all reports a user currently has unclaimed
router.get("/all", loginErrorHandler(async (req, res, username) => {
    const results = await getAllReports({username: username});

    const reportList: ReportPreview[] = [];
    for (let x = 0; x < results.length; x++){
        const data = parseNumberArray(results[x].stats);
        const stats = extractReportPreviewStats(data);

        if (stats !== undefined){
            reportList.push({
                reportid: results[x].reportid,
                endTime: results[x].end_time,
                cost: extractReportGameMode(data) === 0 ? DEFAULT_REPORT_COST : 0,
                title: results[x].title,
                stats: stats
            });
        }
    }

    res.json(reportList);
}));

// Claim resources from a saved report
router.post<Empty, Empty, ClaimReportReqBody>("/claim", loginErrorHandler<ClaimReportReqBody>(async (req, res, username) => {
    if (typeof req.body.reportid !== "number"){
        res.status(400).send("Report ID must be a number.");
        return;
    }

    let claim = false;
    if (req.body.claim === true){
        claim = true;
    }

    const reportResults = await getReport({reportid: req.body.reportid});

    // results.length === 0 checked

    if (reportResults[0].username.toLowerCase() !== username.toLowerCase()){
        res.status(401).send("Cannot claim rewards from another player's game!");
        return;
    }

    // Get the report from the database
    const report = extractReportData(parseNumberArray(reportResults[0].stats));
    if (report === undefined){
        res.status(500).send("Report data could not be loaded.");
        return;
    }

    // There are two rewards from each run of the game: brawl box and badges

    // Get all required resources
    const results = await getResourcesAndProgress({username: username});

    const resources: UserResources = {
        brawlers: parseBrawlers(results[0].brawlers),
        avatars: parseStringArray(results[0].avatars),
        themes: parseStringArray(results[0].themes),
        scenes: [],
        accessories: parseStringArray(results[0].accessories),
        wild_card_pins: parseNumberArray(results[0].wild_card_pins),
        tokens: results[0].tokens,
        token_doubler: results[0].token_doubler,
        coins: results[0].coins,
        points: results[0].points,
        trade_credits: results[0].trade_credits
    };
    const badges: DatabaseBadges = parseBadges(results[0].badges);

    if (claim === false){
        // If the user only wants to claim mastery, add it here then return. Claiming mastery only is free.
        const partialReward = getGameReward(resources, report, false);

        await transaction(async (connection) => {
            await deleteReport({reportid: req.body.reportid}, connection);
            await setPoints({points: resources.points, username: username}, connection);
        });

        res.json({resources: partialReward, badges: []});
        return;
    }

    // If the user wants to claim the full reward, deduct tokens here. All rewards from game mode 0 cost the same amount
    // of tokens and all rewards from other game modes do not cost anything to claim.
    if (report.gameMode === 0){
        if (resources.tokens < DEFAULT_REPORT_COST){
            res.status(403).send("You cannot afford to claim these rewards!");
            return;
        }
        resources.tokens -= DEFAULT_REPORT_COST;
    }

    // Open brawl box and add badges
    const reward = getGameReward(resources, report);
    report.badges.forEach((value, key) => {
        // If the player already has a badge, add to their count. If the player does not have it, insert a new key.
        if (Object.hasOwn(badges, key) === true){
            badges[key] += value;
        } else{
            badges[key] = value;
        }
    });
    const badgeReward = getBadgeRewardPreview(resources.accessories, report.badges);

    await transaction(async (connection) => {
        await deleteReport({reportid: req.body.reportid}, connection);

        // Update resources and badges
        // Scenes cannot be obtained as rewards from the game so set their value to what was already in the database
        await setResources({
            brawlers: stringifyBrawlers(resources.brawlers),
            avatars: JSON.stringify(resources.avatars),
            wild_card_pins: JSON.stringify(resources.wild_card_pins),
            tokens: resources.tokens,
            token_doubler: resources.token_doubler,
            coins: resources.coins,
            trade_credits: resources.trade_credits,
            points: resources.points,
            themes: JSON.stringify(resources.themes),
            scenes: results[0].scenes,
            accessories: JSON.stringify(resources.accessories),
            username: username
        }, connection);
        await setGameProgress({
            last_game: results[0].last_game,
            badges: JSON.stringify(badges),
            best_scores: results[0].best_scores,
            username: username
        }, connection);
    });

    res.json({resources: reward, badges: badgeReward});
}));

export default router;
