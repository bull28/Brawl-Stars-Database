import express from "express";
import {AVATAR_IMAGE_DIR, FEATURED_REFRESH_HOURS, IMAGE_FILE_EXTENSION} from "../data/constants";
import {rarityNames} from "../modules/rewards";
import brawlBox, {boxList, canOpenBox} from "../modules/brawlbox";
import {formatCollectionData} from "../modules/pins";
import {getAllItems, getAllItemsPreview, refreshFeaturedItem, getAchievementItems} from "../modules/shop";
import {MAP_CYCLE_HOURS, mod, realToTime} from "../modules/maps";
import {
    loginErrorHandler, 
    parseBrawlers, 
    parseNumberArray, 
    parseStringArray, 
    stringifyBrawlers, 
    afterShop, 
    beforeShop, 
    beforeUpdate, 
    getResources, 
    setResources, 
    updateFeaturedItem
} from "../modules/database";
import {Empty, TokenReqBody, UserResources} from "../types";

const router = express.Router();


// Type of wild card data sent to the user
interface WildCardData{
    rarityName: string;
    rarityColor: string;
    amount: number;
}

interface BrawlBoxReqBody extends TokenReqBody{
    boxType: string;
}

interface ShopReqBody extends TokenReqBody{
    item: string;
}


// Get a user's username and amounts of various resources
router.post<Empty, Empty, TokenReqBody>("/resources", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    const results = await getResources({username: username});

    //const level = results[0].level;
    //const requiredPoints = getRequiredPoints(level);
    const level = 1;
    const requiredPoints = 1;
    let points = results[0].points;

    if (requiredPoints >= 1){
        points = Math.min(points, requiredPoints - 1);
    }

    const wildCards: number[] = parseNumberArray(results[0].wild_card_pins);
    const collection = formatCollectionData(parseBrawlers(results[0].brawlers), parseStringArray(results[0].accessories));

    const wildCardPins: WildCardData[] = [];

    for (let x = 0; x < wildCards.length; x++){
        const rarity = rarityNames.get(x);
        if (rarity !== undefined){
            wildCardPins.push({
                rarityName: rarity.name,
                rarityColor: rarity.color,
                amount: wildCards[x]
            });
        } else{
            wildCardPins.push({
                rarityName: "",
                rarityColor: "#000000",
                amount: wildCards[x]
            });
        }
    }

    // If there are no pins of a specific rarity, the rarity name in wildCardPins will be empty. This is fine because
    // wild card pins of that rarity have no use since there are no pins of that rarity that exist.

    res.json({
        username: username,
        avatar: AVATAR_IMAGE_DIR + results[0].active_avatar + IMAGE_FILE_EXTENSION,
        avatarColor: collection.avatarColor,
        tokens: results[0].tokens,
        tokenDoubler: results[0].token_doubler,
        coins: results[0].coins,
        level: level,
        points: points,
        upgradePoints: requiredPoints,
        tradeCredits: results[0].trade_credits,
        wildCardPins: wildCardPins
    });
}));

// Get a user's collection of brawlers and pins
router.post<Empty, Empty, TokenReqBody>("/collection", loginErrorHandler<TokenReqBody>(async (req, res, username) => {
    // beforeUpdate contains at least as much information as necessary here.
    // This is used to avoid creating another database query function that is very similar to an existing one.
    const results = await beforeUpdate({username: username});

    const collection = formatCollectionData(parseBrawlers(results[0].brawlers), parseStringArray(results[0].accessories));
    res.json(collection);
}));

// Opens a brawl box and returns the results to the user
router.post<Empty, Empty, BrawlBoxReqBody>("/brawlbox", loginErrorHandler<BrawlBoxReqBody>(async (req, res, username) => {
    // If the user does not specify a box type, send all the available boxes.
    // If they do specify a box type, check to make sure that box actually exists.
    if (typeof req.body.boxType !== "string"){
        res.json(boxList);
        return;
    }

    const boxType = req.body.boxType;

    // getResources contains at least enough information as necessary here
    const results = await getResources({username: username});

    // results.length === 0 checked

    // Make sure the box exists and the user has enough tokens
    const validBoxCode = canOpenBox(boxType, results[0].tokens);
    if (validBoxCode === 400){
        res.status(400).send("Box type does not exist.");
        return;
    }
    if (validBoxCode === 403){
        res.status(403).send("You cannot afford to open this Box!");
        return;
    }

    const resources: UserResources = {
        brawlers: parseBrawlers(results[0].brawlers),
        avatars: parseStringArray(results[0].avatars),
        themes: parseStringArray(results[0].themes),
        scenes: [],
        accessories: [],
        wild_card_pins: parseNumberArray(results[0].wild_card_pins),
        tokens: results[0].tokens,
        token_doubler: results[0].token_doubler,
        coins: results[0].coins,
        points: results[0].points,
        trade_credits: results[0].trade_credits
    };

    const brawlBoxContents = brawlBox(boxType, resources);

    if (brawlBoxContents.length === 0){
        // Any Brawl Box available from this endpoint should always contain at least one item
        res.status(500).send("This Brawl Box contained a manufacturing defect.");
        return;
    }

    // The "stringify" function already sorts the brawlers' names

    await setResources({
        brawlers: stringifyBrawlers(resources.brawlers),
        avatars: JSON.stringify(resources.avatars),
        wild_card_pins: JSON.stringify(resources.wild_card_pins),
        tokens: resources.tokens,
        token_doubler: resources.token_doubler,
        coins: resources.coins,
        trade_credits: resources.trade_credits,
        points: results[0].points,
        themes: results[0].themes,
        scenes: results[0].scenes,
        accessories: results[0].accessories,
        username: username
    });

    // updateResults.affectedRows === 0 checked

    // brawl box contents already have image file paths added
    res.json(brawlBoxContents);
}));

