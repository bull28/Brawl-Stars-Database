import accessoryList from "../data/accessories_data.json";
import characterList from "../data/characters_data.json";
import enemyList from "../data/enemies_data.json";
import {findName} from "./utils";
import {IMAGE_FILE_EXTENSION, SKIN_IMAGE_DIR, PIN_IMAGE_DIR, MASTERY_LEVEL_DIR, TIER_IMAGE_DIR, CHARACTER_IMAGE_DIR} from "../data/constants";
import {UserCharacter, UserAccessory, MasteryData, CharacterPreview, CharacterUnlockStats, CharacterHyperStats, CharacterStatus, EnemyData} from "../types";

const indexMap = new Map<string, number>();
const badgeIndexes: number[] = [];

const tempMap = new Map<string, number>();
for (let x = 0; x < accessoryList.length; x++){
    tempMap.set(accessoryList[x].name, x);
}
for (let x = 0; x < characterList.length; x++){
    indexMap.set(characterList[x].name, x);
    badgeIndexes.push(findName(accessoryList, characterList[x].name, tempMap));
}
tempMap.clear();

const masteryLevels = [
        0, 2.0e3, 4.0e3, 7.0e3, 1.0e4,
    1.5e4, 2.0e4, 3.0e4, 4.0e4, 6.0e4,
    8.0e4, 1.2e5, 1.6e5, 2.0e5, 2.4e5,
    3.0e5, 3.6e5, 4.4e5, 5.2e5, 6.4e5,
    8.0e5, 1.0e6, 1.2e6, 1.5e6, 1.8e6,
    2.2e6, 2.6e6, 3.2e6, 4.0e6, 5.0e6,
    6.0e6, 8.0e6, 1.0e7, 1.2e7, 1.6e7,
    2.0e7, 2.5e7, 3.0e7, 3.6e7, 4.2e7,
    5.0e7
];

const prestigePoints = 1.0e7;

const levelImages = [
    {minLevel: 0, color: "#808080", textColor: "#808080", image: "mastery_dark_empty"},
    {minLevel: 1, color: "#d67d59", textColor: "#d67d59", image: "mastery_dark_level_0"},
    {minLevel: 5, color: "#ff9900", textColor: "#ffd699", image: "mastery_dark_level_1"},
    {minLevel: 10, color: "#c9c6f1", textColor: "#e9e8f9", image: "mastery_dark_level_2"},
    {minLevel: 15, color: "#ffef49", textColor: "#fff9b6", image: "mastery_dark_level_3"},
    {minLevel: 20, color: "#33ffff", textColor: "#adffff", image: "mastery_dark_level_4"},
    {minLevel: 25, color: "#ff00ff", textColor: "#ff99ff", image: "mastery_dark_level_5"},
    {minLevel: 30, color: "#f75363", textColor: "#fcbac1", image: "mastery_dark_level_6"},
    //{minLevel: 35, color: "#a67fff", textColor: "#dbccff", image: "mastery_dark_level_7"},
    {minLevel: 35, color: "#3afc9f", textColor: "#b0fed9", image: "mastery_dark_level_8"},
    {minLevel: 40, color: "#ffffff", textColor: "#ffffff", image: "mastery_dark_prestige"}
];

