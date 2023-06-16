import allSkins from "../data/brawlers_data.json";
import {themeMap, sceneMap, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, AVATAR_IMAGE_DIR, THEME_IMAGE_DIR, SCENE_IMAGE_DIR} from "../data/constants";
import {requiredLevels, getAccessoryDisplay, getAllAccessories} from "./accessories";
import {
    CollectionData, 
    CollectionBrawler, 
    CollectionPin, 
    DatabaseBrawlers, 
    AvatarList, 
    ThemeList, 
    SceneList, 
    DatabaseAvatars, 
    DatabaseThemes, 
    DatabaseScenes, 
    ThemeData, 
    ThemeScenePreview, 
    DatabaseCosmetics, 
    ShopList, 
    ShopItem, 
    AchievementItems, 
    DatabaseAccessories
} from "../types";

/**
 * Reads a user's brawler and pin collection from the database and organizes it
 * in an array with useful properties for displaying the collection on-screen.
 * Also analyzes the collection and gives a score based on how close it is to
 * completion. All image files have their appropriate file paths added.
 * @param userCollection parsed brawlers object from the database
 * @returns collection summary object
 */
export function formatCollectionData(userCollection: DatabaseBrawlers, userAccessories: DatabaseAccessories, accessoryLevel: number): CollectionData{
    let collection: CollectionData = {
        unlockedBrawlers: 0,
        completedBrawlers: 0,
        totalBrawlers: 0,
        unlockedPins: 0,
        totalPins: 0,
        pinCopies: 0,
        unlockedAccessories: 0,
        totalAccessories: 0,
        collectionScore: "",
        scoreProgress: 0,
        avatarColor: "#000000",
        pinRarityColors: [],
        brawlers: [],
        accessories: []
    };

    const rarityColors = new Map<number, string>();

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "image", "rarity", "pins"];

    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];

        let unlockedPins = 0;
        let totalPins = 0;
        let pinCopies = 0;

        // Check that all desired properties exist all at once
        // so they do not have to be checked individually as
        // they are used
        let missingProperties = false;
        for (let j of includeFromBrawler){
            if (brawler.hasOwnProperty(j) === false){
                missingProperties = true;
            }
        }

        // This determines whether to check for unlocked pins
        // If a brawler is not unlocked, none of their pins can
        // be unlocked either.
        let hasBrawler = false;
        if (missingProperties === false){
            hasBrawler = userCollection.hasOwnProperty(brawler.name);
            if (hasBrawler === true){
                collection.unlockedBrawlers++;
            }
            collection.totalBrawlers++;
    
            let brawlerPins: CollectionPin[] = [];

            let pinData: DatabaseBrawlers[string] | undefined = undefined;
            if (hasBrawler === true){
                pinData = userCollection[brawler.name];
            }
    
            for (let y = 0; y < brawler.pins.length; y++){
                const pin = brawler.pins[y];

                let thisPin: CollectionPin = {
                    i: pin.image,
                    r: pin.rarity.value,
                    a: 0
                };

                if (rarityColors.has(pin.rarity.value) === false){
                    rarityColors.set(pin.rarity.value, pin.rarity.color);
                }

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (typeof pinData !== "undefined"){
                    const pinCount = pinData[pin.name];
                    if (typeof pinCount !== "undefined"){
                        if (pinCount > 0){
                            
                            unlockedPins++;
                            collection.unlockedPins++;
                        }
                        pinCopies += pinCount;
                        collection.pinCopies += pinCount;
                        thisPin.a = pinCount;
                    }
                }

                totalPins++;
                collection.totalPins++;

                brawlerPins.push(thisPin);
            }

            let thisBrawler: CollectionBrawler = {
                name: brawler.name,
                displayName: brawler.displayName,
                rarityColor: "#000000",
                i: PORTRAIT_IMAGE_DIR + brawler.image,
                u: hasBrawler,
                unlockedPins: unlockedPins,
                totalPins: totalPins,
                pinCopies: pinCopies,
                pinFilePath: PIN_IMAGE_DIR + brawler.name + "/",
                pins: brawlerPins
            };

            if (brawler.rarity.hasOwnProperty("color") === true){
                thisBrawler.rarityColor = brawler.rarity.color;
            }

            if (unlockedPins === totalPins){
                collection.completedBrawlers++;
            }

            collection.brawlers.push(thisBrawler);
        }
    }

    rarityColors.forEach((value) => {
        collection.pinRarityColors.push(value);
    });

    const accessories = getAllAccessories(userAccessories, accessoryLevel);
    for (let x = 0; x < accessories.length; x++){
        if (accessories[x].unlocked === true){
            collection.unlockedAccessories++;
        }
        collection.totalAccessories++;
    }
    collection.accessories = accessories;

    getCollectionScore(collection);

    return collection;
}

