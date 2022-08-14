/**
 * Takes an array of pins to be traded and returns a new array containing
 * all the pins in the original array that have valid names.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Array} pinArray json array with the pin objects
 * @param {*} pinFile file path to the directory containing the pins
 * @param {*} searchByName whether or not to match pin strings by name
 * @returns array of valid pins
 */
function validatePins(allSkins, pinArray, pinFile, searchByName){
    //pinArray.slice()
    var validArray = [];
    var alreadyAdded = [];
    for (let x of pinArray){
        // These are the 3 properties each input object must have
        if (x.hasOwnProperty("brawler") && x.hasOwnProperty("pin") && x.hasOwnProperty("amount")){
            // search through the skins array by brawler name but since the name is a property
            // then filter has to be used instead of includes
            let brawlerObjects = allSkins.filter((element, index, array) => {return element.name == x.brawler;});
            if (brawlerObjects.length > 0 && brawlerObjects[0].hasOwnProperty("pins")){
                // do same type of search through pins except there are 2 ways to do the search
                // by name and by image
                var pinObjects = [];
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
                            "amount": x.amount,
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
 * Returns the cost of trading a pin based on its rarity. All numbers
 * returned are 10 times their intended value to avoid floating point
 * rounding errors.
 * @param {Number} rarityValue numerical value of the rarity
 * @returns Number
 */
function tradeCreditsByRarity(rarityValue){
    // All costs are divided by 10 later
    // to avoid floating point errors

    // Base cost to trade any pin
    var tradeCredits = 3;

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
 * Calculates the cost of a trade based on how many pins are being exchanged
 * and what the rarity of those pins are. Returns a number, representing how
 * many trade credits are required to perform the trade.
 * @param {Array} offerPins valid array of pins to give
 * @param {Array} requestPins valid array of pins to receive
 * @returns Number
 */
function getTradeCost(offerPins, requestPins){
    var totalTradeCost = 0;

    if (!(offerPins && requestPins)){
        return totalTradeCost;
    }

    // Add costs from each pin's rarity
    // A small extra cost is added if there are multiple copies of the
    // same pin being traded
    for (let x of offerPins){
        totalTradeCost += tradeCreditsByRarity(x.rarityValue);
        if (x.amount > 1){
            totalTradeCost += (x.amount - 1);
        }
    }
    for (let x of requestPins){
        totalTradeCost += tradeCreditsByRarity(x.rarityValue);
        if (x.amount > 1){
            totalTradeCost += (x.amount - 1);
        }
    }

    totalTradeCost = Math.ceil(totalTradeCost / 10);

    return totalTradeCost;
}

exports.validatePins = validatePins;
exports.getTradeCost = getTradeCost;