const upgradeTiers = [
    {
        base: 100.0, scaling: 2, gears: 0, starPowers: 0, hcDuration: 0, startLevel: 0, maxUpgrades: 10,
        name: "Bronze", color: "#ff9900", image: "tier_bronze", tierUpCost: 500, masteryReq: 5, trophiesReq: 0,
        upgradeCosts: [250, 265, 280, 295, 315, 335, 355, 375, 395, 420]
    },
    {
        base: 125.0, scaling: 2, gears: 1, starPowers: 0, hcDuration: 0, startLevel: 10, maxUpgrades: 10,
        name: "Silver", color: "#c9c6f1", image: "tier_silver", tierUpCost: 1100, masteryReq: 10, trophiesReq: 5,
        upgradeCosts: [550, 580, 615, 655, 695, 735, 780, 825, 875, 925]
    },
    {
        base: 150.0, scaling: 2, gears: 1, starPowers: 1, hcDuration: 0, startLevel: 20, maxUpgrades: 10,
        name: "Gold", color: "#ffef49", image: "tier_gold", tierUpCost: 2500, masteryReq: 15, trophiesReq: 10,
        upgradeCosts: [1250, 1320, 1400, 1490, 1580, 1670, 1770, 1870, 1980, 2100]
    },
    {
        base: 175.0, scaling: 2, gears: 1, starPowers: 2, hcDuration: 0, startLevel: 30, maxUpgrades: 15,
        name: "Diamond", color: "#33ffff", image: "tier_diamond", tierUpCost: 7500, masteryReq: 20, trophiesReq: 20,
        upgradeCosts: [2800, 2960, 3140, 3320, 3520, 3740, 3960, 4200, 4440, 4720, 5000, 5280, 5600, 5940, 6300]
    },
    {
        base: 212.5, scaling: 2, gears: 2, starPowers: 2, hcDuration: 0, startLevel: 45, maxUpgrades: 15,
        name: "Mythic", color: "#ff00ff", image: "tier_mythic", tierUpCost: 22500, masteryReq: 25, trophiesReq: 35,
        upgradeCosts: [8400, 8900, 9400, 10000, 10600, 11200, 11900, 12600, 13300, 14100, 15000, 15900, 16800, 17800, 18900],
    },
    {
        base: 250.0, scaling: 2, gears: 2, starPowers: 3, hcDuration: 0, startLevel: 60, maxUpgrades: 20,
        name: "Legendary", color: "#f75363", image: "tier_legendary", tierUpCost: 90000, masteryReq: 30, trophiesReq: 60,
        upgradeCosts: [25200, 26600, 28200, 30000, 31800, 33600, 35600, 37800, 40000, 42400, 45000, 47600, 50400, 53400, 56600, 60000, 63600, 67400, 71400, 75600]
    },
    {
        base: 300.0, scaling: 0, gears: 2, starPowers: 3, hcDuration: 8, startLevel: 80, maxUpgrades: 20,
        name: "Masters", color: "#ffcc00", image: "tier_masters", tierUpCost: 200000, masteryReq: 35, trophiesReq: 100,
        upgradeCosts: [100000, 102000, 104000, 107000, 110000, 113000, 116000, 119000, 122000, 125000, 128000, 131000, 134000, 137000, 140000, 144000, 148000, 152000, 156000, 160000]
    },
    {
        base: 300.0, scaling: 0, gears: 2, starPowers: 3, hcDuration: 12, startLevel: 100, maxUpgrades: 0,
        name: "Pro", color: "#3afc9f", image: "tier_pro", tierUpCost: 0, masteryReq: 40, trophiesReq: 250,
        upgradeCosts: [0]
    }
];

const hyperUpgrades = {
    healing: {base: 20, scaling: 5, unlockLevel: 1},
    damage: {base: 20, scaling: 5, unlockLevel: 2},
    speed: {base: 4, scaling: 1, unlockLevel: 3},
    charge: {base: 0, scaling: 6.25, unlockLevel: 4},
    level: {base: 1, scaling: 1, unlockLevel: 5}
};

function upgradeTierIndex(tier: number): {index: number; upgrades: number;}{
    if (tier < 0){
        return {index: 0, upgrades: 0};
    }
    const index = tier >> 8;
    const upgrades = tier & 255;
    const config = upgradeTiers[Math.min(upgradeTiers.length - 1, index)];
    return {
        index: Math.min(upgradeTiers.length - 1, index),
        upgrades: Math.min(config.maxUpgrades, upgrades)
    };
}

function getTierUnlocks(index: number): CharacterUnlockStats{
    const config = upgradeTiers[Math.min(upgradeTiers.length - 1, index)];
    return {
        gears: config.gears, starPowers: config.starPowers, hcDuration: config.hcDuration
    };
}

function getHyperStats(tier: number): CharacterHyperStats{
    const hcUpgrades = Math.min(20, tier - 1536);

    const stats: CharacterHyperStats = {healing: 0, damage: 0, speed: 0, charge: 0, level: 0};
    if (hcUpgrades < 0){
        return stats;
    }

    for (const x in hyperUpgrades){
        const key = x as keyof CharacterHyperStats;
        stats[key] = hyperUpgrades[key].base + Math.floor(1 + (hcUpgrades - hyperUpgrades[key].unlockLevel) / 5) * hyperUpgrades[key].scaling;
    }

    return stats;
}

export function findUserCharacter(userCharacters: UserCharacter[], name: string): number{
    return findName(userCharacters, name, indexMap);
}

export function getNextTier(tier: number): number{
    // Gets the next tier number (in bits storage format)
    const t = upgradeTierIndex(tier);
    const tierConfig = upgradeTiers[t.index];

    if (t.index >= upgradeTiers.length - 1){
        return (t.index << 8) | Math.min(tierConfig.maxUpgrades, t.upgrades);
    }
    if (t.upgrades >= tierConfig.maxUpgrades){
        return (t.index + 1) << 8;
    }
    return (t.index << 8) | (t.upgrades + 1);
}