// View or buy item(s) from the (coins) shop
router.post<Empty, Empty, ShopReqBody>("/shop", loginErrorHandler<ShopReqBody>(async (req, res, username) => {
    const results = await beforeShop({username: username});

    // results.length === 0 checked

    // Both the shop and Brawl Box use the same type of resource object in their inputs. Any properties of this object
    // not set to database values are not read by the shop methods and are only there to maintain a consistent type.
    const resources: UserResources = {
        brawlers: parseBrawlers(results[0].brawlers),
        avatars: parseStringArray(results[0].avatars),
        themes: parseStringArray(results[0].themes),
        scenes: parseStringArray(results[0].scenes),
        accessories: [],
        wild_card_pins: [],
        tokens: 0,
        token_doubler: 0,
        coins: results[0].coins,
        points: 0,
        trade_credits: results[0].trade_credits
    };
    // Tokens, token doubler, and wild card pins are not read by the shop methods and their values do not matter here

    let featuredItem = results[0].featured_item;
    const level = 30;

    const collection = formatCollectionData(resources.brawlers, resources.accessories);
    const achievements = getAchievementItems(resources, collection, level);


    // Determine whether the featured item should be refreshed
    const currentTime = Date.now();
    const currentSeasonTime = realToTime(currentTime);

    let refreshed = false;

    const hoursSinceLastLogin = (currentTime - results[0].last_login) / 3600000;
    if (hoursSinceLastLogin >= MAP_CYCLE_HOURS){
        refreshed = true;
    } else{
        let currentSeason = currentSeasonTime.season;
        let currentHour = currentSeasonTime.hour;

        const lastLoginTime = realToTime(results[0].last_login);
        const lastLoginHour = lastLoginTime.hour;

        // Explanation for the different cases is in claimtokens
        const seasonDiff = currentSeason - lastLoginTime.season;
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
        const newFeaturedItem = refreshFeaturedItem(resources.brawlers);
        if (newFeaturedItem !== ""){
            featuredItem = newFeaturedItem;
        }
    }


    // If they do not provide an item to buy, show all items
    if (typeof req.body.item !== "string"){
        const preview = getAllItemsPreview(resources, collection, achievements, featuredItem);

        await updateFeaturedItem({
            last_login: currentTime,
            featured_item: featuredItem,
            username: username
        });

        // updateResults.affectedRows === 0 checked

        res.json(preview);
        return;
    }

    // All code below is for when the user does provide an item to buy

    // This object contains references to all shop items that the user can buy
    const shopItems = getAllItems(resources, collection, achievements, featuredItem);

    // This object is the item the user wants to buy
    const item = shopItems.get(req.body.item);

    if (item === undefined){
        res.status(404).send("Item is not currently available.");
        return;
    }

    if (resources.coins < item.cost){
        res.status(403).send("You cannot afford this item!");
        return;
    }

    // All costs in this shop are in coins
    resources.coins -= item.cost;

    const buyItemResult = item.buyItem(resources);
    if (item.itemType === "featured" && buyItemResult[0] > 0){
        // If a featured item was successfully bought, reset the item because it should only available once per day
        featuredItem = "";
    }

    // Write back to the database after all values have been modified
    await afterShop({
        last_login: currentTime,
        coins: resources.coins,
        trade_credits: resources.trade_credits,
        brawlers: stringifyBrawlers(resources.brawlers),
        avatars: JSON.stringify(resources.avatars),
        themes: JSON.stringify(resources.themes),
        scenes: JSON.stringify(resources.scenes),
        featured_item: featuredItem,
        username: username
    });

    // updateResults.affectedRows === 0 checked

    res.json({inventory: buyItemResult[0], result: buyItemResult[1]});
}));

export default router;
