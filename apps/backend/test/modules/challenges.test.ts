import {expect} from "chai";
import accessoryList from "../../bull/data/accessories_data.json";
import staticChallenges from "../../bull/data/challenges_data.json";
import {getChallengeUpgrades, createChallengeData, getChallengeStrength, getStaticGameMod, getKeyGameMod} from "../../bull/modules/challenges";
import {UserWaves, ChallengeData} from "../../bull/types";

describe("Challenges module", function(){
    it("Calculate the correct challenge upgrades for a given mastery level", function(){
        const offenseMinLevel = {
            startingPower: 0, startingGears: 3, powerPerStage: 0, gearsPerStage: 0,
            maxExtraPower: 0, maxExtraGears: 0, maxAccessories: 0,
            health: 100, damage: 100, healing: 100, speed: 0, ability: 1, lifeSteal: 0
        };
        const defenseMinLevel = {
            difficulty: 0, maxEnemies: [12], enemyStats: [100],
            waves: [[12]]
        };
        const offenseMaxLevel = {
            startingPower: 0, startingGears: 4, powerPerStage: 56, gearsPerStage: 4,
            maxExtraPower: 180, maxExtraGears: 12, maxAccessories: 5,
            health: 100, damage: 100, healing: 100, speed: 0, ability: 1, lifeSteal: 0
        };
        const defenseMaxLevel = {
            difficulty: 3, maxEnemies: [40, 48, 64, 88], enemyStats: [125.0, 200.0, 250.0, 300.0],
            waves: [[24, 36], [30, 42], [24, 30, 42], [30, 42, 60]]
        };

        const upgrades0 = getChallengeUpgrades(0);
        expect(upgrades0).to.be.an("object");
        expect(upgrades0).to.have.keys(["offense", "defense", "enemies"]);
        expect(upgrades0.enemies).to.be.an("array");

        expect(upgrades0.offense).to.eql(offenseMinLevel);
        expect(upgrades0.defense).to.eql(defenseMinLevel);

        const upgrades30 = getChallengeUpgrades(30);
        expect(upgrades30.offense).to.eql(offenseMaxLevel);
        expect(upgrades30.defense).to.eql(defenseMaxLevel);
    });

    it("Calculate the strength of a challenge", function(){
        const challenge: ChallengeData = {owner: "", difficulty: 0, levels: 1, stats: [100, 150, 200, 250], waves: []};

        expect(getChallengeStrength(challenge)).to.equal(0);

        // Different enemy weights
        challenge.waves = [{level: 0, enemies: ["colt", "colt", "bea"]}];
        expect(getChallengeStrength(challenge)).to.equal(252);

        // Different enemy strengths
        challenge.waves = [
            {level: 0, enemies: ["eve"]}, {level: 1, enemies: ["eve"]},
            {level: 2, enemies: ["eve"]}, {level: 3, enemies: ["eve"]}
        ];
        expect(getChallengeStrength(challenge)).to.equal(1200);

        // Changed difficulty
        challenge.difficulty = 3;
        expect(getChallengeStrength(challenge)).to.equal(1650);

        // Some levels empty
        challenge.difficulty = 1;
        challenge.waves = [
            {level: 0, enemies: ["ash"]}, {level: 3, enemies: ["ash"]}
        ];
        expect(getChallengeStrength(challenge)).to.equal(2025);

        // Multiple waves in one level
        challenge.difficulty = 2;
        challenge.waves = [
            {level: 0, enemies: ["mortis"]}, {level: 0, enemies: ["mortis"]}, {level: 0, enemies: ["mortis"]},
            {level: 0, enemies: ["mortis"]}, {level: 0, enemies: ["mortis"]}, {level: 0, enemies: ["mortis"]},
            {level: 1, enemies: ["bonnie"]}, {level: 1, enemies: ["bonnie"]}, {level: 1, enemies: ["bonnie"]},
            {level: 2, enemies: ["amber"]}, {level: 2, enemies: ["amber"]},
            {level: 3, enemies: ["amber"]}, {level: 3, enemies: ["amber"]}
        ];
        expect(getChallengeStrength(challenge)).to.equal(6750);
    });

    it("Create a game modification object for a static challenge", function(){
        const challenge1 = getStaticGameMod("expert", 30, [accessoryList[0].name])!;

        expect(challenge1).to.be.an("object");
        expect(challenge1).to.include.keys([
            "options", "difficulties", "stages", "levels",
            "playerAccessories", "playerUpgradeValues"
        ]);

        expect(challenge1.options).to.eql({startingGears: 4, bonusResources: false, maxAccessories: 5});
        expect(challenge1.difficulties).to.eql(staticChallenges.expertLevels.difficulties);
        expect(challenge1.levels).to.eql(staticChallenges.expertLevels.levels);
        expect(challenge1.playerUpgradeValues).to.eql(staticChallenges.expertLevels.playerUpgradeValues);

        const stages = challenge1.stages!;
        expect(stages.map((value) => value.powerReward)).to.eql([40, 50, 61, 71, 86, 106, 126, 0]);
        expect(stages.map((value) => value.gearsReward)).to.eql([2, 2, 3, 3, 3, 3, 3, 0]);

        expect(challenge1.playerAccessories).to.be.an("array");
        expect(challenge1.playerAccessories![0]).to.equal(accessoryList[0].name);
    });

    it("Create a game modification object for the given challenge data", function(){
        const challengeData: ChallengeData = {
            owner: "BULL", difficulty: 2, levels: 4, stats: [100, 150, 200, 250],
            waves: [
                {level: 0, enemies: ["colette"]}, {level: 1, enemies: ["pearl"]},
                {level: 2, enemies: ["max"]}, {level: 3, enemies: ["meg"]},
            ]
        };

        const challenge1 = getKeyGameMod("test", 30, [accessoryList[0].name], challengeData)!;

        expect(challenge1).to.be.an("object");
        expect(challenge1).to.include.keys([
            "options", "difficulties", "stages", "levels",
            "maxScores", "playerAccessories", "playerUpgradeValues"
        ]);

        expect(challenge1.options).to.eql({
            key: "test", gameMode: 2, strength: 4173, gameName: "BULL's Challenge",
            startingPower: 0, startingGears: 4, bonusResources: false,
            addBonusEnemies: false, maxAccessories: 5,maxReportLevels: 8
        });

        expect(challenge1.difficulties).to.be.an("array");
        expect(challenge1.difficulties![0]).to.eql({
            difficultyid: 2,
            name: "BULL's Challenge",
            countTier: 0,
            strengthTier: 2,
            healthBonusReq: 0.6,
            timePerEnemy: 2/3,
            enemyStats: [100, 150, 200, 250]
        });

        const stages = challenge1.stages!;
        expect(stages.reduce((previous, current) => previous + current.completion, 0)).to.equal(300);
        expect(stages.reduce((previous, current) => previous + current.time, 0)).to.equal(180);
        expect(stages.reduce((previous, current) => previous + current.powerReward, 0)).to.equal(168);
        expect(stages.reduce((previous, current) => previous + current.gearsReward, 0)).to.equal(12);

        expect(challenge1.levels).to.be.an("array");
        expect(challenge1.levels).to.have.lengthOf(challengeData.waves.length);

        expect(challenge1.maxScores).to.eql({
            completion: 300, time: 180, destination: 0,
            health: 90, gear: 30, enemy: 0
        });

        expect(challenge1.playerAccessories).to.be.an("array");
        expect(challenge1.playerAccessories![0]).to.equal(accessoryList[0].name);

        expect(challenge1.playerUpgradeValues).to.eql({
            health: {value: [100, 0.08]}, damage: {value: [100, 0.08]},
            healing: {value: [100, 0.02]}, speed: {value: [0, 1]},
            ability: {value: [1, -10]}, lifeSteal: {value: [0, 0.02]}
        });
    });

    describe("Creating challenge data objects", function(){
        it("Valid challenge", function(){
            const result = createChallengeData(30, []);

            expect(result).to.be.an("object");
            expect(result).to.have.keys(["message", "data"]);
            expect(result.data).to.be.an("object");
            const data = result.data!;
            expect(data).to.have.keys(["owner", "difficulty", "levels", "stats", "waves"]);
            expect(data.owner).to.equal("");
            expect(data.difficulty).to.equal(3);
            expect(data.levels).to.equal(4);
            expect(data.stats).to.eql([125, 200, 250, 300]);
            expect(data.waves).to.be.empty;
        });

        // Possible reasons for an invalid challenge
        it("Invalid wave objects", function(){
            const invalid1 = createChallengeData(30, [{"B": "U", "L": "L"} as unknown as UserWaves[number]]);
            expect(invalid1.message).to.equal("Challenge waves incorrectly formatted.");
            expect(invalid1.data).to.be.undefined;
        });

        it("Too many waves in a stage", function(){
            expect(createChallengeData(30, [
                {level: 0, enemies: []}, {level: 0, enemies: []}, {level: 0, enemies: []}, {level: 0, enemies: []}
            ]).message).to.equal("Too many waves are included in stage 1.");
        });

        it("Too many enemies in a stage", function(){
            expect(createChallengeData(30, [
                {level: 0, enemies: ["max"]}, {level: 0, enemies: ["meg"]}
            ]).message).to.equal("Too many enemies included in stage 1.");
        });

        it("Too many enemies in a wave", function(){
            expect(createChallengeData(30, [
                {level: 0, enemies: ["meg"]}
            ]).message).to.equal("Too many enemies included in stage 1, wave 1.");
        });

        it("Too many of one type of enemy in the challenge", function(){
            expect(createChallengeData(30, [
                {level: 1, enemies: []}, {level: 1, enemies: ["meg"]},
                {level: 2, enemies: []}, {level: 2, enemies: []}, {level: 2, enemies: ["meg"]},
                {level: 3, enemies: []}, {level: 3, enemies: []}, {level: 3, enemies: ["meg"]}
            ]).message).to.equal("Too many Meg enemies in the challenge. There can be at most 2.");
        });

        it("Too many of one type of enemy in a stage", function(){
            expect(createChallengeData(30, [
                {level: 3, enemies: []}, {level: 3, enemies: ["meg"]}, {level: 3, enemies: ["meg"]}
            ]).message).to.equal("Too many Meg enemies in stage 4. There can be at most 1 per stage.");
        });

        it("Invalid enemy name", function(){
            expect(createChallengeData(30, [
                {level: 0, enemies: ["B U L L"]}
            ]).message).to.equal("B U L L is not a valid enemy.");
        });

        it("Mastery level too low to use an enemy", function(){
            expect(createChallengeData(0, [
                {level: 0, enemies: ["meg"]}
            ]).message).to.equal("Mastery level must be at least 24 to use Meg.");
        });
    });
});
