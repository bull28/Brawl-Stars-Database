import staticChallenges from "../data/challenges_data.json";
import allEnemies from "../data/enemies_data.json";
import {PIN_IMAGE_DIR} from "../data/constants";
import {RNG} from "./rewards";
import {DatabaseAccessories, PlayerUpgrades, ChallengeUpgrades, UserWaves, ChallengeData, ChallengeGameMod} from "../types";

interface EnemyUpgradeData{
    displayName: string;
    value: number;
    strength: number;
    minLevel: number;
    maxCount: number;
    maxStageCount: number;
}

class Counter{
    map: Map<string, number>;

    constructor(){
        // Counts the number of times each string is added to this map.
        this.map = new Map<string, number>();
    }

    add(key: string, amount: number): number{
        const oldValue = this.map.get(key);
        let newValue = amount;
        if (oldValue !== undefined){
            newValue += oldValue;
        }
        this.map.set(key, newValue);
        return newValue;
    }

    clear(): void{
        this.map.clear();
    }
}

const stagePoints: [number, number][][] = [
    [[300, 180]],
    [[120, 75], [180, 105]],
    [[60, 45], [90, 60], [150, 75]],
    [[45, 35], [60, 40], [75, 45], [120, 60]]
];
const destinations: {levelid: number; weight: number; background: string; displayName: string;}[][] = [
    [
        {levelid: 1, weight: 1, background: "hub", displayName: "Starr Park Hub"}
    ],
    [
        {levelid: 2, weight: 1, background: "oldtown", displayName: "Old Town"},
        {levelid: 3, weight: 1, background: "biodome", displayName: "Biodome"},
        {levelid: 4, weight: 1, background: "ghostmetro", displayName: "Ghost Station"},
    ],
    [
        {levelid: 5, weight: 3, background: "snowtel", displayName: "Snowtel"},
        {levelid: 6, weight: 3, background: "giftshop", displayName: "Gift Shop"},
        {levelid: 7, weight: 2, background: "retropolis", displayName: "Retropolis"},
        {levelid: 8, weight: 2, background: "candystand", displayName: "Candyland"},
    ],
    [
        {levelid: 9, weight: 1, background: "rumblejungle", displayName: "Rumble Jungle"},
        {levelid: 10, weight: 1, background: "stuntshow", displayName: "Stunt Show"},
        {levelid: 11, weight: 1, background: "minicity", displayName: "Super City"},
        {levelid: 12, weight: 2, background: "arcade", displayName: "Arcade"}
    ]
];
const offenseUpgrades: {[k in keyof PlayerUpgrades["offense"]]: [number, number][];} = {
    startingPower: [[0, 0]],
    startingGears: [[0, 2], [6, 3], [12, 4], [18, 5], [24, 6]],
    powerPerStage: [
        [ 0,  0],
        [ 1,  3], [ 3,  4], [ 5,  5],
        [ 7,  6], [ 9,  9], [11, 12],
        [13, 18], [15, 24], [17, 30],
        [19, 36], [21, 42], [23, 48],
        [25, 56], [27, 64], [29, 72]
    ],
    gearsPerStage: [[0, 0], [10, 1], [20, 2], [30, 3]],
    maxAccessories: [[0, 0], [6, 1], [12, 2], [18, 3], [24, 4], [30, 5]],
    health: [[0, 100]],
    damage: [[0, 100]],
    healing: [[0, 100]],
    speed: [[0, 0]],
    ability: [[0, 1]],
    lifeSteal: [[0, 0]]
};
const defenseUpgradesOdd: (Pick<PlayerUpgrades["defense"], "difficulty" | "enemyStats">)[] = [
    {difficulty: 0, enemyStats: [100.0, 100.0, 100.0, 100.0]},// Level 0
    {difficulty: 0, enemyStats: [100.0, 100.0, 100.0, 100.0]},// Level 1
    {difficulty: 0, enemyStats: [100.0, 100.0, 100.0, 100.0]},// Level 3
    {difficulty: 0, enemyStats: [100.0, 112.5, 100.0, 100.0]},
    {difficulty: 0, enemyStats: [100.0, 112.5, 100.0, 100.0]},
    {difficulty: 1, enemyStats: [100.0, 112.5, 100.0, 100.0]},
    {difficulty: 1, enemyStats: [100.0, 125.0, 100.0, 100.0]},
    {difficulty: 1, enemyStats: [100.0, 137.5, 100.0, 100.0]},
    {difficulty: 1, enemyStats: [112.5, 137.5, 187.5, 100.0]},
    {difficulty: 1, enemyStats: [112.5, 150.0, 200.0, 100.0]},
    {difficulty: 2, enemyStats: [112.5, 150.0, 200.0, 100.0]},
    {difficulty: 2, enemyStats: [112.5, 162.5, 212.5, 100.0]},
    {difficulty: 2, enemyStats: [112.5, 175.0, 225.0, 100.0]},
    {difficulty: 2, enemyStats: [125.0, 187.5, 237.5, 287.5]},
    {difficulty: 2, enemyStats: [125.0, 200.0, 250.0, 300.0]},
    {difficulty: 3, enemyStats: [125.0, 200.0, 250.0, 300.0]}// Level 29
];
const defenseUpgradesEven: (Pick<PlayerUpgrades["defense"], "maxEnemies" | "waves">)[] = [
    {maxEnemies: [12], waves: [[12]]},// Level 0
    {maxEnemies: [20], waves: [[12, 8]]},// Level 2
    {maxEnemies: [20], waves: [[15, 10]]},// Level 4
    {maxEnemies: [20, 12], waves: [[15, 10], [15]]},
    {maxEnemies: [20, 12], waves: [[15, 10], [15]]},
    {maxEnemies: [20, 24], waves: [[15, 10], [15, 15]]},
    {maxEnemies: [20, 24], waves: [[15, 10], [15, 15]]},
    {maxEnemies: [24, 36], waves: [[15, 15], [20, 25]]},
    {maxEnemies: [24, 36, 20], waves: [[18, 18], [24, 30], [18, 12]]},
    {maxEnemies: [24, 36, 20], waves: [[18, 18], [24, 30], [18, 12]]},
    {maxEnemies: [24, 36, 44], waves: [[18, 18], [24, 30], [18, 24, 24]]},
    {maxEnemies: [32, 40, 60], waves: [[18, 30], [24, 36], [24, 30, 36]]},
    {maxEnemies: [32, 40, 60], waves: [[18, 30], [24, 36], [24, 30, 36]]},
    {maxEnemies: [32, 40, 60, 32], waves: [[18, 30], [24, 36], [24, 30, 36], [24, 24]]},
    {maxEnemies: [32, 40, 60, 68], waves: [[18, 30], [24, 36], [24, 30, 36], [30, 36, 36]]},
    {maxEnemies: [40, 48, 64, 88], waves: [[24, 36], [30, 42], [24, 30, 42], [30, 42, 60]]}// Level 30
];
const sharedEnemies = new Set<string>(["meteor", "meleerobot", "rangedrobot", "fastrobot", "r2"]);
const enemyValues = new Map<string, EnemyUpgradeData>([
    ["meteor", {
        displayName: "Meteor", value: 1, strength: 1, minLevel: 0, maxCount: 20, maxStageCount: 10
    }],
    ["r2", {
        displayName: "Robot", value: 2, strength: 1, minLevel: 0, maxCount: 25, maxStageCount: 10
    }],
    ["shelly", {
        displayName: "Shelly", value: 4, strength: 1, minLevel: 0, maxCount: 10, maxStageCount: 4
    }],
    ["colt", {
        displayName: "Colt", value: 6, strength: 1, minLevel: 0, maxCount: 10, maxStageCount: 4
    }],
    ["rt", {
        displayName: "R-T", value: 6, strength: 1, minLevel: 1, maxCount: 8, maxStageCount: 4
    }],
    ["elprimo", {
        displayName: "El Primo", value: 8, strength: 1, minLevel: 1, maxCount: 8, maxStageCount: 4
    }],
    ["8bit", {
        displayName: "8-Bit", value: 8, strength: 1, minLevel: 1, maxCount: 8, maxStageCount: 3
    }],
    ["belle", {
        displayName: "Belle", value: 9, strength: 1, minLevel: 3, maxCount: 8, maxStageCount: 3
    }],
    ["jessie", {
        displayName: "Jessie", value: 9, strength: 1, minLevel: 3, maxCount: 8, maxStageCount: 3
    }],
    ["eve", {
        displayName: "Eve", value: 10, strength: 1, minLevel: 3, maxCount: 8, maxStageCount: 3
    }],
    ["mortis", {
        displayName: "Mortis", value: 10, strength: 1, minLevel: 4, maxCount: 8, maxStageCount: 3
    }],
    ["frank", {
        displayName: "Frank", value: 12, strength: 1, minLevel: 4, maxCount: 8, maxStageCount: 3
    }],
    ["jacky", {
        displayName: "Jacky", value: 10, strength: 1, minLevel: 5, maxCount: 8, maxStageCount: 3
    }],
    ["mrp", {
        displayName: "Mr. P", value: 12, strength: 1, minLevel: 5, maxCount: 8, maxStageCount: 3
    }],
    ["bea", {
        displayName: "Bea", value: 12, strength: 1, minLevel: 7, maxCount: 8, maxStageCount: 3
    }],
    ["colette", {
        displayName: "Colette", value: 12, strength: 1, minLevel: 7, maxCount: 8, maxStageCount: 3
    }],
    ["lola", {
        displayName: "Lola", value: 16, strength: 1, minLevel: 8, maxCount: 6, maxStageCount: 2
    }],
    ["bibi", {
        displayName: "Bibi", value: 16, strength: 1, minLevel: 8, maxCount: 6, maxStageCount: 2
    }],
    ["mandy", {
        displayName: "Mandy", value: 16, strength: 1, minLevel: 12, maxCount: 6, maxStageCount: 2
    }],
    ["ash", {
        displayName: "Ash", value: 20, strength: 1, minLevel: 18, maxCount: 5, maxStageCount: 2
    }],
    ["pearl", {
        displayName: "Pearl", value: 16, strength: 1, minLevel: 12, maxCount: 6, maxStageCount: 2
    }],
    ["leon", {
        displayName: "Leon", value: 24, strength: 1, minLevel: 18, maxCount: 3, maxStageCount: 1
    }],
    ["bonnie", {
        displayName: "Bonnie", value: 20, strength: 1, minLevel: 18, maxCount: 4, maxStageCount: 1
    }],
    ["amber", {
        displayName: "Amber", value: 30, strength: 1, minLevel: 24, maxCount: 2, maxStageCount: 1
    }],
    ["max", {
        displayName: "Max", value: 24, strength: 1, minLevel: 24, maxCount: 2, maxStageCount: 1
    }],
    ["meg", {
        displayName: "Meg", value: 36, strength: 1, minLevel: 24, maxCount: 2, maxStageCount: 1
    }],
    ["siegebase", {
        displayName: "Siege Base", value: 0, strength: 1, minLevel: 0, maxCount: 0, maxStageCount: 0
    }]
]);
// Update enemy names and values if the data in allEnemies is different
enemyValues.forEach((value, key) => {
    if (Object.hasOwn(allEnemies, key) === true){
        const data = allEnemies[key as keyof typeof allEnemies];
        value.displayName = data.displayName;
        value.value = data.value;
    }
});


