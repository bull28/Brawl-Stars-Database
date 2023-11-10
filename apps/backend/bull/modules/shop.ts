import allSkins from "../data/brawlers_data.json";
import {themeMap, sceneMap, AVATAR_SPECIAL_DIR, IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, RESOURCE_IMAGE_DIR, THEME_SPECIAL_DIR, SCENE_IMAGE_DIR} from "../data/constants";
import brawlBox from "./brawlbox";
import {getCollectionScore} from "./pins";
import shopItemsObject from "../data/coinsshop_data.json";
import {BrawlBoxDrop, UserResources, ShopItemData, CollectionData, AchievementItems, DatabaseBrawlers} from "../types";

interface ShopItemPreview{
    name: string;
    displayName: string;
    cost: number;
    image: string;
    amount: number;
    description: string;
}

class ShopItem{
    display: {
        name: string;
        image: string;
        description: string;
    };
    cost: number;
    itemType: string;
    amount: number;

    constructor(data: ShopItemData){
        this.cost = data.cost;
        this.amount = data.amount;
        this.display = {
            name: data.displayName,
            image: data.image,
            description: data.description
        };
        this.itemType = data.itemType;
    }

    getDisplay(name: string): ShopItemPreview{
        let image = "";
        if (this.display.image !== ""){
            image = RESOURCE_IMAGE_DIR + this.display.image + IMAGE_FILE_EXTENSION;
        }

        return {
            name: name,
            displayName: this.display.name,
            cost: this.cost,
            image: image,
            amount: this.amount,
            description: this.display.description
        };
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return false;
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        return [0, []];
    }
}

class TradeCreditsItem extends ShopItem{
    constructor(data: ShopItemData){
        super(data);
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return true;
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        resources.trade_credits += this.amount;
        return [resources.trade_credits, []];
    }
}

class BrawlerItem extends ShopItem{
    constructor(data: ShopItemData){
        super(data);
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return collection.unlockedBrawlers < collection.totalBrawlers;
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        return [1, brawlBox("newBrawler", resources)];
    }
}

class CosmeticItem extends ShopItem{
    cosmeticName: string;
    achievement: boolean;

    constructor(data: ShopItemData){
        super(data);

        this.cosmeticName = data.extraData;

        this.achievement = false;
        if (data.itemType.includes("achievement") === true){
            this.achievement = true;
        }
    }

    getImagePath(): [string, string]{
        return [this.display.name, this.display.image];
    }

    getDisplay(name: string): ShopItemPreview{
        const display = this.getImagePath();

        return {
            name: name,
            displayName: display[0],
            cost: this.cost,
            image: display[1],
            amount: this.amount,
            description: this.display.description
        };
    }
}

class AvatarItem extends CosmeticItem{
    constructor(data: ShopItemData){
        super(data);
    }

    getImagePath(): [string, string]{
        return [this.display.name, AVATAR_SPECIAL_DIR + this.cosmeticName + IMAGE_FILE_EXTENSION];
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return (!resources.avatars.includes(this.cosmeticName)) && (achievements.avatars.has(this.cosmeticName) || !this.achievement);
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        resources.avatars.push(this.cosmeticName);
        return [1, []];
    }
}

class ThemeItem extends CosmeticItem{
    constructor(data: ShopItemData){
        super(data);
    }

    getImagePath(): [string, string]{
        const themeName = this.cosmeticName;
        if (themeMap.has(themeName) === false){
            return [this.display.name, ""];
        }
        return [themeMap.get(themeName)!, THEME_SPECIAL_DIR + themeName + "_preview" + IMAGE_FILE_EXTENSION];
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return (!resources.themes.includes(this.cosmeticName)) && (achievements.themes.has(this.cosmeticName) || !this.achievement);
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        resources.themes.push(this.cosmeticName);
        return [1, []];
    }
}

class SceneItem extends CosmeticItem{
    constructor(data: ShopItemData){
        super(data);
    }

    getImagePath(): [string, string]{
        const sceneName = this.cosmeticName;
        if (sceneMap.has(sceneName) === false){
            return [this.display.name, ""];
        }
        return [sceneMap.get(sceneName)!, SCENE_IMAGE_DIR + sceneName + "_preview" + IMAGE_FILE_EXTENSION];
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return (!resources.scenes.includes(this.cosmeticName)) && (achievements.scenes.has(this.cosmeticName) || !this.achievement);
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        resources.scenes.push(this.cosmeticName);
        return [1, []];
    }
}

