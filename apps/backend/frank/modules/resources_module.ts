import characterList from "../data/characters_data.json";
import enemyList from "../data/enemies_data.json";
import {findName} from "./utils";
import {IMAGE_FILE_EXTENSION, SKIN_IMAGE_DIR, PIN_IMAGE_DIR, MASTERY_LEVEL_DIR, TIER_IMAGE_DIR, CHARACTER_IMAGE_DIR} from "../data/constants";
import {UserCharacter, MasteryData, CharacterPreview, CharacterStatus, EnemyData} from "../types";

const indexMap = new Map<string, number>();
for (let x = 0; x < characterList.length; x++){
    indexMap.set(characterList[x].name, x);
}

const masteryLevels = [
           0,     2000,     6000,    10000,    20000,    30000,
       40000,    60000,    80000,   120000,   180000,   240000,
      300000,   400000,   500000,   600000,   800000,  1000000,
     1200000,  1500000,  1800000,  2400000,  3000000,  4000000,
     5000000,  6000000,  8000000, 10000000, 12000000, 16000000,
    20000000,       -1
];

const levelImages = [
    {minLevel: 0, color: "#808080", image: "mastery_empty"},
    {minLevel: 1, color: "#d67d59", image: "mastery_level_0"},
    {minLevel: 4, color: "#ff9900", image: "mastery_level_1"},
    {minLevel: 8, color: "#c9c6f1", image: "mastery_level_2"},
    {minLevel: 12, color: "#ffef49", image: "mastery_level_3"},
    {minLevel: 16, color: "#33ffff", image: "mastery_level_4"},
    {minLevel: 20, color: "#ff00ff", image: "mastery_level_5"},
    {minLevel: 25, color: "#f75363", image: "mastery_level_6"},
    //{minLevel: 28, color: "#a67fff", image: "mastery_level_7"},
    {minLevel: 30, color: "#3afc9f", image: "mastery_level_8"}
];

const upgradeTiers = [
    {
        base: 100.0, scaling: 2, startLevel: 0, maxUpgrades: 10, name: "Bronze", color: "#ff9900", image: "tier_bronze",
        upgradeCosts: [250, 260, 280, 300, 320, 350, 380, 410, 450, 500], tierUpCost: 1500, masteryReq: 4
    },
    {
        base: 125.0, scaling: 2, startLevel: 10, maxUpgrades: 10, name: "Silver", color: "#c9c6f1", image: "tier_silver",
        upgradeCosts: [600, 640, 680, 740, 800, 880, 960, 1060, 1160, 1280], tierUpCost: 3200, masteryReq: 8
    },
    {
        base: 150.0, scaling: 2, startLevel: 20, maxUpgrades: 10, name: "Gold", color: "#ffef49", image: "tier_gold",
        upgradeCosts: [1600, 1680, 1780, 1900, 2040, 2200, 2400, 2660, 2940, 3300], tierUpCost: 7500, masteryReq: 12
    },
    {
        base: 175.0, scaling: 3, startLevel: 30, maxUpgrades: 10, name: "Diamond", color: "#33ffff", image: "tier_diamond",
        upgradeCosts: [4000, 4240, 4540, 4900, 5380, 6000, 6760, 7640, 8640, 9900], tierUpCost: 18000, masteryReq: 16
    },
    {
        base: 212.5, scaling: 3, startLevel: 40, maxUpgrades: 10, name: "Mythic", color: "#ff00ff", image: "tier_mythic",
        upgradeCosts: [12000, 12600, 13400, 14600, 16200, 18200, 20800, 24000, 28200, 34000], tierUpCost: 56000, masteryReq: 20
    },
    {
        base: 250.0, scaling: 4, startLevel: 50, maxUpgrades: 10, name: "Legendary", color: "#f75363", image: "tier_legendary",
        upgradeCosts: [42000, 44800, 48400, 53200, 59200, 66400, 76000, 88000, 102000, 120000], tierUpCost: 200000, masteryReq: 25
    },
    {
        base: 300.0, scaling: 0, startLevel: 60, maxUpgrades: 0, name: "Masters", color: "#ffcc00", image: "tier_masters",
        upgradeCosts: [0], tierUpCost: 300000, masteryReq: 30
    },
    {
        base: 300.0, scaling: 0, startLevel: 60, maxUpgrades: 0, name: "Pro", color: "#3afc9f", image: "tier_pro",
        upgradeCosts: [0], tierUpCost: 0, masteryReq: 30
    }
];

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
        points: points,
        current: {
            points: 0,
            image: "",
            color: "#000000"
        },
        next: {
            points: 1,
            image: "",
            color: "#000000"
        }
    };

    let x = 0;
    while (x < masteryLevels.length && result.level < 0){
        // Find the first level where the user does not have enough points. That level is 1 higher than the user's
        // current level. Levels are the same as indexes in the array.
        if (points < masteryLevels[x] || masteryLevels[x] < 0){
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

    x = 0;
    while (x < levelImages.length && result.current.image === ""){
        // Find the first index in levelImages where the user's level is not higher than the next index's minLevel.
        // This index contains the user's current level image and color. If the end of the array is reached without
        // finding an index then the user has the highest available image and color level.
        if (x >= levelImages.length - 1 || (x < levelImages.length - 1 && result.level < levelImages[x + 1].minLevel)){
            result.current.image = MASTERY_LEVEL_DIR + levelImages[x].image + IMAGE_FILE_EXTENSION;
            result.current.color = levelImages[x].color;

            if (x < levelImages.length - 1 && result.level + 1 >= levelImages[x + 1].minLevel){
                // Next mastery level meets the minimum level required for the next image
                result.next.image = MASTERY_LEVEL_DIR + levelImages[x + 1].image + IMAGE_FILE_EXTENSION;
                result.next.color = levelImages[x + 1].color;
            } else{
                // Next mastery level does not meet the minimum level or there is no next image
                result.next.image = result.current.image;
                result.next.color = result.current.color;
            }
        }
        x++;
    }

    return result;
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
        tier: {
            level: tierConfig.startLevel + t.upgrades,
            name: tierConfig.name,
            image: TIER_IMAGE_DIR + tierConfig.image + IMAGE_FILE_EXTENSION,
            color: tierConfig.color
        }
    };
}

