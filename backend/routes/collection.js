// This route contains operations relating to user pin and avatar collections

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";

// functions to view and modify a pin collections
const pins = require("../modules/pins");
const fileLoader = require("../modules/fileloader");
const brawlbox = require("../modules/brawlbox");

// base directories of image files
const filePaths = require("../modules/filepaths");
const PORTRAIT_IMAGE_DIR = filePaths.PORTRAIT_IMAGE_DIR;
const PIN_IMAGE_DIR = filePaths.PIN_IMAGE_DIR;


// Load the skins json object
var allSkins = [];
const allSkinsPromise = fileLoader.allSkinsPromise;
allSkinsPromise.then((data) => {
    if (data !== undefined){
        allSkins = data;
    }
});
var dropChances = {};
const dropChancesPromise = fileLoader.dropChancesPromise;
dropChancesPromise.then((data) => {
    if (data !== undefined){
        dropChances = data;
    }
});



/**
 * Checks whether a token is valid and returns the username that the
 * token belongs to. If the token is not valid, returns an empty string.
 * Errors will be processed using the result of this function.
 * @param {Object} token the token to check
 * @returns username the token belongs to
 */
function validateToken(token){
    try{
        const data = jsonwebtoken.verify(token, "THE KING WINS AGAIN");
            
        if (data.username === undefined){
            return "";
        }
        return data.username;
    } catch(error){
        return "";
    }
}


/**
 * Processes a query to the database by checking if there was an error
 * and whether there were results. If the query was unsuccessful, return
 * true. Otherwise, return false.
 * @param {Error} error 
 * @param {Array} results 
 * @param {Object} fields 
 * @param {Object} res 
 * @returns boolean
 */
function databaseErrorCheck(error, results, fields, res){
    if (error){
        res.status(500).send("Could not connect to database.");
        return true;
    }
    if (results.length == 0){
        res.status(404).send("Could not find the user in the database.");
        return true;
    }
    return false;
}
//----------------------------------------------------------------------------------------------------------------------

// Get a user's username and amounts of various resources
router.post("/resources", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT username, active_avatar, tokens, token_doubler, coins, trade_credits FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            const resourcesData = {
                "username": results[0].username,
                "avatar": results[0].active_avatar,
                "tokens": results[0].tokens,
                "tokenDoubler": results[0].token_doubler,
                "coins": results[0].coins,
                "tradeCredits": results[0].trade_credits
            }

            res.json(resourcesData);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

// Get a user's collection of brawlers and pins
router.post("/collection", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT brawlers FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            const collectionData = results[0].brawlers;

            let collectionInfo = pins.formatCollectionData(allSkins, collectionData, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR);

            res.json(collectionInfo);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

// 
router.post("/brawlbox", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT brawlers FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            const collectionData = results[0].brawlers;

            // remove hard coded stuff later
            // later get avatar, resources, and other stuff from query
            //["avatars/special/angry_darryl.webp", "avatars/special/ELIXIR_GOLM.webp", "avatars/special/viking_bull.webp", "avatars/special/yellow_face_02.webp"]
            const results1 = {
                "brawlers": collectionData,
                "avatars": [],
                "wild_cards": [0, 0, 0, 0, 0],
                "tokens": 6969,
                "token_doubler": 0,
                "coins": 55,
                "trade_credits": 0
            };
            let brawlBoxContents = brawlbox.brawlBox(dropChances, "brawlBox", allSkins, results1);

            res.json(brawlBoxContents);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

module.exports = router;
