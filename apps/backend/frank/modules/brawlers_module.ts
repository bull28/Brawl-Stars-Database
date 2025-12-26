import allSkins from "../data/brawlers_data.json";
import skinGroups from "../data/skingroups_data.json";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, MASTERY_ICON_DIR, CURRENCY_IMAGE_DIR, REWARD_IMAGE_DIR} from "../data/constants";
import {findName} from "./utils";
import {BrawlerPreview, BrawlerData, SkinCost, SkinData, SkinSearchGroup, SkinSearchFilters, SkinSearchResult} from "../types";

type Brawler = typeof allSkins[number];
type Skin = typeof allSkins[number]["skins"][number];
type SkinGroupKey = keyof typeof skinGroups;

const indexMap = new Map<string, number>();
for (let x = 0; x < allSkins.length; x++){
    indexMap.set(allSkins[x].name, x);
}

const skinCurrencies: Record<string, {name: string; image: string;}> = {
    "Gems": {name: "Gems", image: "icon_gems" + IMAGE_FILE_EXTENSION},
    "Coins": {name: "Coins", image: "icon_coins" + IMAGE_FILE_EXTENSION},
    "ClubCoins": {name: "Club Coins", image: "icon_clubcoins" + IMAGE_FILE_EXTENSION},
    "Bling": {name: "Bling", image: "icon_bling" + IMAGE_FILE_EXTENSION}
};

export const rarities = {
    brawlers: [
        {value: 0, name: "Starting Brawler", color: "#94d6f4"},
        {value: 1, name: "Rare", color: "#2edd1b"},
        {value: 2, name: "Super Rare", color: "#0087fa"},
        {value: 3, name: "Epic", color: "#b116ec"},
        {value: 4, name: "Mythic", color: "#fe0521"},
        {value: 5, name: "Legendary", color: "#fdf11e"},
        {value: 6, name: "Ultra Legendary", color: "#7afd6b"},
        {value: 7, name: "Chromatic", color: "#f87628"}
    ],
    skins: [
        {value: 0, name: "", icon: ""},
        {value: 1, name: "Rare", icon: "skin_rarity_1"},
        {value: 2, name: "Super Rare", icon: "skin_rarity_2"},
        {value: 3, name: "Epic", icon: "skin_rarity_3"},
        {value: 4, name: "Mythic", icon: "skin_rarity_4"},
        {value: 5, name: "Legendary", icon: "skin_rarity_5"},
        {value: 6, name: "Hypercharge", icon: "skin_rarity_6"},
        {value: 7, name: "Pro", icon: "skin_rarity_7"},
        {value: 8, name: "Collectors", icon: ""}
    ],
    pins: [
        {value: 0, name: "Common", color: "#94d6f4"},
        {value: 1, name: "Rare", color: "#2edd1b"},
        {value: 2, name: "Epic", color: "#b116ec"},
        {value: 3, name: "Legendary", color: "#fdf11e"},
        {value: 4, name: "Custom", color: "#f87628"}
    ]
};

export function getBrawler(name: string): Brawler | undefined{
    const index = findName(allSkins, name, indexMap);
    if (index < 0){
        return undefined;
    }
    return allSkins[index];
}

export function getSkin(brawler: Brawler, skinName: string): Skin | undefined{
    const index = findName(brawler.skins, skinName);
    if (index < 0){
        return undefined;
    }
    return brawler.skins[index];
}

export function getBrawlerList(): BrawlerPreview[]{
    const allBrawlers: BrawlerPreview[] = [];
    const maxRarity = rarities.brawlers.length - 1;

    for (let x = 0; x < allSkins.length; x++){
        const brawler = allSkins[x];
        const rarity = rarities.brawlers[Math.min(maxRarity, brawler.rarity)];
        allBrawlers.push({
            name: brawler.name,
            displayName: brawler.displayName,
            rarity: {
                value: rarity.value,
                name: rarity.name,
                color: rarity.color
            },
            image: PORTRAIT_IMAGE_DIR + brawler.image
        });
    }

    return allBrawlers;
}

