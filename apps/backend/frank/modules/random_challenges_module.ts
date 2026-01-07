import presets, {enemyList, locationList, locationWeights, levelTiers, masteryStats} from "../data/random_challenges_data";
import {ChallengePreview, ChallengeGameMod, ChallengeRewardResult, ChallengeCategory} from "../types";

type WaveResult = {
    names: string[][];
    multiple: {
        name: string;
        count: number[];
    }[];
    delay?: number;
    maxEnemies?: number;
    onDifficulty?: number;
}[];

interface RandomWaveOptions{
    waves: number[];
    weights: number[];
    maxEnemies: number;
    delayFactor: number;
}

type Enemy = [string, number];

function RNG(options: number[]): number{
    let totalWeight = 0;
    for (let x = 0; x < options.length; x++){
        totalWeight += options[x];
    }
    if (totalWeight === 0){
        return -1;
    }
    let weightRemaining = Math.random() * totalWeight;
    let index = 0;
    let found = false;
    for (let x = 0; x < options.length; x++){
        if (found === false){
            weightRemaining -= options[x];
            if (weightRemaining < 0){
                index = x;
                found = true;
            }
        }
    }
    return index;
}

function findLowestIndex(values: number[], targets: number[]): number{
    let low = -1;
    if (values.length <= 0 || targets.length <= 0){
        return low;
    }
    let min = values[0];
    for (let x = 0; x < values.length; x++){
        const after = values[x] - targets[x];
        if (after < min){
            min = after;
            low = x;
        }
    }
    return low;
}

function findHighestIndex(values: number[], targets: number[], enemies: Enemy[][]): number{
    let high = -1;
    if (values.length <= 0 || targets.length <= 0 || enemies.length <= 0){
        return high;
    }
    let max = targets[0] * -1;
    for (let x = 0; x < values.length; x++){
        if (enemies[x].length > 0){
            const after = values[x] - targets[x] - enemies[x][0][1];
            if (after > max){
                max = after;
                high = x;
            }
        }
    }
    return high;
}

function shouldAddEnemy(target: number, before: number, after: number): boolean{
    if (target <= 0 || before >= target){
        return false;
    }
    if (before <= 0 || after <= target){
        return true;
    }
    const probability = 1 / (1 + Math.exp((before - target + after - target) / 2));
    return Math.random() < probability;
}

function getEnemyStats(base: number, stages: number, power: number, accs: number): number[]{
    const stats: number[] = [];
    const c1 = Math.log(1.104);
    const c2 = 1.104 ** 9.625;

    for (let x = 0; x < stages; x++){
        const powerScaling = (Math.log(power * x * c1 / 6 + c2) / c1 - 9.625) * 50 / 3;
        stats.push(Math.floor(base * (100 + powerScaling + accs) / 100));
    }
    return stats;
}

function createWaves(targets: number[], maxEnemies: number, weights: number[]): {values: number[]; enemies: Enemy[][];}{
    let totalValue = 0;
    let maxValue = 0;
    let enemyCount = 0;

    const enemies: Enemy[][] = [];
    const values: number[] = [];

    for (let x = 0; x < targets.length; x++){
        enemies.push([]);
        values.push(0);
        maxValue += targets[x];
    }
    maxValue = Math.floor(maxValue);

    let validDist = false;
    const tempDist: number[] = [];
    for (let x = 0; x < enemyList.length; x++){
        const weight = x < weights.length ? Math.floor(weights[x]) : 0;
        if (weight > 0){
            validDist = true;
        }
        tempDist.push(weight);
    }
    
    if (validDist === false){
        return {values, enemies};
    }

    let w = 0;
    while (w < targets.length && enemyCount < maxEnemies){
        const enemy = enemyList[RNG(tempDist)];

        if (shouldAddEnemy(maxValue, totalValue, totalValue + enemy.value) === true){
            enemies[w].push([enemy.name, enemy.value]);
            values[w] += enemy.value;
            totalValue += enemy.value;

            if (values[w] >= targets[w]){
                w = w + 1;
            }
            if (totalValue >= maxValue){
                w = targets.length;
            }
        } else{
            w = targets.length;
        }
        enemyCount += 1;
    }
    for (let x = 0; x < enemies.length; x++){
        enemies[x].sort((a, b) => a[1] - b[1]);
    }

    return {values, enemies};
}

