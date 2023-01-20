// This route contains operations relating to user pin and avatar collections

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";

// functions to view and modify pin collections
const pins = require("../modules/pins");
const maps = require("../modules/maps");
const fileLoader = require("../modules/fileloader");
const brawlbox = require("../modules/brawlbox");

// base directories of image files
const filePaths = require("../modules/filepaths");
const PORTRAIT_IMAGE_DIR = filePaths.PORTRAIT_IMAGE_DIR;
const PIN_IMAGE_DIR = filePaths.PIN_IMAGE_DIR;
const RESOURCE_IMAGE_DIR = filePaths.RESOURCE_IMAGE_DIR;
const AVATAR_IMAGE_DIR = filePaths.AVATAR_IMAGE_DIR;
const THEME_IMAGE_DIR = filePaths.THEME_IMAGE_DIR;
const IMAGE_FILE_EXTENSION = filePaths.IMAGE_FILE_EXTENSION;

// time each featured item is available for
const FEATURED_REFRESH_HOURS = 24;


// Load the skins json object
let allSkins = [];
const allSkinsPromise = fileLoader.allSkinsPromise;
allSkinsPromise.then((data) => {
    if (data !== undefined){
        allSkins = data;
    }
});

// Load the theme map
let themeMap = {};
const themeMapPromise = fileLoader.themeMapPromise;
themeMapPromise.then((data) => {
    if (data !== undefined){
        themeMap = data;
    }
});

// Load the shop items
let shopItems = {};
const shopDataPromise = fileLoader.shopDataPromise;
shopDataPromise.then((data) => {
    if (data !== undefined){
        if (validateShopItems(data)){
            shopItems = data;
        }
    }
});

// Load the drop chances data
let dropChances = {};
let brawlBoxTypes = {};
const dropChancesPromise = fileLoader.dropChancesPromise;
dropChancesPromise.then((data) => {
    if (data !== undefined){
        if (validateDropChances(data)){
            dropChances = data;

            // Copy over the brawl box data in case the user requests a list of box types
            // Remove all secret information like drop chances
            for (let x in dropChances.boxes){
                if (x != "bonus" && x != "newBrawler"){
                    let thisBrawlBox = {};
                    for (let y in dropChances.boxes[x]){
                        if (y == "image"){
                            thisBrawlBox[y] = RESOURCE_IMAGE_DIR + dropChances.boxes[x][y];
                        } else if (y != "draws" && y != "rewardTypeValues"){
                            thisBrawlBox[y] = dropChances.boxes[x][y];
                        }
                    }
                    brawlBoxTypes[x] = thisBrawlBox;
                }
            }
        } else{
            console.log("Could not find a valid Brawl Box data file.")
        }
    }
});


/**
 * Checks whether a json object is empty.
 * @param {Object} x the object
 * @returns true if empty, false otherwise
 */
 function isEmpty(x){
    let isEmpty = true;
    for (let y in x){
        isEmpty = false;
    }
    return isEmpty;
}


/**
 * Checks whether a token is valid and returns the username that the
 * token belongs to. If the token is not valid, returns an empty string.
 * Errors will be processed using the result of this function.
 * @param {Object} token the token to check
 * @returns username the token belongs to
 */
function validateToken(token){
    try{
        const data = jsonwebtoken.verify(token, "THE KING WINS AGAIN");
            
        if (data.username === undefined){
            return "";
        }
        return data.username;
    } catch(error){
        return "";
    }
}


/**
 * Processes a query to the database by checking if there was an error
 * and whether there were results. If the query was unsuccessful, return
 * true. Otherwise, return false.
 * @param {Error} error 
 * @param {Array} results 
 * @param {Object} fields 
 * @param {Object} res 
 * @returns boolean
 */
function databaseErrorCheck(error, results, fields, res){
    if (error){
        res.status(500).send("Could not connect to database.");
        return true;
    }
    if (results.length == 0){
        res.status(404).send("Could not find the content in the database.");
        return true;
    }
    return false;
}


function validateShopItems(shopItems){
    if (!(shopItems)){
        return false;
    }

    // these are the only required properties, all others are optional
    const checkProperties = ["cost", "itemType", "image", "extraData", "amount"];

    let valid = true;
    for (let item in shopItems){
        for (let property of checkProperties){
            if (shopItems[item].hasOwnProperty(property) == false){
                valid = false;
            }
        }
    }

    return valid;
}

