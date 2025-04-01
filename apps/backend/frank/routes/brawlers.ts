import express from "express";
import allSkins from "../data/brawlers_data.json";
import {PORTRAIT_IMAGE_DIR, SKIN_IMAGE_DIR, SKINGROUP_IMAGE_DIR} from "../data/constants";
import {getBrawler, getSkin, getBrawlerData, getSkinData, skinSearch} from "../modules/brawlers_module";
import {Empty, BrawlerPreview, SkinSearchFilters, SkinSearchResult} from "../types";

const router = express.Router();


type SkinSearchRes = string | {imagePath: string; backgroundPath: string; results: SkinSearchResult[]};

// Get the entire list of brawlers
router.get("/brawlers", (req, res) => {
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
router.get("/brawlers/:brawler", (req, res) => {
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
router.get("/skins/:brawler/:skin", (req, res) => {
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

// Get the list of all skin groups
router.get("/skingroups", (req, res) => {
    const groups = new Set<string>();
    for (let i = 0; i < allSkins.length; i++){
        const brawler = allSkins[i];
        for (let j = 0; j < brawler.skins.length; j++){
            const skin = brawler.skins[j];
            for (let g = 0; g < skin.groups.length; g++){
                groups.add(skin.groups[g].name);
            }
        }
    }
    groups.delete("");
    res.json(Array.from(groups));
});

// Get all sources that skins can be found in
router.get("/skinfoundin", (req, res) => {
    const rewards = new Set<string>();
    for (let i = 0; i < allSkins.length; i++){
        const brawler = allSkins[i];
        for (let j = 0; j < brawler.skins.length; j++){
            const skin = brawler.skins[j];
            for (let r = 0; r < skin.foundIn.length; r++){
                rewards.add(skin.foundIn[r]);
            }
        }
    }
    res.json(Array.from(rewards));
});

// Search for skins using a search filter
router.post<Empty, SkinSearchRes, {filters: SkinSearchFilters;}>("/skinsearch", (req, res) => {
    const filters = req.body.filters;
    if (typeof filters !== "object" || Array.isArray(filters) === true){
        res.status(400).send("Invalid filters object.");
        return;
    }
    if (Array.isArray(filters.groups) === true && filters.groups.length > 5){
        res.status(400).send("Too many skin groups selected. Select at most 5.");
        return;
    }

    const results = skinSearch(allSkins, filters);
    res.json({
        imagePath: SKIN_IMAGE_DIR,
        backgroundPath: SKINGROUP_IMAGE_DIR,
        results: results
    });
});


export default router;
