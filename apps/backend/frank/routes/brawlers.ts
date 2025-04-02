import express from "express";
import {SKIN_IMAGE_DIR, SKINGROUP_IMAGE_DIR} from "../data/constants";
import {getBrawler, getSkin, getBrawlerList, getBrawlerData, getSkinData, getSkinGroupList, getSkinSources, skinSearch} from "../modules/brawlers_module";
import {Empty, SkinSearchFilters, SkinSearchResult} from "../types";

const router = express.Router();


type SkinSearchRes = string | {imagePath: string; backgroundPath: string; results: SkinSearchResult[]};

// Get the entire list of brawlers
router.get("/brawlers", (req, res) => {
    const allBrawlers = getBrawlerList();
    res.json(allBrawlers);
});

// Get data for a brawler, including their skins and portrait
router.get("/brawlers/:brawler", (req, res) => {
    const brawlerName = req.params.brawler;

    const brawler = getBrawler(brawlerName);
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

    const brawler = getBrawler(brawlerName);
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

// Get all variable skin search options (skin groups and sources that skins can be found in)
router.get("/skinsearch", (req, res) => {
    const groups = getSkinGroupList();
    const foundIn = getSkinSources();
    res.json({
        groups: groups,
        foundIn: foundIn
    });
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

    const results = skinSearch(filters);
    res.json({
        imagePath: SKIN_IMAGE_DIR,
        backgroundPath: SKINGROUP_IMAGE_DIR,
        results: results
    });
});


export default router;
