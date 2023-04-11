import allSkins from "../data/brawlers_data.json";
import dropChances from "../data/brawlbox_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, PORTRAIT_IMAGE_DIR, AVATAR_SPECIAL_DIR, RESOURCE_IMAGE_DIR} from "../data/constants";
import {
    UserResources, 
    BrawlBoxData, 
    BrawlBoxAttributes, 
    HiddenBrawlBoxAttributes, 
    RewardTypeCurrency, 
    RewardTypePin, 
    RewardTypeBrawler, 
    RewardTypeBonus, 
    BrawlBoxDrop, 
    PmfValue
} from "../types";

type UnknownBoxType = BrawlBoxAttributes | HiddenBrawlBoxAttributes
type UnknownRewardType = RewardTypeCurrency | RewardTypePin | RewardTypeBrawler | RewardTypeBonus

// These first 5 functions narrow a box or reward type to a specific type
// so properties can be accessed on it.

export function isBrawlBoxAttributes(object: UnknownBoxType): object is BrawlBoxAttributes{
    const values = object as BrawlBoxAttributes;
    return (
        typeof values.displayName != "undefined" && typeof values.description != "undefined" &&
        typeof values.dropsDescription != "undefined"
    );
}

function isRewardTypeCurrency(object: UnknownRewardType): object is RewardTypeCurrency{
    const rewards = object as RewardTypeCurrency;
    return (
        typeof rewards.minAmount != "undefined" && typeof rewards.maxAmount != "undefined"
    );
}

export function isRewardTypePin(object: UnknownRewardType): object is RewardTypePin{
    const rewards = object as RewardTypePin;
    return (
        typeof rewards.raritypmf != "undefined" && typeof rewards.minraritypmf != "undefined" &&
        typeof rewards.newPinWeight != "undefined" && typeof rewards.coinConversion != "undefined"
    );
}

function isRewardTypeBrawler(object: UnknownRewardType): object is RewardTypeBrawler{
    const rewards = object as RewardTypeBrawler;
    return (
        typeof rewards.raritypmf != "undefined" && typeof rewards.minraritypmf != "undefined" &&
        typeof rewards.coinConversion != "undefined"
    );
}

function isRewardTypeBonus(object: UnknownRewardType): object is RewardTypeBonus{
    const rewards = object as RewardTypeBonus;
    if (!Array.isArray(rewards.pmfobject)){
        return false;
    }
    let isBonus = true;
    for (let x = 0; x < rewards.pmfobject.length; x++){
        isBonus = isBonus && (
            typeof rewards.pmfobject[x].value != "undefined" &&
            typeof rewards.pmfobject[x].weight != "undefined"
        );
    }
    return isBonus;
}

/**
 * Converts the brawl box drop chances in the data file to an object
 * of a specific type that can be used in other functions.
 * @returns brawl box data
 */
export function convertBrawlBoxData(): BrawlBoxData{
    let brawlBox: BrawlBoxData = {
        boxes: new Map<string, UnknownBoxType>(),
        rewardTypes: new Map<string, UnknownRewardType>()
    }

    for (let x in dropChances.boxes){
        let k = x as keyof typeof dropChances.boxes;
        brawlBox.boxes.set(x, dropChances.boxes[k]);
    }

    for (let x in dropChances.rewardTypes){
        let k = x as keyof typeof dropChances.rewardTypes;
        brawlBox.rewardTypes.set(x, dropChances.rewardTypes[k]);
    }

    return brawlBox;
}

/**
 * Takes in a probability mass function encoded in an array and
 * randomly selects an index. The probability of an index in the array
 * being selected is the value at that index / the sum of all values.
 * @param options array of numbers
 * @returns index of the number randomly selected
 */
function RNG(options: number[]): number{
    let totalWeight = 0;
    for (let x = 0; x < options.length; x++){
        totalWeight += options[x];
    }

    if (totalWeight == 0){
        return -1;
    }

    let weightRemaining = (Math.random() * totalWeight);

    let index = 0;
    let found = false;
    
    
    for (let x = 0; x < options.length; x++){
        if (found == false){
            weightRemaining -= options[x];
            if (weightRemaining < 0.0){
                index = x;
                found = true;
            }
        }
    }
    
    return index;
}