class FeaturedItem extends ShopItem{
    available: boolean;
    pin: string;

    constructor(data: ShopItemData){
        super(data);

        this.available = false;
        this.pin = "";
    }

    updateData(featuredPin: string, userBrawlers: DatabaseBrawlers): void{
        if (featuredPin === ""){
            this.display.name = "No Featured Item";
            this.display.image = "";
            this.available = false;
            return;
        }
        if (featuredPin.includes("/") === false){
            return;
        }

        const pinName = featuredPin.split("/");
        try{
            // The featured pin is valid only if the user has the brawler unlocked
            if (userBrawlers.hasOwnProperty(pinName[0]) === true){
                for (let brawler in allSkins){
                    if (allSkins[brawler].name === pinName[0]){
                        const brawlerPins = allSkins[brawler].pins;
                        for (let pin in brawlerPins){
                            if (brawlerPins[pin].name === pinName[1]){
                                this.display.name = `Featured ${brawlerPins[pin].rarity.name} Pin`;
                                this.display.image = allSkins[brawler].name + "/" + brawlerPins[pin].image;
                                this.display.description = "This pin is a featured item for today. It can be bought only once but a new item will be available tomorrow."

                                this.pin = featuredPin;

                                if (brawlerPins[pin].rarity.value < featuredCosts.length){
                                    this.cost = featuredCosts[brawlerPins[pin].rarity.value];
                                } else{
                                    // This is a "fallback" amount in case the brawl box drop chances file is not correctly formatted
                                    this.cost = 5000;
                                }

                                this.available = true;
                            }
                        }
                    }
                }
            }
        } catch(error){
            // If allSkins is missing properties then this happens
            this.display.name = "No Featured Item";
            this.display.image = "";
            this.available = false;
        }
    }

    getDisplay(name: string): ShopItemPreview{
        return {
            name: name,
            displayName: this.display.name,
            cost: this.cost,
            image: PIN_IMAGE_DIR + this.display.image,
            amount: this.amount,
            description: this.display.description
        };
    }

    isAvailable(resources: UserResources, collection: CollectionData, achievements: AchievementItems): boolean{
        return this.available;
    }

    buyItem(resources: UserResources): [number, BrawlBoxDrop[]]{
        const pinName = this.pin.split("/");
        // Index 0 is the brawler, index 1 is the pin

        if (resources.brawlers.hasOwnProperty(pinName[0]) === true){
            const brawler = resources.brawlers[pinName[0]];
            if (brawler.hasOwnProperty(pinName[1]) === true){
                // User already has the pin
                brawler[pinName[1]] = brawler[pinName[1]] + this.amount;
            } else{
                // User does not have the pin yet
                brawler[pinName[1]] = this.amount;
            }
            // This is not undefined because both cases of pin exists in brawler map were already checked and if the key
            // was not there then it was added.

            // The featured item can only be bought once per day.
            // If the shop route receives > 0 as the amount, it sets featured_item in the database to ""
            return [brawler[pinName[1]], []];
        }
        return [0, []];
    }
}

const featuredCosts = [160, 320, 800, 1600, 4800];

const shopItems = new Map<string, ShopItem>();

// If this is defined, there is a featured item in the shop data file.
let featuredItemData: ShopItemData | undefined;

// When the user wants to buy an item, the shop route needs a copy of a featured item since that item is different for
// all users. When the user only wants to view items, the same featured item object can be reused since the only data
// going to the shop route is the result of getDisplay (which is a new object).
let tempFeaturedItem = new FeaturedItem({
    "displayName": "Featured Item",
    "cost": 5000,
    "itemType": "featured",
    "image": "",
    "extraData": "",
    "amount": 1,
    "description": ""
});