function correctWaves(values: number[], targets: number[], enemies: Enemy[][]): boolean{
    const low = findLowestIndex(values, targets);
    const high = findHighestIndex(values, targets, enemies);

    if (low < 0 || high < 0 || low === high){
        return false;
    }

    const lowTarget = targets[low];
    const highTarget = targets[high];

    if (enemies[high].length <= 0){
        return false;
    }
    const transfer = enemies[high][0][1];
    const highAfter = values[high] - transfer;
    const lowAfter = values[low] + transfer;
    // lowafter - lowtarget is how much low is over its target
    // hightarget - highafter is how much lower high is under its target
    // If correction causes high to go below its target and low to go above, high must not be further below its target than low is above
    const canTransfer1 = (
        values[high] - highTarget >= transfer &&
        Math.max(0, lowAfter - lowTarget) <= Math.max(0, highAfter - highTarget)
    );
    const canTransfer2 = (
        values[high] - highTarget >= transfer &&
        (values[high] - highTarget + lowTarget - values[low]) > (highTarget - highAfter + lowAfter - lowTarget)
    );

    if ((canTransfer1 || canTransfer2) === false){
        return false;
    }

    let x = 0;
    while (x <= enemies[low].length){
        if (x >= enemies[low].length - 1 || enemies[low][x][1] > transfer){
            enemies[low].splice(x, 0, enemies[high][0]);
            enemies[high].splice(0, 1);
            x = enemies[low].length + 1;
        }
        x++;
    }
    values[low] += transfer;
    values[high] -= transfer;

    return true;
}

function splitWaves(values: number[], targets: number[], enemies: Enemy[][], start: number = 0): number{
    if (values.length !== targets.length || targets.length !== enemies.length){
        return -1;
    }

    let hardEnemyCount = 0;
    let x = start;
    let result = -1;

    while (x < enemies.length && result < 0){
        hardEnemyCount = 0;
        const wave = enemies[x];
        for (let y = 0; y < wave.length; y++){
            if (wave[y][1] >= 24 && values[x] > 0){
                if (hardEnemyCount >= 1){
                    const nextWave = wave.slice(y);
                    let nextValue = 0;
                    for (let i = 0; i < nextWave.length; i++){
                        nextValue += nextWave[i][1];
                    }
                    const nextTarget = Math.floor(targets[x] * nextValue / values[x]);

                    values.splice(x + 1, 0, nextValue);
                    targets.splice(x + 1, 0, nextTarget);
                    enemies.splice(x + 1, 0, nextWave);

                    values[x] -= nextValue;
                    targets[x] -= nextTarget;
                    enemies[x] = wave.slice(0, y);

                    result = x + 1;
                } else{
                    hardEnemyCount += 1;
                }
            }
        }
        x++;
    }

    return result;
}

function generateRandomWaves(params: RandomWaveOptions): WaveResult{
    const wavesData = params.waves;
    const weights = params.weights;
    const maxEnemies = params.maxEnemies;
    const delay = Math.max(0, params.delayFactor);

    if (wavesData.length <= 0 || weights.length <= 0 || maxEnemies <= 0){
        return [];
    }

    const targets: number[] = [];
    for (let x = 0; x < wavesData.length; x++){
        targets.push(wavesData[x]);
    }

    const {values, enemies} = createWaves(targets, maxEnemies, weights);

    // Move enemies between waves to get the values of each wave as close to the targets as possible
    let correction = 0;
    const maxCorrections = 10;
    while (correction < maxCorrections){
        const success = correctWaves(values, targets, enemies);
        if (success === false){
            correction = maxCorrections;
        } else{
            correction++;
        }
    }

    // Split waves that have too many "hard" enemies
    let split = 0;
    const maxSplits = 5;
    let splitResult = 0;
    while (split < maxSplits && splitResult >= 0){
        splitResult = splitWaves(values, targets, enemies, splitResult);
        split++;
    }

    // Target values are defined in reverse order so reverse the generated lists of enemies to get them in desired order
    if (targets[0] > targets[targets.length - 1]){
        enemies.reverse();
        values.reverse();
    }

    // Remove empty waves
    if (enemies.length === values.length){
        for (let x = enemies.length - 1; x >= 0; x--){
            if (enemies[x].length === 0 && values[x] <= 0){
                enemies.splice(x, 1);
                values.splice(x, 1);
            }
        }
    }

    const waves: Required<ChallengeGameMod>["levels"][number]["waves"] = [];
    for (let x = 0; x < enemies.length; x++){
        const names: string[] = [];
        for (let y = 0; y < enemies[x].length; y++){
            names.push(enemies[x][y][0]);
        }

        let maxEnemies = 0;
        if (x > 1){
            // From the 3rd wave onward, it can only start if at least 1 enemy from the previous 2 waves was defeated
            maxEnemies = enemies[x - 2].length + enemies[x - 1].length - 1;
        } else if (x > 0){
            // The 2nd wave can start as soon as it is ready
            maxEnemies = enemies[x - 1].length;
        }

        waves.push({
            names: [names], multiple: [],
            delay: (x > 0 ? Math.floor(values[x - 1] * delay) : 0),
            maxEnemies: maxEnemies
        });
    }

    return waves;
}

