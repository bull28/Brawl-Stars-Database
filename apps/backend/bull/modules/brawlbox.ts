import allSkins from "../data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, PORTRAIT_IMAGE_DIR, AVATAR_SPECIAL_DIR, RESOURCE_IMAGE_DIR} from "../data/constants";
import {Pin, UserResources, BrawlBoxDrop} from "../types";

// Contains the cost, draws, and probabilities for a Brawl Box
interface BrawlBox{
    cost: number;
    draws: number[][];
    rewards: Reward[];
    display?: {
        name: string;
        image: string;
        description: string;
        dropsDescription: string[];
    };
}

// Type of brawl box information sent to the user
interface BrawlBoxPreview{
    name: string;
    displayName: string;
    cost: number;
    image: string;
    description: string;
    dropsDescription: string[];
}

/**
 * Takes in a probability distribution encoded in an array and randomly selects an index. The probability of an index in
 * the array being selected is the value at that index / the sum of all values.
 * @param options array of numbers
 * @returns index of the number randomly selected
 */
function RNG(options: number[]): number{
    let totalWeight = 0;
    for (let x = 0; x < options.length; x++){
        totalWeight += options[x];
    }

    if (totalWeight === 0){
        return -1;
    }

    let weightRemaining = (Math.random() * totalWeight);

    let index = 0;
    let found = false;
    
    for (let x = 0; x < options.length; x++){
        if (found === false){
            weightRemaining -= options[x];
            if (weightRemaining < 0.0){
                index = x;
                found = true;
            }
        }
    }
    
    return index;
}

class Reward{
    createDropResult(): BrawlBoxDrop{
        return {
            displayName: "",
            rewardType: "empty",
            amount: 1,
            inventory: 0,
            image: "",
            backgroundColor: "#000000",
            description: ""
        };
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        return this.createDropResult();
    }
}

class CoinsReward extends Reward{
    baseAmount: number;
    range: number;

    constructor(baseAmount: number = 150, range: number = 30){
        super();

        this.baseAmount = baseAmount;
        this.range = range;
    }

    createDropResult(): BrawlBoxDrop{
        return {
            displayName: "",
            rewardType: "coins",
            amount: 0,
            inventory: 0,
            image: "",
            backgroundColor: "",
            description: ""
        };
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        let rewardAmount = 0;
        if (this.range <= 0){
            rewardAmount = this.baseAmount;
        } else{
            rewardAmount = Math.floor(this.baseAmount - this.range + Math.random() * (this.range * 2 + 1));
        }

        resources.coins += rewardAmount;
        result.amount = rewardAmount;

        return result;
    }
}

class TokenDoublerReward extends Reward{
    baseAmount: number;

    constructor(baseAmount: number = 250){
        super();

        this.baseAmount = baseAmount;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        let rewardAmount = this.baseAmount;
        if (rewardAmount <= 0){
            return result;
        }

        resources.token_doubler += rewardAmount;

        result.displayName = "Token Doubler";
        result.rewardType = "tokenDoubler";
        result.image = RESOURCE_IMAGE_DIR + "resource_token_doubler_200x" + IMAGE_FILE_EXTENSION;
        result.amount = rewardAmount;
        result.inventory = resources.token_doubler;
        result.backgroundColor = "#00da48";
        result.description = `Doubles the next ${rewardAmount} tokens collected.`;

        return result;

    }
}

class PinReward extends Reward{
    rarityDist: number[];
    minRarityDist: number[];
    newPinWeight: number[];
    coinConversion: number[];

