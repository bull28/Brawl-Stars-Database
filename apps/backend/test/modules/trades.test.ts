import {expect} from "chai";
import allSkins from "../../bull/data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR} from "../../bull/data/constants";
import {validatePins, formatTradeData, getTradeCost, getTimeTradeCost, getTradeTimeLeft} from "../../bull/modules/trades";
import {TradePin, TradePinValid} from "../../bull/types";

describe("Trades module", function(){
    it("Filter out any invalid pins from a list of pins in a trade", function(){
        // Test brawler
        const bull = allSkins.find((value) => value.name === "bull")!;
        expect(bull).to.be.an("object");

        const pins1: TradePin[] = [];
        const pins2: TradePin[] = [];
        const pins3: TradePin[] = [];
        for (let x = 0; x < bull.pins.length; x++){
            pins1.push({brawler: "bull", pin: bull.pins[x].name, amount: 1});
            pins2.push({brawler: "bull", pin: bull.pins[x].image, amount: 1});
            pins3.push({brawler: "bull", pin: PIN_IMAGE_DIR + bull.pins[x].image, amount: 1});
        }

        const expectedNames = bull.pins.map((value) => value.name);

        // Empty pin array
        expect(validatePins([], true)).to.be.an("array").that.is.empty;

        // Search by name
        // All pins should be valid
        expect(validatePins(pins1, true).map((value) => value.pin)).to.have.members(expectedNames);
        // Invalid pin name added, valid pins should not change
        pins1.push({brawler: "NOT BULL", pin: "NOT A BULL PIN", amount: 1});
        expect(validatePins(pins1, true).map((value) => value.pin)).to.have.members(expectedNames);
        // Amount of 0 should remove the pin from the valid array
        pins1[0].amount = 0;
        expect(validatePins(pins1, true).map((value) => value.pin)).to.have.members(expectedNames.slice(1));

        // Search by image
        // No file paths
        expect(validatePins(pins2, false).map((value) => value.pin)).to.have.members(expectedNames);
        // With file paths
        expect(validatePins(pins3, false).map((value) => value.pin)).to.have.members(expectedNames);

        // Objects missing properties
        expect(validatePins([{} as TradePin], false)).to.be.empty;
    });

    it("Format a list of valid trade pins for displaying to the user", function(){
        const pins: TradePinValid[] = [{brawler: "bull", pin: "bull_default", amount: 1, rarityValue: -1, rarityColor: "#000000"}];

        const data = formatTradeData(pins);

        expect(data).to.be.an("array");
        expect(data).to.have.lengthOf(pins.length);

        expect(data[0].pinImage).to.equal(`${PIN_IMAGE_DIR}bull/${pins[0].pin}${IMAGE_FILE_EXTENSION}`);
        expect(data[0]).to.not.have.property("brawler");

        // Objects missing properties
        const invalid = formatTradeData([{} as TradePinValid]);
        expect(invalid).to.be.an("array").that.is.empty;
    });

    it("Calculate the cost of a trade", function(){
        // The trade cost function only looks at the amount and rarityValue, other properties do not matter here
        const offer1: TradePinValid[] = [
            {brawler: "", pin: "", amount: 1, rarityValue: 0, rarityColor: ""},
            {brawler: "", pin: "", amount: 1, rarityValue: 1, rarityColor: ""},
            {brawler: "", pin: "", amount: 1, rarityValue: 2, rarityColor: ""},
            {brawler: "", pin: "", amount: 1, rarityValue: 3, rarityColor: ""},
            {brawler: "", pin: "", amount: 1, rarityValue: 4, rarityColor: ""},
            {brawler: "", pin: "", amount: 1, rarityValue: 5, rarityColor: ""}
        ];
        const offer2: TradePinValid[] = [
            {brawler: "", pin: "", amount: 1, rarityValue: 0, rarityColor: ""},
            {brawler: "", pin: "", amount: 5, rarityValue: 0, rarityColor: ""},
            {brawler: "", pin: "", amount: 15, rarityValue: 0, rarityColor: ""},
            {brawler: "", pin: "", amount: 16, rarityValue: 0, rarityColor: ""}
        ];

        // Different rarity values
        expect(getTradeCost(offer1, [])).to.equal(65);
        // Different pin amounts (expected to be 27.075, rounded to 27)
        expect(getTradeCost(offer2, [])).to.equal(27);
        // Combining offer and request
        expect(getTradeCost(offer1, offer2)).to.equal(92);
    });

    it("Calculate the extra time cost of a trade", function(){
        expect(getTimeTradeCost(-1)).to.equal(0);
        expect(getTimeTradeCost(0)).to.equal(0);
        expect(getTimeTradeCost(48)).to.equal(0);
        expect(getTimeTradeCost(48.69)).to.equal(0);
        expect(getTimeTradeCost(72)).to.equal(6);
        expect(getTimeTradeCost(120)).to.equal(12);
        expect(getTimeTradeCost(168)).to.equal(18);
        expect(getTimeTradeCost(240)).to.equal(24);
        expect(getTimeTradeCost(336)).to.equal(30);
        expect(getTimeTradeCost(337)).to.equal(1000);
    });

    it("Calculate the number of seconds left on a trade", function(){
        const now = Date.now();
        expect(getTradeTimeLeft(0)).to.equal(0);
        expect(getTradeTimeLeft(now)).to.equal(0);
        expect(getTradeTimeLeft(now + 3600069)).to.equal(3600);
    });
});
