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
    {name: "brock", value: 16},
    {name: "ollie", value: 16},
    {name: "chester", value: 20},
    {name: "bonnie", value: 20},
    {name: "leon", value: 24},
    {name: "max", value: 24},
    {name: "melodie", value: 24},
    {name: "amber", value: 30},
    {name: "meg", value: 36},
    {name: "kaze", value: 32},
    {name: "siegebase", value: 1}
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
    {levelid: 13, name: "rooftop", displayName: "Rooftop"},
    {levelid: 16, name: "scrapyard", displayName: "Scrapyard"}
];

// [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const locationWeights: number[][] = [
    [0, 12, 15, 14, 13, 12, 12, 6, 12, 12, 11, 10, 9, 6, 6, 0, 0],
    [0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
];

interface RandomLevelConfig{delayFactor: number; waves: number[]; weights: number[];}
//                                                                  1    2    4    6    6    8    8    9    9   10   10   10   10   12   12   12   12   12   16   16   16   16   20   20   24   24   24   30   36   32    0
const levelTiers: RandomLevelConfig[] = [
    {delayFactor: 1.25, waves: [12, 8],                 weights: [160, 300, 100, 100, 100,  60,  60,  60,  60,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 0
    {delayFactor: 1.10, waves: [12, 12, 8],             weights: [120, 250,  90,  90,  90,  60,  60,  60,  60,  30,  30,  30,  30,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 1
    {delayFactor: 1.00, waves: [16, 12, 12],            weights: [100, 200,  80,  80,  80,  60,  60,  60,  60,  30,  30,  30,  30,  20,  20,  20,  20,  20,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 2
    {delayFactor: 0.90, waves: [20, 16, 12],            weights: [ 50, 100,  60,  60,  60,  60,  60,  60,  60,  50,  50,  50,  50,  30,  30,  30,  30,  30,  20,  20,  20,  20,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 3
    {delayFactor: 0.85, waves: [20, 14, 12, 8],         weights: [  0,  50,  30,  50,  50,  50,  50,  60,  60,  60,  60,  60,  60,  40,  40,  40,  40,  40,  30,  30,  30,  30,  20,  20,   0,   0,   0,   0,   0,   0,   0]},// 4
    {delayFactor: 0.80, waves: [20, 16, 12, 12],        weights: [  0,   0,  30,  40,  40,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  50,  50,  50,  40,  40,  40,  40,  30,  30,  20,  20,  20,   0,   0,   0,   0]},// 5
    {delayFactor: 0.75, waves: [24, 20, 16, 12],        weights: [  0,   0,  25,  25,  25,  35,  35,  35,  35,  45,  45,  45,  45,  50,  50,  50,  50,  50,  45,  45,  45,  45,  30,  30,  25,  25,  25,  25,  15,   0,   0]},// 6
    {delayFactor: 0.70, waves: [30, 24, 18, 12],        weights: [  0,   0,  10,  20,  20,  30,  30,  30,  30,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  50,  50,  50,  35,  35,  30,  30,  30,  25,  20,  15,   0]},// 7
    {delayFactor: 0.65, waves: [30, 24, 18, 16, 12],    weights: [  0,   0,   0,  15,  15,  30,  30,  30,  30,  40,  40,  40,  40,  45,  45,  45,  45,  45,  50,  50,  50,  50,  40,  40,  35,  35,  35,  30,  30,  20,   0]},// 8
    {delayFactor: 0.60, waves: [32, 30, 24, 18, 16],    weights: [  0,   0,   0,  10,  10,  25,  25,  25,  25,  40,  40,  40,  40,  40,  40,  40,  40,  40,  50,  50,  50,  50,  50,  50,  40,  40,  40,  35,  35,  30,   0]},// 9

    {delayFactor: 0.30, waves: [4],                     weights: [  0,   0,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 10
    {delayFactor: 0.30, waves: [8],                     weights: [  0,   0,   0,   0,   0,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 11
    {delayFactor: 0.30, waves: [9],                     weights: [  0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 12
    {delayFactor: 0.30, waves: [10],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 13
    {delayFactor: 0.30, waves: [12],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 14
    {delayFactor: 0.30, waves: [16],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 15
    {delayFactor: 0.30, waves: [20],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0,   0,   0,   0,   0,   0]},// 16
    {delayFactor: 0.30, waves: [24],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0,   0,   0,   0]},// 17
    {delayFactor: 0.30, waves: [24],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0,   0,   0]},// 18
    {delayFactor: 0.30, waves: [32],                    weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0]},// 19

    {delayFactor: 4.00, waves: [1],
                                                        weights: [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1]},// 20

    {delayFactor: 1.20, waves: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
                                                        weights: [  0, 160,  50,  50,  50,  75,  75,  75,  75,  60,  60,  60,  60,  30,  30,  30,  30,  30,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0]},// 21

    {delayFactor: 1.00, waves: [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
                                                        weights: [  0,   0,   0,  40,  40,  60,  60,  70,  70,  60,  60,  60,  60,  50,  50,  50,  50,  50,  45,  45,  45,   0,  35,   0,   0,   0,   0,   0,   0,   0,   0]},// 22
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
    stages: {
        index: number;
        maxEnemies?: number;
        winCon?: boolean;
        spawnRegion?: string;
        waveWait?: boolean;
        repeat?: number;
    }[][];
    location: number;
    options: {
        level: number;
        power: number;
        accs: number;
    };
}
const presets = new Map<string, RandomPreset>([
    ["random1", {
        config: {
            displayName: "Random Challenge - Tier 1", recommendedLvl: 6,
            baseWinMastery: [6], baseLossMastery: [3], baseCoins: [1.25], baseBadges: [2]
        },
        difficulty: {
            strengthTier: 0, healthBonusReq: 0.3, timePerEnemy: 0.7,
            completion: [150, 150], time: [90, 90]
        },
        stages: [
            [{index: 0}],
            [{index: 1}]
        ],
        location: 0,
        options: {level: 6, power: 3, accs: 0}
    }],
    ["random2", {
        config: {
            displayName: "Random Challenge - Tier 2", recommendedLvl: 14,
            baseWinMastery: [36], baseLossMastery: [20], baseCoins: [1.75], baseBadges: [4]
        },
        difficulty: {
            strengthTier: 1, healthBonusReq: 0.45, timePerEnemy: 0.7,
            completion: [75, 100, 125], time: [60, 60, 60]
        },
        stages: [
            [{index: 2}],
            [{index: 3}],
            [{index: 5}]
        ],
        location: 0,
        options: {level: 14, power: 8, accs: 18}
    }],
    ["random3", {
        config: {
            displayName: "Random Challenge - Tier 3", recommendedLvl: 22,
            baseWinMastery: [120], baseLossMastery: [60], baseCoins: [2.5], baseBadges: [7]
        },
        difficulty: {
            strengthTier: 2, healthBonusReq: 0.5, timePerEnemy: 0.7,
            completion: [60, 90, 150], time: [45, 60, 75]
        },
        stages: [
            [{index: 4}],
            [{index: 6}],
            [{index: 7}]
        ],
        location: 0,
        options: {level: 22, power: 16, accs: 24}
    }],
    ["random4", {
        config: {
            displayName: "Random Challenge - Tier 4", recommendedLvl: 26,
            baseWinMastery: [240], baseLossMastery: [120], baseCoins: [4], baseBadges: [10]
        },
        difficulty: {
            strengthTier: 3, healthBonusReq: 0.55, timePerEnemy: 0.7,
            completion: [30, 60, 90, 120], time: [30, 40, 50, 60]
        },
        stages: [
            [{index: 4}],
            [{index: 6}],
            [{index: 7}],
            [{index: 8}]
        ],
        location: 0,
        options: {level: 28, power: 22, accs: 27}
    }],
    ["random5", {
        config: {
            displayName: "Random Challenge - Tier 5", recommendedLvl: 30,
            baseWinMastery: [400], baseLossMastery: [200], baseCoins: [5], baseBadges: [12]
        },
        difficulty: {
            strengthTier: 4, healthBonusReq: 0.6, timePerEnemy: 0.7,
            completion: [30, 60, 90, 120], time: [30, 40, 50, 60]
        },
        stages: [
            [{index: 5}],
            [{index: 7}],
            [{index: 8}],
            [{index: 9}]
        ],
        location: 0,
        options: {level: 35, power: 28, accs: 30}
    }],
    ["miniboss1", {
        config: {
            displayName: "Miniboss Challenge - Tier 1", recommendedLvl: 10,
            baseWinMastery: [10], baseLossMastery: [5], baseCoins: [1.75], baseBadges: [4]
        },
        difficulty: {
            strengthTier: 1, healthBonusReq: 0.4, timePerEnemy: 0.6,
            completion: [300], time: [180]
        },
        stages: [
            [
                {index: 10, maxEnemies: 3, repeat: 3},
                {index: 15, maxEnemies: 0, waveWait: true},
                {index: 11, maxEnemies: 3, waveWait: true, repeat: 3},
                {index: 16, maxEnemies: 0, waveWait: true},
            ]
        ],
        location: 1,
        options: {level: 10, power: 0, accs: 12}
    }],
    ["miniboss2", {
        config: {
            displayName: "Miniboss Challenge - Tier 2", recommendedLvl: 20,
            baseWinMastery: [50], baseLossMastery: [25], baseCoins: [2.5], baseBadges: [6]
        },
        difficulty: {
            strengthTier: 2, healthBonusReq: 0.5, timePerEnemy: 0.6,
            completion: [300], time: [180]
        },
        stages: [
            [
                {index: 11, maxEnemies: 3, repeat: 3},
                {index: 16, maxEnemies: 0, waveWait: true},
                {index: 13, maxEnemies: 3, waveWait: true, repeat: 3},
                {index: 18, maxEnemies: 0, waveWait: true},
            ]
        ],
        location: 1,
        options: {level: 20, power: 0, accs: 22}
    }],
    ["miniboss3", {
        config: {
            displayName: "Miniboss Challenge - Tier 3", recommendedLvl: 30,
            baseWinMastery: [120], baseLossMastery: [60], baseCoins: [4], baseBadges: [10]
        },
        difficulty: {
            strengthTier: 3, healthBonusReq: 0.55, timePerEnemy: 0.6,
            completion: [300], time: [180]
        },
        stages: [
            [
                {index: 12, maxEnemies: 3, repeat: 3},
                {index: 17, maxEnemies: 0, waveWait: true},
                {index: 14, maxEnemies: 3, waveWait: true, repeat: 3},
                {index: 19, maxEnemies: 0, waveWait: true},
            ]
        ],
        location: 1,
        options: {level: 30, power: 0, accs: 30}
    }],
    ["siege1", {
        config: {
            displayName: "Siege Challenge - Tier 1", recommendedLvl: 16,
            baseWinMastery: [20], baseLossMastery: [10], baseCoins: [2], baseBadges: [5]
        },
        difficulty: {
            strengthTier: 1, healthBonusReq: 0.5, timePerEnemy: 0.5,
            completion: [300], time: [180]
        },
        stages: [
            [
                {index: 20, winCon: true},
                {index: 21, maxEnemies: 4, spawnRegion: "center2"}
            ]
        ],
        location: 2,
        options: {level: 16, power: 0, accs: 0}
    }],
    ["siege2", {
        config: {
            displayName: "Siege Challenge - Tier 2", recommendedLvl: 30,
            baseWinMastery: [120], baseLossMastery: [60], baseCoins: [4], baseBadges: [10]
        },
        difficulty: {
            strengthTier: 3, healthBonusReq: 0.5, timePerEnemy: 0.5,
            completion: [300], time: [180]
        },
        stages: [
            [
                {index: 20, winCon: true},
                {index: 22, maxEnemies: 5, spawnRegion: "center2"}
            ]
        ],
        location: 2,
        options: {level: 30, power: 0, accs: 0}
    }]
]);

export {RandomPreset, enemyList, locationList, locationWeights, levelTiers, masteryStats};
export default presets;
