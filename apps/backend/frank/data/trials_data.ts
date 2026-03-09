import allItems from "./trials_items_data.json";
import {GameModUpgradeValues, ItemConfig} from "../types";

interface TrialConfig{
    displayName: string;
    levelIncrease: number;
    baseMastery: number;
    baseCoins: number;
    baseBadges: number;
    difficulty: {
        strengthTier: number;
        healthBonusReq: number;
        timePerEnemy: number;
    };
    challenges: {
        challengeid: string;
        displayName: string;
        enemyStats: number[];
        baseMastery: number;
    }[];
}

interface BrawlBoxConfig{
    displayName: string;
    description: string;
    requirement: number;
    baseQuality: number;
    scoreQuality: number;
    progressQuality: number;
    rarities: number[];
    guaranteed: number[];
    weights: {
        itemType: string;
        multiplier: number;
    }[];
}

const trialStates = {
    // Trial is ready to start the next challenge
    TRIAL_READY: 0,
    // Player is currently in a challenge
    TRIAL_PLAYING: 1,
    // Challenge has been completed and a brawl box reward is available
    TRIAL_REWARD: 2,
    // Player lost a challenge and failed the trial
    TRIAL_FAILED: 3,
    // Player won all challenges and completed the trial
    TRIAL_COMPLETE: 4
};


const allTrials: TrialConfig[] = [
    {
        displayName: "Easy Trial",
        levelIncrease: 0,
        baseMastery: 1,
        baseCoins: 0,
        baseBadges: 2,
        difficulty: {
            strengthTier: 0,
            healthBonusReq: 0.3,
            timePerEnemy: 0.8
        },
        challenges: [
            {challengeid: "random1", displayName: "Random Challenge - Tier 1", enemyStats: [100, 120], baseMastery: 1},
            {challengeid: "random2", displayName: "Random Challenge - Tier 2", enemyStats: [148, 164, 178], baseMastery: 1.5},
            {challengeid: "miniboss1", displayName: "Miniboss Challenge - Tier 1", enemyStats: [200], baseMastery: 1.5}
        ]
    },
    {
        displayName: "Normal Trial",
        levelIncrease: 1,
        baseMastery: 1.5,
        baseCoins: 0.5,
        baseBadges: 6,
        difficulty: {
            strengthTier: 2,
            healthBonusReq: 0.4,
            timePerEnemy: 0.75
        },
        challenges: [
            {challengeid: "random2", displayName: "Random Challenge - Tier 2", enemyStats: [100, 120, 138], baseMastery: 2},
            {challengeid: "miniboss2", displayName: "Miniboss Challenge - Tier 2", enemyStats: [164], baseMastery: 1.5},
            {challengeid: "random3", displayName: "Random Challenge - Tier 3", enemyStats: [186, 200, 210], baseMastery: 2.5},
            {challengeid: "siege1", displayName: "Siege Challenge - Tier 1", enemyStats: [236], baseMastery: 1.5}
        ]
    },
    {
        displayName: "Hard Trial",
        levelIncrease: 3,
        baseMastery: 2.5,
        baseCoins: 1,
        baseBadges: 12,
        difficulty: {
            strengthTier: 4,
            healthBonusReq: 0.5,
            timePerEnemy: 0.7
        },
        challenges: [
            {challengeid: "random3", displayName: "Random Challenge - Tier 3", enemyStats: [100, 120, 138], baseMastery: 2.5},
            {challengeid: "miniboss3", displayName: "Miniboss Challenge - Tier 3", enemyStats: [164], baseMastery: 1.5},
            {challengeid: "random4", displayName: "Random Challenge - Tier 4", enemyStats: [186, 200, 210, 222], baseMastery: 3},
            {challengeid: "siege2", displayName: "Siege Challenge - Tier 2", enemyStats: [238], baseMastery: 2},
            {challengeid: "random5", displayName: "Random Challenge - Tier 5", enemyStats: [252, 261, 269, 275], baseMastery: 4},
            {challengeid: "bosstrials", displayName: "Boss Fight", enemyStats: [300], baseMastery: 2}
        ]
    }
];