/**
 * Multiplies a color code's value by a factor, between 0 and 1 to
 * provide a darker version of the rarity color when receiving
 * duplicate pins. Any invalid inputs will return a gray color.
 * @param oldColorString hex code of the color ("#" + 6 digits)
 * @param factor amount to multiply brightness by, must be in [0.0, 1.0]
 * @returns modified hex code of the color
 */
function getDuplicateColor(oldColorString: string, factor: number): string{
    const color = oldColorString.slice(1, oldColorString.length);
    let newColorString = "#808080";

    // Check whether the provided string is valid
    if (color.length != 6){
        return newColorString;
    } if (factor < 0.0 || factor > 1.0){
        return newColorString;
    } if (color.includes("-")){
        return newColorString;
    }

    let colorHex = parseInt(color, 16);
    if (isNaN(colorHex)){
        return newColorString;
    }

    // The toString method converts hex digits to lowercase letters so if the
    // original was uppercase then convert the result to uppercase
    const isUpperCase = color.toUpperCase() == color;

    // Multiply each of the red, green, and blue values by the brightness factor
    // colorHex is never negative so "%" works here
    colorHex = Math.floor(colorHex * factor / 65536) * 65536 + Math.floor((colorHex % 65536) * factor / 256) * 256 + Math.floor((colorHex % 256) * factor);

    // Convert the new hex value to a string then return it
    newColorString = colorHex.toString(16);
    
    // Make sure the new string has exactly 6 digits
    // If the new string has more than 6 then remove the higher order bits
    // If the new string has less than 6 then add zeros from the left
    if (newColorString.length > 6){
        newColorString = newColorString.slice(newColorString.length - 6, newColorString.length);
    } else{
        const missingDigits = 6 - newColorString.length;
        for (let x = 0; x < missingDigits; x++){
            newColorString = "0" + newColorString;
        }
    }

    if (isUpperCase){
        newColorString = newColorString.toUpperCase();
    }
    newColorString = "#" + newColorString;

    return newColorString;
}

/**
 * Opens a Brawl Box and directly adds the contents of it to the user.
 * All Brawl Boxes are guaranteed to contain at least one item. If a
 * box is opened and there is no item, an error occurred somewhere.
 * A valid dropChances object must be passed to this function. This
 * function adds all required file extensions to images.
 * @param dropChances valid brawl box drop chances object
 * @param boxType type of brawl box to open
 * @param resources object containing all the user's resources (this object will change)
 * @returns array of the items the user received
 */