/**
 * Checks an object to determine whether it has all the necessary information
 * to be used by the brawl box to calculate drops.
 * @param {Object} dropChances object with drop chances data stored inside
 * @returns boolean whether the object is valid
 */
function validateDropChances(dropChances){
    // The object doesn't even exist...
    if (!(dropChances)){
        return false;
    }
    // If no key exists, immediately throw the game and shoot your teammates
    if (!(dropChances.hasOwnProperty("key"))){
        return false;
    }

    let valid = true;
    for (let checkType in dropChances.key){
        // checkType = the reward type category (boxes or rewardTypes)
        if (dropChances.hasOwnProperty(checkType)){
            for (let x of dropChances.key[checkType]){
                // x = the object representing what to check ({"types": [...], "properties": [...]})
                if (x.hasOwnProperty("types") && x.hasOwnProperty("properties")){
                    for (let y of x.types){
                        // y = the key of the type to check ("coins", "tokenDoubler", ...)
                        // checkObject = the actual object to check (found using the key)
                        if (dropChances[checkType].hasOwnProperty(y)){
                            let checkObject = dropChances[checkType][y];
                            for (let key of x.properties){
                                // Go through the object's properties and check if they exist
                                if (!(checkObject.hasOwnProperty(key))){
                                    valid = false;
                                }
                            }
                        } else{
                            valid = false;
                        }
                    }
                } else{
                    valid = false;
                }
            }
        } else{
            valid = false;
        }   
    }

    return valid;
}


//----------------------------------------------------------------------------------------------------------------------