const allCharacters = [
    {name: "spike", ingameIndex: 48, starPowers: ["", "", ""]},
    {name: "gus", ingameIndex: 49, starPowers: ["", "", ""]},
    {name: "emz", ingameIndex: 50, starPowers: ["", "", ""]},
    {name: "darryl", ingameIndex: 51, starPowers: ["", "", ""]},
    {name: "tara", ingameIndex: 52, starPowers: ["", "", ""]},
    {name: "piper", ingameIndex: 53, starPowers: ["", "", ""]},
    {name: "lily", ingameIndex: 54, starPowers: ["", "", ""]},
    {name: "stu", ingameIndex: 55, starPowers: ["", "", ""]},
    {name: "maisie", ingameIndex: 56, starPowers: ["", "", ""]},
    {name: "shade", ingameIndex: 57, starPowers: ["", "", ""]},
    {name: "mandy", ingameIndex: 58, starPowers: ["", "", ""]},
    {name: "hank", ingameIndex: 59, starPowers: ["", "", ""]}
];

const characterTiers = [
    {startLevel: 0, name: "Bronze", color: "#ff9900", image: "tier_bronze"},
    {startLevel: 10, name: "Silver", color: "#c9c6f1", image: "tier_silver"},
    {startLevel: 20, name: "Gold", color: "#ffef49", image: "tier_gold"},
    {startLevel: 30, name: "Diamond", color: "#33ffff", image: "tier_diamond"},
    {startLevel: 45, name: "Mythic", color: "#ff00ff", image: "tier_mythic"},
    {startLevel: 60, name: "Legendary", color: "#f75363", image: "tier_legendary"},
    {startLevel: 80, name: "Masters", color: "#ffcc00", image: "tier_masters"},
    {startLevel: 100, name: "Pro", color: "#3afc9f", image: "tier_pro"}
];

const trialLevels = [
    {enemyStats:  8.00, baseMastery:  1, baseCoins: 1.00},
    {enemyStats:  8.25, baseMastery:  1, baseCoins: 1.05},
    {enemyStats:  8.50, baseMastery:  1, baseCoins: 1.05},
    {enemyStats:  8.75, baseMastery:  1, baseCoins: 1.10},
    {enemyStats:  9.00, baseMastery:  2, baseCoins: 1.10},
    {enemyStats:  9.25, baseMastery:  2, baseCoins: 1.15},
    {enemyStats:  9.50, baseMastery:  2, baseCoins: 1.20},
    {enemyStats:  9.75, baseMastery:  2, baseCoins: 1.25},
    {enemyStats: 10.00, baseMastery:  3, baseCoins: 1.30},
    {enemyStats: 10.50, baseMastery:  3, baseCoins: 1.35},
    {enemyStats: 11.00, baseMastery:  4, baseCoins: 1.40},
    {enemyStats: 11.50, baseMastery:  5, baseCoins: 1.45},
    {enemyStats: 12.00, baseMastery:  6, baseCoins: 1.50},
    {enemyStats: 12.50, baseMastery:  7, baseCoins: 1.60},
    {enemyStats: 13.00, baseMastery:  8, baseCoins: 1.70},
    {enemyStats: 13.50, baseMastery: 10, baseCoins: 1.80},
    {enemyStats: 14.00, baseMastery: 12, baseCoins: 1.90},
    {enemyStats: 14.75, baseMastery: 14, baseCoins: 2.00},
    {enemyStats: 15.50, baseMastery: 16, baseCoins: 2.10},
    {enemyStats: 16.25, baseMastery: 18, baseCoins: 2.20},
    {enemyStats: 17.00, baseMastery: 20, baseCoins: 2.30},
    {enemyStats: 17.75, baseMastery: 22, baseCoins: 2.40},
    {enemyStats: 18.50, baseMastery: 24, baseCoins: 2.50},
    {enemyStats: 19.25, baseMastery: 27, baseCoins: 2.60},
    {enemyStats: 20.00, baseMastery: 30, baseCoins: 2.70},
    {enemyStats: 20.75, baseMastery: 33, baseCoins: 2.80},
    {enemyStats: 21.50, baseMastery: 36, baseCoins: 2.90},
    {enemyStats: 22.25, baseMastery: 40, baseCoins: 3.00},
    {enemyStats: 23.00, baseMastery: 45, baseCoins: 3.10},
    {enemyStats: 24.00, baseMastery: 50, baseCoins: 3.20},
    {enemyStats: 25.00, baseMastery: 56, baseCoins: 3.40},
    {enemyStats: 26.00, baseMastery: 64, baseCoins: 3.60},
    {enemyStats: 27.00, baseMastery: 72, baseCoins: 3.80},
    {enemyStats: 28.00, baseMastery: 80, baseCoins: 4.00}
];

