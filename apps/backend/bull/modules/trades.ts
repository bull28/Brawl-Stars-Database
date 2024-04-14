import allSkins from "../data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR} from "../data/constants";
import {Pin, TradePin, TradePinData, TradePinValid} from "../types";

/**
 * Takes an array of pins to be traded and returns a new array containing all the pins that have valid names.
 * @param pinArray array of all pin objects from the request
 * @param searchByName whether or not to match pin strings by name instead of image
 * @returns array of valid pin objects
 */
export function validatePins(pinArray: TradePin[], searchByName: boolean): TradePinValid[]{
    const validArray: TradePinValid[] = [];
    const alreadyAdded: string[] = [];
    for (const x of pinArray){
        // These are the 3 properties each input object must have
        if (Object.hasOwn(x, "brawler") === true && Object.hasOwn(x, "pin") === true && Object.hasOwn(x, "amount") === true){
            // Search through the skins array by brawler name but since the name is a property then filter has to be
            // used instead of includes
            const brawlerObjects = allSkins.filter((element) => element.name === x.brawler);
            if (brawlerObjects.length > 0 && Object.hasOwn(brawlerObjects[0], "pins") === true){
                // Do the same type of search through pins except the search can be done either by name or by image
                let pinObjects: Pin[];
                if (searchByName === true){
                    pinObjects = brawlerObjects[0].pins.filter((element) => element.name === x.pin);
                } else{
                    const imageArray = x.pin.split("/");
                    // Remove the file path directories before checking the image
                    pinObjects = brawlerObjects[0].pins.filter((element) => element.image === imageArray[imageArray.length - 1]);
                }

                if (pinObjects.length > 0){
                    const thisPin = pinObjects[0];
                    if (
                        Object.hasOwn(thisPin, "rarity") === true && Object.hasOwn(thisPin, "image") === true &&
                        x.amount > 0 && alreadyAdded.includes(thisPin.name) === false
                    ){
                        validArray.push({
                            brawler: brawlerObjects[0].name,
                            pin: thisPin.name,
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
 * Adds images to a trade's offer or request and removes properties that do not need to be displayed on the screen.
 * @param validPinArray array of pin objects with valid names and images
 * @returns formatted offer or request array that can be sent to the user
 */
export function formatTradeData(validPinArray: TradePinValid[]): TradePinData[]{
    const formatArray: TradePinData[] = [];
    for (const x of validPinArray){
        if (Object.hasOwn(x, "brawler") === true && Object.hasOwn(x, "pin") === true){
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
    // All costs are divided by 10 later to avoid floating point errors
    // This also allows more precision when combining pin and time costs

    // Base cost to trade any pin
    let tradeCredits = 3;

    // Higher rarities are more expensive to trade
    if (rarityValue === 1){
        tradeCredits = 5;
    } else if (rarityValue === 2){
        tradeCredits = 9;
    } else if (rarityValue === 3){
        tradeCredits = 15;
    } else if (rarityValue === 4){
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

    if (offerPins === undefined || requestPins === undefined){
        return totalTradeCost;
    }

    // Add costs from each pin's rarity
    // A small extra cost is added if there are multiple copies of the same pin being traded
    for (const x of offerPins){
        totalTradeCost += tradeCostMultiplier(x.amount) * tradeCreditsByRarity(x.rarityValue);
    }
    for (const x of requestPins){
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
 * Calculates the number of seconds left for a trade using the expiration time from the database.
 * @param expiration expiration time stored in the database
 * @returns time in seconds
 */
export function getTradeTimeLeft(expiration: number): number{
    const secondsLeft = Math.floor((expiration - Date.now()) / 1000);
    if (secondsLeft < 0){
        return 0;
    }
    return secondsLeft;
}
