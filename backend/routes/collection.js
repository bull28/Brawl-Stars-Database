// This route???

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";

// functions to view and modify a pin collections
const pins = require("../modules/pins");

// base directories of image files
const filePaths = require("../modules/filepaths");
const PORTRAIT_IMAGE_DIR = filePaths.PORTRAIT_IMAGE_DIR;
const PIN_IMAGE_DIR = filePaths.PIN_IMAGE_DIR;


// Load the skins json object
var allSkins = [];
const allSkinsPromise = require("../modules/fileloader.js").allSkinsPromise;
allSkinsPromise.then((data) => {
    if (data !== undefined){
        allSkins = data;
    }
});


/**
 * Checks whether a token is valid and returns the username that the
 * token belongs to. If the token is not valid, returns an empty string.
 * Errors will be processed using the result of this function
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


//----------------------------------------------------------------------------------------------------------------------

// ???
router.post("/collection", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT brawlers FROM " + TABLE_NAME + " WHERE username = ?",
        [username], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }
            
            if (results.length == 0){
                res.status(404).send("Could not find the user in the database.");
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

module.exports = router;
