import express from "express";
import allSkins from "../data/brawlers_data.json";
import {PORTRAIT_IMAGE_DIR} from "../data/constants";
import {getBrawler, getSkin, getBrawlerData, getSkinData} from "../modules/skins";
import {BrawlerPreview} from "../types";

const router = express.Router();


// Get the entire list of brawlers
router.get("/brawler", (req, res) => {
    const allBrawlers: BrawlerPreview[] = [];
    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x] as BrawlerPreview;
        allBrawlers.push({
            name: brawler.name,
            displayName: brawler.displayName,
            rarity: {
                value: brawler.rarity.value,
                name: brawler.rarity.name,
                color: brawler.rarity.color
            },
            image: PORTRAIT_IMAGE_DIR + brawler.image
        });
    }
    res.json(allBrawlers);
});

// Get data for a brawler, including their skins and portrait
router.get("/brawler/:brawler", (req, res) => {
    const brawlerName = req.params.brawler;

    const brawler = getBrawler(allSkins, brawlerName);
    if (brawler === undefined){
        res.status(404).send("Brawler not found.");
        return;
    }

    const brawlerData = getBrawlerData(brawler);

    res.json(brawlerData);
});

// Get data for a skin, including its image
router.get("/skin/:brawler/:skin", (req, res) => {
    const brawlerName = req.params.brawler;
    const skinName = req.params.skin;

    const brawler = getBrawler(allSkins, brawlerName);
    if (brawler === undefined){
        res.status(404).send("Brawler or skin not found.");
        return;
    }

    const skin = getSkin(brawler, skinName);
    if (skin === undefined){
        res.status(404).send("Skin not found.");
        return;
    }

    const skinData = getSkinData(skin, brawler.name);

    res.json(skinData);
});

export default router;