/**
 * Returns a complete list of all avatars a user is able to select.
 * All free avatars are included and the user's special avatars collected
 * are compared with the list of all special avatars to determine which
 * special avatars they can select. Their collection is also used to
 * determine which portrait avatars are available. This function returns
 * avatars with their file extension. The array userAvatars does not
 * contain file paths.
 * @param allAvatars object containing all free and special avatars
 * @param userCollection parsed brawlers object from the database
 * @param userAvatars parsed array of avatars from the database
 * @returns array of all avatar image names
 */
export function getAvatars(allAvatars: AvatarList, userCollection: DatabaseBrawlers, userAvatars: DatabaseAvatars): DatabaseAvatars{
    let avatars: DatabaseAvatars = [];
    let unlockedBrawlers: string[] = [];

    if (typeof allAvatars.free === "undefined" || typeof allAvatars.special === "undefined"){
        return avatars;
    }

    // All free avatars are available, regardless of user
    for (let x = 0; x < allAvatars.free.length; x++){
        avatars.push(AVATAR_IMAGE_DIR + allAvatars.free[x]);
    }

    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];
        if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("image") === true){
            // If the user has the brawler unlocked, add the avatar as an option
            if (userCollection.hasOwnProperty(brawler.name) === true){
                unlockedBrawlers.push(brawler.image.split(".")[0]);
            }
        }
    }

    for (let x = 0; x < allAvatars.special.length; x++){
        const avatar = allAvatars.special[x];

        // If a special avatar is unlocked, add it to the array.

        // The entire path of avatars is no longer stored in the
        // database, only the file name
        const filePaths = avatar.split("/");
        const avatarName = filePaths[filePaths.length - 1].split(".")[0];
        if (typeof avatarName !== "undefined" && userAvatars.includes(avatarName) === true){
            avatars.push(AVATAR_IMAGE_DIR + avatar);
        }

        // If a special avatar is not unlocked, the only other way that
        // it can be used is if it is a brawler portrait and if the brawler
        // is unlocked, the portrait is made available.
        // In order for this to happen, the file names must be the same.
        else if (unlockedBrawlers.includes(avatarName) === true){
            avatars.push(AVATAR_IMAGE_DIR + avatar);
        }
    }

    return avatars;
}

/**
 * Returns a complete list of all themes a user is able to select.
 * All free themes are available to anyone. Special themes are only
 * obtainable from the shop. This function takes the name of a theme
 * bundle and classifies each image as either background, icon, or
 * any other type of item that may be contained in a bundle.
 * @param allThemes object containing all free and special themes
 * @param allScenes array containing all scenes
 * @param userThemes parsed array of themes from the database
 * @param userScenes parsed array of scenes from the database
 * @returns themes, gropued by type
 */