const allRarities = [
    {displayName: "Common", color: "#c0c0c0", buyCost: 8, sellCost: 2},
    {displayName: "Rare", color: "#2edd1b", buyCost: 12, sellCost: 3},
    {displayName: "Super Rare", color: "#0087fa", buyCost: 24, sellCost: 5},
    {displayName: "Epic", color: "#b116ec", buyCost: 60, sellCost: 10},
    {displayName: "Legendary", color: "#fdf11e", buyCost: 240, sellCost: 30}
];

const allBoxes: BrawlBoxConfig[] = [
    {
        displayName: "Starter Box",
        description: "",
        requirement: 1,
        baseQuality: 9,
        scoreQuality: 0,
        progressQuality: 0,
        rarities: [1, 3, 9, 72],
        guaranteed: [0],
        weights: [{itemType: "resource", multiplier: 0.25}]
    },
    {
        displayName: "Big Box",
        description: "",
        requirement: 2,
        baseQuality: 8,
        scoreQuality: 4,
        progressQuality: 1,
        rarities: [1, 3, 8, 24, 120],
        guaranteed: [0],
        weights: []
    },
    {
        displayName: "Mega Box",
        description: "",
        requirement: 2,
        baseQuality: 12,
        scoreQuality: 6,
        progressQuality: 1.5,
        rarities: [1, 4, 20, 100, 600],
        guaranteed: [0],
        weights: [{itemType: "resource", multiplier: 2}]
    },
    {
        displayName: "Brawler Box",
        description: "",
        requirement: 2,
        baseQuality: 6,
        scoreQuality: 3,
        progressQuality: 0.75,
        rarities: [1, 3, 8, 24, 120],
        guaranteed: [1, 2],
        weights: [{itemType: "character", multiplier: 2}]
    },
    {
        displayName: "Rare Box",
        description: "",
        requirement: 4,
        baseQuality: 7,
        scoreQuality: 4,
        progressQuality: 0.75,
        rarities: [1, 3, 6, 12, 48],
        guaranteed: [0],
        weights: []
    },
    {
        displayName: "Ultra Box",
        description: "",
        requirement: 8,
        baseQuality: 15,
        scoreQuality: 6,
        progressQuality: 0,
        rarities: [1, 3, 6, 12, 48],
        guaranteed: [1],
        weights: []
    }
];

const guaranteed = [
    {
        itemType: "character",
        rarities: [1, 1, 1, 1, 1]
    },
    {
        itemType: "character",
        rarities: [1.6666666666666667, 2, 2.105263157894737, 3.076923076923077, 4]
    },
    {
        itemType: "powerup",
        rarities: [4, 4, 1, 0, 0]
    }
];
const guaranteedDraws: number[][] = [];