    constructor(quality: number = 1, rarity: number = -1){
        super();

        // Higher-quality pin rewards increase the probability of higher-rarity pins being selected.
        if (quality === 1){
            // Normal quality
            this.rarityDist = [40, 30, 15, 10, 5];
            this.minRarityDist = [32, 24, 12, 8, 4];
            this.newPinWeight = [5, 5, 3, 1, 1];
            this.coinConversion = [20, 50, 100, 150, 250];
        } else if (quality === 2){
            // High-rarity quality
            this.rarityDist = [36, 24, 15, 9, 6];
            this.minRarityDist = [24, 16, 10, 6, 4];
            this.newPinWeight = [10, 10, 10, 10, 10];
            this.coinConversion = [20, 50, 100, 150, 250];
        } else if (quality === 3){
            // No duplicates
            this.rarityDist = [36, 15, 5, 3, 1];
            this.minRarityDist = [0, 0, 0, 0, 0];
            this.newPinWeight = [0, 0, 0, 0, 0];
            this.coinConversion = [160, 320, 800, 1600, 4800];
        } else{
            // Low-rarity quality
            this.rarityDist = [36, 24, 0, 0, 0];
            this.minRarityDist = [36, 24, 0, 0, 0];
            this.newPinWeight = [1, 1, 1, 1, 1];
            this.coinConversion = [20, 50, 0, 0, 0];
        }

        if (rarity >= 0){
            // Setting rarity > 0 forces a certain rarity to be selected
            for (let x = 0; x < this.rarityDist.length; x++){
                if (x !== rarity){
                    this.rarityDist[x] = 0;
                    this.minRarityDist[x] = 0;
                }
            }
        }
    }

