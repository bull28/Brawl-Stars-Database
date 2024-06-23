import {expect} from "chai";
import allSkins from "../../bull/data/brawlers_data.json";
import {PORTRAIT_IMAGE_DIR, PIN_IMAGE_DIR, SKIN_IMAGE_DIR, SKINGROUP_ICON_DIR, SKINGROUP_IMAGE_DIR, MASTERY_IMAGE_DIR} from "../../bull/data/constants";
import {getBrawler, getSkin, getBrawlerData, getSkinData} from "../../bull/modules/skins";

describe("Brawlers and Skins module", function(){
    it("Must contain at least 80 brawlers", function(){
        expect(allSkins).to.have.lengthOf.at.least(80);
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
        expect(data.masteryIcon).to.equal(MASTERY_IMAGE_DIR + brawler.masteryIcon);

        // Skin
        const skin = brawler.skins[0];
        const skinData = getSkinData(brawler.skins[0], brawler.name);

        expect(skinData).to.be.an("object");
        expect(skinData).to.have.keys([
            "name", "displayName", "cost", "currency", "costBling", "requires",
            "features", "group", "limited", "rating", "image", "model"
        ]);
        expect(skinData.group).to.have.keys(["name", "image", "icon"]);
        expect(skinData.model).to.have.keys(["geometry", "winAnimation", "loseAnimation"]);

        expect(skinData.name).to.equal(skin.name);
        expect(skinData.displayName).to.equal(skin.displayName);
        expect(skinData.cost).to.equal(skin.cost);
        expect(skinData.currency).to.equal(skin.currency);
        expect(skinData.costBling).to.equal(skin.costBling);
        expect(skinData.requires).to.equal(skin.requires);
        expect(skinData.limited).to.equal(skin.limited);
        expect(skinData.rating).to.equal(skin.rating);
        expect(skinData.image).to.equal(`${SKIN_IMAGE_DIR}${brawler.name}/${skin.image}`);
        expect(skinData.features).to.be.an("array");

        expect(skinData.group.name).to.equal(skin.group.name);
        expect(skinData.group.image).to.equal(SKINGROUP_IMAGE_DIR + skin.group.image);
        expect(skinData.group.icon).to.equal(SKINGROUP_ICON_DIR + skin.group.icon);

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
});
