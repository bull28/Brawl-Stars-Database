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
        powerReward: number;
        gearsReward: number;
        enemyStats: number[];
        baseMastery: number;
    }[];
}

interface BrawlBoxConfig{
    displayName: string;
    description: string;
    image: string;
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
            {
                challengeid: "random1", displayName: "Random Challenge - Tier 1",
                powerReward: 20, gearsReward: 100, enemyStats: [100, 120], baseMastery: 1
            },
            {
                challengeid: "random2", displayName: "Random Challenge - Tier 2",
                powerReward: 20, gearsReward: 100, enemyStats: [148, 164, 178], baseMastery: 1.5
            },
            {
                challengeid: "miniboss1", displayName: "Miniboss Challenge - Tier 1",
                powerReward: 20, gearsReward: 100, enemyStats: [200], baseMastery: 1.5
            }
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
            {
                challengeid: "random2", displayName: "Random Challenge - Tier 2",
                powerReward: 20, gearsReward: 100, enemyStats: [100, 120, 138], baseMastery: 2
            },
            {
                challengeid: "miniboss2", displayName: "Miniboss Challenge - Tier 2",
                powerReward: 20, gearsReward: 100, enemyStats: [164], baseMastery: 1.5
            },
            {
                challengeid: "random3", displayName: "Random Challenge - Tier 3",
                powerReward: 20, gearsReward: 100, enemyStats: [186, 200, 210], baseMastery: 2.5
            },
            {
                challengeid: "siege1", displayName: "Siege Challenge - Tier 1",
                powerReward: 20, gearsReward: 100, enemyStats: [236], baseMastery: 1.5
            }
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
            {
                challengeid: "random3", displayName: "Random Challenge - Tier 3",
                powerReward: 20, gearsReward: 100, enemyStats: [100, 120, 138], baseMastery: 2.5
            },
            {
                challengeid: "miniboss3", displayName: "Miniboss Challenge - Tier 3",
                powerReward: 20, gearsReward: 100, enemyStats: [164], baseMastery: 1.5
            },
            {
                challengeid: "random4", displayName: "Random Challenge - Tier 4",
                powerReward: 20, gearsReward: 100, enemyStats: [186, 200, 210, 222], baseMastery: 3
            },
            {
                challengeid: "siege2", displayName: "Siege Challenge - Tier 2",
                powerReward: 20, gearsReward: 100, enemyStats: [238], baseMastery: 2
            },
            {
                challengeid: "random5", displayName: "Random Challenge - Tier 5",
                powerReward: 20, gearsReward: 100, enemyStats: [252, 261, 269, 275], baseMastery: 4
            },
            {
                challengeid: "bosstrials", displayName: "Boss Fight",
                powerReward: 20, gearsReward: 100, enemyStats: [300], baseMastery: 2
            }
        ]
    }
];