export function getMasteryLevel(points: number): MasteryData{
    points = Math.floor(Math.max(0, points));

    const result: MasteryData = {
        level: -1,
        maxLevel: Math.max(0, masteryLevels.length - 1),
        points: points,
        current: {
            points: 0,
            image: "",
            color: "#000000",
            textColor: "#000000"
        },
        next: {
            points: 1,
            image: "",
            color: "#000000",
            textColor: "#000000"
        }
    };

    let x = 0;
    while (x < masteryLevels.length && result.level < 0){
        // Find the first level where the user does not have enough points. That level is 1 higher than the user's
        // current level. Levels are the same as indexes in the array.
        //if (points < masteryLevels[x] || masteryLevels[x] < 0){
        if (points < masteryLevels[x]){
            if (x >= 1){
                // Points required to get to the current level
                result.current.points = masteryLevels[x - 1];
            }
            // Points required to get to the next level
            result.next.points = masteryLevels[x];
            result.level = x - 1;
        }
        x++;
    }
    if (result.level < 0 && x > 0){
        // If there is no level where the user does not have enough points, the user is at the highest level.
        x = masteryLevels.length - 1;
        const prestige = Math.max(0, points - masteryLevels[x]);

        result.level = x + Math.floor(prestige / prestigePoints);
        result.points = prestige % prestigePoints;
        result.current.points = 0;
        result.next.points = prestigePoints;
    }

    x = 0;
    while (x < levelImages.length && result.current.image === ""){
        // Find the first index in levelImages where the user's level is not higher than the next index's minLevel.
        // This index contains the user's current level image and color. If the end of the array is reached without
        // finding an index then the user has the highest available image and color level.
        if (x >= levelImages.length - 1 || (x < levelImages.length - 1 && result.level < levelImages[x + 1].minLevel)){
            result.current.image = MASTERY_LEVEL_DIR + levelImages[x].image + IMAGE_FILE_EXTENSION;
            result.current.color = levelImages[x].color;
            result.current.textColor = levelImages[x].textColor;

            if (x < levelImages.length - 1 && result.level + 1 >= levelImages[x + 1].minLevel){
                // Next mastery level meets the minimum level required for the next image
                result.next.image = MASTERY_LEVEL_DIR + levelImages[x + 1].image + IMAGE_FILE_EXTENSION;
                result.next.color = levelImages[x + 1].color;
                result.next.textColor = levelImages[x + 1].textColor;
            } else{
                // Next mastery level does not meet the minimum level or there is no next image
                result.next.image = result.current.image;
                result.next.color = result.current.color;
                result.next.textColor = result.current.textColor;
            }
        }
        x++;
    }

    return result;
}

export function characterMasteryReq(name: string): number{
    const index = findName(characterList, name, indexMap);
    if (index < 0){
        return 0;
    }
    return characterList[index].masteryReq;
}

export function getEnemyList(): EnemyData[]{
    const enemies: EnemyData[] = [];

    for (const x in enemyList){
        const data = enemyList[x as keyof typeof enemyList];

        // The image is the a brawler pin, the full image is a brawler skin
        enemies.push({
            name: x,
            displayName: data.displayName,
            image: (data.image !== "" ? PIN_IMAGE_DIR + data.image : ""),
            fullImage: (data.fullImage !== "" ? SKIN_IMAGE_DIR + data.fullImage : ""),
            enemyClass: data.enemyClass,
            description: data.description,
            strengthTier: data.strengthTier,
            value: data.value,
            health: data.health,
            speed: data.speed,
            attacks: data.attacks,
            enemies: data.enemies
        });
    }

    return enemies;
}

export function getCharacterPreview(character: UserCharacter): CharacterPreview | undefined{
    const index = findName(characterList, character.name, indexMap);
    if (index < 0){
        return undefined;
    }

    const config = characterList[index];
    const t = upgradeTierIndex(character.tier);
    const tierConfig = upgradeTiers[t.index];

    return {
        name: config.name,
        displayName: config.displayName,
        image: CHARACTER_IMAGE_DIR + config.image + IMAGE_FILE_EXTENSION,
        masteryReq: config.masteryReq,
        tier: {
            level: tierConfig.startLevel + t.upgrades,
            name: tierConfig.name,
            image: TIER_IMAGE_DIR + tierConfig.image + IMAGE_FILE_EXTENSION,
            color: tierConfig.color
        }
    };
}

