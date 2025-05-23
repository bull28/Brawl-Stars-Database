import {expect} from "chai";
import {validateReport, extractReportData, challengeRewards} from "../../../frank/modules/report_module";
import {GameReport} from "../../../frank/types";
import {sampleGameReport, GAME_VERSION} from "../database_setup";

const REPORT_FORMAT = {
    mode: [0, 1], player: [1, 6], gears: [6, 8], accessories: [8, 13], score: [13, 19],
    achievements: [19, 26], upgrades: [26, 32], stats: [32, 40], visited: [40, 48],
    levels: [48, 96], enemies: [96, 126], length: [0, 126]
};

const emptyReport: number[] = [];
for (let x = 0; x < REPORT_FORMAT.length[1]; x++){
    emptyReport.push(0);
}

// Score = 500, Difficulty 2, Player 3 (Darryl), Upgrade Tier 0, Star Power 2, Enemies Defeated = 600
// Gears 1 and 2 (Health and Shield), First 5 Accessories
const previewReport = [0, 500, 1, 3, 0, 2, 1, 2, 0, 1, 2, 3, 4, 300, 150, 0, 50, 0, 0, 0, 600];
for (let x = previewReport.length; x < REPORT_FORMAT.length[1]; x++){
    if (x >= 40 && x <= 47){
        previewReport.push(x - 40);
    } else{
        previewReport.push(0);
    }
}