export function getCharacterData(character: UserCharacter): CharacterStatus | undefined{
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
    const nextTier = {
        level: tierData.level,
        name: tierData.name,
        image: tierData.image,
        color: tierData.color
    };
    const upgradeCost = {
        cost: 0,
        masteryReq: 0,
        badgesReq: 0
    };

    const multiplier = tierConfig.base + tierConfig.scaling * t.upgrades;
    let nextMultiplier = multiplier;
    if (t.index < upgradeTiers.length - 1){
        if (t.upgrades >= tierConfig.maxUpgrades){
            // Next level is a tier up
            const next = upgradeTiers[t.index + 1];
            nextMultiplier = next.base;

            nextTier.level = next.startLevel;
            nextTier.name = next.name;
            nextTier.image = TIER_IMAGE_DIR + next.image + IMAGE_FILE_EXTENSION;
            nextTier.color = next.color;

            upgradeCost.cost = tierConfig.tierUpCost;
            upgradeCost.masteryReq = next.masteryReq;
        } else{
            // Next level is a normal upgrade
            nextMultiplier = multiplier + tierConfig.scaling;
            nextTier.level = tierData.level + 1;

            upgradeCost.cost = tierConfig.upgradeCosts[Math.min(tierConfig.upgradeCosts.length - 1, t.upgrades)];
            upgradeCost.masteryReq = tierConfig.masteryReq;
        }
    } else{
        // Indicate that there are no more levels
        nextTier.level = -1;
        upgradeCost.masteryReq = tierConfig.masteryReq;
    }

    const {health, damage, healing, lifeSteal} = config.stats;
    const {reload, speed, range, targets} = config.otherStats;

    return {
        name: config.name,
        displayName: config.displayName,
        image: CHARACTER_IMAGE_DIR + config.image + IMAGE_FILE_EXTENSION,
        current: {
            tier: tierData,
            stats: {
                health: health * multiplier / 100,
                damage: damage * multiplier / 100,
                healing: healing * multiplier / 100,
                lifeSteal: lifeSteal * multiplier / 100
            }
        },
        next: {
            tier: nextTier,
            stats: {
                health: health * nextMultiplier / 100,
                damage: damage * nextMultiplier / 100,
                healing: healing * nextMultiplier / 100,
                lifeSteal: lifeSteal * nextMultiplier / 100
            }
        },
        upgrade: upgradeCost,
        otherStats: {
            reload: reload, speed: speed, range: range, targets: targets
        }
    };
}
