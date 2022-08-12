// This route contains operations relating adding and removing trades

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";
const TRADE_TABLE_NAME = "brawl_stars_trades";

// functions to view and modify a pin collections
const pins = require("../modules/pins");
const fileLoader = require("../modules/fileloader");

// constants for trades
const MAX_ACTIVE_TRADES = 69;

// base directories of image files
const filePaths = require("../modules/filepaths");
const PORTRAIT_IMAGE_DIR = filePaths.PORTRAIT_IMAGE_DIR;
const PIN_IMAGE_DIR = filePaths.PIN_IMAGE_DIR;
const RESOURCE_IMAGE_DIR = filePaths.RESOURCE_IMAGE_DIR;


// Load the skins json object
var allSkins = [];
const allSkinsPromise = fileLoader.allSkinsPromise;
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
        res.status(404).send("Could not find the content in the database.");
        return true;
    }
    return false;
}


function validatePins(allSkins, pinArray, searchByImage){
    //pinArray.slice()
    var validArray = [];
    for (let x of pinArray){
        if (x.hasOwnProperty("brawler") && x.hasOwnProperty("pin")){
            let brawlerObjects = allSkins.filter((element, index, array) => {return element.name == x.brawler;});
            if (brawlerObjects.length > 0 && brawlerObjects[0].hasOwnProperty("pins")){
                let pinObjects = brawlerObjects[0].pins.filter((element, index, array) => {return element.name == x.pin;});
                if (pinObjects.length > 0){
                    if (pinObjects[0].hasOwnProperty("rarity")){
                        validArray.push({
                            "brawler": brawlerObjects[0].name,
                            "pin": pinObjects[0].name,
                            "amount": 1,
                            "rarityValue": pinObjects[0].rarity.value
                        });
                    }
                }
            }
        }
    }
    return validArray;
}


function getTradeCost(offerPins, requestPins){
    // add this later
    return 1;
}

//----------------------------------------------------------------------------------------------------------------------