export default function brawlBox(dropChances: BrawlBoxData, boxType: string, resources: UserResources): BrawlBoxDrop[]{
    if (typeof resources == "undefined"){
        return [];
    }

    const resourceProperties = [
        "brawlers",
        "avatars",
        "wild_card_pins",
        "tokens",
        "token_doubler",
        "coins",
        "trade_credits"
    ];
    
    let missingProperties = false;
    for (let x of resourceProperties){
        if (!(resources.hasOwnProperty(x))){
            missingProperties = true;
        }
    }

    if (missingProperties){
        // User is missing some resource information
        return [];
    }

    if (boxType == "bonus" || !dropChances.boxes.has(boxType)){
        // Brawl Box type does not exist
        return [];
    }

    // All types of brawl boxes are guaranteed to give at least one drop, even coins
    // If a brawl box gives nothing then an error can be sent back

    // Deduct tokens to pay for the brawl box
    resources.tokens -= dropChances.boxes.get(boxType)!.cost;

    let rewards: BrawlBoxDrop[] = [];
    let coinsReward = 0;
    
    const draws = dropChances.boxes.get(boxType)!.draws;
    const rewardTypeValues = dropChances.boxes.get(boxType)!.rewardTypeValues;

    let selections: string[] = [];
    for (let x of draws){
        let thisReward = rewardTypeValues[RNG(x)];
        if (typeof thisReward != "undefined"){
            selections.push(thisReward);
        }
    }

    for (let x of selections){
        if (x != "nothing"){
            let drop = {
                displayName: "",
                rewardType: "empty",
                amount: 1,
                inventory: 0,
                image: "",
                backgroundColor: "#000000",
                description: ""
            };

            
            const rewardType = dropChances.rewardTypes.get(x);
            if (x == "coins"){
                if (typeof rewardType != "undefined" && isRewardTypeCurrency(rewardType)){
                    drop = selectCoins(rewardType, resources);
                }
            } else if (x == "pin" || x == "pinLowRarity" || x == "pinHighRarity" || x == "pinNoDupes"){
                if (typeof rewardType != "undefined" && isRewardTypePin(rewardType)){
                    drop = selectPin(rewardType, resources);
                }
            } else if (x == "wildcard"){
                // Wild card pins use the brawler reward type
                if (typeof rewardType != "undefined" && isRewardTypeBrawler(rewardType)){
                    drop = selectWildCardPin(rewardType, resources);
                }
            } else if (x == "brawler" || x == "brawlerLowRarity" || x == "brawlerHighRarity"){
                if (typeof rewardType != "undefined" && isRewardTypeBrawler(rewardType)){
                    drop = selectBrawler(rewardType, resources);
                }
            } else if (x == "bonus"){
                const bonusBox = dropChances.boxes.get(x);
                if (typeof bonusBox != "undefined"){
                    drop = selectBonus(bonusBox, dropChances.rewardTypes, resources);
                }
            }

            if (drop.rewardType == "coins"){
                coinsReward += drop.amount;
            } else if (drop.rewardType != "empty"){
                rewards.push(drop);
            }
        }
    }

    // Add all coin rewards together at the same time
    if (coinsReward > 0){
        rewards.splice(0, 0, {
            displayName: "Coins",
            rewardType: "coins",
            amount: coinsReward,
            inventory: resources.coins,
            image: RESOURCE_IMAGE_DIR + "resource_coins_200x" + IMAGE_FILE_EXTENSION,
            backgroundColor: "#8CA0E0",
            description: "Spend these on special avatars and other items in the shop."
        });
    }

    return rewards;
}

// All select... functions do the same operation but give a
// different reward type. They take in objects representing
// drop chances and the player's resources.
// They then randomly select a drop and add it to the player's
// resources and return an object describing the drop.

function selectCoins(coinsDropChances: RewardTypeCurrency, resources: UserResources): BrawlBoxDrop{
    const amounts = coinsDropChances;
    let rewardAmount = 0;
    if (amounts.minAmount == amounts.maxAmount){
        rewardAmount = amounts.minAmount;
    } else{
        rewardAmount = Math.floor(amounts.minAmount + Math.random() * (amounts.maxAmount - amounts.minAmount + 1));
    }

    resources.coins += rewardAmount;

    return ({
        displayName: "",
        rewardType: "coins",
        amount: rewardAmount,
        inventory: 0,
        image: "",
        backgroundColor: "",
        description: ""
    });
}