describe("Game Report module", function(){
    it("Get the correct mastery and coins multipliers from a challenge", function(){
        expect(challengeRewards("test", 0, true)).to.eql({mastery: 3, coins: 2, badges: 2});
        expect(challengeRewards("test", 1, true)).to.eql({mastery: 6, coins: 2, badges: 3});
        expect(challengeRewards("test", 2, true)).to.eql({mastery: 6, coins: 2, badges: 3});
        expect(challengeRewards("test", -1, true)).to.eql({mastery: 0, coins: 0, badges: 0});
        expect(challengeRewards("test", 0, false)).to.eql({mastery: 2, coins: 2, badges: 2});
        expect(challengeRewards("test", 1, false)).to.eql({mastery: 4, coins: 2, badges: 3});
        expect(challengeRewards("test", 2, false)).to.eql({mastery: 4, coins: 2, badges: 3});
        expect(challengeRewards("test", -1, false)).to.eql({mastery: 0, coins: 0, badges: 0});
        expect(challengeRewards("not a challenge", 0, true)).to.eql({mastery: 0, coins: 0, badges: 0});
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
        expect(preview.player).to.have.keys(["difficulty", "brawler", "upgradeTier", "starPower", "gears", "accessories"]);
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
        expect(preview.coins).to.eql([300, 300]);
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
        // Last updated: version 83
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
            expect(validateReport(validVersion)).to.equal(0);
        });

        // Definitely invalid cases
        it("Invalid report type", function(){
            expect(validateReport({} as unknown as GameReport)).to.equal(1);
            expect(validateReport(undefined as unknown as GameReport)).to.equal(1);
            expect(validateReport(true as unknown as GameReport)).to.equal(1);
            expect(validateReport(69 as unknown as GameReport)).to.equal(1);
            expect(validateReport("bull" as unknown as GameReport)).to.equal(1);
        });

        it("Invalid report length", function(){
            expect(validateReport([VERSION, TIME] as unknown as GameReport)).to.equal(2);
            expect(validateReport([VERSION, TIME, [], 1] as unknown as GameReport)).to.equal(2);
        });

        it("Invalid report element types", function(){
            expect(validateReport([false, TIME, []] as unknown as GameReport)).to.equal(3);
            expect(validateReport([VERSION, "", []] as unknown as GameReport)).to.equal(3);
            expect(validateReport([VERSION, TIME, VERSION] as unknown as GameReport)).to.equal(3);
        });

        it("Old report version", function(){
            expect(validateReport([0, TIME, valid])).to.equal(4);
        });

        it("Invalid report time", function(){
            expect(validateReport([VERSION, TIME + 180000, valid])).to.equal(5);
            expect(validateReport([VERSION, TIME - 86400000, valid])).to.equal(5);
        });

        it("Invalid data length", function(){
            expect(validateReport([VERSION, TIME, []])).to.equal(6);
            expect(validateReport([VERSION, TIME, valid.slice(0, -1)])).to.equal(6);
            expect(validateReport([VERSION, TIME, valid.concat([0])])).to.equal(6);
        });

        // For each of the reasons for being invalid, change the value(s) that would cause the report to be invalid then
        // change them back to the valid values before the next reason. This ensures the report is being set as invalid
        // for the intended reasons.
        it("Some values not integers", function(){
            invalid[0] = 1.1;
            expect(validateReport(invalidVersion)).to.equal(7);
            invalid[0] = valid[0];
        });

        it("Game mode not 0 or 2", function(){
            invalid[format.mode[0]] = 1;
            expect(validateReport(invalidVersion)).to.equal(8);
            invalid[format.mode[0]] = valid[format.mode[0]];
        });

        it("Difficulty not between 0 and 9", function(){
            invalid[p + 1] = 10;
            expect(validateReport(invalidVersion)).to.equal(9);
            invalid[p + 1] = valid[p + 1];
        });

        it("Character not at least 0", function(){
            invalid[p + 2] = -1;
            expect(validateReport(invalidVersion)).to.equal(10);
            invalid[p + 2] = valid[p + 2];
        });

        it("Tier not at least 0", function(){
            invalid[p + 3] = -1;
            expect(validateReport(invalidVersion)).to.equal(11);
            invalid[p + 3] = valid[p + 3];
        });

        it("Star Power not 1 or 2", function(){
            invalid[p + 4] = 3;
            expect(validateReport(invalidVersion)).to.equal(12);
            invalid[p + 4] = valid[p + 4];
        });

        it("Total enemies more than 1000", function(){
            invalid[format.achievements[0] + 1] = 1001;
            expect(validateReport(invalidVersion)).to.equal(13);
            invalid[format.achievements[0] + 1] = valid[format.achievements[0] + 1];
        });

        it("Enemy stats decreasing for each level", function(){
            invalid[format.stats[0] + 1] = invalid[format.stats[0]] - 1;
            expect(validateReport(invalidVersion)).to.equal(14);
            invalid[format.stats[0] + 1] = valid[format.stats[0] + 1];
        });

        // For now, the level with index 69 does not exist
        it("Visited levels are invalid", function(){
            invalid[format.visited[0]] = 69;
            expect(validateReport(invalidVersion)).to.equal(15);
            invalid[format.visited[0]] = valid[format.visited[0]];

            // Cannot complete a level after losing a previous level
            invalid[format.visited[0]] = -1;
            invalid[format.visited[0] + 1] = 1;
            expect(validateReport(invalidVersion)).to.equal(15);
            invalid[format.visited[0]] = valid[format.visited[0]];
            invalid[format.visited[0] + 1] = valid[format.visited[0] + 1];
        });

        it("Specific enemy defeated too many times", function(){
            invalid[format.enemies[0]] = 81;
            expect(validateReport(invalidVersion)).to.equal(16);
            invalid[format.enemies[0]] = valid[format.enemies[0]];

            invalid[format.enemies[0] + 2] = 13;
            expect(validateReport(invalidVersion)).to.equal(16);
            invalid[format.enemies[0] + 2] = valid[format.enemies[0] + 2];

            invalid[format.enemies[0] + 26] = 2;
            expect(validateReport(invalidVersion)).to.equal(16);
            invalid[format.enemies[0] + 26] = valid[format.enemies[0] + 26];
        });

        it("Accessories used on difficulty 5 or lower", function(){
            invalid[format.accessories[0]] = 0;
            expect(validateReport(invalidVersion)).to.equal(17);
            invalid[format.accessories[0]] = valid[format.accessories[0]];
        });

        it("Character upgrades used on difficulty 5 or lower", function(){
            invalid[p + 3] = 1;
            expect(validateReport(invalidVersion)).to.equal(18);
            invalid[p + 3] = valid[p + 3];
        });

        it("In-game upgrades are not between 0 and max level", function(){
            invalid[format.upgrades[0]] = 1069;
            expect(validateReport(invalidVersion)).to.equal(19);
            invalid[format.upgrades[0]] = valid[format.upgrades[0]];

            invalid[format.upgrades[0]] = -1;
            expect(validateReport(invalidVersion)).to.equal(19);
            invalid[format.upgrades[0]] = valid[format.upgrades[0]];
        });

        it("Score incorrectly calculated", function(){
            invalid[format.levels[1] - 6] -= 1;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[format.levels[1] - 6] = valid[format.levels[1] - 6];

            // The time score in the valid report is 150 / 150 with all levels having time score 1000 so one level at 1001
            // would cause the time score to go below 150
            invalid[l + 8] = 1001;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[l + 8] = valid[l + 8];

            invalid[l + 3] = 1;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[l + 3] = valid[l + 3];

            invalid[l + 5] = 30;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[l + 5] = valid[l + 5];

            // The enemy at this index is a bonus enemy and will increase the score if defeated
            invalid[format.enemies[0] + 26] = 1;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[format.enemies[0] + 26] = valid[format.enemies[0] + 26];

            invalid[l + 4] = 100000;
            invalid[l + 10] = 100000;
            expect(validateReport(invalidVersion)).to.equal(20);
            invalid[l + 4] = valid[l + 4];
            invalid[l + 10] = valid[l + 10];
        });

        // All changes that caused the report to be invalid have been reversed so it should be valid
        it("Original report at the end", function(){
            expect(validateReport(invalidVersion)).to.equal(0);
        });
    });
});
