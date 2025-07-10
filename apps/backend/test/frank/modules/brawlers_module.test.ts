import {expect} from "chai";
import allSkins from "../../../frank/data/brawlers_data.json";
import skinGroups from "../../../frank/data/skingroups_data.json";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, MASTERY_ICON_DIR, REWARD_IMAGE_DIR} from "../../../frank/data/constants";
import {rarities, getBrawler, getSkin, getBrawlerData, getSkinData, skinSearch} from "../../../frank/modules/brawlers_module";

describe("Brawlers and Skins module", function(){
    it("Must contain exactly 94 brawlers", function(){
        expect(allSkins).to.have.lengthOf(94);
    });

    it("Get brawler and skin objects directly from the data file", function(){
        expect(getBrawler("NOT BULL")).to.be.undefined;

        // Surely they don't remove bull from the game...
        const data = getBrawler("bull")!;
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
            "features", "groups", "limited", "unlock", "foundIn", "release", "rating", "image"
        ]);
        expect(skinData.cost).to.have.keys(["amount", "currency", "icon"]);
        expect(skinData.costBling).to.have.keys(["amount", "currency", "icon"]);
        expect(skinData.rarity).to.have.keys(["value", "name", "icon"]);
        expect(skinData.release).to.have.keys(["month", "year"]);

        expect(skinData.name).to.equal(skin.name);
        expect(skinData.displayName).to.equal(skin.displayName);
        expect(skinData.cost.amount).to.equal(skin.cost);
        expect(skinData.costBling.amount).to.equal(skin.costBling);

        expect(skinData.rarity.value).to.equal(rarities.skins[skin.rarity].value);
        expect(skinData.rarity.name).to.equal(rarities.skins[skin.rarity].name);
        if (rarities.skins[skin.rarity].icon !== ""){
            expect(skinData.rarity.icon).to.equal(REWARD_IMAGE_DIR + rarities.skins[skin.rarity].icon + IMAGE_FILE_EXTENSION);
        } else{
            expect(skinData.rarity.icon).to.equal("");
        }

        expect(skinData.requires).to.equal(skin.requires);
        expect(skinData.limited).to.equal(skin.limited);
        expect(skinData.unlock).to.equal(skin.unlock);
        expect(skinData.foundIn).to.equal(skin.foundIn);
        expect(skinData.release.month).to.equal(skin.release[1]);
        expect(skinData.release.year).to.equal(skin.release[0]);
        expect(skinData.rating).to.equal(skin.rating);
        expect(skinData.image).to.equal(`${SKIN_IMAGE_DIR}${brawler.name}/${skin.name}${IMAGE_FILE_EXTENSION}`);
        expect(skinData.features).to.be.an("array");

        expect(skinData.groups).to.be.an("array");
        expect(skinData.groups).to.have.lengthOf(skin.groups.length);
        for (let x = 0; x < skinData.groups.length; x++){
            expect(skinData.groups[x].name).to.equal(skinGroups[skin.groups[x]].name);
            expect(skinData.groups[x].image).to.equal(SKINGROUP_IMAGE_DIR + skinGroups[skin.groups[x]].image + IMAGE_FILE_EXTENSION);
            expect(skinData.groups[x].icon).to.equal(SKINGROUP_ICON_DIR + skinGroups[skin.groups[x]].icon + IMAGE_FILE_EXTENSION);
        }

        // Pins
        const pin = brawler.pins[0];
        const pinData = data.pins[0];
        expect(pinData).to.be.an("object");
        expect(pinData).to.have.keys(["image", "rarity"]);
        expect(pinData.rarity).to.have.keys(["value", "name", "color"]);

        expect(pinData.image).to.equal(`${PIN_IMAGE_DIR}${brawler.name}/${pin.name}${IMAGE_FILE_EXTENSION}`);
        expect(pinData.rarity.value).to.equal(rarities.pins[pin.rarity].value);
        expect(pinData.rarity.name).to.equal(rarities.pins[pin.rarity].name);
        expect(pinData.rarity.color).to.equal(rarities.pins[pin.rarity].color);
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
            const results = skinSearch({query: "Barbarian King Bull"});
            const resultData = results.find((value) => value.name === "bulldudebarbking")!;
            expect(data !== undefined && resultData !== undefined).to.be.true;

            expect(data.groups).to.have.lengthOf.at.least(1);
            expect(resultData).to.be.an("object");
            expect(resultData).to.have.keys(["name", "brawler", "displayName", "image", "background"]);

            expect(resultData.name).to.equal(data.name);
            expect(resultData.brawler).to.equal("bull");
            expect(resultData.displayName).to.equal(data.displayName);
            // Image directory is intentionally not included here to reduce the object size for large searches
            expect(resultData.image).to.equal(data.name + IMAGE_FILE_EXTENSION);
            expect(resultData.background).to.equal(skinGroups[data.groups[0]].image + IMAGE_FILE_EXTENSION);
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
            const results = skinSearch({});
            expect(results).to.have.lengthOf(skinCount);
        });

        it("Skin rarity", function(){
            const results = skinSearch({rarity: 2});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.rarity === 2;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Minimum cost", function(){
            const results = skinSearch({minCost: 149});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.cost >= 149;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Maximum cost", function(){
            const results = skinSearch({maxCost: 149});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.cost <= 149;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Single skin group", function(){
            const results = skinSearch({groups: ["Brawl Pass"]});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.groups.find(
                    (group) => skinGroups[group].name === "Brawl Pass"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Multiple skin groups", function(){
            const results = skinSearch({groups: ["Brawl Pass", "True Gold"]});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.groups.find(
                    (group) => skinGroups[group].name === "Brawl Pass" || skinGroups[group].name === "True Gold"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Skin rewarded from", function(){
            const results = skinSearch({foundIn: "Monster Eggs"});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.foundIn.find(
                    (reward) => reward === "Monster Eggs"
                ) !== undefined;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Available for Bling", function(){
            const results1 = skinSearch({bling: true});
            const filtered1 = results1.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.costBling > 0;
            });
            expect(results1.length).to.equal(filtered1.length);

            const results2 = skinSearch({bling: false});
            const filtered2 = results2.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.costBling <= 0;
            });
            expect(results2.length).to.equal(filtered2.length);
        });

        it("Limited skins", function(){
            const results1 = skinSearch({limited: true});
            const filtered1 = results1.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.limited === true;
            });
            expect(results1.length).to.equal(filtered1.length);

            const results2 = skinSearch({limited: false});
            const filtered2 = results2.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.limited === false;
            });
            expect(results2.length).to.equal(filtered2.length);
        });

        it("Start release date", function(){
            const results = skinSearch({startDate: {month: 7, year: 2022}});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.release[0] * 12 + data.release[1] >= 2022 * 12 + 7;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("End release date", function(){
            const results = skinSearch({endDate: {month: 7, year: 2022}});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.release[0] * 12 + data.release[1] <= 2022 * 12 + 7;
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Search query", function(){
            const query = "bull";
            const results = skinSearch({query: query});
            const filtered = results.filter((value) => {
                const data = skinMap.get(value.name);
                return data !== undefined && data.displayName.toLowerCase().includes(query);
            });
            expect(results.length).to.equal(filtered.length);
        });

        it("Maximum cost less than minimum cost", function(){
            const results = skinSearch({minCost: 149, maxCost: 79});
            expect(results).to.have.lengthOf(0);
        });

        it("End date before start date", function(){
            const results = skinSearch({
                startDate: {month: 7, year: 2023},
                endDate: {month: 7, year: 2022}
            });
            expect(results).to.have.lengthOf(0);
        });
    });
});
