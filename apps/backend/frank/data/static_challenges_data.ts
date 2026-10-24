import {ChallengeConfig, ChallengeGameMod} from "../types";

interface StaticPreset{
    config: ChallengeConfig;
    gameMod: ChallengeGameMod;
}

const classicChallenge = {
    difficulties: [
        {
            difficultyid: 0,
            name: "Difficulty 1",
            strengthTier: 0,
            healthBonusReq: 0.4,
            timePerEnemy: 0.8,
            enemyStats: [8, 9, 11, 13]
        },
        {
            difficultyid: 1,
            name: "Difficulty 2",
            strengthTier: 0,
            healthBonusReq: 0.45,
            timePerEnemy: 0.75,
            enemyStats: [8, 9, 11, 14]
        },
        {
            difficultyid: 2,
            name: "Difficulty 3",
            strengthTier: 1,
            healthBonusReq: 0.45,
            timePerEnemy: 0.7,
            enemyStats: [10, 12, 15, 18]
            
        },
        {
            difficultyid: 3,
            name: "Difficulty 4",
            strengthTier: 1,
            healthBonusReq: 0.5,
            timePerEnemy: 0.6,
            enemyStats: [12, 16, 21, 26]
        },
        {
            difficultyid: 4,
            name: "Difficulty 5",
            strengthTier: 2,
            healthBonusReq: 0.5,
            timePerEnemy: 0.6,
            enemyStats: [14, 19, 25, 32]
        },
        {
            difficultyid: 5,
            name: "Difficulty 6",
            strengthTier: 3,
            healthBonusReq: 0.6,
            timePerEnemy: 0.5,
            enemyStats: [16, 22, 30, 40]
        }
    ],
    stages: [
        {completion: 30, time: 30, powerReward: 20, gearsReward: 100},
        {completion: 60, time: 40, powerReward: 35, gearsReward: 100},
        {completion: 90, time: 50, powerReward: 55, gearsReward: 100},
        {completion: 120, time: 60, powerReward: 0, gearsReward: 0}
    ],
    maxScores: {completion: 300, time: 180, destination: 0, health: 90, gear: 30, enemy: 0}
};

