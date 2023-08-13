import express from "express";
import {validateToken} from "../modules/authenticate";
import {formatTradeData, getTimeTradeCost, getTradeCost, validatePins} from "../modules/trades";
import {formatCollectionData} from "../modules/pins";
import {DatabaseBrawlers, DatabaseWildCard, TradePin, TradePinValid, DatabaseAccessories} from "../types";
import {
    databaseErrorHandler, 
    parseBrawlers, 
    parseNumberArray, 
    parseStringArray, 
    parseTradePins, 
    stringifyBrawlers, 
    getTradeAccept, 
    getTradeClose, 
    selectLastID, 
    beforeTrade, 
    createTrade, 
    afterTrade, 
    afterTradeAccept, 
    afterTradeClose
} from "../modules/database";

const router = express.Router();


interface CreateReqBody{
    token: string;
    tradeDurationHours: number;
    offer: TradePin[];
    request: TradePin[];
    searchByName: boolean;
    getCost: boolean;
}

interface AcceptReqBody{
    token: string;
    tradeid: number;
    forceAccept: boolean;
    useWildCards: boolean;
}

interface CloseReqBody{
    token: string;
    tradeid: number;
    forceAccept: boolean;
}


// Create a new trade
router.post<{}, {}, CreateReqBody>("/create", databaseErrorHandler<CreateReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    let searchByName = false;
    if (req.body.searchByName === true){
        searchByName = true;
    }

    let tradeHours = 48;
    if (typeof req.body.tradeDurationHours !== "undefined"){
        tradeHours = req.body.tradeDurationHours;
    }
    if (tradeHours < 1 || tradeHours > 336){
        // This will not execute if they do not provide a tradeDurationHours
        res.status(403).send("Cannot create trades outside the range of 1 - 336 hours.");
        return;
    }

    if (username !== "" && typeof req.body.offer !== "undefined" && typeof req.body.request !== "undefined"){
        // Run the function to validate the user's pin requests
        let offerPins = validatePins(req.body.offer, searchByName);
        let requestPins = validatePins(req.body.request, searchByName);

        if (offerPins.length > 10 || requestPins.length > 10){
            res.status(400).send("Too many pins in request or offer.");
            return;
        }
        if (offerPins.length === 0 && requestPins.length === 0){
            res.status(400).send("Trade does not contain any pins being exchanged.");
            return;
        }

        // If the same pin exists in both offer and request, stop the trade
        const offerPinsNames = offerPins.map(element => element.pin);
        const requestPinsNames = requestPins.map(element => element.pin);
        let validPins = true;
        for (let x = 0; x < offerPinsNames.length; x++){
            if (requestPinsNames.includes(offerPinsNames[x]) === true){
                validPins = false;
            }
        }

        if (validPins === false){
            res.status(400).send("Cannot have the same pin in both offer and request.");
            return;
        }

        // trade costs are stored in the database as 10 times the amount of credits required
        const tradeCost = getTradeCost(offerPins, requestPins);
        const timeTradeCost = getTimeTradeCost(tradeHours);
        const totalTradeCost = Math.ceil((tradeCost + timeTradeCost) / 10);

        // At this point, the trade is a valid trade (the user may not have the requirements or resources
        // to create it though). The value returned here is the number of trade credits it would require
        // to create a trade with the given offer, request, and duration.
        if (req.body.getCost === true){
            res.json({tradeCost: totalTradeCost});
            return;
        }

        const results = await beforeTrade({username: username});

        // results.length === 0 checked

        let userResources = results[0];
        let userAvatarColor = "#FFFFFF";

        let collectionData: DatabaseBrawlers;
        let userAccessories: DatabaseAccessories;
        try{
            collectionData = parseBrawlers(userResources.brawlers);
            userAccessories = parseStringArray(userResources.accessories);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        // Get the user's avatar color and that will be the text color when displaying all trades
        userAvatarColor = formatCollectionData(collectionData, userAccessories, userResources.level).avatarColor;


        // Not enough trade credits
        if (userResources.trade_credits < totalTradeCost){
            res.status(403).send("Not enough Trade Credits. Open Brawl Boxes to get more.");
            return;
        }

        let hasRequiredPins = true;
        for (let x of offerPins){
            if (collectionData.hasOwnProperty(x.brawler) === true){
                const brawler = collectionData[x.brawler];
                if (brawler.hasOwnProperty(x.pin) === true){
                    const pinAmount = brawler[x.pin];
                    if (pinAmount < x.amount){
                        hasRequiredPins = false;
                    } else{
                        // It is ok to modify the collection here because even if the user does not have all required
                        // pins and the trade has to be cancelled with only some of their pins removed, the new collection
                        // is not written to the database unless the trade was successful.
                        brawler[x.pin] = pinAmount - x.amount;
                        //collectionData[x.brawler][x.pin] -= x.amount;
                    }
                    //console.log(collectionData[x.brawler][x.pin]);
                } else{
                    // They do not have the pin unlockd for that brawler
                    hasRequiredPins = false;
                }
            } else{
                // They do not have the brawler unlocked
                hasRequiredPins = false;
            }
        }

        // User does not have the pins they are offering
        if (hasRequiredPins === false){
            res.status(403).send("You do not have enough copies of the pins required to create this trade.");
            return;
        }

        // Deduct trade credits (if there is an error later, it will not be written to database)
        userResources.trade_credits -= totalTradeCost;

        // tradeHours defaults to 2 days expiry time
        const tradeExpiration = Date.now() + tradeHours * 3600000;

        const updateResults = await createTrade({
            creator: username,
            creator_avatar: userResources.active_avatar,
            creator_color: userAvatarColor,
            offer: JSON.stringify(offerPins),
            request: JSON.stringify(requestPins),
            trade_credits: tradeCost,
            trade_credits_time: timeTradeCost,
            expiration: tradeExpiration
        });

        // updateResults.affectedRows === 0 checked


        // Get the tradeid that was just inserted and it will be returned to the user
        const lastInsertID = await selectLastID();

        // lastInsertID.length === 0 checked

        const tradeidResult = lastInsertID[0].lastid;


        // Update the user's data after their resources and pins have been changed
        const updateUserResults = await afterTrade({
            brawlers: stringifyBrawlers(collectionData),
            trade_credits: userResources.trade_credits,
            wild_card_pins: userResources.wild_card_pins,
            username: username,
        });

        // updateUserResults.affectedRows === 0 checked

        res.json({tradeid: tradeidResult});
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Accept an existing trade
router.post<{}, {}, AcceptReqBody>("/accept", databaseErrorHandler<AcceptReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    let tradeid = req.body.tradeid;

    // useWildCards makes the server check if the user has a wild card pin to use instead when they are missing a required pin
    // forceAccept makes the server accept the trade anyway even if the user would not be able to collect a pin because they
    // do not have the brawler unlocked.
    let useWildCards = false;
    let forceAccept = false;
    if (req.body.useWildCards === true){
        useWildCards = true;
    }
    if (req.body.forceAccept === true){
        forceAccept = true;
    }

    if (username !== "" && typeof tradeid !== "undefined"){
        const results = await beforeTrade({username: username});

        // results.length === 0 checked

        // Load the data then get the trade data and compare then
        let userResources = results[0];

        let collectionData: DatabaseBrawlers;
        let wildCardPins: DatabaseWildCard;
        try{
            collectionData = parseBrawlers(userResources.brawlers);
            wildCardPins = parseNumberArray(userResources.wild_card_pins);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        // Get the trade data for the tradeid specified by the user
        const getTrade = await getTradeAccept({
            tradeid: tradeid,
            minExpiration: Date.now() + 300000,
            accepted: 0
        });

        // getTrade.length === 0 checked

        let tradeResults = getTrade[0];

        // Trying to accept their own trade...
        if (tradeResults.creator === username){
            res.status(400).send("You cannot accept your own trade!");
            return;
        }

        let offerPins: TradePinValid[];
        let requestPins: TradePinValid[];
        try{
            offerPins = parseTradePins(tradeResults.offer);
            requestPins = parseTradePins(tradeResults.request);
        } catch (error){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        // The acceptor does not pay any time cost for the trade
        const tradeCost = tradeResults.trade_credits;
        const totalTradeCost = Math.ceil(tradeCost / 10);

        // Not enough trade credits
        if (userResources.trade_credits < totalTradeCost){
            res.status(403).send("Not enough Trade Credits. Open Brawl Boxes to get more.");
            return;
        }

        let hasRequiredPins = true;
        for (let x of requestPins){
            // First check if they have the required pins in their collection
            if (collectionData.hasOwnProperty(x.brawler) === true){
                const brawler = collectionData[x.brawler];
                if (brawler.hasOwnProperty(x.pin) === true){
                    let collectionPinCount = brawler[x.pin];
                    if (collectionPinCount >= x.amount){
                        // User has all the required pins
                        brawler[x.pin] = collectionPinCount - x.amount;
                        //collectionData[x.brawler][x.pin] -= x.amount;
                    } else if (collectionPinCount > 0){
                        // User has some pins but not the full required amount
                        let missingPins = x.amount - collectionPinCount;
                        if (wildCardPins[x.rarityValue] >= missingPins){
                            // If they have enough wild card pins to fill the remainder, set their pins
                            // to 0 then deduct the missing pins from their wild card pins.
                            wildCardPins[x.rarityValue] -= missingPins;
                            brawler[x.pin] = 0;
                            //collectionData[x.brawler][x.pin] -= collectionPinCount;
                        } else{
                            hasRequiredPins = false;
                        }
                    } else{
                        // User has none of the required pins
                        // In this case, check for wild card pins below
                        hasRequiredPins = false;
                    }
                } else{
                    hasRequiredPins = false;
                }
            } else{
                // They do not have the brawler unlocked
                hasRequiredPins = false;
            }

            // If they do not have the required pins, check if they have enough wild cards
            if (hasRequiredPins === false && useWildCards === true){
                if (wildCardPins[x.rarityValue] >= x.amount){
                    wildCardPins[x.rarityValue] -= x.amount
                    hasRequiredPins = true;
                } else{
                    hasRequiredPins = false;
                }
            }
        }
        // If they still do not have the required pins, check their wild card pins only
        // if they enabled that option


        // User does not have the pins the trade creator wants
        if (hasRequiredPins === false){
            res.status(403).send("You do not have enough copies of the pins required to accept this trade.");
            return;
        }

        // Deduct trade credits (if there is an error later, it will not be written to database)
        userResources.trade_credits -= totalTradeCost;

        // Array of pins the user received which will be sent to them as information
        let tradedItems: TradePinValid[] = [];

        let hasRequiredBrawlers = true;
        for (let x of offerPins){
            if (collectionData.hasOwnProperty(x.brawler) === true){
                const brawler = collectionData[x.brawler];
                // If the user already has the pin in their collection, add the amount they will receive
                if (brawler.hasOwnProperty(x.pin) === true){
                    brawler[x.pin], brawler[x.pin] + x.amount;
                    //collectionData[x.brawler][x.pin] += x.amount;
                }
                // If the user has the brawler but not the pin, add the new pin to their collection
                // and set its amount to the amount given in the trade
                else{
                    brawler[x.pin], x.amount;
                    //collectionData[x.brawler][x.pin] = x.amount;
                }
                tradedItems.push(x);
            } else{
                hasRequiredBrawlers = false;
            }
            // If the user does not have the brawler unlocked, they cannot receive the pin.
        }

        // If the user does not have the brawlers unlocked, they have the option to accept anyway
        // and not collect those pins or for the server to prevent them from accepting.
        if (forceAccept === false && hasRequiredBrawlers === false){
            res.status(403).send("You do not have the necessary brawlers unlocked to accept the trade.");
            return;
        }


        const updateResults = await afterTrade({
            brawlers: stringifyBrawlers(collectionData),
            wild_card_pins: JSON.stringify(wildCardPins),
            trade_credits: userResources.trade_credits,
            username: username
        });

        // updateResults.affectedRows === 0 checked

        // At this point, the update to the user was successful so the trade can be marked as completed

        // Set the trade's status to accepted and accepted_by to the user's name


        const updateTrade = await afterTradeAccept({
            expiration: 0,
            accepted: 1,
            accepted_by: username,
            tradeid: tradeid
        });

        // updateTrade.affectedRows === 0 checked

        res.json(formatTradeData(tradedItems));
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Close a trade, collecting rewards if successful or refunding payment if unsuccessful
router.post<{}, {}, CloseReqBody>("/close", databaseErrorHandler<CloseReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    let tradeid = req.body.tradeid;

    let forceAccept = false;
    if (req.body.forceAccept === true){
        forceAccept = true;
    }

    if (username !== "" && typeof tradeid !== "undefined"){
        const results = await beforeTrade({username: username});

        // results.length === 0 checked

        // Load the data then get the trade data and compare then
        let collectionData: DatabaseBrawlers;
        let userTradeCredits = results[0].trade_credits;
        let wildCards = results[0].wild_card_pins;
        try{
            collectionData = parseBrawlers(results[0].brawlers);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }


        // Get the trade data for the tradeid specified by the user
        const getTrade = await getTradeClose({tradeid: tradeid});

        // getTrade.length === 0 checked
        
        let tradeResults = getTrade[0];

        if (tradeResults.creator !== username){
            res.status(401).send("You did not create this trade!");
            return;
        }

        let offerPins: TradePinValid[];
        let requestPins: TradePinValid[];
        try{
            offerPins = parseTradePins(tradeResults.offer);
            requestPins = parseTradePins(tradeResults.request);
        } catch (error){
            res.status(500).send("Trade data could not be loaded.");
            return;
        }

        // The time cost for the trade had to be stored in the database
        // in case the user cancels the trade, there will be a way to find
        // out how many credits they spent on the time.
        const tradeCost = tradeResults.trade_credits;
        const timeTradeCost = tradeResults.trade_credits_time;
        const totalTradeCost = Math.ceil((tradeCost + timeTradeCost) / 10);

        // Based on whether the trade was complete or not, pins will be added
        // back from either the offer or request
        let addPinsFrom: TradePinValid[] = [];
        if (tradeResults.accepted === 1){
            // If the trade was completed, add pins from the request
            addPinsFrom = requestPins;
        } else{
            // If the trade was expired or no one accepted it, add pins back from the offer
            // Also refund the trade credits they paid to create the trade
            addPinsFrom = offerPins;
            userTradeCredits += totalTradeCost;
        }

        // Array of pins the user received which will be sent to them as information
        let tradedItems: TradePinValid[] = [];


        let hasRequiredBrawlers = true;
        for (let x of addPinsFrom){
            if (collectionData.hasOwnProperty(x.brawler) === true){
                const brawler = collectionData[x.brawler];
                if (brawler.hasOwnProperty(x.pin) === true){
                    brawler[x.pin] = brawler[x.pin] + x.amount;
                    //collectionData[x.brawler][x.pin] += x.amount;
                }
                else{
                    brawler[x.pin], x.amount;
                    //collectionData[x.brawler][x.pin] = x.amount;
                }
                tradedItems.push(x);
            } else{
                hasRequiredBrawlers = false;
            }
            // If the user does not have the brawler unlocked, they cannot receive the pin.
        }


        if (forceAccept === false && hasRequiredBrawlers === false){
            res.status(403).send("You do not have the necessary brawlers unlocked to accept the trade.");
            return;
        }

        // Tell the user who accepted their trade
        const acceptedBy = getTrade[0].accepted_by;

        // Update the user's data after their resources and pins have been changed
        const updateResults = await afterTrade({
            brawlers: stringifyBrawlers(collectionData),
            trade_credits: userTradeCredits,
            wild_card_pins: wildCards,
            username: username
        });

        // updateResults.affectedRows === 0 checked

        // Remove the trade from the database
        const deleteResults = await afterTradeClose({tradeid: tradeid});

        // deleteResults.affectedRows === 0 checked

        let tradeSuccess = false;
        if (tradeResults.accepted === 1){
            tradeSuccess = true;
        }

        res.json({
            complete: tradeSuccess,
            acceptedBy: acceptedBy,
            pins: formatTradeData(tradedItems)
        });
    } else{
        res.status(401).send("Invalid token.");
    }
}));

export default router;
