import express from "express";
import {findUserAccessory, getAccessoryData, getAccessoryPreview, getShopItems, accessoryClaimCost} from "../modules/accessories_module";
import {loginErrorHandler, getResources, setResources} from "../modules/database";
import {Empty} from "../types";

const router = express.Router();


interface ClaimAccessoryReqBody{
    accessory: string;
    buyFromShop: boolean;
}

// Get the list of all accessories
router.get("/", loginErrorHandler(async (req, res, username) => {
    const resources = await getResources({username: username});

    const data = getAccessoryData(resources.accessories);

    res.json(data);
}));

// Get all accessories that can be bought with coins
router.get("/shop", loginErrorHandler(async (req, res, username) => {
    const resources = await getResources({username: username});

    const items = getShopItems(resources.accessories, resources.mastery);

    res.json(items);
}));

// Claim an accessory using collected badges or buy it with coins
router.post<Empty, Empty, ClaimAccessoryReqBody>("/claim", loginErrorHandler<ClaimAccessoryReqBody>(async (req, res, username) => {
    const name = req.body.accessory;
    let buy = false;
    if (typeof name !== "string"){
        res.status(400).send("Accessory to claim is missing.");
        return;
    }
    if (req.body.buyFromShop === true){
        buy = true;
    }

    const resources = await getResources({username: username});

    const index = findUserAccessory(resources.accessories, name);
    if (index < 0){
        // Accessory either does not exist or is not in the user's resources: this should not happen unless there was a
        // problem storing the data
        res.status(404).send("Accessory not found.");
        return;
    }

    const accessory = resources.accessories[index];
    if (accessory.unlocked === true){
        res.status(403).send("You have already unlocked this accessory.");
        return;
    }

    const cost = accessoryClaimCost(accessory, resources.mastery);
    if (cost < 0 || (cost > 0 && buy === false)){
        // Either the user does not have the mastery requirement to buy the shop item or a shop item for this accessory
        // does exist but the user does not want to buy it
        res.status(403).send("You do not meet the requirements to claim this accessory.");
        return;
    }

    if (cost > 0 && resources.coins < cost){
        // User is buying an accessory and cannot afford it
        res.status(403).send("You do not have enough coins to buy this accessory.");
        return;
    }

    resources.coins -= cost;
    resources.accessories[index].unlocked = true;

    await setResources({resources: resources, username: username});

    // Send a preview of the claimed accessory to the user
    const preview = getAccessoryPreview(name);
    res.json(preview);
}));


export default router;