function selectPin(pinDropChances: RewardTypePin, resources: UserResources): BrawlBoxDrop{
    let result = {
        displayName: "",
        rewardType: "empty",
        amount: 1,
        inventory: 0,
        image: "",
        backgroundColor: "#000000",
        description: ""
    };

    let userCollection = resources.brawlers;
    //raritypmf = [36, 15, 6, 3, 0];
    //raritypmf = [0, 0, 0, 0, 0];
    //raritypmf = pinDropChances.raritypmf;
    let modifiedRaritypmf = [0, 0, 0, 0, 0];
    const raritypmf = pinDropChances.raritypmf;
    const minraritypmf = pinDropChances.minraritypmf;
    const newPinWeight = pinDropChances.newPinWeight;
    let pinsByRarity: [number, number][][] = [[], [], [], [], []];
    let duplicatePins: [number, number][][] = [[], [], [], [], []];

    if (raritypmf.length != minraritypmf.length){
        return result;
    }
    if (raritypmf.length != pinDropChances.coinConversion.length){
        return result;
    }
    
    let availablePins: [number, number][] = [];

    for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];

        //let missingProperties = (!(brawler.hasOwnProperty("name") && brawler.hasOwnProperty("pins")));
        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("pins")){
            //let hasBrawler = userCollection.hasOwnProperty(brawler.name);

            if (userCollection.has(brawler.name)){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    const pinRarity = brawler.pins[pinIndex].rarity.value;
                    const pinAmount = (userCollection.get(brawler.name)!).get(brawler.pins[pinIndex].name);
                    //if (pinRarity < pinsByRarity.length && userCollection[brawler.name].includes(brawler.pins[pinIndex].name) == false){
                    if (pinRarity < pinsByRarity.length){
                        // Add the brawler's index and the pin's index so when the random pin has to be
                        // chosen, the link to the pin object can be easily found without storing the
                        // entire pin data in an array.

                        //availablePins.push([brawlerIndex, pinIndex]);
                        if (typeof pinAmount != "undefined" && pinAmount > 0){
                            duplicatePins[pinRarity].push([brawlerIndex, pinIndex]);
                        } else{
                            pinsByRarity[pinRarity].push([brawlerIndex, pinIndex]);
                        }
                    }
                }
            }
        }
    }

    // Rarities that have all pins collected will have a lower chance of
    // being selected. This chance is stored in minraritypmf.
    // Since this affects the drop chances even when all pins are collected,
    // resulting in more copies of high-rarity pins, the relative rarities
    // are the same in minraritypmf as they are in raritypmf.

    for (let r = 0; r < modifiedRaritypmf.length; r++){
        // newPinWeight modifies the chances of getting duplicates
        if (pinsByRarity[r].length == 0){
            modifiedRaritypmf[r] = minraritypmf[r];
        } else{
            modifiedRaritypmf[r] = raritypmf[r];
        }
    }
    
    let selectedRarity = RNG(modifiedRaritypmf);


    let duplicate = false;// used to determine whether the pin received was a duplicate then send the correct message to the user
    if (selectedRarity >= 0){
        const newPinCount = pinsByRarity[selectedRarity].length;
        const duplicatePinCount = duplicatePins[selectedRarity].length;

        let duplicateProbability = 0;
        // Every pin that can be collected has a weight which represents how likely it is to
        // be chosen.
        
        // The probability of a specific pin being chosen is its weight divided by the sum of all pins' weight in that rarity.
        
        // To make it easier to collect new pins when a user does not yet have them all,
        // new pins' weight are multiplied by newPinWeight[selectedRarity], making them
        // more likely to drop than duplicate pins.

        // If there are no more new pins available (pinsByRarity[selectedRarity].length == 0)
        // then every pin will be a duplicate, as long as there are also duplicate pins available.
        // In this case, the value of duplicateProbability does not do anything.
        // If the selected rarity has no pins available, coins will be given instead.

        if (duplicatePinCount > 0 && newPinWeight[selectedRarity] > 0){
            //duplicateProbability = (1 / newPinWeight[selectedRarity]) * (duplicatePinCount / (newPinCount + duplicatePinCount));
            duplicateProbability = (duplicatePinCount / (newPinCount * newPinWeight[selectedRarity] + duplicatePinCount));
        }
        
        //if (newPinWeight[selectedRarity] > 0) console.log("Selected Rarity:", selectedRarity, " New Pins:", newPinCount, " Duplicate Pins:", duplicatePinCount,
        //    " Probability of a new pin: ", newPinCount * newPinWeight[selectedRarity], "/", (newPinCount * newPinWeight[selectedRarity] + duplicatePinCount),
        //    " Probability of a duplicate pin:", duplicatePinCount, "/", (newPinCount * newPinWeight[selectedRarity] + duplicatePinCount)
        //);

        // Math.random() > duplicateProbability is the same as Math.random() < (1 - duplicateProbability)
        if (Math.random() >= duplicateProbability && newPinCount > 0){
            availablePins = pinsByRarity[selectedRarity];
        } else if (duplicatePinCount > 0){
            duplicate = true;
            availablePins = duplicatePins[selectedRarity];
        }
    }

    // If there are pins available to collect, randomly select one and add it.
    // Otherwise, give coins as an alternative reward.
    if (availablePins.length > 0){
        const selectedPin = availablePins[Math.floor(Math.random() * availablePins.length)];
        const brawlerObject = allSkins[selectedPin[0]];
        const pinObject = brawlerObject.pins[selectedPin[1]];
        //userCollection[allSkins[selectedPin[0]].name].push(pinObject.name);
        //userCollection[brawlerObject.name] = userCollection[brawlerObject.name].concat([pinObject.name]);

        // Usually, all the pins must be stored in the database with an amount, even if they are not unlocked yet.
        // In case a certain pin was selected to be given and it does not already exist, create a new property in
        // the object and set its value to 1. This may happen when new pins are released and the existing players'
        // data has not been updated to include the new pins. Because new pins are added automatically here, an
        // update to every user in the database when a new pin gets released is not necessary.
        let brawlerInCollection = userCollection.get(brawlerObject.name);
        if (typeof brawlerInCollection != "undefined"){
            if (!brawlerInCollection.has(pinObject.name)){
                brawlerInCollection.set(pinObject.name, 1);
            } else{
                const pinAmount = brawlerInCollection.get(pinObject.name)!;
                brawlerInCollection.set(pinObject.name, pinAmount + 1);
            }

            //result.displayName = "New Pin";
            result.rewardType = "pin";
            result.image = PIN_IMAGE_DIR + brawlerObject.name + "/" + pinObject.image;// add the brawler's name directory
            result.backgroundColor = pinObject.rarity.color;
            result.description = "A Pin for " + brawlerObject.displayName + ".";
            result.inventory = brawlerInCollection.get(pinObject.name)!;
            // pinObject.name is guaranteed to be in the collection map because it was checked above

            if (duplicate){
                result.displayName = "Duplicate Pin";
                result.backgroundColor = getDuplicateColor(pinObject.rarity.color, 0.75);
            } else{
                result.displayName = "New Pin";
            }
        }

    } else if (pinDropChances.coinConversion[selectedRarity] > 0){
        resources.coins += pinDropChances.coinConversion[selectedRarity];

        result.rewardType = "coins";
        result.amount = pinDropChances.coinConversion[selectedRarity];
    }

    return result;
}

