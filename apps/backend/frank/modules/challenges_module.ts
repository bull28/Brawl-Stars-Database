import accessoryList from "../data/accessories_data.json";
import {getMasteryLevel, characterMasteryReq} from "../modules/resources_module";
import {UserResources, PlayerUpgrades, ChallengePreview, ChallengeGameMod, UserSetGameMod, ChallengeRewardResult, ChallengeCategory} from "../types";
import StaticChallenge from "./static_challenges_module";
import RandomChallenge from "./random_challenges_module";

const challengeUpgrades: {[k in keyof PlayerUpgrades]: [number, number][]} = {
    startingPower: [[0, 0]],
    startingGears: [[0, 3], [2, 4]],
    powerPerStage: [
        [ 0,  0], [ 1,  1], [ 3,  1],
        [ 5,  2], [ 7,  3], [ 9,  4],
        [11,  5], [13,  6], [15,  7],
        [17,  8], [19,  9], [21, 11],
        [23, 13], [25, 15], [27, 17],
        [29, 19], [31, 22], [33, 25],
        [35, 28], [37, 31], [39, 35]
    ],
    gearsPerStage: [[0, 0], [10, 1], [20, 2], [28, 3], [38, 4]],
    maxExtraPower: [
        [ 0,   0], [ 1,   2], [ 3,   4],
        [ 5,   6], [ 7,   9], [ 9,  12],
        [11,  18], [13,  24], [15,  30],
        [17,  36], [19,  45], [21,  60],
        [23,  75], [25,  90], [27, 105],
        [29, 120], [31, 140], [33, 160],
        [35, 180], [37, 210], [39, 240]
    ],
    maxExtraGears: [
        [ 0,  0], [10,  2], [16,  4], [20,  6], [24,  8],
        [28, 10], [32, 12], [36, 14]
    ],
    maxAccessories: [
        [ 0,  0], [ 6,  6], [ 8,  9], [14, 12], [18, 15],
        [22, 18], [26, 22], [30, 26], [34, 30], [40, 32]
    ]
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
    const unlocks = gameMod.unlocks;
    const stages = gameMod.stages;

    const masteryLevel = getMasteryLevel(resources.mastery).level;
    const upgrades = getPlayerUpgrades(masteryLevel);

    if (options !== undefined){
        options.key = key;
        options.menuTheme = resources.menu_theme;
    }
    if (unlocks !== undefined){
        const {maxAccessories, startingPower, startingGears, startingHyper, gearSlots, starPowers} = unlocks;
        // If these values are set by the challenge, use them. Otherwise, use the player's upgrades.
        if (startingPower === undefined){
            unlocks.startingPower = upgrades.startingPower;
        } if (startingGears === undefined){
            unlocks.startingGears = upgrades.startingGears;
        } if (startingHyper === undefined){
            unlocks.startingHyper = 0;
        } if (maxAccessories === undefined){
            unlocks.maxAccessories = upgrades.maxAccessories;
        }

        // By default, gear slots and star power selection are not modified in static challenges.
        if (gearSlots === undefined){
            unlocks.gearSlots = 0;
        } if (starPowers === undefined){
            unlocks.starPowers = -1;
        }
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