export function getThemes(allThemes: ThemeList, allScenes: SceneList, userThemes: DatabaseThemes, userScenes: DatabaseScenes): ThemeData{
    let themes: {[k: string]: Map<string, string>;} = {};
    let scenes: {[k: string]: ThemeScenePreview} = {};

    if (typeof allThemes.free === "undefined" && typeof allThemes.special === "undefined"){
        return {
            background: [],
            icon: [],
            music: [],
            scene: []
        };
    }

    for (let t in allThemes){
        for (let theme of allThemes[t as keyof ThemeList]){
            let themeType = "";
            if (theme.includes("_icon") === true){
                themeType = "icon";
            } else if (theme.includes("_background") === true){
                themeType = "background";
            } else if (theme.includes("_selectpreview") === true){
                themeType = "selectpreview";
            } else if (theme.includes("_music") === true){
                themeType = "music";
            }
            // Add more types if they become available
    
            if (themeType !== ""){
                // Check if the theme map contains the current theme name and if it
                // does, add it to the themes, grouped by name
                const filePaths = theme.split("/");
                const themeName = filePaths[filePaths.length - 1].split("_" + themeType)[0];
                if (themeMap.has(themeName) === true){
                    if (themes.hasOwnProperty(themeName) === false){
                        themes[themeName] = new Map<string, string>();
                    }
    
                    if (t === "free"){
                        themes[themeName].set(themeType, THEME_IMAGE_DIR + theme);
                    } else if (t === "special"){
                        if (userThemes.includes(themeName) === true){
                            themes[themeName].set(themeType, THEME_IMAGE_DIR + theme);
                        }
                    }
                }
            }
        }
    }

    // Get the list of scenes the user can select

    // Load all the scene names from the map first
    sceneMap.forEach((value, key) => {
        if (userScenes.includes(key) === true || key === "default"){
            scenes[key] = {
                displayName: value,
                path: "",
                preview: "",
                background: ""
            };
        }
    });

    // Go through all the files in the scenes directory and set the
    // correct attribute of each scene object depending on whether
    // the file is a scene model, preview, or background
    for (let scene of allScenes){
        let sceneType = "";
        if (scene.includes("_scene") === true){
            sceneType = "path";
        } else if (scene.includes("_preview") === true){
            sceneType = "preview";
        } else if (scene.includes("_background") === true){
            sceneType = "background";
        }

        if (sceneType !== ""){
            const filePaths = scene.split("/");
            let sceneName = "";
            if (sceneType === "path"){
                // The model file names end in _scene instead of _path
                sceneName = filePaths[filePaths.length - 1].split("_scene")[0];
            } else{
                sceneName = filePaths[filePaths.length - 1].split("_" + sceneType)[0];
            }
            if (sceneName in scenes){
                // Model path is already contained in the scene map
                const sceneObject = scenes[sceneName];
                if (sceneObject.hasOwnProperty(sceneType) === true){
                    sceneObject[sceneType as keyof typeof sceneObject] = SCENE_IMAGE_DIR + scene;
                }
            }
        }
    }

    // The data is required to be grouped by file type instead of theme name
    let themesResult: ThemeData = {
        "background": [],
        "icon": [],
        "music": [],
        "scene": []
    };

    for (let key in themes){
        const value = themes[key];
        const themeName = themeMap.get(key);
        if (typeof themeName !== "undefined"){

            const backgroundPath = value.get("background");
            const iconPath = value.get("icon");
            const iconPreview = value.get("selectpreview");
            const musicPath = value.get("music");

            if (typeof backgroundPath !== "undefined" &&
            typeof iconPath !== "undefined" &&
            typeof iconPreview !== "undefined" &&
            typeof musicPath !== "undefined"){
                themesResult.background.push({
                    displayName: themeName,
                    path: backgroundPath
                });
                // Special case for icon and selectpreview: they need to be grouped together
                themesResult.icon.push({
                    displayName: themeName,
                    path: iconPath,
                    preview: iconPreview
                });
                themesResult.music.push({
                    displayName: themeName,
                    path: musicPath
                });
            }
        }
    }
    for (let key in scenes){
        // All scene objects have the same type so they can be added directly
        themesResult.scene.push(scenes[key]);
    }

    return themesResult;
}

/**
 * Searches the list of themes and scenes to match cosmetic names from
 * the database to the actual cosmetics. If cosmeticsData is not provided
 * or is empty, the default cosmetics will be returned.
 * @param allThemes object containing all free and special themes
 * @param allScenes array containing all scenes
 * @param cosmeticsData cosmetics result object from the database
 * @returns object containing file names of the cosmetics
 */
export function getCosmetics(allThemes: ThemeList, allScenes: SceneList, cosmeticsData: DatabaseCosmetics): DatabaseCosmetics{
    let setCosmetics: DatabaseCosmetics = {
        background: "",
        icon: "",
        music: "",
        scene: ""
    };

    // First, get the list of all default cosmetics
    const defaultThemes = allThemes.free.filter((value) => value.includes("default_"));

    // Initialize the object sent to the user with the default cosmetics
    for (let x of defaultThemes){
        if (x.includes("_background") === true){
            setCosmetics.background = THEME_IMAGE_DIR + x;
        } else if (x.includes("_icon") === true){
            setCosmetics.icon = THEME_IMAGE_DIR + x;
        } else if (x.includes("_music") === true){
            setCosmetics.music = THEME_IMAGE_DIR + x;
        }
    }

    // For all of the cosmetics returned from the database that are not empty string,
    // update the object with that cosmetic's name
    for (let x in cosmeticsData){
        let k = x as keyof DatabaseCosmetics;
        if (cosmeticsData[k] !== ""){
            if (x === "background" || x === "icon" || x === "music"){
                // Since the file extension might is not always the same, use the file name
                // from the allThemes/allScenes arrays

                // cosmeticsData[k] stores only whether the cosmetic is free/special
                // and its name. Both of those are contained in allThemes or allScenes.
                let result: string | undefined = undefined;
                if (cosmeticsData[k].includes("free/") === true){
                    result = allThemes.free.find((value) => value.includes(cosmeticsData[k]));
                } else{
                    result = allThemes.special.find((value) => value.includes(cosmeticsData[k]));
                }

                if (typeof result !== "undefined"){
                    setCosmetics[x] = THEME_IMAGE_DIR + result;
                }
            } else if (x === "scene"){
                const result = allScenes.find((value) => value.includes(cosmeticsData[k]));
                if (typeof result !== "undefined"){
                    setCosmetics[x] = SCENE_IMAGE_DIR + result;
                }
            }
        }
    }

    return setCosmetics;
}