const fallbackItems: ItemConfig[] = [
    {displayName: "Credits", type: "credits", key: "credits1", index: -1, rarity: 0, weight: 1, cost: 0, stack: 2, maxCount: -1, description: "Use these to buy items of your choice."},
    {displayName: "Credits", type: "credits", key: "credits2", index: -1, rarity: 1, weight: 1, cost: 0, stack: 3, maxCount: -1, description: "Use these to buy items of your choice."},
    {displayName: "Credits", type: "credits", key: "credits3", index: -1, rarity: 2, weight: 1, cost: 0, stack: 5, maxCount: -1, description: "Use these to buy items of your choice."},
    {displayName: "Credits", type: "credits", key: "credits4", index: -1, rarity: 3, weight: 1, cost: 0, stack: 10, maxCount: -1, description: "Use these to buy items of your choice."},
    {displayName: "Credits", type: "credits", key: "credits5", index: -1, rarity: 4, weight: 1, cost: 0, stack: 30, maxCount: -1, description: "Use these to buy items of your choice."}
];

const gearWeights = [2187, 1458, 1458, 972, 1458, 972, 972, 648, 1458, 972, 972, 648, 972, 648, 648, 432, 1458, 972, 972, 648, 972, 648, 648, 432, 972, 648, 648, 432, 648, 432, 432, 288, 1458, 972, 972, 648, 972, 648, 648, 432, 972, 648, 648, 432, 648, 432, 432, 288, 972, 648, 648, 432, 648, 432, 432, 288, 648, 432, 432, 288, 432, 288, 288, 192, 1458, 972, 972, 648, 972, 648, 648, 432, 972, 648, 648, 432, 648, 432, 432, 288, 972, 648, 648, 432, 648, 432, 432, 288, 648, 432, 432, 288, 432, 288, 288, 192, 972, 648, 648, 432, 648, 432, 432, 288, 648, 432, 432, 288, 432, 288, 288, 192, 648, 432, 432, 288, 432, 288, 288, 192, 432, 288, 288, 192, 288, 192, 192, 128];

const starPowerWeights = [8, 12, 12, 18, 12, 18, 18, 27];

const trialUpgrades: Required<{[k in keyof GameModUpgradeValues]: Required<GameModUpgradeValues[k]>}> = {
    health: {
        value: [100, 12.5],
        cost: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11],
        maxLevel: 20
    },
    damage: {
        value: [100, 12.5],
        cost: [4, 5, 6, 6, 7, 8, 9, 10, 12, 13, 15, 17, 19, 21],
        maxLevel: 14
    },
    healing: {
        value: [100, 50],
        cost: [5, 6, 7, 9, 10, 13, 15, 19],
        maxLevel: 8
    },
    lifeSteal: {
        value: [100, 50],
        cost: [5, 6, 7, 9, 10, 13, 15, 19],
        maxLevel: 8
    },
    critical: {
        value: [100, 50],
        cost: [5, 6, 7, 9, 10, 13, 15, 19],
        maxLevel: 8
    },
    combo: {
        value: [100, 50],
        cost: [5, 6, 7, 9, 10, 13, 15, 19],
        maxLevel: 8
    },
    speed: {
        value: [0, 1],
        cost: [7, 9, 11, 15, 18, 23, 29],
        maxLevel: 7
    },
    ability: {
        value: [0, 20],
        cost: [12, 16, 22, 30, 40],
        maxLevel: 5
    }
};

for (let x = 0; x < guaranteed.length; x++){
    const weights: number[] = [];
    for (let i = 0; i < allItems.length; i++){
        if (allItems[i].type === guaranteed[x].itemType){
            const rarity = allItems[i].rarity;
            const multiplier = guaranteed[x].rarities[rarity] ?? 1;
            weights.push(Math.round(allItems[i].weight * multiplier));
        } else{
            weights.push(0);
        }
    }
    guaranteedDraws.push(weights);
}

export {trialStates, allTrials, allCharacters, characterTiers, trialLevels, allRarities, allBoxes, guaranteedDraws, fallbackItems, gearWeights, starPowerWeights, trialUpgrades};
