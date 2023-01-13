/**
 * Takes an array of pins to be traded and returns a new array containing
 * all the pins in the original array that have valid names.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Array} pinArray json array with the pin objects
 * @param {String} pinFile file path to the directory containing the pins
 * @param {Boolean} searchByName whether or not to match pin strings by name
 * @returns array of valid pins
 */
function validatePins(allSkins, pinArray, pinFile, searchByName){
    //pinArray.slice()
    let validArray = [];
    let alreadyAdded = [];
    for (let x of pinArray){
        // These are the 3 properties each input object must have
        if (x.hasOwnProperty("brawler") && x.hasOwnProperty("pin") && x.hasOwnProperty("amount")){
            // search through the skins array by brawler name but since the name is a property
            // then filter has to be used instead of includes
            let brawlerObjects = allSkins.filter((element, index, array) => {return element.name == x.brawler;});
            if (brawlerObjects.length > 0 && brawlerObjects[0].hasOwnProperty("pins")){
                // do same type of search through pins except there are 2 ways to do the search
                // by name and by image
                let pinObjects = [];
                if (searchByName){
                    pinObjects = brawlerObjects[0].pins.filter((element, index, array) => {return element.name == x.pin;});
                } else{
                    let imageArray = x.pin.split("/");
                    // remove the file path directories before checking the image
                    pinObjects = brawlerObjects[0].pins.filter((element, index, array) => {return element.image == imageArray[imageArray.length - 1];});
                }
                
                if (pinObjects.length > 0){
                    let thisPin = pinObjects[0];
                    if (thisPin.hasOwnProperty("rarity") && thisPin.hasOwnProperty("image") && x.amount > 0 && alreadyAdded.includes(thisPin.name) == false){
                        validArray.push({
                            "brawler": brawlerObjects[0].name,
                            "pin": thisPin.name,
                            "pinImage": pinFile + brawlerObjects[0].name + "/" + thisPin.image,
                            "amount": Math.min(x.amount, 1000),
                            "rarityValue": thisPin.rarity.value,
                            "rarityColor": thisPin.rarity.color
                        });
                        alreadyAdded.push(thisPin.name);
                    }
                }
            }
        }
    }
    return validArray;
}

/**
 * Returns 10 times the cost of trading a pin based on its rarity.
 * @param {Number} rarityValue numerical value of the rarity
 * @returns Number
 */
function tradeCreditsByRarity(rarityValue){
    // All costs are divided by 10 later
    // to avoid floating point errors
    // and to allow more precision when
    // combining pin and time costs

    // Base cost to trade any pin
    let tradeCredits = 3;

    // Higher rarities are more expensive to trade
    if (rarityValue == 1){
        tradeCredits = 5;
    } else if (rarityValue == 2){
        tradeCredits = 9;
    } else if (rarityValue == 3){
        tradeCredits = 15;
    } else if (rarityValue == 4){
        tradeCredits = 30;
    }

    return tradeCredits;
}

/**
 * There is a discount for trading multiple copies of a pin in one trade.
 * Returns how many times more expensive a trade would cost when trading
 * more than one copy of a pin.
 * @param {Number} amount 
 * @returns Number
 */
function tradeCostMultiplier(amount){
    let costMultiplier = 1.0;
    if (amount > 15){
        costMultiplier = 3.0 + 0.025 * (amount - 15);
    } else if (amount > 5){
        costMultiplier = 2.0 + 0.1 * (amount - 5);
    } else if (amount > 1){
        costMultiplier = 1.0 + 0.25 * (amount - 1);
    }
    return costMultiplier;
}


/**
 * Calculates the cost of a trade based on how many pins are being exchanged
 * and what the rarity of those pins are. Returns a number, representing how
 * many trade credits are required to perform the trade.
 * @param {Array} offerPins valid array of pins to give
 * @param {Array} requestPins valid array of pins to receive
 * @returns Number
 */
function getTradeCost(offerPins, requestPins){
    let totalTradeCost = 0.0;

    if (!(offerPins && requestPins)){
        return totalTradeCost;
    }

    // Add costs from each pin's rarity
    // A small extra cost is added if there are multiple copies of the
    // same pin being traded
    for (let x of offerPins){
        totalTradeCost += tradeCostMultiplier(x.amount) * tradeCreditsByRarity(x.rarityValue);
    }
    for (let x of requestPins){
        totalTradeCost += tradeCostMultiplier(x.amount) * tradeCreditsByRarity(x.rarityValue);
    }

    return Math.round(totalTradeCost);
}

/**
 * Calculates the additional cost of a trade based on how much time the trade
 * lasts for. Trades 48 hours or less do not cost extra credits. Trades
 * should not last more than 336 hours (or 1 season).
 * @param {Number} tradeHours number of hours the trade will last
 * @returns 
 */
function getTimeTradeCost(tradeHours){
    let timeTradeCost = 0;

    if (tradeHours > 48){
        if (tradeHours <= 72){
            timeTradeCost = 6 * (tradeHours - 48) / 24;
        } else if (tradeHours <= 120){
            timeTradeCost = 6 + 6 * (tradeHours - 72) / 48;
        } else if (tradeHours <= 168){
            timeTradeCost = 12 + 6 * (tradeHours - 120) / 48;
        } else if (tradeHours <= 240){
            timeTradeCost = 18 + 6 * (tradeHours - 168) / 72;
        } else if (tradeHours <= 336){
            timeTradeCost = 24 + 6 * (tradeHours - 240) / 96;
        } else{
            timeTradeCost = 1000;
        }
    }

    return Math.floor(timeTradeCost);
}

exports.validatePins = validatePins;
exports.getTradeCost = getTradeCost;
exports.getTimeTradeCost = getTimeTradeCost;
