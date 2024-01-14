import express from "express";
import {validateReport, extractReportPreviewStats, extractReportData} from "../modules/accessories";
import {getGameReward} from "../modules/brawlbox";
import {
    databaseErrorHandler, 
    loginErrorHandler, 
    parseBrawlers, 
    parseNumberArray, 
    parseStringArray, 
    parseBadges, 
    stringifyBrawlers, 
    setResources, 
    getGameProgress, 
    setGameProgress, 
    addReport, 
    getReport, 
    getAllReports, 
    deleteReport, 
    getResourcesAndProgress
} from "../modules/database";
import {Empty, TokenReqBody, UserResources, DatabaseBadges, GameReport, ReportPreview} from "../types";

const router = express.Router();


interface SaveReqBody{
    username: string;
    report: GameReport;
}

interface ClaimReqBody extends TokenReqBody{
    reportid: number;
    claim: boolean;
}

router.post<Empty, Empty, SaveReqBody>("/save", databaseErrorHandler<SaveReqBody>(async (req, res) => {
    const username = req.body.username;
    const report = req.body.report;

    if (typeof username !== "string" || username.length === 0){
        res.status(400).send("Username is missing.");
        return;
    }

    if (validateReport(report) === false){
        res.status(403).send("Invalid report.");
        return;
    }

    const results = await getGameProgress({username: username});

    if (results.length === 0){
        res.status(404).send("Could not find the user.");
        return;
    }

    // If the current game ended before or at the same time as the last game in the database, the current report is a
    // duplicate and should not be added to the database. The value of last_game should only ever increase.
    if (report[1] <= results[0].last_game){
        res.status(403).send("Cannot save the same game more than once.");
        return;
    }

    await addReport({
        username: username,
        end_time: report[1],
        version: report[0],
        stats: JSON.stringify(report[2])
    });

    await setGameProgress({
        last_game: report[1],
        badges: results[0].badges,
        best_scores: results[0].best_scores,
        username: username
    });
    
    res.send("Score successfully saved.");
}));

router.post<Empty, Empty, TokenReqBody>("/all", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await getAllReports({username: username});

    const reportList: ReportPreview[] = [];
    let validReports = true;
    for (let x = 0; x < results.length; x++){
        // This contains a GameReport's stats (sequence of numbers)
        let data: number[] = [];
        try{
            data = parseNumberArray(results[x].stats);
        } catch (error){
            validReports = false;
        }

        const stats = extractReportPreviewStats(data);

        if (stats !== undefined){
            reportList.push({
                reportid: results[x].reportid,
                endTime: results[x].end_time,
                cost: 200,
                stats: stats
            });
        }
    }

    if (validReports === false){
        res.status(500).send("Report data could not be loaded.");
        return;
    }
    
    res.json(reportList);
}));

router.post<Empty, Empty, ClaimReqBody>("/claim", loginErrorHandler<ClaimReqBody>(async (req, res, username) => {
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
    
    if (reportResults[0].username !== username){
        res.status(401).send("Cannot claim rewards from another player's game!");
        return;
    }

    if (claim === false){
        // If the user does not want to claim rewards, delete the report
        await deleteReport({reportid: req.body.reportid});
        res.json([]);
        return;
    }

    // Get the report from the database
    let data: number[] = [];
    try{
        data = parseNumberArray(reportResults[0].stats);
    } catch (error){
        res.status(500).send("Report data could not be loaded.");
        return;
    }

    const report = extractReportData(data);
    if (report === undefined){
        res.status(500).send("Report data could not be loaded.");
        return;
    }

    // There are two rewards from each run of the game: brawl box and badges

    // Get all required resources
    const results = await getResourcesAndProgress({username: username});

    const resources: UserResources = {
        brawlers: {},
        avatars: [],
        themes: [],
        scenes: [],
        accessories: [],
        wild_card_pins: [],
        tokens: results[0].tokens,
        token_doubler: results[0].token_doubler,
        coins: results[0].coins,
        points: results[0].points,
        trade_credits: results[0].trade_credits
    };
    let badges: DatabaseBadges;

    try{
        resources.brawlers = parseBrawlers(results[0].brawlers);
        resources.avatars = parseStringArray(results[0].avatars);
        resources.themes = parseStringArray(results[0].themes);
        resources.accessories = parseStringArray(results[0].accessories);
        resources.wild_card_pins = parseNumberArray(results[0].wild_card_pins);
        badges = parseBadges(results[0].badges);
    } catch (error){
        res.status(500).send("Collection data could not be loaded.");
        return;
    }

    // All rewards cost the same number of tokens to claim
    if (resources.tokens < 200){
        res.status(403).send("You cannot afford to claim these rewards!");
        return;
    }
    resources.tokens -= 200;

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

    // Update resources and badges
    await setResources({
        brawlers: stringifyBrawlers(resources.brawlers),
        avatars: JSON.stringify(resources.avatars),
        wild_card_pins: JSON.stringify(resources.wild_card_pins),
        tokens: resources.tokens,
        token_doubler: resources.token_doubler,
        coins: resources.coins,
        trade_credits: resources.trade_credits,
        points: results[0].points,
        themes: results[0].themes,
        scenes: results[0].scenes,
        accessories: results[0].accessories,
        username: username
    });
    await setGameProgress({
        last_game: results[0].last_game,
        badges: JSON.stringify(badges),
        best_scores: results[0].best_scores,
        username: username
    });

    await deleteReport({reportid: req.body.reportid});

    res.json(reward);
}));

export default router;
