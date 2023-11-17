import express from "express";
import {AVATAR_IMAGE_DIR, IMAGE_FILE_EXTENSION, TRADES_PER_PAGE} from "../data/constants";
import {databaseErrorHandler, parseTradePins, viewTradeAll, viewTradeID, viewTradeUser} from "../modules/database";
import {formatTradeData, getTradeTimeLeft} from "../modules/trades";
import {Empty, TradeAllData, TradePinValid, TradeUserData} from "../types";

const router = express.Router();


interface TradeQuery{
    tradeid: string;
}

interface TradeUserReqBody{
    username: string;
}

interface TradeAllReqBody{
    page: number;
    sortMethod: string;
    filterInRequest: boolean;
    brawler: string;
    pin: string;
    pinImage: string;
}


// Get details about a specific trade
router.get<Empty, Empty, Empty, TradeQuery>("/id", databaseErrorHandler<Empty, TradeQuery>(async (req, res) => {
    const tradeidString = req.query.tradeid;

    if (isNaN(+tradeidString) === true){
        res.status(400).send("Invalid Trade ID.");
        return;
    }
    const tradeid = parseInt(tradeidString);

    const results = await viewTradeID({tradeid: tradeid});

    // results.length === 0 checked

    const tradeResults = results[0];

    let offerPins: TradePinValid[];
    let requestPins: TradePinValid[];
    try{
        offerPins = parseTradePins(tradeResults.offer);
        requestPins = parseTradePins(tradeResults.request);
    } catch (error){
        res.status(500).send("Trade data could not be loaded.");
        return;
    }

    // Trade costs are stored in the database as 10 times the amount of credits required
    res.json({
        creator: {
            username: tradeResults.creator,
            avatar: AVATAR_IMAGE_DIR + tradeResults.creator_avatar + IMAGE_FILE_EXTENSION,
            avatarColor: tradeResults.creator_color
        },
        cost: Math.ceil(tradeResults.trade_credits / 10),
        offer: formatTradeData(offerPins),
        request: formatTradeData(requestPins),
        timeLeft: getTradeTimeLeft(tradeResults.expiration),
        accepted: (tradeResults.accepted === 1),
        acceptedBy: tradeResults.accepted_by
    });
}));

// Get all active trades a user currently has
router.post<Empty, Empty, TradeUserReqBody>("/user", databaseErrorHandler<TradeUserReqBody>(async (req, res) => {
    const username = req.body.username;

    if (typeof username !== "string"){
        res.status(400).send("No username provided.");
        return;
    }

    const results = await viewTradeUser({username: username});

    // results.length === 0 does not need to be checked

    const tradeList: TradeUserData[] = [];
    let validTrades = true;
    for (let x = 0; x < results.length; x++){
        const trade = results[x];

        let offerPins: TradePinValid[] = [];
        let requestPins: TradePinValid[] = [];
        try{
            offerPins = parseTradePins(trade.offer);
            requestPins = parseTradePins(trade.request);
        } catch (error){
            validTrades = false;
        }

        tradeList.push({
            tradeid: trade.tradeid,
            cost: Math.ceil(trade.trade_credits / 10),
            offer: formatTradeData(offerPins),
            request: formatTradeData(requestPins),
            timeLeft: getTradeTimeLeft(trade.expiration),
            accepted: (trade.accepted === 1)
        });
    }

    // Wait until after the for loop to handle the error
    if (validTrades === false){
        res.status(500).send("Trade data could not be loaded.");
        return;
    }

    res.json(tradeList);
}));

// Get all trades that match specific filters and sorting methods
router.post<Empty, Empty, TradeAllReqBody>("/all", databaseErrorHandler<TradeAllReqBody>(async (req, res) => {
    const sortMethod = req.body.sortMethod;

    let filterColumn = "offer";
    let filterString = '%%';
    let sortString = "expiration DESC";
    let minExpiration = 0;
    let limitStart = 0;

    if (sortMethod === "lowtime"){
        sortString = "expiration";
        // Do not show trades that are about to expire very shortly
        minExpiration += 300000;
    } else if (sortMethod === "lowcost"){
        sortString = "trade_credits";
    } else if (sortMethod === "highcost"){
        sortString = "trade_credits DESC";
    }

    // Only return a few trades at a time. The user can switch to a later
    // page to view more trades.
    if (req.body.page > 0){
        limitStart = TRADES_PER_PAGE * (req.body.page - 1);
    }

    // If true, apply filters to request instead of offer
    if (req.body.filterInRequest === true){
        filterColumn = "request";
    }

    // Apply filters by either pin or brawler
    // If a filter by pin is specified, it overrides the filter by brawler
    if (typeof req.body.pin === "string" && req.body.pin !== ""){
        filterString = '%"pin":"' + req.body.pin + '"%';
    } else if (typeof req.body.pinImage === "string" && req.body.pinImage !== ""){
        filterString = '%"pinImage":"' + req.body.pinImage + '"%';
    } else if (typeof req.body.brawler === "string" && req.body.brawler !== ""){
        filterString = '%"brawler":"' + req.body.brawler + '"%';
    }

    const results = await viewTradeAll({
        filterString: filterString,
        minExpiration: minExpiration,
        limitStart: limitStart,
        limitAmount: TRADES_PER_PAGE,
        filterColumn: filterColumn,
        sortString: sortString
    });

    // results.length === 0 does not need to be checked

    
    const tradeList: TradeAllData[] = [];
    let validTrades = true;
    for (let x = 0; x < results.length; x++){
        const trade = results[x];

        let offerPins: TradePinValid[] = [];
        let requestPins: TradePinValid[] = [];
        try{
            offerPins = parseTradePins(trade.offer);
            requestPins = parseTradePins(trade.request);
        } catch (error){
            validTrades = false;
        }

        // Unlike for the user, this endpoint does not return expired trades
        tradeList.push({
            tradeid: trade.tradeid,
            creator: {
                username: trade.creator,
                avatar: AVATAR_IMAGE_DIR + trade.creator_avatar + IMAGE_FILE_EXTENSION,
                avatarColor: trade.creator_color
            },
            cost: Math.ceil(trade.trade_credits / 10),
            offer: formatTradeData(offerPins),
            request: formatTradeData(requestPins),
            timeLeft: getTradeTimeLeft(trade.expiration)
        });
    }

    if (validTrades === false){
        res.status(500).send("Trade data could not be loaded.");
        return;
    }

    res.json(tradeList);
}));

export default router;
