import {ChallengeConfig, ChallengeGameMod} from "../types";

interface ChallengePreset{
    config: ChallengeConfig;
    gameMod: ChallengeGameMod;
}

const challenges = new Map<string, ChallengePreset>([
    ["default", {
        config: {
            displayName: "Default Challenge",
            baseWinMastery: [1],
            baseLossMastery: [1],
            baseCoins: [1]
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
                enemyStats: [100]
            }],
            stages: [{
                completion: 300,
                time: 150,
                powerReward: 0,
                gearsReward: 0
            }],
            levels: [{
                levelid: 0,
                waves: [],
                background: "entrance",
                displayName: "Level 1",
                stages: [0, 0],
                destination: 0
            }],
            maxScores: {
                completion: 300,
                time: 150,
                destination: 0,
                health: 90,
                gear: 30,
                enemy: 0
            }
        }
    }],
    ["expert", {
        config: {
            displayName: "Expert Levels",
            baseWinMastery: [1, 1, 1, 1],
            baseLossMastery: [1, 1, 1, 1],
            baseCoins: [1, 1, 1, 1]
        },
        gameMod: {
            options: {
                gameMode: 0,
                addBonusEnemies: true,
                bonusResources: false
            },
            difficulties: [
                {
                    difficultyid: 6,
                    name: "Difficulty 7",
                    countTier: 0,
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [150.0, 187.5, 225.0, 262.5, 300.0, 350.0, 412.5, 450.0]
                },
                {
                    difficultyid: 7,
                    name: "Difficulty 8",
                    countTier: 0,
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [175.0, 250.0, 287.5, 325.0, 387.5, 462.5, 550.0, 575.0]
                },
                {
                    difficultyid: 8,
                    name: "Difficulty 9",
                    countTier: 1,
                    strengthTier: 3,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.7,
                    enemyStats: [225.0, 300.0, 387.5, 475.0, 562.5, 650.0, 762.5, 800.0]
                },
                {
                    difficultyid: 9,
                    name: "Difficulty 10",
                    countTier: 2,
                    strengthTier: 4,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.6666666666666666,
                    enemyStats: [300.0, 450.0, 600.0, 750.0, 862.5, 975.0, 1125.0, 1200.0]
                }
            ],
            stages: [
                {completion: 10, time: 0, powerReward: 15, gearsReward: 1},
                {completion: 15, time: 15, powerReward: 25, gearsReward: 1},
                {completion: 20, time: 15, powerReward: 35, gearsReward: 1},
                {completion: 30, time: 20, powerReward: 45, gearsReward: 1},
                {completion: 45, time: 20, powerReward: 60, gearsReward: 1},
                {completion: 60, time: 25, powerReward: 80, gearsReward: 1},
                {completion: 60, time: 25, powerReward: 100, gearsReward: 1},
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
                    stages: [0, 0],
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
                    stages: [1, 1],
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
                    stages: [2, 2],
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
                        {names: [["bea"]], multiple: [], delay: 1},
                        {names: [["colette"]], multiple: [], delay: 6, maxEnemies: 1}
                    ],
                    background: "giftshop",
                    displayName: "Gift Shop",
                    stages: [3, 3],
                    destination: 8
                },
                {
                    levelid: 7,
                    waves: [
                        {names: [["r10"]], multiple: []},
                        {names: [["r9", "r9"]], multiple: [], delay: 5, maxEnemies: 10},
                        {names: [[], ["r12"], ["r16"]], multiple: [], delay: 9, maxEnemies: 2},
                        {names: [["lola"]], multiple: [], delay: 1},
                        {names: [["bibi"]], multiple: [], delay: 8, maxEnemies: 1}
                    ],
                    background: "retropolis",
                    displayName: "Retropolis",
                    stages: [4, 4],
                    destination: 0
                },
                {
                    levelid: 8,
                    waves: [
                        {names: [["r12"]], multiple: []},
                        {names: [["r4", "r6", "r10"]], multiple: [], delay: 6, maxEnemies: 10},
                        {names: [[], ["r12"], ["r16"]], multiple: [], delay: 10, maxEnemies: 2},
                        {names: [["mandy"]], multiple: [], delay: 1},
                        {names: [["ash"]], multiple: [], delay: 8, maxEnemies: 1}
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
                        {names: [["pearl"]], multiple: [], delay: 1},
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
                    stages: [5, 5],
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
                    stages: [6, 6],
                    destination: 0
                },
                {
                    levelid: 13,
                    waves: [
                        {names: [["bull"]], multiple: []}
                    ],
                    background: "rooftop",
                    displayName: "Rooftop",
                    stages: [7, 7],
                    destination: 0
                }
            ],
            playerUpgradeValues: {
                health: {
                    cost: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 12, 14],
                    maxLevel: 20
                },
                damage: {
                    cost: [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 12, 14],
                    maxLevel: 20
                },
                healing: {
                    cost: [4, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 22],
                    maxLevel: 12
                },
                speed: {
                    cost: [5, 6, 8, 10, 13, 16, 22, 30],
                    maxLevel: 8
                },
                ability: {
                    cost: [6, 10, 14, 20, 30, 48],
                    maxLevel: 6
                },
                lifeSteal: {
                    cost: [6, 8, 10, 14, 18, 24, 32],
                    maxLevel: 7
                }
            }
        }
    }]
]);

if (process.env["NODE_ENV"] === "test"){
    challenges.set("test", {
        config: {
            displayName: "Test Challenge",
            baseWinMastery: [3, 6],
            baseLossMastery: [2, 4],
            baseCoins: [2, 2]
        },
        gameMod: {
            options: {
                gameMode: 0,
                bonusResources: false
            },
            difficulties: [
                {
                    difficultyid: 6,
                    name: "Test Difficulty",
                    countTier: 0,
                    strengthTier: 2,
                    healthBonusReq: 0.5,
                    timePerEnemy: 0.75,
                    enemyStats: [100.0, 125.0, 150.0]
                }
            ],
            stages: [
                {completion: 100, time: 50, powerReward: 15, gearsReward: 1},
                {completion: 100, time: 50, powerReward: 25, gearsReward: 1},
                {completion: 100, time: 50, powerReward: 0, gearsReward: 0}
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
                    stages: [0, 0],
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
                    stages: [1, 1],
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
                    stages: [2, 2],
                    destination: 0
                }
            ],
            maxScores: {
                completion: 300, time: 150, destination: 0, health: 50, gear: 0, enemy: 0
            },
            playerUpgradeValues: {
                health: {
                    cost: [3, 3, 3, 3, 4],
                    maxLevel: 5
                },
                damage: {
                    cost: [3, 3, 3, 3, 4],
                    maxLevel: 5
                },
                healing: {
                    cost: [4, 4, 5],
                    maxLevel: 3
                },
                speed: {
                    cost: [5, 6, 8],
                    maxLevel: 3
                },
                ability: {
                    cost: [6, 10, 14],
                    maxLevel: 3
                },
                lifeSteal: {
                    cost: [6, 8, 10],
                    maxLevel: 3
                }
            }
        }
    });
}

export default challenges;