export default class RandomChallenge implements ChallengeCategory{
    challengeList: typeof presets;

    constructor(){
        this.challengeList = presets;
    }

    challengeExists(challengeid: string): boolean{
        return this.challengeList.has(challengeid);
    }

    getChallengeList(): ChallengePreview[]{
        const challenges: ChallengePreview[] = [];
        this.challengeList.forEach((value, key) => {
            challenges.push({
                challengeid: key,
                displayName: value.config.displayName,
                stages: value.waves.length,
                recommendedLvl: value.config.recommendedLvl
            });
        });
        return challenges;
    }

    getGameMod(challengeid: string): ChallengeGameMod | undefined{
        const data = this.challengeList.get(challengeid);
        if (data === undefined){
            return undefined;
        }

        const challengeMastery = Math.max(0, Math.min(data.options.level, masteryStats.length));

        const completion = data.difficulty.completion;
        const time = data.difficulty.time;
        const waves = data.waves;

        const stageCount = Math.min(completion.length, time.length, waves.length);
        if (stageCount <= 0){
            return {};
        }

        const options = {
            key: "",
            gameMode: 2,
            gameName: data.config.displayName,
            //startingGears: (params.player.startingGears ?? 0) + 3,
            //startingHyper: params.player.startingHyper ?? 0,
            bonusResources: false,
            addBonusEnemies: false,
            //maxAccessories: params.player.maxAccessories ?? 0,
            menuTheme: ""
        };

        const extraPower = 10;
        const enemyStats = getEnemyStats(
            masteryStats[challengeMastery], stageCount,
            data.options.power + extraPower, data.options.accs
        );

        const difficulty = {
            difficultyid: 0,
            name: "",
            countTier: 0,
            strengthTier: data.difficulty.strengthTier,
            healthBonusReq: data.difficulty.healthBonusReq,
            timePerEnemy: data.difficulty.timePerEnemy,
            enemyStats
        };
        difficulty.name = `Difficulty ${difficulty.strengthTier + 1}`;

        const maxScores = {
            completion: 0, time: 0, destination: 0,
            health: 90, gear: 30, enemy: 0
        };

        const stages: Required<ChallengeGameMod>["stages"] = [];
        const levels: Required<ChallengeGameMod>["levels"] = [];

        const levelIndexes: number[] = [];
        const tempDist: number[] = [];
        for (let x = 0; x < locationList.length; x++){
            tempDist.push(locationWeights[x]);
        }
        for (let x = 0; x < stageCount; x++){
            const i = RNG(tempDist);
            if (i >= 0){
                tempDist[i] = 0;
                levelIndexes.push(i);
            } else{
                levelIndexes.push(0);
            }
        }
        levelIndexes.sort((a, b) => a - b);

        for (let x = 0; x < stageCount; x++){
            const levelData = locationList[levelIndexes[x]];

            const tierData = levelTiers[Math.max(0, Math.min(levelTiers.length - 1, waves[x]))];
            const wavesData = generateRandomWaves({
                waves: tierData.waves,
                maxEnemies: tierData.maxEnemies,
                weights: tierData.weights,
                delayFactor: tierData.delayFactor
            });

            stages.push({
                completion: completion[x], time: time[x],
                powerReward: extraPower, gearsReward: 0
            });
            maxScores.completion += completion[x];
            maxScores.time += time[x];

            levels.push({
                levelid: levelData.levelid,
                waves: wavesData,
                background: levelData.name,
                displayName: levelData.displayName,
                stages: [x],
                destination: 0
            });
        }

        return {
            options: options,
            unlocks: {},
            difficulties: [difficulty],
            stages: stages,
            levels: levels,
            maxScores: maxScores
        };
    }

    getRewards(challengeid: string, difficulty: number, win: boolean): ChallengeRewardResult{
        const challenge = this.challengeList.get(challengeid);
        if (challenge === undefined || difficulty < 0){
            return {mastery: 0, coins: 0, badges: 0};
        }

        const mastery = win === true ? challenge.config.baseWinMastery : challenge.config.baseLossMastery;
        const coins = challenge.config.baseCoins;
        const badges = challenge.config.baseBadges;

        return {
            mastery: mastery.length > 0 ? mastery[0] : 0,
            coins: coins.length > 0 ? coins[0] : 0,
            badges: badges.length > 0 ? badges[0] : 0
        };
    }
}