function getPlayerUpgrades(masteryLevel: number): PlayerUpgrades{
    const upgrades: PlayerUpgrades = {
        offense: {
            startingPower: 0, startingGears: 0, powerPerStage: 0, gearsPerStage: 0, maxAccessories: 0,
            health: 100, damage: 100, healing: 100, speed: 0, ability: 1, lifeSteal: 0
        },
        defense: {
            difficulty: 0,
            maxEnemies: [12],
            enemyStats: [100],
            waves: [[12]]
        }
    };

    for (const x in upgrades.offense){
        const stat = offenseUpgrades[x as keyof PlayerUpgrades["offense"]];
        let i = 0;
        let found = false;
        while (i < stat.length && found === false){
            // Find the first element in this stat's upgrade values where the user's mastery level is less than the next
            // element's required mastery level (index 0 in the upgrade value is the required mastery level).
            if (i >= stat.length - 1 || (i < stat.length - 1 && masteryLevel < stat[i + 1][0])){
                upgrades.offense[x as keyof PlayerUpgrades["offense"]] = stat[i][1];
                found = true;
            }
            i++;
        }
    }

    // The odd upgrades array has level requirements [0, 1, 3, 5, ...]
    // The even upgrades array has level requirements [0, 2, 4, 6, ...]
    const oddIndex = Math.min(Math.ceil(Math.max(0, masteryLevel) / 2), defenseUpgradesOdd.length - 1);
    const evenIndex = Math.min(Math.floor(Math.max(0, masteryLevel) / 2), defenseUpgradesEven.length - 1);

    upgrades.defense.maxEnemies = defenseUpgradesEven[evenIndex].maxEnemies.map((value) => value);
    upgrades.defense.waves = defenseUpgradesEven[evenIndex].waves.map((value) => value.map((wave) => wave));
    upgrades.defense.difficulty = defenseUpgradesOdd[oddIndex].difficulty;
    upgrades.defense.enemyStats = defenseUpgradesOdd[oddIndex].enemyStats.map((value) => value).slice(0, upgrades.defense.maxEnemies.length);

    return upgrades;
}

