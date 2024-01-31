import express from "express";
import {getMasteryLevel, getAccessoryPreview, getAccessoryData, canClaimAccessory} from "../modules/accessories";
import {loginErrorHandler, parseStringArray, parseBadges, beforeAccessory, updateAccessories} from "../modules/database";
import {Empty, TokenReqBody, DatabaseAccessories, DatabaseBadges} from "../types";

const router = express.Router();


interface ClaimAccessoryReqBody extends TokenReqBody{
    accessory: string;
}

// Get the list of all accessories
router.post<Empty, Empty, TokenReqBody>("/all", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await beforeAccessory({username: username});

    const accessories: DatabaseAccessories = parseStringArray(results[0].accessories);
    const badges: DatabaseBadges = parseBadges(results[0].badges);

    const data = getAccessoryData(accessories, badges);

    res.json(data);
}));

// Claim an accessory using collected badges
router.post<Empty, Empty, ClaimAccessoryReqBody>("/claim", loginErrorHandler<ClaimAccessoryReqBody>(async (req, res, username) => {
    const name = req.body.accessory;
    if (typeof name !== "string"){
        res.status(400).send("Accessory to claim is missing.");
        return;
    }

    const results = await beforeAccessory({username: username});

    const accessories: DatabaseAccessories = parseStringArray(results[0].accessories);
    const badges: DatabaseBadges = parseBadges(results[0].badges);

    const hasAccessory = accessories.includes(name);

    if (canClaimAccessory(accessories, badges, name) === false){
        if (hasAccessory === true){
            res.status(403).send("You have already claimed this accessory.");
        } else{
            res.status(403).send("You do not meet the requirements to claim this accessory.");
        }
        return;
    }

    // If the user meets the requirements to claim the accessory, add it to the array then save it
    if (hasAccessory === false){
        accessories.push(name);
    }

    await updateAccessories({
        accessories: JSON.stringify(accessories),
        username: username
    });

    // Send a preview of the claimed accessory to the user
    const preview = getAccessoryPreview(name);

    res.json(preview);
}));

// Get the current mastery level
router.post<Empty, Empty, TokenReqBody>("/mastery", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await beforeAccessory({username: username});

    const mastery = getMasteryLevel(results[0].points);

    res.json(mastery);
}));

export default router;