const shopData = Object.entries(shopItemsObject);
for (let x = 0; x < shopData.length; x++){
    const type = shopData[x][1].itemType;

    if (type === "tradeCredits"){
        shopItems.set(shopData[x][0], new TradeCreditsItem(shopData[x][1]));
    } else if (type === "brawler"){
        shopItems.set(shopData[x][0], new BrawlerItem(shopData[x][1]));
    } else if (type === "avatar" || type === "achievementAvatar"){
        shopItems.set(shopData[x][0], new AvatarItem(shopData[x][1]));
    } else if (type === "theme" || type === "achievementTheme"){
        shopItems.set(shopData[x][0], new ThemeItem(shopData[x][1]));
    } else if (type === "scene" || type === "achievementScene"){
        shopItems.set(shopData[x][0], new SceneItem(shopData[x][1]));
    } else if (type === "featured"){
        featuredItemData = shopData[x][1];
    }
}

/**
 * Gets all the items that are currently available in the shop for the given user. All objects in the map returned are
 * references to the original objects.
 * @param resources object containing all the user's resources
 * @param collection formatted collection object
 * @param achievements extra items the user can buy based on their progress
 * @param featuredPin user's current featured pin, in "brawler/pin" format
 * @returns map from item names to item objects
 */
export function getAllItems(resources: UserResources, collection: CollectionData, achievements: AchievementItems, featuredPin: string): Map<string, ShopItem>{
    let items = new Map<string, ShopItem>();

    if (featuredItemData !== void 0){
        const featured = new FeaturedItem(featuredItemData);
        featured.updateData(featuredPin, resources.brawlers);
        if (featured.isAvailable(resources, collection, achievements) === true){
            items.set("featuredItem", featured);
        }
    }

    shopItems.forEach((value, key) => {
        if (value.isAvailable(resources, collection, achievements) === true){
            items.set(key, value);
        }
    });
    return items;
}

/**
 * Gets preview objects for all the items that are currently available in the shop for the given user. All objects
 * returned are new objects.
 * @param resources object containing all the user's resources
 * @param collection formatted collection object
 * @param achievements extra items the user can buy based on their progress
 * @param featuredPin user's current featured pin, in "brawler/pin" format
 * @returns array of preview objects
 */
export function getAllItemsPreview(resources: UserResources, collection: CollectionData, achievements: AchievementItems, featuredPin: string): ShopItemPreview[]{
    let items: ShopItemPreview[] = [];

    if (featuredItemData !== void 0){
        tempFeaturedItem.updateData(featuredPin, resources.brawlers);
        if (tempFeaturedItem.isAvailable(resources, collection, achievements) === true){
            items.push(tempFeaturedItem.getDisplay("featuredItem"));
        }
    }

    shopItems.forEach((value, key) => {
        if (value.isAvailable(resources, collection, achievements) === true){
            items.push(value.getDisplay(key));
        }
    });
    return items;
}

/**
 * Randomly selects a pin to be a featured offer from a user's collection. If they are missing copies of some pins, the
 * user will be guaranteed to get an offer for a new pin. Otherwise, they will get an offer for a duplicate. If the user
 * has no brawlers unlocked, they cannot receive an offer and this function will return an empty string.
 * @param userBrawlers parsed brawlers object from the database
 * @returns string in "brawler/pin" format
 */
export function refreshFeaturedItem(userBrawlers: DatabaseBrawlers): string{
    let newPins: string[] = [];
    let duplicatePins: string[] = [];

    // A call to formatCollectionData costs more time than looping through the array
    // here and only storing data required to select a featured pin.
    
    for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];
        
        if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("pins") === true){
            // Only offer pins from brawlers the user owns
            if (userBrawlers.hasOwnProperty(brawler.name) === true){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    //const pinRarity = brawler.pins[pinIndex].rarity.value;
                    const pinAmount = userBrawlers[brawler.name][brawler.pins[pinIndex].name];
                    if (pinAmount !== void 0 && pinAmount > 0){
                        duplicatePins.push(brawler.name + "/" + brawler.pins[pinIndex].name);
                    } else{
                        newPins.push(brawler.name + "/" + brawler.pins[pinIndex].name);
                    }
                }
            }
        }
    }
    
    let selectedPin = "";

    // If the user can receive new pins, select one to offer
    // If they user does not have any new pins available to collect, select one that is a duplicate
    // If the user cannot collect any pins (no brawlers unlocked), offer nothing
    if (newPins.length > 0){
        selectedPin = newPins[Math.floor(Math.random() * newPins.length)];
    } else if (duplicatePins.length > 0){
        selectedPin = duplicatePins[Math.floor(Math.random() * duplicatePins.length)];
    }

    return selectedPin;
}

