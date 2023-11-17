import express from "express";
import {validateReport} from "../modules/accessories";
import {validateToken} from "../modules/authenticate";
import {databaseErrorHandler, parseNumberArray, getGameProgress, setGameProgess, addReport, getReport, getAllReports, deleteReport, getResourcesAndProgress} from "../modules/database";
import {Empty, GameReport, ReportPreview} from "../types";

const router = express.Router();


interface TokenReqBody{
    token: string;
}

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

    if (typeof username !== "string"){
        res.status(400).json({resend: true, message: "Username is missing."});
        return;
    }

    if (validateReport(report) === false){
        res.status(400).json({resend: false, message: "Invalid report."});
        return;
    }

    const results = await getGameProgress({username: username});

    // If the current game ended before or at the same time as the last game in the database, the current report is a
    // duplicate and should not be added to the database. The value of last_game should only ever increase.
    if (report[1] <= results[0].last_game){
        res.status(403).json({resend: false, message: "You cannot save the same game more than once."});
        return;
    }

    await addReport({
        username: username,
        end_time: report[1],
        version: report[0],
        stats: JSON.stringify(report[2])
    });

    await setGameProgess({
        last_game: report[1],
        enemy: results[0].enemy,
        player: results[0].player,
        location: results[0].location,
        achievement: results[0].achievement,
        best_scores: results[0].best_scores,
        username: username
    });
    
    res.json({resend: false});
}));

router.post<Empty, Empty, TokenReqBody>("/all", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username === ""){
        res.status(401).send("Invalid token.");
        return;
    }

    const results = await getAllReports({username: username});

    const reportList: ReportPreview[] = [];
    let validReports = true;
    for (let x = 0; x < results.length; x++){
        let stats: number[] = [];
        try{
            stats = parseNumberArray(results[x].stats);
        } catch (error){
            validReports = false;
        }
        
        reportList.push({
            reportid: results[x].reportid,
            endTime: results[x].end_time,
            cost: 200,
            stats: stats
        });
    }

    if (validReports === false){
        res.status(500).send("Report data could not be loaded.");
        return;
    }
    
    res.json(reportList);
}));

router.post<Empty, Empty, ClaimReqBody>("/claim", databaseErrorHandler<ClaimReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username === ""){
        res.status(401).send("Invalid token.");
        return;
    }

    if (typeof req.body.reportid !== "number"){
        res.status(400).send("Report ID must be a number.");
        return;
    }

    let claim = false;
    if (req.body.claim === true){
        claim = true;
    }

    /*const results = await getReport({reportid: req.body.reportid});

    // results.length === 0 checked
    
    if (results[0].username !== username){
        res.status(401).send("Cannot claim rewards from another player's game!");
        return;
    }*/

    // If the user wants to claim, add resources and progress here

    // Get resources

    // Open brawl box and add badges to achievements

    // Set resources

    await deleteReport({reportid: req.body.reportid});

    res.json({});
}));

export default router;