function selectWildCardPin(wildCardDropChances: RewardTypeBrawler, resources: UserResources): BrawlBoxDrop{
    let result = {
        displayName: "",
        rewardType: "empty",
        amount: 1,
        inventory: 0,
        image: "",
        backgroundColor: "#000000",
        description: ""
    };

    //raritypmf = [36, 15, 6, 3, 0];
    const raritypmf = wildCardDropChances.raritypmf;

    // If the wild card pins array is incorrectly formatted
    // fix it before adding a wild card pin
    if (resources.wild_card_pins.length < raritypmf.length){
        resources.wild_card_pins = [];
        for (let x = 0; x < raritypmf.length; x++){
            resources.wild_card_pins.push(0);
        }
    }

    let selectedRarity = RNG(raritypmf);
    if (selectedRarity >= 0){
        let rarityName = "";
        let rarityColor = "#000000";

        // Look through the allSkins array to get the rarity
        // colors for the pin since there is no other place
        // where they are stored...
        let x = 0;
        let found = false;
        while (x < allSkins.length && found == false){
            if (allSkins[x].hasOwnProperty("pins")){
                for (let y of allSkins[x].pins){
                    if (y.rarity.value == selectedRarity){
                        rarityName = y.rarity.name;
                        rarityColor = y.rarity.color;
                        found = true;
                    }
                }
            }
            x++;
        }
        resources.wild_card_pins[selectedRarity]++;

        result.displayName = rarityName + " Wild Card Pin";
        result.rewardType = "wildcard";
        result.image = RESOURCE_IMAGE_DIR + "wildcard_pin" + IMAGE_FILE_EXTENSION;
        result.backgroundColor = rarityColor;
        result.description = "This can be used in place of a Pin of " + rarityName + " rarity when accepting a trade.";
        result.inventory = resources.wild_card_pins[selectedRarity];
    }
    // Wild card pins can always be collected so there is no coins
    // alternative reward available here.

    return result;
}

