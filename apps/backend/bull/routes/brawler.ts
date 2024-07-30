import express from "express";
import allSkins from "../data/brawlers_data.json";
import {PORTRAIT_IMAGE_DIR, SKIN_MODEL_DIR} from "../data/constants";
import {getBrawler, getSkin, getBrawlerData, getSkinData, skinSearch} from "../modules/skins";
import {Empty, BrawlerPreview, BrawlerModelData, SkinSearchFilters, SkinSearchResult} from "../types";

const router = express.Router();


type SkinSearchRes = string | {imagePath: string; backgroundPath: string; results: SkinSearchResult[]};


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

// Get the list of all available 3D models
router.get("/models", (req, res) => {
    const allModels: BrawlerModelData[] = [];
    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];
        const skins: BrawlerModelData["skins"] = [];

        for (let y = 0; y < brawler.skins.length; y++){
            const model = brawler.skins[y].model;
            if (model.geometry !== ""){
                skins.push({
                    displayName: brawler.skins[y].displayName,
                    geometry: `${SKIN_MODEL_DIR}${brawler.name}/${model.geometry}`,
                    winAnimation: model.winAnimation !== "" ? `${SKIN_MODEL_DIR}${brawler.name}/${model.winAnimation}` : "",
                    loseAnimation: model.loseAnimation !== "" ? `${SKIN_MODEL_DIR}${brawler.name}/${model.loseAnimation}` : ""
                });
            }
        }

        allModels.push({
            name: brawler.name,
            displayName: brawler.displayName,
            image: PORTRAIT_IMAGE_DIR + brawler.image,
            skins: skins
        });
    }
    res.json(allModels);
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
        imagePath: "",
        backgroundPath: "",
        results: results
    });
});

export default router;
