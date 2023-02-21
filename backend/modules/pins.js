/**
 * Reads a user's brawler and pin collection from the database and organizes it
 * in an array with useful properties for displaying the collection on-screen.
 * Also analyzes the collection and gives a score based on how close it is to
 * completion. All image files have their appropriate file paths added.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Object} userCollection parsed brawlers object from the database
 * @param {String} portraitFile file path to brawler portraits
 * @param {String} pinFile file path to the directory containing the pins
 * @returns json object of the collection that can be sent to the user
 */
function formatCollectionData(allSkins, userCollection, portraitFile, pinFile){
    let collectionInfo = {
        "unlockedBrawlers":0,
        "completedBrawlers":0,
        "totalBrawlers":0,
        "unlockedPins":0,
        "totalPins":0,
        "pinCopies": 0,
        "collectionScore": "",
        "scoreProgress": 0,
        "avatarColor": "#000000",
        "pinRarityColors": {},
        "collection":[]
    };

    // All other fields will not be included to minimize the data size
    const includeFromBrawler = ["name", "displayName", "image", "rarity", "pins"];
    
    // Iterate over all the brawlers
    for (let brawler of allSkins){
        let thisBrawler = {};
        let unlockedPins = 0;
        let totalPins = 0;
        let pinCopies = 0;

        // Check that all desired properties exist all at once
        // so they do not have to be checked individually as
        // they are used
        let missingProperties = false;
        for (let j of includeFromBrawler){
            if (!(brawler.hasOwnProperty(j))){
                missingProperties = true;
            }
        }

        // This determines whether to check for unlocked pins
        // If a brawler is not unlocked, none of their pins can
        // be unlocked either.
        let hasBrawler = false;
        if (missingProperties == false){
            hasBrawler = userCollection.hasOwnProperty(brawler.name);
            if (hasBrawler){
                collectionInfo.unlockedBrawlers++;
            }
            collectionInfo.totalBrawlers++;

            let brawlerPins = [];

            // Iterate over a brawler's pins
            for (let pin of brawler.pins){
                let thisPin = {};

                if (pin.hasOwnProperty("image")){
                    thisPin["i"] = pin.image;
                }
                thisPin["a"] = 0;
                thisPin["r"] = pin.rarity.value;
                collectionInfo.pinRarityColors[pin.rarity.value] = pin.rarity.color;

                // If the brawler appears in userCollection as a key, it is unlocked
                // If the brawler is unlocked, check to see if the name of the current
                // pin appears in the corresponding value. If it appears, the current
                // pin is unlocked.
                if (hasBrawler){
                    let pinDataObject = userCollection[brawler.name];
                    /*
                    if (pinDataObject.hasOwnProperty(pin.name)){
                        //const pinAmount = userCollection[brawler.name][pin.name];
                        
                        if (pinDataObject[pin.name] > 0){
                            thisPin["u"] = true;
                            unlockedPins++;
                            collectionInfo.unlockedPins++;
                        }
                    }*/
                    
                    if (pinDataObject[pin.name] !== undefined){
                        if (pinDataObject[pin.name] > 0){
                            //thisPin["u"] = true;
                            unlockedPins++;
                            collectionInfo.unlockedPins++;
                        }
                        pinCopies += pinDataObject[pin.name];
                        collectionInfo.pinCopies += pinDataObject[pin.name];
                        thisPin["a"] = pinDataObject[pin.name];
                    }
                    
                    /*
                    if (userCollection[brawler.name].includes(pin.name)){
                        thisPin["u"] = true;
                        unlockedPins++;
                        collectionInfo.unlockedPins++;
                    }
                    */
                }
                totalPins++;
                collectionInfo.totalPins++;

                brawlerPins.push(thisPin);
            }

            thisBrawler["name"] = brawler.name;
            thisBrawler["displayName"] = brawler.displayName;

            thisBrawler["rarityColor"] = "#000000";
            if (brawler.rarity.hasOwnProperty("color")){
                thisBrawler["rarityColor"] = brawler.rarity.color;
            }
            
            thisBrawler["i"] = portraitFile + brawler.image;
            thisBrawler["u"] = hasBrawler;
            thisBrawler["unlockedPins"] = unlockedPins;
            thisBrawler["totalPins"] = totalPins;
            thisBrawler["pinCopies"] = pinCopies;
            thisBrawler["pinFilePath"] = pinFile + brawler.name + "/";
            thisBrawler["pins"] = brawlerPins;

            if (unlockedPins == totalPins){
                collectionInfo.completedBrawlers++;
            }

            collectionInfo.collection.push(thisBrawler);
        }
    }

    // After the collection is created, calculate its score
    getCollectionScore(collectionInfo);

    return collectionInfo;
}

