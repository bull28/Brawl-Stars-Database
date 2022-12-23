// This route contains operations relating to viewing trades

const express = require("express");
const router = express.Router();

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";
const TRADE_TABLE_NAME = process.env.DATABASE_TRADE_TABLE_NAME || "brawl_stars_trades";

// maps only used to do time calculations
const maps = require("../modules/maps");
const fileLoader = require("../modules/fileloader");

// constants for trades
const MAX_ACTIVE_TRADES = 25;// will be lowered later when done testing
const TRADES_PER_PAGE = 20;


/**
 * Calculates the time left for a trade using the expiration time from the
 * database. Returns [1, 0, 0, 0] for all times greater than 1 season.
 * If expired, returns [0, 0, 0, 0].
 * @param {Number} expiration expiration time stored in the database
 * @returns SeasonTime
 */
function getTradeTimeLeft(expiration){
    var tradeSecondsLeft = Math.floor((expiration - Date.now()) / 1000);
    var tradeTimeLeft = new maps.SeasonTime(0, 0, 0, 0);
    if (tradeSecondsLeft > maps.MAP_CYCLE_HOURS * 3600){
        tradeTimeLeft = new maps.SeasonTime(1, 0, 0, 0);
    } else if (tradeSecondsLeft > 0){
        tradeTimeLeft = maps.addSeasonTimes(tradeTimeLeft, new maps.SeasonTime(0, 0, 0, tradeSecondsLeft));
    }

    return tradeTimeLeft;
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
        if (error){
            res.status(500).send("Could not connect to database.");
            return;
        }
        if (results.length == 0){
            res.status(404).send("Trade with the given ID does not exist.");
            return;
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
            "cost": results[0].trade_credits,
            "offer": offerPins,
            "request": requestPins,
            "timeLeft": getTradeTimeLeft(results[0].expiration),
            "accepted": (results[0].accepted == 1),
            "acceptedBy": results[0].accepted_by
        }

        res.json(tradeData);
    });
});

// Get all active trades a user currently has
router.post("/user", (req, res) => {
    const username = req.body.username;// will change to post request later

    if (!(username)){
        res.status(400).send("No username provided.");
        return;
    }

    database.queryDatabase(
    "SELECT tradeid, offer, request, trade_credits, expiration, accepted FROM " + TRADE_TABLE_NAME + " WHERE creator = ? LIMIT ?;",
    [username, MAX_ACTIVE_TRADES], (error, results, fields) => {
        if (error){
            res.status(500).send("Could not connect to database.");
            return;
        }

        var tradeList = [];

        var validJSONTrades = true;
        for (let x of results){

            var offerPins = [];
            var requestPins = [];
            try{
                offerPins = JSON.parse(x.offer);
                requestPins = JSON.parse(x.request);
            } catch (error){
                validJSONTrades = false;
            }

            tradeList.push({
                "tradeid": x.tradeid,
                "cost": x.trade_credits,
                "offer": offerPins,
                "request": requestPins,
                "timeLeft": getTradeTimeLeft(x.expiration),
                "accepted": (x.accepted == 1)
            });
        }

        // Wait until after the for loop to handle the error
        if (validJSONTrades == false){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        res.json(tradeList);
    });
});

// Get all trades with different sorting methods
router.post("/all", (req, res) => {
    const sortMethod = req.body.sortMethod;

    var filterColumn = "offer";
    var filterString = '%%';
    var sortString = "expiration DESC";
    var minExpiration = 0;
    var limitStart = 0;

    if (sortMethod == "lowtime"){
        sortString = "expiration";
        // Do not show trades that are about to expire very shortly
        minExpiration += 300000;
    } else if (sortMethod == "lowcost"){
        sortString = "trade_credits";
    } else if (sortMethod == "highcost"){
        sortString = "trade_credits DESC"
    }

    // Only return a few trades at a time. The user can switch to a later
    // page to view more trades.
    if (req.body.page > 0){
        limitStart = TRADES_PER_PAGE * (req.body.page - 1);
    }

    // If true, apply filters to request instead of offer
    if (req.body.filterInRequest == true){
        filterColumn = "request";
    }

    // Apply filters by either pin or brawler
    // If a filter by pin is specified, it overrides the filter by brawler
    if (req.body.pin){
        filterString = '%"pin":"' + req.body.pin + '"%';
    } else if (req.body.pinImage){
        filterString = '%"pinImage":"' + req.body.pinImage + '"%';
    } else if (req.body.brawler){
        filterString = '%"brawler":"' + req.body.brawler + '"%';
    }

    database.queryDatabase(
    "SELECT tradeid, creator, creator_color, offer, request, trade_credits, expiration FROM " + TRADE_TABLE_NAME + " WHERE " + filterColumn + " LIKE ? AND expiration > ? ORDER BY " + sortString + " LIMIT ?, ?;",
    [filterString, minExpiration, limitStart, TRADES_PER_PAGE], (error, results, fields) => {
        if (error){
            res.status(500).send("Could not connect to database.");
            return;
        }

        var tradeList = [];

        var validJSONTrades = true;
        for (let x of results){
            var offerPins = [];
            var requestPins = [];
            try{
                offerPins = JSON.parse(x.offer);
                requestPins = JSON.parse(x.request);
            } catch (error){
                validJSONTrades = false;
            }

            // Unlike for the user, this endpoint does not return expired trades
            tradeList.push({
                "tradeid": x.tradeid,
                "creator": x.creator,
                "creatorColor": x.creator_color,
                "cost": x.trade_credits,
                "offer": offerPins,
                "request": requestPins,
                "timeLeft": getTradeTimeLeft(x.expiration)
            });
        }

        if (validJSONTrades == false){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        res.json(tradeList);
    });
});

module.exports = router;