    getDuplicateColor(oldColorString: string, factor: number): string{
        const color = oldColorString.slice(1, oldColorString.length);
        let newColorString = "#808080";
    
        // Check whether the provided string is valid
        if (color.length !== 6){
            return newColorString;
        } if (factor < 0.0 || factor > 1.0){
            return newColorString;
        } if (color.includes("-") === true){
            return newColorString;
        }
    
        let colorHex = parseInt(color, 16);
        if (isNaN(colorHex) === true){
            return newColorString;
        }
    
        // Multiply each of the RGB values by the brightness factor. colorHex is never negative so "%" works here
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

        newColorString = "#" + newColorString;
    
        return newColorString;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        if (this.rarityDist.length !== this.minRarityDist.length || this.rarityDist.length !== this.coinConversion.length){
            return result;
        }

        let userCollection = resources.brawlers;
        let modifiedRarityDist = [0, 0, 0, 0, 0];
        let pinsByRarity: [number, number][][] = [[], [], [], [], []];
        let duplicatePins: [number, number][][] = [[], [], [], [], []];
        
        let availablePins: [number, number][] = [];

        for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
            let brawler = allSkins[brawlerIndex];

            if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("pins") === true){

                if (userCollection.hasOwnProperty(brawler.name) === true){
                    for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                        const pinRarity = brawler.pins[pinIndex].rarity.value;
                        const pinAmount = userCollection[brawler.name][brawler.pins[pinIndex].name];
                        if (pinRarity < pinsByRarity.length){
                            // Add the brawler's index and the pin's index so when the random pin has to be chosen, the
                            // link to the pin object can be easily found without storing the entire pin data in an array.

                            if (pinAmount !== void 0 && pinAmount > 0){
                                duplicatePins[pinRarity].push([brawlerIndex, pinIndex]);
                            } else{
                                pinsByRarity[pinRarity].push([brawlerIndex, pinIndex]);
                            }
                        }
                    }
                }
            }
        }

        // Rarities that have all pins collected will have a lower chance of being selected. This chance is stored in
        // minRarityDist. The values are set such that this only affects drop chances when some rarities are incomplete.
        // When all rarities are complete, the drop chances are the same as they are when all rarities are incomplete.

        for (let r = 0; r < modifiedRarityDist.length; r++){
            // newPinWeight modifies the chances of getting duplicates
            if (pinsByRarity[r].length === 0){
                modifiedRarityDist[r] = this.minRarityDist[r];
            } else{
                modifiedRarityDist[r] = this.rarityDist[r];
            }
            
            if (r < pinCounts.length){
                modifiedRarityDist[r] *= pinCounts[r];
            }

            // Multiply each rarity's probability by the number of pins in that rarity divided by the total pins.

            // As more pins get added, some rarities may end up with many more pins than others. Some rarities such as
            // legendary end up with many pins because new brawl pass brawlers keep getting added and most new skins
            // have exclusive pins whereas the rare rarity has much fewer pins because each new brawler only has 2 rare
            // pins. Also, there is only 1 custom pin (rarity 4) so every time a custom pin is given, it will be that
            // same pin. This makes that pin appear much more common than it is supposed to be.

            // Because of differences in pin counts across rarities, it can take much longer to get all the legendary
            // pins, compared to rare pins. To balance this, multiplying probabilities by the number of pins makes
            // rarities with more pins more likely to drop, while making higher rarities overall less likely to drop.
        }

        // RNG does not require the distribution to be normalized
        let selectedRarity = RNG(modifiedRarityDist);


        let isDuplicate = false;
        if (selectedRarity >= 0){
            const newPinCount = pinsByRarity[selectedRarity].length;
            const duplicatePinCount = duplicatePins[selectedRarity].length;

            let duplicateProbability = 0;
            // Every pin that can be collected has a weight which represents how likely it is to be chosen.
            
            // The probability of a pin being chosen is its weight divided by the sum of all weights in that rarity.
            
            // To make it easier to collect new pins when a user does not yet have them all, new pins' weight are
            // multiplied by newPinWeight[selectedRarity], making them more likely to drop than duplicate pins.

            // If there are no more new pins available (pinsByRarity[selectedRarity].length === 0) then every pin will
            // be a duplicate, as long as there are also duplicate pins available. In this case, the value of
            // duplicateProbability does nothing. If the selected rarity has no pins available, coins are given instead.

            if (duplicatePinCount > 0 && this.newPinWeight[selectedRarity] > 0){
                //duplicateProbability = (1 / newPinWeight[selectedRarity]) * (duplicatePinCount / (newPinCount + duplicatePinCount));
                duplicateProbability = (duplicatePinCount / (newPinCount * this.newPinWeight[selectedRarity] + duplicatePinCount));
            }
            
            //if (newPinWeight[selectedRarity] > 0) console.log("Selected Rarity:", selectedRarity, " New Pins:", newPinCount, " Duplicate Pins:", duplicatePinCount,
            //    " Probability of a new pin: ", newPinCount * newPinWeight[selectedRarity], "/", (newPinCount * newPinWeight[selectedRarity] + duplicatePinCount),
            //    " Probability of a duplicate pin:", duplicatePinCount, "/", (newPinCount * newPinWeight[selectedRarity] + duplicatePinCount)
            //);
            
            if (Math.random() >= duplicateProbability && newPinCount > 0){
                availablePins = pinsByRarity[selectedRarity];
            } else if (duplicatePinCount > 0){
                isDuplicate = true;
                availablePins = duplicatePins[selectedRarity];
            }
        }

        // If there are pins available, randomly select one and add it. Otherwise, give coins as an alternative reward.
        if (availablePins.length > 0){
            const selectedPin = availablePins[Math.floor(Math.random() * availablePins.length)];
            const brawlerObject = allSkins[selectedPin[0]];
            const pinObject = brawlerObject.pins[selectedPin[1]];

            // Usually, all the pins must be stored in the database with an amount, even if they are not unlocked yet.
            // In case a certain pin was selected to be given and it does not already exist, create a new property in
            // the object and set its value to 1. This may happen when new pins are released and the existing players'
            // data has not been updated to include the new pins. Because new pins are added automatically here, an
            // update to every user in the database when a new pin gets released is not necessary.
            let brawlerInCollection = userCollection[brawlerObject.name];
            if (brawlerInCollection !== void 0){
                if (brawlerInCollection.hasOwnProperty(pinObject.name) === false){
                    brawlerInCollection[pinObject.name] = 1;
                } else{
                    brawlerInCollection[pinObject.name] = brawlerInCollection[pinObject.name] + 1;
                }

                result.rewardType = "pin";
                result.image = PIN_IMAGE_DIR + brawlerObject.name + "/" + pinObject.image;// add the brawler's name directory
                result.backgroundColor = pinObject.rarity.color;
                result.description = `A Pin for ${brawlerObject.displayName}.`;
                result.inventory = brawlerInCollection[pinObject.name];
                // pinObject.name is guaranteed to be in the collection map because it was checked above

                if (isDuplicate === true){
                    result.displayName = "Duplicate Pin";
                    result.backgroundColor = this.getDuplicateColor(pinObject.rarity.color, 0.75);
                } else{
                    result.displayName = "New Pin";
                }
            }

        } else if (this.coinConversion[selectedRarity] > 0){
            resources.coins += this.coinConversion[selectedRarity];
            result.rewardType = "coins";
            result.amount = this.coinConversion[selectedRarity];
        }

        return result;
    }
}

