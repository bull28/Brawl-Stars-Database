import express from "express";
import allSkins from "../data/brawlers_data.json";
import shopItemsObject from "../data/coinsshop_data.json";
import {themeMap, sceneMap, AVATAR_IMAGE_DIR, AVATAR_SPECIAL_DIR, FEATURED_REFRESH_HOURS, IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, RESOURCE_IMAGE_DIR, THEME_SPECIAL_DIR} from "../data/constants";
import {validateToken} from "../modules/authenticate";
import brawlBox, {convertBrawlBoxData, isBrawlBoxAttributes, isRewardTypePin} from "../modules/brawlbox";
import {formatCollectionData, getShopItems, refreshFeaturedItem} from "../modules/pins";
import {MAP_CYCLE_HOURS, mod, realToTime} from "../modules/maps";
import {
    databaseErrorHandler, 
    parseBrawlers, 
    parseNumberArray, 
    parseStringArray, 
    stringifyBrawlers, 
    afterBrawlBox, 
    afterShop, 
    beforeShop, 
    beforeUpdate, 
    getResources, 
    updateFeaturedItem
} from "../modules/database";
import {
    BrawlBoxData, 
    BrawlBoxDrop, 
    BrawlBoxAttributes, 
    CollectionData, 
    DatabaseAvatars, 
    DatabaseBrawlers, 
    DatabaseScenes, 
    DatabaseThemes, 
    ShopItem, 
    ShopList, 
    UserResources
} from "../types";

const router = express.Router();


// Convert this data stored in files to objects with known types
const shopItems: ShopList = new Map<string, ShopItem>(Object.entries(shopItemsObject));
const dropChances: BrawlBoxData = convertBrawlBoxData();

// Get a map with only the "visible" boxes
// These are the ones that the user can send a request to open
let brawlBoxTypes = new Map<string, BrawlBoxAttributes>();
dropChances.boxes.forEach((value, key) => {
    if (isBrawlBoxAttributes(value)){
        brawlBoxTypes.set(key, value);
    }
});

