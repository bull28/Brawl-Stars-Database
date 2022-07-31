// This route contains operations relating to brawlers and skins

const express = require("express");
const router = express.Router();
const fs = require("fs");

// functions to search for brawlers, skins, and pins in json data
const skins = require("../modules/skins.js");

// base directories of image files
const PORTRAIT_IMAGE_DIR = "portraits/";
const SKIN_IMAGE_DIR = "skins/";
const SKIN_MODEL_DIR = "models/";
const SKINGROUP_IMAGE_DIR = "skingroups/backgrounds/";
const SKINGROUP_ICON_DIR = "skingroups/icons/";
const PIN_IMAGE_DIR = "pins/";


// Load the skins json object
var allSkins = [];
const allSkinsPromise = require("../modules/dataloader.js").allSkinsPromise;
allSkinsPromise.then((data) => {
    if (data !== undefined){
        allSkins = data;
    }
});


/**
 * Checks whether a json object is empty.
 * @param {Object} x the object
 * @returns true if empty, false otherwise
 */
function isEmpty(x){
    var isEmpty = true;
    for (var y in x){
        isEmpty = false;
    }
    return isEmpty;
}


/**
 * Some skins have a 3D model available. This function checks whether
 * a skin has one and if so, return the path to it. The field "exists"
 * is also returned in the result, indicating whether the model exists
 * and the file path is valid. If it does not exist, the file path
 * will be empty.
 * @param {Object} data object including the file path to test
 * @returns data, modified with the correct values
 */
function skinModelExists(data){
    //const checkFile = skinFile.replace(".png", "_alt.png");
    if (!(data.hasOwnProperty("image"))){
        return;
    }
    data.exists = fs.existsSync("assets/images/" + data.image);
    if (!(data.exists)){
        data.image = "";
    }
    return data;
}


//----------------------------------------------------------------------------------------------------------------------

// Get the entire list of brawlers
router.get("/brawler", (req, res) => {
    var allBrawlers = [];

    const includeInBrawler = ["name", "displayName", "rarity", "portrait"];

    for (let x of allSkins){
        // copy over the entire brawler's data, except for their skins
        // call /brawler/:brawler to get the skin list and description (too much data here)
        var brawlerData = {};
        for (let y in x){
            if (includeInBrawler.includes(y)){
                brawlerData[y] = x[y];
            }
        }
        allBrawlers.push(brawlerData);
    }
    res.json(allBrawlers);
});


// Get json data for a brawler, including their skins and portrait
router.get("/brawler/:brawler", (req, res) => {
    const brawler = req.params.brawler;

    let brawlerData = skins.getBrawler(allSkins, brawler);
    if (isEmpty(brawlerData)){
        res.status(404).send("Brawler not found.");
        return;
    }
    
    let brawlerInfo = skins.formatBrawlerData(
        brawlerData, 
        PORTRAIT_IMAGE_DIR, 
        SKIN_MODEL_DIR, 
        PIN_IMAGE_DIR
    );

    res.json(brawlerInfo);
});


// Get json data for a skin, including its image
router.get("/skin/:brawler/:skin", (req, res) => {
    const brawler = req.params.brawler;
    const skin = req.params.skin;

    // first, search through the json to see if the brawler name is valid
    let brawlerData = skins.getBrawler(allSkins, brawler);
    if (isEmpty(brawlerData)){
        res.status(404).send("Brawler or skin not found.");
        return;
    } if (!(brawlerData.hasOwnProperty("name"))){
        res.status(404).send("Brawler has no name!");
        return;
    }

    // if the brawler name is valid, search through that brawler's skins
    let skinData = skins.getSkin(brawlerData, skin);
    if (isEmpty(skinData)){
        res.status(404).send("Skin not found.");
        return;
    }

    let skinInfo = skins.formatSkinData(
        skinData, 
        brawlerData.name, 
        SKIN_IMAGE_DIR, 
        SKIN_MODEL_DIR, 
        SKINGROUP_IMAGE_DIR, 
        SKINGROUP_ICON_DIR
    );

    // when it is returned, the exists field of the model data will be set to false
    // this function will test to see if the model exists and set exists accordingly.
    // if it turns out to not exist, the model path will also be set to the empty string.
    skinInfo["model"] = skinModelExists(skinInfo["model"]);

    res.json(skinInfo);
});

module.exports = router;
