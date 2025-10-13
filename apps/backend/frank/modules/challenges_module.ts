import challengeList from "../data/challenges_data";
import {getMasteryLevel} from "../modules/resources_module";
import {UserResources, PlayerUpgrades, ChallengePreview, ChallengeGameMod, UserSetGameMod} from "../types";

const challengeUpgrades: {[k in keyof PlayerUpgrades]: [number, number][]} = {
    startingPower: [[0, 0]],
    startingGears: [[0, 3], [2, 4]],
    powerPerStage: [
        [ 0,  0],
        [ 1,  1], [ 3,  2], [ 5,  3],
        [ 7,  4], [ 9,  5], [11,  6],
        [13,  7], [15,  9], [17, 11],
        [19, 13], [21, 15], [23, 18],
        [25, 21], [27, 24], [29, 28],
        //[31, 30], [33, 32], [35, 35]
    ],
    gearsPerStage: [[0, 0], [4, 1], [16, 2], [24, 3], [28, 4]],
    maxExtraPower: [
        [ 0,   0],
        [ 1,   3], [ 3,   6], [ 5,   9],
        [ 7,  12], [ 9,  18], [11,  24],
        [13,  30], [15,  42], [17,  60],
        [19,  78], [21,  90], [23, 108],
        [25, 126], [27, 150], [29, 180],
        //[31, 196], [33, 216], [35, 240]
    ],
    maxExtraGears: [[0, 0], [4, 1], [12, 2], [16, 4], [24, 6], [26, 9], [28, 12]],
    maxAccessories: [[0, 0], [6, 10], [14, 15], [22, 20], [30, 25]]
};

function getPlayerUpgrades(masteryLevel: number): PlayerUpgrades{
    const upgrades: PlayerUpgrades = {
        startingPower: 0, startingGears: 0, powerPerStage: 0, gearsPerStage: 0,
        maxExtraPower: 0, maxExtraGears: 0, maxAccessories: 0
    };

    for (const x in challengeUpgrades){
        const stat = challengeUpgrades[x as keyof PlayerUpgrades];
        let i = 0;
        let found = false;
        while (i < stat.length && found === false){
            // Find the first element in this stat's upgrade values where the user's mastery level is less than the next
            // element's required mastery level (index 0 in the upgrade value is the required mastery level).
            if (i >= stat.length - 1 || (i < stat.length - 1 && masteryLevel < stat[i + 1][0])){
                upgrades[x as keyof PlayerUpgrades] = stat[i][1];
                found = true;
            }
            i++;
        }
    }

    return upgrades;
}

function stageResourceRewards(stages: number, rewardPerStage: number, maxExtraReward: number): number[]{
    // Distributes maxExtraReward across stages, while ensuring at most rewardPerStage is given per stage
    stages = Math.floor(stages);
    if (stages <= 0){
        return [];
    } if (stages === 1){
        return [0];
    }

    // Get power points or gears rewards for all stages using the player's upgrades
    const rewards: number[] = [];
    const remainder = maxExtraReward % (stages - 1);
    for (let x = 0; x < stages - 1; x++){
        let r = Math.floor(maxExtraReward / (stages - 1));
        if (x + remainder >= stages - 1){
            // This adds the remaining rewards to the last few stages instead of the first few stages
            r++;
        }
        rewards.push(Math.min(r, rewardPerStage));
    }
    // The last stage always has no reward
    rewards.push(0);
    return rewards;
}

export function challengeExists(challengeid: string): boolean{
    return challengeList.has(challengeid);
}

export function getChallengeList(): ChallengePreview[]{
    const challenges: ChallengePreview[] = [];
    challengeList.forEach((value, key) => {
        let stages = 8;
        if (value.gameMod.stages !== undefined){
            stages = value.gameMod.stages.length;
        }

        challenges.push({
            challengeid: key,
            displayName: value.config.displayName,
            stages: stages,
            recommendedLvl: value.config.recommendedLvl
        });
    });
    return challenges;
}