/**
 * Some items are only available in the shop only if the user has progressed far enough. This function returns the items
 * which the user is able to purchase from the shop, given their current progress.
 * @param resources object containing all the user's resources
 * @param collection formatted collection object
 * @param accessoryLevel user's accessory level
 * @returns object with avatar, theme, and scene extraData strings
 */
export function getAchievementItems(resources: UserResources, collection: CollectionData, accessoryLevel: number): AchievementItems{
    let avatars = new Set<string>();

    const score = getCollectionScore(collection);

    // Order of unlocking tiered avatars ("hardest" challenge sprays !!!)
    const tierOrder = [
        "collection_01", "collection_02", "collection_03", "collection_04",
        "collection_05", "collection_06", "collection_07", "collection_08"
    ];
    
    // This will contain the index of the highest tiered avatar the user currently has
    let tier = -1;

    for (let x in resources.avatars){
        if (resources.avatars[x].includes("collection") === true){
            tier = Math.max(tier, tierOrder.indexOf(resources.avatars[x]));            
        }
    }    

    // The user can buy the next tiered avatar if and only if they meet the
    // collection score requirement. Only one tiered avatar is offered at a time.
    if (tier === -1){
        if (score >=   60) { avatars.add(tierOrder[0]); }// Requires C
    } else if (tier === 0){
        if (score >=  120) { avatars.add(tierOrder[1]); }// Requires B-
    } else if (tier === 1){
        if (score >=  270) { avatars.add(tierOrder[2]); }// Requires B+
    } else if (tier === 2){
        if (score >=  480) { avatars.add(tierOrder[3]); }// Requires A
    } else if (tier === 3){
        if (score >=  640) { avatars.add(tierOrder[4]); }// Requires A+
    } else if (tier === 4){
        if (score >=  800) { avatars.add(tierOrder[5]); }// Requires S-
    } else if (tier === 5){
        if (score >= 1000) { avatars.add(tierOrder[6]); }// Requires S
    } else if (tier === 6){
        if (score >= 1200) { avatars.add(tierOrder[7]); }// Requires S+
    }
    // tier === 7 means all avatars unlocked

    // Gem Grab avatar is available in the shop with no requirement

    // Brawl Ball avatar is available when the user has at least 12 special avatars unlocked
    if (resources.avatars.length >= 12){
        avatars.add("gamemode_brawlball");
    }
    // Heist avatar is available when the user has at least 12 special themes unlocked
    if (resources.themes.length >= 12){
        avatars.add("gamemode_heist");
    }
    // Bounty avatar is available when the user has at least 2000 pin copies
    if (collection.pinCopies >= 2000){
        avatars.add("gamemode_bounty");
    }


    let themes = new Set<string>();

    // Legendary set scene is available when the user has at least half of the brawlers completed
    if (collection.completedBrawlers / Math.max(1, collection.totalBrawlers) >= 0.5){
        themes.add("legendaryset");
    }


    let scenes = new Set<string>();

    // Stunt Show scene is available when the user has at least half of the brawlers unlocked
    if (collection.unlockedBrawlers / Math.max(1, collection.totalBrawlers) >= 0.5){
        scenes.add("stunt_show");
    }
    // Retropolis scene is available when the user has all of the brawlers unlocked
    if (collection.unlockedBrawlers / Math.max(1, collection.totalBrawlers) >= 1){
        scenes.add("retropolis");
    }


    // All of the following items require a certain accessory level to unlock
    if (accessoryLevel >= 12){
        themes.add("starrforce");
    } if (accessoryLevel >= 15){
        themes.add("deepsea");
    } if (accessoryLevel >= 18){
        scenes.add("giftshop");
    } if (accessoryLevel >= 21){
        themes.add("darkmas");
    } if (accessoryLevel >= 24){
        themes.add("mandy");
    } if (accessoryLevel >= 27){
        scenes.add("arcade");
    } if (accessoryLevel >= 30){
        avatars.add("space");
        themes.add("yellow_face");
    }

    return {avatars: avatars, themes: themes, scenes: scenes};
}
