// This route contains operations relating to viewing trades

const express = require("express");
const router = express.Router();

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";
const TRADE_TABLE_NAME = process.env.DATABASE_TRADE_TABLE_NAME || "brawl_stars_trades";

// used here only to calculate time differences for trades
const maps = require("../modules/maps");
const fileLoader = require("../modules/fileloader");

// constants for trades
const MAX_ACTIVE_TRADES = 25;// will be lowered later when done testing


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


//----------------------------------------------------------------------------------------------------------------------

// Get details about a specific trade
router.get("/id", (req, res) => {
    const tradeid = req.query.tradeid;

    if (isNaN(tradeid)){
        res.status(400).send("Invalid Trade ID.");
        return;
    }

    database.queryDatabase(
    "SELECT * FROM " + TRADE_TABLE_NAME + " WHERE tradeid = ?;",
    [tradeid], (error, results, fields) => {
        if (databaseErrorCheck(error, results, fields, res)){
            return;
        }

        var accepted = false;
        if (results[0].accepted == 1){
            accepted = true;
        }

        var tradeSecondsLeft = Math.floor((results[0].expiration - Date.now()) / 1000);
        var tradeTimeLeft = new maps.SeasonTime(0, 0, 0, 0);
        if (tradeSecondsLeft > maps.MAP_CYCLE_HOURS * 3600){
            tradeTimeLeft = new maps.SeasonTime(1, 0, 0, 0);
        } else if (tradeSecondsLeft > 0){
            tradeTimeLeft = maps.addSeasonTimes(tradeTimeLeft, new maps.SeasonTime(0, 0, 0, tradeSecondsLeft));
        }

        var offerPins = [];
        var requestPins = [];
        try{
            offerPins = JSON.parse(results[0].offer);
            requestPins = JSON.parse(results[0].request);
        } catch (error){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        const tradeData = {
            "creator": {
                "username": results[0].creator,
                "avatar": results[0].creator_avatar,
                "avatarColor": results[0].creator_color
            },
            "offer": offerPins,
            "request": requestPins,
            "cost": results[0].trade_credits,
            "timeLeft": tradeTimeLeft,
            "accepted": accepted,
            "acceptedBy": results[0].accepted_by
        }

        res.json(tradeData);
    });
});

// Get all active trades a user currently has
router.get("/user", (req, res) => {
    const username = "KING GOLM";// will change to post request later

    database.queryDatabase(
    "SELECT * FROM " + TRADE_TABLE_NAME + " WHERE creator = ?;",
    [username], (error, results, fields) => {
        if (databaseErrorCheck(error, results, fields, res)){
            return;
        }

        var tradeList = [];

        var validJSONTrades = true;
        for (let x of results){
            var accepted = false;
            var expired = false;
            var tradeSecondsLeft = Math.floor((x.expiration - Date.now()) / 1000);

            if (x.accepted == 1){
                accepted = true;
            } if (tradeSecondsLeft < 0){
                expired = true;
            }

            var offerPins = [];
            var requestPins = [];
            try{
                offerPins = JSON.parse(results[0].offer);
                requestPins = JSON.parse(results[0].request);
            } catch (error){
                validJSONTrades = false;
            }

            // even if error occurs in parse, offerPins is still defined
            tradeList.push({
                "tradeid": x.tradeid,
                "offer": offerPins,
                "request": requestPins,
                "expired": expired,
                "accepted": accepted
            });
        }

        // Wait until after the for loop to send the error
        if (validJSONTrades == false){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        res.json(tradeList);
    });
});

module.exports = router;