export function getChallengeUpgrades(masteryLevel: number): ChallengeUpgrades{
    const upgrades = getPlayerUpgrades(masteryLevel);
    const enemies: ChallengeUpgrades["enemies"] = [];

    enemyValues.forEach((value, key) => {
        if (masteryLevel >= value.minLevel && value.maxCount > 0){
            let image = "";
            if (Object.hasOwn(allEnemies, key) === true){
                image = allEnemies[key as keyof typeof allEnemies].image;
                if (image !== ""){
                    image = PIN_IMAGE_DIR + image;
                }
            }

            enemies.push({
                name: key,
                displayName: value.displayName,
                image: image,
                value: value.value,
                maxCount: value.maxCount
            });
        }
    });

    return {
        offense: upgrades.offense,
        defense: upgrades.defense,
        enemies: enemies
    };
}

export function createChallengeData(masteryLevel: number, waves: UserWaves): {message: string; data: ChallengeData | undefined}{
    // Get the player upgrade values from their mastery level
    const upgrades = getPlayerUpgrades(masteryLevel).defense;

    const gameStages = Math.max(1, Math.min(8, upgrades.maxEnemies.length, upgrades.enemyStats.length, upgrades.waves.length));
    const setWaves: ChallengeData["waves"] = [];

    let message = "";

    // For each enemy, there is a limit on the number of times it can appear in the same stage, as well as a limit on
    // the number of times it can appear across all stages in the challenge.
    // These counters store the number of times the user has added each enemy
    const globalCounts = new Counter();
    const stageCounts = new Map<number, Counter>();
    // Stores the number of remaining waves for each stage
    const waveCounts = upgrades.waves.map((value) => value.length);
    // Stores the number of enemies remaining for each stage
    const waveValues = upgrades.maxEnemies.map((value) => value);
    // Stores the last wave's value for each stage
    const lastWave = upgrades.maxEnemies.map((value) => 0);

    let x = 0;
    while (x < waves.length && message === ""){
        const stage = waves[x].level;
        const enemies = waves[x].enemies;
        if (stage === undefined || enemies === undefined || Array.isArray(enemies) === false){
            message = "Challenge waves incorrectly formatted.";
        }
        // Stage number for this wave cannot be greater than the maximum allowed number of stages in the challenge
        if (stage >= gameStages || stage < 0 || waveCounts[stage] <= 0){
            message = `Too many waves are included in level ${stage + 1}`;
        }

        if (message === ""){
            waveCounts[stage]--;

            // Keep track of enemy counts in each stage
            if (stageCounts.has(stage) === false){
                stageCounts.set(stage, new Counter());
            }
            const counts = stageCounts.get(stage)!;

            // Total value of all enemies in this wave
            let waveValue = 0;

            for (let x = 0; x < enemies.length; x++){
                const values = enemyValues.get(enemies[x]);

                if (values !== undefined && masteryLevel >= values.minLevel){
                    waveValue += values.value;

                    // Check that the current enemy is not added too many times in either the current stage or globally
                    if (globalCounts.add(enemies[x], 1) > values.maxCount){
                        message = `Too many ${values.displayName} enemies in the challenge. There can be at most ${values.maxCount}.`;
                    }
                    if (counts.add(enemies[x], 1) > values.maxStageCount){
                        message = `Too many ${values.displayName} enemies in level ${stage + 1}. There can be at most ${values.maxStageCount} per level.`;
                    }
                } else{
                    if (values === undefined){
                        message = `${enemies[x]} is not a valid enemy.`;
                    } else{
                        message = `Mastery level must be at least ${values.minLevel} to use ${values.displayName}.`;
                    }
                }
            }

            // The current wave's value cannot be more than the maximum value allowed for this wave in this stage
            const waveInLevel = upgrades.waves[stage].length - waveCounts[stage] - 1;
            if (waveValue > upgrades.waves[stage][waveInLevel]){
                message = `Too many enemies included in level ${stage + 1}, wave ${waveInLevel + 1}.`;
            }

            // The total value of all enemies in this stage cannot be more than the maximum value allowed for this stage
            waveValues[stage] -= waveValue;
            if (waveValues[stage] < 0){
                message = `Too many enemies included in level ${stage + 1}.`;
            }

            // The delay for the current wave depends on the number of enemies in the previous wave for this stage
            setWaves.push({
                level: waves[x].level,
                enemies: waves[x].enemies,
                delay: lastWave[stage] * 0.5
            });

            // This only works if waves are added to each stage in the order that they appear in
            lastWave[stage] = waveValue;
        }

        x++;
    }
    stageCounts.clear();
    globalCounts.clear();

    if (message !== ""){
        return {message: message, data: undefined};
    }

    const stats = upgrades.enemyStats.filter((value) => value > 0).sort((a, b) => a - b);

    return {
        message: message,
        data: {
            owner: "",
            difficulty: upgrades.difficulty,
            levels: gameStages,
            stats: stats,
            waves: setWaves
        }
    };
}