class WildCardPinReward extends Reward{
    rarityDist: number[];

    constructor(rarity: number = -1){
        super();

        this.rarityDist = [36, 15, 6, 3, 0];

        if (rarity >= 0){
            // Setting rarity > 0 forces a certain rarity to be selected
            for (let x = 0; x < this.rarityDist.length; x++){
                if (x !== rarity){
                    this.rarityDist[x] = 0;
                }
            }
        }
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        // If the wild card pins array is incorrectly formatted, fix it before adding a wild card pin
        if (resources.wild_card_pins.length < this.rarityDist.length){
            resources.wild_card_pins = [];
            for (let x = 0; x < this.rarityDist.length; x++){
                resources.wild_card_pins.push(0);
            }
        }

        let selectedRarity = RNG(this.rarityDist);
        if (selectedRarity >= 0){
            let rarityName = "";
            let rarityColor = "#000000";

            // Instead of getting the rarity colors by looking through the allSkins array, get them from rarityNames
            const rarityData = rarityNames.get(selectedRarity);
            if (rarityData !== void 0){
                rarityName = rarityData.name;
                rarityColor = rarityData.color;
            }


            resources.wild_card_pins[selectedRarity]++;

            result.displayName = rarityName + " Wild Card Pin";
            result.rewardType = "wildcard";
            result.image = RESOURCE_IMAGE_DIR + "wildcard_pin" + IMAGE_FILE_EXTENSION;
            result.backgroundColor = rarityColor;
            result.description = `This can be used in place of a Pin of ${rarityName} rarity when accepting a trade.`;
            result.inventory = resources.wild_card_pins[selectedRarity];
        }
        // Wild card pins can always be collected so there is no coins alternative reward available here.

        return result;
    }
}

class BrawlerReward extends Reward{
    rarityDist: number[];
    minRarityDist: number[];
    coinConversion: number;

