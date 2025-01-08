import {expect} from "chai";
import allSkins from "../../bull/data/brawlers_data.json";
import {PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, MASTERY_ICON_DIR, REWARD_IMAGE_DIR} from "../../bull/data/constants";
import {getBrawler, getSkin, getBrawlerData, getSkinData, skinSearch} from "../../bull/modules/skins";

describe("Brawlers and Skins module", function(){
    it("Must contain at least 88 brawlers", function(){
        expect(allSkins).to.have.lengthOf.at.least(88);
    });

    it("Get brawler and skin objects directly from the data file", function(){
        expect(getBrawler(allSkins, "NOT BULL")).to.be.undefined;

        // Surely they don't remove bull from the game...
        const data = getBrawler(allSkins, "bull")!;
        expect(data).to.be.an("object");
        expect(getSkin(data, "bulldudebarbking")).to.be.an("object");
        expect(getSkin(data, "NOT A BULL SKIN")).to.be.undefined;
    });

    it("Get a brawler's data and add image paths", function(){
        // Brawler
        const bull = allSkins.find((value) => value.name === "bull");
        const brawler = bull !== undefined ? bull : allSkins[0];
        const data = getBrawlerData(brawler);

        expect(data).to.be.an("object");
        expect(data).to.have.keys([
            "name", "displayName", "rarity", "description", "image",
            "defaultSkin", "title", "masteryIcon", "skins", "pins"
        ]);
        expect(data.rarity).to.have.keys(["value", "name", "color"]);
        expect(data.skins).to.be.an("array");
        expect(data.pins).to.be.an("array");
        expect(data.skins).to.have.lengthOf.at.least(1);
        expect(data.pins).to.have.lengthOf.at.least(1);

        expect(data.name).to.equal(brawler.name);
        expect(data.displayName).to.equal(brawler.displayName);
        expect(data.description).to.equal(brawler.description);
        expect(data.image).to.equal(PORTRAIT_IMAGE_DIR + brawler.image);
        expect(data.defaultSkin).to.equal(brawler.defaultSkin);
        expect(data.title).to.equal(brawler.title);
        expect(data.masteryIcon).to.equal(MASTERY_ICON_DIR + brawler.masteryIcon);

        // Skin
        const skin = brawler.skins[0];
        const skinData = getSkinData(brawler.skins[0], brawler.name);

        expect(skinData).to.be.an("object");
        expect(skinData).to.have.keys([
            "name", "displayName", "cost", "costBling", "rarity", "requires",
            "features", "groups", "limited", "unlock", "foundIn", "release", "rating", "image", "model"
        ]);
        expect(skinData.cost).to.have.keys(["amount", "currency", "icon"]);
        expect(skinData.costBling).to.have.keys(["amount", "currency", "icon"]);
        expect(skinData.rarity).to.have.keys(["value", "name", "icon"]);
        expect(skinData.release).to.have.keys(["month", "year"]);
        expect(skinData.model).to.have.keys(["geometry", "winAnimation", "loseAnimation"]);

        expect(skinData.name).to.equal(skin.name);
        expect(skinData.displayName).to.equal(skin.displayName);
        expect(skinData.cost.amount).to.equal(skin.cost);
        expect(skinData.costBling.amount).to.equal(skin.costBling);

        expect(skinData.rarity.value).to.equal(skin.rarity.value);
        expect(skinData.rarity.name).to.equal(skin.rarity.name);
        if (skin.rarity.icon !== ""){
            expect(skinData.rarity.icon).to.equal(REWARD_IMAGE_DIR + skin.rarity.icon);
        } else{
            expect(skinData.rarity.icon).to.equal("");
        }

        expect(skinData.requires).to.equal(skin.requires);
        expect(skinData.limited).to.equal(skin.limited);
        expect(skinData.unlock).to.equal(skin.unlock);
        expect(skinData.foundIn).to.equal(skin.foundIn);
        expect(skinData.release.month).to.equal(skin.release.month);
        expect(skinData.release.year).to.equal(skin.release.year);
        expect(skinData.rating).to.equal(skin.rating);
        expect(skinData.image).to.equal(`${SKIN_IMAGE_DIR}${brawler.name}/${skin.image}`);
        expect(skinData.features).to.be.an("array");

        expect(skinData.groups).to.be.an("array");
        expect(skinData.groups).to.have.lengthOf(skin.groups.length);
        for (let x = 0; x < skinData.groups.length; x++){
            expect(skinData.groups[x].name).to.equal(skin.groups[x].name);
            expect(skinData.groups[x].image).to.equal(SKINGROUP_IMAGE_DIR + skin.groups[x].image);
            expect(skinData.groups[x].icon).to.equal(SKINGROUP_ICON_DIR + skin.groups[x].icon);
        }

        expect(skinData.model.geometry.exists).to.be.a("boolean");
        expect(skinData.model.winAnimation.exists).to.be.a("boolean");
        expect(skinData.model.loseAnimation.exists).to.be.a("boolean");

        // Pins
        const pin = brawler.pins[0];
        const pinData = data.pins[0];
        expect(pinData).to.be.an("object");
        expect(pinData).to.have.keys(["image", "rarity"]);
        expect(pinData.rarity).to.have.keys(["value", "name", "color"]);

        expect(pinData.image).to.equal(`${PIN_IMAGE_DIR}${brawler.name}/${pin.image}`);
        expect(pinData.rarity.value).to.equal(pin.rarity.value);
        expect(pinData.rarity.name).to.equal(pin.rarity.name);
        expect(pinData.rarity.color).to.equal(pin.rarity.color);
    });

    describe("Skin search", function(){
        const skinMap = new Map<string, typeof allSkins[number]["skins"][number]>();

        before(function(){
            for (let i = 0; i < allSkins.length; i++){
                for (let j = 0; j < allSkins[i].skins.length; j++){
                    skinMap.set(allSkins[i].skins[j].name, allSkins[i].skins[j]);
                }
            }
        });

        it("Checking a search result", function(){
            const data = skinMap.get("bulldudebarbking")!;
            const results = skinSearch(allSkins, {query: "Barbarian King Bull"});
            const resultData = results.find((value) => value.name === "bulldudebarbking")!;
            expect(data !== undefined && resultData !== undefined).to.be.true;

            expect(data.groups).to.have.lengthOf.at.least(1);
            expect(resultData).to.be.an("object");
            expect(resultData).to.have.keys(["name", "brawler", "displayName", "image", "background"]);

            expect(resultData.name).to.equal(data.name);
            expect(resultData.brawler).to.equal("bull");
            expect(resultData.displayName).to.equal(data.displayName);
            // Image directory is intentionally not included here to reduce the object size for large searches
            expect(resultData.image).to.equal(data.image);
            expect(resultData.background).to.equal(data.groups[0].image);
        });

        it("No filters", function(){
            // When searching with no filters, all non-default skins should be returned
            let skinCount = 0;
            for (let x = 0; x < allSkins.length; x++){
                skinCount += allSkins[x].skins.length;
                if (allSkins[x].defaultSkin !== "" && allSkins[x].skins.length > 0){
                    skinCount -= 1;
                }
            }
            const results = skinSearch(allSkins, {});
            expect(results).to.have.lengthOf(skinCount);
        });

        it("Skin rarity", function(){
            const results = skinSearch(allSkins, {rarity: 2});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.rarity.value === 2;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Minimum cost", function(){
            const results = skinSearch(allSkins, {minCost: 149});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.cost >= 149;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Maximum cost", function(){
            const results = skinSearch(allSkins, {maxCost: 149});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.cost <= 149;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Single skin group", function(){
            const results = skinSearch(allSkins, {groups: ["Brawl Pass"]});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.groups.find(
                    (group) => group.name === "Brawl Pass"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Multiple skin groups", function(){
            const results = skinSearch(allSkins, {groups: ["Brawl Pass", "True Gold"]});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.groups.find(
                    (group) => group.name === "Brawl Pass" || group.name === "True Gold"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Skin rewarded from", function(){
            const results = skinSearch(allSkins, {foundIn: "Monster Eggs"});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.foundIn.find(
                    (reward) => reward === "Monster Eggs"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Available for Bling", function(){
            const results1 = skinSearch(allSkins, {bling: true});
            const filtered1 = results1.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.costBling > 0;
            });
            expect(results1.length).to.equal(filtered1.length);

            const results2 = skinSearch(allSkins, {bling: false});
            const filtered2 = results2.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.costBling <= 0;
            });
            expect(results2.length).to.equal(filtered2.length);
        });

        it("Limited skins", function(){
            const results1 = skinSearch(allSkins, {limited: true});
            const filtered1 = results1.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.limited === true;
            });
            expect(results1.length).to.equal(filtered1.length);

            const results2 = skinSearch(allSkins, {limited: false});
            const filtered2 = results2.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.limited === false;
            });
            expect(results2.length).to.equal(filtered2.length);
        });

        it("Start release date", function(){
            const results = skinSearch(allSkins, {startDate: {month: 7, year: 2022}});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.release.year * 12 + data.release.month >= 2022 * 12 + 7;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("End release date", function(){
            const results = skinSearch(allSkins, {endDate: {month: 7, year: 2022}});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.release.year * 12 + data.release.month <= 2022 * 12 + 7;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Search query", function(){
            const query = "Bull";
            const results = skinSearch(allSkins, {query: query});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.displayName.includes(query);
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Maximum cost less than minimum cost", function(){
            const results = skinSearch(allSkins, {minCost: 149, maxCost: 79});
            expect(results).to.have.lengthOf(0);
        });

        it("End date before start date", function(){
            const results = skinSearch(allSkins, {
                startDate: {month: 7, year: 2023},
                endDate: {month: 7, year: 2022}
            });
            expect(results).to.have.lengthOf(0);
        });
    });
});