export function getChallengeStrength(data: ChallengeData): number{
    let strength = 0;
    const diff = 2 + data.difficulty;

    for (let x = 0; x < data.waves.length; x++){
        const enemies = data.waves[x].enemies;
        const stats = (data.waves[x].level < data.stats.length ? data.stats[data.waves[x].level] : 100) / 12.5;

        for (let i = 0; i < enemies.length; i++){
            const values = enemyValues.get(enemies[i]);

            if (values !== undefined){
                strength += values.value * values.strength * (stats + diff);
            }
        }
    }

    return Math.floor(strength);
}

export function getStaticGameMod(key: string, masteryLevel: number, accessories: DatabaseAccessories): ChallengeGameMod | undefined{
    const upgrades = getPlayerUpgrades(masteryLevel).offense;
    const playerAccessories = accessories.filter((value) => typeof value === "string");
    if (key === "expert"){
        // Expert levels (difficulties 7 to 10)
        return {
            options: {maxAccessories: upgrades.maxAccessories},
            difficulties: staticChallenges.expertLevels.difficulties,
            levels: staticChallenges.expertLevels.levels,
            playerAccessories: playerAccessories
        };
    } else if (key === "expertpractice"){
        // Expert levels where all accessories are unlocked but score cannot be saved
        return {
            options: staticChallenges.expertLevels.options,
            difficulties: staticChallenges.expertLevels.difficulties,
            levels: staticChallenges.expertLevels.levels,
            playerAccessories: staticChallenges.expertLevels.playerAccessories
        };
    } else if (enemyValues.has(key) === true){
        const enemyName = enemyValues.get(key)!.displayName;
        const data = staticChallenges.practiceMode.find((value) => value.enemy === key);
        if (data !== undefined){
            return {
                options: {key: key, gameName: `Practice Mode vs. ${enemyName}`, gameMode: 1},
                stages: [{completion: 300, time: 150, powerReward: 0, gearsReward: 0}],
                levels: [{
                    levelid: 1,
                    waves: [{names: [[data.enemy]], multiple: []}],
                    background: data.background,
                    displayName: "Practice Level",
                    stages: [0, 0],
                    destination: 0
                }],
                maxScores: {completion: 300, time: 150, destination: 0, health: 50, gear: 0, enemy: 0},
                playerUpgradeValues: {healing: {value: [200, 0.02]}, lifeSteal: {value: [100, 0.02]}}
            };
        }
    }
    return undefined;
}

