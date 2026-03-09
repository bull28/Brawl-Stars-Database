import express from "express";
import {randomUUID} from "crypto";
import {createError} from "../modules/utils";
import {trialStates} from "../data/trials_data";
import {getTrialList, getTrialPreview, getTrialDisplay, startTrial, selectItems, buyItem, sellItem, addFinalReward, openBrawlBox} from "../modules/trials_module";
import {loginErrorHandler, getResources, replaceActiveChallenge, getActiveTrial, updateActiveTrial, deleteActiveTrial} from "../modules/database";
import {Empty} from "../types";

const router = express.Router();


interface TrialStartReqBody{
    trialid: number;
}

interface TrialEndReqBody{
    allowInProgress: boolean;
}

interface TrialSelectReqBody{
    character: number;
    accessories: number[];
    powerups: number[];
}

interface TrialBrawlBoxReqBody{
    brawlboxid: number;
}

interface TrialItemsReqBody{
    type: string;
    items: number[];
}

// Get all trials that can be started
router.get("/", loginErrorHandler(async (req, res) => {
    const trials = getTrialList();
    res.json({trials: trials});
}));

// Get the current state of a trial
router.get("/state", loginErrorHandler(async (req, res, username) => {
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    const preview = getTrialPreview(trial);
    res.json(preview);
}));

// Get the display information for a trial
router.get("/display", loginErrorHandler(async (req, res, username) => {
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    const display = getTrialDisplay(trial);
    res.json(display);
}));

// Start a trial
router.post<Empty, Empty, TrialStartReqBody>("/start", loginErrorHandler<TrialStartReqBody>(async (req, res, username) => {
    const trialid = req.body.trialid;
    if (typeof trialid !== "number"){
        res.status(400).json(createError("TrialsStartNotFound"));
        return;
    }

    const resources = await getResources({username: username});
    const trial = startTrial(trialid, resources);

    if (trial === undefined){
        res.status(404).json(createError("TrialsStartNotFound"));
        return;
    }

    await updateActiveTrial({trial: trial, username: username, replace: true});

    res.json({trialid: trialid});
}));

// End a trial
router.post<Empty, Empty, TrialEndReqBody>("/end", loginErrorHandler<TrialEndReqBody>(async (req, res, username) => {
    //const allowInProgress = (req.body.allowInProgress === true);

    const resources = await getResources({username: username});
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    const reward = addFinalReward(trial, resources);

    await deleteActiveTrial({resources: resources, username: username});

    res.json({mastery: reward});
}));

// Play the next challenge in a trial
router.post<Empty, Empty, TrialSelectReqBody>("/next", loginErrorHandler<TrialSelectReqBody>(async (req, res, username) => {
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    if (trial.state !== trialStates.TRIAL_READY){
        res.status(403).json(createError("TrialsNotAllowed"));
        return;
    }

    const character = req.body.character ?? 0;
    const accessories = req.body.accessories ?? [];
    const powerups = req.body.powerups ?? [];

    // Invalid selections
    if (typeof character !== "number" || Array.isArray(accessories) === false || Array.isArray(powerups) === false){
        res.status(400).json(createError("TrialsInvalidSelection"));
        return;
    }
    let valid = character >= 0;
    for (let x = 0; x < accessories.length; x++){
        if (typeof accessories[x] !== "number"){
            valid = false;
        }
    }
    for (let x = 0; x < powerups.length; x++){
        if (typeof powerups[x] !== "number"){
            valid = false;
        }
    }

    if (valid === false){
        res.status(400).json(createError("TrialsInvalidSelection"));
        return;
    }

    const success = selectItems(trial, character, accessories, powerups);

    if (success === false){
        res.status(403).json(createError("TrialsItemsNotOwned"));
        return;
    }

    await updateActiveTrial({trial: trial, username: username});

    const key: string = randomUUID();

    await replaceActiveChallenge({key: key, challengeid: "trial", gamemode: 3, username: username});

    res.json({key: key});
}));

// Open a brawl box
router.post<Empty, Empty, TrialBrawlBoxReqBody>("/brawlbox", loginErrorHandler<TrialBrawlBoxReqBody>(async (req, res, username) => {
    const boxType = req.body.brawlboxid;
    if (typeof boxType !== "number"){
        res.status(400).json(createError("TrialsNotAllowed"));
        return;
    }

    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    if (trial.state !== trialStates.TRIAL_REWARD){
        res.status(403).json(createError("TrialsNotAllowed"));
        return;
    }

    const items = openBrawlBox(trial, boxType);

    if (items.length <= 0){
        res.status(403).json(createError("TrialsNotAllowed"));
        return;
    }

    await updateActiveTrial({trial: trial, username: username});

    res.json({items: items});
}));

// Buy trial items
router.post<Empty, Empty, TrialItemsReqBody>("/buy", loginErrorHandler<TrialItemsReqBody>(async (req, res, username) => {
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    if (trial.state !== trialStates.TRIAL_READY){
        res.status(403).json(createError("TrialsNotAllowed"));
        return;
    }

    const itemType = req.body.type ?? "";
    const buyReqs = req.body.items;
    if (Array.isArray(buyReqs) === false){
        res.status(400).json(createError("TrialsInvalidItemList"));
        return;
    }
    if (buyReqs.length > 10){
        res.status(400).json(createError("TrialsTooManyItems"));
        return;
    }

    let valid = true;
    for (let x = 0; x < buyReqs.length; x++){
        if (typeof buyReqs[x] !== "number"){
            valid = false;
        } else{
            valid = valid && buyItem(trial, itemType, buyReqs[x]);
        }
    }

    if (valid === false){
        res.status(403).json(createError("TrialsBuyDenied"));
        return;
    }

    await updateActiveTrial({trial: trial, username: username});

    res.json({count: buyReqs.length});
}));

// Sell trial items
router.post<Empty, Empty, TrialItemsReqBody>("/sell", loginErrorHandler<TrialItemsReqBody>(async (req, res, username) => {
    const trial = await getActiveTrial({username: username});
    if (trial === undefined){
        res.status(404).json(createError("TrialsGetNotFound"));
        return;
    }

    if (trial.state !== trialStates.TRIAL_READY){
        res.status(403).json(createError("TrialsNotAllowed"));
        return;
    }

    const itemType = req.body.type ?? "";
    const sellReqs = req.body.items;
    if (Array.isArray(sellReqs) === false){
        res.status(400).json(createError("TrialsInvalidItemList"));
        return;
    }
    if (sellReqs.length > 10){
        res.status(400).json(createError("TrialsTooManyItems"));
        return;
    }

    let valid = true;
    for (let x = 0; x < sellReqs.length; x++){
        if (typeof sellReqs[x] !== "number"){
            valid = false;
        }
    }
    if (valid === true){
        sellReqs.sort((a, b) => b - a);
        for (let x = 0; x < sellReqs.length; x++){
            valid = valid && sellItem(trial, itemType, sellReqs[x]);
        }
    }

    if (valid === false){
        res.status(403).json(createError("TrialsSellDenied"));
        return;
    }

    await updateActiveTrial({trial: trial, username: username});

    res.json({count: sellReqs.length});
}));


export default router;