function selectBrawler(brawlerDropChances: RewardTypeBrawler, resources: UserResources): BrawlBoxDrop{
    // Refer to selectPins for comments, most of the logic is the
    // same except brawlers are being added instead of pins
    let result = {
        displayName: "",
        rewardType: "empty",
        amount: 1,
        inventory: 0,
        image: "",
        backgroundColor: "#000000",
        description: ""
    };

    let userCollection = resources.brawlers;
    //raritypmf = [32, 16, 8, 4, 2, 1, 1];
    //raritypmf = [0, 0, 0, 0, 0, 0, 0];
    let modifiedRaritypmf = [0, 0, 0, 0, 0, 0, 0];
    const raritypmf = brawlerDropChances.raritypmf;
    const minraritypmf = brawlerDropChances.minraritypmf;
    let brawlersByRarity: number[][] = [[], [], [], [], [], [], []];

    if (raritypmf.length != minraritypmf.length){
        return result;
    }
    if (brawlerDropChances.coinConversion.length != raritypmf.length){
        return result;
    }

    let availableBrawlers: number[] = [];

    for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];

        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("rarity")){
            const brawlerRarity = brawler.rarity.value;
            if (brawlerRarity < brawlersByRarity.length && !userCollection.has(brawler.name)){
                //availableBrawlers.push(brawlerIndex);
                brawlersByRarity[brawlerRarity].push(brawlerIndex);
            }
        }
    }

    for (let r = 0; r < modifiedRaritypmf.length; r++){
        if (brawlersByRarity[r].length == 0){
            modifiedRaritypmf[r] = minraritypmf[r];
        } else{
            modifiedRaritypmf[r] = raritypmf[r];
        }
    }

    let selectedRarity = RNG(modifiedRaritypmf);
    if (selectedRarity >= 0){
        availableBrawlers = brawlersByRarity[selectedRarity];
    }

    if (availableBrawlers.length > 0){
        const selectedIndex = availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)];
        const brawlerObject = allSkins[selectedIndex];
        if (!(userCollection.has(brawlerObject.name))){
            userCollection.set(brawlerObject.name, new Map<string, number>);
        }

        result.displayName = brawlerObject.displayName;
        result.rewardType = "brawler";
        result.image = PORTRAIT_IMAGE_DIR + brawlerObject.image;
        result.backgroundColor = brawlerObject.rarity.color;
        result.description = brawlerObject.description;
        result.inventory = 1;
    } else if (brawlerDropChances.coinConversion[selectedRarity] > 0){
        resources.coins += brawlerDropChances.coinConversion[selectedRarity];

        result.rewardType = "coins";
        result.amount = brawlerDropChances.coinConversion[selectedRarity];
    }

    return result;
}