/**
 * Returns a complete list of all avatars a user is able to select.
 * All free avatars are included and the user's special avatars collected
 * are compared with the list of all special avatars to determine which
 * special avatars they can select. Their collection is also used to
 * determine which portrait avatars are available. This function returns
 * avatars with their file extension. The array userAvatars does not have
 * file paths
 * @param {Array} allSkins json array with all the brawlers
 * @param {Array} allAvatars json object with arrays of free and special avatars
 * @param {Object} userCollection parsed brawlers object from the database
 * @param {Array} userAvatars parsed avatars array from the database
 * @param {String} avatarFile file path to the directory containing the avatars
 * @returns array of all avatar image names
 */
function getAvatars(allSkins, allAvatars, userCollection, userAvatars, avatarFile){
    let avatarsInfo = [];
    let unlockedBrawlers = [];

    if (!(allSkins && allAvatars.free && allAvatars.special)){
        return avatarsInfo;
    }

    // All free avatars are available, regardless of user
    for (let avatar of allAvatars.free){
        avatarsInfo.push(avatarFile + avatar);
    }
    

    for (let brawler of allSkins){
        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("image")){
            // If the user has the brawler unlocked, add the avatar as an option
            if (userCollection.hasOwnProperty(brawler.name)){
                unlockedBrawlers.push(brawler.image.split(".")[0]);
            }
        }
    }
    
    for (let avatar of allAvatars.special){
        // If a special avatar is unlocked, add it to the array.

        // The entire path of avatars is no longer stored in the
        // database, only the file name
        const filePaths = avatar.split("/");
        const avatarName = filePaths[filePaths.length - 1].split(".")[0];
        if (avatarName !== undefined && userAvatars.includes(avatarName)){
            avatarsInfo.push(avatarFile + avatar);
        }

        // If a special avatar is not unlocked, the only other way that
        // it can be used is if it is a brawler portrait and if the brawler
        // is unlocked, the portrait is made available.
        // In order for this to happen, the file names must be the same.
        else if (unlockedBrawlers.includes(avatarName)){
            avatarsInfo.push(avatarFile + avatar);
        }
    }

    return avatarsInfo;
}

/**
 * Returns a complete list of all themes a user is able to select.
 * All free themes are available to anyone. Special themes are only
 * obtainable from the shop. This function takes the name of a theme
 * bundle and classifies each image as either background, icon, or
 * any other type of item that may be contained in a bundle. Data inputs
 * have keys all: array with all available items, user: array with items
 * the user unlocked, map: mapping from file name to displays or previews,
 * file: file path to the themes or scenes
 * @param {Object} themesData json object with keys all, user, map, file
 * @param {Object} scenesData json object with keys all, user, map, file
 * @param {String} fileExtension image file extension
 * @returns object with keys corresponding to types of images
 */
