import {expect} from "chai";
import accessoryList from "../../../frank/data/accessories_data.json";
import characterList from "../../../frank/data/characters_data.json";
import staticChallenges from "../../../frank/data/static_challenges_data";
import randomChallenges from "../../../frank/data/random_challenges_data";
import {getChallengeList, validateUserGameMod, getGameMod, getRewards} from "../../../frank/modules/challenges_module";
import {ChallengeGameMod, UserSetGameMod} from "../../../frank/types";
import {TEST_STATIC_ID, TEST_RANDOM_ID} from "../database_setup";

const resources = {
    mastery: 20000000,
    coins: 0,
    characters: [{name: characterList[0].name, tier: 0x600}],
    accessories: [
        {name: accessoryList[0].name, badges: 0, unlocked: true},
        {name: accessoryList[1].name, badges: 0, unlocked: false},
        {name: accessoryList[2].name, badges: 0, unlocked: true}
    ],
    last_save: 0,
    menu_theme: "retropolis"
};

describe("Challenges module", function(){
    it("Get the list of all challenges", function(){
        const challenges = getChallengeList();
        expect(challenges).to.be.an("array");
        expect(challenges).to.have.lengthOf(staticChallenges.size + randomChallenges.size);

        for (let x = 0; x < challenges.length; x++){
            expect(challenges[x]).to.have.keys(["challengeid", "displayName", "stages", "recommendedLvl"]);
            //expect(staticChallenges.has(challenges[x].challengeid) || randomChallenges.has(challenges[x].challengeid)).to.be.true;

            const staticData = staticChallenges.get(challenges[x].challengeid);
            if (staticData !== undefined){
                expect(challenges[x].displayName).to.equal(staticData.config.displayName);
                expect(challenges[x].recommendedLvl).to.equal(staticData.config.recommendedLvl);
                expect(challenges[x].stages).to.equal(staticData.gameMod.stages !== undefined ? staticData.gameMod.stages.length : 8);
            }

            const randomData = randomChallenges.get(challenges[x].challengeid);
            if (randomData !== undefined){
                expect(challenges[x].displayName).to.equal(randomData.config.displayName);
                expect(challenges[x].recommendedLvl).to.equal(randomData.config.recommendedLvl);
                expect(challenges[x].stages).to.equal(randomData.stages.length);
            }

            expect(staticData !== undefined || randomData !== undefined).to.be.true;
        }
    });

    it("Validate a user's game preferences object", function(){
        expect(validateUserGameMod({})).to.be.true;
        expect(validateUserGameMod({playerSkins: []})).to.be.true;
        expect(validateUserGameMod({playerSkins: ["1", "2", "3"], hiddenBrawlers: ["bull", "darryl"]})).to.be.true;
        expect(validateUserGameMod({playerSkins: ["1", "2", "3"], otherProperty: []} as unknown as UserSetGameMod)).to.be.true;
        expect(validateUserGameMod({playerSkins: "123"} as unknown as UserSetGameMod)).to.be.false;
        expect(validateUserGameMod([] as unknown as UserSetGameMod)).to.be.false;
        expect(validateUserGameMod(null as unknown as UserSetGameMod)).to.be.false;
    });

    it("Create a game modification object for a static challenge", function(){
        const preset = staticChallenges.get(TEST_STATIC_ID)!.gameMod;
        const options = preset.options as Required<ChallengeGameMod>["options"];
        const challenge1 = getGameMod(TEST_STATIC_ID, "key", resources)! as Required<ChallengeGameMod>;

        expect(challenge1).to.be.an("object");
        expect(challenge1).to.include.keys([
            "options", "unlocks", "difficulties", "stages", "levels", "maxScores",
            "playerAccessories", "playerUpgradeTiers", "playerUpgradeValues"
        ]);

        expect(challenge1.options).to.eql({
            key: "key",
            gameMode: options.gameMode,
            gameName: "Test Static Challenge",
            bonusResources: false,
            addBonusEnemies: false,
            menuTheme: "retropolis"
        });
        expect(challenge1.unlocks).to.eql({
            maxAccessories: 30,
            startingPower: 0,
            startingGears: 4,
            startingHyper: 0,
            gearSlots: 0,
            starPowers: -1
        });
        expect(challenge1.difficulties).to.eql(preset.difficulties);
        expect(challenge1.levels).to.eql(preset.levels);
        expect(challenge1.playerUpgradeValues).to.eql(preset.playerUpgradeValues);

        const stages = challenge1.stages;
        expect(stages.map((value) => value.powerReward)).to.eql([15 + 28, 25 + 28, 0]);
        expect(stages.map((value) => value.gearsReward)).to.eql([200 + 300, 200 + 300, 0]);

        expect(challenge1.playerUpgradeTiers).to.be.an("object");
        expect(challenge1.playerUpgradeTiers).to.include.keys([resources.characters[0].name]);
        expect(challenge1.playerUpgradeTiers[resources.characters[0].name]).to.equal(resources.characters[0].tier);

        expect(challenge1.playerAccessories).to.be.an("array");
        expect(challenge1.playerAccessories).to.have.lengthOf(Math.ceil(accessoryList.length / 8));
        expect(challenge1.playerAccessories[0]).to.equal(5);
    });

    it("Create a game modification object for a random challenge", function(){
        const preset = randomChallenges.get("randomtest")!;
        const challenge1 = getGameMod("randomtest", "key", resources)! as Required<ChallengeGameMod>;

        expect(challenge1).to.be.an("object");
        expect(challenge1).to.include.keys([
            "options", "unlocks", "difficulties", "stages", "levels", "maxScores",
            "playerAccessories", "playerUpgradeTiers"
        ]);

        expect(challenge1.options).to.eql({
            key: "key",
            gameMode: 2,
            gameName: "Test Random Challenge",
            bonusResources: false,
            addBonusEnemies: false,
            menuTheme: "retropolis"
        });

        expect(challenge1.unlocks).to.eql({
            maxAccessories: 30,
            startingPower: 0,
            startingGears: 4,
            startingHyper: 0,
            gearSlots: 0,
            starPowers: -1
        });

        const presetDiff = preset.difficulty;
        expect(challenge1.difficulties).to.have.lengthOf(1);
        expect(challenge1.difficulties[0]).to.eql({
            difficultyid: 0,
            name: `Difficulty ${presetDiff.strengthTier + 1}`,
            countTier: 0,
            strengthTier: presetDiff.strengthTier,
            healthBonusReq: presetDiff.healthBonusReq,
            timePerEnemy: presetDiff.timePerEnemy,
            enemyStats: [8, 9, 11, 12, 13, 14, 15, 16, 17, 18]
        });

        const stages = challenge1.stages;
        const totals: Required<ChallengeGameMod>["stages"][number] = {completion: 0, time: 0, powerReward: 0, gearsReward: 0};
        for (let x = 0; x < stages.length; x++){
            for (const k in stages[x]){
                const key = k as keyof typeof totals;
                totals[key] += stages[x][key];
            }
        }
        expect(totals).to.eql({
            completion: challenge1.maxScores.completion, time: challenge1.maxScores.time,
            powerReward: 280, gearsReward: 1200
        });

        expect(challenge1.levels).to.have.lengthOf(preset.stages.length);
        for (let x = 0; x < challenge1.levels.length; x++){
            expect(challenge1.levels[x]).to.have.keys(["levelid", "waves", "background", "displayName", "stages", "destination"]);
            expect(challenge1.levels[x].stages[0]).to.equal(x);
            expect(challenge1.levels[x].destination).to.equal(0);
        }

        expect(challenge1.playerUpgradeTiers).to.be.an("object");
        expect(challenge1.playerUpgradeTiers).to.include.keys([resources.characters[0].name]);
        expect(challenge1.playerUpgradeTiers[resources.characters[0].name]).to.equal(resources.characters[0].tier);

        expect(challenge1.playerAccessories).to.be.an("array");
        expect(challenge1.playerAccessories).to.have.lengthOf(Math.ceil(accessoryList.length / 8));
        expect(challenge1.playerAccessories[0]).to.equal(5);
    });

    it("Get the correct mastery and coins multipliers from a challenge", function(){
        expect(getRewards(TEST_STATIC_ID, 0, true)).to.eql({mastery: 3, coins: 2, badges: 2});
        expect(getRewards(TEST_STATIC_ID, 1, true)).to.eql({mastery: 6, coins: 2, badges: 3});
        expect(getRewards(TEST_STATIC_ID, 2, true)).to.eql({mastery: 6, coins: 2, badges: 3});
        expect(getRewards(TEST_STATIC_ID, -1, true)).to.eql({mastery: 0, coins: 0, badges: 0});
        expect(getRewards(TEST_STATIC_ID, 0, false)).to.eql({mastery: 2, coins: 2, badges: 2});
        expect(getRewards(TEST_STATIC_ID, 1, false)).to.eql({mastery: 4, coins: 2, badges: 3});
        expect(getRewards(TEST_STATIC_ID, 2, false)).to.eql({mastery: 4, coins: 2, badges: 3});
        expect(getRewards(TEST_STATIC_ID, -1, false)).to.eql({mastery: 0, coins: 0, badges: 0});

        expect(getRewards(TEST_RANDOM_ID, 0, true)).to.eql({mastery: 3, coins: 2, badges: 2});
        expect(getRewards(TEST_RANDOM_ID, 1, true)).to.eql({mastery: 3, coins: 2, badges: 2});
        expect(getRewards(TEST_RANDOM_ID, 0, false)).to.eql({mastery: 2, coins: 2, badges: 2});

        expect(getRewards("not a challenge", 0, true)).to.eql({mastery: 0, coins: 0, badges: 0});
    });
});
