import {UserWaves, ChallengeData, ChallengeGameMod} from "../types";

type PlayerUpgrades = {
    offense: {
        startingPower: number;
        startingGears: number;
        powerPerStage: number;
        gearsPerStage: number;
    } & {
        [k in keyof ChallengeGameMod["playerUpgradeValues"]]: number;
    };
    defense: {
        difficulty: number;
        maxEnemies: number[];
        enemyStats: number[];
        waves: number[][];
    };
}

const stagePoints: [number, number][][] = [
    [[300, 180]],
    [[120, 75], [180, 105]],
    [[60, 45], [90, 60], [150, 75]]
];
const destinations = [
    [
        {levelid: 1, background: "hub", displayName: "Starr Park Hub"}
    ],
    [
        {levelid: 2, background: "oldtown", displayName: "Old Town"},
        {levelid: 3, background: "biodome", displayName: "Biodome"},
        {levelid: 4, background: "ghostmetro", displayName: "Ghost Station"},
        {levelid: 5, background: "snowtel", displayName: "Snowtel"},
        {levelid: 6, background: "giftshop", displayName: "Gift Shop"}
    ],
    [
        {levelid: 7, background: "retropolis", displayName: "Retropolis"},
        {levelid: 8, background: "candystand", displayName: "Candyland"},
        {levelid: 9, background: "rumblejungle", displayName: "Rumble Jungle"},
        {levelid: 10, background: "stuntshow", displayName: "Stunt Show"},
        {levelid: 11, background: "minicity", displayName: "Super City"},
        {levelid: 12, background: "arcade", displayName: "Arcade"}
    ]
];
const offenseUpgrades: {[k in keyof PlayerUpgrades["offense"]]: [number, number][];} = {
    startingPower: [[0, 0], [1, 5], [29, 30]],
    startingGears: [[0, 3]],
    powerPerStage: [[0, 0], [1, 10], [29, 20]],
    gearsPerStage: [[0, 1], [1, 2]],
    health: [[0, 2], [16, 2.25], [26, 2.5]],
    damage: [[0, 2], [16, 2.25], [26, 2.5]],
    healing: [[0, 2], [2, 3], [14, 4]],
    speed: [[0, 0], [4, 1], [22, 2]],
    ability: [[0, 1]],
    lifeSteal: [[0, 0], [8, 0.5], [28, 1]]
};
const defenseUpgrades: (PlayerUpgrades["defense"] & {minLevel: number;})[] = [
    {minLevel: 0, difficulty: 0, maxEnemies: [12], enemyStats: [2], waves: [[12]]},
    {minLevel: 11, difficulty: 3, maxEnemies: [60, 80, 100], enemyStats: [2.5, 4, 6], waves: [[16, 20, 24], [20, 24, 36], [20, 32, 48]]},
    {minLevel: 30, difficulty: 3, maxEnemies: [60, 80, 100], enemyStats: [2.5, 4, 6], waves: [[16, 20, 24], [20, 24, 36], [20, 32, 48]]}
];
const sharedEnemies = new Set<string>(["meteor", "meleerobot", "rangedrobot", "fastrobot"]);
const enemyValues = new Map<string, {displayName: string; value: number; minLevel: number; maxCount: number;}>([
    ["meteor", {displayName: "Meteor", value: 1, minLevel: 0, maxCount: 5}],
    ["meleerobot", {displayName: "Melee Robot", value: 2, minLevel: 0, maxCount: 5}],
    ["rangedrobot", {displayName: "Ranged Robot", value: 2, minLevel: 0, maxCount: 5}],
    ["fastrobot", {displayName: "Fast Robot", value: 2, minLevel: 0, maxCount: 5}]
]);

export function getGameMod(key: string, masteryLevel: number, data: ChallengeData): ChallengeGameMod{
    const gameStages = Math.max(1, Math.min(8, Math.floor(data.levels)));
    const difficulty = Math.max(0, Math.floor(data.difficulty));
    const enemyStats: number[] = [];
    const stages: ChallengeGameMod["stages"] = [];
    const levels: ChallengeGameMod["levels"] = [];

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

        if (x < destinations.length){
            const d = destinations[x][Math.floor(Math.random() * destinations[x].length)];
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
            addBonusEnemies: false,
            maxReportLevels: 8
        },
        difficulties: [{
            difficultyid: difficulty,
            name: "Challenge Difficulty",
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
        playerUpgradeValues: {
            health: {value: [player.health, 4]},
            damage: {value: [player.damage, 4]},
            healing: {value: [player.healing, 1]},
            speed: {value: [player.speed, 1]},
            ability: {value: [player.ability, -10]},
            lifeSteal: {value: [player.lifeSteal, 2]}
        }
    };
}

function getPlayerUpgrades(masteryLevel: number): PlayerUpgrades{
    const upgrades: PlayerUpgrades = {
        offense: {
            startingPower: 0, startingGears: 0, powerPerStage: 0, gearsPerStage: 0,
            health: 2, damage: 2, healing: 2, speed: 0, ability: 1, lifeSteal: 0
        },
        defense: {
            difficulty: 0,
            maxEnemies: [12],
            enemyStats: [2],
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

    let i = 0;
    let found = false;
    while (i < defenseUpgrades.length && found === false){
        // Search for defense upgrades in the same way as offense upgrades then copy the values into the result
        if (i >= defenseUpgrades.length - 1 || (i < defenseUpgrades.length - 1 && masteryLevel < defenseUpgrades[i + 1].minLevel)){
            found = true;
            const defense = defenseUpgrades[i];
            upgrades.defense.difficulty = defense.difficulty;
            upgrades.defense.maxEnemies = defense.maxEnemies.map((value) => value);
            upgrades.defense.enemyStats = defense.enemyStats.map((value) => value);
            upgrades.defense.waves = defense.waves.map((value) => value.map((wave) => wave));
        } else{
            i++;
        }
    }
    
    return upgrades;
}

export function createChallengeData(masteryLevel: number, waves: UserWaves): {message: string; data: ChallengeData | undefined}{
    // Get the player upgrade values from their mastery level
    const upgrades = getPlayerUpgrades(masteryLevel).defense;

    const gameStages = Math.max(1, Math.min(8, upgrades.maxEnemies.length, upgrades.enemyStats.length, upgrades.waves.length));

    let message = "";

    // Stores the number of times the user has added each enemy
    const counts = new Map<string, number>();
    // Stores the number of remaining waves for each stage
    const waveCounts = upgrades.waves.map((value) => value.length);
    // Stores the number of enemies remaining for each stage
    const waveValues = upgrades.maxEnemies.map((value) => value);
    
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

            // Total value of all enemies in this wave
            let waveValue = 0;

            for (let x = 0; x < enemies.length; x++){
                const values = enemyValues.get(enemies[x]);

                if (values !== undefined && masteryLevel >= values.minLevel){
                    waveValue += values.value;
                    // Find the current enemy in the map of counted enemies and add 1 to it
                    const count = counts.get(enemies[x]);
                    if (count !== undefined){
                        if (count + 1 > values.maxCount){
                            message = `Too many ${values.displayName} enemies in the challenge. There can be at most ${values.maxCount}.`;
                        } else{
                            counts.set(enemies[x], count + 1);
                        }
                    } else{
                        counts.set(enemies[x], 1);
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
        }
        x++;
    }
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
            waves: waves
        }
    };
}