function getThemes(themesData, scenesData, fileExtension){
    let themesInfo = {};
    const allThemes = themesData.all;
    const userThemes = themesData.user;
    const themeMap = themesData.map;
    const themeFile = themesData.file;

    if (!(allThemes.free && allThemes.special)){
        return themesInfo;
    }

    for (let t in allThemes){
        for (let theme of allThemes[t]){
            let themeType = "";
            if (theme.includes("_icon")){
                themeType = "icon";
            } else if (theme.includes("_background")){
                themeType = "background";
            } else if (theme.includes("_selectpreview")){
                themeType = "selectpreview";
            } else if (theme.includes("_music")){
                themeType = "music";
            }
            // Add more types if they become available
    
            if (themeType != ""){
                // Check if the theme map contains the current theme name and if it
                // does, add it to the themesInfo, grouped by name
                const filePaths = theme.split("/");
                const themeName = filePaths[filePaths.length - 1].split("_" + themeType)[0];
                if (themeMap.hasOwnProperty(themeName)){
                    if (!themesInfo.hasOwnProperty(themeName)){
                        themesInfo[themeName] = {};
                    }
    
                    if (t == "free"){
                        themesInfo[themeName][themeType] = themeFile + theme;
                    } else if (t == "special"){
                        if (themeName !== undefined && userThemes.includes(themeName)){
                            themesInfo[themeName][themeType] = themeFile + theme;
                        }
                    }
                }
            }
        }
    }
    
    // The data is required to be grouped by file type instead of theme name
    let themesResult = {
        "background": [],
        "icon": [],
        "music": [],
        "scene": getScenes(scenesData, fileExtension)
    };

    for (let x in themesInfo){
        for (let key in themesResult){
            if (themesInfo[x].hasOwnProperty(key)){
                // Themes are only added to themesInfo if there is a mapping from file
                // path to theme name so no need to check if it has property
                let thisTheme = {
                    "displayName": themeMap[x],
                    "path": themesInfo[x][key]
                };

                // Special case for icon and selectpreview: they need to be grouped together
                if (key == "icon" && themesInfo[x].hasOwnProperty("selectpreview")){
                    thisTheme.preview = themesInfo[x].selectpreview;
                }

                themesResult[key].push(thisTheme);
            }
        }
    };

    return themesResult;
}

/**
 * Returns a complete list of all scenes a user is able to select.
 * All scenes require a purchase to unlock. This returns an array
 * of scenes. Each scene is an object with its file path which gets
 * passed to the 3D model viewer. There is also a display name and
 * a preview image.
 * @param {Object} themesData json object with keys all, user, map, file
 * @param {Object} scenesData json object with keys all, user, map, file
 * @param {String} fileExtension image file extension
 * @returns object with keys corresponding to types of images
 */