//
router.post("/create", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    //var searchByName = false;

    if (username){
        var offerPins = [];
        var requestPins = [];
        try{
            offerPins = JSON.parse('[{"brawler": "bull", "pin": "bull_angry"}, {"brawler": "darryl", "pin": "darryl_sweat"}, {"brawler": "frank", "pin": "frank_thanks"}, {"brawler": "FRNK", "pin": "FRNK_SAD"}]');
            requestPins = JSON.parse('[{"brawler": "elprimo", "pin": "elprimo_dragon"}, {"brawler": "tara", "pin": "tara_thanks"}, {"brawler": "ash", "pin": "ash_gg"}, {"brawler": "FRNK", "pin": "FRK PIN"}]');
        } catch(error){
            res.status(400).send("Invalid offer and request data.");
            return;
        }

        const BUL = performance.now();
        offerPins = validatePins(allSkins, offerPins, false);
        requestPins = validatePins(allSkins, requestPins, false);

        if (offerPins.length > 10 || requestPins.length > 10){
            res.status(400).send("Too many pins in request or offer.");
            return;
        }

        const offerPinsNames = offerPins.map(element => element.pin);
        const requestPinsNames = requestPins.map(element => element.pin);
        var validPins = true;
        for (let x of offerPinsNames){
            if (requestPinsNames.includes(x)){
                validPins = false;
            }
        }
        
        if (validPins == false){
            res.status(400).send("Cannot offer and request the same pin.");
            return;
        }


        const tradeCost = getTradeCost(offerPins, requestPins);

        // Get the user's data and check if they have the necessary resources and pins to create the trade
        database.queryDatabase(
        "SELECT brawlers, active_avatar, trade_credits, trade_requests FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            var userResources = results[0];

            var collectionData = {};
            try{
                collectionData = JSON.parse(userResources.brawlers);
                userResources.trade_requests = JSON.parse(userResources.trade_requests);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }


            //if (userResources.trade_credits < tradeCost){
            //    res.status(403).send("Not enough Trade Credits. Open Brawl Boxes to get more.");
            //    return;
            //}

            // userResources.trade_credits -= tradeCost;

            if (userResources.trade_requests.length >= MAX_ACTIVE_TRADES){
                res.status(403).send("Too many active trades. Close one before creating a new one.");
                return;
            }

            
            var hasRequiredPins = true;
            for (let x of offerPins){
                if (collectionData.hasOwnProperty(x.brawler)){
                    if (collectionData[x.brawler].hasOwnProperty(x.pin)){
                        if (collectionData[x.brawler][x.pin] < x.amount){
                            hasRequiredPins = false;
                        } else{
                            // It is ok to modify the collection here because even if the user does not have all required
                            // pins and the trade has to be cancelled with only some of their pins removed, the new collection
                            // is not written to the database unless the trade was successful.
                            collectionData[x.brawler][x.pin] -= x.amount;
                        }
                        //console.log(collectionData[x.brawler][x.pin]);
                    }
                }
            }
            // return error when hasrequiredpins is false

            // Default of 2 days expiry time
            const tradeExpiration = Date.now() + 172800000;

            
            // Add the new trade into the trades table
            database.queryDatabase(
            "INSERT INTO " + TRADE_TABLE_NAME + " (creator, creator_avatar, creator_color, offer, request, expiration) VALUES (?, ?, ?, ?, ?, ?);",
            [username, userResources.active_avatar, "#000000", JSON.stringify(offerPins), JSON.stringify(requestPins), tradeExpiration], (error, results, fields) => {
                if (databaseErrorCheck(error, results, fields, res)){
                    return;
                }

                if (results.affectedRows == 0){
                    res.status(500).send("Could not add the trade to the database.");
                    return;
                }


                // Get the tradeid that was just inserted and it will be returned to the user and added to their trade_requests
                database.queryDatabase(
                "SELECT LAST_INSERT_ID();",
                [], (error, results, fields) => {
                    if (databaseErrorCheck(error, results, fields, res)){
                        return;
                    }

                    userResources.trade_requests.push(results[0]["LAST_INSERT_ID()"]);
                    
                    // Update the user's data after their resources and pins have been changed
                    database.queryDatabase(
                    "UPDATE " + TABLE_NAME + " SET brawlers = ?, trade_requests = ?, trade_credits = ? WHERE username = ?;",
                    [JSON.stringify(collectionData), JSON.stringify(userResources.trade_requests), userResources.trade_credits, username], (error, results, fields) => {
                        if (databaseErrorCheck(error, results, fields, res)){
                            return;
                        }
                        if (results.affectedRows == 0){
                            res.status(500).send("Could not update the database.");
                        }

                        console.log(performance.now() - BUL);

                        res.send("BUL");
                    });
                });
            });
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

//
router.post("/accept", function(req, res) {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    let tradeid = req.body.tradeid;
    tradeid = 16;// trade id is hard coded for now because i don't want to keep changing h.js and refreshing the page

    //var searchByName = false;

    if (username && tradeid !== undefined){
        const BUL = performance.now();

        // Get the user's data and check if they have the necessary resources and pins to accept the trade
        database.queryDatabase(
        "SELECT brawlers, wild_card_pins, trade_credits FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            // Load the data in then get the trade data and compare then
            var userResources = results[0];

            var collectionData = {};
            var wildCardPins = [];
            try{
                collectionData = JSON.parse(userResources.brawlers);
                wildCardPins = JSON.parse(userResources.wild_card_pins);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }

            // Get the trade data for the tradeid specified by the user
            database.queryDatabase(
            "SELECT creator, offer, request, trade_credits FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ? AND expiration > ?;",// add AND accepted = 0 later
            [tradeid, Date.now() + 300000], (error, results, fields) => {
                if (databaseErrorCheck(error, results, fields, res)){
                    return;
                }

                var tradeResults = results[0];

                //if (tradeResults.creator == username){
                //    res.status(403).send("You cannot accept your own trade!");
                //    return;
                //}

                var offerPins = [];
                var requestPins = [];
                try{
                    offerPins = JSON.parse(tradeResults.offer);
                    requestPins = JSON.parse(tradeResults.request);
                } catch (error){
                    res.status(500).send("Trade data could not be loaded.");
                    return;
                }

                const tradeCost = tradeResults.trade_credits;

                //if (userResources.trade_credits < tradeCost){
                //    res.status(403).send("Not enough Trade Credits. Open Brawl Boxes to get more.");
                //    return;
                //}

                // userResources.trade_credits -= tradeCost;
                
                var hasRequiredPins = true;
                for (let x of requestPins){
                    if (collectionData.hasOwnProperty(x.brawler)){
                        if (collectionData[x.brawler].hasOwnProperty(x.pin)){
                            if (collectionData[x.brawler][x.pin] < x.amount){
                                // add check to use wild card pins here

                                // If the user does not have enough pins, check if they have enough wild cards of the correct rarity
                                if (wildCardPins[x.rarityValue] >= x.amount){
                                    wildCardPins[x.rarityValue] -= x.amount
                                }
                                
                                // If they also do not have enough wild cards, they do not have the required pins
                                else{
                                    hasRequiredPins = false;
                                }
                            } else{
                                collectionData[x.brawler][x.pin] -= x.amount;
                            }
                            //console.log(x.pin);
                        }
                    }
                }

                
                // return error when hasrequiredpins is false


                for (let x of offerPins){
                    if (collectionData.hasOwnProperty(x.brawler)){
                        // If the user already has the pin in their collection, add the amount they will receive
                        if (collectionData[x.brawler].hasOwnProperty(x.pin)){
                            collectionData[x.brawler][x.pin] += x.amount;
                        }
                        // If the user has the brawler but not the pin, add the new pin to their collection
                        // and set its amount to the amount given in the trade
                        else{
                            collectionData[x.brawler][x.pin] = x.amount;
                        }
                    }
                    // If the user does not have the brawler unlocked, they cannot receive the pin...
                }                

                // Update the user's data after their resources and pins have been changed
                database.queryDatabase(
                "UPDATE " + TABLE_NAME + " SET brawlers = ?, wild_card_pins = ?, trade_credits = ? WHERE username = ?;",
                [JSON.stringify(collectionData), JSON.stringify(wildCardPins), userResources.trade_credits, username], (error, results, fields) => {
                    if (databaseErrorCheck(error, results, fields, res)){
                        return;
                    }
                    if (results.affectedRows == 0){
                        res.status(500).send("Could not update the database.");
                    }

                    // At this point, the update to the user was successful so the trade can be marked as completed

                    
                    // Set the trade's status to accepted and accepted_by to the user's name
                    database.queryDatabase(
                    "UPDATE " + TRADE_TABLE_NAME + " SET accepted = ?, accepted_by = ? WHERE tradeid = ?;",
                    [1, username, tradeid], (error, results, fields) => {
                        if (databaseErrorCheck(error, results, fields, res)){
                            return;
                        }
                        if (results.affectedRows == 0){
                            res.status(500).send("Could not update the database.");
                        }

                        console.log(performance.now() - BUL);
                        res.send("BUL");
                    });
                });
            });
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

module.exports = router;