/**
 * Adds all the necessary file paths to any images in a brawler's data. Also adds an array containing the names and
 * display names of the brawler's skins. This function adds all necessary file paths.
 * @param brawler brawler to get data for
 * @returns copy of the brawler data
 */
export function getBrawlerData(brawler: Brawler): BrawlerData{
    const brawlerSkins: BrawlerData["skins"] = [];

    let brawlerName = "";
    if (Object.hasOwn(brawler, "name") === true){
        brawlerName = brawler.name;
    }

    if (Object.hasOwn(brawler, "skins") === true){
        for (let x = 0; x < brawler.skins.length; x++){
            const thisBrawler = brawler.skins[x];
            brawlerSkins.push({
                name: thisBrawler.name,
                displayName: thisBrawler.displayName,
            });
        }
    }

    const brawlerRarity = rarities.brawlers[Math.min(rarities.brawlers.length - 1, brawler.rarity)];
    const maxPinRarity = rarities.pins.length - 1;

    const brawlerPins: BrawlerData["pins"] = [];
    if (Object.hasOwn(brawler, "pins") === true){
        for (let x = 0; x < brawler.pins.length; x++){
            const thisPin = brawler.pins[x];
            const rarity = rarities.pins[Math.min(maxPinRarity, thisPin.rarity)];
            brawlerPins.push({
                image: `${PIN_IMAGE_DIR}${brawlerName}/${thisPin.name}${IMAGE_FILE_EXTENSION}`,
                rarity: {
                    value: rarity.value,
                    name: rarity.name,
                    color: rarity.color
                }
            });
        }
    }

    const brawlerData: BrawlerData = {
        name: brawler.name,
        displayName: brawler.displayName,
        rarity: {
            value: brawlerRarity.value,
            name: brawlerRarity.name,
            color: brawlerRarity.color
        },
        description: brawler.description,
        image: PORTRAIT_IMAGE_DIR + brawler.image,
        defaultSkin: brawler.defaultSkin,
        title: brawler.title,
        masteryIcon: MASTERY_ICON_DIR + brawler.masteryIcon,
        skins: brawlerSkins,
        pins: brawlerPins
    };

    return brawlerData;
}

/**
 * Adds all the necessary file paths to any images in a skin's data. This function adds all necessary file paths.
 * @param skin skin to get data for
 * @param brawlerName name of the brawler that the skin belongs to
 * @returns copy of the skin data
 */
export function getSkinData(skin: Skin, brawlerName: string): SkinData{
    const skinFeatures: Skin["features"] = [];
    for (let x = 0; x < skin.features.length; x++){
        skinFeatures.push(skin.features[x]);
    }

    const skinRarity = rarities.skins[Math.min(rarities.skins.length - 1, skin.rarity)];

    const groups: SkinData["groups"] = [];
    for (let x = 0; x < skin.groups.length; x++){
        if (Object.hasOwn(skinGroups, skin.groups[x]) === true){
            const groupValue = skinGroups[skin.groups[x] as SkinGroupKey];
            groups.push({
                name: groupValue.name,
                image: SKINGROUP_IMAGE_DIR + groupValue.image + IMAGE_FILE_EXTENSION,
                icon: SKINGROUP_ICON_DIR + groupValue.icon + IMAGE_FILE_EXTENSION
            });
        }
    }

    const mainCurrency: SkinCost = {amount: skin.cost, currency: "", icon: ""};
    const blingCurrency: SkinCost = {
        amount: skin.costBling,
        currency: skinCurrencies["Bling"].name,
        icon: CURRENCY_IMAGE_DIR + skinCurrencies["Bling"].image
    };
    if (Object.hasOwn(skinCurrencies, skin.currency) === true){
        mainCurrency.currency = skinCurrencies[skin.currency].name;
        mainCurrency.icon = CURRENCY_IMAGE_DIR + skinCurrencies[skin.currency].image;
    }

    const skinData: SkinData = {
        name: skin.name,
        displayName: skin.displayName,
        cost: mainCurrency,
        costBling: blingCurrency,
        rarity: {
            value: skinRarity.value,
            name: skinRarity.name,
            icon: skinRarity.icon !== "" ? REWARD_IMAGE_DIR + skinRarity.icon + IMAGE_FILE_EXTENSION : ""
        },
        requires: skin.requires,
        features: skinFeatures,
        groups: groups,
        limited: skin.limited,
        unlock: skin.unlock,
        foundIn: skin.foundIn,
        release: {
            month: skin.release[1],
            year: skin.release[0]
        },
        rating: skin.rating,
        image: `${SKIN_IMAGE_DIR}${brawlerName}/${skin.name}${IMAGE_FILE_EXTENSION}`
    };

    return skinData;
}

