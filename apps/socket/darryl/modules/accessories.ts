import {ACCESSORY_IMAGE_DIR, IMAGE_FILE_EXTENSION, CHALLENGE_WIN_MULTIPLIER, CHALLENGE_COINS_PER_TOKEN, RANDOM_CHALLENGE_START, PLAYER_CHALLENGE_START} from "../constants";
import {
    DatabaseAccessories, 
    AccessoryPreview, 
    AccessoryData, 
    UnitOptions, 
    UnitPreview, 
    UnitOptionsStorage, 
    UnitSelection,  
    ChallengeManagerOptions, 
    ChallengePreview
} from "../types";

interface LevelData{
    upgradePoints: number;
    unitsPerChallenge: number;
    weightMultiplier: number;
}

// A player's current level and their challenge points collected towards the next level
type LevelProgress = [number, number];
type StatsMap = Map<number, number[]>;

const levels: LevelData[] = [
    {upgradePoints:      400, unitsPerChallenge: 1, weightMultiplier:   4},
    {upgradePoints:      800, unitsPerChallenge: 3, weightMultiplier:   4},
    {upgradePoints:     1600, unitsPerChallenge: 3, weightMultiplier:   5},
    {upgradePoints:     2400, unitsPerChallenge: 3, weightMultiplier:   5},
    {upgradePoints:     3600, unitsPerChallenge: 3, weightMultiplier:   6},
    {upgradePoints:     4800, unitsPerChallenge: 4, weightMultiplier:   6},
    {upgradePoints:     6400, unitsPerChallenge: 4, weightMultiplier:   8},
    {upgradePoints:     8000, unitsPerChallenge: 4, weightMultiplier:   8},
    {upgradePoints:    10000, unitsPerChallenge: 4, weightMultiplier:  10},
    {upgradePoints:    14000, unitsPerChallenge: 5, weightMultiplier:  10},
    {upgradePoints:    20000, unitsPerChallenge: 5, weightMultiplier:  14},
    {upgradePoints:    28000, unitsPerChallenge: 5, weightMultiplier:  14},
    {upgradePoints:    36000, unitsPerChallenge: 5, weightMultiplier:  18},
    {upgradePoints:    48000, unitsPerChallenge: 6, weightMultiplier:  18},
    {upgradePoints:    72000, unitsPerChallenge: 6, weightMultiplier:  26},
    {upgradePoints:   108000, unitsPerChallenge: 6, weightMultiplier:  26},
    {upgradePoints:   144000, unitsPerChallenge: 6, weightMultiplier:  40},
    {upgradePoints:   192000, unitsPerChallenge: 6, weightMultiplier:  40},
    {upgradePoints:   240000, unitsPerChallenge: 6, weightMultiplier:  56},
    {upgradePoints:   400000, unitsPerChallenge: 7, weightMultiplier:  56},
    {upgradePoints:   560000, unitsPerChallenge: 7, weightMultiplier:  88},
    {upgradePoints:   800000, unitsPerChallenge: 7, weightMultiplier:  88},
    {upgradePoints:  1200000, unitsPerChallenge: 7, weightMultiplier: 144},
    {upgradePoints:  1600000, unitsPerChallenge: 7, weightMultiplier: 144},
    {upgradePoints:  2400000, unitsPerChallenge: 7, weightMultiplier: 224},
    {upgradePoints:  4000000, unitsPerChallenge: 8, weightMultiplier: 224},
    {upgradePoints:  6000000, unitsPerChallenge: 8, weightMultiplier: 400},
    {upgradePoints:  8400000, unitsPerChallenge: 8, weightMultiplier: 400},
    {upgradePoints: 12000000, unitsPerChallenge: 8, weightMultiplier: 720},
    {upgradePoints:       -1, unitsPerChallenge: 8, weightMultiplier: 720}
];

const unitCounts: number[] = levels.map((value) => value.unitsPerChallenge);

const weightMap: StatsMap = new Map<number, number[]>([
    [1, levels.filter((value, index) => index % 2 === 1).map((value) => value.weightMultiplier)]
]);

const totalCosts: number[] = levels.reduce((previousValue, currentValue) => {
    if (currentValue.upgradePoints < 0){
        return previousValue;
    }
    if (previousValue.length === 0){
        return previousValue.concat([currentValue.upgradePoints]);
    }
    return previousValue.concat([currentValue.upgradePoints + previousValue[previousValue.length - 1]]);
}, [0]);

const healthMap: StatsMap = new Map<number, number[]>([
    [  160, [   160,    176,    192,    212,    232,    260,    288,    320,    352,    388,    432,    480,    528,    580,    640]],
    [  240, [   240,    264,    288,    320,    352,    392,    432,    480,    528,    584,    648,    720,    792,    872,    960]],
    [  300, [   300,    328,    360,    400,    440,    488,    540,    600,    660,    728,    808,    900,    988,   1088,   1200]],
    [  400, [   400,    440,    480,    532,    584,    652,    720,    800,    880,    972,   1080,   1200,   1320,   1452,   1600]],
    [  440, [   440,    484,    528,    584,    644,    716,    792,    880,    968,   1068,   1188,   1320,   1452,   1596,   1760]],
    [  480, [   480,    528,    576,    640,    704,    784,    864,    960,   1056,   1168,   1296,   1440,   1584,   1744,   1920]],
    [  500, [   500,    548,    600,    664,    732,    816,    900,   1000,   1100,   1216,   1348,   1500,   1648,   1816,   2000]],
    [  540, [   540,    592,    648,    720,    792,    880,    972,   1080,   1188,   1312,   1456,   1620,   1780,   1960,   2160]],
    [  600, [   600,    660,    720,    800,    880,    980,   1080,   1200,   1320,   1460,   1620,   1800,   1980,   2180,   2400]],
    [  640, [   640,    704,    768,    848,    936,   1040,   1152,   1280,   1408,   1552,   1728,   1920,   2112,   2320,   2560]],
    [  720, [   720,    792,    864,    960,   1056,   1176,   1296,   1440,   1584,   1752,   1944,   2160,   2376,   2616,   2880]],
    [  800, [   800,    880,    960,   1064,   1168,   1304,   1440,   1600,   1760,   1944,   2160,   2400,   2640,   2904,   3200]],
    [  880, [   880,    968,   1056,   1168,   1288,   1432,   1584,   1760,   1936,   2136,   2376,   2640,   2904,   3192,   3520]],
    [  960, [   960,   1056,   1152,   1280,   1408,   1568,   1728,   1920,   2112,   2336,   2592,   2880,   3168,   3488,   3840]],
    [ 1000, [  1000,   1096,   1200,   1328,   1464,   1632,   1800,   2000,   2200,   2432,   2688,   3000,   3296,   3632,   4000]],
    [ 1080, [  1080,   1184,   1296,   1440,   1584,   1760,   1944,   2160,   2376,   2624,   2912,   3240,   3560,   3920,   4320]],
    [ 1200, [  1200,   1320,   1440,   1600,   1760,   1960,   2160,   2400,   2640,   2920,   3240,   3600,   3960,   4360,   4800]],
    [ 1400, [  1400,   1540,   1680,   1860,   2040,   2280,   2520,   2800,   3080,   3400,   3780,   4200,   4620,   5080,   5600]],
    [ 1500, [  1500,   1640,   1800,   2000,   2200,   2440,   2700,   3000,   3300,   3640,   4040,   4500,   4940,   5440,   6000]],
    [ 1600, [  1600,   1760,   1920,   2120,   2340,   2600,   2880,   3200,   3520,   3880,   4320,   4800,   5280,   5800,   6400]],
    [ 1800, [  1800,   1980,   2160,   2400,   2640,   2940,   3240,   3600,   3960,   4380,   4860,   5400,   5940,   6540,   7200]],
    [ 2000, [  2000,   2200,   2400,   2640,   2920,   3240,   3600,   4000,   4400,   4840,   5400,   6000,   6600,   7240,   8000]],
    [ 2200, [  2200,   2400,   2640,   2920,   3200,   3560,   3960,   4400,   4840,   5320,   5920,   6600,   7240,   7960,   8800]],
    [ 2400, [  2400,   2640,   2880,   3200,   3520,   3920,   4320,   4800,   5280,   5840,   6480,   7200,   7920,   8720,   9600]],
    [ 2800, [  2800,   3080,   3360,   3720,   4080,   4560,   5040,   5600,   6160,   6800,   7560,   8400,   9240,  10160,  11200]],
    [ 3000, [  3000,   3280,   3600,   4000,   4400,   4880,   5400,   6000,   6600,   7280,   8080,   9000,   9880,  10880,  12000]],
    [ 3200, [  3200,   3520,   3840,   4240,   4680,   5200,   5760,   6400,   7040,   7760,   8640,   9600,  10560,  11600,  12800]],
    [ 3600, [  3600,   3960,   4320,   4800,   5280,   5880,   6480,   7200,   7920,   8760,   9720,  10800,  11880,  13080,  14400]],
    [ 4000, [  4000,   4400,   4800,   5320,   5840,   6520,   7200,   8000,   8800,   9720,  10800,  12000,  13200,  14520,  16000]],
    [ 4400, [  4400,   4840,   5280,   5840,   6440,   7160,   7920,   8800,   9680,  10680,  11880,  13200,  14520,  15960,  17600]],
    [ 4800, [  4800,   5280,   5760,   6400,   7040,   7840,   8640,   9600,  10560,  11680,  12960,  14400,  15840,  17440,  19200]],
    [ 5000, [  5000,   5480,   6000,   6640,   7320,   8160,   9000,  10000,  11000,  12160,  13480,  15000,  16480,  18160,  20000]],
    [ 5200, [  5200,   5720,   6240,   6920,   7600,   8480,   9360,  10400,  11440,  12640,  14040,  15600,  17160,  18880,  20800]],
    [ 5600, [  5600,   6160,   6720,   7440,   8200,   9120,  10080,  11200,  12320,  13600,  15120,  16800,  18480,  20320,  22400]],
    [ 6000, [  6000,   6600,   7200,   8000,   8800,   9800,  10800,  12000,  13200,  14600,  16200,  18000,  19800,  21800,  24000]],
    [ 6400, [  6400,   7040,   7680,   8520,   9360,  10440,  11520,  12800,  14080,  15560,  17280,  19200,  21120,  23240,  25600]],
    [ 7200, [  7200,   7920,   8640,   9600,  10560,  11760,  12960,  14400,  15840,  17520,  19440,  21600,  23760,  26160,  28800]],
    [ 8000, [  8000,   8800,   9600,  10640,  11720,  13040,  14400,  16000,  17600,  19440,  21600,  24000,  26400,  29040,  32000]],
    [ 8400, [  8400,   9200,  10080,  11200,  12280,  13680,  15120,  16800,  18480,  20440,  22680,  25200,  27720,  30520,  33600]],
    [ 9200, [  9200,  10120,  11040,  12240,  13480,  15000,  16560,  18400,  20240,  22360,  24840,  27600,  30360,  33400,  36800]],
    [10000, [ 10000,  11000,  12000,  13320,  14640,  16320,  18000,  20000,  22000,  24320,  27000,  30000,  33000,  36320,  40000]],
    [10800, [ 10800,  11840,  12960,  14400,  15840,  17600,  19440,  21600,  23760,  26240,  29120,  32400,  35600,  39200,  43200]],
    [12000, [ 12000,  13200,  14400,  16000,  17600,  19600,  21600,  24000,  26400,  29200,  32400,  36000,  39600,  43600,  48000]],
    [14400, [ 14400,  15840,  17280,  19200,  21120,  23520,  25920,  28800,  31680,  35040,  38880,  43200,  47520,  52320,  57600]],
    [16000, [ 16000,  17600,  19200,  21320,  23440,  26120,  28800,  32000,  35200,  38920,  43200,  48000,  52800,  58120,  64000]],
    [20000, [ 20000,  22000,  24000,  26640,  29280,  32640,  36000,  40000,  44000,  48640,  54000,  60000,  66000,  72640,  80000]],
    [24000, [ 24000,  26400,  28800,  32000,  35200,  39200,  43200,  48000,  52800,  58400,  64800,  72000,  79200,  87200,  96000]],
    [28800, [ 28800,  31680,  34560,  38400,  42240,  47040,  51840,  57600,  63360,  70080,  77760,  86400,  95040, 104640, 115200]],
    [48000, [ 48000,  52800,  57600,  64000,  70400,  78400,  86400,  96000, 105600, 116800, 129600, 144000, 158400, 174400, 192000]]
]);

