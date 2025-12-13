import {ChallengeConfig} from "../types";

const enemyList: {name: string; value: number;}[] = [
    {name: "meteor", value: 1},
    {name: "r2", value: 2},
    {name: "shelly", value: 4},
    {name: "colt", value: 6},
    {name: "rt", value: 6},
    {name: "elprimo", value: 8},
    {name: "8bit", value: 8},
    {name: "belle", value: 9},
    {name: "jessie", value: 9},
    {name: "eve", value: 10},
    {name: "mortis", value: 10},
    {name: "jacky", value: 10},
    {name: "bea", value: 10},
    {name: "frank", value: 12},
    {name: "mrp", value: 12},
    {name: "lola", value: 12},
    {name: "bo", value: 12},
    {name: "colette", value: 12},
    {name: "pearl", value: 16},
    {name: "bibi", value: 16},
    {name: "mandy", value: 16},
    {name: "ollie", value: 16},
    {name: "chester", value: 20},
    {name: "bonnie", value: 20},
    {name: "leon", value: 24},
    {name: "max", value: 24},
    {name: "melodie", value: 24},
    {name: "amber", value: 30},
    {name: "meg", value: 36},
    {name: "kaze", value: 32}
];

const locationList: {levelid: number; name: string; displayName: string}[] = [
    {levelid: 0, name: "entrance", displayName: "Entrance"},
    {levelid: 1, name: "hub", displayName: "Starr Park Hub"},
    {levelid: 2, name: "oldtown", displayName: "Old Town"},
    {levelid: 3, name: "biodome", displayName: "Biodome"},
    {levelid: 4, name: "ghostmetro", displayName: "Ghost Station"},
    {levelid: 5, name: "deepsea", displayName: "Deep Sea"},
    {levelid: 6, name: "giftshop", displayName: "Gift Shop"},
    {levelid: 14, name: "enchantedforest", displayName: "Enchanted Forest"},
    {levelid: 7, name: "retropolis", displayName: "Retropolis"},
    {levelid: 8, name: "candystand", displayName: "Candyland"},
    {levelid: 9, name: "rumblejungle", displayName: "Rumble Jungle"},
    {levelid: 10, name: "stuntshow", displayName: "Stunt Show"},
    {levelid: 11, name: "minicity", displayName: "Super City"},
    {levelid: 15, name: "odditiesshop", displayName: "Oddities Shop"},
    {levelid: 12, name: "arcade", displayName: "Arcade"},
    {levelid: 13, name: "rooftop", displayName: "Rooftop"}
];

// [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const locationWeights: number[] = [12, 12, 15, 15, 12, 12, 12, 6, 9, 9, 8, 8, 8, 6, 6, 0];

