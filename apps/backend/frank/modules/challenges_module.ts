import accessoryList from "../data/accessories_data.json";
import {getMasteryLevel, characterMasteryReq} from "../modules/resources_module";
import {UserResources, PlayerUpgrades, ChallengePreview, ChallengeGameMod, UserSetGameMod, ChallengeRewardResult, ChallengeCategory} from "../types";
import StaticChallenge from "./static_challenges_module";
import RandomChallenge from "./random_challenges_module";

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
    maxAccessories: [[0, 0], [6, 6], [10, 12], [14, 18], [22, 24], [30, 30]]
};

const handlers: ChallengeCategory[] = [
    new StaticChallenge(), new RandomChallenge()
];
const challengeidMap = new Map<string, number>();
for (let x = 0; x < handlers.length; x++){
    initHandler(handlers[x], x);
}

function initHandler(handler: ChallengeCategory, index: number): void{
    const challengeList = handler.getChallengeList();
    for (let x = 0; x < challengeList.length; x++){
        challengeidMap.set(challengeList[x].challengeid, index);
    }
}

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

export function challengeExists(challengeid: string): boolean{
    return challengeidMap.has(challengeid);
}

export function getChallengeList(): ChallengePreview[]{
    let challenges: ChallengePreview[] = [];
    for (let x = 0; x < handlers.length; x++){
        challenges = challenges.concat(handlers[x].getChallengeList());
    }
    return challenges;
}

export function getGameMod(challengeid: string, key: string, resources: UserResources, prefs?: UserSetGameMod): ChallengeGameMod | undefined{
    const i = challengeidMap.get(challengeid);
    if (i === undefined || i >= handlers.length){
        return undefined;
    }

    // The corresponding challenge handler will provide the starting object for the challenge. Then, change any values
    // that depend on the player's upgrades before sending the response.
    const gameMod = handlers[i].getGameMod(challengeid);
    if (gameMod === undefined){
        return undefined;
    }

    const options = gameMod.options;
    const stages = gameMod.stages;

    const masteryLevel = getMasteryLevel(resources.mastery).level;
    const upgrades = getPlayerUpgrades(masteryLevel);

    if (options !== undefined){
        const {startingPower, startingGears, startingHyper, maxAccessories} = options;
        if (startingPower === undefined){
            options.startingPower = upgrades.startingPower;
        } if (startingGears === undefined){
            options.startingGears = upgrades.startingGears;
        } if (startingHyper === undefined){
            options.startingHyper = 0;
        } if (maxAccessories === undefined){
            options.maxAccessories = upgrades.maxAccessories;
        }

        options.key = key;
        options.classicUnlocks = false;
        options.menuTheme = resources.menu_theme;
    }
    if (stages !== undefined){
        const powerRewards = stageResourceRewards(stages.length, upgrades.powerPerStage, upgrades.maxExtraPower);
        const gearsRewards = stageResourceRewards(stages.length, upgrades.gearsPerStage, upgrades.maxExtraGears);
        for (let x = 0; x < stages.length; x++){
            stages[x].powerReward += powerRewards[x];
            stages[x].gearsReward += gearsRewards[x] * 100;
        }
    }

    const playerAccessories: number[] = [];
    const len = Math.ceil(accessoryList.length / 8);
    for (let x = 0; x < len; x++){
        playerAccessories.push(0);
    }
    for (let x = 0; x < resources.accessories.length; x++){
        if (resources.accessories[x].unlocked === true){
            playerAccessories[x >> 3] |= (1 << (x & 7));
        }
    }
    gameMod.playerAccessories = playerAccessories;

    const playerUpgradeTiers: Record<string, number> = {};
    for (let x = 0; x < resources.characters.length; x++){
        const name = resources.characters[x].name;
        if (masteryLevel >= characterMasteryReq(name)){
            playerUpgradeTiers[name] = resources.characters[x].tier;
        } else{
            playerUpgradeTiers[name] = -1;
        }
    }
    gameMod.playerUpgradeTiers = playerUpgradeTiers;

    if (prefs !== undefined && prefs.playerSkins !== undefined){
        gameMod.playerSkins = prefs.playerSkins;
    }

    return gameMod;
}

export function getRewards(challengeid: string, difficulty: number, win: boolean): ChallengeRewardResult{
    const i = challengeidMap.get(challengeid);
    if (i === undefined || i >= handlers.length){
        return {mastery: 0, coins: 0, badges: 0};
    }

    return handlers[i].getRewards(challengeid, difficulty, win);
}