function copyShopItem(item: ShopItem): ShopItem{
    return {
        displayName: item.displayName,
        cost: item.cost,
        itemType: item.itemType,
        image: item.image,
        extraData: item.extraData,
        amount: item.amount,
        description: item.description
    };
}

/**
 * Determines which items a user is able to buy from the shop, given their
 * collection progress and unlocked avatars. Avatars are a one-time purchase
 * and brawler-type items are only available if the user does not have all
 * brawlers unlocked. Also checks whether the user is able to buy their
 * featured item, and formats the shop item object with the item's display
 * name, description, image, and extra data. If the featured item is invalid,
 * it will return the default featured item object which cannot be bought.
 * The shopItems object will be modified with the featured item.
 * @param shopItems object with all shop items, represented as a map
 * @param resources object containing parsed brawlers, avatars, themes, scenes, and accessories from the database
 * @param accessoryLevel user's accessory level
 * @param featuredItem current featured item string
 * @param featuredCosts array of costs for different rarities of pins
 * @returns items the user can buy, represented as a map
 */
export function getShopItems(shopItems: ShopList, resources: {
    brawlers: DatabaseBrawlers, avatars: DatabaseAvatars, themes: DatabaseThemes, scenes: DatabaseScenes, accessories: DatabaseAccessories
}, accessoryLevel: number, featuredItem: string, featuredCosts: number[]): ShopList{
    let availableShopItems: ShopList = new Map<string, ShopItem>();

    // Collection items are grouped together in resources
    const userCollection = resources.brawlers;
    const userAvatars = resources.avatars;
    const userThemes = resources.themes;
    const userScenes = resources.scenes;
    const userAccessories = resources.accessories;

    const collection = formatCollectionData(userCollection, userAccessories, accessoryLevel);
    const achievements = getAchievementItems(userAvatars, userThemes, collection, accessoryLevel);

    shopItems.forEach((value, key) => {
        // Depending on the type of item, check availability differently
        if (value.itemType === "tradeCredits"){
            // Trade credits are always available
            availableShopItems.set(key, value);
        } else if (value.itemType === "brawler"){
            // As long as the user has one or more brawlers left to unlock, allow them to buy a brawler
            if (collection.unlockedBrawlers < collection.totalBrawlers){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "accessory"){
            const accessory = getAccessoryDisplay(value.extraData);
            const requiredLevel = requiredLevels.get(value.extraData);

            if (typeof accessory !== "undefined" && typeof requiredLevel !== "undefined"){
                // An accessory is available if the user meets the level requirement and does not already own it
                if (accessoryLevel >= requiredLevel && userAccessories.includes(value.extraData) === false){
                    let shopItemCopy = copyShopItem(value);

                    shopItemCopy.displayName = accessory.displayName;
                    shopItemCopy.image = accessory.image;
                    
                    availableShopItems.set(key, shopItemCopy);
                }
            }
        } else if (value.itemType === "avatar"){
            // If the user does not already own an avatar, it is available for them to buy
            if (userAvatars.includes(value.extraData) === false){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "achievementAvatar"){
            if (userAvatars.includes(value.extraData) === false && achievements.avatars.has(value.extraData) === true){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "theme"){
            // Themes are handled the same way as avatars. The only difference is that one theme string
            // corresponds to a bundle of actual items (background, icon, and possibly more???)
            if (userThemes.includes(value.extraData) === false){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "achievementTheme"){
            if (userThemes.includes(value.extraData) === false && achievements.themes.has(value.extraData) === true){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "scene"){
            // Scenes are handled the same way as avatars. Unlike avatars, there are no free scenes.
            if (userScenes.includes(value.extraData) === false){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "achievementScene"){
            if (userScenes.includes(value.extraData) === false && achievements.scenes.has(value.extraData) === true){
                availableShopItems.set(key, value);
            }
        } else if (value.itemType === "featured"){
            let shopItemCopy = copyShopItem(value);
            
            if (featuredItem.includes("/") === true){
                const pinName = featuredItem.split("/");
                // The featured pin is valid only if the user has the brawler unlocked
                // but they do not have to have the pin unlocked
                try{
                    if (userCollection.hasOwnProperty(pinName[0]) === true){
                        for (let brawler in allSkins){
                            if (allSkins[brawler].name === pinName[0]){
                                const brawlerPins = allSkins[brawler].pins;
                                for (let pin in brawlerPins){
                                    if (brawlerPins[pin].name === pinName[1]){
                                        shopItemCopy.itemType = "featuredPin";// May allow different types of featured items in the future
                                        shopItemCopy.displayName = "Featured " + brawlerPins[pin].rarity.name + " Pin";
                                        shopItemCopy.extraData = featuredItem;
                                        shopItemCopy.image = allSkins[brawler].name + "/" + brawlerPins[pin].image;
                                        shopItemCopy.description = "This pin is a featured item for today. It can be bought only once but a new item will be available tomorrow."

                                        if (brawlerPins[pin].rarity.value < featuredCosts.length){
                                            shopItemCopy.cost = featuredCosts[brawlerPins[pin].rarity.value];
                                        } else{
                                            // This is a "fallback" amount in case the brawl box drop chances file is not correctly formatted
                                            shopItemCopy.cost = 5000;
                                        }

                                        availableShopItems.set(key, shopItemCopy);
                                    }
                                }
                            }
                        }
                    }
                } catch(error){
                    // If allSkins is missing properties then this happens
                    shopItemCopy.displayName = "No Featured Item";
                    shopItemCopy.image = "";
                }
            }

            // The shop item needs to be modified with the featured item
            // because by default featured item has no name and default everything.
            // If a featured item is available then its data has to be added because
            // the buy item endpoint can't figure out which pin is featured without it.
            shopItems.set(key, shopItemCopy);
        }
    });

    return availableShopItems;
}

/**
 * Randomly selects a pin to be a featured offer from a user's collection.
 * If they are missing copies of some pins, the user will be guaranteed to
 * get an offer for a new pin. Otherwise, they will get an offer for a duplicate.
 * If the user has no brawlers unlocked, they cannot receive an offer and this
 * function will return an empty string.
 * @param userCollection parsed brawlers object from the database
 * @returns string in "brawler/pin" format
 */
export function refreshFeaturedItem(userCollection: DatabaseBrawlers): string{
    let newPins: string[] = [];
    let duplicatePins: string[] = [];

    // A call to formatCollectionData costs more time than looping through the array
    // here and only storing data required to select a featured pin.
    
    for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];
        
        if (brawler.hasOwnProperty("name") === true && brawler.hasOwnProperty("pins") === true){
            // Only offer pins from brawlers the user owns
            if (userCollection.hasOwnProperty(brawler.name) === true){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    //const pinRarity = brawler.pins[pinIndex].rarity.value;
                    const pinAmount = userCollection[brawler.name][brawler.pins[pinIndex].name];
                    if (typeof pinAmount !== "undefined" && pinAmount > 0){
                        duplicatePins.push(brawler.name + "/" + brawler.pins[pinIndex].name);
                    } else{
                        newPins.push(brawler.name + "/" + brawler.pins[pinIndex].name);
                    }
                }
            }
        }
    }

    //console.log(duplicatePins.length, newPins.length);
    let selectedPin = "";

    // If the user can receive new pins, select one to offer
    // If they user does not have any new pins available to collect, select one
    // that is a duplicate. If the user cannot collect any pins (ex. no brawlers
    // unlocked), offer nothing.
    if (newPins.length > 0){
        selectedPin = newPins[Math.floor(Math.random() * newPins.length)];
    } else if (duplicatePins.length > 0){
        selectedPin = duplicatePins[Math.floor(Math.random() * duplicatePins.length)];
    }

    return selectedPin;
}

/**
 * Some items are only available in the shop only if the user has progressed
 * far enough. This function returns the items which the user is able to
 * purchase from the shop, given their current progress.
 * @param userAvatars parsed array of avatars from the database
 * @param userThemes parsed array of themes from the database
 * @param collection formatted collection object
 * @param accessoryLevel user's accessory level
 * @returns object with avatar, theme, and scene extraData strings
 */
function getAchievementItems(userAvatars: DatabaseAvatars, userThemes: DatabaseThemes, collection: CollectionData, accessoryLevel: number): AchievementItems{
    let avatars = new Set<string>();

    const score = getCollectionScore(collection);

    // Order of unlocking tiered avatars ("hardest" challenge sprays !!!)
    const tierOrder = [
        "collection_01", "collection_02", "collection_03", "collection_04",
        "collection_05", "collection_06", "collection_07", "collection_08"
    ];
    
    // This will contain the index of the highest tiered avatar the user currently has
    let tier = -1;

    for (let x in userAvatars){
        if (userAvatars[x].includes("collection") === true){
            tier = Math.max(tier, tierOrder.indexOf(userAvatars[x]));            
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
    if (userAvatars.length >= 12){
        avatars.add("gamemode_brawlball");
    }
    // Heist avatar is available when the user has at least 12 special themes unlocked
    if (userThemes.length >= 12){
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

    return {
        avatars: avatars,
        themes: themes,
        scenes: scenes
    };
}

/**
 * Sets the collectionScore and avatarColor fields of a collection object
 * based on how close it is to completion.
 * @param collection formatted collection object
 * @returns numeric value of collection score
 */
function getCollectionScore(collection: CollectionData): number{
    if (collection.totalBrawlers === 0 || collection.totalPins === 0 || collection.totalAccessories === 0){
        return 0;
    }
    if (collection.pinCopies < collection.unlockedPins){
        return 0;
    }

    const brawlerScore = collection.unlockedBrawlers / collection.totalBrawlers;
    const completionScore = collection.completedBrawlers / collection.totalBrawlers;
    const pinScore = collection.unlockedPins / collection.totalPins;
    const duplicateScore = collection.pinCopies / (collection.pinCopies + collection.totalPins - collection.unlockedPins);
    const accessoryScore = collection.unlockedAccessories / collection.totalAccessories;

    // use larger numbers and floor to avoid non-exact
    // representations of floating point numbers causing errors
    const overallScore = Math.floor(400 * pinScore + 200 * brawlerScore + 50 * completionScore + 150 * duplicateScore + 400 * accessoryScore);
    
    let grade = "X";
    let color = "#000000";
    let progress = 0;

    // bad code but it needs to be faster
    if      (overallScore < 1)      { grade = "X" ; color = "#FFFFFF"; progress = 0                          ; }
    else if (overallScore < 30)     { grade = "D" ; color = "#808080"; progress = (overallScore -    0) /  30; }
    else if (overallScore < 60)     { grade = "C-"; color = "#80C080"; progress = (overallScore -   30) /  30; }
    else if (overallScore < 90)     { grade = "C" ; color = "#80FF80"; progress = (overallScore -   60) /  30; }
    else if (overallScore < 120)    { grade = "C+"; color = "#00FF00"; progress = (overallScore -   90) /  30; }
    else if (overallScore < 180)    { grade = "B-"; color = "#00FFC0"; progress = (overallScore -  120) /  60; }
    else if (overallScore < 270)    { grade = "B" ; color = "#00FFFF"; progress = (overallScore -  180) /  90; }
    else if (overallScore < 360)    { grade = "B+"; color = "#0080FF"; progress = (overallScore -  270) /  90; }
    else if (overallScore < 480)    { grade = "A-"; color = "#8000FF"; progress = (overallScore -  360) / 120; }
    else if (overallScore < 640)    { grade = "A" ; color = "#FF03CC"; progress = (overallScore -  480) / 160; }
    else if (overallScore < 800)    { grade = "A+"; color = "#FE0521"; progress = (overallScore -  640) / 160; }
    else if (overallScore < 1000)   { grade = "S-"; color = "#FF8000"; progress = (overallScore -  800) / 200; }
    else if (overallScore < 1200)   { grade = "S" ; color = "#FDF11E"; progress = (overallScore - 1000) / 200; }
    else                            { grade = "S+"; color = "rainbow"; progress = 1                          ; }

    collection.collectionScore = grade;
    collection.avatarColor = color;
    collection.scoreProgress = progress;

    return overallScore;
}
