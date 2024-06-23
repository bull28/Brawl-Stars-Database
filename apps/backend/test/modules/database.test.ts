import {expect} from "chai";
import * as db from "../../bull/modules/database";

const parseError = `["definitely not a parse error//////////""}[:}]'`;

describe("Database Utilities module", function(){
    it("Parse an array of strings", function(){
        const array1 = db.parseStringArray(`["BULL", "DARRYL", "EL PRIMO", "FRANK", "ASH", "HANK"]`);
        expect(array1).to.be.an("array");
        expect(array1).to.have.lengthOf(6);

        const array2 = db.parseStringArray(`[]`);
        expect(array2).to.be.an("array");
        expect(array2).to.be.empty;

        expect(db.parseStringArray.bind(undefined, parseError)).to.throw();
    });

    it("Parse an array of numbers", function(){
        const array1 = db.parseNumberArray(`[1, 2, 3, 4, 5, 69]`);
        expect(array1).to.be.an("array");
        expect(array1).to.have.lengthOf(6);

        const array2 = db.parseNumberArray(`[]`);
        expect(array2).to.be.an("array");
        expect(array2).to.be.empty;

        expect(db.parseNumberArray.bind(undefined, parseError)).to.throw();
    });

    it("Parse a brawler collection object", function(){
        const brawlers = {
            bull: {bull_1: 1, bull_2: 1},
            ash: {ash_1: 1, ash_2: 1}
        };

        // Valid collection
        expect(db.parseBrawlers(JSON.stringify(brawlers))).to.eql(brawlers);
        // Invalid brawler value
        expect(db.parseBrawlers(`{"bull": 0}`)).to.eql({});
        // Invalid pin value
        expect(db.parseBrawlers(`{"bull": {"bull_1": ""}}`)).to.eql({bull: {}});

        expect(db.parseBrawlers.bind(undefined, parseError)).to.throw();
    });

    it("Parse an array of pins from a trade", function(){
        const trade = [
            {brawler: "bull", pin: "bull_default", amount: 1, rarityValue: 0, rarityColor: ""},
            {brawler: "ash", pin: "ash_default", amount: 1, rarityValue: 5, rarityColor: ""}
        ];
        const invalidTrade = [
            {brawler: "bull", pin: "bull_default", amount: 1, rarityValue: 0, rarityColor: ""},
            {brawler: "ash", pin: "ash_default", amount: 1, rarityValue: 5, rarityColor: ""},
            {brawler: true, pin: false, amount: true, rarityValue: false, rarityColor: 69}
        ];

        // Valid trade pins
        expect(db.parseTradePins(JSON.stringify(trade))).to.eql(trade);
        // Empty array
        expect(db.parseTradePins(`[]`)).to.eql([]);
        // Invalid trade object
        expect(db.parseTradePins(`[{"brawler": 0}]`)).to.eql([]);
        // Partially invalid trade object
        expect(db.parseTradePins(JSON.stringify(invalidTrade))).to.eql(trade);

        expect(db.parseTradePins.bind(undefined, parseError)).to.throw();
    });

    it("Parse a game badges object", function(){
        const badges = {bull: 1, darryl: 2, elprimo: 3, frank: 4, ash: 5, hank: 69};
        const invalidBadges = {bull: 1, darryl: 2, elprimo: 3, frank: 4, ash: 5, hank: 69, poco: false};

        // Valid badges
        expect(db.parseBadges(JSON.stringify(badges))).to.eql(badges);
        // Empty object
        expect(db.parseBadges(`{}`)).to.eql({});
        // Invalid badges object
        expect(db.parseBadges(`{"bull": ""}`)).to.eql({});
        // Partially invalid badges object
        expect(db.parseBadges(JSON.stringify(invalidBadges))).to.eql(badges);

        expect(db.parseBadges.bind(undefined, parseError)).to.throw();
    });

    it("Parse an array of challenge waves", function(){
        const waves = [
            {level: 0, enemies: ["bull"], delay: 0, maxEnemies: 0},
            {level: 1, enemies: ["darryl"], delay: 0, maxEnemies: 0},
            {level: 2, enemies: ["elprimo", "frank", "ash", "hank"]}
        ];
        const invalidWaves = [
            {level: 0, enemies: ["bull"], delay: 0, maxEnemies: 0},
            {level: true, enemies: false, delay: [true], maxEnemies: {BULL: false}},
        ];

        // Valid waves
        expect(db.parseChallengeWaves(JSON.stringify(waves))).to.eql(waves);
        // Empty array
        expect(db.parseChallengeWaves(`[]`)).to.eql([]);
        // Invalid delay and maxEnemies (they are ignored)
        expect(db.parseChallengeWaves(`[{"level": 0, "enemies": [], "delay": true, "maxEnemies": false}]`)).to.eql([{level: 0, enemies: []}]);
        // Invalid waves (should throw instead of be an empty array)
        expect(db.parseChallengeWaves.bind(undefined, invalidWaves)).to.throw();

        expect(db.parseChallengeWaves.bind(undefined, parseError)).to.throw();
    });

    it("Convert a brawler collection object to a string", function(){
        const brawlers = {
            bull: {bull_1: 1, bull_2: 1},
            ash: {ash_1: 1, ash_2: 1}
        };

        expect(JSON.parse(db.stringifyBrawlers(brawlers))).to.deep.include(brawlers);
        expect(db.stringifyBrawlers({})).to.eql("{}");
    });
});