export function validateUserGameMod(prefs: UserSetGameMod): boolean{
    if (typeof prefs !== "object" || prefs === null || Array.isArray(prefs) === true){
        return false;
    }

    let valid = true;

    // If the skins are provided, they must be an array of strings
    const playerSkins = prefs.playerSkins;
    if (playerSkins !== undefined){
        if (Array.isArray(playerSkins) === true){
            for (let x = 0; x < playerSkins.length; x++){
                if (typeof playerSkins[x] !== "string"){
                    valid = false;
                }
            }
        } else{
            return false;
        }
    }

    // If the hidden brawlers are provided, they must be an array of strings
    const hiddenBrawlers = prefs.hiddenBrawlers;
    if (hiddenBrawlers !== undefined){
        if (Array.isArray(hiddenBrawlers) === true){
            for (let x = 0; x < hiddenBrawlers.length; x++){
                if (typeof hiddenBrawlers[x] !== "string"){
                    valid = false;
                }
            }
        } else{
            return false;
        }
    }

    return valid;
}

export function getStaticGameMod(challengeid: string, key: string, resources: UserResources, prefs?: UserSetGameMod): ChallengeGameMod | undefined{
    // Options, difficulties, stages, levels, max scores, and player upgrade values are copied from the challenge data
    // Player accessories, player upgrade tiers, and player upgrade values are added in later
    // The user can optionally specify cosmetic preferences (menu theme, model skins) to include
    const data = challengeList.get(challengeid);
    if (data === undefined){
        return undefined;
    }
    const challenge = data.gameMod;

    const upgrades = getPlayerUpgrades(getMasteryLevel(resources.mastery).level);

    const options: ChallengeGameMod["options"] = {
        key: key,
        gameMode: 2,
        gameName: data.config.displayName,
        startingPower: upgrades.startingPower,
        startingGears: upgrades.startingGears,
        startingHyper: 0,
        bonusResources: false,
        addBonusEnemies: false,
        maxAccessories: upgrades.maxAccessories,
        menuTheme: resources.menu_theme
    };
    const stages: ChallengeGameMod["stages"] = [];
    const srcOptions = challenge.options;
    const srcStages = challenge.stages;

    const gameMod: ChallengeGameMod = {options: options};

    if (srcOptions !== undefined){
        // These are all the options that static challenges are able to set
        const {gameMode, startingPower, startingGears, startingHyper, addBonusEnemies, maxAccessories} = srcOptions;
        if (gameMode !== undefined){
            options.gameMode = gameMode;
        } if (startingPower !== undefined){
            options.startingPower = startingPower;
        } if (startingGears !== undefined){
            options.startingGears = startingGears;
        } if (startingHyper !== undefined){
            options.startingHyper = startingHyper;
        } if (addBonusEnemies !== undefined){
            options.addBonusEnemies = addBonusEnemies;
        } if (maxAccessories !== undefined){
            options.maxAccessories = maxAccessories;
        }
    }
    if (challenge.difficulties !== undefined){
        gameMod.difficulties = challenge.difficulties;
    }
    if (srcStages !== undefined){
        // Stages need to be modified with the extra power points / gears from player upgrades
        const powerRewards = stageResourceRewards(srcStages.length, upgrades.powerPerStage, upgrades.maxExtraPower);
        const gearsRewards = stageResourceRewards(srcStages.length, upgrades.gearsPerStage, upgrades.maxExtraGears);
        for (let x = 0; x < srcStages.length; x++){
            stages.push({
                completion: srcStages[x].completion,
                time: srcStages[x].time,
                powerReward: srcStages[x].powerReward + powerRewards[x],
                gearsReward: srcStages[x].gearsReward + gearsRewards[x]
            });
        }
        gameMod.stages = stages;
    }
    if (challenge.levels !== undefined){
        gameMod.levels = challenge.levels;
    }
    if (challenge.maxScores !== undefined){
        gameMod.maxScores = challenge.maxScores;
    }

    const playerAccessories: string[] = [];
    for (let x = 0; x < resources.accessories.length; x++){
        if (resources.accessories[x].unlocked === true){
            playerAccessories.push(resources.accessories[x].name);
        }
    }
    gameMod.playerAccessories = playerAccessories;

    const playerUpgradeTiers: Record<string, number> = {};
    for (let x = 0; x < resources.characters.length; x++){
        playerUpgradeTiers[resources.characters[x].name] = resources.characters[x].tier;
    }
    gameMod.playerUpgradeTiers = playerUpgradeTiers;

    if (challenge.playerUpgradeValues !== undefined){
        gameMod.playerUpgradeValues = challenge.playerUpgradeValues;
    }

    if (prefs !== undefined && prefs.playerSkins !== undefined){
        gameMod.playerSkins = prefs.playerSkins;
    }

    return gameMod;
}