    constructor(quality: number = 1, rarity: number = -1){
        super();

        // Unlike pins, brawlers can only be collected once. If all brawlers of the selected rarity are collected,
        // give coins instead. The coins given do not depend on the rarity selected since only some rarities can be
        // selected once they are completed.

        // Quality and rarity work the same way as they do for pins
        if (quality === 1){
            // Normal quality
            this.rarityDist = [32, 16, 8, 4, 2, 1, 1];
            this.minRarityDist = [0, 0, 0, 1, 1, 0, 0];
            this.coinConversion = 100;
        } else if (quality === 2){
            // No duplicates
            this.rarityDist = [32, 16, 8, 4, 2, 1, 1];
            this.minRarityDist = [0, 0, 0, 0, 0, 0, 0];
            this.coinConversion = 0;
        } else{
            // Low-rarity quality
            this.rarityDist = [24, 16, 16, 8, 0, 0, 0];
            this.minRarityDist = [0, 0, 0, 0, 0, 0, 0];
            this.coinConversion = 50;
        }

        if (rarity >= 0){
            for (let x = 0; x < this.rarityDist.length; x++){
                if (x !== rarity){
                    this.rarityDist[x] = 0;
                    this.minRarityDist[x] = 0;
                }
            }
        }
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        if (this.rarityDist.length !== this.minRarityDist.length){
            return result;
        }

        let userCollection = resources.brawlers;
        let modifiedRarityDist = [0, 0, 0, 0, 0, 0, 0];
        let brawlersByRarity: number[][] = [[], [], [], [], [], [], []];

        let availableBrawlers: number[] = [];

        for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
            let brawler = allSkins[brawlerIndex];

            if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("rarity") === true){
                const brawlerRarity = brawler.rarity.value;
                if (brawlerRarity < brawlersByRarity.length && userCollection.hasOwnProperty(brawler.name) === false){
                    brawlersByRarity[brawlerRarity].push(brawlerIndex);
                }
            }
        }

        for (let r = 0; r < modifiedRarityDist.length; r++){
            if (brawlersByRarity[r].length === 0){
                modifiedRarityDist[r] = this.minRarityDist[r];
            } else{
                modifiedRarityDist[r] = this.rarityDist[r];
            }
        }

        let selectedRarity = RNG(modifiedRarityDist);
        if (selectedRarity >= 0){
            availableBrawlers = brawlersByRarity[selectedRarity];
        }

        if (availableBrawlers.length > 0){
            const selectedIndex = availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)];
            const brawlerObject = allSkins[selectedIndex];
            if (userCollection.hasOwnProperty(brawlerObject.name) === false){
                userCollection[brawlerObject.name] = {};
            }

            result.displayName = brawlerObject.displayName;
            result.rewardType = "brawler";
            result.image = PORTRAIT_IMAGE_DIR + brawlerObject.image;
            result.backgroundColor = brawlerObject.rarity.color;
            result.description = brawlerObject.description;
            result.inventory = 1;
        } else{
            // if (this.coinConversion[selectedRarity] > 0){
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
        }

        return result;
    }
}

class TradeCreditsReward extends Reward{
    drops: {value: number; weight: number;}[];

    constructor(){
        super();

        this.drops = [
            {value: 1, weight: 347},
            {value: 2, weight: 972},
            {value: 3, weight: 480},
            {value: 5, weight: 160},
            {value: 10, weight: 40},
            {value: 69, weight: 1}
        ];
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        let selectedIndex = RNG(this.drops.map((value) => value.weight));
        if (selectedIndex < 0){
            return result;
        }
        resources.trade_credits += this.drops[selectedIndex].value;

        result.displayName = "Trade Credits";
        result.rewardType = "tradeCredits";
        result.image = RESOURCE_IMAGE_DIR + "resource_trade_credits_200x" + IMAGE_FILE_EXTENSION;
        result.amount = this.drops[selectedIndex].value;
        result.inventory = resources.trade_credits;
        result.backgroundColor = "#389cfc";
        result.description = "Use these to trade pins with other users. Higher-rarity pins require more credits to trade.";

        return result;
    }
}

class AvatarReward extends Reward{
    drops: {value: string; weight: number;}[];
    coinConversion: number;

    constructor(){
        super();

        this.drops = [
            {value: "brawlbox_icon", weight: 5},
            {value: "bush", weight: 4},
            {value: "viking_bull", weight: 3},
            {value: "angry_darryl", weight: 2},
            {value: "STOMPER", weight: 1}
        ];
        this.coinConversion = 100;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        let userAvatars = resources.avatars;

        // Before choosing a bonus reward type, determine whether the user
        // has avatars to collect. Do this here so the array does not have
        // to be traversed more than once.
        let availableAvatars: typeof this.drops = [];
        for (let avatarIndex = 0; avatarIndex < this.drops.length; avatarIndex++){
            if (typeof this.drops[avatarIndex].value === "string"){
                if (userAvatars.includes(this.drops[avatarIndex].value) === false){
                    availableAvatars.push(this.drops[avatarIndex]);
                }
            }
        }
        
        if (availableAvatars.length === 0){
            // If no avatar is available, give coins instead.
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
            return result;
        }

        let selectedIndex = RNG(availableAvatars.map((value) => value.weight));
        if (selectedIndex >= 0 && typeof availableAvatars[selectedIndex].value === "string"){
            userAvatars.push(availableAvatars[selectedIndex].value);
            
            result.displayName = "New Avatar";
            result.rewardType = "avatar";
            result.image = AVATAR_SPECIAL_DIR + availableAvatars[selectedIndex].value + IMAGE_FILE_EXTENSION;
            result.backgroundColor = "#f7831c";
            result.description = "Select this avatar in the account settings.";
            result.inventory = 1;
        }

        return result;
    }
}

