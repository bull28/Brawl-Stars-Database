import allSkins from "../data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR} from "../data/constants";
import { MAP_CYCLE_HOURS, SeasonTime, addSeasonTimes } from "./maps";
import {TradePin, TradePinData, TradePinValid} from "../types";

/**
 * Takes an array of pins to be traded and returns a new array containing
 * all the pins in the original array that have valid names.
 * @param pinArray array of all pin objects from the request
 * @param searchByName whether or not to match pin strings by name instead of image
 * @returns array of valid pin objects
 */
export function validatePins(pinArray: TradePin[], searchByName: boolean): TradePinValid[]{
    let validArray: TradePinValid[] = [];
    let alreadyAdded: string[] = [];
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
                    if (thisPin.hasOwnProperty("rarity") && thisPin.hasOwnProperty("image") && x.amount > 0 && !alreadyAdded.includes(thisPin.name)){
                        validArray.push({
                            brawler: brawlerObjects[0].name,
                            pin: thisPin.name,
                            //pinImage: pinFile + brawlerObjects[0].name + "/" + thisPin.image,
                            amount: Math.min(x.amount, 1000),
                            rarityValue: thisPin.rarity.value,
                            rarityColor: thisPin.rarity.color
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
 * Adds images to a trade's offer or request information and removes
 * all information that does not need to be displayed on the screen.
 * @param validPinArray array of pin objects with valid names and images
 * @returns formatted offer or request array that can be sent to the user
 */
export function formatTradeData(validPinArray: TradePinValid[]): TradePinData[]{
    let formatArray: TradePinData[] = [];
    for (let x of validPinArray){
        if (x.hasOwnProperty("brawler") && x.hasOwnProperty("pin")){
            formatArray.push({
                pinImage: PIN_IMAGE_DIR + x.brawler + "/" + x.pin + IMAGE_FILE_EXTENSION,
                amount: x.amount,
                rarityValue: x.rarityValue,
                rarityColor: x.rarityColor
            });
        }
    }
    return formatArray;
}

function tradeCreditsByRarity(rarityValue: number): number{
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

function tradeCostMultiplier(amount: number): number{
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

export function getTradeCost(offerPins: TradePinValid[], requestPins: TradePinValid[]): number{
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

export function getTimeTradeCost(tradeHours: number): number{
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

/**
 * Calculates the time left for a trade using the expiration time from the
 * database. Returns [1, 0, 0, 0] for all times greater than 1 season.
 * If expired, returns [0, 0, 0, 0].
 * @param expiration expiration time stored in the database
 * @returns time represented as SeasonTime
 */
export function getTradeTimeLeft(expiration: number): SeasonTime{
    let tradeSecondsLeft = Math.floor((expiration - Date.now()) / 1000);
    let tradeTimeLeft = new SeasonTime(0, 0, 0, 0);
    if (tradeSecondsLeft > MAP_CYCLE_HOURS * 3600){
        tradeTimeLeft = new SeasonTime(1, 0, 0, 0);
    } else if (tradeSecondsLeft > 0){
        tradeTimeLeft = addSeasonTimes(tradeTimeLeft, new SeasonTime(0, 0, 0, tradeSecondsLeft));
    }

    return tradeTimeLeft;
}