const challenges = new Map<string, StaticPreset>([
    ["default", {
        config: {
            displayName: "Default Challenge",
            recommendedLvl: 0,
            baseWinMastery: [0],
            baseLossMastery: [0],
            baseCoins: [0],
            baseBadges: [0]
        },
        gameMod: {
            options: {},
            difficulties: [{
                difficultyid: 0,
                name: "Difficulty 1",
                strengthTier: 0,
                healthBonusReq: 0.6,
                timePerEnemy: 2/3,
                enemyStats: [8]
            }],
            stages: [
                {completion: 300, time: 150, powerReward: 0, gearsReward: 0}
            ],
            levels: [{
                levelid: 0,
                waves: [],
                background: "entrance",
                displayName: "Level 1",
                stages: [0],
                destination: 0
            }],
            maxScores: {completion: 300, time: 150, destination: 0, health: 90, gear: 30, enemy: 0}
        }
    }],
    ["tutorial", {
        config: {
            displayName: "Beginner Challenge",
            recommendedLvl: 0,
            baseWinMastery: [10],
            baseLossMastery: [0],
            baseCoins: [0],
            baseBadges: [0]
        },
        gameMod: {
            options: {
                //gameMode: 1,
                bonusResources: false
            },
            unlocks: {
                maxAccessories: 0,
                startingPower: 0,
                startingGears: 3
            },
            difficulties: [
                {
                    difficultyid: 0,
                    name: "Difficulty 1",
                    strengthTier: 0,
                    healthBonusReq: 0.5,
                    timePerEnemy: 1,
                    enemyStats: [8, 9, 10, 11]
                }
            ],
            stages: [
                {completion: 40, time: 0, powerReward: 14, gearsReward: 150},
                {completion: 60, time: 0, powerReward: 21, gearsReward: 150},
                {completion: 80, time: 0, powerReward: 28, gearsReward: 150},
                {completion: 120, time: 0, powerReward: 0, gearsReward: 0}
            ],
            maxScores: {completion: 300, time: 0, destination: 0, health: 0, gear: 0, enemy: 0}
        }
    }],
    ["expert", {
        config: {
            displayName: "Expert Levels",
            recommendedLvl: 15,
            baseWinMastery: [1, 1, 1, 1],
            baseLossMastery: [1, 1, 1, 1],
            baseCoins: [1, 1, 1, 1],
            baseBadges: [1, 1, 1, 1]
        },
        gameMod: {
            options: {
                gameMode: 0,
                addBonusEnemies: true
            },
            difficulties: [
                {
                    difficultyid: 6,
                    name: "Difficulty 7",
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.7,
                    enemyStats: [12, 15, 18, 21, 24, 28, 33, 36]
                },
                {
                    difficultyid: 7,
                    name: "Difficulty 8",
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.7,
                    enemyStats: [14, 20, 23, 26, 31, 37, 44, 46]
                },
                {
                    difficultyid: 8,
                    name: "Difficulty 9",
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [18, 24, 31, 38, 45, 52, 61, 64]
                },
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.625,
                    enemyStats: [24, 36, 48, 60, 70, 80, 94, 100]
                }
            ],
            stages: [
                {completion: 10, time: 0, powerReward: 10, gearsReward: 100},
                {completion: 15, time: 15, powerReward: 20, gearsReward: 100},
                {completion: 20, time: 15, powerReward: 30, gearsReward: 100},
                {completion: 30, time: 20, powerReward: 40, gearsReward: 100},
                {completion: 45, time: 20, powerReward: 52, gearsReward: 100},
                {completion: 60, time: 25, powerReward: 66, gearsReward: 100},
                {completion: 60, time: 25, powerReward: 82, gearsReward: 100},
                {completion: 60, time: 30, powerReward: 0, gearsReward: 0}
            ],
            levels: [
                {
                    levelid: 0,
                    waves: [
                        {names: ["firstmeteor"], enemies: []},
                        {names: ["meteor", "meleerobot"], enemies: [], delay: 1},
                        {names: ["shelly", "colt"], enemies: [], delay: 2, maxEnemies: 10},
                        {names: [], enemies: [{name: "rangedrobot", minDiff: 2}, {name: "fastrobot", minDiff: 2}, {name: "rt", minDiff: 3}], delay: 5, maxEnemies: 2}
                    ],
                    background: "entrance",
                    displayName: "Starr Park Entrance",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 1,
                    waves: [
                        {names: [], enemies: [{name: "meleerobot", minDiff: 3}, {name: "rangedrobot", count: 2, minDiff: 2}, {name: "fastrobot", count: 2}]},
                        {names: ["shelly", "colt"], enemies: [], delay: 5, maxEnemies: 10},
                        {names: [], enemies: [{name: "r10", minDiff: 3}], delay: 5, maxEnemies: 2},
                        {names: ["rt", "elprimo"], enemies: [], delay: 1}
                    ],
                    background: "hub",
                    displayName: "Starr Park Hub",
                    stages: [1],
                    destination: 0
                },
                {
                    levelid: 2,
                    waves: [
                        {names: [], enemies: [{name: "meteor", count: 3}, {name: "r2", count: 2}]},
                        {names: [], enemies: [{name: "r4", minDiff: 3}, {name: "r8", minDiff: 2}], delay: 4, maxEnemies: 10},
                        {names: ["r12"], enemies: [{name: "r8", minDiff: 3}], delay: 6, maxEnemies: 2},
                        {names: ["8bit"], enemies: [], delay: 1},
                        {names: ["belle"], enemies: [], delay: 4, maxEnemies: 1}
                    ],
                    background: "oldtown",
                    displayName: "Old Town",
                    stages: [2],
                    destination: 0
                },
                {
                    levelid: 3,
                    waves: [
                        {names: [], enemies: [{name: "meteor", count: 3}, {name: "r2", count: 3}]},
                        {names: [], enemies: [{name: "r4", minDiff: 3}, {name: "r8", minDiff: 2}], delay: 5, maxEnemies: 10},
                        {names: ["r12"], enemies: [{name: "r8", minDiff: 3}], delay: 6, maxEnemies: 2},
                        {names: ["jessie"], enemies: [], delay: 1},
                        {names: ["eve"], enemies: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "biodome",
                    displayName: "Biodome",
                    stages: [2, 3],
                    destination: 0
                },
                {
                    levelid: 4,
                    waves: [
                        {names: ["r10"], enemies: []},
                        {names: ["r4", "r8"], enemies: [], delay: 5, maxEnemies: 10},
                        {names: [], enemies: [{name: "meteor", count: 3, minDiff: 3}, {name: "r2", minDiff: 3}, {name: "r8", minDiff: 2}, {name: "r9", minDiff: 3}], delay: 6, maxEnemies: 2},
                        {names: ["mortis"], enemies: [], delay: 1},
                        {names: ["frank"], enemies: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "ghostmetro",
                    displayName: "Ghost Station",
                    stages: [2, 3],
                    destination: 4
                },
                {
                    levelid: 5,
                    waves: [
                        {names: ["r12"], enemies: []},
                        {names: ["r6", "r8"], enemies: [], delay: 6, maxEnemies: 10},
                        {names: [], enemies: [{name: "r8", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 7, maxEnemies: 2},
                        {names: ["jacky"], enemies: [], delay: 1},
                        {names: ["mrp"], enemies: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "deepsea",
                    displayName: "Deep Sea",
                    stages: [2, 3],
                    destination: 6
                },
                {
                    levelid: 6,
                    waves: [
                        {names: ["r12"], enemies: []},
                        {names: ["r9", "r9"], enemies: [], delay: 6, maxEnemies: 10},
                        {names: [], enemies: [{name: "r10", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 9, maxEnemies: 2},
                        {names: ["bo"], enemies: [], delay: 1},
                        {names: ["colette"], enemies: [], delay: 6, maxEnemies: 1}
                    ],
                    background: "giftshop",
                    displayName: "Gift Shop",
                    stages: [3],
                    destination: 8
                },
                {
                    levelid: 7,
                    waves: [
                        {names: ["r10"], enemies: []},
                        {names: ["r9", "r9"], enemies: [], delay: 5, maxEnemies: 10},
                        {names: [], enemies: [{name: "r12", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 9, maxEnemies: 2},
                        {names: ["pearl"], enemies: [], delay: 1},
                        {names: ["bibi"], enemies: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "retropolis",
                    displayName: "Retropolis",
                    stages: [4],
                    destination: 0
                },
                {
                    levelid: 8,
                    waves: [
                        {names: ["r12"], enemies: []},
                        {names: ["r4", "r6", "r10"], enemies: [], delay: 6, maxEnemies: 10},
                        {names: [], enemies: [{name: "r12", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 10, maxEnemies: 2},
                        {names: ["brock"], enemies: [], delay: 1},
                        {names: ["chester"], enemies: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "candystand",
                    displayName: "Candyland",
                    stages: [4, 5],
                    destination: 0
                },
                {
                    levelid: 9,
                    waves: [
                        {names: ["r8", "r12"], enemies: []},
                        {names: ["r10", "r10"], enemies: [], delay: 10, maxEnemies: 10},
                        {names: [], enemies: [{name: "r12", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 10, maxEnemies: 2},
                        {names: ["ollie"], enemies: [], delay: 1},
                        {names: ["leon"], enemies: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "rumblejungle",
                    displayName: "Rumble Jungle",
                    stages: [4, 5],
                    destination: 12
                },
                {
                    levelid: 10,
                    waves: [
                        {names: ["r8", "r12"], enemies: []},
                        {names: ["r10", "r10"], enemies: [], delay: 10, maxEnemies: 10},
                        {names: [], enemies: [{name: "r6", minDiff: 2}, {name: "r8", minDiff: 2}, {name: "r16", minDiff: 3}], delay: 10, maxEnemies: 2},
                        {names: ["bonnie"], enemies: [], delay: 1},
                        {names: ["amber"], enemies: [], delay: 10, maxEnemies: 1}
                    ],
                    background: "stuntshow",
                    displayName: "Stunt Show",
                    stages: [4, 5],
                    destination: 16
                },
                {
                    levelid: 11,
                    waves: [
                        {names: ["r10", "r10"], enemies: []},
                        {names: ["r12", "r16"], enemies: [], delay: 10, maxEnemies: 10},
                        {names: [], enemies: [{name: "r16", minDiff: 2}, {name: "r20", minDiff: 3}], delay: 14, maxEnemies: 2},
                        {names: ["max"], enemies: [], delay: 1},
                        {names: ["meg"], enemies: [], delay: 12, maxEnemies: 1}
                    ],
                    background: "minicity",
                    displayName: "Super City",
                    stages: [5],
                    destination: 20
                },
                {
                    levelid: 12,
                    waves: [
                        {names: [], enemies: [{name: "g6", maxDiff: 0}, {name: "g12", maxDiff: 0}]},
                        {names: [], enemies: [{name: "g12", maxDiff: 0}, {name: "g20", maxDiff: 0}], delay: 1},
                        {names: [], enemies: [{name: "g10", maxDiff: 0}, {name: "g16", maxDiff: 0}], delay: 1},
                        {names: [], enemies: [{name: "g24", maxDiff: 0}], delay: 13, maxEnemies: 2},

                        {names: [], enemies: [{name: "g8", minDiff: 1, maxDiff: 1}, {name: "g16", minDiff: 1, maxDiff: 1}]},
                        {names: [], enemies: [{name: "g12", minDiff: 1, maxDiff: 1}, {name: "g20", minDiff: 1, maxDiff: 1}], delay: 1},
                        {names: [], enemies: [{name: "g10", minDiff: 1, maxDiff: 1}, {name: "g20", minDiff: 1, maxDiff: 1}], delay: 1},
                        {names: [], enemies: [{name: "g30", minDiff: 1, maxDiff: 1}], delay: 15, maxEnemies: 2},

                        {names: [], enemies: [{name: "g8", minDiff: 2, maxDiff: 2}, {name: "g16", minDiff: 2, maxDiff: 2}]},
                        {names: [], enemies: [{name: "g12", minDiff: 2, maxDiff: 2}, {name: "g30", minDiff: 2, maxDiff: 2}], delay: 1},
                        {names: [], enemies: [{name: "g10", minDiff: 2, maxDiff: 2}, {name: "g20", minDiff: 2, maxDiff: 2}], delay: 1},
                        {names: [], enemies: [{name: "g36", minDiff: 2, maxDiff: 2}], delay: 15, maxEnemies: 2},

                        {names: [], enemies: [{name: "g8", minDiff: 3, maxDiff: 3}, {name: "g20", minDiff: 3, maxDiff: 3}]},
                        {names: [], enemies: [{name: "g10", minDiff: 3, maxDiff: 3}, {name: "g12", minDiff: 3, maxDiff: 3}], delay: 1},
                        {names: [], enemies: [{name: "g30", minDiff: 3, maxDiff: 3}], delay: 11, maxEnemies: 2},
                        {names: [], enemies: [{name: "g16", minDiff: 3, maxDiff: 3}, {name: "g24", minDiff: 3, maxDiff: 3}], delay: 1},
                        {names: [], enemies: [{name: "g36", minDiff: 3, maxDiff: 3}], delay: 20, maxEnemies: 2}
                    ],
                    background: "arcade",
                    displayName: "Arcade",
                    stages: [6],
                    destination: 0
                },
                {
                    levelid: 13,
                    waves: [
                        {names: ["bull"], enemies: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [7],
                    destination: 0
                }
            ],
            playerUpgradeValues: {
                health: {
                    cost: [3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13, 14]
                },
                damage: {
                    cost: [4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 16, 17]
                },
                healing: {
                    cost: [3, 4, 5, 6, 6, 7, 9, 10, 12, 14]
                },
                lifeSteal: {
                    cost: [3, 4, 5, 6, 6, 7, 9, 10, 12, 14]
                },
                critical: {
                    cost: [3, 3, 4, 4, 5, 6, 7, 8, 9, 11]
                },
                combo: {
                    cost: [3, 3, 4, 4, 5, 6, 7, 8, 9, 11]
                },
                speed: {
                    cost: [7, 9, 11, 14, 19, 24]
                },
                ability: {
                    cost: [11, 16, 22, 31, 44]
                }
            }
        }
    }],
    ["boss", {
        config: {
            displayName: "Boss Fight",
            recommendedLvl: 5,
            baseWinMastery: [1, 2, 3, 5, 7, 9, 12, 20, 40, 60],
            baseLossMastery: [],
            baseCoins: [],
            baseBadges: []
        },
        gameMod: {
            options: {
                upgradesAtStart: true
            },
            unlocks: {
                startingPower: 40,
                startingGears: 8,
                startingHyper: 200
            },
            difficulties: [
                {
                    difficultyid: 3,
                    name: "Difficulty 4",
                    strengthTier: 1,
                    healthBonusReq: 0.45,
                    timePerEnemy: 0.8,
                    enemyStats: [24]
                },
                {
                    difficultyid: 6,
                    name: "Difficulty 7",
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [36]
                },
                {
                    difficultyid: 7,
                    name: "Difficulty 8",
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [48],
                },
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [100],
                }
            ],
            stages: [
                {completion: 300, time: 180, powerReward: 0, gearsReward: 0}
            ],
            maxScores: {completion: 300, time: 180, destination: 0, health: 90, gear: 30, enemy: 0},
            levels: [
                {
                    levelid: 13,
                    waves: [
                        {names: ["bull"], enemies: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [0],
                    destination: 0
                }
            ],
            playerUpgradeValues: {
                health: {
                    value: [275, 12.5],
                    cost: [5, 5, 6, 6, 6, 6]
                },
                damage: {
                    value: [275, 12.5],
                    cost: [6, 6, 7, 7, 7, 8]
                },
                healing: {
                    value: [275, 25],
                    cost: [5, 6, 7]
                },
                lifeSteal: {
                    value: [275, 25],
                    cost: [5, 6, 7]
                },
                critical: {
                    value: [275, 25],
                    cost: [4, 5, 6]
                },
                combo: {
                    value: [275, 25],
                    cost: [4, 5, 6]
                },
                speed: {
                    value: [4, 2],
                    cost: [8, 10]
                },
                ability: {
                    value: [80, 20],
                    cost: [24]
                }
            }
        }
    }],
    ["bosstrials", {
        config: {
            displayName: "Boss Fight",
            recommendedLvl: 40,
            baseWinMastery: [],
            baseLossMastery: [],
            baseCoins: [],
            baseBadges: [],
            hidden: true
        },
        gameMod: {
            options: {},
            unlocks: {},
            difficulties: [
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [100],
                }
            ],
            stages: [
                {completion: 300, time: 180, powerReward: 0, gearsReward: 0}
            ],
            maxScores: {completion: 300, time: 180, destination: 0, health: 90, gear: 30, enemy: 0},
            levels: [
                {
                    levelid: 13,
                    waves: [
                        {names: ["bull"], enemies: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [0],
                    destination: 0
                }
            ]
        }
    }],
    ["classic1", {
        config: {
            displayName: "Classic Part 1",
            recommendedLvl: 0,
            baseWinMastery: [5, 8, 12, 20, 45, 90],
            baseLossMastery: [2, 4, 6, 8, 10, 20],
            baseCoins: [1, 1.25, 1.5, 2, 2.5, 3.5],
            baseBadges: [2, 3, 4, 5, 6, 8]
        },
        gameMod: {
            difficulties: classicChallenge.difficulties,
            stages: classicChallenge.stages,
            maxScores: classicChallenge.maxScores,
            levels: [
                {
                    levelid: 0,
                    waves: [
                        {names: ["firstmeteor"], enemies: []},
                        {names: ["meteor", "meleerobot"], enemies: [{name: "meleerobot", minDiff: 1}], delay: 1},
                        {names: [], enemies: [{name: "rangedrobot", minDiff: 3}, {name: "fastrobot", minDiff: 4}], delay: 5, maxEnemies: 10},
                        {names: ["shelly"], enemies: [], delay: 1},
                        {names: [], enemies: [{name: "colt", minDiff: 5}], delay: 1}
                    ],
                    background: "entrance",
                    displayName: "Starr Park Entrance",
                    stages: [0]
                },
                {
                    levelid: 2,
                    waves: [
                        {names: ["meteor", "fastrobot"], enemies: [{name: "rangedrobot", count: 2, minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 3}, {name: "r2", count: 3, minDiff: 4}], delay: 7, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 4, minDiff: 5}, {name: "r4", minDiff: 5}], delay: 12, maxEnemies: 6},
                        {names: ["8bit"], enemies: [], delay: 1},
                        {names: ["belle"], enemies: [], delay: 1}
                    ],
                    background: "oldtown",
                    displayName: "Old Town",
                    stages: [1]
                },
                {
                    levelid: 4,
                    waves: [
                        {names: ["rangedrobot"], enemies: [{name: "meteor", count: 2, minDiff: 4}, {name: "meleerobot", minDiff: 1}, {name: "fastrobot", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", count: 4, minDiff: 3}, {name: "r2", count: 3, minDiff: 4}], delay: 8, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 5}, {name: "r6", minDiff: 5}], delay: 14, maxEnemies: 6},
                        {names: ["mortis"], enemies: [], delay: 1},
                        {names: ["frank"], enemies: [], delay: 1}
                    ],
                    background: "ghostmetro",
                    displayName: "Ghost Station",
                    stages: [2]
                },
                {
                    levelid: 7,
                    waves: [
                        {names: [], enemies: [{name: "meleerobot"}, {name: "r2", minDiff: 4}, {name: "r6", minDiff: 1}]},
                        {names: [], enemies: [{name: "meteor", count: 3, minDiff: 5}, {name: "r8", minDiff: 4}], delay: 10, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 3}, {name: "r4", minDiff: 3}, {name: "r9", minDiff: 5}], delay: 11, maxEnemies: 4},
                        {names: ["pearl"], enemies: [], delay: 1},
                        {names: ["bibi"], enemies: [], delay: 1}
                    ],
                    background: "retropolis",
                    displayName: "Retropolis",
                    stages: [3]
                }
            ]
        }
    }],
    ["classic2", {
        config: {
            displayName: "Classic Part 2",
            recommendedLvl: 6,
            baseWinMastery: [10, 16, 24, 40, 90, 180],
            baseLossMastery: [4, 8, 12, 16, 20, 40],
            baseCoins: [1, 1.25, 1.5, 2, 2.5, 3.5],
            baseBadges: [2, 3, 4, 5, 6, 8]
        },
        gameMod: {
            difficulties: classicChallenge.difficulties,
            stages: classicChallenge.stages,
            maxScores: classicChallenge.maxScores,
            levels: [
                {
                    levelid: 1,
                    waves: [
                        {names: [], enemies: [{name: "meteor", count: 2}, {name: "meteor", count: 2, minDiff: 3}, {name: "rangedrobot", minDiff: 3}]},
                        {names: [], enemies: [{name: "meleerobot", minDiff: 1}, {name: "meleerobot", minDiff: 5}, {name: "rangedrobot"}], delay: 6, maxEnemies: 10},
                        {names: ["colt"], enemies: [{name: "fastrobot", count: 2, minDiff: 4}], delay: 6, maxEnemies: 3},
                        {names: ["rt"], enemies: [], delay: 1},
                        {names: [], enemies: [{name: "elprimo", minDiff: 5}], delay: 1}
                    ],
                    background: "hub",
                    displayName: "Starr Park Hub",
                    stages: [0]
                },
                {
                    levelid: 3,
                    waves: [
                        {names: ["meteor", "fastrobot"], enemies: [{name: "meteor", count: 2, minDiff: 1}, {name: "rangedrobot", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 3}, {name: "r2", count: 4, minDiff: 4}], delay: 7, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 5}, {name: "r6", minDiff: 5}], delay: 14, maxEnemies: 6},
                        {names: ["jessie"], enemies: [], delay: 1},
                        {names: ["eve"], enemies: [], delay: 1}
                    ],
                    background: "biodome",
                    displayName: "Biodome",
                    stages: [1]
                },
                {
                    levelid: 5,
                    waves: [
                        {names: ["rangedrobot", "fastrobot"], enemies: [{name: "meteor", count: 2, minDiff: 4}, {name: "meleerobot", minDiff: 1}, {name: "rangedrobot", minDiff: 1}, {name: "fastrobot", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", count: 4, minDiff: 3}, {name: "r2", count: 3, minDiff: 4}], delay: 12, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 5}, {name: "r6", minDiff: 5}], delay: 14, maxEnemies: 7},
                        {names: ["jacky"], enemies: [], delay: 1},
                        {names: ["mrp"], enemies: [], delay: 1}
                    ],
                    background: "deepsea",
                    displayName: "Deep Sea",
                    stages: [2]
                },
                {
                    levelid: 9,
                    waves: [
                        {names: [], enemies: [{name: "rangedrobot", count: 2}, {name: "fastrobot"}, {name: "r8", minDiff: 1}]},
                        {names: [], enemies: [{name: "meteor", minDiff: 4}, {name: "r2", minDiff: 5}, {name: "r9", minDiff: 4}], delay: 14, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 3}, {name: "r6", minDiff: 3}, {name: "r12", minDiff: 5}], delay: 12, maxEnemies: 3},
                        {names: ["ollie"], enemies: [], delay: 1},
                        {names: ["leon"], enemies: [], delay: 1}
                    ],
                    background: "rumblejungle",
                    displayName: "Rumble Jungle",
                    stages: [3]
                }
            ]
        }
    }],
    ["classic3", {
        config: {
            displayName: "Classic Part 3",
            recommendedLvl: 12,
            baseWinMastery: [15, 24, 36, 60, 135, 270],
            baseLossMastery: [6, 12, 18, 24, 30, 60],
            baseCoins: [1, 1.25, 1.5, 2, 2.5, 3.5],
            baseBadges: [2, 3, 4, 5, 6, 8]
        },
        gameMod: {
            difficulties: classicChallenge.difficulties,
            stages: classicChallenge.stages,
            maxScores: classicChallenge.maxScores,
            levels: [
                {
                    levelid: 6,
                    waves: [
                        {names: ["meleerobot", "rangedrobot", "fastrobot"], enemies: [{name: "meteor", count: 2, minDiff: 4}, {name: "meleerobot", minDiff: 1}, {name: "rangedrobot", minDiff: 1}, {name: "fastrobot", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", count: 4, minDiff: 3}, {name: "r2", minDiff: 4}, {name: "r4", minDiff: 4}], delay: 14, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 5}, {name: "r8", minDiff: 5}], delay: 14, maxEnemies: 6},
                        {names: ["bo"], enemies: [], delay: 1},
                        {names: ["colette"], enemies: [], delay: 1}
                    ],
                    background: "giftshop",
                    displayName: "Gift Shop",
                    stages: [0]
                },
                {
                    levelid: 8,
                    waves: [
                        {names: [], enemies: [{name: "rangedrobot", count: 2}, {name: "fastrobot"}, {name: "r6", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", minDiff: 4}, {name: "r2", minDiff: 5}, {name: "r8", minDiff: 4}], delay: 12, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 3, minDiff: 3}, {name: "r4", minDiff: 3}, {name: "r10", minDiff: 5}], delay: 12, maxEnemies: 3},
                        {names: ["brock"], enemies: [], delay: 1},
                        {names: ["chester"], enemies: [], delay: 1}
                    ],
                    background: "candystand",
                    displayName: "Candyland",
                    stages: [1]
                },
                {
                    levelid: 10,
                    waves: [
                        {names: [], enemies: [{name: "fastrobot"}, {name: "fastrobot", minDiff: 1}, {name: "r6", minDiff: 1}]},
                        {names: [], enemies: [{name: "meteor", count: 3, minDiff: 4}, {name: "r2", count: 2, minDiff: 5}, {name: "r9", minDiff: 4}], delay: 10, maxEnemies: 10},
                        {names: [], enemies: [{name: "r2", count: 2, minDiff: 3}, {name: "r8", minDiff: 3}, {name: "r12", minDiff: 5}], delay: 16, maxEnemies: 6},
                        {names: ["bonnie"], enemies: [], delay: 1},
                        {names: ["amber"], enemies: [], delay: 1}
                    ],
                    background: "stuntshow",
                    displayName: "Stunt Show",
                    stages: [2]
                },
                {
                    levelid: 11,
                    waves: [
                        {names: [], enemies: [{name: "fastrobot", count: 2}, {name: "r2", count: 2, minDiff: 5}, {name: "r8", minDiff: 1}]},
                        {names: [], enemies: [{name: "r2", minDiff: 4}, {name: "r2", count: 2, minDiff: 5}, {name: "r4", minDiff: 5}, {name: "r10", minDiff: 4}], delay: 16, maxEnemies: 10},
                        {names: [], enemies: [{name: "meteor", count: 3, minDiff: 3}, {name: "r9", minDiff: 3}, {name: "r12", minDiff: 5}], delay: 20, maxEnemies: 5},
                        {names: ["max"], enemies: [], delay: 1},
                        {names: ["meg"], enemies: [], delay: 1}
                    ],
                    background: "minicity",
                    displayName: "Super City",
                    stages: [3]
                }
            ]
        }
    }]
]);

export default challenges;