/**
 * Checks whether a skin matches a given filter and should be included in the skin search results.
 * @param skin skin to check
 * @param filters filter to match
 * @returns whether to include the skin in the results
 */
function skinMatchesFilters(skin: Skin, filters: SkinSearchFilters): boolean{
    if (filters === undefined){
        return true;
    }
    const {query, rarity, minCost, maxCost, groups, foundIn, bling, limited, startDate, endDate} = filters;

    if (rarity !== undefined && skin.rarity !== rarity){
        return false;
    }
    if (minCost !== undefined && skin.cost < minCost){
        return false;
    }
    if (maxCost !== undefined && skin.cost > maxCost){
        return false;
    }
    if (groups !== undefined){
        let hasGroup = false;
        for (let x = 0; x < skin.groups.length; x++){
            if (groups.includes(skin.groups[x]) === true){
                hasGroup = true;
            }
        }
        if (hasGroup === false){
            return false;
        }
    }
    if (foundIn !== undefined && skin.foundIn.includes(foundIn) === false){
        return false;
    }
    if (bling !== undefined && skin.costBling > 0 !== bling){
        return false;
    }
    if (limited !== undefined && skin.limited !== limited){
        return false;
    }
    if (startDate !== undefined){
        if (skin.release[0] * 12 + skin.release[1] < startDate.year * 12 + startDate.month){
            return false;
        }
    }
    if (endDate !== undefined){
        if (skin.release[0] * 12 + skin.release[1] > endDate.year * 12 + endDate.month){
            return false;
        }
    }
    if (query !== undefined && skin.displayName.toLowerCase().includes(query.toLowerCase()) === false){
        return false;
    }

    return true;
}

export function getSkinGroupList(): SkinSearchGroup[]{
    const groups: SkinSearchGroup[] = [];
    for (const x in skinGroups){
        const groupValue = skinGroups[x as SkinGroupKey];
        groups.push({
            name: x,
            displayName: x === "ranked" ? "Power League " : groupValue.name
        });
    }
    return groups;
}

export function getSkinSources(): string[]{
    const rewards = new Set<string>();
    for (let i = 0; i < allSkins.length; i++){
        const brawler = allSkins[i];
        for (let j = 0; j < brawler.skins.length; j++){
            const skin = brawler.skins[j];
            for (let r = 0; r < skin.foundIn.length; r++){
                rewards.add(skin.foundIn[r]);
            }
        }
    }
    return Array.from(rewards);
}

export function skinSearch(filters: SkinSearchFilters): SkinSearchResult[]{
    const results: SkinSearchResult[] = [];

    for (let i = 0; i < allSkins.length; i++){
        const brawler = allSkins[i];
        for (let j = 0; j < brawler.skins.length; j++){
            const skin = brawler.skins[j];

            if (skinMatchesFilters(skin, filters) === true && skin.name !== brawler.defaultSkin){
                let background = "";
                if (skin.groups.length > 0 && Object.hasOwn(skinGroups, skin.groups[0]) === true){
                    background = skinGroups[skin.groups[0] as SkinGroupKey].image + IMAGE_FILE_EXTENSION;
                }
                results.push({
                    name: skin.name,
                    brawler: brawler.name,
                    displayName: skin.displayName,
                    image: skin.name + IMAGE_FILE_EXTENSION,
                    background: background
                });
            }
        }
    }

    return results;
}
