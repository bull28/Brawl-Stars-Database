import {expect} from "chai";
import characterList from "../../../frank/data/characters_data.json";
import {IMAGE_FILE_EXTENSION, SKIN_IMAGE_DIR, PIN_IMAGE_DIR, MASTERY_LEVEL_DIR, TIER_IMAGE_DIR, CHARACTER_IMAGE_DIR} from "../../../frank/data/constants";
import {getEnemyList, getNextTier, getMasteryLevel, characterMasteryReq, getCharacterPreview, getCharacterData} from "../../../frank/modules/resources_module";
import {CharacterHyperStats, CharacterStatus} from "../../../frank/types";

describe("User Resources module", function(){
    it("Get the list of all enemies", function(){
        const enemies = getEnemyList();

        expect(enemies).to.be.an("array");

        for (let x = 0; x < enemies.length; x++){
            expect(enemies[x]).to.have.keys([
                "name", "displayName", "image", "fullImage", "enemyClass", "description",
                "strengthTier", "value", "health", "speed", "attacks", "enemies"
            ]);
            const validImage =
                (enemies[x].image.startsWith(PIN_IMAGE_DIR) || enemies[x].image === "") &&
                (enemies[x].fullImage.startsWith(SKIN_IMAGE_DIR) || enemies[x].fullImage === "");
            expect(validImage).to.be.true;
        }
    });

    it("Determine the next tier after upgrading a character", function(){
        expect(getNextTier(0x000)).to.equal(0x001);
        expect(getNextTier(-1000)).to.equal(0x001);
        expect(getNextTier(0x009)).to.equal(0x00a);
        expect(getNextTier(0x00a)).to.equal(0x100);
        expect(getNextTier(0x30a)).to.equal(0x30b);
        expect(getNextTier(0x30f)).to.equal(0x400);
        expect(getNextTier(0x50f)).to.equal(0x510);
        expect(getNextTier(0x514)).to.equal(0x600);
        expect(getNextTier(0x614)).to.equal(0x700);
        expect(getNextTier(0x700)).to.equal(0x700);
    });

    it("Get the required mastery level to use a character", function(){
        for (let x = 0; x < characterList.length; x++){
            expect(characterMasteryReq(characterList[x].name)).to.equal(characterList[x].masteryReq);
        }
        expect(characterMasteryReq("not a character")).to.equal(0);
    });

    it("Get the preview data for a character", function(){
        let index = 0;
        const i = characterList.findIndex((value) => value.name === "darryl");
        if (i > 0){
            index = i;
        }

        const character = characterList[index];

        const preview = getCharacterPreview({name: character.name, tier: 0x100})!;
        expect(preview).to.be.an("object");
        expect(preview).to.have.keys(["name", "displayName", "image", "masteryReq", "tier"]);
        expect(preview.tier).to.be.an("object");
        expect(preview.tier).to.have.keys(["level", "name", "image", "color"]);

        expect(preview.name).to.equal(character.name);
        expect(preview.displayName).to.equal(character.displayName);
        expect(preview.image).to.equal(CHARACTER_IMAGE_DIR + character.image + IMAGE_FILE_EXTENSION);
        expect(preview.tier.level).to.equal(10);
        expect(preview.tier.name).to.equal("Silver");
        expect(preview.tier.image).to.equal(TIER_IMAGE_DIR + "tier_silver" + IMAGE_FILE_EXTENSION);
    });

    describe("Calculate the correct level from a mastery points value", function(){
        it("Lowest mastery level", function(){
            const mastery0 = getMasteryLevel(0);
            expect(mastery0).to.be.an("object");
            expect(mastery0).to.have.keys(["level", "points", "current", "next"]);
            expect(mastery0.current).to.have.keys(["points", "image", "color"]);
            expect(mastery0.next).to.have.keys(["points", "image", "color"]);
            expect(mastery0.current.image).to.equal(MASTERY_LEVEL_DIR + "mastery_empty" + IMAGE_FILE_EXTENSION);
            expect(mastery0.next.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);
        });

        it("Highest mastery level", function(){
            const mastery30 = getMasteryLevel(1.0e9);
            expect(mastery30.level).to.equal(60);
            expect(mastery30.current.points).to.equal(1.0e9);
            expect(mastery30.next.points).to.equal(-1);
            expect(mastery30.next.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_8" + IMAGE_FILE_EXTENSION);
            expect(mastery30.next.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_8" + IMAGE_FILE_EXTENSION);
        });

        it("Next level has same image", function(){
            const mastery1 = getMasteryLevel(2000);
            expect(mastery1.level).to.equal(1);
            expect(mastery1.current.points).to.equal(2000);
            expect(mastery1.next.points).to.equal(6000);
            expect(mastery1.current.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);
            expect(mastery1.next.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);
        });

        it("Next level has different image", function(){
            const mastery29 = getMasteryLevel(19999999);
            expect(mastery29.level).to.equal(29);
            expect(mastery29.current.points).to.equal(16000000);
            expect(mastery29.next.points).to.equal(20000000);
            expect(mastery29.current.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_6" + IMAGE_FILE_EXTENSION);
            expect(mastery29.next.image).to.equal(MASTERY_LEVEL_DIR + "mastery_level_7" + IMAGE_FILE_EXTENSION);
        });

        it("Negative mastery points", function(){
            const mastery0 = getMasteryLevel(0);
            const masteryBelow0 = getMasteryLevel(-1);
            // Negative mastery points should give the same result as 0
            expect(mastery0).to.eql(masteryBelow0);
        });
    });

    describe("Get the full data for a character", function(){
        function checkStats(input: CharacterStatus["current"]["stats"], expected: CharacterStatus["current"]["stats"], multiplier: number): boolean{
            let valid = true;
            for (const x in input){
                if (x !== "reload" && input[x] !== expected[x] * multiplier / 100){
                    valid = false;
                }
            }
            return valid;
        }

        function hcStatsDiff(stats1: CharacterHyperStats, stats2: CharacterHyperStats): Partial<CharacterHyperStats>{
            // Returns stats2 - stats1
            const diff: Partial<CharacterHyperStats> = {};
            for (const x in stats2){
                if (Object.hasOwn(stats1, x) && stats1[x] !== stats2[x]){
                    diff[x] = stats2[x] - stats1[x];
                }
            }
            return diff;
        }

        let index = 0;
        const i = characterList.findIndex((value) => value.name === "darryl");
        if (i > 0){
            index = i;
        }

        const character = characterList[index];
        const name = character.name;

        it("Lowest upgrade tier", function(){
            const tier0 = getCharacterData({name: name, tier: 0x000})!;
            expect(tier0).to.be.an("object");
            expect(tier0).to.have.keys(["name", "displayName", "image", "masteryReq", "current", "next", "upgrade", "otherStats"]);
            expect(tier0.current).to.be.an("object");
            expect(tier0.next).to.be.an("object");
            expect(tier0.upgrade).to.be.an("object");
            expect(tier0.current).to.have.keys(["tier", "stats", "unlocks", "hcStats"]);
            expect(tier0.next).to.have.keys(["tier", "stats", "unlocks", "hcStats"]);
            expect(tier0.current.tier).to.have.keys(["level", "name", "image", "color"]);
            expect(tier0.next.tier).to.have.keys(["level", "name", "image", "color"]);
            expect(tier0.current.stats).to.have.keys(["health", "damage", "healing", "lifeSteal"]);
            expect(tier0.next.stats).to.have.keys(["health", "damage", "healing", "lifeSteal"]);
            expect(tier0.current.unlocks).to.have.keys(["gears", "starPowers", "hcLevel"]);
            expect(tier0.next.unlocks).to.have.keys(["gears", "starPowers", "hcLevel"]);
            expect(tier0.current.hcStats).to.have.keys(["healing", "damage", "speed", "duration", "charge"]);
            expect(tier0.next.hcStats).to.have.keys(["healing", "damage", "speed", "duration", "charge"]);
            expect(tier0.upgrade).to.have.keys(["cost", "masteryReq"]);
            expect(tier0.otherStats).to.have.keys(["reload", "speed", "range", "targets"]);

            expect(tier0.current.tier.level).to.equal(0);
            expect(checkStats(tier0.current.stats, character.stats, 100)).to.be.true;

            expect(tier0.next.tier.level).to.equal(1);
            expect(checkStats(tier0.next.stats, character.stats, 102)).to.be.true;

            expect(tier0.upgrade.cost).to.equal(250);
            expect(tier0.upgrade.masteryReq).to.equal(4);

            expect(tier0.otherStats).to.eql(character.otherStats);
        });

        it("Highest upgrade tier", function(){
            const tier100 = getCharacterData({name: name, tier: 0x700})!;

            expect(tier100.current.tier.level).to.equal(100);
            expect(checkStats(tier100.current.stats, character.stats, 300)).to.be.true;

            expect(tier100.next.tier.level).to.equal(-1);
            expect(checkStats(tier100.next.stats, character.stats, 300)).to.be.true;

            expect(hcStatsDiff(tier100.current.hcStats, tier100.next.hcStats)).to.eql({});

            expect(tier100.upgrade.cost).to.equal(0);
            expect(tier100.upgrade.masteryReq).to.equal(36);
        });

        it("Next level is a normal upgrade", function(){
            const tier1 = getCharacterData({name: name, tier: 0x001})!;

            expect(tier1.current.tier.level).to.equal(1);
            expect(checkStats(tier1.current.stats, character.stats, 102)).to.be.true;

            expect(tier1.next.tier.level).to.equal(2);
            expect(checkStats(tier1.next.stats, character.stats, 104)).to.be.true;

            expect(tier1.upgrade.cost).to.equal(260);
            expect(tier1.upgrade.masteryReq).to.equal(4);
        });

        it("Next level is a tier up", function(){
            const tier60 = getCharacterData({name: name, tier: 0x40f})!;

            expect(tier60.current.tier.level).to.equal(60);
            expect(checkStats(tier60.current.stats, character.stats, 242.5)).to.be.true;
            expect(tier60.current.unlocks.starPowers).to.equal(2);

            expect(tier60.next.tier.level).to.equal(60);
            expect(checkStats(tier60.next.stats, character.stats, 250)).to.be.true;
            expect(tier60.next.unlocks.starPowers).to.equal(3);

            expect(tier60.upgrade.cost).to.equal(64000);
            expect(tier60.upgrade.masteryReq).to.equal(25);
        });

        it("Next level unlocks hypercharge", function(){
            const tier80 = getCharacterData({name: name, tier: 0x514})!;

            expect(tier80.current.tier.level).to.equal(80);
            expect(checkStats(tier80.current.stats, character.stats, 290)).to.be.true;
            expect(tier80.current.unlocks.hcLevel).to.equal(0);

            expect(tier80.next.tier.level).to.equal(80);
            expect(checkStats(tier80.next.stats, character.stats, 300)).to.be.true;
            expect(tier80.next.unlocks.hcLevel).to.equal(1);

            expect(tier80.upgrade.cost).to.equal(240000);
            expect(tier80.upgrade.masteryReq).to.equal(30);
        });

        it("Next level improves hypercharge", function(){
            const tier80 = getCharacterData({name: name, tier: 0x600})!;

            expect(tier80.current.tier.level).to.equal(80);
            expect(checkStats(tier80.current.stats, character.stats, 300)).to.be.true;
            expect(tier80.current.unlocks.hcLevel).to.equal(1);

            expect(tier80.next.tier.level).to.equal(81);
            expect(checkStats(tier80.next.stats, character.stats, 300)).to.be.true;
            expect(tier80.next.unlocks.hcLevel).to.equal(1);

            expect(hcStatsDiff(tier80.current.hcStats, tier80.next.hcStats)).to.eql({healing: 5});

            expect(tier80.upgrade.cost).to.equal(96000);
            expect(tier80.upgrade.masteryReq).to.equal(30);
        });

        it("Next level is the max level", function(){
            const tier100 = getCharacterData({name: name, tier: 0x614})!;

            expect(tier100.current.tier.level).to.equal(100);
            expect(checkStats(tier100.current.stats, character.stats, 300)).to.be.true;
            expect(tier100.current.unlocks.hcLevel).to.equal(1);

            expect(tier100.next.tier.level).to.equal(100);
            expect(checkStats(tier100.next.stats, character.stats, 300)).to.be.true;
            expect(tier100.next.unlocks.hcLevel).to.equal(2);

            expect(hcStatsDiff(tier100.current.hcStats, tier100.next.hcStats)).to.eql({});

            expect(tier100.upgrade.cost).to.equal(360000);
            expect(tier100.upgrade.masteryReq).to.equal(36);
        });

        it("Negative upgrade tier", function(){
            const tier0 = getCharacterData({name: name, tier: 0x000});
            const tierBelow0 = getCharacterData({name: name, tier: 0x000});
            expect(tier0).to.eql(tierBelow0);
        });

        it("Above highest upgrade tier", function(){
            const tier100 = getCharacterData({name: name, tier: 0x700});
            const tierAbove100 = getCharacterData({name: name, tier: 0x1b39});
            expect(tier100).to.eql(tierAbove100);
        });

        it("Character does not exist", function(){
            expect(getCharacterData({name: "not a character", tier: 0x000})).to.be.undefined;
        });
    });
});
