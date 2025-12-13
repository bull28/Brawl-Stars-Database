import challengeList from "../data/static_challenges_data";
import {ChallengePreview, ChallengeGameMod, ChallengeRewardResult, ChallengeCategory} from "../types";

export default class StaticChallenge implements ChallengeCategory{
    challengeList: typeof challengeList;

    constructor(){
        this.challengeList = challengeList;
    }

    challengeExists(challengeid: string): boolean{
        return this.challengeList.has(challengeid);
    }

    getChallengeList(): ChallengePreview[]{
        const challenges: ChallengePreview[] = [];
        this.challengeList.forEach((value, key) => {
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

    getGameMod(challengeid: string): ChallengeGameMod | undefined{
        const data = this.challengeList.get(challengeid);
        if (data === undefined){
            return undefined;
        }
        const challenge = data.gameMod;

        const options: ChallengeGameMod["options"] = {
            key: "",
            gameMode: 2,
            gameName: data.config.displayName,
            //startingPower: upgrades.startingPower,
            //startingGears: upgrades.startingGears,
            //startingHyper: 0,
            bonusResources: false,
            addBonusEnemies: false,
            //unlockStarPowers: true,
            //maxAccessories: upgrades.maxAccessories,
            //menuTheme: resources.menu_theme
        };
        const stages: ChallengeGameMod["stages"] = [];
        const srcOptions = challenge.options;
        const srcStages = challenge.stages;

        const gameMod: ChallengeGameMod = {options: options};

        if (srcOptions !== undefined){
            // These are all the options that static challenges are able to set
            const {gameMode, startingPower, startingGears, startingHyper, addBonusEnemies, unlockStarPowers, maxAccessories} = srcOptions;
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
            } if (unlockStarPowers !== undefined){
                options.unlockStarPowers = unlockStarPowers;
            } if (maxAccessories !== undefined){
                options.maxAccessories = maxAccessories;
            }
        }
        if (challenge.difficulties !== undefined){
            gameMod.difficulties = challenge.difficulties;
        }
        if (srcStages !== undefined){
            for (let x = 0; x < srcStages.length; x++){
                stages.push({
                    completion: srcStages[x].completion,
                    time: srcStages[x].time,
                    powerReward: srcStages[x].powerReward,// + powerRewards[x],
                    gearsReward: srcStages[x].gearsReward// + gearsRewards[x] * 100
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
        if (challenge.playerUpgradeValues !== undefined){
            gameMod.playerUpgradeValues = challenge.playerUpgradeValues;
        }

        // playerAccessories, playerUpgradeTiers, and playerSkins are set by the challenges module

        return gameMod;
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
            mastery: mastery.length > 0 ? mastery[Math.min(mastery.length - 1, difficulty)] : 0,
            coins: coins.length > 0 ? coins[Math.min(coins.length - 1, difficulty)] : 0,
            badges: badges.length > 0 ? badges[Math.min(badges.length - 1, difficulty)] : 0
        };
    }
}