function getScenes(scenesData, fileExtension){
    let scenesInfo = [];

    const sceneMap = scenesData.map;
    const sceneFile = scenesData.file;

    for (let scene of scenesData.all){
        const filePaths = scene.split("/");
        const sceneName = filePaths[filePaths.length - 1].split(".")[0];
        
        if (sceneName !== undefined && sceneMap.hasOwnProperty(sceneName)){
            if (sceneMap.hasOwnProperty(sceneName)){
                if (scenesData.user.includes(sceneName)){
                    scenesInfo.push({
                        "displayName": sceneMap[sceneName].displayName,
                        "path": sceneFile + scene,
                        "preview": sceneMap[sceneName].preview + fileExtension
                    });
                }
            } 
        }
    }

    return scenesInfo;
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
 * @param {Object} shopItems json object with all the possible shop items
 * @param {Array} allSkins json array with all the brawlers
 * @param {Object} userCollection parsed brawlers object from the database
 * @param {Object} userCosmetics arrays of user avatars, themes, and scenes
 * @param {String} featuredItem current featured item string
 * @param {Array} featuredCosts array of costs for different rarities of pins
 * @returns object containing items the user can buy
 */
function getShopItems(shopItems, allSkins, userCollection, userCosmetics, featuredItem, featuredCosts){
    let availableShopItems = {};

    // Avatars, themes, and scenes are grouped together in userCosmetics
    const userAvatars = userCosmetics.avatars;
    const userThemes = userCosmetics.themes;
    const userScenes = userCosmetics.scenes;

    const collectionInfo = formatCollectionData(allSkins, userCollection, "", "");
    const achievements = getAchievementAvatars(userAvatars, userThemes, collectionInfo);
    for (let x in shopItems){
        // Depending on the type of item, check availability differently
        if (shopItems[x].itemType == "tradeCredits"){
            // Trade credits are always available
            availableShopItems[x] = shopItems[x];
        } else if (shopItems[x].itemType == "brawler"){
            // As long as the user has one or more brawlers left to unlock, allow them to buy a brawler
            if (collectionInfo.unlockedBrawlers < collectionInfo.totalBrawlers){
                availableShopItems[x] = shopItems[x];
            }
        } else if (shopItems[x].itemType == "avatar"){
            // If the user does not already own an avatar, it is available for them to buy
            if (userAvatars.includes(shopItems[x].extraData) == false){
                availableShopItems[x] = shopItems[x];
            }
        } else if (shopItems[x].itemType == "achievementAvatar"){
            // If the user does not already own an avatar, it is available for them to buy
            if (userAvatars.includes(shopItems[x].extraData) == false && achievements.includes(shopItems[x].extraData)){
                let shopItemCopy = {};
                for (let y in shopItems[x]){
                    shopItemCopy[y] = shopItems[x][y];
                }

                shopItemCopy.itemType = "avatar";

                availableShopItems[x] = shopItemCopy;
            }
        } else if (shopItems[x].itemType == "theme"){
            // Themes are handled the same way as avatars. The only difference is that one theme string
            // corresponds to a bundle of actual items (background, icon, and possibly more???)
            if (userThemes.includes(shopItems[x].extraData) == false){
                availableShopItems[x] = shopItems[x];
            }
        } else if (shopItems[x].itemType == "scene"){
            // Scenes are handled the same way as avatars. Unlike avatars, there are no free scenes.
            if (userScenes.includes(shopItems[x].extraData) == false){
                availableShopItems[x] = shopItems[x];
            }
        } else if (shopItems[x].itemType == "featured"){
            let shopItemCopy = {};
            for (let y in shopItems[x]){
                shopItemCopy[y] = shopItems[x][y];
            }
            
            if (featuredItem.includes("/")){
                const pinName = featuredItem.split("/");
                // The featured pin is valid only if the user has the brawler unlocked
                // but they do not have to have the pin unlocked
                try{
                    if (userCollection.hasOwnProperty(pinName[0])){
                        for (let brawler in allSkins){
                            if (allSkins[brawler].name == pinName[0]){
                                const brawlerPins = allSkins[brawler].pins;
                                for (let pin in brawlerPins){
                                    if (brawlerPins[pin].name == pinName[1]){
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

                                        availableShopItems[x] = shopItemCopy;
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

            shopItems[x] = shopItemCopy;
        }
    }
    return availableShopItems;
}

/**
 * Randomly selects a pin to be a featured offer from a user's collection.
 * If they are missing copies of some pins, the user will be guaranteed to
 * get an offer for a new pin. Otherwise, they will get an offer for a duplicate.
 * If the user has no brawlers unlocked, they cannot receive an offer and this
 * function will return an empty string.
 * @param {Array} allSkins json array with all the brawlers
 * @param {Object} userCollection parsed brawlers object from the database
 * @returns string in "brawler/pin" format
 */
function refreshFeaturedItem(allSkins, userCollection){
    let newPins = [];
    let duplicatePins = [];

    // A call to formatCollectionData costs more time than looping through the array
    // here and only storing data required to select a featured pin.
    
    for (let brawlerIndex = 0; brawlerIndex < allSkins.length; brawlerIndex++){
        let brawler = allSkins[brawlerIndex];
        
        if (brawler.hasOwnProperty("name") && brawler.hasOwnProperty("pins")){
            // Only offer pins from brawlers the user owns
            if (userCollection.hasOwnProperty(brawler.name)){
                for (let pinIndex = 0; pinIndex < brawler.pins.length; pinIndex++){
                    //const pinRarity = brawler.pins[pinIndex].rarity.value;
                    const pinAmount = userCollection[brawler.name][brawler.pins[pinIndex].name];
                    if (pinAmount !== undefined && pinAmount > 0){
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
 * Some avatars are only available in the shop only if the user has collected
 * enough pins. This function returns the avatars which the user is able to
 * purchase from the shop, given their current collection.
 * @param {Array} userAvatars parsed avatars array from the database
 * @param {Array} userThemes parsed themes array from the database
 * @param {Object} collection formatted collection object
 * @returns array of avatar names
 */
function getAchievementAvatars(userAvatars, userThemes, collection){
    let achievementAvatars = [];

    const score = getCollectionScore(collection);

    // Order of unlocking tiered avatars ("hardest" challenge sprays !!!)
    const tierOrder = [
        "collection_01",
        "collection_02",
        "collection_03",
        "collection_04",
        "collection_05",
        "collection_06",
        "collection_07",
        "collection_08"
    ];
    
    // This will contain the index of the highest tiered avatar the user currently has
    let tier = -1;

    for (let x in userAvatars){
        if (userAvatars[x].includes("collection")){
            tier = Math.max(tier, tierOrder.indexOf(userAvatars[x]));            
        }
    }    

    // The user can buy the next tiered avatar if and only if they meet the
    // collection score requirement. Only one tiered avatar is offered at a time.
    if (tier == -1){
        if (score >=   60) { achievementAvatars.push(tierOrder[0]); }// Requires C
    } else if (tier == 0){
        if (score >=  120) { achievementAvatars.push(tierOrder[1]); }// Requires B-
    } else if (tier == 1){
        if (score >=  270) { achievementAvatars.push(tierOrder[2]); }// Requires B+
    } else if (tier == 2){
        if (score >=  480) { achievementAvatars.push(tierOrder[3]); }// Requires A
    } else if (tier == 3){
        if (score >=  640) { achievementAvatars.push(tierOrder[4]); }// Requires A+
    } else if (tier == 4){
        if (score >=  800) { achievementAvatars.push(tierOrder[5]); }// Requires S-
    } else if (tier == 5){
        if (score >= 1000) { achievementAvatars.push(tierOrder[6]); }// Requires S
    } else if (tier == 6){
        if (score >= 1200) { achievementAvatars.push(tierOrder[7]); }// Requires S+
    }
    // tier == 7 means all avatars unlocked

    // Gem Grab avatar is available in the shop with no requirement

    // Brawl Ball avatar is available when the user has at least 12 special avatars unlocked
    if (userAvatars.length >= 12){
        achievementAvatars.push("gamemode_brawlball");
    }

    // Heist avatar is available when the user has at least 12 special themes unlocked
    if (userThemes.length >= 12){
        achievementAvatars.push("gamemode_heist");
    }

    // Bounty avatar is available when the user has at least 2000 pin copies
    if (collection.pinCopies >= 2000){
        achievementAvatars.push("gamemode_bounty");
    }

    /*achievementAvatars = specialAvatars.filter((element, index, array) => {
        const filePaths = element.split("/");
        return achievementAvatars.includes(filePaths[filePaths.length - 1].split(".")[0]);
    });*/

    return achievementAvatars;
}

/**
 * Sets the collectionScore and avatarColor fields of a collection object
 * based on how close it is to completion.
 * @param {Array} collection formatted collection object
 * @returns numeric value of collection score
 */
function getCollectionScore(collection){
    if (collection.totalBrawlers == 0 || collection.totalPins == 0){
        return;
    }
    if (collection.pinCopies < collection.unlockedPins){
        return;
    }

    const brawlerScore = collection.unlockedBrawlers / collection.totalBrawlers;
    const completionScore = collection.completedBrawlers / collection.totalBrawlers;
    const pinScore = collection.unlockedPins / collection.totalPins;
    const duplicateScore = collection.pinCopies / (collection.pinCopies + collection.totalPins - collection.unlockedPins);

    // use larger numbers and floor to avoid non-exact
    // representations of floating point numbers causing errors
    const overallScore = Math.floor(500 * pinScore + 300 * brawlerScore + 200 * completionScore + 200 * duplicateScore);
    
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

exports.formatCollectionData = formatCollectionData;
exports.getAvatars = getAvatars;
exports.getThemes = getThemes;
exports.getShopItems = getShopItems;
exports.refreshFeaturedItem = refreshFeaturedItem;
