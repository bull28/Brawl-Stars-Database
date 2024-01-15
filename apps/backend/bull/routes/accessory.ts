import express from "express";
import {getAccessoryPreview, getAccessoryData, canClaimAccessory} from "../modules/accessories";
import {loginErrorHandler, parseStringArray, parseBadges, beforeAccessory, updateAccessories} from "../modules/database";
import {Empty, TokenReqBody, DatabaseAccessories, DatabaseBadges} from "../types";

const router = express.Router();


interface ClaimAccessoryReqBody extends TokenReqBody{
    accessory: string;
}

// Get the list of all accessories
router.post<Empty, Empty, TokenReqBody>("/all", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await beforeAccessory({username: username});

    let accessories: DatabaseAccessories;
    let badges: DatabaseBadges;
    try{
        accessories = parseStringArray(results[0].accessories);
        badges = parseBadges(results[0].badges);
    } catch (error){
        res.status(500).send("Collection data could not be loaded.");
        return;
    }

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

    let accessories: DatabaseAccessories;
    let badges: DatabaseBadges;
    try{
        accessories = parseStringArray(results[0].accessories);
        badges = parseBadges(results[0].badges);
    } catch (error){
        res.status(500).send("Collection data could not be loaded.");
        return;
    }

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

export default router;
