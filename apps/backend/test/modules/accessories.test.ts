import {expect} from "chai";
import accessoryList from "../../bull/data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, RESOURCE_IMAGE_DIR, ACCESSORY_IMAGE_DIR, GAME_GEAR_IMAGE_DIR, GAME_BRAWLER_IMAGE_DIR, gameDifficulties, gameBrawlers, gameStarPowers, gameGears} from "../../bull/data/constants";
import {
    validateReport, 
    getMasteryLevel, 
    getAccessoryPreview, 
    getAccessoryCollection, 
    getAccessoryData, 
    canClaimAccessory, 
    getBadgeRewardPreview, 
    extractReportGameMode, 
    checkReportStrength, 
    extractReportPreviewStats, 
    extractReportData
} from "../../bull/modules/accessories";
import {DatabaseBadges, GameReport} from "../../bull/types";
import {sampleGameReport, GAME_VERSION} from "../database_setup";

const REPORT_FORMAT = {
    mode: [0, 2], player: [2, 6], gears: [6, 8], accessories: [8, 13], score: [13, 19],
    achievements: [19, 26], upgrades: [26, 32], stats: [32, 40], visited: [40, 48],
    levels: [48, 96], enemies: [96, 126], length: [0, 126]
};

const emptyReport: number[] = [];
for (let x = 0; x < REPORT_FORMAT.length[1]; x++){
    emptyReport.push(0);
}

// Score = 500, Difficulty 2, Player 3 (Darryl), Star Power 2, Enemies Defeated = 600
// Gears 1 and 2 (Health and Shield), First 5 Accessories
const previewReport = [0, 0, 500, 1, 3, 2, 1, 2, 0, 1, 2, 3, 4, 300, 150, 0, 50, 0, 0, 0, 600];
for (let x = previewReport.length; x < REPORT_FORMAT.length[1]; x++){
    if (x >= 40 && x <= 47){
        previewReport.push(x - 40);
    } else{
        previewReport.push(0);
    }
}