const allCharacters = [
    {name: "spike", ingameIndex: 48, accsItemIndex: 74, starPowers: [
        "The super heals 50% more health.",
        "Deal +15% damage if the super is fully charged.",
        "The super has 25% longer range and pierces through enemies."
    ]},
    {name: "gus", ingameIndex: 49, accsItemIndex: 75, starPowers: [
        "All shields are 25% stronger.",
        "Deal +20% damage when a shield is active.",
        "After hitting 4 attacks, the next attack deals +50% damage and pierces through enemies."
    ]},
    {name: "emz", ingameIndex: 50, accsItemIndex: 76, starPowers: [
        "Heal for 40% of your life steal every time the super hits an enemy.",
        "The super deals +50% damage until it hits at least 2 different enemies.",
        "Attacks deal +25% damage to enemies that are very close."
    ]},
    {name: "darryl", ingameIndex: 51, accsItemIndex: 77, starPowers: [
        "When the super ends, receive a shield worth 0.5% of max health per attack hit during the super.",
        "Each full attack hit during the super extends its duration by 0.125 seconds.",
        "The super roll has 50% longer range and deals 300% fire damage."
    ]},
    {name: "tara", ingameIndex: 52, accsItemIndex: 78, starPowers: [
        "Increases attack range by 35%.",
        "Receive +100% life steal when attacking the last enemy the super hit.",
        "When defeating an enemy, gain 25% speed and 20% damage for 12 seconds."
    ]},
    {name: "piper", ingameIndex: 53, accsItemIndex: 79, starPowers: [
        "The super slows nearby enemies by 70% for 5 seconds.",
        "Attacks deal more damage the farther they travel, up to +25% at 60% of max range.",
        "Every 4 attacks hit on an enemy increases the damage dealt to them by 12.5%, up to 50%."
    ]},
    {name: "lily", ingameIndex: 54, accsItemIndex: 80, starPowers: [
        "Hitting an enemy with the super gives a shield worth 40% of max health for 2.5 seconds.",
        "Defeating an enemy instantly reloads 1 ammo.",
        "Increases ammo capacity and unload speed by 20%."
    ]},
    {name: "stu", ingameIndex: 55, accsItemIndex: 81, starPowers: [
        "Receive dashes 50% faster and store up to 10 dashes at once.",
        "Deal +50% damage on the next attack after using a dash. Does not stack.",
        "When at least 5 dashes are stored, deal +25% damage."
    ]},
    {name: "maisie", ingameIndex: 56, accsItemIndex: 82, starPowers: [
        "Super heals 5% of max health and recharges 25% more from enemies.",
        "Attacks reload 15% faster, have 10% longer range, and move faster.",
        "Super deals 50% more damage for each enemy it hits, up to a maximum of 150%."
    ]},
    {name: "shade", ingameIndex: 57, accsItemIndex: 83, starPowers: [
        "Increases the duration of the super by 33%.",
        "Receive +60% protection while the super is active.",
        "Every 6 stomps hit during the super increases its damage by 25% for the rest of its duration, up to 100%."
    ]},
    {name: "mandy", ingameIndex: 58, accsItemIndex: 84, starPowers: [
        "Receive +40% protection when not moving.",
        "Each level up increases the super's damage by 20%.",
        "All levels require 15% less XP to reach."
    ]},
    {name: "hank", ingameIndex: 59, accsItemIndex: 85, starPowers: [
        "Super heals damage received from 1 more second.",
        "Increases the size of the bubble by 50%.",
        "Torpedoes deal +25% damage to enemies not right beside you."
    ]}
];

const characterTiers = [
    {startLevel: 0, maxUpgrades: 10, name: "Bronze", color: "#ff9900", image: "tier_bronze"},
    {startLevel: 10, maxUpgrades: 10, name: "Silver", color: "#c9c6f1", image: "tier_silver"},
    {startLevel: 20, maxUpgrades: 10, name: "Gold", color: "#ffef49", image: "tier_gold"},
    {startLevel: 30, maxUpgrades: 15, name: "Diamond", color: "#33ffff", image: "tier_diamond"},
    {startLevel: 45, maxUpgrades: 15, name: "Mythic", color: "#ff00ff", image: "tier_mythic"},
    {startLevel: 60, maxUpgrades: 20, name: "Legendary", color: "#f75363", image: "tier_legendary"},
    {startLevel: 80, maxUpgrades: 20, name: "Masters", color: "#ffcc00", image: "tier_masters"},
    {startLevel: 100, maxUpgrades: 0, name: "Pro", color: "#3afc9f", image: "tier_pro"}
];