// Initialize data that will not change but requires searching through the allSkins array to obtain.

// Stores (number of pins in each rarity / total pins). Used when selecting pins.
let pinCounts = [0, 0, 0, 0, 0];
let totalPins = 0;

// Maps a rarity value to its color and name. Used when selecting wild card pins.
export const rarityNames = new Map<number, Omit<Pin["rarity"], "value">>();

for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
    let brawler = allSkins[brawlerIndex];

    if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("pins") === true){
        for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
            const pinRarity = brawler.pins[pinIndex].rarity.value;
            if (pinRarity < pinCounts.length){
                pinCounts[pinRarity]++;
                totalPins++
            }

            if (rarityNames.has(pinRarity) === false){
                rarityNames.set(pinRarity, {
                    name: brawler.pins[pinIndex].rarity.name,
                    color: brawler.pins[pinIndex].rarity.color
                });
            }
        }
    }
}
for (let x = 0; x < pinCounts.length; x++){
    pinCounts[x] /= totalPins;
}

// List of all brawl boxes
const boxes: {[k: string]: BrawlBox} = {
    "brawlBox": {
        cost: 100,
        draws: [
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 1, 0, 0],
            [0, 0, 10, 5, 0, 3, 2],
            [3, 0, 2, 0, 0, 0, 0]
        ],
        rewards: [
            new Reward(),
            new CoinsReward(150, 30),
            new PinReward(1),
            new WildCardPinReward(),
            new BrawlerReward(1),
            new TradeCreditsReward(),
            new TokenDoublerReward(250)
        ],
        display: {
            name: "Brawl Box",
            image: "brawlbox_default",
            description: "Contains a variety of items including brawlers, pins, and bonus items.",
            dropsDescription: [
                "Coins: 120 - 180",
                "Draw 1: Pin: 2/3, Brawler: 1/3",
                "Draw 2: Pin: 1/2, Wild Card Pin: 1/4, Bonus Item: 1/4",
                "Draw 3: Pin: 2/5, Nothing: 3/5",
                "Duplicate brawlers are converted to coins."
            ]
        }
    },
    "pinPack": {
        cost: 80,
        draws: [
            [0, 1, 2],
            [0, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0]
        ],
        rewards: [
            new Reward(),
            new PinReward(2),
            new WildCardPinReward()
        ],
        display: {
            name: "Pin Pack",
            image: "brawlbox_pinpack",
            description: "Contains only pins but has a higher chance to give rarer pins and lower chance to give duplicate pins.",
            dropsDescription: [
                "Coins: 0",
                "Draw 1: Pin: 1",
                "Draw 2: Pin: 1/3, Wild Card Pin: 2/3",
                "Draws 3 to 6: Pin: 1/3, Nothing: 2/3"
            ]
        }
    },
    "megaBox": {
        cost: 240,
        draws: [
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 8, 6, 5, 4, 1],
            [0, 1, 1, 0, 0, 0],
            [0, 1, 3, 0, 0, 0]
        ],
        rewards: [
            new CoinsReward(750, 150),
            new PinReward(0),
            new BrawlerReward(0),
            new TradeCreditsReward(),
            new TokenDoublerReward(250),
            new AvatarReward()
        ],
        display: {
            name: "Mega Box",
            image: "brawlbox_megabox",
            description: "Contains many coins, brawlers, and pins. Does not contain any brawlers above Epic rarity or pins above Rare rarity.",
            dropsDescription: [
                "Coins: 600 - 900",
                "Draws 1 to 3: Pin: 1",
                "Draw 4: Pin: 1/3, Brawler: 1/4, Bonus Item: 5/12",
                "Draw 5: Pin: 1/2, Brawler: 1/2",
                "Draw 6: Pin: 1/4, Brawler: 3/4",
                "Duplicate brawlers are converted to coins."
            ]
        }
    },
    "newBrawler": {
        cost: 0,
        draws: [
            [1]
        ],
        rewards: [
            new BrawlerReward(2)
        ]
    }
};