//                                                                               1    2    4    6    6    8    8    9    9   10   10   10   10   12   12   12   12   12   16   16   16   16   20   20   24   24   24   30   36   32
const levelTiers: {maxEnemies: number; delayFactor: number; waves: number[]; weights: number[];}[] = [
    {maxEnemies: 25, delayFactor: 1.25, waves: [12, 8],              weights: [160, 300, 100, 100, 100,  60,  60,  60,  60,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 0
    {maxEnemies: 25, delayFactor: 1.10, waves: [12, 12, 8],          weights: [120, 250,  90,  90,  90,  60,  60,  60,  60,  30,  30,  30,  30,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 1
    {maxEnemies: 25, delayFactor: 1.00, waves: [16, 12, 12],         weights: [100, 200,  80,  80,  80,  60,  60,  60,  60,  30,  30,  30,  30,  20,  20,  20,  20,  20,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 2
    {maxEnemies: 25, delayFactor: 0.90, waves: [20, 16, 12],         weights: [ 50, 100,  60,  60,  60,  60,  60,  60,  60,  50,  50,  50,  50,  30,  30,  30,  30,  30,  20,  20,  20,  20,   0,   0,   0,   0,   0,   0,   0,   0]},// 3
    {maxEnemies: 25, delayFactor: 0.85, waves: [20, 14, 12, 8],      weights: [  0,  50,  30,  50,  50,  50,  50,  60,  60,  60,  60,  60,  60,  40,  40,  40,  40,  40,  30,  30,  30,  30,  20,  20,   0,   0,   0,   0,   0,   0]},// 4
    {maxEnemies: 25, delayFactor: 0.80, waves: [20, 16, 12, 12],     weights: [  0,   0,  30,  40,  40,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  50,  50,  50,  40,  40,  40,  40,  30,  30,  20,  20,  20,   0,   0,   0]},// 5
    {maxEnemies: 25, delayFactor: 0.75, waves: [24, 20, 16, 12],     weights: [  0,   0,  25,  25,  25,  35,  35,  35,  35,  45,  45,  45,  45,  50,  50,  50,  50,  50,  45,  45,  45,  45,  30,  30,  25,  25,  25,  25,  15,   0]},// 6
    {maxEnemies: 25, delayFactor: 0.70, waves: [30, 24, 18, 12],     weights: [  0,   0,  10,  20,  20,  30,  30,  30,  30,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  50,  50,  50,  35,  35,  30,  30,  30,  25,  20,  15]},// 7
    {maxEnemies: 25, delayFactor: 0.65, waves: [30, 24, 18, 16, 12], weights: [  0,   0,   0,  15,  15,  30,  30,  30,  30,  40,  40,  40,  40,  45,  45,  45,  45,  45,  50,  50,  50,  50,  40,  40,  35,  35,  35,  30,  30,  20]},// 8
    {maxEnemies: 25, delayFactor: 0.60, waves: [32, 30, 24, 18, 16], weights: [  0,   0,   0,  10,  10,  25,  25,  25,  25,  40,  40,  40,  40,  40,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  40,  40,  40,  35,  35,  30]} // 9
];

const masteryStats: number[] = [
     8.00,  8.00,  8.00,  8.25,  8.50,  8.75,
     9.00,  9.50, 10.00, 10.50, 11.00, 11.50,
    12.00, 12.50, 13.00, 13.50, 14.00, 14.75,
    15.50, 16.25, 17.00, 17.50, 18.25, 18.75,
    19.25, 20.00, 21.50, 22.25, 22.75, 23.25,
    24.00, 24.00, 24.50, 25.00, 25.00, 25.50,
    26.00
];

interface RandomPreset{
    config: ChallengeConfig;
    difficulty: {
        strengthTier: number;
        healthBonusReq: number;
        timePerEnemy: number;
        completion: number[];
        time: number[];
    };
    waves: number[];
    options: {
        level: number;
        power: number;
        accs: number;
    };
}
const presets = new Map<string, RandomPreset>([
    ["random1", {
        config: {
            displayName: "Random Challenge - Tier 1", recommendedLvl: 8,
            baseWinMastery: [2], baseLossMastery: [2], baseCoins: [1.25], baseBadges: [2]
        },
        difficulty: {
            strengthTier: 0, healthBonusReq: 0.3, timePerEnemy: 0.7,
            completion: [150, 150], time: [90, 90]
        },
        waves: [0, 1],
        options: {level: 8, power: 4, accs: 0}
    }],
    ["random2", {
        config: {
            displayName: "Random Challenge - Tier 2", recommendedLvl: 16,
            baseWinMastery: [25], baseLossMastery: [20], baseCoins: [1.75], baseBadges: [4]
        },
        difficulty: {
            strengthTier: 1, healthBonusReq: 0.45, timePerEnemy: 0.7,
            completion: [75, 100, 125], time: [60, 60, 60]
        },
        waves: [2, 3, 5],
        options: {level: 16, power: 10, accs: 18}
    }],
    ["random3", {
        config: {
            displayName: "Random Challenge - Tier 3", recommendedLvl: 22,
            baseWinMastery: [100], baseLossMastery: [60], baseCoins: [2.5], baseBadges: [7]
        },
        difficulty: {
            strengthTier: 2, healthBonusReq: 0.5, timePerEnemy: 0.7,
            completion: [60, 90, 150], time: [45, 60, 75]
        },
        waves: [4, 6, 7],
        options: {level: 22, power: 16, accs: 24}
    }],
    ["random4", {
        config: {
            displayName: "Random Challenge - Tier 4", recommendedLvl: 26,
            baseWinMastery: [200], baseLossMastery: [100], baseCoins: [4], baseBadges: [10]
        },
        difficulty: {
            strengthTier: 3, healthBonusReq: 0.55, timePerEnemy: 0.7,
            completion: [30, 60, 90, 120], time: [30, 40, 50, 60]
        },
        waves: [4, 6, 7, 8],
        options: {level: 28, power: 22, accs: 27}
    }],
    ["random5", {
        config: {
            displayName: "Random Challenge - Tier 5", recommendedLvl: 30,
            baseWinMastery: [360], baseLossMastery: [180], baseCoins: [5], baseBadges: [12]
        },
        difficulty: {
            strengthTier: 4, healthBonusReq: 0.6, timePerEnemy: 0.7,
            completion: [30, 60, 90, 120], time: [30, 40, 50, 60]
        },
        waves: [5, 7, 8, 9],
        options: {level: 35, power: 28, accs: 30}
    }]
]);

export {enemyList, locationList, locationWeights, levelTiers, masteryStats};
export default presets;