// Get a user's username and amounts of various resources
router.post("/resources", (req, res) => {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT username, active_avatar, tokens, token_doubler, coins, trade_credits, brawlers, wild_card_pins FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            let collectionInfo = {};
            try{
                collectionInfo = pins.formatCollectionData(allSkins, JSON.parse(results[0].brawlers), PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }

            
            let wildCardData = JSON.parse(results[0].wild_card_pins);
            let wildCardPins = [];

            for (let x in wildCardData){
                wildCardPins.push({
                    "rarityName":"",
                    "rarityColor":"#000000",
                    "amount":wildCardData[x]
                });
            }

            // Look through the allSkins array to get the rarity information
            for (let x in allSkins){
                if (allSkins[x].hasOwnProperty("pins")){
                    for (let y of allSkins[x].pins){
                        if (y.rarity.value < wildCardPins.length){
                            const rarityValue = y.rarity.value;
                            wildCardPins[rarityValue].rarityName = y.rarity.name;
                            wildCardPins[rarityValue].rarityColor = y.rarity.color;
                        }
                    }
                }
            }

            // If there are no pins of a specific rarity, the rarity name in wildCardPins
            // will be empty. This is fine because wild card pins of that rarity have no use
            // since there are no pins of that rarity that exist.
            
            
            const resourcesData = {
                "username": results[0].username,
                "avatar": results[0].active_avatar + IMAGE_FILE_EXTENSION,
                "avatarColor": collectionInfo.avatarColor,
                "tokens": results[0].tokens,
                "tokenDoubler": results[0].token_doubler,
                "coins": results[0].coins,
                "tradeCredits": results[0].trade_credits,
                "wildCardPins": wildCardPins
            }
            
            res.json(resourcesData);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

// Get a user's collection of brawlers and pins
router.post("/collection", (req, res) => {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT brawlers FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }
            
            let collectionData = {};
            try{
                collectionData = JSON.parse(results[0].brawlers);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }
            
            //const BUL = performance.now();
            let collectionInfo = pins.formatCollectionData(allSkins, collectionData, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR);
            //const EDGRISBAD = (performance.now() - BUL);
            //console.log("YOUR PROGRAM IS",EDGRISBAD.toString(),"TIMES WORSE THAN E D G R");

            res.json(collectionInfo);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

// 
router.post("/brawlbox", (req, res) => {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    if (isEmpty(dropChances)){
        res.status(500).send("Brawl Box is not set up properly.");
        return;
    }


    // If the user does not specify a box type, send all the available boxes
    // If they do specify a box type, check to make sure that box actually exists.
    if (!(req.body.boxType)){
        // Format it in an array when sending to the user
        let brawlBoxList = [];
        for (let x in brawlBoxTypes){
            let thisBox = {};
            thisBox.name = x;
            for (let property in brawlBoxTypes[x]){
                if (property == "image"){
                    thisBox[property] = brawlBoxTypes[x][property] + IMAGE_FILE_EXTENSION;
                } else{
                    thisBox[property] = brawlBoxTypes[x][property];
                }
            }
            brawlBoxList.push(thisBox);
        }
        
        res.json(brawlBoxList);
        return;
    }
    if (!(brawlBoxTypes.hasOwnProperty(req.body.boxType))){
        res.status(400).send("Box type does not exist.");
        return;
    }


    let username = validateToken(req.body.token);
    let boxType = req.body.boxType;
    if (username){
        //const BUL = performance.now();
        database.queryDatabase(
        "SELECT brawlers, avatars, wild_card_pins, tokens, token_doubler, coins, trade_credits FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            let userResources = results[0];

            if (userResources.tokens < brawlBoxTypes[boxType].cost){
                res.status(403).send("You cannot afford this Box!");
                return;
            }

            // Is storing the data as text instead of json is faster if there is no searching???
            try{
                userResources.brawlers = JSON.parse(userResources.brawlers);
                userResources.avatars = JSON.parse(userResources.avatars);
                userResources.wild_card_pins = JSON.parse(userResources.wild_card_pins);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }

            //for (let D=0;D<25;D++){
            //    brawlbox.brawlBox(dropChances, "megaBox", allSkins, userResources);
            //} for (let D=0;D<175;D++){
            //    brawlbox.brawlBox(dropChances, "brawlBox", allSkins, userResources);
            //} for (let D=0;D<125;D++){
            //    brawlbox.brawlBox(dropChances, "pinPack", allSkins, userResources);
            //}


            //const BUL = performance.now();
            let brawlBoxContents = brawlbox.brawlBox(dropChances, boxType, allSkins, userResources, IMAGE_FILE_EXTENSION);
            //const EDGRISBAD = (performance.now() - BUL);
            //console.log("YOUR PROGRAM IS",EDGRISBAD.toString(),"TIMES WORSE THAN E D G R");

            if (brawlBoxContents.length == 0){
                res.status(500).send("This Brawl Box contained a manufacturing defect.");
                return;
            }

            // Sort all the brawlers so they don't end up in random order as the user opens more boxes
            userResources.brawlers = Object.keys(userResources.brawlers).sort().reduce((object, key) => {
                object[key] = userResources.brawlers[key]; 
                return object;
            }, {});


            database.queryDatabase(
            "UPDATE " + TABLE_NAME +
            " SET brawlers = ?, avatars = ?, wild_card_pins = ?, tokens = ?, token_doubler = ?, coins = ?, trade_credits = ? WHERE username = ?;",
            [
                JSON.stringify(userResources.brawlers),
                JSON.stringify(userResources.avatars),
                JSON.stringify(userResources.wild_card_pins),
                userResources.tokens,
                userResources.token_doubler,
                userResources.coins,
                userResources.trade_credits,
                username
            ], (error, results, fields) => {
                if (error){
                    res.status(500).send("Could not connect to database.");
                    return;
                }
                if (results.affectedRows == 0){
                    res.status(500).send("Could not update the database.");
                }

                // Add image file paths to all images returned as rewards
                for (let x of brawlBoxContents){
                    if (x.hasOwnProperty("image") && x.hasOwnProperty("rewardType")){
                        if (x.rewardType == "pin"){
                            x.image = PIN_IMAGE_DIR + x.image;
                        } else if (x.rewardType == "brawler"){
                            x.image = PORTRAIT_IMAGE_DIR + x.image;
                        } else if (x.rewardType == "avatar"){
                            x.image = AVATAR_IMAGE_DIR + x.image;
                        } else if (
                            x.rewardType == "coins" ||
                            x.rewardType == "wildcard" ||
                            x.rewardType == "tradeCredits" ||
                            x.rewardType == "tokenDoubler"
                        ){
                            x.image = RESOURCE_IMAGE_DIR + x.image;                            
                        }
                    }
                }

                //const EDGRISBAD = (performance.now() - BUL);
                //console.log("YOUR PROGRAM IS",EDGRISBAD.toString(),"TIMES WORSE THAN E D G R");

                res.json(brawlBoxContents);
            });
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

// View or buy item(s) from the (coins) shop
router.post("/shop", (req, res) => {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    if (isEmpty(shopItems)){
        res.status(500).send("No items currently available for sale.");
        return;
    }

    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT last_login, coins, trade_credits, brawlers, avatars, themes, featured_item FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (databaseErrorCheck(error, results, fields, res)){
                return;
            }

            // Load the user's resources
            let userBrawlers = {};
            let userAvatars = [];
            let userThemes = [];
            let userCoins = results[0].coins;
            let featuredItem = results[0].featured_item;
            let userTradeCredits = results[0].trade_credits;
            try{
                userBrawlers = JSON.parse(results[0].brawlers);
                userAvatars = JSON.parse(results[0].avatars);
                userThemes = JSON.parse(results[0].themes);
            } catch (error){
                res.status(500).send("Collection data could not be loaded.");
                return;
            }
            

            // Determine whether the featured item should be refreshed
            let currentTime = Date.now();
            let currentSeasonTime = maps.realToTime(currentTime);

            let refreshed = false;

            let hoursSinceLastLogin = (currentTime - results[0].last_login) / 3600000;
            if (hoursSinceLastLogin >= maps.MAP_CYCLE_HOURS){
                refreshed = true;
            } else{
                //currentSeasonTime = new maps.SeasonTime(1, 219, 0, 0);
                let currentSeason = currentSeasonTime.season;
                let currentHour = currentSeasonTime.hour;

                let lastLoginTime = maps.realToTime(results[0].last_login);
                //lastLoginTime = new maps.SeasonTime(0, 327, 0, 0);
                let lastLoginHour = lastLoginTime.hour;

                
                // Explanation for the different cases is in claimtokens
                let seasonDiff = currentSeason - lastLoginTime.season;
                if (seasonDiff > 0){
                    currentSeason -= seasonDiff;
                    currentHour += currentSeasonTime.hoursPerSeason * seasonDiff;
                } else if (seasonDiff < 0){
                    currentSeason -= seasonDiff;
                    currentHour += currentSeasonTime.hoursPerSeason * maps.mod(seasonDiff, currentSeasonTime.maxSeasons);
                } else if (currentHour < lastLoginHour){
                    currentHour += currentSeasonTime.hoursPerSeason * currentSeasonTime.maxSeasons;
                }

                if (Math.floor(currentHour / FEATURED_REFRESH_HOURS) * FEATURED_REFRESH_HOURS > lastLoginHour){
                    refreshed = true;
                }
            }

            if (refreshed){
                let newFeaturedItem = pins.refreshFeaturedItem(allSkins, userBrawlers);
                if (newFeaturedItem != ""){
                    featuredItem = newFeaturedItem;
                }
            }



            // The shop items object may me modified with a featured item so create a copy
            let shopItemsCopy = {};
            for (let x in shopItems){
                shopItemsCopy[x] = shopItems[x];
            }

            // Get the coin costs for the featured pin
            featuredCosts = [];
            if (dropChances.rewardTypes.pinNoDupes.coinConversion !== undefined){
                featuredCosts = dropChances.rewardTypes.pinNoDupes.coinConversion;
            }
            // Out of all the shop items, remove all of them that the user cannot buy right now
            let availableShopItems = pins.getShopItems(shopItemsCopy, allSkins, userBrawlers, userAvatars, userThemes, featuredItem, featuredCosts);

            // If they do not provide an item to buy, show all items
            if (!(req.body.item)){
                let shopItemList = [];
                for (let x in availableShopItems){
                    let thisItem = {};
                    thisItem.name = x;
                    for (let property in availableShopItems[x]){
                        if (property == "image"){
                            thisItem.image = "";

                            const thisItemType = availableShopItems[x]["itemType"];

                            // Avatars have their image stored in extraData because the image is required
                            // when adding it to the user's inventory
                            // All other item types' images are only for display
                            if (thisItemType == "avatar"){
                                thisItem.image = AVATAR_IMAGE_DIR + availableShopItems[x]["extraData"] + IMAGE_FILE_EXTENSION;
                            } else if (thisItemType == "theme"){
                                const themeName = availableShopItems[x]["extraData"];
                                if (themeMap.hasOwnProperty(themeName)){
                                    thisItem.displayName = themeMap[themeName];
                                }
                                thisItem.image = THEME_IMAGE_DIR + themeName + "_preview" + IMAGE_FILE_EXTENSION;
                            } else if (thisItemType == "featuredPin"){
                                // Featured pin already has the image extension since it is stored in brawlers data
                                thisItem.image = PIN_IMAGE_DIR + availableShopItems[x].image;
                            } else{
                                // Only add the image directory if the image is not empty string
                                if (availableShopItems[x].image != ""){
                                    thisItem.image = RESOURCE_IMAGE_DIR + availableShopItems[x].image + IMAGE_FILE_EXTENSION;
                                }
                            }
                        } else if (property != "itemType" && property != "extraData"){
                            // The user does not need to know about itemType and extraData
                            thisItem[property] = availableShopItems[x][property];
                        }
                    }
                    shopItemList.push(thisItem);
                }
                
                database.queryDatabase(
                "UPDATE " + TABLE_NAME + " SET last_login = ?, featured_item = ? WHERE username = ?;",
                [currentTime, featuredItem, username], (error, results, fields) => {
                    if (error){
                        res.status(500).send("Could not connect to database.");
                        return;
                    }
                    if (results.affectedRows == 0){
                        res.status(500).send("Could not update the database.");
                        return;
                    }
    
                    res.json(shopItemList);
                });
                return;
            }
            if (!(availableShopItems.hasOwnProperty(req.body.item))){
                res.status(404).send("Item is not currently available.");
                return;
            }

            // This object contains all the data of the item the user is currently buying
            const itemData = shopItemsCopy[req.body.item];

            if (userCoins < itemData.cost){
                res.status(403).send("You cannot afford this item!");
                return;
            }

            // All costs in this shop are in coins
            userCoins -= itemData.cost;
            
            // Add the item to the user's inventory
            // Do a different operation based on the type of the item
            let buyItemResult = [];
            let userItemInventory = 0;
            if (itemData.itemType == "tradeCredits"){
                userTradeCredits += itemData.amount;
                userItemInventory = userTradeCredits;
            } else if (itemData.itemType == "avatar" || itemData.itemType == "achievementAvatar"){
                userAvatars.push(itemData.extraData);
                userItemInventory = 1;
            } else if (itemData.itemType == "theme"){
                userThemes.push(itemData.extraData);
                userItemInventory = 1;
            } else if (itemData.itemType == "brawler"){
                // The brawl box opener needs a resources object so provide a temporary object
                // with some of the fields set to default values
                let tempResourceObject = {
                    "brawlers": userBrawlers,
                    "avatars": userAvatars,
                    "wild_card_pins": [],
                    "tokens": 0,
                    "token_doubler": 0,
                    "coins": userCoins,
                    "trade_credits": userTradeCredits
                }
                buyItemResult = brawlbox.brawlBox(dropChances, "newBrawler", allSkins, tempResourceObject, IMAGE_FILE_EXTENSION);

                if (buyItemResult.length > 0){
                    userItemInventory = 1;

                    // Sort all the brawlers so they don't end up in random order as the user opens more boxes
                    userBrawlers = Object.keys(userBrawlers).sort().reduce((object, key) => {
                        object[key] = userBrawlers[key]; 
                        return object;
                    }, {});
                }
            } else if (itemData.itemType == "featuredPin"){
                // The extraData of the itemData has already been checked when getting shop items
                // so this is guaranteed to be a valid brawler and pin name. It just has to check
                // whether the user already owns the pin or not then modify their collection.

                const pinName = itemData.extraData.split("/");
                // Index 0 is the brawler, index 1 is the pin

                if (userBrawlers.hasOwnProperty(pinName[0])){
                    if (userBrawlers[pinName[0]].hasOwnProperty(pinName[1])){
                        // User already has the pin
                        userBrawlers[pinName[0]][pinName[1]] += itemData.amount;
                    } else{
                        // User does not have the pin yet
                        userBrawlers[pinName[0]][pinName[1]] = itemData.amount
                    }
                    userItemInventory = userBrawlers[pinName[0]][pinName[1]];

                    // The featured item can only be bought once per day
                    featuredItem = "";
                }
            }

            // Write back to the database after all values have been modified
            database.queryDatabase(
            "UPDATE " + TABLE_NAME + " SET last_login = ?, coins = ?, trade_credits = ?, brawlers = ?, avatars = ?, themes = ?, featured_item = ? WHERE username = ?;",
            [
                currentTime,
                userCoins,
                userTradeCredits,
                JSON.stringify(userBrawlers),
                JSON.stringify(userAvatars),
                JSON.stringify(userThemes),
                featuredItem,
                username
            ], (error, results, fields) => {
                if (error){
                    res.status(500).send("Could not connect to database.");
                    return;
                }
                if (results.affectedRows == 0){
                    res.status(500).send("Could not update the database.");
                    return;
                }

                res.json({
                    "inventory": userItemInventory,
                    "result": buyItemResult
                });
            });
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

module.exports = router;