export function getCharacterData(character: UserCharacter, accessories?: UserAccessory[]): CharacterStatus | undefined{
    const index = findName(characterList, character.name, indexMap);
    if (index < 0){
        return undefined;
    }

    const config = characterList[index];
    const t = upgradeTierIndex(character.tier);
    const tierConfig = upgradeTiers[t.index];

    const tierData = {
        level: tierConfig.startLevel + t.upgrades,
        name: tierConfig.name,
        image: TIER_IMAGE_DIR + tierConfig.image + IMAGE_FILE_EXTENSION,
        color: tierConfig.color
    };
    const tierUnlocks = getTierUnlocks(t.index);
    const nextTier = {
        level: tierData.level,
        name: tierData.name,
        image: tierData.image,
        color: tierData.color
    };
    const upgradeCost = {
        cost: 0,
        masteryReq: 0,
        trophiesReq: 0
    };

    let trophies = 0;
    if (accessories !== undefined && index < badgeIndexes.length){
        const accessory = accessories[badgeIndexes[index]];
        if (accessory !== undefined && accessory.name === character.name){
            // A character's trophy count is the number of badges on the accessory with its name
            trophies = accessory.badges;
        } else{
            // If the accessory at the expected index does not match the character, search for it in the given array
            const otherIndex = findName(accessories, character.name);
            if (otherIndex >= 0){
                trophies = accessories[otherIndex].badges;
            }
        }
    }

    const multiplier = tierConfig.base + tierConfig.scaling * t.upgrades;
    let nextMultiplier = multiplier;
    let nextUnlocks = getTierUnlocks(t.index);
    //const currentHyper = tierConfig.hyper + tierConfig.hyperScaling * t.upgrades;
    //let nextHyper = currentHyper;

    if (t.index < upgradeTiers.length - 1){
        if (t.upgrades >= tierConfig.maxUpgrades){
            // Next level is a tier up
            const next = upgradeTiers[t.index + 1];
            nextMultiplier = next.base;
            //nextHyper = next.hyper;

            nextTier.level = next.startLevel;
            nextTier.name = next.name;
            nextTier.image = TIER_IMAGE_DIR + next.image + IMAGE_FILE_EXTENSION;
            nextTier.color = next.color;

            nextUnlocks = getTierUnlocks(t.index + 1);

            upgradeCost.cost = tierConfig.tierUpCost;
            upgradeCost.masteryReq = next.masteryReq;
            upgradeCost.trophiesReq = next.trophiesReq;
        } else{
            // Next level is a normal upgrade
            nextTier.level = tierData.level + 1;
            nextMultiplier = multiplier + tierConfig.scaling;
            //nextHyper = currentHyper + tierConfig.hyperScaling;

            upgradeCost.cost = tierConfig.upgradeCosts[Math.min(tierConfig.upgradeCosts.length - 1, t.upgrades)];
            upgradeCost.masteryReq = tierConfig.masteryReq;
            upgradeCost.trophiesReq = tierConfig.trophiesReq;
        }
    } else{
        // Indicate that there are no more levels
        nextTier.level = -1;
        upgradeCost.masteryReq = tierConfig.masteryReq;
        upgradeCost.trophiesReq = tierConfig.trophiesReq;
    }

    const {health, damage, healing, lifeSteal} = config.stats;
    const {reload, speed, range, targets} = config.otherStats;

    return {
        name: config.name,
        displayName: config.displayName,
        image: CHARACTER_IMAGE_DIR + config.image + IMAGE_FILE_EXTENSION,
        masteryReq: config.masteryReq,
        trophies: trophies,
        current: {
            tier: tierData,
            stats: {
                health: health * multiplier / 100,
                damage: damage * multiplier / 100,
                healing: healing * multiplier / 100,
                lifeSteal: lifeSteal * multiplier / 100
            },
            unlocks: tierUnlocks,
            hcStats: getHyperStats(character.tier)
        },
        next: {
            tier: nextTier,
            stats: {
                health: health * nextMultiplier / 100,
                damage: damage * nextMultiplier / 100,
                healing: healing * nextMultiplier / 100,
                lifeSteal: lifeSteal * nextMultiplier / 100
            },
            unlocks: nextUnlocks,
            hcStats: getHyperStats(getNextTier(character.tier))
        },
        upgrade: upgradeCost,
        otherStats: {
            reload: reload, speed: speed, range: range, targets: targets
        }
    };
}