const trialLevels = [
    {enemyStats:  8.00, baseMastery:   1, baseCoins: 1.50},
    {enemyStats:  8.00, baseMastery:   1, baseCoins: 1.55},
    {enemyStats:  8.25, baseMastery:   1, baseCoins: 1.60},
    {enemyStats:  8.25, baseMastery:   2, baseCoins: 1.65},
    {enemyStats:  8.50, baseMastery:   2, baseCoins: 1.70},
    {enemyStats:  8.75, baseMastery:   2, baseCoins: 1.75},
    {enemyStats:  9.00, baseMastery:   3, baseCoins: 1.80},
    {enemyStats:  9.25, baseMastery:   4, baseCoins: 1.85},
    {enemyStats:  9.50, baseMastery:   5, baseCoins: 1.90},
    {enemyStats:  9.75, baseMastery:   6, baseCoins: 1.95},
    {enemyStats: 10.00, baseMastery:   7, baseCoins: 2.00},
    {enemyStats: 10.50, baseMastery:   8, baseCoins: 2.05},
    {enemyStats: 11.00, baseMastery:   9, baseCoins: 2.10},
    {enemyStats: 11.50, baseMastery:  10, baseCoins: 2.15},
    {enemyStats: 11.75, baseMastery:  11, baseCoins: 2.25},
    {enemyStats: 12.00, baseMastery:  12, baseCoins: 2.35},
    {enemyStats: 12.50, baseMastery:  13, baseCoins: 2.45},
    {enemyStats: 13.00, baseMastery:  14, baseCoins: 2.55},
    {enemyStats: 13.50, baseMastery:  15, baseCoins: 2.65},
    {enemyStats: 13.75, baseMastery:  16, baseCoins: 2.75},
    {enemyStats: 14.00, baseMastery:  18, baseCoins: 2.85},
    {enemyStats: 14.50, baseMastery:  20, baseCoins: 2.95},
    {enemyStats: 15.00, baseMastery:  22, baseCoins: 3.05},
    {enemyStats: 15.50, baseMastery:  24, baseCoins: 3.15},
    {enemyStats: 16.25, baseMastery:  27, baseCoins: 3.30},
    {enemyStats: 17.00, baseMastery:  30, baseCoins: 3.45},
    {enemyStats: 17.75, baseMastery:  33, baseCoins: 3.60},
    {enemyStats: 18.50, baseMastery:  36, baseCoins: 3.75},
    {enemyStats: 19.25, baseMastery:  40, baseCoins: 3.90},
    {enemyStats: 20.00, baseMastery:  44, baseCoins: 4.05},
    {enemyStats: 20.75, baseMastery:  48, baseCoins: 4.20},
    {enemyStats: 21.50, baseMastery:  54, baseCoins: 4.35},
    {enemyStats: 22.25, baseMastery:  60, baseCoins: 4.50},
    {enemyStats: 23.00, baseMastery:  68, baseCoins: 4.65},
    {enemyStats: 24.00, baseMastery:  76, baseCoins: 4.80},
    {enemyStats: 25.00, baseMastery:  84, baseCoins: 5.10},
    {enemyStats: 26.00, baseMastery:  96, baseCoins: 5.40},
    {enemyStats: 27.00, baseMastery: 108, baseCoins: 5.70},
    {enemyStats: 28.00, baseMastery: 120, baseCoins: 6.00}
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
        image: "brawlbox_starter",
        requirement: 1,
        baseQuality: 9,
        scoreQuality: 0,
        progressQuality: 0,
        rarities: [1, 3, 9, 72],
        guaranteed: [2],
        weights: [{itemType: "resource", multiplier: 0.25}]
    },
    {
        displayName: "Big Box",
        description: "",
        image: "brawlbox_default",
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
        image: "brawlbox_mega",
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
        image: "brawlbox_brawler",
        requirement: 2,
        baseQuality: 6,
        scoreQuality: 3,
        progressQuality: 0.75,
        rarities: [1, 3, 8, 24, 120],
        guaranteed: [1, 3],
        weights: [{itemType: "character", multiplier: 2}]
    },
    {
        displayName: "Rare Box",
        description: "",
        image: "brawlbox_rare",
        requirement: 4,
        baseQuality: 7,
        scoreQuality: 4,
        progressQuality: 0.75,
        rarities: [1, 3, 6, 12, 36],
        guaranteed: [0],
        weights: []
    },
    {
        displayName: "Ultra Box",
        description: "",
        image: "brawlbox_ultra",
        requirement: 8,
        baseQuality: 15,
        scoreQuality: 6,
        progressQuality: 0,
        rarities: [1, 3, 6, 12, 36],
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
        itemType: "character",
        rarities: [1, 1, 1, 0, 0]
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

const spriteConfig = {
    imageFile: "trial_sprites",
    rowSize: 10,
    characterIndex: 0,
    accessoryIndex: 40,
    powerupIndex: 12,
    powerPointsIndex: 24,
    gearScrapIndex: 29,
    accessoryTokenIndex: 33,
    creditsIndex: 36,
    gearIndex: 140,
    starPowerIndex: 147
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

export {trialStates, allTrials, allCharacters, characterTiers, trialLevels, allRarities, allBoxes, guaranteedDraws, fallbackItems, gearWeights, starPowerWeights, trialUpgrades, spriteConfig};
