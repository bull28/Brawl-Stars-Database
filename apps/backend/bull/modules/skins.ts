import fs from "fs";
import {ASSETS_ROOT_DIR, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKIN_MODEL_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, MASTERY_IMAGE_DIR} from "../data/constants";
import {Brawler, Skin, BrawlerData, SkinData, ModelData} from "../types";

function skinModelExists(model: ModelData): ModelData{
    let key: keyof ModelData;
    for (key in model){
        model[key].exists = fs.existsSync(ASSETS_ROOT_DIR + model[key].path);
        if (model[key].exists === false){
            model[key].path = "";
        }
    }
    return model;
}

export function getBrawler(allSkins: Brawler[], name: string): Brawler | undefined{
    for (let x = 0; x < allSkins.length; x++){
        if (allSkins[x].hasOwnProperty("name") === true){
            if (allSkins[x].name === name){
                return allSkins[x];
            }
        }
    }
    return undefined;
}

export function getSkin(brawler: Brawler, skinName: string): Skin | undefined{
    if (brawler.hasOwnProperty("skins") === true){
        for (let x = 0; x < brawler.skins.length; x++){
            if (brawler.skins[x].hasOwnProperty("name") === true){
                if (brawler.skins[x].name === skinName){
                    return brawler.skins[x];
                }
            }
        }
    }
    return undefined;
}

/**
 * Adds all the necessary file paths to any images in a
 * brawler's data. Also adds an array containing the names
 * and display names of the brawler's skins. This function
 * also adds all necessary file paths.
 * @param brawler brawler to get data for
 * @returns copy of the brawler data
 */
export function getBrawlerData(brawler: Brawler): BrawlerData{
    let brawlerSkins: BrawlerData["skins"] = [];

    let brawlerName = "";
    if (brawler.hasOwnProperty("name") === true){
        brawlerName = brawler.name;
    }

    if (brawler.hasOwnProperty("skins") === true){
        for (let x = 0; x < brawler.skins.length; x++){
            const thisBrawler = brawler.skins[x];
            brawlerSkins.push({
                name: thisBrawler.name,
                displayName: thisBrawler.displayName,
            });
        }
    }

    let brawlerPins: BrawlerData["pins"] = [];
    if (brawler.hasOwnProperty("pins") === true){
        for (let x = 0; x < brawler.pins.length; x++){
            const thisPin = brawler.pins[x];
            brawlerPins.push({
                image: PIN_IMAGE_DIR + brawlerName + "/" + thisPin.image,
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
        masteryIcon: MASTERY_IMAGE_DIR + brawler.masteryIcon,
        skins: brawlerSkins,
        pins: brawlerPins
    };

    return brawlerData;
}

/**
 * Adds all the necessary file paths to any images in a skin's data.
 * This function also adds all necessary file paths.
 * @param skin skin to get data for
 * @param brawlerName name of the brawler that the skin belongs to
 * @returns copy of the skin data
 */
export function getSkinData(skin: Skin, brawlerName: string): SkinData{
    let skinFeatures: Skin["features"] = [];
    for (let x = 0 ; x < skin.features.length; x++){
        skinFeatures.push(skin.features[x]);
    }

    const skinData: SkinData = {
        name: skin.name,
        displayName: skin.displayName,
        cost: skin.cost,
        currency: skin.currency,
        costBling: skin.costBling,
        requires: skin.requires,
        features: skinFeatures,
        group: {
            name: skin.group.name,
            image: SKINGROUP_IMAGE_DIR + skin.group.image,
            icon: SKINGROUP_ICON_DIR + skin.group.icon,
        },
        limited: skin.limited,
        rating: skin.rating,
        image: SKIN_IMAGE_DIR + brawlerName + "/" + skin.image,
        model: skinModelExists({
            geometry: {
                exists: false,
                path: SKIN_MODEL_DIR + brawlerName + "/" + skin.model.geometry
            },
            winAnimation: {
                exists: false,
                path: SKIN_MODEL_DIR + brawlerName + "/" + skin.model.winAnimation
            },
            loseAnimation: {
                exists: false,
                path: SKIN_MODEL_DIR + brawlerName + "/" + skin.model.loseAnimation
            }
        })
    }

    return skinData;
}