// Type of wild card data sent to the user
interface WildCardData{
    rarityName: string;
    rarityColor: string;
    amount: number;
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

// Type of shop item information sent to the user
interface ShopItemPreview{
    name: string;
    displayName: string;
    cost: number;
    image: string;
    amount: number;
    description: string;
}

interface TokenReqBody{
    token: string;
}

interface BrawlBoxReqBody extends TokenReqBody{
    boxType: string;
}

interface ShopReqBody extends TokenReqBody{
    item: string;
}


// Get a user's username and amounts of various resources
router.post<{}, {}, TokenReqBody>("/resources", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        const results = await getResources({username: username});

        let collection: CollectionData;
        try{
            collection = formatCollectionData(parseBrawlers(results[0].brawlers));
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        let wildCards = parseNumberArray(results[0].wild_card_pins);
        let wildCardPins: WildCardData[] = [];

        for (let x = 0; x < wildCards.length; x++){
            wildCardPins.push({
                rarityName: "",
                rarityColor: "#000000",
                amount: wildCards[x]
            });
        }

        // Look through the allSkins array to get the rarity information
        for (let x in allSkins){
            if (allSkins[x].hasOwnProperty("pins") === true){
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
        
        
        res.json({
            username: results[0].username,
            avatar: AVATAR_IMAGE_DIR + results[0].active_avatar + IMAGE_FILE_EXTENSION,
            avatarColor: collection.avatarColor,
            tokens: results[0].tokens,
            tokenDoubler: results[0].token_doubler,
            coins: results[0].coins,
            tradeCredits: results[0].trade_credits,
            wildCardPins: wildCardPins
        });
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Get a user's collection of brawlers and pins
router.post<{}, {}, TokenReqBody>("/collection", databaseErrorHandler<TokenReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    const username = validateToken(req.body.token);

    if (username !== ""){
        // beforeUpdate contains at least as much information as necessary here
        // This is used to avoid creating another database query function that is
        // very similar to an existing one.
        const results = await beforeUpdate({username: username});

        let collectionData: DatabaseBrawlers;
        try{
            collectionData = parseBrawlers(results[0].brawlers);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        const collection = formatCollectionData(collectionData);
        res.json(collection);
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// Opens a brawl box and returns the results to the user
router.post<{}, {}, BrawlBoxReqBody>("/brawlbox", databaseErrorHandler<BrawlBoxReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }

    // If the user does not specify a box type, send all the available boxes
    // If they do specify a box type, check to make sure that box actually exists.
    if (typeof req.body.boxType !== "string"){
        // Format it in an array when sending to the user
        let brawlBoxList: BrawlBoxPreview[] = [];
        brawlBoxTypes.forEach((value, key) => {
            let thisBox: BrawlBoxPreview = {
                name: key,
                displayName: value.displayName,
                cost: value.cost,
                image: RESOURCE_IMAGE_DIR + value.image + IMAGE_FILE_EXTENSION,
                description: value.description,
                dropsDescription: value.dropsDescription,
            };
            // The user does not need to know the drops and rewardTypes values
            brawlBoxList.push(thisBox);
        });

        res.json(brawlBoxList);
        return;        
    }

    const username = validateToken(req.body.token);
    const boxType = req.body.boxType;

    if (brawlBoxTypes.has(boxType) === false){
        res.status(400).send("Box type does not exist.");
        return;
    }
    // From here on, the brawl box type is guaranteed to exist in the map

    if (username !== ""){
        // getResources contains at least enough information as necessary here
        const results = await getResources({username: username});
        
        // results.length === 0 checked

        if (results[0].tokens < brawlBoxTypes.get(boxType)!.cost){
            res.status(403).send("You cannot afford to open this Box!");
            return;
        }

        let resources: UserResources = {
            brawlers: new Map<string, Map<string, number>>(),
            avatars: [],
            wild_card_pins: [],
            tokens: results[0].tokens,
            token_doubler: results[0].token_doubler,
            coins: results[0].coins,
            trade_credits: results[0].trade_credits
        };

        try{
            resources.brawlers = parseBrawlers(results[0].brawlers);
            resources.avatars = parseStringArray(results[0].avatars);
            resources.wild_card_pins = parseNumberArray(results[0].wild_card_pins);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        //const BUL = performance.now();
        const brawlBoxContents = brawlBox(dropChances, boxType, resources);
        //const EDGRISBAD = (performance.now() - BUL);
        //console.log("YOUR PROGRAM IS",EDGRISBAD.toString(),"TIMES WORSE THAN E D G R");

        if (brawlBoxContents.length === 0){
            res.status(500).send("This Box contained a manufacturing defect.");
            return;
        }

        // The "stringify" function already sorts the brawlers' names

        const updateResults = await afterBrawlBox({
            brawlers: stringifyBrawlers(resources.brawlers),
            avatars: JSON.stringify(resources.avatars),
            wild_card_pins: JSON.stringify(resources.wild_card_pins),
            tokens: resources.tokens,
            token_doubler: resources.token_doubler,
            coins: resources.coins,
            trade_credits: resources.trade_credits,
            username: username
        });

        // updateResults.affectedRows === 0 checked

        // brawl box contents already have image file paths added
        res.json(brawlBoxContents);
    } else{
        res.status(401).send("Invalid token.");
    }
}));

// View or buy item(s) from the (coins) shop
router.post<{}, {}, ShopReqBody>("/shop", databaseErrorHandler<ShopReqBody>(async (req, res) => {
    if (typeof req.body.token !== "string"){
        res.status(400).send("Token is missing.");
        return;
    }
    if (shopItems.size === 0){
        res.status(500).send("No items currently available for sale.");
        return;
    }

    const username = validateToken(req.body.token);

    if (username !== ""){
        const results = await beforeShop({username: username});

        // results.length === 0 checked

        let userBrawlers: DatabaseBrawlers;
        let userAvatars: DatabaseAvatars;
        let userThemes: DatabaseThemes;
        let userScenes: DatabaseScenes;
        let userCoins = results[0].coins;
        let featuredItem = results[0].featured_item;
        let userTradeCredits = results[0].trade_credits;
        try{
            userBrawlers = parseBrawlers(results[0].brawlers);
            userAvatars = parseStringArray(results[0].avatars);
            userThemes = parseStringArray(results[0].themes);
            userScenes = parseStringArray(results[0].scenes);
        } catch (error){
            res.status(500).send("Collection data could not be loaded.");
            return;
        }

        // Determine whether the featured item should be refreshed
        let currentTime = Date.now();
        let currentSeasonTime = realToTime(currentTime);

        let refreshed = false;

        let hoursSinceLastLogin = (currentTime - results[0].last_login) / 3600000;
        if (hoursSinceLastLogin >= MAP_CYCLE_HOURS){
            refreshed = true;
        } else{
            //currentSeasonTime = new maps.SeasonTime(1, 219, 0, 0);
            let currentSeason = currentSeasonTime.season;
            let currentHour = currentSeasonTime.hour;

            let lastLoginTime = realToTime(results[0].last_login);
            //lastLoginTime = new maps.SeasonTime(0, 327, 0, 0);
            let lastLoginHour = lastLoginTime.hour;

            
            // Explanation for the different cases is in claimtokens
            let seasonDiff = currentSeason - lastLoginTime.season;
            if (seasonDiff > 0){
                currentSeason -= seasonDiff;
                currentHour += currentSeasonTime.hoursPerSeason * seasonDiff;
            } else if (seasonDiff < 0){
                currentSeason -= seasonDiff;
                currentHour += currentSeasonTime.hoursPerSeason * mod(seasonDiff, currentSeasonTime.maxSeasons);
            } else if (currentHour < lastLoginHour){
                currentHour += currentSeasonTime.hoursPerSeason * currentSeasonTime.maxSeasons;
            }

            if (Math.floor(currentHour / FEATURED_REFRESH_HOURS) * FEATURED_REFRESH_HOURS > lastLoginHour){
                refreshed = true;
            }
        }

        if (refreshed === true){
            let newFeaturedItem = refreshFeaturedItem(userBrawlers);
            if (newFeaturedItem !== ""){
                featuredItem = newFeaturedItem;
            }
        }


        let shopItemsCopy: ShopList = new Map<string, ShopItem>();
        shopItems.forEach((value, key) => {
            shopItemsCopy.set(key, value);
        });

        // Get the coin costs for the featured pin
        let featuredCosts: number[] = [];
        if (typeof dropChances.rewardTypes.get("pinNoDupes") !== "undefined"){
            const rewardType = dropChances.rewardTypes.get("pinNoDupes")!;
            if (isRewardTypePin(rewardType)){
                featuredCosts = rewardType.coinConversion;
            }
        }

        // Out of all the shop items, remove all of them that the user cannot buy right now
        const availableShopItems = getShopItems(
            shopItemsCopy,
            userBrawlers,
            {
                avatars: userAvatars,
                themes: userThemes,
                scenes: userScenes
            },
            featuredItem,
            featuredCosts
        );

        // If they do not provide an item to buy, show all items
        if (typeof req.body.item !== "string"){
            let shopItemList: ShopItemPreview[] = [];
            availableShopItems.forEach((value, key) => {
                let itemPreview: ShopItemPreview = {
                    name: key,
                    displayName: value.displayName,
                    cost: value.cost,
                    image: "",
                    amount: value.amount,
                    description: value.description
                };
                // The user does not need to know about itemType and extraData
                const thisItemType = value.itemType;

                // Avatars have their image stored in extraData because the image is required
                // when adding it to the user's inventory
                // All other item types' images are only for display
                if (thisItemType === "avatar"){
                    itemPreview.image = AVATAR_SPECIAL_DIR + value.extraData + IMAGE_FILE_EXTENSION;
                } else if (thisItemType === "theme"){
                    const themeName = value.extraData;
                    if (themeMap.has(themeName) === true){
                        itemPreview.displayName = themeMap.get(themeName)!;
                    }
                    itemPreview.image = THEME_SPECIAL_DIR + themeName + "_preview" + IMAGE_FILE_EXTENSION;
                } else if (thisItemType === "scene"){
                    const sceneName = value.extraData;
                    if (sceneMap.has(sceneName) === true){
                        itemPreview.displayName = sceneMap.get(sceneName)!.displayName;
                        itemPreview.image = sceneMap.get(sceneName)!.preview + IMAGE_FILE_EXTENSION;
                    }
                } else if (thisItemType === "featuredPin"){
                    // Featured pin already has the image extension since it is stored in brawlers data
                    itemPreview.image = PIN_IMAGE_DIR + value.image;
                } else{
                    // Only add the image directory if the image is not empty string
                    if (value.image !== ""){
                        itemPreview.image = RESOURCE_IMAGE_DIR + value.image + IMAGE_FILE_EXTENSION;
                    }
                }

                shopItemList.push(itemPreview);
            });


            const updateResults = await updateFeaturedItem({
                last_login: currentTime,
                featured_item: featuredItem,
                username: username
            });

            // updateResults.affectedRows === 0 checked

            res.json(shopItemList);
            return;
        }


        // All code below is for when the user does provide an item to buy
        if (availableShopItems.has(req.body.item) === false){
            res.status(404).send("Item is not currently available.");
            return;
        }

        // This object contains all the data of the item the user is currently buying
        // Keys of availableShopItems and shopItemsCopy are the same except
        // availableShopItems is modified to include data sent to the user, since
        // the actual item data is required here, use shopItemsCopy instead
        const itemData = shopItemsCopy.get(req.body.item);

        if (typeof itemData === "undefined"){
            res.status(404).send("Item is not currently available.");
            return;
        }

        if (userCoins < itemData.cost){
            res.status(403).send("You cannot afford this item!");
            return;
        }

        // All costs in this shop are in coins
        userCoins -= itemData.cost;

        // Add the item to the user's inventory
        // Do a different operation based on the type of the item
        // Later, buyItemResult may contain more than just brawl box results
        // so update the type////////////////////////////////////////////
        let buyItemResult: BrawlBoxDrop[] = [];
        let userItemInventory = 0;
        if (itemData.itemType === "tradeCredits"){
            userTradeCredits += itemData.amount;
            userItemInventory = userTradeCredits;
        } else if (itemData.itemType === "avatar" || itemData.itemType === "achievementAvatar"){
            userAvatars.push(itemData.extraData);
            userItemInventory = 1;
        } else if (itemData.itemType === "theme"){
            userThemes.push(itemData.extraData);
            userItemInventory = 1;
        } else if (itemData.itemType === "scene"){
            userScenes.push(itemData.extraData);
            userItemInventory = 1;
        } else if (itemData.itemType === "brawler"){
            // The brawl box opener needs a resources object so provide a temporary object
            // with some of the fields set to default values
            let tempResourceObject: UserResources = {
                brawlers: userBrawlers,
                avatars: userAvatars,
                wild_card_pins: [],
                tokens: 0,
                token_doubler: 0,
                coins: userCoins,
                trade_credits: userTradeCredits
            }
            //buyItemResult = brawlBox(dropChances, "newBrawler", allSkins, tempResourceObject, IMAGE_FILE_EXTENSION);
            buyItemResult = brawlBox(dropChances, "newBrawler", tempResourceObject);

            if (buyItemResult.length > 0){
                userItemInventory = 1;
                // The "stringify" function already sorts the brawlers' names
            }
        } else if (itemData.itemType === "featuredPin"){
            // The extraData of the itemData has already been checked when getting shop items
            // so this is guaranteed to be a valid brawler and pin name. It just has to check
            // whether the user already owns the pin or not then modify their collection.

            const pinName = itemData.extraData.split("/");
            // Index 0 is the brawler, index 1 is the pin

            if (userBrawlers.has(pinName[0]) === true){
                const brawler = userBrawlers.get(pinName[0])!;
                if (brawler.has(pinName[1]) === true){
                    // User already has the pin
                    const pinAmount = brawler.get(pinName[1])!;
                    brawler.set(pinName[1], pinAmount + itemData.amount);
                } else{
                    // User does not have the pin yet
                    brawler.set(pinName[1], itemData.amount);
                }
                // This is not undefined because both cases of pin exists in
                // brawler map were already checked and if the key was not there
                // then it was added.
                userItemInventory = brawler.get(pinName[1])!;

                // The featured item can only be bought once per day
                featuredItem = "";
                console.log(featuredItem);
            }
        }

        // Write back to the database after all values have been modified
        const updateResults = await afterShop({
            last_login: currentTime,
            coins: userCoins,
            trade_credits: userTradeCredits,
            brawlers: stringifyBrawlers(userBrawlers),
            avatars: JSON.stringify(userAvatars),
            themes: JSON.stringify(userThemes),
            scenes: JSON.stringify(userScenes),
            featured_item: featuredItem,
            username: username
        });

        // updateResults.affectedRows === 0 checked

        res.json({
            inventory: userItemInventory,
            result: buyItemResult
        });
    } else{
        res.status(401).send("Invalid token.");
    }
}));

export default router;