describe("Accessories and Game Report module", function(){
    it("Must contain exactly 80 accessories", function(){
        expect(accessoryList).to.have.lengthOf(80);
    });

    it("Calculate the correct level from a mastery points value", function(){
        // This needs to be changed if mastery levels change
        const mastery0 = getMasteryLevel(0);
        const masteryBelow0 = getMasteryLevel(-1);

        // Lowest mastery level
        expect(mastery0).to.be.an("object");
        expect(mastery0).to.have.keys(["level", "points", "current", "next"]);
        expect(mastery0.current).to.have.keys(["points", "image", "color"]);
        expect(mastery0.next).to.have.keys(["points", "image", "color"]);
        expect(mastery0.current.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_empty" + IMAGE_FILE_EXTENSION);
        expect(mastery0.next.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);

        // Negative mastery points should give the same result as 0
        expect(mastery0).to.eql(masteryBelow0);

        // Next level does not change the mastery image
        const mastery1 = getMasteryLevel(2000);
        expect(mastery1.level).to.equal(1);
        expect(mastery1.current.points).to.equal(2000);
        expect(mastery1.next.points).to.equal(6000);
        expect(mastery1.current.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);
        expect(mastery1.next.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_0" + IMAGE_FILE_EXTENSION);

        // Next level changes the mastery image
        const mastery29 = getMasteryLevel(19999999);
        expect(mastery29.level).to.equal(29);
        expect(mastery29.current.points).to.equal(16000000);
        expect(mastery29.next.points).to.equal(20000000);
        expect(mastery29.current.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_6" + IMAGE_FILE_EXTENSION);
        expect(mastery29.next.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_7" + IMAGE_FILE_EXTENSION);

        // Highest mastery level
        const mastery30 = getMasteryLevel(20000000);
        expect(mastery30.level).to.equal(30);
        expect(mastery30.current.points).to.equal(20000000);
        expect(mastery30.next.points).to.equal(-1);
        expect(mastery30.next.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_7" + IMAGE_FILE_EXTENSION);
        expect(mastery30.next.image).to.equal(RESOURCE_IMAGE_DIR + "mastery_level_7" + IMAGE_FILE_EXTENSION);
    });

    it("Get the preview for an accessory in brawl boxes", function(){
        const accessory = accessoryList[0];
        const preview = getAccessoryPreview(accessory.name)!;

        expect(preview).to.be.an("object");
        expect(preview).to.have.keys(["displayName", "image", "description"]);
        expect(preview.displayName).to.equal(accessory.displayName);
        expect(preview.image).to.equal(`${ACCESSORY_IMAGE_DIR}accessory_${accessory.name}${IMAGE_FILE_EXTENSION}`);
        expect(preview.description).to.include(accessory.description);

        expect(getAccessoryPreview("not an accessory")).to.be.undefined;
    });

    it("Get the preview for all accessories in a collection", function(){
        const accessory = accessoryList[0];
        const preview = getAccessoryCollection([accessory.name]);

        expect(preview).to.be.an("array");
        expect(preview).to.have.lengthOf(accessoryList.length);

        expect(preview[0]).to.have.keys(["name", "displayName", "image", "unlocked"]);
        expect(preview[0].displayName).to.equal(accessory.displayName);
        expect(preview[0].image).to.equal(`${ACCESSORY_IMAGE_DIR}accessory_${accessory.name}${IMAGE_FILE_EXTENSION}`);
        expect(preview[0].unlocked).to.be.true;
        expect(preview[1].unlocked).to.be.false;
    });

    it("Determine whether an accessory can be claimed, given badge progress", function(){
        let index = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        if (i > 0){
            index = i;
        }

        const accessory = accessoryList[index];
        const badges: DatabaseBadges = {};
        badges[accessory.name] = 0;

        // Not enough badges, not claimed yet
        expect(canClaimAccessory([], badges, accessory.name)).to.be.false;

        // Not enough badges, already claimed
        expect(canClaimAccessory([accessory.name], badges, accessory.name)).to.be.false;

        // Enough badges, already claimed
        badges[accessory.name] = accessory.badges;
        expect(canClaimAccessory([accessory.name], badges, accessory.name)).to.be.false;

        // Not enough badges, not claimed yet
        expect(canClaimAccessory([], badges, accessory.name)).to.be.true;

        // Accessory does not exist
        expect(canClaimAccessory([], {"not an accessory": 69}, "not an accessory")).to.be.false;
    });

    it("Show a preview of badge rewards from a game run", function(){
        const accessory = accessoryList[0];
        const reward = new Map([[accessory.name, 1]]);

        // Not unlocked
        const reward1 = getBadgeRewardPreview([], reward);
        expect(reward1).to.be.an("array");
        expect(reward1).to.have.lengthOf(reward.size);
        expect(reward1[0]).to.have.keys(["displayName", "unlock", "amount"]);
        expect(reward1[0].displayName).to.equal(accessory.displayName);
        expect(reward1[0].unlock).to.equal(accessory.unlock);
        expect(reward1[0].amount).to.equal(1);

        // Unlocked (badge progress should not be shown)
        const reward2 = getBadgeRewardPreview([accessory.name], reward);
        expect(reward2).to.be.empty;

        // Accessory in reward does not exist
        reward.clear();
        reward.set("not an accessory", 1);
        const reward3 = getBadgeRewardPreview([accessory.name], reward);
        expect(reward3).to.be.empty;
    });

    it("Get the game mode from a valid report", function(){
        const report = emptyReport.slice();

        expect(extractReportGameMode(report)).to.equal(0);
        report[0] = 2;
        expect(extractReportGameMode(report)).to.equal(2);
        expect(extractReportGameMode([])).to.equal(-1);
    });

    it("Check the strength of a report with a given value", function(){
        const report = emptyReport.slice();

        expect(checkReportStrength(report, 0)).to.equal(true);
        expect(checkReportStrength(report, 69)).to.equal(true);
        report[1] = 69;
        expect(checkReportStrength(report, 69)).to.equal(true);
        expect(checkReportStrength(report, 70)).to.equal(false);
        expect(checkReportStrength([], 0)).to.equal(false);
    });

    it("Display the correct preview information from a game report", function(){
        // This function is not supposed to validate the report
        expect(extractReportPreviewStats([])).to.be.undefined;
        const preview = extractReportPreviewStats(previewReport)!;

        expect(preview).to.be.an("object");
        expect(preview).to.have.keys([
            "score", "enemies", "win", "difficulty",
            "brawler", "starPower", "gears", "accessories"
        ]);
        expect(preview.brawler).to.have.keys(["displayName", "image"]);
        expect(preview.starPower).to.have.keys(["displayName", "image"]);

        expect(preview.score).to.equal(500);
        expect(preview.enemies).to.equal(600);
        expect(preview.win).to.be.true;
        expect(preview.difficulty).to.equal(gameDifficulties[1]);
        expect(preview.brawler.displayName).to.equal(gameBrawlers[3].displayName);
        expect(preview.brawler.image).to.equal(GAME_BRAWLER_IMAGE_DIR + gameBrawlers[3].image + IMAGE_FILE_EXTENSION);
        expect(preview.starPower.displayName).to.equal(gameStarPowers[1].displayName);
        expect(preview.starPower.image).to.equal(GAME_GEAR_IMAGE_DIR + gameStarPowers[1].image + IMAGE_FILE_EXTENSION);

        expect(preview.gears).to.have.lengthOf(2);
        expect(preview.gears[0].displayName).to.equal(gameGears[1].displayName);
        expect(preview.gears[0].image).to.equal(GAME_GEAR_IMAGE_DIR + gameGears[1].image + IMAGE_FILE_EXTENSION);
        expect(preview.gears[1].displayName).to.equal(gameGears[2].displayName);
        expect(preview.gears[1].image).to.equal(GAME_GEAR_IMAGE_DIR + gameGears[2].image + IMAGE_FILE_EXTENSION);

        expect(preview.accessories).to.have.lengthOf(5);
        for (let x = 0; x < 5; x++){
            expect(preview.accessories[x].displayName).to.equal(accessoryList[x].displayName);
            expect(preview.accessories[x].image).to.equal(`${ACCESSORY_IMAGE_DIR}accessory_${accessoryList[x].name}${IMAGE_FILE_EXTENSION}`);
        }
    });

    it("Extract the data from a game report required to give rewards", function(){
        // Same test data as extractReportPreviewStats is used for this function
        expect(extractReportData([])).to.be.undefined;
        const preview = extractReportData(previewReport)!;

        expect(preview).to.be.an("object");
        expect(preview).to.have.keys([
            "gameMode", "player", "score", "enemies",
            "coins", "points", "badges"
        ]);
        expect(preview.player).to.have.keys(["difficulty", "brawler", "starPower", "gears", "accessories"]);
        expect(preview.score).to.have.keys(["win", "total", "categories"]);
        expect(preview.score.categories).to.have.keys(["completion", "time", "destination", "health", "gear", "enemy"]);

        expect(preview.gameMode).to.equal(0);
        expect(preview.player.difficulty).to.equal(1);
        expect(preview.player.brawler).to.equal(3);
        expect(preview.player.starPower).to.equal(2);
        expect(preview.player.gears).to.eql([1, 2]);
        expect(preview.player.accessories).to.eql([0, 1, 2, 3, 4]);

        expect(preview.score.win).to.be.true;
        expect(preview.score.total).to.equal(500);
        expect(preview.score.categories).to.eql({
            completion: 300, time: 150, destination: 0, health: 50, gear: 0, enemy: 0
        });

        expect(preview.enemies).to.equal(600);
        expect(preview.coins).to.eql([0, 0]);
        expect(preview.badges).to.be.a("map");
        expect(preview.badges).to.include.keys(["darryl", "wins", "enemies"]);

        const report2 = sampleGameReport.slice();
        const format = REPORT_FORMAT;
        // Achievements nomove, noupgrades, nodamage, fastwin, perfect1
        report2[format.achievements[0] + 4] = 0;
        for (let x = 0; x < 6; x++){
            report2[format.upgrades[0] + x] = 0;
        }
        report2[format.achievements[0]] = 89999;
        report2[format.player[0]] = 600;
        const preview2 = extractReportData(report2)!;
        expect(preview2.badges).to.include.keys(["nomove", "noupgrades", "nodamage", "fastwin", "perfect1"]);

        // Should not include achievements from above because they are only obtainable in game mode 0
        report2[0] = 2;
        const preview3 = extractReportData(report2)!;
        expect(preview3.badges).to.include.keys(["challenges"]);
        expect(preview3.badges).to.not.include.keys(["nomove", "noupgrades", "nodamage", "fastwin", "perfect1"]);
    });

    describe("Identifying invalid reports", function(){
        // Last updated: version 77
        const VERSION = GAME_VERSION;
        const TIME = Date.now() - 60000;
        const format = REPORT_FORMAT;

        const valid = sampleGameReport.slice();
        const invalid = sampleGameReport.slice();
        const validVersion: GameReport = [VERSION, TIME, valid];
        const invalidVersion: GameReport = [VERSION, TIME, invalid];

        const p = format.player[0];
        const l = format.levels[0];

        it("Report is valid enough", function(){
            expect(validateReport(validVersion)).to.be.true;
        });

        // Definitely invalid cases
        it("Invalid report length", function(){
            expect(validateReport([VERSION, TIME] as unknown as GameReport)).to.be.false;
        });

        it("Old report version", function(){
            expect(validateReport([0, TIME, valid])).to.be.false;
        });

        it("Invalid report time", function(){
            expect(validateReport([VERSION, TIME + 120000, valid])).to.be.false;
        });

        it("Invalid data length", function(){
            expect(validateReport([VERSION, TIME, []])).to.be.false;
        });

        // For each of the reasons for being invalid, change the value(s) that would cause the report to be invalid then
        // change them back to the valid values before the next reason. This ensures the report is being set as invalid
        // for the intended reasons.
        it("Some values not integers", function(){
            invalid[0] = 1.1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[0] = valid[0];
        });

        it("Game mode not 0 or 2", function(){
            invalid[format.mode[0]] = 1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.mode[0]] = valid[format.mode[0]];
        });

        it("Difficulty not between 0 and 9", function(){
            invalid[p + 1] = 10;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[p + 1] = valid[p + 1];
        });

        it("Character not at least 0", function(){
            invalid[p + 2] = -1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[p + 2] = valid[p + 2];
        });

        it("Star Power not 1 or 2", function(){
            invalid[p + 3] = 3;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[p + 3] = valid[p + 3];
        });

        it("Total enemies more than 1000", function(){
            invalid[format.achievements[0] + 1] = 1001;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.achievements[0] + 1] = valid[format.achievements[0] + 1];
        });

        it("Enemy stats decreasing for each level", function(){
            invalid[format.stats[0] + 1] = invalid[format.stats[0]] - 1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.stats[0] + 1] = valid[format.stats[0] + 1];
        });

        // For now, the level with index 14 does not exist
        it("Visited levels are invalid", function(){
            invalid[format.visited[0]] = 14;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.visited[0]] = valid[format.visited[0]];
        });

        it("Accessories used on difficulty 5 or lower", function(){
            invalid[format.accessories[0]] = 0;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.accessories[0]] = valid[format.accessories[0]];
        });

        it("Upgrades are over the max level", function(){
            invalid[format.upgrades[0]] = 1069;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.upgrades[0]] = valid[format.upgrades[0]];
        });

        // Incorrect scores

        it("Completion score incorrectly calculated", function(){
            invalid[format.levels[1] - 6] -= 1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.levels[1] - 6] = valid[format.levels[1] - 6];
        });

        // The time score in the valid report is 150 / 150 with all levels having time score 1000 so one level at 1001
        // would cause the time score to go below 150
        it("Time score incorrectly calculated", function(){
            invalid[l + 8] = 1001;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[l + 8] = valid[l + 8];
        });

        it("Destination score incorrectly calculated", function(){
            invalid[l + 3] = 1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[l + 3] = valid[l + 3];
        });

        it("Gear score incorrectly calculated", function(){
            invalid[l + 5] = 30;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[l + 5] = valid[l + 5];
        });

        // The enemy at this index is a bonus enemy and will increase the score if defeated
        it("Enemy bonus score incorrectly calculated", function(){
            invalid[format.enemies[0] + 26] = 1;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[format.enemies[0] + 26] = valid[format.enemies[0] + 26];
        });

        it("Health penalty score incorrectly calculated", function(){
            invalid[l + 4] = 100000;
            invalid[l + 10] = 100000;
            expect(validateReport(invalidVersion)).to.be.false;
            invalid[l + 4] = valid[l + 4];
            invalid[l + 10] = valid[l + 10];
        });

        // All changes that caused the report to be invalid have been reversed so it should be valid
        it("Original report at the end", function(){
            expect(validateReport(invalidVersion)).to.be.true;
        });
    });

    describe("Getting data for an accessory", function(){
        // Test with an accessory that requires more than 1 badge to unlock (if such an accessory exists)
        let index = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        if (i > 0){
            index = i;
        }

        const accessory = accessoryList[index];
        const badges: DatabaseBadges = {};
        badges[accessory.name] = 0;

        it("No badge progress and accessory locked", function(){
            const data = getAccessoryData([], badges);
            expect(data).to.be.an("array");
            expect(data).to.have.lengthOf(accessoryList.length);
            expect(data[index]).to.have.keys(["name", "category", "displayName", "image", "description", "unlocked", "badge"]);
            expect(data[index].badge).to.have.keys(["collected", "required", "image", "unlockMethod"]);

            expect(data[index].name).to.equal(accessory.name);
            expect(data[index].category).to.equal(accessory.category);
            expect(data[index].displayName).to.equal(accessory.displayName);
            expect(data[index].image).to.equal(`${ACCESSORY_IMAGE_DIR}accessory_${accessory.name}${IMAGE_FILE_EXTENSION}`);
            expect(data[index].description).to.equal(accessory.description);
            expect(data[index].unlocked).to.be.false;

            expect(data[index].badge.collected).to.equal(0);
            expect(data[index].badge.required).to.equal(accessory.badges);
            expect(data[index].badge.unlockMethod).to.equal(accessory.unlock);
        });

        it("Some badge progress", function(){
            badges[accessory.name] = Math.floor(accessory.badges);
            const data = getAccessoryData([], badges);
            expect(data[index].unlocked).to.be.false;
            expect(data[index].badge.collected).to.equal(badges[accessory.name]);
        });

        it("Some badge progress but accessory already unlocked", function(){
            const data = getAccessoryData([accessory.name], badges);
            expect(data[index].unlocked).to.be.true;
            expect(data[index].badge.collected).to.equal(badges[accessory.name]);
        });

        it("Full badge progress and accessory unlocked", function(){
            badges[accessory.name] = accessory.badges;
            const data = getAccessoryData([accessory.name], badges);
            expect(data[index].unlocked).to.be.true;
            expect(data[index].badge.collected).to.equal(badges[accessory.name]);
            expect(data[index].badge.collected).to.equal(data[index].badge.required);
        });
    });
});