const damageMap: StatsMap = new Map<number, number[]>([
    [  120, [   120,    132,    144,    160,    176,    196,    216,    240,    264,    292,    324,    360,    396,    436,    480]],
    [  240, [   240,    264,    288,    320,    352,    392,    432,    480,    528,    584,    648,    720,    792,    872,    960]],
    [  300, [   300,    332,    360,    400,    440,    492,    540,    600,    660,    732,    812,    900,    992,   1092,   1200]],
    [  320, [   320,    352,    384,    428,    472,    524,    576,    640,    704,    780,    864,    960,   1056,   1164,   1280]],
    [  360, [   360,    396,    432,    480,    528,    588,    648,    720,    792,    876,    972,   1080,   1188,   1308,   1440]],
    [  400, [   400,    440,    480,    536,    588,    656,    720,    800,    880,    976,   1080,   1200,   1320,   1456,   1600]],
    [  440, [   440,    484,    528,    584,    644,    716,    792,    880,    968,   1068,   1188,   1320,   1452,   1596,   1760]],
    [  480, [   480,    528,    576,    640,    704,    784,    864,    960,   1056,   1168,   1296,   1440,   1584,   1744,   1920]],
    [  500, [   500,    552,    600,    668,    736,    820,    900,   1000,   1100,   1220,   1352,   1500,   1652,   1820,   2000]],
    [  520, [   520,    572,    624,    692,    764,    852,    936,   1040,   1144,   1268,   1404,   1560,   1716,   1892,   2080]],
    [  560, [   560,    616,    672,    748,    820,    916,   1008,   1120,   1232,   1364,   1512,   1680,   1848,   2036,   2240]],
    [  600, [   600,    660,    720,    800,    880,    980,   1080,   1200,   1320,   1460,   1620,   1800,   1980,   2180,   2400]],
    [  640, [   640,    704,    768,    856,    944,   1048,   1152,   1280,   1408,   1560,   1728,   1920,   2112,   2328,   2560]],
    [  720, [   720,    792,    864,    960,   1056,   1176,   1296,   1440,   1584,   1752,   1944,   2160,   2376,   2616,   2880]],
    [  800, [   800,    880,    960,   1072,   1176,   1312,   1440,   1600,   1760,   1952,   2160,   2400,   2640,   2912,   3200]],
    [  840, [   840,    920,   1008,   1120,   1232,   1368,   1512,   1680,   1848,   2048,   2272,   2520,   2776,   3056,   3360]],
    [  880, [   880,    968,   1056,   1176,   1296,   1440,   1584,   1760,   1936,   2144,   2376,   2640,   2904,   3200,   3520]],
    [  960, [   960,   1056,   1152,   1280,   1408,   1568,   1728,   1920,   2112,   2336,   2592,   2880,   3168,   3488,   3840]],
    [ 1000, [  1000,   1104,   1200,   1336,   1472,   1640,   1800,   2000,   2200,   2440,   2704,   3000,   3304,   3640,   4000]],
    [ 1040, [  1040,   1144,   1248,   1384,   1528,   1704,   1872,   2080,   2288,   2536,   2808,   3120,   3432,   3784,   4160]],
    [ 1120, [  1120,   1232,   1344,   1496,   1648,   1832,   2016,   2240,   2464,   2728,   3024,   3360,   3704,   4072,   4480]],
    [ 1200, [  1200,   1320,   1440,   1600,   1760,   1960,   2160,   2400,   2640,   2920,   3240,   3600,   3960,   4360,   4800]],
    [ 1280, [  1280,   1420,   1540,   1720,   1880,   2100,   2320,   2560,   2820,   3120,   3460,   3840,   4240,   4660,   5120]],
    [ 1400, [  1400,   1540,   1680,   1880,   2060,   2300,   2520,   2800,   3080,   3420,   3780,   4200,   4620,   5100,   5600]],
    [ 1500, [  1500,   1660,   1800,   2000,   2200,   2460,   2700,   3000,   3300,   3660,   4060,   4500,   4960,   5460,   6000]],
    [ 1600, [  1600,   1760,   1920,   2140,   2360,   2620,   2880,   3200,   3520,   3900,   4320,   4800,   5280,   5820,   6400]],
    [ 1800, [  1800,   1980,   2160,   2400,   2640,   2940,   3240,   3600,   3960,   4380,   4860,   5400,   5940,   6540,   7200]],
    [ 2000, [  2000,   2200,   2400,   2680,   2960,   3280,   3600,   4000,   4400,   4880,   5400,   6000,   6600,   7280,   8000]],
    [ 2400, [  2400,   2640,   2880,   3200,   3520,   3920,   4320,   4800,   5280,   5840,   6480,   7200,   7920,   8720,   9600]],
    [ 2800, [  2800,   3080,   3360,   3760,   4120,   4600,   5040,   5600,   6160,   6840,   7560,   8400,   9240,  10200,  11200]],
    [ 3000, [  3000,   3320,   3600,   4000,   4400,   4920,   5400,   6000,   6600,   7320,   8120,   9000,   9920,  10920,  12000]],
    [ 3200, [  3200,   3520,   3840,   4280,   4720,   5240,   5760,   6400,   7040,   7800,   8640,   9600,  10560,  11640,  12800]],
    [ 3600, [  3600,   3960,   4320,   4800,   5280,   5880,   6480,   7200,   7920,   8760,   9720,  10800,  11880,  13080,  14400]],
    [ 4800, [  4800,   5280,   5760,   6400,   7040,   7840,   8640,   9600,  10560,  11680,  12960,  14400,  15840,  17440,  19200]],
    [ 6000, [  6000,   6600,   7200,   8000,   8800,   9800,  10800,  12000,  13200,  14600,  16200,  18000,  19800,  21800,  24000]],
]);

//------------------------------------------------------------------------------------------------//
//                                        Cards version: 18                                       //
//------------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------------//
//                                           Test Units                                           //
//------------------------------------------------------------------------------------------------//