/**
 * Opens one Brawl Box and adds resources to the user. This function modifies the resources object passed to it.
 * All Brawl Boxes are guaranteed to contain at least one item. If a box is opened and there is no item, an error
 * occurred somewhere. This function also adds all required file extensions to images.
 * @param box Brawl Box to open
 * @param resources object containing all the user's resources
 * @returns array of the items the user received
 */
function openBox(box: BrawlBox, resources: UserResources): BrawlBoxDrop[]{
    if (resources === void 0){
        return [];
    }
    
    let valid = true;
    for (let x of [
        "brawlers", "avatars", "wild_card_pins", "tokens",
        "token_doubler", "coins", "trade_credits"
    ]){
        if (resources.hasOwnProperty(x) === false){
            // Resources object missing properties
            valid = false;
        }
    }
    for (let x = 0; x < box.draws.length; x++){
        if (box.draws[x].length !== box.rewards.length){
            // Box draw arrays have incorrect lengths
            valid = false;
        }
    }

    if (valid === false){
        return [];
    }

    resources.tokens -= box.cost;

    const rewards: BrawlBoxDrop[] = [];
    let coinsReward = 0;

    // Contains an array of rewards that will be added. Each element is an index in this.rewards.
    const selections = box.draws.map((value) => RNG(value))
    .filter((value) => value >= 0 && value < box.rewards.length);

    for (let x = 0; x < selections.length; x++){
        const drop = box.rewards[selections[x]].getReward(resources);

        if (drop.rewardType === "coins"){
            coinsReward += drop.amount;
        } else if (drop.rewardType !== "empty"){
            rewards.push(drop);
        }
    }

    // All coin rewards are added together in one drop object
    if (coinsReward > 0){
        rewards.splice(0, 0, {
            displayName: "Coins",
            rewardType: "coins",
            amount: coinsReward,
            inventory: resources.coins,
            image: RESOURCE_IMAGE_DIR + "resource_coins_200x" + IMAGE_FILE_EXTENSION,
            backgroundColor: "#8ca0e0",
            description: "Spend these on special avatars and other items in the shop."
        });
    }

    return rewards;
}

/**
 * Checks if the user is able to open the box they are requesting. Since is more than one reason why the user may not
 * be able to open a box, return a status code corresponding to the reason why the user can or cannot open the box.
 * @param boxName name of the box
 * @param tokens user't token count
 * @returns status code
 */
export function canOpenBox(boxName: string, tokens: number): number{
    if (boxes.hasOwnProperty(boxName) === false){
        return 400;
    }

    const box = boxes[boxName];
    if (box.cost <= 0){
        return 400;
    }
    if (tokens < box.cost){
        return 403;
    }
    return 200;
}

export const boxList: BrawlBoxPreview[] = [];
for (let x in boxes){
    const display = boxes[x].display;
    if (boxes[x].cost > 0 && display !== void 0){
        boxList.push({
            name: x,
            displayName: display.name,
            cost: boxes[x].cost,
            image: RESOURCE_IMAGE_DIR + display.image + IMAGE_FILE_EXTENSION,
            description: display.description,
            dropsDescription: display.dropsDescription
        });
    }
}

export default function brawlBox(boxName: string, resources: UserResources): BrawlBoxDrop[]{
    if (boxes.hasOwnProperty(boxName) === true){
        return openBox(boxes[boxName], resources);
    } else{
        return [];
    }
}
