import {expect} from "chai";
import accessoryList from "../../../frank/data/accessories_data.json";
import characterList from "../../../frank/data/characters_data.json";
import challengeList from "../../../frank/data/challenges_data";
import {getChallengeList, validateUserGameMod, getStaticGameMod} from "../../../frank/modules/challenges_module";
import {UserSetGameMod} from "../../../frank/types";

describe("Challenges module", function(){
    it("Get the list of all challenges", function(){
        const challenges = getChallengeList();
        expect(challenges).to.be.an("array");
        expect(challenges).to.have.lengthOf(challengeList.size);

        for (let x = 0; x < challenges.length; x++){
            expect(challenges[x]).to.have.keys(["challengeid", "displayName", "stages", "recommendedLvl"]);
            expect(challengeList.has(challenges[x].challengeid)).to.be.true;

            const data = challengeList.get(challenges[x].challengeid)!;
            expect(challenges[x].displayName).to.equal(data.config.displayName);
            expect(challenges[x].recommendedLvl).to.equal(data.config.recommendedLvl);
            expect(challenges[x].stages).to.equal(data.gameMod.stages !== undefined ? data.gameMod.stages.length : 8);
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
        const resources = {
            mastery: 20000000,
            coins: 0,
            characters: [{name: characterList[0].name, tier: 0x600}],
            accessories: [{name: accessoryList[0].name, badges: 0, unlocked: true}],
            last_save: 0,
            menu_theme: "retropolis"
        };
        const preset = challengeList.get("test")!.gameMod;
        const options = preset.options! as Required<typeof options>;
        const challenge1 = getStaticGameMod("test", "key", resources)!;

        expect(challenge1).to.be.an("object");
        expect(challenge1).to.include.keys([
            "options", "difficulties", "stages", "levels",
            "playerAccessories", "playerUpgradeTiers", "playerUpgradeValues"
        ]);

        expect(challenge1.options).to.eql({
            key: "key",
            gameMode: options.gameMode,
            gameName: "Test Challenge",
            startingPower: 0,
            startingGears: 4,
            bonusResources: false,
            addBonusEnemies: false,
            maxAccessories: 5,
            menuTheme: "retropolis"
        });
        expect(challenge1.difficulties).to.eql(preset.difficulties);
        expect(challenge1.levels).to.eql(preset.levels);
        expect(challenge1.playerUpgradeValues).to.eql(preset.playerUpgradeValues);

        const stages = challenge1.stages!;
        expect(stages.map((value) => value.powerReward)).to.eql([15 + 28, 25 + 28, 0]);
        expect(stages.map((value) => value.gearsReward)).to.eql([2 + 3, 2 + 3, 0]);

        expect(challenge1.playerUpgradeTiers).to.be.an("object");
        expect(challenge1.playerUpgradeTiers).to.include.keys([resources.characters[0].name]);
        expect(challenge1.playerUpgradeTiers![resources.characters[0].name]).to.equal(resources.characters[0].tier);

        expect(challenge1.playerAccessories).to.be.an("array");
        expect(challenge1.playerAccessories![0]).to.equal(accessoryList[0].name);
    });
});
