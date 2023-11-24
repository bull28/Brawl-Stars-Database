import allSkins from "../data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, PORTRAIT_IMAGE_DIR, AVATAR_SPECIAL_DIR, THEME_SPECIAL_DIR, RESOURCE_IMAGE_DIR, themeMap} from "../data/constants";
import {Pin, UserResources, BrawlBoxDrop} from "../types";

// Probability distribution where each option has a string value
type NamedDistribution = {
    value: string;
    weight: number;
}[];

/**
 * Takes in a probability distribution encoded in an array and randomly selects an index. The probability of an index in
 * the array being selected is the value at that index / the sum of all values.
 * @param options array of numbers
 * @returns index of the number randomly selected
 */
export function RNG(options: number[]): number{
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

function getDuplicateColor(oldColorString: string, factor: number): string{
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

function copyDistribution(d: number[], input?: number[]): number[]{
    if (input !== void 0 && input.length === d.length){
        for (let x = 0; x < input.length; x++){
            d[x] = input[x];
        }
    }
    return d;
}

export class Reward{
    createDropResult(): BrawlBoxDrop{
        return {
            displayName: "", rewardType: "empty", amount: 1, inventory: 0,
            image: "", backgroundColor: "#000000", description: ""
        };
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        return this.createDropResult();
    }
}

export class CoinsReward extends Reward{
    baseAmount: number;
    range: number;

    constructor(baseAmount: number = 150, range: number = 30){
        super();

        this.baseAmount = baseAmount;
        this.range = range;
    }

    createDropResult(): BrawlBoxDrop{
        return {
            displayName: "", rewardType: "coins", amount: 0, inventory: 0,
            image: "", backgroundColor: "", description: ""
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

export class TokenDoublerReward extends Reward{
    baseAmount: number;

    constructor(baseAmount: number = 200){
        super();

        this.baseAmount = baseAmount;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        const rewardAmount = this.baseAmount;
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

export class PinReward extends Reward{
    rarityDist: number[];
    minRarityDist: number[];
    newPinWeight: number[];
    coinConversion: number[];

    constructor(rarityDist?: number[], minRarityDist?: number[], newPinWeight?: number[], coinConversion?: number[]){
        super();

        this.rarityDist = copyDistribution([40, 30, 15, 10, 5], rarityDist);
        this.minRarityDist = copyDistribution([32, 24, 12, 8, 4], minRarityDist);
        this.newPinWeight = copyDistribution([5, 5, 3, 1, 1], newPinWeight);
        this.coinConversion = copyDistribution([20, 50, 100, 150, 250], coinConversion);
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        if (this.rarityDist.length !== this.minRarityDist.length || this.rarityDist.length !== this.coinConversion.length){
            return result;
        }

        const userCollection = resources.brawlers;
        const modifiedRarityDist = [0, 0, 0, 0, 0];
        const pinsByRarity: [number, number][][] = [[], [], [], [], []];
        const duplicatePins: [number, number][][] = [[], [], [], [], []];
        
        let availablePins: [number, number][] = [];

        for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
            const brawler = allSkins[brawlerIndex];
            //if (Object.hasOwn(brawler, "name") === true && Object.hasOwn(brawler, "pins") === true)
            if (Object.hasOwn(userCollection, brawler.name) === true){
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
        const selectedRarity = RNG(modifiedRarityDist);


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
            const brawlerInCollection = userCollection[brawlerObject.name];
            if (brawlerInCollection !== void 0){
                if (Object.hasOwn(brawlerInCollection, pinObject.name) === false){
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
                    result.backgroundColor = getDuplicateColor(pinObject.rarity.color, 0.75);
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

export class FixedRarityPinReward extends Reward{
    rarity: number;
    newPinWeight: number;
    coinConversion: number;

    constructor(rarity: number = 0, newPinWeight?: number, coinConversion?: number){
        super();

        const defaultNewWeight = [5, 5, 3, 1, 1];
        const defaultConversions = [20, 50, 100, 150, 250];

        this.rarity = 0;
        this.newPinWeight = 1;
        this.coinConversion = 0;

        if (rarity !== void 0){
            this.rarity = rarity;

            // If newPinWeight or coinConversion are not specified, set their values to the default values used for pins
            if (rarity < defaultNewWeight.length){
                this.newPinWeight = defaultNewWeight[rarity];
            } if (rarity < defaultConversions.length){
                this.coinConversion = defaultConversions[rarity];
            }
        } if (newPinWeight !== void 0){
            this.newPinWeight = newPinWeight;
        } if (coinConversion !== void 0){
            this.coinConversion = coinConversion;
        }
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        // This has the same logic as selecting a pin, except all pins selected are the same rarity. Some calculations
        // are no longer necessary since there is no need to randomly select a rarity.
        const userCollection = resources.brawlers;
        const pinsByRarity: [number, number][] = [];
        const duplicatePins: [number, number][] = [];
        
        let availablePins: [number, number][] = [];

        for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
            const brawler = allSkins[brawlerIndex];
            if (Object.hasOwn(userCollection, brawler.name) === true){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    const pinAmount = userCollection[brawler.name][brawler.pins[pinIndex].name];
                    if (this.rarity === brawler.pins[pinIndex].rarity.value){
                        if (pinAmount !== void 0 && pinAmount > 0){
                            duplicatePins.push([brawlerIndex, pinIndex]);
                        } else{
                            pinsByRarity.push([brawlerIndex, pinIndex]);
                        }
                    }
                }
            }
        }

        let isDuplicate = false;
        const newPinCount = pinsByRarity.length;
        const duplicatePinCount = duplicatePins.length;

        let duplicateProbability = 0;

        if (duplicatePinCount > 0 && this.newPinWeight > 0){
            duplicateProbability = (duplicatePinCount / (newPinCount * this.newPinWeight + duplicatePinCount));
        }
        
        if (Math.random() >= duplicateProbability && newPinCount > 0){
            availablePins = pinsByRarity;
        } else if (duplicatePinCount > 0){
            isDuplicate = true;
            availablePins = duplicatePins;
        }

        if (availablePins.length > 0){
            const selectedPin = availablePins[Math.floor(Math.random() * availablePins.length)];
            const brawlerObject = allSkins[selectedPin[0]];
            const pinObject = brawlerObject.pins[selectedPin[1]];

            const brawlerInCollection = userCollection[brawlerObject.name];
            if (brawlerInCollection !== void 0){
                if (Object.hasOwn(brawlerInCollection, pinObject.name) === false){
                    brawlerInCollection[pinObject.name] = 1;
                } else{
                    brawlerInCollection[pinObject.name] = brawlerInCollection[pinObject.name] + 1;
                }

                result.rewardType = "pin";
                result.image = PIN_IMAGE_DIR + brawlerObject.name + "/" + pinObject.image;
                result.backgroundColor = pinObject.rarity.color;
                result.description = `A Pin for ${brawlerObject.displayName}.`;
                result.inventory = brawlerInCollection[pinObject.name];

                if (isDuplicate === true){
                    result.displayName = "Duplicate Pin";
                    result.backgroundColor = getDuplicateColor(pinObject.rarity.color, 0.75);
                } else{
                    result.displayName = "New Pin";
                }
            }
        } else if (this.coinConversion > 0){
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
        }

        return result;
    }
}

export class WildCardPinReward extends Reward{
    rarityDist: number[];

    constructor(rarityDist?: number[]){
        super();

        this.rarityDist = copyDistribution([36, 15, 6, 3, 0], rarityDist);
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

        const selectedRarity = RNG(this.rarityDist);
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

export class BrawlerReward extends Reward{
    rarityDist: number[];
    minRarityDist: number[];
    coinConversion: number;

    constructor(rarityDist?: number[], minRarityDist?: number[], coinConversion?: number){
        super();

        this.rarityDist = copyDistribution([32, 16, 8, 4, 2, 1, 1], rarityDist);
        this.minRarityDist = copyDistribution([0, 0, 0, 1, 1, 0, 0], minRarityDist);
        this.coinConversion = 100;
        if (coinConversion !== void 0){
            this.coinConversion = coinConversion;
        }

        // Unlike pins, brawlers can only be collected once. If all brawlers of the selected rarity are collected,
        // give coins instead. The coins given do not depend on the rarity selected since only some rarities can be
        // selected once they are completed.
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        if (this.rarityDist.length !== this.minRarityDist.length){
            return result;
        }

        const userCollection = resources.brawlers;
        const modifiedRarityDist = [0, 0, 0, 0, 0, 0, 0];
        const brawlersByRarity: number[][] = [[], [], [], [], [], [], []];

        let availableBrawlers: number[] = [];

        for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
            const brawler = allSkins[brawlerIndex];

            if (Object.hasOwn(brawler, "name") === true && Object.hasOwn(brawler, "rarity") === true){
                const brawlerRarity = brawler.rarity.value;
                if (brawlerRarity < brawlersByRarity.length && Object.hasOwn(userCollection, brawler.name) === false){
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

        const selectedRarity = RNG(modifiedRarityDist);
        if (selectedRarity >= 0){
            availableBrawlers = brawlersByRarity[selectedRarity];
        }

        if (availableBrawlers.length > 0){
            const selectedIndex = availableBrawlers[Math.floor(Math.random() * availableBrawlers.length)];
            const brawlerObject = allSkins[selectedIndex];
            if (Object.hasOwn(userCollection, brawlerObject.name) === false){
                userCollection[brawlerObject.name] = {};
            }

            result.displayName = brawlerObject.displayName;
            result.rewardType = "brawler";
            result.image = PORTRAIT_IMAGE_DIR + brawlerObject.image;
            result.backgroundColor = brawlerObject.rarity.color;
            result.description = brawlerObject.description;
            result.inventory = 1;
        } else{
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
        }

        return result;
    }
}

export class TradeCreditsReward extends Reward{
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

        const selectedIndex = RNG(this.drops.map((value) => value.weight));
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

export class AvatarReward extends Reward{
    drops: NamedDistribution;
    coinConversion: number;

    constructor(drops?: NamedDistribution){
        super();

        this.drops = [];
        if (drops !== void 0){
            for (let x = 0; x < drops.length; x++){
                this.drops.push({value: drops[x].value, weight: drops[x].weight});
            }
        } else{
            this.drops = [
                {value: "brawlbox_icon", weight: 5},
                {value: "bush", weight: 4},
                {value: "viking_bull", weight: 3},
                {value: "angry_darryl", weight: 2},
                {value: "STOMPER", weight: 1}
            ];
        }

        this.coinConversion = 100;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        const available: NamedDistribution = [];
        for (let x = 0; x < this.drops.length; x++){
            if (resources.avatars.includes(this.drops[x].value) === false){
                available.push(this.drops[x]);
            }
        }
        
        if (available.length === 0){
            // If no avatar is available, give coins instead.
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
            return result;
        }

        const selectedIndex = RNG(available.map((value) => value.weight));
        if (selectedIndex >= 0){
            resources.avatars.push(available[selectedIndex].value);
            
            result.displayName = "New Avatar";
            result.rewardType = "avatar";
            result.image = AVATAR_SPECIAL_DIR + available[selectedIndex].value + IMAGE_FILE_EXTENSION;
            result.backgroundColor = "#f7831c";
            result.description = "Select this avatar in the account settings.";
            result.inventory = 1;
        }

        return result;
    }
}

export class ThemeReward extends Reward{
    drops: NamedDistribution;
    coinConversion: number;

    constructor(drops?: NamedDistribution){
        super();

        this.drops = [];
        if (drops !== void 0){
            for (let x = 0; x < drops.length; x++){
                this.drops.push({value: drops[x].value, weight: drops[x].weight});
            }
        } else{
            this.drops = [
                {value: "retro", weight: 1},
                {value: "mecha", weight: 1},
                {value: "pirate", weight: 1},
                {value: "lny_20", weight: 1},
                {value: "psg", weight: 1},
                {value: "taras_bazaar", weight: 1},
                {value: "super_city", weight: 1},
                {value: "giftshop", weight: 1},
                {value: "lunar", weight: 1},
                {value: "waterpark", weight: 1}
            ];
        }

        this.coinConversion = 500;
    }

    getReward(resources: UserResources): BrawlBoxDrop{
        const result = this.createDropResult();

        const available: NamedDistribution = [];
        for (let x = 0; x < this.drops.length; x++){
            if (resources.themes.includes(this.drops[x].value) === false){
                available.push(this.drops[x]);
            }
        }
        
        if (available.length === 0){
            resources.coins += this.coinConversion;
            result.rewardType = "coins";
            result.amount = this.coinConversion;
            return result;
        }

        const selectedIndex = RNG(available.map((value) => value.weight));
        if (selectedIndex >= 0){
            if (themeMap.has(available[selectedIndex].value) === false){
                return result;
            }

            resources.themes.push(available[selectedIndex].value);
            
            result.displayName = "New Theme";
            result.rewardType = "theme";
            result.image = THEME_SPECIAL_DIR + available[selectedIndex].value + "_preview" + IMAGE_FILE_EXTENSION;
            result.backgroundColor = "#f7831c";
            result.description = "Select this theme in the gallery.";
            result.inventory = 1;
        }

        return result;
    }
}

// Initialize data that will not change but requires searching through the allSkins array to obtain.

// Stores (number of pins in each rarity / total pins). Used when selecting pins.
const pinCounts = [0, 0, 0, 0, 0];
let totalPins = 0;

// Maps a rarity value to its color and name. Used when selecting wild card pins.
export const rarityNames = new Map<number, Omit<Pin["rarity"], "value">>();

for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
    const brawler = allSkins[brawlerIndex];

    if (Object.hasOwn(brawler, "name") === true && Object.hasOwn(brawler, "pins") === true){
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
