import {ChallengeConfig, ChallengeGameMod} from "../types";

interface ChallengePreset{
    config: ChallengeConfig;
    gameMod: ChallengeGameMod;
}

const classicChallenge = {
    difficulties: [
        {
            difficultyid: 0,
            name: "Difficulty 1",
            countTier: 0,
            strengthTier: 0,
            healthBonusReq: 0.4,
            timePerEnemy: 0.8,
            enemyStats: [8, 9, 11, 13]
        },
        {
            difficultyid: 1,
            name: "Difficulty 2",
            countTier: 1,
            strengthTier: 0,
            healthBonusReq: 0.45,
            timePerEnemy: 0.75,
            enemyStats: [8, 9, 11, 14]
        },
        {
            difficultyid: 2,
            name: "Difficulty 3",
            countTier: 1,
            strengthTier: 1,
            healthBonusReq: 0.45,
            timePerEnemy: 0.7,
            enemyStats: [10, 12, 15, 18]
            
        },
        {
            difficultyid: 3,
            name: "Difficulty 4",
            countTier: 2,
            strengthTier: 1,
            healthBonusReq: 0.5,
            timePerEnemy: 0.6,
            enemyStats: [12, 16, 21, 26]
        },
        {
            difficultyid: 4,
            name: "Difficulty 5",
            countTier: 3,
            strengthTier: 2,
            healthBonusReq: 0.5,
            timePerEnemy: 0.6,
            enemyStats: [14, 19, 25, 32]
        },
        {
            difficultyid: 5,
            name: "Difficulty 6",
            countTier: 4,
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

const challenges = new Map<string, ChallengePreset>([
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
                countTier: 0,
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
            baseWinMastery: [0],
            baseLossMastery: [0],
            baseCoins: [0],
            baseBadges: [0]
        },
        gameMod: {
            options: {
                gameMode: 1,
                maxAccessories: 0,
                startingPower: 0,
                startingGears: 3,
                bonusResources: false
            },
            difficulties: [
                {
                    difficultyid: 0,
                    name: "Difficulty 1",
                    countTier: 0,
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
            recommendedLvl: 12,
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
                    countTier: 0,
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [12, 15, 18, 21, 24, 28, 33, 36]
                },
                {
                    difficultyid: 7,
                    name: "Difficulty 8",
                    countTier: 0,
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [14, 20, 23, 26, 31, 37, 44, 46]
                },
                {
                    difficultyid: 8,
                    name: "Difficulty 9",
                    countTier: 1,
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.7,
                    enemyStats: [18, 24, 31, 38, 45, 52, 61, 64]
                },
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    countTier: 2,
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [24, 36, 48, 60, 70, 80, 94, 100]
                }
            ],
            stages: [
                {completion: 10, time: 0, powerReward: 10, gearsReward: 100},
                {completion: 15, time: 15, powerReward: 20, gearsReward: 100},
                {completion: 20, time: 15, powerReward: 30, gearsReward: 100},
                {completion: 30, time: 20, powerReward: 42, gearsReward: 100},
                {completion: 45, time: 20, powerReward: 56, gearsReward: 100},
                {completion: 60, time: 25, powerReward: 72, gearsReward: 100},
                {completion: 60, time: 25, powerReward: 90, gearsReward: 100},
                {completion: 60, time: 30, powerReward: 0, gearsReward: 0}
            ],
            levels: [
                {
                    levelid: 0,
                    waves: [
                        {names: [["firstmeteor"]], multiple: []},
                        {names: [], multiple: [{name: "meteor", count: [1]}, {name: "meleerobot", count: [1]}], delay: 1},
                        {names: [["shelly", "colt"]], multiple: [], delay: 2, maxEnemies: 10},
                        {names: [[], [], ["rt"]], multiple: [{name: "rangedrobot", count: [0, 1]}, {name: "fastrobot", count: [0, 1]}], delay: 5, maxEnemies: 2}
                    ],
                    background: "entrance",
                    displayName: "Starr Park Entrance",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 1,
                    waves: [
                        {names: [], multiple: [{name: "meleerobot", count: [0, 0, 1]}, {name: "rangedrobot", count: [0, 2]}, {name: "fastrobot", count: [2]}]},
                        {names: [["shelly", "colt"]], multiple: [], delay: 5, maxEnemies: 10},
                        {names: [[], [], ["r10"]], multiple: [], delay: 5, maxEnemies: 2},
                        {names: [["rt", "elprimo"]], multiple: [], delay: 1}
                    ],
                    background: "hub",
                    displayName: "Starr Park Hub",
                    stages: [1],
                    destination: 0
                },
                {
                    levelid: 2,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [3]}, {name: "r2", count: [2]}]},
                        {names: [[], ["r8"], ["r4"]], multiple: [], delay: 4, maxEnemies: 10},
                        {names: [["r12"], [], ["r8"]], multiple: [], delay: 6, maxEnemies: 2},
                        {names: [["8bit"]], multiple: [], delay: 1},
                        {names: [["belle"]], multiple: [], delay: 4, maxEnemies: 1}
                    ],
                    background: "oldtown",
                    displayName: "Old Town",
                    stages: [2],
                    destination: 0
                },
                {
                    levelid: 3,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [3]}, {name: "r2", count: [3]}]},
                        {names: [[], ["r8"], ["r4"]], multiple: [], delay: 5, maxEnemies: 10},
                        {names: [["r12"], [], ["r8"]], multiple: [], delay: 6, maxEnemies: 2},
                        {names: [["jessie"]], multiple: [], delay: 1},
                        {names: [["eve"]], multiple: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "biodome",
                    displayName: "Biodome",
                    stages: [2, 3],
                    destination: 0
                },
                {
                    levelid: 4,
                    waves: [
                        {names: [["r10"]], multiple: []},
                        {names: [["r4", "r8"]], multiple: [], delay: 5, maxEnemies: 10},
                        {names: [[], ["r8"], ["r9"]], multiple: [{name: "meteor", count: [0, 0, 3]}, {name: "r2", count: [0, 0, 1]}], delay: 6, maxEnemies: 2},
                        {names: [["mortis"]], multiple: [], delay: 1},
                        {names: [["frank"]], multiple: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "ghostmetro",
                    displayName: "Ghost Station",
                    stages: [2, 3],
                    destination: 4
                },
                {
                    levelid: 5,
                    waves: [
                        {names: [["r12"]], multiple: []},
                        {names: [["r6", "r8"]], multiple: [], delay: 6, maxEnemies: 10},
                        {names: [[], ["r8"], ["r16"]], multiple: [], delay: 7, maxEnemies: 2},
                        {names: [["jacky"]], multiple: [], delay: 1},
                        {names: [["mrp"]], multiple: [], delay: 5, maxEnemies: 1}
                    ],
                    background: "deepsea",
                    displayName: "Deep Sea",
                    stages: [2, 3],
                    destination: 6
                },
                {
                    levelid: 6,
                    waves: [
                        {names: [["r12"]], multiple: []},
                        {names: [["r9", "r9"]], multiple: [], delay: 6, maxEnemies: 10},
                        {names: [[], ["r10"], ["r16"]], multiple: [], delay: 9, maxEnemies: 2},
                        {names: [["bo"]], multiple: [], delay: 1},
                        {names: [["colette"]], multiple: [], delay: 6, maxEnemies: 1}
                    ],
                    background: "giftshop",
                    displayName: "Gift Shop",
                    stages: [3],
                    destination: 8
                },
                {
                    levelid: 7,
                    waves: [
                        {names: [["r10"]], multiple: []},
                        {names: [["r9", "r9"]], multiple: [], delay: 5, maxEnemies: 10},
                        {names: [[], ["r12"], ["r16"]], multiple: [], delay: 9, maxEnemies: 2},
                        {names: [["pearl"]], multiple: [], delay: 1},
                        {names: [["bibi"]], multiple: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "retropolis",
                    displayName: "Retropolis",
                    stages: [4],
                    destination: 0
                },
                {
                    levelid: 8,
                    waves: [
                        {names: [["r12"]], multiple: []},
                        {names: [["r4", "r6", "r10"]], multiple: [], delay: 6, maxEnemies: 10},
                        {names: [[], ["r12"], ["r16"]], multiple: [], delay: 10, maxEnemies: 2},
                        {names: [["mandy"]], multiple: [], delay: 1},
                        {names: [["chester"]], multiple: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "candystand",
                    displayName: "Candyland",
                    stages: [4, 5],
                    destination: 0
                },
                {
                    levelid: 9,
                    waves: [
                        {names: [["r8", "r12"]], multiple: []},
                        {names: [["r10", "r10"]], multiple: [], delay: 10, maxEnemies: 10},
                        {names: [[], ["r12"], ["r16"]], multiple: [], delay: 10, maxEnemies: 2},
                        {names: [["ollie"]], multiple: [], delay: 1},
                        {names: [["leon"]], multiple: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "rumblejungle",
                    displayName: "Rumble Jungle",
                    stages: [4, 5],
                    destination: 12
                },
                {
                    levelid: 10,
                    waves: [
                        {names: [["r8", "r12"]], multiple: []},
                        {names: [["r10", "r10"]], multiple: [], delay: 10, maxEnemies: 10},
                        {names: [[], ["r6", "r8"], ["r16"]], multiple: [], delay: 10, maxEnemies: 2},
                        {names: [["bonnie"]], multiple: [], delay: 1},
                        {names: [["amber"]], multiple: [], delay: 10, maxEnemies: 1}
                    ],
                    background: "stuntshow",
                    displayName: "Stunt Show",
                    stages: [4, 5],
                    destination: 16
                },
                {
                    levelid: 11,
                    waves: [
                        {names: [["r10", "r10"]], multiple: []},
                        {names: [["r12", "r16"]], multiple: [], delay: 10, maxEnemies: 10},
                        {names: [[], ["r16"], ["r20"]], multiple: [], delay: 14, maxEnemies: 2},
                        {names: [["max"]], multiple: [], delay: 1},
                        {names: [["meg"]], multiple: [], delay: 12, maxEnemies: 1}
                    ],
                    background: "minicity",
                    displayName: "Super City",
                    stages: [5],
                    destination: 20
                },
                {
                    levelid: 12,
                    waves: [
                        {names: [["g6", "g12"]], multiple: [], "onDifficulty": 6},
                        {names: [["g12", "g20"]], multiple: [], delay: 1, "onDifficulty": 6},
                        {names: [["g10", "g16"]], multiple: [], delay: 1, "onDifficulty": 6},
                        {names: [["g24"]], multiple: [], delay: 13, maxEnemies: 2, "onDifficulty": 6},
        
                        {names: [["g8", "g16"]], multiple: [], "onDifficulty": 7},
                        {names: [["g12", "g20"]], multiple: [], delay: 1,"onDifficulty": 7},
                        {names: [["g10", "g20"]], multiple: [], delay: 1, "onDifficulty": 7},
                        {names: [["g30"]], multiple: [], delay: 15, maxEnemies: 2, "onDifficulty": 7},
        
                        {names: [["g8", "g16"]], multiple: [], "onDifficulty": 8},
                        {names: [["g12", "g30"]], multiple: [], delay: 1, "onDifficulty": 8},
                        {names: [["g10", "g20"]], multiple: [], delay: 1, "onDifficulty": 8},
                        {names: [["g36"]], multiple: [], delay: 15, maxEnemies: 2, "onDifficulty": 8},
        
                        {names: [["g8", "g20"]], multiple: [], "onDifficulty": 9},
                        {names: [["g10", "g12"]], multiple: [], delay: 1, "onDifficulty": 9},
                        {names: [["g30"]], multiple: [], delay: 11, maxEnemies: 2, "onDifficulty": 9},
                        {names: [["g16", "g24"]], multiple: [], delay: 1, "onDifficulty": 9},
                        {names: [["g36"]], multiple: [], delay: 20, maxEnemies: 2, "onDifficulty": 9}
                    ],
                    background: "arcade",
                    displayName: "Arcade",
                    stages: [6],
                    destination: 0
                },
                {
                    levelid: 13,
                    waves: [
                        {names: [["bull"]], multiple: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [7],
                    destination: 0
                }
            ],
            playerUpgradeValues: {
                health: {
                    cost: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11],
                    maxLevel: 20
                },
                damage: {
                    cost: [4, 4, 4, 5, 5, 6, 7, 7, 8, 9, 10, 11, 12, 13, 15, 16],
                    maxLevel: 16
                },
                healing: {
                    cost: [5, 6, 7, 8, 10, 11, 13, 16, 19, 23],
                    maxLevel: 10
                },
                lifeSteal: {
                    cost: [5, 6, 7, 8, 10, 11, 13, 16, 19, 23],
                    maxLevel: 10
                },
                speed: {
                    cost: [6, 7, 8, 10, 13, 16, 19, 24],
                    maxLevel: 8
                },
                combo: {
                    cost: [3, 4, 4, 5, 5, 6, 7, 8, 8, 10, 11, 12, 14, 15],
                    maxLevel: 14
                },
                ability: {
                    cost: [9, 12, 15, 19, 25, 31],
                    maxLevel: 6
                }
            }
        }
    }],
    ["boss", {
        config: {
            displayName: "Boss Fight",
            recommendedLvl: 4,
            baseWinMastery: [1, 2, 3, 4, 5, 6, 8, 15, 25, 40],
            baseLossMastery: [],
            baseCoins: [],
            baseBadges: []
        },
        gameMod: {
            options: {
                startingHyper: 200
            },
            difficulties: [
                {
                    difficultyid: 3,
                    name: "Difficulty 4",
                    countTier: 0,
                    strengthTier: 1,
                    healthBonusReq: 0.45,
                    timePerEnemy: 0.8,
                    enemyStats: [24, 24]
                },
                {
                    difficultyid: 6,
                    name: "Difficulty 7",
                    countTier: 0,
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [33, 36]
                },
                {
                    difficultyid: 7,
                    name: "Difficulty 8",
                    countTier: 0,
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [44, 48],
                },
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    countTier: 0,
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [94, 100],
                }
            ],
            stages: [
                {completion: 0, time: 0, powerReward: 10, gearsReward: 0},
                {completion: 300, time: 180, powerReward: 0, gearsReward: 0}
            ],
            maxScores: {completion: 300, time: 180, destination: 0, health: 90, gear: 30, enemy: 0},
            levels: [
                {
                    levelid: 0,
                    waves: [
                        {names: [["firstmeteor"]], multiple: []}
                    ],
                    background: "entrance",
                    displayName: "Starr Park Entrance",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 13,
                    waves: [
                        {names: [["bull"]], multiple: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [1],
                    destination: 0
                }
            ],
            playerUpgradeValues: {
                health: {
                    value: [275, 12.5],
                    cost: [5, 5, 6, 6, 6, 6],
                    maxLevel: 6
                },
                damage: {
                    value: [225, 12.5],
                    cost: [5, 5, 6, 6, 6, 6],
                    maxLevel: 6
                },
                healing: {
                    value: [450, 50],
                    cost: [7, 8, 10],
                    maxLevel: 3
                },
                lifeSteal: {
                    value: [450, 50],
                    cost: [7, 8, 10],
                    maxLevel: 3
                },
                speed: {
                    value: [6, 2],
                    cost: [10, 12],
                    maxLevel: 1
                },
                combo: {
                    value: [600, 50],
                    cost: [5, 6, 6, 6],
                    maxLevel: 4
                },
                ability: {
                    value: [100, 20],
                    cost: [24],
                    maxLevel: 1
                }
            }
        }
    }],
    ["classic1", {
        config: {
            displayName: "Classic Part 1",
            recommendedLvl: 0,
            baseWinMastery: [2, 3, 5, 9, 20, 60],
            baseLossMastery: [2, 3, 5, 7, 10, 15],
            baseCoins: [1, 1, 1.25, 1.5, 1.75, 2.5],
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
                        {names: [["firstmeteor"]], multiple: []},
                        {names: [], multiple: [{name: "meteor", count: [1]}, {name: "meleerobot", count: [1, 2]}], delay: 1},
                        {names: [], multiple: [{name: "rangedrobot", count: [0, 0, 1]}, {name: "fastrobot", count: [0, 0, 0, 1]}], delay: 5, maxEnemies: 10},
                        {names: [["shelly"]], multiple: [], delay: 1},
                        {names: [[], [], [], [], ["colt"]], multiple: [], delay: 1}
                    ],
                    background: "entrance",
                    displayName: "Starr Park Entrance",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 2,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [1]}, {name: "rangedrobot", count: [0, 2]}, {name: "fastrobot", count: [1]}]},
                        {names: [], multiple: [{name: "r2", count: [0, 0, 3, 6]}], delay: 7, maxEnemies: 10},
                        {names: [[], [], [], [], ["r4"]], multiple: [{name: "r2", count: [0, 0, 0, 0, 4]}], delay: 12, maxEnemies: 6},
                        {names: [["8bit"]], multiple: [], delay: 1},
                        {names: [["belle"]], multiple: [], delay: 1}
                    ],
                    background: "oldtown",
                    displayName: "Old Town",
                    stages: [1],
                    destination: 0
                },
                {
                    levelid: 4,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [0, 0, 0, 2]}, {name: "meleerobot", count: [0, 1]}, {name: "rangedrobot", count: [1]}, {name: "fastrobot", count: [0, 1]}]},
                        {names: [], multiple: [{name: "r2", count: [0, 0, 4, 7]}], delay: 8, maxEnemies: 10},
                        {names: [[], [], [], [], ["r6"]], multiple: [{name: "r2", count: [0, 0, 0, 0, 3]}], delay: 14, maxEnemies: 6},
                        {names: [["mortis"]], multiple: [], delay: 1},
                        {names: [["frank"]], multiple: [], delay: 1}
                    ],
                    background: "ghostmetro",
                    displayName: "Ghost Station",
                    stages: [2],
                    destination: 0
                },
                {
                    levelid: 7,
                    waves: [
                        {names: [[], ["r6"]], multiple: [{name: "meleerobot", count: [1]}, {name: "r2", count: [0, 0, 0, 1]}]},
                        {names: [[], [], [], ["r8"]], multiple: [{name: "meteor", count: [0, 0, 0, 0, 3]}], delay: 10, maxEnemies: 10},
                        {names: [[], [], ["r4"], [], ["r9"]], multiple: [{name: "r2", count: [0, 0, 3]}], delay: 11, maxEnemies: 4},
                        {names: [["pearl"]], multiple: [], delay: 1},
                        {names: [["bibi"]], multiple: [], delay: 1}
                    ],
                    background: "retropolis",
                    displayName: "Retropolis",
                    stages: [3],
                    destination: 0
                }
            ]
        }
    }],
    ["classic2", {
        config: {
            displayName: "Classic Part 2",
            recommendedLvl: 6,
            baseWinMastery: [4, 6, 9, 18, 40, 120],
            baseLossMastery: [4, 6, 9, 12, 16, 20],
            baseCoins: [1, 1, 1.25, 1.5, 1.75, 2.5],
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
                        {names: [], multiple: [{name: "meteor", count: [2, 2, 4]}, {name: "rangedrobot", count: [0, 0, 1]}]},
                        {names: [], multiple: [{name: "meleerobot", count: [0, 1, 1, 1, 2]}, {name: "rangedrobot", count: [1]}], delay: 6, maxEnemies: 10},
                        {names: [["colt"]], multiple: [{name: "fastrobot", count: [0, 0, 0, 2]}], delay: 6, maxEnemies: 3},
                        {names: [["rt"]], multiple: [], delay: 1},
                        {names: [[], [], [], [], ["elprimo"]], multiple: [], delay: 1}
                    ],
                    background: "hub",
                    displayName: "Starr Park Hub",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 3,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [1, 3]}, {name: "rangedrobot", count: [0, 1]}, {name: "fastrobot", count: [1]}]},
                        {names: [], multiple: [{name: "r2", count: [0, 0, 3, 7]}], delay: 7, maxEnemies: 10},
                        {names: [[], [], [], [], ["r6"]], multiple: [{name: "r2", count: [0, 0, 0, 0, 3]}], delay: 14, maxEnemies: 6},
                        {names: [["jessie"]], multiple: [], delay: 1},
                        {names: [["eve"]], multiple: [], delay: 1}
                    ],
                    background: "biodome",
                    displayName: "Biodome",
                    stages: [1],
                    destination: 0
                },
                {
                    levelid: 5,
                    waves: [
                        {names: [], multiple: [{name: "meteor", count: [0, 0, 0, 2]}, {name: "meleerobot", count: [0, 1]}, {name: "rangedrobot", count: [1, 2]}, {name: "fastrobot", count: [1, 2]}]},
                        {names: [], multiple: [{name: "r2", count: [0, 0, 4, 7]}], delay: 12, maxEnemies: 10},
                        {names: [[], [], [], [], ["r6"]], multiple: [{name: "r2", count: [0, 0, 0, 0, 3]}], delay: 14, maxEnemies: 7},
                        {names: [["jacky"]], multiple: [], delay: 1},
                        {names: [["mrp"]], multiple: [], delay: 1}
                    ],
                    background: "deepsea",
                    displayName: "Deep Sea",
                    stages: [2],
                    destination: 0
                },
                {
                    levelid: 9,
                    waves: [
                        {names: [[], ["r8"]], multiple: [{name: "rangedrobot", count: [2]}, {name: "fastrobot", count: [1]}]},
                        {names: [[], [], [], ["r9"]], multiple: [{name: "meteor", count: [0, 0, 0, 1]}, {name: "r2", count: [0, 0, 0, 0, 1]}], delay: 14, maxEnemies: 10},
                        {names: [[], [], ["r6"], [], ["r12"]], multiple: [{name: "r2", count: [0, 0, 3]}], delay: 12, maxEnemies: 3},
                        {names: [["ollie"]], multiple: [], delay: 1},
                        {names: [["leon"]], multiple: [], delay: 1}
                    ],
                    background: "rumblejungle",
                    displayName: "Rumble Jungle",
                    stages: [3],
                    destination: 0
                }
            ]
        }
    }],
    ["classic3", {
        config: {
            displayName: "Classic Part 3",
            recommendedLvl: 10,
            baseWinMastery: [6, 9, 14, 28, 60, 180],
            baseLossMastery: [6, 9, 14, 20, 27, 36],
            baseCoins: [1, 1, 1.25, 1.5, 1.75, 2.5],
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
                        {names: [], multiple: [{name: "meteor", count: [0, 0, 0, 2]}, {name: "meleerobot", count: [1, 2]}, {name: "rangedrobot", count: [1, 2]}, {name: "fastrobot", count: [1, 2]}]},
                        {names: [[], [], [], ["r4"]], multiple: [{name: "r2", count: [0, 0, 4, 5]}], delay: 14, maxEnemies: 10},
                        {names: [[], [], [], [], ["r8"]], multiple: [{name: "r2", count: [0, 0, 0, 0, 3]}], delay: 14, maxEnemies: 6},
                        {names: [["bo"]], multiple: [], delay: 1},
                        {names: [["colette"]], multiple: [], delay: 1}
                    ],
                    background: "giftshop",
                    displayName: "Gift Shop",
                    stages: [0],
                    destination: 0
                },
                {
                    levelid: 8,
                    waves: [
                        {names: [[], ["r6"]], multiple: [{name: "rangedrobot", count: [2]}, {name: "fastrobot", count: [1]}]},
                        {names: [[], [], [], ["r8"]], multiple: [{name: "r2", count: [0, 0, 0, 1, 2]}], delay: 12, maxEnemies: 10},
                        {names: [[], [], ["r4"], [], ["r10"]], multiple: [{name: "r2", count: [0, 0, 3]}], delay: 12, maxEnemies: 3},
                        {names: [["mandy"]], multiple: [], delay: 1},
                        {names: [["chester"]], multiple: [], delay: 1}
                    ],
                    background: "candystand",
                    displayName: "Candyland",
                    stages: [1],
                    destination: 0
                },
                {
                    levelid: 10,
                    waves: [
                        {names: [[], ["r6"]], multiple: [{name: "fastrobot", count: [1, 2]}]},
                        {names: [[], [], [], ["r9"]], multiple: [{name: "meteor", count: [0, 0, 0, 3]}, {name: "r2", count: [0, 0, 0, 0, 2]}], delay: 10, maxEnemies: 10},
                        {names: [[], [], ["r8"], [], ["r12"]], multiple: [{name: "r2", count: [0, 0, 2]}], delay: 16, maxEnemies: 6},
                        {names: [["bonnie"]], multiple: [], delay: 1},
                        {names: [["amber"]], multiple: [], delay: 1}
                    ],
                    background: "stuntshow",
                    displayName: "Stunt Show",
                    stages: [2],
                    destination: 0
                },
                {
                    levelid: 11,
                    waves: [
                        {names: [[], ["r8"]], multiple: [{name: "fastrobot", count: [2]}, {name: "r2", count: [0, 0, 0, 0, 2]}]},
                        {names: [[], [], [], ["r10"], ["r4"]], multiple: [{name: "r2", count: [0, 0, 0, 1, 3]}], delay: 16, maxEnemies: 10},
                        {names: [[], [], ["r9"], [], ["r12"]], multiple: [{name: "meteor", count: [0, 0, 3]}], delay: 20, maxEnemies: 5},
                        {names: [["max"]], multiple: [], delay: 1},
                        {names: [["meg"]], multiple: [], delay: 1}
                    ],
                    background: "minicity",
                    displayName: "Super City",
                    stages: [3],
                    destination: 0
                }
            ]
        }
    }]
]);

export default challenges;
