import {PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKIN_MODEL_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, SKIN_RARITY_ICON_DIR, MASTERY_ICON_DIR} from "../data/constants";
import {Brawler, Skin, BrawlerData, ModelData, SkinData, SkinSearchFilters, SkinSearchResult} from "../types";

function skinModelExists(brawlerName: string, model: ModelData): ModelData{
    let key: keyof ModelData;
    for (key in model){
        if (model[key].path !== ""){
            model[key].exists = true;
            model[key].path = `${SKIN_MODEL_DIR}${brawlerName}/${model[key].path}`;
        } else{
            model[key].exists = false;
        }
    }
    return model;
}

export function getBrawler(allSkins: Brawler[], name: string): Brawler | undefined{
    for (let x = 0; x < allSkins.length; x++){
        if (Object.hasOwn(allSkins[x], "name") === true){
            if (allSkins[x].name === name){
                return allSkins[x];
            }
        }
    }
    return undefined;
}

export function getSkin(brawler: Brawler, skinName: string): Skin | undefined{
    if (Object.hasOwn(brawler, "skins") === true){
        for (let x = 0; x < brawler.skins.length; x++){
            if (Object.hasOwn(brawler.skins[x], "name") === true){
                if (brawler.skins[x].name === skinName){
                    return brawler.skins[x];
                }
            }
        }
    }
    return undefined;
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

    const brawlerPins: BrawlerData["pins"] = [];
    if (Object.hasOwn(brawler, "pins") === true){
        for (let x = 0; x < brawler.pins.length; x++){
            const thisPin = brawler.pins[x];
            brawlerPins.push({
                image: `${PIN_IMAGE_DIR}${brawlerName}/${thisPin.image}`,
                rarity: {
                    value: thisPin.rarity.value,
                    name: thisPin.rarity.name,
                    color: thisPin.rarity.color
                }
            });
        }
    }

    const brawlerData: BrawlerData = {
        name: brawler.name,
        displayName: brawler.displayName,
        rarity: {
            value: brawler.rarity.value,
            name: brawler.rarity.name,
            color: brawler.rarity.color
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

    const skinGroups: Skin["groups"] = [];
    for (let x = 0; x < skin.groups.length; x++){
        skinGroups.push({
            name: skin.groups[x].name,
            image: SKINGROUP_IMAGE_DIR + skin.groups[x].image,
            icon: SKINGROUP_ICON_DIR + skin.groups[x].icon
        });
    }

    const skinData: SkinData = {
        name: skin.name,
        displayName: skin.displayName,
        cost: skin.cost,
        currency: skin.currency,
        costBling: skin.costBling,
        rarity: {
            value: skin.rarity.value,
            name: skin.rarity.name,
            icon: skin.rarity.icon !== "" ? SKIN_RARITY_ICON_DIR + skin.rarity.icon : ""
        },
        requires: skin.requires,
        features: skinFeatures,
        groups: skinGroups,
        limited: skin.limited,
        unlock: skin.unlock,
        release: {
            month: skin.release.month,
            year: skin.release.year
        },
        rating: skin.rating,
        image: `${SKIN_IMAGE_DIR}${brawlerName}/${skin.image}`,
        model: skinModelExists(brawlerName, {
            geometry: {
                exists: false,
                path: skin.model.geometry
            },
            winAnimation: {
                exists: false,
                path: skin.model.winAnimation
            },
            loseAnimation: {
                exists: false,
                path: skin.model.loseAnimation
            }
        })
    }

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
    const {query, rarity, minCost, maxCost, groups, bling, limited, startDate, endDate} = filters;

    if (rarity !== undefined && skin.rarity.value !== rarity){
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
            if (groups.includes(skin.groups[x].name) === true){
                hasGroup = true;
            }
        }
        if (hasGroup === false){
            return false;
        }
    }
    if (bling !== undefined && skin.costBling > 0 !== bling){
        return false;
    }
    if (limited !== undefined && skin.limited !== limited){
        return false;
    }
    if (startDate !== undefined){
        if (skin.release.year * 12 + skin.release.month < startDate.year * 12 + startDate.month){
            return false;
        }
    }
    if (endDate !== undefined){
        if (skin.release.year * 12 + skin.release.month > endDate.year * 12 + endDate.month){
            return false;
        }
    }
    if (query !== undefined && skin.displayName.toLowerCase().includes(query.toLowerCase()) === false){
        return false;
    }

    return true;
}

export function skinSearch(allSkins: Brawler[], filters: SkinSearchFilters): SkinSearchResult[]{
    const results: SkinSearchResult[] = [];

    for (let i = 0; i < allSkins.length; i++){
        const brawler = allSkins[i];
        for (let j = 0; j < brawler.skins.length; j++){
            const skin = brawler.skins[j];

            if (skinMatchesFilters(skin, filters) === true && skin.name !== brawler.defaultSkin){
                results.push({
                    name: skin.name,
                    brawler: brawler.name,
                    displayName: skin.displayName,
                    image: skin.image,
                    background: skin.groups.length > 0 ? skin.groups[0].image : ""
                });
            }
        }
    }

    return results;
}