const emptyUnit: UnitOptionsStorage = {
    display: {},
    stats: {},
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 1,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

const defaultUnit: UnitOptionsStorage = {
    display: {
        displayName: "Default Unit"
    },
    stats: {
        health: 1,
        shield: 0,
        damage: 1,
        range: 1.0,
        targets: 1,
        speed: 1,
        specialMoves: false,
        specialAttacks: false,
        weight: 1
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 1,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

//------------------------------------------------------------------------------------------------//
//                                           Basic Units                                          //
//------------------------------------------------------------------------------------------------//

const fighter: UnitOptionsStorage = {
    display: {
        displayName: "Fighter",
        image: "icon_fighter"
    },
    stats: {
        health: 5000,
        damage: 480,
        range: 2.5,
        targets: 1,
        speed: 2,
        weight: 0.80
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 1,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

const tank: UnitOptionsStorage = {
    display: {
        displayName: "Tank",
        image: "icon_tank"
    },
    stats: {
        health: 10800,
        damage: 300,
        range: 1.5,
        targets: 1,
        speed: 2,
        weight: 0.80
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 2,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

const controller: UnitOptionsStorage = {
    display: {
        displayName: "Controller",
        image: "icon_controller"
    },
    stats: {
        health: 6400,
        damage: 360,
        range: 2.5,
        targets: 2,
        speed: 1,
        weight: 0.80
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 4,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

const sharpshooter: UnitOptionsStorage = {
    display: {
        displayName: "Sharpshooter",
        image: "icon_sharpshooter"
    },
    stats: {
        health: 1600,
        damage: 960,
        range: 3.5,
        targets: 1,
        speed: 2,
        weight: 0.80
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 2,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

const assassin: UnitOptionsStorage = {
    display: {
        displayName: "Assassin",
        image: "icon_assassin"
    },
    stats: {
        health: 3200,
        damage: 1200,
        range: 1.0,
        targets: 1,
        speed: 4,
        weight: 0.80
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 4,
        unlockMethod: "",
        collectionName: "",
        collectionImage: ""
    }
};

//------------------------------------------------------------------------------------------------//
//                                          Fighter Units                                         //
//------------------------------------------------------------------------------------------------//

const shelly: UnitOptionsStorage = {
    display: {
        displayName: "Shelly",
        image: "portrait_shelly"
    },
    stats: {
        health: 4400,
        damage: 800,
        range: 2.5,
        targets: 1,
        speed: 2,
        weight: 0.84
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 6,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Shelly's Shotgun",
        collectionImage: "accessory_shelly"
    }
};

const gus: UnitOptionsStorage = {
    display: {
        displayName: "Gus",
        image: "portrait_gus"
    },
    stats: {
        health: 4000,
        shield: 1200,
        damage: 640,
        range: 3.5,
        targets: 1,
        speed: 2,
        weight: 0.84
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 6,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Gus' Balloon",
        collectionImage: "accessory_gus"
    }
};

const otis: UnitOptionsStorage = {
    display: {
        displayName: "Otis",
        image: "portrait_otis"
    },
    stats: {
        health: 3600,
        shield: 300,
        damage: 1000,
        range: 1.5,
        targets: 1,
        speed: 3,
        weight: 0.88
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 16,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Otis' Starfish",
        collectionImage: "accessory_otis"
    }
};

const janet: UnitOptionsStorage = {
    display: {
        displayName: "Janet",
        image: "portrait_janet"
    },
    stats: {
        health: 5000,
        damage: 520,
        range: 3.5,
        targets: 2,
        speed: 3,
        specialMoves: true,
        weight: 0.88
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 16,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Janet's Microphone",
        collectionImage: "accessory_janet"
    }
};

const lola: UnitOptionsStorage = {
    display: {
        displayName: "Lola",
        image: "portrait_lola"
    },
    stats: {
        health: 5600,
        damage: 480,
        range: 2.5,
        targets: 2,
        speed: 2,
        specialAttacks: true,
        weight: 0.92
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 18,
        unlockMethod: "Win 100 challenges to unlock",
        collectionName: "Lola's Scarf",
        collectionImage: "accessory_lola"
    }
};

const surge: UnitOptionsStorage = {
    display: {
        displayName: "Surge",
        image: "portrait_surge",
        description: "Defeat units to permanently gain stats. First unit defeated increases speed to <o0>, second unit increases range to <r0>, and third unit increases targets to <o1>."
    },
    stats: {
        health: 7200,
        damage: 600,
        range: 1.5,
        targets: 1,
        speed: 2,
        weight: 0.96
    },
    abilities: {
        // Defeat units to permanently gain stats
        // 1st unit: +2 speed
        // 2nd unit: +2 range
        // 3rd unit: +1 target
        // State tracks the number of units defeated
        update: (state, event) => {
            if (event === 3 && state < 3) { return state + 1; }
            return state;
        },
        range: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.range;
        },
        targets: (values, owner) => {
            if (owner.state >= 3) { return values[1]; }
            return owner.targets;
        },
        speed: (values, owner) => {
            if (owner.state >= 1) { return values[0]; }
            return owner.speed;
        },
        description: (state) => {
            return `Units defeated: ${Math.min(3, state)} / 3.`;
        }
    },
    abilityValues: {
        range: [3.5],
        other: [4, 2]
    },
    accessory: {
        unlockLevel: 24,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Surge's Energy Drink",
        collectionImage: "accessory_surge"
    }
};

const colette: UnitOptionsStorage = {
    display: {
        displayName: "Colette",
        image: "portrait_colette",
        description: "Deal more damage to units with more health. Maximum of <d2> damage when attacking units that have at least <h0> maximum health."
    },
    stats: {
        health: 6000,
        damage: 560,
        range: 2.5,
        targets: 1,
        speed: 2,
        weight: 1.00
    },
    abilities: {
        // Deal more damage to units with more maximum health
        // Less than  6000 health:  560 damage
        // At least   6000 health:  840 damage
        // At least   9000 health: 1120 damage
        // At least  12000 health: 1400 damage
        damageToUnit: (values, owner, ownerDamage, opponent, opponentAbilities) => {
            const ownerHealth = owner.maxHealth;
            const opponentHealth = opponentAbilities.maxHealth(opponent);

            if (opponentHealth >= ownerHealth * 2){
                return values[2];
            } else if (opponentHealth >= ownerHealth * 1.5){
                return values[1];
            } else if (opponentHealth >= ownerHealth){
                return values[0];
            }
            return ownerDamage;
        }
    },
    abilityValues: {
        health: [12000],
        damage: [840, 1120, 1400]
    },
    accessory: {
        unlockLevel: 24,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Colette's Scrapbook",
        collectionImage: "accessory_colette"
    }
};

const bonnie: UnitOptionsStorage = {
    display: {
        displayName: "Bonnie",
        image: "portrait_bonnie",
        description: "After defeating 2 units, transform into Bonnie form with <h0> maximum health, <d0> damage, <r0> range, <o0> targets, and <o1> speed."
    },
    stats: {
        health: 10000,
        damage: 440,
        range: 4.5,
        targets: 1,
        speed: 1,
        weight: 1.04
    },
    abilities: {
        // After defeating 2 units, transform into bonnie form
        // with less health but more damage
        // State tracks the number of units defeated
        update: (state, event) => {
            if (event === 3 && state < 3) { return state + 1; }
            return state;
        },
        health: (values, owner, event) => {
            if (event === 3 && owner.state === 2){
                // This only executes on the turn that the 2nd unit is defeated
                // The maxHealth here is for the cannon form
                return Math.min(values[0], owner.health);
            } if (owner.state >= 2 && owner.health > values[0]){
                // If somehow the health is higher than the bonnie form max health
                // then return the max health in bonnie form
                return values[0];
            }
            return owner.health;
        },
        maxHealth: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.maxHealth;
        },
        damage: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.damage;
        },
        range: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.range;
        },
        targets: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.targets;
        },
        speed: (values, owner) => {
            // On the turn when transforming, get 8 speed instead of 4
            if (owner.state >= 3) { return values[1]; }
            if (owner.state === 2) { return values[2]; }
            return owner.speed;
        },
        specialMoves: (owner) => {
            // On the turn when transforming, allow special moves
            if (owner.state === 2) { return true; }
            return owner.specialMoves;
        },
        description: (state) => {
            if (state >= 2) { return "Currently in Bonnie form."; }
            return `Units defeated: ${Math.min(2, state)} / 2.`;
        }
    },
    abilityValues: {
        health: [3000],
        damage: [1040],
        range: [1.5],
        other: [2, 4, 8]
    },
    accessory: {
        unlockLevel: 24,
        unlockMethod: "Complete Puzzle Challenge 5 to unlock",
        collectionName: "Bonnie's Cannon",
        collectionImage: "accessory_bonnie"
    }
};

//------------------------------------------------------------------------------------------------//
//                                           Tank Units                                           //
//------------------------------------------------------------------------------------------------//

const rosa: UnitOptionsStorage = {
    display: {
        displayName: "Rosa",
        image: "portrait_rosa"
    },
    stats: {
        health: 10800,
        damage: 440,
        range: 1.5,
        targets: 1,
        speed: 2,
        weight: 0.88
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 8,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Rosa's Gloves",
        collectionImage: "accessory_rosa"
    }
};

const jacky: UnitOptionsStorage = {
    display: {
        displayName: "Jacky",
        image: "portrait_jacky"
    },
    stats: {
        health: 9200,
        damage: 400,
        range: 1.0,
        targets: 2,
        speed: 3,
        weight: 0.88
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 12,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Jacky's Jackhammer",
        collectionImage: "accessory_jacky"
    }
};

const elprimo: UnitOptionsStorage = {
    display: {
        displayName: "El Primo",
        image: "portrait_elprimo"
    },
    stats: {
        health: 12000,
        damage: 300,
        range: 1.5,
        targets: 3,
        speed: 3,
        weight: 0.92
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 16,
        unlockMethod: "Complete Puzzle Challenge 1 to unlock",
        collectionName: "El Primo's Belt",
        collectionImage: "accessory_elprimo"
    }
};

const darryl: UnitOptionsStorage = {
    display: {
        displayName: "Darryl",
        image: "portrait_darryl"
    },
    stats: {
        health: 20000,
        damage: 240,
        range: 1.0,
        targets: 1,
        speed: 2,
        weight: 0.92
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 20,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Darryl's Barrel",
        collectionImage: "accessory_darryl"
    }
};

const sam: UnitOptionsStorage = {
    display: {
        displayName: "Sam",
        image: "portrait_sam"
    },
    stats: {
        health: 8000,
        damage: 520,
        range: 2.5,
        targets: 1,
        speed: 4,
        specialMoves: true,
        weight: 0.96
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 20,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Sam's Knuckle Busters",
        collectionImage: "accessory_sam"
    }
};

const ash: UnitOptionsStorage = {
    display: {
        displayName: "Ash",
        image: "portrait_ash",
        description: "Gain more speed when at low health. Maximum of <o2> speed when at or below 1/4 of maximum health."
    },
    stats: {
        health: 16000,
        damage: 360,
        range: 1.5,
        targets: 1,
        speed: 2,
        weight: 1.00
    },
    abilities: {
        // Move faster when having less health
        // >= 0.90 * max health: 2 speed
        //  < 0.90 * max health: 3 speed
        //  < 0.70 * max health: 4 speed
        //  < 0.50 * max health: 5 speed
        speed: (values, owner) => {
            const health = owner.health / owner.maxHealth;
            if (health < 0.5){
                return values[2];
            } else if (health < 0.7){
                return values[1];
            } else if (health < 0.9){
                return values[0];
            }
            return owner.speed;
        }
    },
    abilityValues: {
        other: [3, 4, 5]
    },
    accessory: {
        unlockLevel: 26,
        unlockMethod: "Complete Puzzle Challenge 6 to unlock",
        collectionName: "Ash's Broom",
        collectionImage: "accessory_ash"
    }
};

const frank: UnitOptionsStorage = {
    display: {
        displayName: "Frank",
        image: "portrait_frank",
        description: "Increase speed to <o0> after not attacking for a turn."
    },
    stats: {
        health: 24000,
        damage: 120,
        range: 2.5,
        targets: 3,
        speed: 1,
        weight: 1.04
    },
    abilities: {
        // Gain 2 speed when not attacking
        // State tracks the number of turns since the last attack - 1
        update: (state, event) => {
            // Ability logic is the same as Mandy
            if (event === 0 && state < 1) { return state + 1; }
            if (event === 2) { return -1; }
            return state;
        },
        speed: (values, owner) => {
            // State needs to be at least 1 because state is 0 right after
            // a round ends, regardless of whether this unit attacked. Once
            // another round passes without attacking, the state will be 1.
            if (owner.state >= 1) { return values[0]; }
            return owner.speed;
        }
    },
    abilityValues: {
        other: [3]
    },
    accessory: {
        unlockLevel: 28,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Frank's Hammer",
        collectionImage: "accessory_frank"
    }
};

const bull: UnitOptionsStorage = {
    display: {
        displayName: "Bull",
        image: "portrait_bull",
        description: "Deal more damage when attacking on consecutive turns. Maximum of <d1> damage after attacking for 2 consecutive turns."
    },
    stats: {
        health: 14400,
        damage: 320,
        range: 1.5,
        targets: 1,
        speed: 2,
        weight: 1.08
    },
    abilities: {
        // Deals more damage when attacking on consecutive turns
        // Not attacking will reset damage to the starting amount
        //  0 turns: 320 damage
        //  1 turn:  400 damage
        // 2+ turns: 480 damage
        // State tracks the number of consecutive turns that this unit has attacked
        update: (state, event) => {
            // Always increase state by 1 when attacking
            // State does not need to go above 6, set it to at most 5 here so it can be an odd number
            if (event === 2 && state > 4) { return 5; }
            if (event === 2) { return state + 1; }

            // If the state is even at the end of a turn then this unit did not attack
            if (event === 0 && state % 2 === 0) { return 0; }
            if (event === 0 && state > 5) { return 6; }
            if (event === 0) { return state + 1; }
            
            return state;
        },
        damage: (values, owner) => {
            if (owner.state >= 4) { return values[1]; }
            if (owner.state >= 2) { return values[0]; }
            return owner.damage;
        },
        description: (state) => {
            if (state > 4) { return "Consecutive attacks: 3+."; }
            return `Consecutive attacks: ${Math.floor(state / 2)}.`;
        }
    },
    abilityValues: {
        damage: [400, 480]
    },
    accessory: {
        unlockLevel: 30,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Bull's Shotgun",
        collectionImage: "accessory_bull"
    }
};

//------------------------------------------------------------------------------------------------//
//                                        Controller Units                                        //
//------------------------------------------------------------------------------------------------//

const amber: UnitOptionsStorage = {
    display: {
        displayName: "Amber",
        image: "portrait_amber"
    },
    stats: {
        health: 5200,
        damage: 400,
        range: 3.5,
        targets: 3,
        speed: 1,
        weight: 0.92
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 10,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Amber's Fire Staff",
        collectionImage: "accessory_amber"
    }
};

const poco: UnitOptionsStorage = {
    display: {
        displayName: "Poco",
        image: "portrait_poco"
    },
    stats: {
        health: 6400,
        damage: 480,
        range: 2.5,
        targets: 2,
        speed: 1,
        weight: 0.92
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 14,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Poco's Guitar",
        collectionImage: "accessory_poco"
    }
};

const emz: UnitOptionsStorage = {
    display: {
        displayName: "Emz",
        image: "portrait_emz"
    },
    stats: {
        health: 4800,
        damage: 640,
        range: 1.5,
        targets: 3,
        speed: 2,
        weight: 0.96
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 18,
        unlockMethod: "Complete Puzzle Challenge 2 to unlock",
        collectionName: "Emz's Spray",
        collectionImage: "accessory_emz"
    }
};

const barley: UnitOptionsStorage = {
    display: {
        displayName: "Barley",
        image: "portrait_barley"
    },
    stats: {
        health: 3600,
        damage: 720,
        range: 3.5,
        targets: 2,
        speed: 1,
        specialAttacks: true,
        weight: 0.96
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 22,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Barley's Bottle",
        collectionImage: "accessory_barley"
    }
};

const buster: UnitOptionsStorage = {
    display: {
        displayName: "Buster",
        image: "portrait_buster"
    },
    stats: {
        health: 8400,
        damage: 500,
        range: 1.5,
        targets: 2,
        speed: 2,
        weight: 1.00
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 22,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Buster's Projector",
        collectionImage: "accessory_buster"
    }
};

const tara: UnitOptionsStorage = {
    display: {
        displayName: "Tara",
        image: "portrait_tara",
        description: "Deal <d0> damage when attacking at least 2 units in the same turn."
    },
    stats: {
        health: 5600,
        damage: 360,
        range: 3.5,
        targets: 4,
        speed: 2,
        specialAttacks: true,
        weight: 1.04
    },
    abilities: {
        // Deal 440 damage when attacking at least 2 units in one turn
        // State tracks the number of units attacked
        update: (state, event) => {
            // The event 2 (on attack) is received once per target attacked
            // No need to track state above 3 because it does not increase damage any further
            if (event === 0) { return 0; }
            if (event === 2 && state < 3) { return state + 1; }
            return state;
        },
        damage: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.damage;
        }
    },
    abilityValues: {
        damage: [440]
    },
    accessory: {
        unlockLevel: 26,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Tara's Cards",
        collectionImage: "accessory_tara"
    }
};

const carl: UnitOptionsStorage = {
    display: {
        displayName: "Carl",
        image: "portrait_carl",
        description: "Get <h0> shield every turn for the first 4 turns."
    },
    stats: {
        health: 12000,
        damage: 320,
        range: 3.5,
        targets: 3,
        speed: 1,
        specialAttacks: true,
        weight: 1.08
    },
    abilities: {
        // Get 800 shield every turn for the first 4 turns
        // State tracks the number of turns
        update: (state, event) => {
            if (event === 0 && state < 5) { return state + 1; }
            return state;
        },
        shield: (values, owner, event) => {
            if (event === 0 && owner.state <= 4) { return owner.shield + values[0]; }
            return owner.shield;
        },
        description: (state) => {
            return `Turns remaining with shield: ${Math.max(0, 4 - state)}.`;
        }
    },
    abilityValues: {
        health: [800]
    },
    accessory: {
        unlockLevel: 28,
        unlockMethod: "Complete Puzzle Challenge 7 to unlock",
        collectionName: "Carl's Pickaxe",
        collectionImage: "accessory_carl"
    }
};

const meg: UnitOptionsStorage = {
    display: {
        displayName: "Meg",
        image: "portrait_meg",
        description: "After 5 turns, transform into mech form with <h0> maximum health, <d0> damage, and <o0> targets. Defeating a unit makes the transform happen 1 turn sooner."
    },
    stats: {
        health: 960,
        damage: 120,
        range: 2.5,
        targets: 1,
        speed: 2,
        weight: 1.12
    },
    abilities: {
        // After 5 turns, transform into mech form, increasing health, damage,
        // and targets. Defeating a unit decreases the number of turns by 1.
        // State tracks the number of turns
        update: (state, event) => {
            if (state < 6 && (event === 0 || event === 3)) { return state + 1; }
            return state;
        },
        health: (values, owner, event) => {
            if (event === 0 && owner.state === 5){
                // This only executes on the 5th turn
                // Count state up to 6 so this does not execute on the 6th turn
                return values[0];
            }
            return owner.health;
        },
        maxHealth: (values, owner) => {
            if (owner.state >= 5) { return values[0]; }
            return owner.maxHealth;
        },
        damage: (values, owner) => {
            if (owner.state >= 5) { return values[0]; }
            return owner.damage;
        },
        targets: (values, owner) => {
            if (owner.state >= 5) { return values[0]; }
            return owner.targets;
        },
        specialAttacks: (owner) => {
            if (owner.state >= 5) { return true; }
            return owner.specialAttacks;
        },
        description: (state) => {
            if (state >= 5) { return "Currently in mech form."; }
            return `Turns until transform: ${Math.max(0, 5 - state)}.`;
        }
    },
    abilityValues: {
        health: [14400],
        damage: [300],
        other: [5]
    },
    accessory: {
        unlockLevel: 30,
        unlockMethod: "Win 500 challenges to unlock",
        collectionName: "Meg's Mech",
        collectionImage: "accessory_meg"
    }
};

//------------------------------------------------------------------------------------------------//
//                                       Sharpshooter Units                                       //
//------------------------------------------------------------------------------------------------//

const brock: UnitOptionsStorage = {
    display: {
        displayName: "Brock",
        image: "portrait_brock"
    },
    stats: {
        health: 3200,
        damage: 1120,
        range: 4.5,
        targets: 1,
        speed: 2,
        weight: 0.96
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 8,
        unlockMethod: "Win 25 challenges to unlock",
        collectionName: "Brock's Rocket Launcher",
        collectionImage: "accessory_brock"
    }
};

const spike: UnitOptionsStorage = {
    display: {
        displayName: "Spike",
        image: "portrait_spike"
    },
    stats: {
        health: 2400,
        shield: 160,
        damage: 800,
        range: 4.5,
        targets: 2,
        speed: 1,
        weight: 0.96
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 12,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Spike's Cactus",
        collectionImage: "accessory_spike"
    }
};

const belle: UnitOptionsStorage = {
    display: {
        displayName: "Belle",
        image: "portrait_belle"
    },
    stats: {
        health: 2200,
        damage: 880,
        range: 5.5,
        targets: 2,
        speed: 2,
        weight: 1.00
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 16,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Belle's Rifle",
        collectionImage: "accessory_belle"
    }
};

const colt: UnitOptionsStorage = {
    display: {
        displayName: "Colt",
        image: "portrait_colt"
    },
    stats: {
        health: 2800,
        damage: 1500,
        range: 3.5,
        targets: 1,
        speed: 3,
        weight: 1.00
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 20,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Colt's Revolvers",
        collectionImage: "accessory_colt"
    }
};

const nani: UnitOptionsStorage = {
    display: {
        displayName: "Nani",
        image: "portrait_nani"
    },
    stats: {
        health: 1000,
        damage: 1280,
        range: 4.5,
        targets: 1,
        speed: 2,
        specialAttacks: true,
        weight: 1.04
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 20,
        unlockMethod: "Complete Puzzle Challenge 3 to unlock",
        collectionName: "Nani's Drone",
        collectionImage: "accessory_nani"
    }
};

const bea: UnitOptionsStorage = {
    display: {
        displayName: "Bea",
        image: "portrait_bea",
        description: "Every turn, alternate between dealing <d0> damage and <d1> damage."
    },
    stats: {
        health: 2000,
        damage: 840,
        range: 5.5,
        targets: 1,
        speed: 2,
        weight: 1.08
    },
    abilities: {
        // Alternate between dealing 840 and 2800 damage
        // Damage changes after a turn ends
        // State tracks the current damage phase
        update: (state, event) => {
            // The state is 0 when dealing normal damage
            // The state is 1 when the damage boost is active
            if (event === 0) { return (state + 1) % 2; }
            return state;
        },
        damage: (values, owner) => {
            if (owner.state === 1) { return values[1]; }
            return owner.damage;
        }
    },
    abilityValues: {
        damage: [840, 2800]
    },
    accessory: {
        unlockLevel: 26,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Bea's Bee",
        collectionImage: "accessory_bea"
    }
};

const piper: UnitOptionsStorage = {
    display: {
        displayName: "Piper",
        image: "portrait_piper",
        description: "Deal more damage to units that are farther away. Maximum of <d2> damage when attacking units from a distance of greater than 5."
    },
    stats: {
        health: 1800,
        damage: 1200,
        range: 5.5,
        targets: 1,
        speed: 2,
        weight: 1.12
    },
    abilities: {
        // Deal more damage to units that are farther away
        // Distance <= 3: 1200 damage
        // Distance <= 4: 1600 damage
        // Distance <= 5: 2000 damage
        // Distance  > 5: 2400 damage
        damageToUnit: (values, owner, ownerDamage, opponent, opponentAbilities) => {
            const distance = Math.sqrt(
                (owner.positionPoint[0] - opponent.positionPoint[0]) * 
                (owner.positionPoint[0] - opponent.positionPoint[0]) + 
                (owner.positionPoint[1] - opponent.positionPoint[1]) * 
                (owner.positionPoint[1] - opponent.positionPoint[1])
            );
            if (distance > 5){
                return values[2];
            } else if (distance > 4){
                return values[1];
            } else if (distance > 3){
                return values[0];
            }
            return ownerDamage;
        }
    },
    abilityValues: {
        damage: [1600, 2000, 2400]
    },
    accessory: {
        unlockLevel: 28,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Piper's Umbrella",
        collectionImage: "accessory_piper"
    }
};

const mandy: UnitOptionsStorage = {
    display: {
        displayName: "Mandy",
        image: "portrait_mandy",
        description: "Increase range to <r0> after not moving for a turn."
    },
    stats: {
        health: 1500,
        damage: 1800,
        range: 4.5,
        targets: 1,
        speed: 1,
        weight: 1.16
    },
    abilities: {
        // Increase range by 1 when not moving
        // State tracks the number of turns since the last move - 1
        update: (state, event) => {
            // Ability logic is the same as Frank
            if (event === 0 && state < 1) { return state + 1; }
            if (event === 1) { return -1; }
            return state;
        },
        range: (values, owner) => {
            if (owner.state >= 1) { return values[0]; }
            return owner.range;
        }
    },
    abilityValues: {
        range: [6.5]
    },
    accessory: {
        unlockLevel: 30,
        unlockMethod: "Complete Puzzle Challenge 8 to unlock",
        collectionName: "Mandy's Candy Dispenser",
        collectionImage: "accessory_mandy"
    }
};

//------------------------------------------------------------------------------------------------//
//                                         Assassin Units                                         //
//------------------------------------------------------------------------------------------------//

const buzz: UnitOptionsStorage = {
    display: {
        displayName: "Buzz",
        image: "portrait_buzz"
    },
    stats: {
        health: 4800,
        damage: 1400,
        range: 1.0,
        targets: 1,
        speed: 3,
        weight: 1.00
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 10,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Buzz's Buoy",
        collectionImage: "accessory_buzz"
    }
};

const stu: UnitOptionsStorage = {
    display: {
        displayName: "Stu",
        image: "portrait_stu"
    },
    stats: {
        health: 4400,
        damage: 1120,
        range: 1.5,
        targets: 1,
        speed: 5,
        weight: 1.00
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 14,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Stu's Wheel",
        collectionImage: "accessory_stu"
    }
};

const leon: UnitOptionsStorage = {
    display: {
        displayName: "Leon",
        image: "portrait_leon"
    },
    stats: {
        health: 3000,
        shield: 1000,
        damage: 1500,
        range: 1.0,
        targets: 1,
        speed: 4,
        weight: 1.04
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 18,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Leon's Lollipop",
        collectionImage: "accessory_leon"
    }
};

const fang: UnitOptionsStorage = {
    display: {
        displayName: "Fang",
        image: "portrait_fang"
    },
    stats: {
        health: 6400,
        damage: 1000,
        range: 1.0,
        targets: 1,
        speed: 3,
        weight: 1.04
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 22,
        unlockMethod: "Open Brawl Boxes to unlock",
        collectionName: "Fang's Shoe",
        collectionImage: "accessory_fang"
    }
};

const mortis: UnitOptionsStorage = {
    display: {
        displayName: "Mortis",
        image: "portrait_mortis"
    },
    stats: {
        health: 5200,
        shield: 800,
        damage: 880,
        range: 1.0,
        targets: 2,
        speed: 6,
        specialMoves: true,
        weight: 1.08
    },
    abilities: {},
    abilityValues: {},
    accessory: {
        unlockLevel: 22,
        unlockMethod: "Complete Puzzle Challenge 4 to unlock",
        collectionName: "Mortis' Shovel",
        collectionImage: "accessory_mortis"
    }
};

const crow: UnitOptionsStorage = {
    display: {
        displayName: "Crow",
        image: "portrait_crow",
        description: "Deal <d0> damage to units with less than 1/2 of their maximum health remaining."
    },
    stats: {
        health: 2800,
        shield: 480,
        damage: 960,
        range: 2.5,
        targets: 2,
        speed: 4,
        specialMoves: true,
        weight: 1.12
    },
    abilities: {
        // Deal 1280 damage to units with less than half of their
        // maximum health remaining
        damageToUnit: (values, owner, ownerDamage, opponent, opponentAbilities) => {
            if (opponent.health / Math.max(1, opponentAbilities.maxHealth(opponent)) < 0.5){
                return values[0];
            }
            return ownerDamage;
        }
    },
    abilityValues: {
        damage: [1280]
    },
    accessory: {
        unlockLevel: 26,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Crow's Daggers",
        collectionImage: "accessory_crow"
    }
};

const max: UnitOptionsStorage = {
    display: {
        displayName: "Max",
        image: "portrait_max",
        description: "When defeating a unit, get <h0> shield then increase speed to <o0> and damage to <d0> for 2 turns. Shield only stacks up to 4 times."
        //           "When defeating a unit, get <h0> shield, increase speed to <o0>, and increase damage to <d0> for 2 turns. Shield does not expire but only stacks up to 4 times."
    },
    stats: {
        health: 4000,
        damage: 1200,
        range: 2.5,
        targets: 1,
        speed: 4,
        specialMoves: true,
        weight: 1.16
    },
    abilities: {
        // Get 300 shield, 3 speed, and 400 damage when defeating a unit
        // Speed and damage is removed after 2 turns
        // Shield does not expire but only stacks up to 4 times
        // State tracks remaining speed and damage boost duration
        update: (state, event) => {
            if (event === 3) { return 3; }
            if (event === 0 && state > 0) { return state - 1; }
            return state;
        },
        shield: (values, owner, event) => {
            // Shield is only given on the turn that a unit is defeated
            // In this case, the state is 3
            if (event === 3 && owner.state === 3){
                return Math.min(values[0] * 4, owner.shield + values[0]);
            }
            return owner.shield;
        },
        damage: (values, owner) => {
            if (owner.state > 0) { return values[0]; }
            return owner.damage;
        },
        speed: (values, owner) => {
            if (owner.state > 0) { return values[0]; }
            return owner.speed;
        },
        description: (state) => {
            if (state > 0) { return `Turns until speed and damage boost expires: ${state}.`; }
            return "";
        }
    },
    abilityValues: {
        health: [300],
        damage: [1600],
        other: [7]
    },
    accessory: {
        unlockLevel: 28,
        unlockMethod: "Buy from the shop to unlock",
        collectionName: "Max's Energy Drink",
        collectionImage: "accessory_max"
    }
};

const bibi: UnitOptionsStorage = {
    display: {
        displayName: "Bibi",
        image: "portrait_bibi",
        description: "Start with an extra <h0> shield. The shield is removed and speed is decreased to <o0> when first attacking."
    },
    stats: {
        health: 3200,
        shield: 2400,
        damage: 2000,
        range: 1.0,
        targets: 1,
        speed: 5,
        specialMoves: true,
        weight: 1.20
    },
    abilities: {
        // Start with an extra 2400 shield and 5 speed
        // The shield and speed are removed when this unit first attacks
        // State tracks whether this unit has attacked
        update: (state, event) => {
            // If the state is 0 then this unit has not attacked yet
            // If the state is 1 then this unit has attacked but the
            // turn has not ended yet. It still keeps the shield and
            // speed because it may be attacked during that turn.
            // If the state is at least 2 then this unit has attacked
            // and the turn has ended. It will no longer have the
            // shield and speed.
            if ((event === 2 && state < 3) || (event === 0 && state === 1)) { return state + 1; }
            return state;
        },
        shield: (values, owner, event) => {
            // On the turn after the first attack, subtract the initial shield from
            // this unit's current shield. Subtract instead of setting shield to
            // 0 so if somehow this unit gets a shield from another source, that
            // shield will not be lost.
            if (event === 0 && owner.state === 2){
                return Math.max(0, owner.shield - values[0]);
            }
            return owner.shield;
        },
        speed: (values, owner) => {
            if (owner.state >= 2) { return values[0]; }
            return owner.speed;
        }
    },
    abilityValues: {
        health: [2400],
        other: [3]
    },
    accessory: {
        unlockLevel: 30,
        unlockMethod: "Complete Puzzle Challenge 9 to unlock",
        collectionName: "Bibi's Bat",
        collectionImage: "accessory_bibi"
    }
};

//------------------------------------------------------------------------------------------------//
//                                          Special Units                                         //
//------------------------------------------------------------------------------------------------//

const wall1: UnitOptionsStorage = {
    display: {displayName: "Wall (Tier 1)"},
    stats: {health: 600, damage: 0, range: 0.0, targets: 0, speed: 0, weight: 0.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const wall2: UnitOptionsStorage = {
    display: {displayName: "Wall (Tier 2)"},
    stats: {health: 1000, damage: 0, range: 0.0, targets: 0, speed: 0, weight: 0.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const wall3: UnitOptionsStorage = {
    display: {displayName: "Wall (Tier 3)"},
    stats: {health: 2000, damage: 0, range: 0.0, targets: 0, speed: 0, weight: 0.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const wall4: UnitOptionsStorage = {
    display: {displayName: "Wall (Tier 4)"},
    stats: {health: 3600, damage: 0, range: 0.0, targets: 0, speed: 0, weight: 0.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const wall5: UnitOptionsStorage = {
    display: {displayName: "Wall (Tier 5)"},
    stats: {health: 6000, damage: 0, range: 0.0, targets: 0, speed: 0, weight: 0.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const starting1: UnitOptionsStorage = {
    display: {},
    stats: {health: 1000, damage: 300, range: 2.5, targets: 1, speed: 0, weight: 1.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const starting2: UnitOptionsStorage = {
    display: {},
    stats: {health: 2000, damage: 400, range: 2.5, targets: 1, speed: 0, weight: 1.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const starting3: UnitOptionsStorage = {
    display: {},
    stats: {health: 3200, damage: 240, range: 2.5, targets: 2, speed: 0, weight: 1.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

const starting4: UnitOptionsStorage = {
    display: {},
    stats: {health: 6000, damage: 1800, range: 1.5, targets: 1,speed: 0, weight: 1.00},
    abilities: {},
    abilityValues: {},
    accessory: {unlockLevel: 1, unlockMethod: "", collectionName: "", collectionImage: ""}
};

//------------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------------//
//                                        Preset Challenges                                       //
//------------------------------------------------------------------------------------------------//

const empty1v1: ChallengeManagerOptions = {
    options: {gridWidth: 10, gridHeight: 10, maxRounds: 25, moveLimit: 200},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []}
    ],
    extraData: {
        challengeid: 0,
        displayName: "",
        requiredLevel: 1,
        acceptCost: 0,
        reward: {
            coins: 0,
            points: 0,
            accessory: "",
            bonus: false
        }
    }
};

const tutorial1: ChallengeManagerOptions = {
    options: {gridWidth: 5, gridHeight: 5, maxRounds: 5, moveLimit: 2},
    players: [
        {
            username: "", avatar: "", auto: false, units: []},
        {
            username: "Tutorial",
            avatar: "free/default",
            auto: true,
            units: [
                {name: "starting1", level: 1, position: [2, 1], defense: false}
            ]
        }
    ],
    extraData: {
        challengeid: 1,
        displayName: "Tutorial 1",
        requiredLevel: 1,
        acceptCost: 0,
        reward: {
            coins: 500,
            points: 50,
            accessory: "",
            bonus: false
        }
    }
};

const tutorial2: ChallengeManagerOptions = {
    options: {gridWidth: 5, gridHeight: 7, maxRounds: 10, moveLimit: 2, restrictions: [
        {player: 0, left: 0, right: 4, top: 0, bottom: 3}
    ]},
    players: [
        {
            username: "", avatar: "", auto: false, units: []},
        {
            username: "Tutorial",
            avatar: "free/default",
            auto: true,
            units: [
                {name: "starting1", level: 1, position: [1, 5], defense: false},
                {name: "starting1", level: 1, position: [2, 1], defense: false},
                {name: "wall1", level: 1, position: [0, 3], defense: false},
                {name: "wall1", level: 1, position: [1, 3], defense: false},
                {name: "wall1", level: 1, position: [2, 3], defense: false},
                {name: "wall1", level: 1, position: [3, 3], defense: false},
                {name: "wall1", level: 1, position: [4, 3], defense: false}
            ]
        }
    ],
    extraData: {
        challengeid: 2,
        displayName: "Tutorial 2",
        requiredLevel: 1,
        acceptCost: 0,
        reward: {
            coins: 500,
            points: 100,
            accessory: "",
            bonus: false
        }
    }
};

const tutorial3: ChallengeManagerOptions = {
    options: {
        gridWidth: 6, gridHeight: 6, maxRounds: 10, moveLimit: 4, restrictions: [
            {player: 0, left: 0, right: 5, top: 0, bottom: 3}
        ]},
    players: [
        {
            username: "", avatar: "", auto: false, units: [
                {name: "fighter", level: 1, position: [4, 5], defense: false}
            ]},
        {
            username: "Tutorial",
            avatar: "free/default",
            auto: true,
            units: [
                {name: "starting2", level: 1, position: [1, 4], defense: false},
                {name: "starting3", level: 1, position: [0, 1], defense: false},
                {name: "starting4", level: 1, position: [4, 1], defense: false},
                {name: "wall1", level: 1, position: [3, 3], defense: false},
                {name: "wall1", level: 1, position: [4, 3], defense: false},
                {name: "wall1", level: 1, position: [5, 3], defense: false},
            ]
        }
    ],
    extraData: {
        challengeid: 3,
        displayName: "Tutorial 3",
        requiredLevel: 1,
        acceptCost: 0,
        reward: {
            coins: 1000,
            points: 250,
            accessory: "",
            bonus: false
        }
    }
};

const bullChallenge: ChallengeManagerOptions = {
    options: {
        gridWidth: 10, gridHeight: 10, maxRounds: 50, moveLimit: 200, restrictions: [
            {player: 0, left: 0, right: 2, top: 0, bottom: 2}
        ]},
    players: [
        {
            username: "", avatar: "", auto: false, units: [
                {name: "bull", level: 1, position: undefined, defense: false},
                {name: "darryl", level: 1, position: undefined, defense: false},
                {name: "elprimo", level: 1, position: undefined, defense: false}
            ]},
        {
            username: "BULL",
            avatar: "special/portrait_bull",
            auto: true,
            units: [
                {name: "frank", level: 1, position: [2, 6], defense: false},
                {name: "ash", level: 1, position: [5, 3], defense: false},
                {name: "spike", level: 1, position: [0, 0], defense: false}
            ]
        }
    ],
    extraData: {
        challengeid: 5,
        displayName: "BULL",
        requiredLevel: 1,
        acceptCost: 0,
        reward: undefined
    }
};

const frankChallenge: ChallengeManagerOptions = {
    options: {
        gridWidth: 10, gridHeight: 10, maxRounds: 50, moveLimit: 200, restrictions: []},
    players: [
        {
            username: "", avatar: "", auto: false, units: [
                {name: "bull", level: 1, position: undefined, defense: false}
            ]},
        {
            username: "FRANK",
            avatar: "special/portrait_frank",
            auto: true,
            units: [
                {name: "shelly", level: 1, position: [5, 3], defense: false},
                {name: "amber", level: 1, position: [6, 3], defense: false},
                {name: "colette", level: 1, position: [6, 4], defense: false},
                {name: "bonnie", level: 1, position: [6, 5], defense: false}
            ]
        },
        {
            username: "ASH",
            avatar: "special/portrait_ash",
            auto: true,
            units: [
                {name: "mandy", level: 1, position: [5, 5], defense: false},
                {name: "colt", level: 1, position: [4, 5], defense: false},
                {name: "gus", level: 1, position: [4, 4], defense: false},
                {name: "brock", level: 1, position: [4, 3], defense: false}
            ]
        }
    ],
    extraData: {
        challengeid: 8,
        displayName: "FRANK",
        requiredLevel: 1,
        acceptCost: 0,
        reward: {
            coins: 0,
            points: 0,
            accessory: "",
            bonus: false
        }
    }
};

const puzzle1: ChallengeManagerOptions = {
    options: {gridWidth: 11, gridHeight: 11, maxRounds: 25, moveLimit: 200, restrictions: [
        {player: 0, left: 3, right: 7, top: 3, bottom: 7}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_elprimo",
            auto: true,
            units: <UnitPreview[]>[
                {name: "elprimo", level: 16, position: [5, 3], defense: true},
                {name: "shelly", level: 16, position: [4, 5], defense: true},
                {name: "gus", level: 16, position: [5, 6], defense: true},
                {name: "amber", level: 16, position: [3, 7], defense: true},
                {name: "brock", level: 16, position: [5, 5], defense: true},
                {name: "buzz", level: 16, position: [7, 5], defense: true}
            ].concat([
                [2, 5], [2, 6], [2, 7], [2, 8], [3, 8], [4, 8], [5, 8],
                [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [8, 5]
            ].map((value) => ({name: "wall3", level: 16, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 20,
        displayName: "Puzzle Challenge 1",
        requiredLevel: 16,
        acceptCost: 200,
        reward: {
            coins: 2000,
            points: 24000,
            accessory: "elprimo",
            bonus: false
        }
    }
};

const puzzle2: ChallengeManagerOptions = {
    options: {gridWidth: 11, gridHeight: 11, maxRounds: 25, moveLimit: 200, restrictions: [
        {player: 0, left: 2, right: 6, top: 2, bottom: 6},
        {player: 0, left: 4, right: 6, top: 7, bottom: 8},
        {player: 0, left: 7, right: 8, top: 4, bottom: 6}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_emz",
            auto: true,
            units: <UnitPreview[]>[
                {name: "emz", level: 18, position: [3, 3], defense: true},
                {name: "otis", level: 18, position: [2, 5], defense: true},
                {name: "janet", level: 18, position: [5, 2], defense: true},
                {name: "belle", level: 18, position: [5, 5], defense: true},
                {name: "stu", level: 18, position: [5, 7], defense: true},
                {name: "leon", level: 18, position: [7, 5], defense: true}
            ].concat([
                [4, 4], [5, 4], [6, 4], [4, 5], [6, 5], [6, 6], [5, 6], [4, 6]
            ].map((value) => ({name: "wall2", level: 18, position: value, defense: false})), [
                [2, 6], [1, 5], [1, 4], [1, 3], [1, 2],
                [2, 1], [3, 1], [4, 1], [5, 1], [6, 2],
                [9, 4], [9, 5], [9, 6], [4, 9], [5, 9], [6, 9]
            ].map((value) => ({name: "wall3", level: 18, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 21,
        displayName: "Puzzle Challenge 2",
        requiredLevel: 18,
        acceptCost: 200,
        reward: {
            coins: 2400,
            points: 40000,
            accessory: "emz",
            bonus: false
        }
    }
};

const puzzle3: ChallengeManagerOptions = {
    options: {gridWidth: 9, gridHeight: 8, maxRounds: 25, moveLimit: 200, restrictions: [
        {player: 0, left: 0, right: 8, top: 0, bottom: 4}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_nani",
            auto: true,
            units: <UnitPreview[]>[
                {name: "nani", level: 20, position: [4, 1], defense: true},
                {name: "brock", level: 20, position: [2, 2], defense: true},
                {name: "spike", level: 20, position: [6, 2], defense: true},
                {name: "elprimo", level: 20, position: [1, 3], defense: true},
                {name: "jacky", level: 20, position: [7, 3], defense: true},
                {name: "colt", level: 20, position: [2, 0], defense: true},
                {name: "gus", level: 20, position: [6, 0], defense: true}
            ].concat([
                [0, 4], [1, 4], [2, 4], [2, 3],
                [3, 3], [5, 3],
                [6, 3], [6, 4], [7, 4], [8, 4]
            ].map((value) => ({name: "wall3", level: 20, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 22,
        displayName: "Puzzle Challenge 3",
        requiredLevel: 20,
        acceptCost: 200,
        reward: {
            coins: 2800,
            points: 80000,
            accessory: "nani",
            bonus: false
        }
    }
};

const puzzle4: ChallengeManagerOptions = {
    options: {gridWidth: 12, gridHeight: 12, maxRounds: 30, moveLimit: 200, restrictions: [
        {player: 0, left: 3, right: 11, top: 0, bottom: 7},
        {player: 0, left: 7, right: 11, top: 8, bottom: 9}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_mortis",
            auto: true,
            units: <UnitPreview[]>[
                {name: "mortis", level: 22, position: [3, 1], defense: true},
                {name: "buster", level: 22, position: [4, 4], defense: true},
                {name: "amber", level: 22, position: [5, 0], defense: true},
                {name: "darryl", level: 22, position: [7, 2], defense: true},
                {name: "sam", level: 22, position: [8, 0], defense: true},
                {name: "poco", level: 22, position: [6, 4], defense: true},
                {name: "lola", level: 22, position: [8, 5], defense: true},
                {name: "fang", level: 22, position: [6, 6], defense: true},
                {name: "rosa", level: 22, position: [7, 8], defense: true},
                {name: "belle", level: 22, position: [9, 3], defense: true},
                {name: "spike", level: 22, position: [10, 8], defense: true}
            ].concat([
                [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
                [6, 7], [7, 7], [8, 7], [9, 7]
            ].map((value) => ({name: "wall3", level: 22, position: value, defense: false})), [
                [5, 5], [5, 4], [5, 3], [6, 3], [7, 3],
                [8, 9], [8, 10], [9, 10], [10, 10], [11, 10]
            ].map((value) => ({name: "wall4", level: 22, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 23,
        displayName: "Puzzle Challenge 4",
        requiredLevel: 22,
        acceptCost: 200,
        reward: {
            coins: 3600,
            points: 150000,
            accessory: "mortis",
            bonus: false
        }
    }
};

const puzzle5: ChallengeManagerOptions = {
    options: {gridWidth: 5, gridHeight: 17, maxRounds: 30, moveLimit: 200, restrictions: [
        {player: 0, left: 0, right: 4, top: 0, bottom: 13}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_bonnie",
            auto: true,
            units: <UnitPreview[]>[
                {name: "bonnie", level: 24, position: [2, 1], defense: true},
                {name: "shelly", level: 24, position: [1, 3], defense: true},
                {name: "barley", level: 24, position: [3, 3], defense: true},
                {name: "colt", level: 24, position: [2, 5], defense: true},
                {name: "stu", level: 24, position: [4, 6], defense: true},
                {name: "leon", level: 24, position: [0, 7], defense: true},
                {name: "surge", level: 24, position: [2, 8], defense: true},
                {name: "emz", level: 24, position: [1, 13], defense: true},
                {name: "otis", level: 24, position: [3, 13], defense: true},
                {name: "mortis", level: 24, position: [2, 13], defense: true}
            ].concat([
                [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]
            ].map((value) => ({name: "wall5", level: 24, position: value, defense: false})), [
                [0, 9], [1, 9], [2, 9], [3, 9], [4, 9]
            ].map((value) => ({name: "wall4", level: 24, position: value, defense: false})), [
                [0, 14], [1, 14], [2, 14], [3, 14], [4, 14]
            ].map((value) => ({name: "wall3", level: 24, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 24,
        displayName: "Puzzle Challenge 5",
        requiredLevel: 24,
        acceptCost: 200,
        reward: {
            coins: 4800,
            points: 250000,
            accessory: "bonnie",
            bonus: false
        }
    }
};

const puzzle6: ChallengeManagerOptions = {
    options: {gridWidth: 11, gridHeight: 11, maxRounds: 30, moveLimit: 200, restrictions: [
        {player: 0, left: 1, right: 9, top: 1, bottom: 9}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_ash",
            auto: true,
            units: <UnitPreview[]>[
                {name: "ash", level: 26, position: [4, 4], defense: true},
                {name: "sam", level: 26, position: [6, 5], defense: true},
                {name: "darryl", level: 26, position: [4, 5], defense: true},
                {name: "rosa", level: 26, position: [6, 6], defense: true},
                {name: "bea", level: 26, position: [5, 5], defense: true},
                {name: "crow", level: 26, position: [3, 1], defense: true},
                {name: "colette", level: 26, position: [7, 1], defense: true},
                {name: "buster", level: 26, position: [1, 5], defense: true},
                {name: "fang", level: 26, position: [9, 5], defense: true},
                {name: "nani", level: 26, position: [3, 9], defense: true},
                {name: "tara", level: 26, position: [7, 9], defense: true}
            ].concat([
                [3, 3], [4, 3], [6, 3],
                [7, 3], [7, 4], [7, 6],
                [7, 7], [6, 7], [4, 7],
                [3, 7], [3, 6], [3, 4]
            ].map((value) => ({name: "wall3", level: 26, position: value, defense: false})), [
                [5, 3], [7, 5], [5, 7], [3, 5]
            ].map((value) => ({name: "wall5", level: 26, position: value, defense: false})), [
                [5, 4], [6, 4], [4, 6], [5, 6]
            ].map((value) => ({name: "wall2", level: 26, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 25,
        displayName: "Puzzle Challenge 6",
        requiredLevel: 26,
        acceptCost: 200,
        reward: {
            coins: 6400,
            points: 800000,
            accessory: "ash",
            bonus: false
        }
    }
};

const puzzle7: ChallengeManagerOptions = {
    options: {gridWidth: 13, gridHeight: 11, maxRounds: 35, moveLimit: 200, restrictions: [
        {player: 0, left: 5, right: 7, top: 3, bottom: 5},
        {player: 0, left: 3, right: 9, top: 6, bottom: 10}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_carl",
            auto: true,
            units: <UnitPreview[]>[
                {name: "carl", level: 28, position: [6, 3], defense: true},
                {name: "tara", level: 28, position: [5, 4], defense: true},
                {name: "emz", level: 28, position: [7, 4], defense: true},
                {name: "barley", level: 28, position: [5, 6], defense: true},
                {name: "amber", level: 28, position: [7, 6], defense: true},
                {name: "max", level: 28, position: [6, 4], defense: true},
                {name: "crow", level: 28, position: [3, 7], defense: true},
                {name: "leon", level: 28, position: [4, 9], defense: true},
                {name: "buzz", level: 28, position: [9, 7], defense: true},
                {name: "mortis", level: 28, position: [8, 9], defense: true},
                {name: "darryl", level: 28, position: [0, 0], defense: true},
                {name: "darryl", level: 28, position: [12, 0], defense: true}
            ].concat([
                [2, 6], [2, 7], [2, 8], [2, 9], [2, 10],
                [6, 6], [6, 7], [6, 8], [6, 9], [6, 10],
                [10, 6], [10, 7], [10, 8], [10, 9], [10, 10],
                [4, 7], [4, 6], [4, 5], [4, 4], [4, 3],
                [4, 2], [5, 2], [6, 2], [7, 2], [8, 2],
                [8, 3], [8, 4], [8, 5], [8, 6], [8, 7]
            ].map((value) => ({name: "wall3", level: 28, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 26,
        displayName: "Puzzle Challenge 7",
        requiredLevel: 28,
        acceptCost: 200,
        reward: {
            coins: 8000,
            points: 2000000,
            accessory: "carl",
            bonus: false
        }
    }
};

const puzzle8: ChallengeManagerOptions = {
    options: {gridWidth: 12, gridHeight: 12, maxRounds: 40, moveLimit: 200, restrictions: [
        {player: 0, left: 0, right: 7, top: 0, bottom: 7},
        {player: 0, left: 5, right: 11, top: 5, bottom: 11}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_mandy",
            auto: true,
            units: <UnitPreview[]>[
                {name: "mandy", level: 30, position: [5, 5], defense: true},
                {name: "spike", level: 30, position: [3, 5], defense: true},
                {name: "brock", level: 30, position: [5, 3], defense: true},
                {name: "bea", level: 30, position: [8, 8], defense: true},
                {name: "piper", level: 30, position: [10, 10], defense: true},
                {name: "ash", level: 30, position: [1, 4], defense: true},
                {name: "ash", level: 30, position: [2, 2], defense: true},
                {name: "ash", level: 30, position: [4, 1], defense: true},
                {name: "darryl", level: 30, position: [0, 3], defense: true},
                {name: "darryl", level: 30, position: [3, 0], defense: true},
                {name: "sam", level: 30, position: [1, 2], defense: true},
                {name: "surge", level: 30, position: [2, 1], defense: true},
                {name: "lola", level: 30, position: [1, 1], defense: true},
                {name: "bonnie", level: 30, position: [0, 0], defense: true},
                {name: "bull", level: 30, position: [7, 10], defense: true},
                {name: "bull", level: 30, position: [10, 7], defense: true},
                {name: "frank", level: 30, position: [5, 9], defense: true},
                {name: "frank", level: 30, position: [9, 5], defense: true}
            ].concat([
                [1, 3], [2, 3], [3, 3], [3, 2], [3, 1]
            ].map((value) => ({name: "wall2", level: 30, position: value, defense: false})), [
                [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7],
                [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [7, 1], [7, 0],
                [6, 9], [9, 6], [6, 10], [10, 6]
            ].map((value) => ({name: "wall3", level: 30, position: value, defense: false})), [
                [6, 11], [11, 6]
            ].map((value) => ({name: "wall5", level: 30, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 27,
        displayName: "Puzzle Challenge 8",
        requiredLevel: 30,
        acceptCost: 200,
        reward: {
            coins: 12000,
            points: 3600000,
            accessory: "mandy",
            bonus: false
        }
    }
};

const puzzle9: ChallengeManagerOptions = {
    options: {gridWidth: 13, gridHeight: 13, maxRounds: 45, moveLimit: 200, restrictions: [
        {player: 0, left: 0, right: 12, top: 0, bottom: 3},
        {player: 0, left: 0, right: 12, top: 9, bottom: 12},
        {player: 0, left: 0, right: 3, top: 0, bottom: 12},
        {player: 0, left: 9, right: 12, top: 0, bottom: 12}
    ]},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {
            username: "",
            avatar: "special/portrait_bibi",
            auto: true,
            units: <UnitPreview[]>[
                {name: "bibi", level: 30, position: [6, 2], defense: true},
                {name: "mandy", level: 30, position: [1, 1], defense: true},
                {name: "mandy", level: 30, position: [11, 1], defense: true},
                {name: "mandy", level: 30, position: [1, 11], defense: true},
                {name: "mandy", level: 30, position: [11, 11], defense: true},
                {name: "meg", level: 30, position: [4, 11], defense: true},
                {name: "piper", level: 30, position: [6, 12], defense: true},
                {name: "colette", level: 30, position: [8, 11], defense: true},
                {name: "max", level: 30, position: [4, 4], defense: true},
                {name: "shelly", level: 30, position: [8, 8], defense: true},
                {name: "frank", level: 30, position: [8, 4], defense: true},
                {name: "frank", level: 30, position: [4, 8], defense: true},
                {name: "ash", level: 30, position: [10, 2], defense: true},
                {name: "bull", level: 30, position: [2, 10], defense: true},
                {name: "darryl", level: 30, position: [0, 5], defense: true},
                {name: "poco", level: 30, position: [1, 5], defense: true},
                {name: "jacky", level: 30, position: [2, 6], defense: true},
                {name: "carl", level: 30, position: [1, 8], defense: true},
                {name: "elprimo", level: 30, position: [12, 5], defense: true},
                {name: "tara", level: 30, position: [11, 5], defense: true},
                {name: "buzz", level: 30, position: [10, 6], defense: true},
                {name: "janet", level: 30, position: [11, 8], defense: true}
            ].concat([
                [3, 4], [3, 3], [4, 3], [8, 3], [9, 3], [9, 4],
                [9, 8], [9, 9], [8, 9], [4, 9], [3, 9], [3, 8]
            ].map((value) => ({name: "wall3", level: 30, position: value, defense: false})), [
                [0, 2], [1, 2], [2, 1], [2, 0],
                [12, 2], [11, 2], [10, 1], [10, 0],
                [0, 10], [1, 10], [2, 11], [2, 12],
                [12, 10], [11, 10], [10, 11], [10, 12],
            ].map((value) => ({name: "wall4", level: 30, position: value, defense: false})))
        }
    ],
    extraData: {
        challengeid: 28,
        displayName: "Puzzle Challenge 9",
        requiredLevel: 30,
        acceptCost: 200,
        reward: {
            coins: 18000,
            points: 6400000,
            accessory: "bibi",
            bonus: false
        }
    }
};

const empty2players: ChallengeManagerOptions = {
    options: {gridWidth: 10, gridHeight: 10, maxRounds: 30, moveLimit: 200},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []}
    ],
    extraData: {
        challengeid: 50,
        displayName: "Empty 2-Player Challenge",
        requiredLevel: 10,
        acceptCost: 60,
        reward: undefined
    }
};

const empty3players: ChallengeManagerOptions = {
    options: {gridWidth: 12, gridHeight: 12, maxRounds: 45, moveLimit: 200},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []}
    ],
    extraData: {
        challengeid: 51,
        displayName: "Empty 3-Player Challenge",
        requiredLevel: 10,
        acceptCost: 60,
        reward: undefined
    }
};

const empty4players: ChallengeManagerOptions = {
    options: {gridWidth: 14, gridHeight: 14, maxRounds: 60, moveLimit: 200},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []}
    ],
    extraData: {
        challengeid: 52,
        displayName: "Empty 4-Player Challenge",
        requiredLevel: 10,
        acceptCost: 60,
        reward: undefined
    }
};

const empty5players: ChallengeManagerOptions = {
    options: {gridWidth: 16, gridHeight: 16, maxRounds: 75, moveLimit: 200},
    players: [
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []},
        {username: "", avatar: "", auto: false, units: []}
    ],
    extraData: {
        challengeid: 53,
        displayName: "Empty 5-Player Challenge",
        requiredLevel: 10,
        acceptCost: 60,
        reward: undefined
    }
};

//------------------------------------------------------------------------------------------------//

// Units that are available for free and can be used multiple times in the same challenge
const freeUnits: [string, UnitOptionsStorage][] = [
    ["fighter", fighter],
    ["tank", tank],
    ["controller", controller],
    ["sharpshooter", sharpshooter],
    ["assassin", assassin]
];

// Units that must be unlocked and can only be used once per player per challenge
const specialUnits: [string, UnitOptionsStorage][] = [
    ["shelly", shelly],
    ["gus", gus],
    ["otis", otis],
    ["janet", janet],
    ["lola", lola],
    ["surge", surge],
    ["colette", colette],
    ["bonnie", bonnie],
    ["rosa", rosa],
    ["jacky", jacky],
    ["elprimo", elprimo],
    ["darryl", darryl],
    ["sam", sam],
    ["ash", ash],
    ["frank", frank],
    ["bull", bull],
    ["amber", amber],
    ["poco", poco],
    ["emz", emz],
    ["barley", barley],
    ["buster", buster],
    ["tara", tara],
    ["carl", carl],
    ["meg", meg],
    ["brock", brock],
    ["spike", spike],
    ["belle", belle],
    ["colt", colt],
    ["nani", nani],
    ["bea", bea],
    ["piper", piper],
    ["mandy", mandy],
    ["buzz", buzz],
    ["stu", stu],
    ["leon", leon],
    ["fang", fang],
    ["mortis", mortis],
    ["crow", crow],
    ["max", max],
    ["bibi", bibi]
];

// Units that cannot be used by players
const excludeUnits: [string, UnitOptionsStorage][] = [
    ["empty", emptyUnit],
    ["default", defaultUnit],
    ["wall1", wall1],
    ["wall2", wall2],
    ["wall3", wall3],
    ["wall4", wall4],
    ["wall5", wall5],
    ["starting1", starting1],
    ["starting2", starting2],
    ["starting3", starting3],
    ["starting4", starting4]
];

// All units that can be used by players
const playerUnits = freeUnits.concat(specialUnits);

// Map from unit names to unit objects
const unitMap = new Map<string, UnitOptionsStorage>(playerUnits.concat(excludeUnits));


// List of names of all units that are unlocked for all players
const freeUnitNames = new Set<string>(freeUnits.map((value) => value[0]));

// List of all unit objects, including those that players cannot use
export const unitList = playerUnits.map((value) => value[1]);

// Used to check whether certain units should be available in the
// shop based on the player's accessory level
export const requiredLevels = new Map<string, number>(
    playerUnits.map((value) => [value[0], value[1].accessory.unlockLevel])
);

// After the removal of challenge progression, players' levels are automatically set.
// However, some preset challenges are designed for specific levels. This map has keys
// as challenge ids and values as the level for that challenge.
export const levelCaps = new Map<number, number>([
    [1, 1], [2, 1], [3, 1],
    [20, 16], [21, 18], [22, 20], [23, 22],
    [24, 24], [25, 26], [26, 28], [27, 30], [28, 30]
]);

// All preset challenge objects
// The array is used to iterate over all challenges
const presetChallenges: [number, ChallengeManagerOptions][] = [
    tutorial1, tutorial2, tutorial3, bullChallenge, frankChallenge,
    empty2players, empty3players, empty4players, empty5players,
    puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7, puzzle8, puzzle9
].map((value) => [value.extraData.challengeid, value]);
// The map is used to get a specific challenge
const presetChallengeMap = new Map<number, ChallengeManagerOptions>(presetChallenges);

// This challenge can be selected but is not visible in the list of all challenges
presetChallengeMap.set(empty1v1.extraData.challengeid, empty1v1);
    

//------------------------------------------------------------------------------------------------//

function getLevelValue(cardsMap: StatsMap, value: number, level: number): number{
    // Unit stats only increase every other level
    // statsLevel refers to the index in the map, not the level the player sees
    level = Math.ceil(level / 2);

    const values = cardsMap.get(value);
    if (typeof values !== "undefined"){
        level = Math.max(1, Math.min(values.length, level));
        return values[level - 1];
    }

    return value;
}

function upgradeAbilityValues(abilityValues: UnitOptionsStorage["abilityValues"], level: number, rangeIncrease: number): Required<UnitOptionsStorage["abilityValues"]>{
    return {
        health: (typeof abilityValues.health !== "undefined") ? abilityValues.health.map((value) => getLevelValue(healthMap, value, level)) : [],
        damage: (typeof abilityValues.damage !== "undefined") ? abilityValues.damage.map((value) => getLevelValue(damageMap, value, level)) : [],
        range: (typeof abilityValues.range !== "undefined") ? abilityValues.range.map((value) => value + rangeIncrease) : [],
        other: (typeof abilityValues.other !== "undefined") ? abilityValues.other : []
    };
}

function createDescription(description: string, values: Required<UnitOptionsStorage["abilityValues"]>): string{
    // Replaces all stats in a unit's description with its ability values
    // This must be called after upgrading the ability values

    for (let x = 0; x < values.health.length; x++){
        description = description.replaceAll(`<h${x}>`, values.health[x].toString());
    }
    for (let x = 0; x < values.damage.length; x++){
        description = description.replaceAll(`<d${x}>`, values.damage[x].toString());
    }
    for (let x = 0; x < values.range.length; x++){
        description = description.replaceAll(`<r${x}>`, values.range[x].toString());
    }
    for (let x = 0; x < values.other.length; x++){
        description = description.replaceAll(`<o${x}>`, values.other[x].toString());
    }
    return description;
}

function getUnlockedUnits(userAccessories: DatabaseAccessories, level: number): [string, UnitOptionsStorage][]{
    // After all progression was removed, all players are able to use any units
    // This function now returns a list of all the units
    return freeUnits.concat(specialUnits);
    return freeUnits.filter((value) => level >= value[1].accessory.unlockLevel)
    .concat(specialUnits.filter((value) => level >= value[1].accessory.unlockLevel &&
    userAccessories.includes(value[0]) === true));
}

function setUnitDisplay(display: UnitOptionsStorage["display"], abilityValues: Required<UnitOptionsStorage["abilityValues"]>): UnitOptions["display"]{
    const newDisplay: UnitOptions["display"] = {
        displayName: "",
        image: "",
        description: ""
    };

    if (typeof display.displayName === "string"){
        newDisplay.displayName = display.displayName;
    } if (typeof display.image === "string" && display.image !== ""){
        newDisplay.image = ACCESSORY_IMAGE_DIR + display.image + IMAGE_FILE_EXTENSION;
    } if (typeof display.description === "string"){
        newDisplay.description = createDescription(display.description, abilityValues);
    }

    return newDisplay;
}

function setUnitStats(stats: UnitOptionsStorage["stats"], level: number, rangeIncrease: number): UnitOptions["stats"]{
    const newStats: UnitOptions["stats"] = {
        health: 1,
        shield: 0,
        damage: 1,
        range: 1,
        targets: 1,
        speed: 1,
        specialMoves: false,
        specialAttacks: false,
        weight: 0
    };
    
    if (typeof stats.health === "number"){
        newStats.health = getLevelValue(healthMap, stats.health, level);
    } if (typeof stats.shield === "number"){
        newStats.shield = getLevelValue(healthMap, stats.shield, level);
    } if (typeof stats.damage === "number"){
        newStats.damage = getLevelValue(damageMap, stats.damage, level);
    } if (typeof stats.range === "number"){
        newStats.range = stats.range + rangeIncrease;
    } if (typeof stats.targets === "number"){
        newStats.targets = stats.targets;
    } if (typeof stats.speed === "number"){
        newStats.speed = stats.speed;
    } if (typeof stats.specialMoves === "boolean"){
        newStats.specialMoves = stats.specialMoves;
    } if (typeof stats.specialAttacks === "boolean"){
        newStats.specialAttacks = stats.specialAttacks;
    } if (typeof stats.weight === "number"){
        newStats.weight = Math.round(getLevelValue(weightMap, 1, level) * stats.weight * 1000) / 1000;
    }

    return newStats;
}

function setUnitAbilities(abilities: UnitOptionsStorage["abilities"], abilityValues: Required<UnitOptionsStorage["abilityValues"]>): UnitOptions["abilities"]{
    const newAbilities: UnitOptions["abilities"] = {};

    if (typeof abilities.update === "function"){
        newAbilities.update = abilities.update.bind(undefined);
    } if (typeof abilities.health === "function"){
        newAbilities.health = abilities.health.bind(undefined, abilityValues.health);
    } if (typeof abilities.shield === "function"){
        newAbilities.shield = abilities.shield.bind(undefined, abilityValues.health);
    } if (typeof abilities.maxHealth === "function"){
        newAbilities.maxHealth = abilities.maxHealth.bind(undefined, abilityValues.health);
    } if (typeof abilities.damage === "function"){
        newAbilities.damage = abilities.damage.bind(undefined, abilityValues.damage);
    } if (typeof abilities.range === "function"){
        newAbilities.range = abilities.range.bind(undefined, abilityValues.range);
    } if (typeof abilities.targets === "function"){
        newAbilities.targets = abilities.targets.bind(undefined, abilityValues.other);
    } if (typeof abilities.speed === "function"){
        newAbilities.speed = abilities.speed.bind(undefined, abilityValues.other);
    } if (typeof abilities.specialMoves === "function"){
        newAbilities.specialMoves = abilities.specialMoves.bind(undefined);
    } if (typeof abilities.specialAttacks === "function"){
        newAbilities.specialAttacks = abilities.specialAttacks.bind(undefined);
    } if (typeof abilities.damageToUnit === "function"){
        newAbilities.damageToUnit = abilities.damageToUnit.bind(undefined, abilityValues.damage);
    } if (typeof abilities.description === "function"){
        newAbilities.description = abilities.description.bind(undefined);
    }

    return newAbilities;
}

function generateRandomChallenge(level: number): ChallengeManagerOptions | undefined{
    let unitCount = 3;
    let width = 6;
    let height = 6;
    let totalWidth = 12;
    let totalHeight = 12;
    
    level = Math.max(1, Math.min(unitCounts.length, level));

    // Update the challenge options based on the level
    unitCount = unitCounts[level - 1];

    const offsetX = Math.floor((totalWidth - width) / 2);
    const offsetY = Math.floor((totalHeight - height) / 2);

    // Get all the available unit names then shuffle them. The units used in
    // this challenge will be the first few units from the array.

    // As challenges get more difficult, the basic units will stop being used.
    let minLevel = 1;
    if (level >= 16){
        minLevel = 6;
    } else if (level >= 14){
        minLevel = 4;
    } else if (level >= 8){
        minLevel = 2;
    }

    const unitChoices: string[] = playerUnits.filter(
        (value) => value[1].accessory.unlockLevel >= minLevel && 
        level >= value[1].accessory.unlockLevel).map((value) => value[0]);
    for (let i = unitChoices.length - 1; i >= 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        let temp = unitChoices[i];
        unitChoices[i] = unitChoices[j];
        unitChoices[j] = temp;
    }

    let locations = new Set<number>();
    let units: UnitPreview[] = [];
    let restrictions: ChallengeManagerOptions["options"]["restrictions"] = [];

    if (width * height >= unitCount * 2){
        while (locations.size < unitCount){
            locations.add(Math.floor(Math.random() * width * height));
        }
    } else{
        return undefined;
    }

    if (unitChoices.length === 0){
        return undefined;
    }
    
    let x = 0;
    locations.forEach((value) => {
        units.push({
            name: unitChoices[x % unitChoices.length],
            level: level,
            defense: true,
            position: [(((value % width) + width) % width) + offsetX, Math.floor(value / width) + offsetY]
        });
        x++;
    });

    // Create a square of walls around all the units
    if (level >= 16){
        let wallType = "wall1";
        if (level >= 28){
            wallType = "wall3";
        } else if (level >= 22){
            wallType = "wall2";
        }

        for (let x = offsetX - 1; x < offsetX + width + 1; x++){
            units.push(
                {name: wallType, level: level, defense: false, position: [x, offsetY - 1]},
                {name: wallType, level: level, defense: false, position: [x, offsetY + height]}
            );
        }
        for (let y = offsetY; y < offsetY + height; y++){
            units.push(
                {name: wallType, level: level, defense: false, position: [offsetX - 1, y]},
                {name: wallType, level: level, defense: false, position: [offsetX + width, y]}
            );
        }
    }

    // Restrictions to locations where the player can activate units start at level 12
    if (level >= 18){
        restrictions.push({player: 0, left: offsetX - 1, right: offsetX + width, top: offsetY - 1, bottom: offsetY + height});
    } else if (level >= 12){
        restrictions.push({player: 0, left: offsetX, right: offsetX + width - 1, top: offsetY, bottom: offsetY + height - 1});
    }

    return {
        options: {
            gridWidth: totalWidth,
            gridHeight: totalHeight,
            maxRounds: unitCount * 4,
            moveLimit: 200,
            restrictions: restrictions
        },
        players: [
            {username: "", avatar: "", auto: false, units: []},
            {username: "", avatar: "", auto: true, units: units}
        ],
        extraData: {
            challengeid: level + RANDOM_CHALLENGE_START,
            displayName: `Random Challenge (Level ${level})`,
            requiredLevel: Math.max(Math.min(level, 2), level - 8),
            acceptCost: 60,
            reward: undefined
        }
    };
}

/**
 * Gets the number of challenge points required to reach the next level.
 * @param level current level
 * @returns number
 */
/*export function getRequiredPoints(level: number): number{
    // Gets the number of points required to reach the next level, -1 if no next level
    if (level < 1){
        return 1;
    }
    level = Math.min(levels.length, level);
    return levels[level - 1].upgradePoints;
}*/

/**
 * Takes in a player's current level and the challenge points they have already collected
 * at that level. Then, adds points and returns the player's new level and points.
 * @param progress [level, points] tuple
 * @param points points being added
 * @returns [level, points] after adding the points
 */
/*export function updateLevelProgress(progress: LevelProgress, points: number): LevelProgress{
    const level = progress[0];

    if (level < 1 || level > Math.min(totalCosts.length, levels.length)){
        return [level, progress[1]];
    }
    
    // The player's total progress is the points required to get to the level they are at
    // + the points they have already earned at that level
    // + the points being added from this function
    const total = totalCosts[level - 1] + progress[1] + points;

    // Find the first level where the total points required to reach that level is higher
    // than the player's total points
    const newLevel = totalCosts.findIndex((value) => value > total);

    if (newLevel === -1){
        // Highest level because no level exists where the required points is more than
        // the player's current total
        return [totalCosts.length, total - totalCosts[totalCosts.length - 1]];
    } else if (newLevel === 0){
        // This only occurs when the player has enough points removed that they are below
        // the lowest level
        return [1, 0];
    }

    // The player's points towards the next level is their total - the points required to
    // reach the level they are at
    return [newLevel, total - totalCosts[newLevel - 1]];
}*/

/**
 * Gets an accessory's display name and image. This is intended to be used when displaying
 * an accessory as a reward.
 * @param name name of accessory
 * @returns AccessoryPreview object or undefined if the accessory does not exist
 */
/*export function getAccessoryDisplay(name: string): AccessoryPreview | undefined{
    const unitRef = unitMap.get(name);
    if (typeof unitRef !== "undefined"){
        return {
            displayName: unitRef.accessory.collectionName,
            image: ACCESSORY_IMAGE_DIR + unitRef.accessory.collectionImage + IMAGE_FILE_EXTENSION
        };
    }
    return undefined;
}*/

/**
 * Get all the units that a player is able to use and the maximum number of units they can
 * use per challenge. Each unit returned includes its basic stats and description of its ability.
 * @param userAccessories parsed accessory object from the database
 * @param level accessory level
 * @returns list of units and maximum number per challenge
 */
export function getUnlockedUnitStats(userAccessories: DatabaseAccessories, level: number): UnitSelection{
    level = Math.max(1, Math.min(levels.length, level));
    return {
        unitsPerChallenge: levels[level - 1].unitsPerChallenge,
        unitsAvailable: getUnlockedUnits(userAccessories, level).map<UnitSelection["unitsAvailable"][number]>((value) => {
            const unitStats: UnitSelection["unitsAvailable"][number]["stats"] & {weight?: number;} = setUnitStats(value[1].stats, level, 0);

            // Weight has no meaning for the player
            delete unitStats.weight;
            return {
                name: value[0],
                display: setUnitDisplay(value[1].display, upgradeAbilityValues(value[1].abilityValues, level, 0)),
                stats: unitStats
            };
        })
    };
}

/**
 * Get the full list of accessories. Each accessory returned includes its display information,
 * whether the player has unlocked it, and the level that it unlocks at.
 * @param userAccessories parsed accessory object from the database
 * @param level accessory level
 * @returns list of accessories
 */
/*export function getAllAccessories(userAccessories: DatabaseAccessories, level: number): AccessoryData[]{
    return specialUnits.filter((value) => value[1].accessory.collectionName !== "").map<AccessoryData>((value) => {
        let unitName = "";
        let image = "";
        if (typeof value[1].display.displayName !== "undefined"){
            // Include the unit name so the player knows which unit is unlocked with the accessory
            unitName = value[1].display.displayName;
        }
        if (value[1].accessory.collectionImage !== ""){
            image = ACCESSORY_IMAGE_DIR + value[1].accessory.collectionImage + IMAGE_FILE_EXTENSION;
        }
        return {
            displayName: value[1].accessory.collectionName,
            unitName: unitName,
            image: image,
            unlocked: (userAccessories.includes(value[0]) === true && level >= value[1].accessory.unlockLevel),
            unlockLevel: value[1].accessory.unlockLevel,
            unlockMethod: value[1].accessory.unlockMethod
        };
    });
}*/

/**
 * Creates a list of UnitPreview objects based on a player's unit selection. Returns an empty
 * array if the unit selection is invalid.
 * @param inputUnits player's unit selection
 * @param level accessory level
 * @returns UnitPreview objects
 */
export function createUnitList(inputUnits: string[], level: number): UnitPreview[]{
    level = Math.max(1, Math.min(levels.length, level));

    const specialUnitNames = inputUnits.filter((value) => (freeUnitNames.has(value) === false));
    if (specialUnitNames.length !== new Set(specialUnitNames).size){
        // Duplicate units
        return [];
    }
    if (inputUnits.length > levels[level - 1].unitsPerChallenge){
        // Too many units
        return [];
    }

    const unlockedUnitNames: string[] = getUnlockedUnits([], level).map((value) => value[0]);

    let valid = true;
    let units: UnitPreview[] = [];
    for (let x = 0; x < inputUnits.length; x++){
        // If a special unit is not in the user's collection, the unit list is invalid
        if (unlockedUnitNames.includes(inputUnits[x]) === true){
            units.push({
                name: inputUnits[x],
                level: level,
                defense: false,
                position: undefined
            });
        } else{
            valid = false;
        }
    }
    
    if (valid === false){
        return [];
    }
    return units;
}

/**
 * Converts a UnitPreview to an object that can be passed to a challenge manager to create
 * the corresponding unit.
 * @param data {name, level, defense, position}
 * @returns UnitOptions object or undefined if the unit does not exist
 */
export function createUnitOptions(data: UnitPreview): UnitOptions | undefined{
    const name = data.name;
    
    const unitRef = unitMap.get(name);
    if (typeof unitRef !== "undefined"){
        // Automatic players get the range of their units increased because they cannot be moved
        let rangeIncrease = 0;
        if (data.defense === true){
            rangeIncrease = 2;
        }

        // Set all defined display properties
        const upgradedValues = upgradeAbilityValues(unitRef.abilityValues, data.level, rangeIncrease);

        let newPosition: UnitPreview["position"] = undefined;
        if (typeof data.position !== "undefined"){
            newPosition = [data.position[0], data.position[1]];
        }

        return {
            position: newPosition,
            display: setUnitDisplay(unitRef.display, upgradedValues),
            stats: setUnitStats(unitRef.stats, data.level, rangeIncrease),
            abilities: setUnitAbilities(unitRef.abilities, upgradedValues)
        };
    }
    // Returns undefined when the unit with the given name does not exist
    return undefined;
}

/**
 * Get the full list of preset and random challenges. All challenges that are not created
 * by another player will be included.
 * @param completedChallenges array of challenge ids that the player already completed
 * @returns list of challenges
 */
export function getAllChallenges(completedChallenges: number[]): ChallengePreview[]{
    return presetChallenges.map((value) => {
        const extraData = value[1].extraData;
        let coins = 0;
        let points = 0;
        let accessory: AccessoryPreview = {
            displayName: "",
            image: ""
        };

        const completed = completedChallenges.includes(extraData.challengeid);

        /*if (completed === false && typeof extraData.reward !== "undefined"){
            // Set rewards only for challenges that have not been completed yet
            coins = extraData.reward.coins;
            points = extraData.reward.points;
            const display = getAccessoryDisplay(extraData.reward.accessory);
            if (typeof display !== "undefined"){
                accessory = display;
            }
        }*/

        return {
            challengeid: extraData.challengeid,
            displayName: extraData.displayName,
            //requiredLevel: extraData.requiredLevel,
            //acceptCost: extraData.acceptCost,
            requiredLevel: 1,
            acceptCost: 0,
            completed: completed,
            reward: {
                coins: coins,
                points: points,
                accessory: accessory
            },
            players: value[1].players.filter((player) => player.auto === false).length
        };
    }).concat(levels.map((value, index) => {
        return {
            challengeid: index + 1 + RANDOM_CHALLENGE_START,
            displayName: `Random Challenge (Level ${index + 1})`,
            //requiredLevel: Math.max(Math.min(index + 1, 2), index - 7),
            //acceptCost: 60,
            requiredLevel: 1,
            acceptCost: 0,
            completed: false,
            reward: {
                //coins: 60 * CHALLENGE_COINS_PER_TOKEN,
                //points: Math.floor(CHALLENGE_WIN_MULTIPLIER * value.unitsPerChallenge * value.weightMultiplier),
                coins: 0,
                points: 0,
                accessory: {
                    displayName: "",
                    image: ""
                }
            },
            players: 1
        };
    }));
}

/**
 * Gets the options for a preset challenge that can be passed to a challenge manager to
 * create the corresponding challenge.
 * @param challengeid preset challenge id
 * @returns ChallengeManagerOptions or undefined if the challenge is not a preset challenge
 */
export function getPresetChallenge(challengeid: number): ChallengeManagerOptions | undefined{
    challengeid = Math.floor(challengeid);
    if (challengeid < 0 || challengeid >= PLAYER_CHALLENGE_START){
        return undefined;
    }

    
    if (challengeid > RANDOM_CHALLENGE_START){
        return generateRandomChallenge(challengeid - RANDOM_CHALLENGE_START);
    }

    if (presetChallengeMap.has(challengeid) === true){
        return presetChallengeMap.get(challengeid);
    }
    return undefined;
}