function selectBonus(allBonusDrops: HiddenBrawlBoxAttributes, rewardTypes: BrawlBoxData["rewardTypes"], resources: UserResources): BrawlBoxDrop{
    let result = {
        displayName: "",
        rewardType: "empty",
        amount: 1,
        inventory: 0,
        image: "",
        backgroundColor: "#000000",
        description: ""
    };

    let userAvatars = resources.avatars;
    let bonuspmf = [0, 0, 0];

    const avatarDropChances = rewardTypes.get("avatar");
    if (!(typeof avatarDropChances != "undefined" && isRewardTypeBonus(avatarDropChances))){
        return result;
    }
    const specialAvatars = avatarDropChances.pmfobject;// list of all avatars
    if (typeof specialAvatars == "undefined"){
        return result;
    }

    // Before choosing a bonus reward type, determine whether the user
    // has avatars to collect. Do this here so the array does not have
    // to be traversed more than once.
    let availableAvatars: PmfValue[] = [];
    for (let avatarIndex = 0; avatarIndex < specialAvatars.length; avatarIndex++){
        if (typeof specialAvatars[avatarIndex].value == "string"){
            if (!(userAvatars.includes(specialAvatars[avatarIndex].value as string))){
                availableAvatars.push(specialAvatars[avatarIndex]);
            }
        }
    }

    const bonusDraws = allBonusDrops.draws[0];
    if (bonusDraws.length != bonuspmf.length){
        return result;
    }

    for (let x = 0; x < bonusDraws.length; x++){
        if (allBonusDrops.rewardTypeValues[x] == "avatar"){
            if (availableAvatars.length == 0){
                // If there are no avatars available, remove the option to drop one
                bonuspmf[x] = 0;
            } else{
                bonuspmf[x] = bonusDraws[x];
            }
        } else{
            bonuspmf[x] = bonusDraws[x];
        }
    }

    let selection = "";
    let selectedBonus = RNG(bonuspmf);

    if (selectedBonus >= 0){
        selection = allBonusDrops.rewardTypeValues[selectedBonus];
    }

    // Trade credits
    if (selection == "tradeCredits"){
        //const tradeCreditpmf = [347, 972, 480, 160, 40, 1];
        //const tradeCreditValues = [1, 2, 3, 5, 10, 69];
        
        const rewardDropChances = rewardTypes.get(allBonusDrops.rewardTypeValues[0]);
        if (typeof rewardDropChances != "undefined" && isRewardTypeBonus(rewardDropChances)){
            const tradeCreditDrops = rewardDropChances.pmfobject;
            let tradeCreditpmf = [];
            for (let x of tradeCreditDrops){
                tradeCreditpmf.push(x.weight);
            }

            let selectedIndex = RNG(tradeCreditpmf);
            if (selectedIndex >= 0 && typeof tradeCreditDrops[selectedIndex].value == "number"){
                resources.trade_credits += tradeCreditDrops[selectedIndex].value as number;

                result.displayName = "Trade Credits";
                result.rewardType = "tradeCredits";
                result.image = RESOURCE_IMAGE_DIR + "resource_trade_credits_200x" + IMAGE_FILE_EXTENSION;
                result.amount = tradeCreditDrops[selectedIndex].value as number;
                result.inventory = resources.trade_credits;
                result.backgroundColor = "#389CFC";
                result.description = "Use these to trade pins with other users. Higher-rarity pins require more credits to trade.";
            }
        }
    }
    // Token doubler
    else if (selection == "tokenDoubler"){
        const rewardDropChances = rewardTypes.get(allBonusDrops.rewardTypeValues[1]);
        if (typeof rewardDropChances != "undefined" && isRewardTypeCurrency(rewardDropChances)){
            const amounts = rewardDropChances;
            let rewardAmount = 0;
            if (amounts.minAmount == amounts.maxAmount){
                rewardAmount = amounts.minAmount;
            } else{
                rewardAmount = Math.floor(amounts.minAmount + Math.random() * (amounts.maxAmount - amounts.minAmount + 1));
            }

            resources.token_doubler += rewardAmount;

            result.displayName = "Token Doubler";
            result.rewardType = "tokenDoubler";
            result.image = RESOURCE_IMAGE_DIR + "resource_token_doubler_200x" + IMAGE_FILE_EXTENSION;
            result.amount = rewardAmount;
            result.inventory = resources.token_doubler;
            result.backgroundColor = "#A248FF";
            result.description = "Doubles the next " + rewardAmount.toString() + " tokens collected.";
        }
    }
    // Avatar
    else if (selection == "avatar"){
        let avatarpmf = [];
        for (let x of availableAvatars){
            avatarpmf.push(x.weight);
        }
        
        let selectedIndex = RNG(avatarpmf);
        if (selectedIndex >= 0 && typeof availableAvatars[selectedIndex].value == "string"){
            userAvatars.push(availableAvatars[selectedIndex].value as string);
            
            result.displayName = "New Avatar";
            result.rewardType = "avatar";
            result.image = AVATAR_SPECIAL_DIR + availableAvatars[selectedIndex].value + IMAGE_FILE_EXTENSION;
            result.backgroundColor = "#F7831C";
            result.description = "Select this avatar in the account settings.";
            result.inventory = 1;
        }
    }

    return result;
}
