import {ChallengeData, ChallengeGameMod} from "../types";

type PlayerUpgrades = {
    startingPower: number;
    startingGears: number;
    powerPerStage: number;
    gearsPerStage: number;
} & {
    [k in keyof ChallengeGameMod["playerUpgradeValues"]]: number;
};

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
const upgrades: {[k in keyof PlayerUpgrades]: [number, number][];} = {
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
const sharedEnemies = new Set<string>(["meteor", "meleerobot", "rangedrobot", "fastrobot"]);

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

    const player: PlayerUpgrades = {
        startingPower: 0, startingGears: 0, powerPerStage: 0, gearsPerStage: 0,
        health: 2, damage: 2, healing: 2, speed: 0, ability: 1, lifeSteal: 0
    };

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
    for (const x in player){
        const stat = upgrades[x as keyof PlayerUpgrades];
        let i = 0;
        let found = false;
        while (i < stat.length && found === false){
            // Find the first element in this stat's upgrade values where the user's mastery level is less than the next
            // element's required mastery level (index 0 in the upgrade value is the required mastery level).
            if (i >= stat.length - 1 || (i < stat.length - 1 && masteryLevel < stat[i + 1][0])){
                player[x as keyof PlayerUpgrades] = stat[i][1];
                found = true;
            }
            i++;
        }
    }

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

            let delay = 0;
            if (levels[data.waves[x].level].waves.length > 0){
                // The first wave in each level starts immediately. All other waves start after some delay, depending
                // on how many enemies are in the previous wave.
                delay = 10;
            }
            levels[data.waves[x].level].waves.push({
                names: [wave],
                multiple: Array.from(multiple).map((value) => ({name: value[0], count: [value[1]]})),
                delay: delay,
                maxEnemies: 10
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