export function getKeyGameMod(key: string, masteryLevel: number, accessories: DatabaseAccessories, data: ChallengeData): ChallengeGameMod{
    const gameStages = Math.max(1, Math.min(8, Math.floor(data.levels)));
    const difficulty = Math.max(0, Math.floor(data.difficulty));
    const enemyStats: number[] = [];
    const stages: ChallengeGameMod["stages"] = [];
    const levels: ChallengeGameMod["levels"] = [];
    const playerAccessories = accessories.filter((value) => typeof value === "string");

    let completionMax = 0;
    let timeMax = 0;
    const completionScore: number[] = [];
    const timeScore: number[] = [];

    // Get the total score for the completion and time categories, and the points per stage
    const points = stagePoints[Math.min(stagePoints.length, gameStages) - 1];
    for (let x = 0; x < gameStages; x++){
        if (x < points.length){
            completionScore.push(points[x][0]);
            completionMax += points[x][0];
            timeScore.push(points[x][1]);
            timeMax += points[x][1];
        } else{
            completionScore.push(0);
            timeScore.push(0);
        }
    }
    // completionScore and timeScore are guaranteed to have length = gameStages

    // Get the player upgrade values from their mastery level
    const player = getPlayerUpgrades(masteryLevel).offense;

    // Insert objects into the enemy stats, stages, and levels. Each of these arrays must have length equal to the
    // number of stages.
    for (let x = 0; x < gameStages; x++){
        if (x < data.stats.length){
            enemyStats.push(data.stats[x]);
        } else if (data.stats.length > 0){
            enemyStats.push(data.stats[data.stats.length - 1]);
        } else{
            enemyStats.push(2);
        }

        stages.push({
            completion: completionScore[x],
            time: timeScore[x],
            powerReward: player.powerPerStage,
            gearsReward: player.gearsPerStage
        });

        if (x < destinations.length || destinations.length > 0){
            const i = RNG(destinations[Math.min(x, destinations.length - 1)].map((value) => value.weight));
            if (i >= 0){
                const d = destinations[Math.min(x, destinations.length - 1)][i];
                levels.push({
                    levelid: d.levelid,
                    waves: [],
                    background: d.background,
                    displayName: d.displayName,
                    stages: [x, x],
                    destination: 0
                });
            }
        }
    }

    // Add all enemies to levels
    for (let x = 0; x < data.waves.length; x++){
        if (data.waves[x].level < levels.length){
            const wave: string[] = [];
            const multiple = new Map<string, number>();

            for (let i = 0; i < data.waves[x].enemies.length; i++){
                const enemy = data.waves[x].enemies[i];
                // For shared enemies, keep track of the count of each enemy in the multiple map. All other enemies are
                // added one at a time to the current wave's enemies.
                if (sharedEnemies.has(enemy) === true){
                    const count = multiple.get(enemy);
                    if (count !== undefined){
                        multiple.set(enemy, count + 1);
                    } else{
                        multiple.set(enemy, 1);
                    }
                } else{
                    wave.push(enemy);
                }
            }

            levels[data.waves[x].level].waves.push({
                names: [wave],
                multiple: Array.from(multiple).map((value) => ({name: value[0], count: [value[1]]})),
                delay: data.waves[x].delay !== undefined ? data.waves[x].delay! : 0,
                maxEnemies: data.waves[x].maxEnemies !== undefined ? data.waves[x].maxEnemies! : 15
            });
        }
    }

    return {
        options: {
            key: key,
            gameMode: 2,
            gameName: `${data.owner}'s Challenge`,
            startingPower: player.startingPower,
            startingGears: player.startingGears,
            bonusResources: false,
            addBonusEnemies: false,
            maxAccessories: player.maxAccessories,
            maxReportLevels: 8
        },
        difficulties: [{
            difficultyid: difficulty,
            name: `${data.owner}'s Challenge`,
            countTier: 0,
            strengthTier: difficulty,
            healthBonusReq: 0.5,
            timePerEnemy: 1,
            enemyStats: enemyStats
        }],
        stages: stages,
        levels: levels,
        maxScores: {
            completion: completionMax,
            time: timeMax,
            destination: 0,
            health: 90,
            gear: 30,
            enemy: 0
        },
        playerAccessories: playerAccessories,
        playerUpgradeValues: {
            health: {value: [player.health, 0.08]},
            damage: {value: [player.damage, 0.08]},
            healing: {value: [player.healing, 0.02]},
            speed: {value: [player.speed, 1]},
            ability: {value: [player.ability, -10]},
            lifeSteal: {value: [player.lifeSteal, 0.02]}
        }
    };
}
