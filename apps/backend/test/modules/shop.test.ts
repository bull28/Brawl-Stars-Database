import {expect} from "chai";
import allSkins from "../../bull/data/brawlers_data.json";
import shopItemsObject from "../../bull/data/coinsshop_data.json";
import {getAllItems, getAllItemsPreview, refreshFeaturedItem, getAchievementItems} from "../../bull/modules/shop";
import {UserResources, AchievementItems} from "../../bull/types";

const featuredItemMatch = new RegExp(/^[a-z0-9]+\/[a-z0-9_]+$/);
const bullMatch = new RegExp(/^bull\/[a-z0-9_]+$/);
const testCollection = {
    unlockedBrawlers: 0,
    completedBrawlers: 0,
    totalBrawlers: allSkins.length,
    unlockedPins: 0,
    totalPins: allSkins.length * 10,
    pinCopies: 0,
    unlockedAccessories: 0,
    totalAccessories: 80,
    collectionScore: "",
    scoreProgress: 0,
    avatarColor: "#000000",
    pinRarityColors: [],
    brawlers: [],
    accessories: []
};

describe("Shop module", function(){
    it("Get all available shop items", function(){
        const testResources: UserResources = {
            brawlers: {"bull": {}},
            avatars: [],
            themes: [],
            scenes: [],
            accessories: [],
            wild_card_pins: [],
            tokens: 0,
            token_doubler: 0,
            coins: 0,
            points: 0,
            trade_credits: 0
        };
        const achievement: AchievementItems = {
            avatars: new Set(),
            themes: new Set(),
            scenes: new Set(),
            accessories: new Set()
        };

        const defaultItems: string[] = [];
        const achievementItems: string[] = [];
        let buyItem = ["", ""];
        const itemsEntries = Object.entries(shopItemsObject).map((value) => [value[0], value[1].itemType, value[1].extraData]);
        for (let x = 0; x < itemsEntries.length; x++){
            if (itemsEntries[x][1].startsWith("achievement") === true){
                achievementItems.push(itemsEntries[x][0]);
            } else{
                defaultItems.push(itemsEntries[x][0]);
            }

            if (itemsEntries[x][1] === "achievementAvatar"){
                achievement.avatars.add(itemsEntries[x][2]);
            } else if (itemsEntries[x][1] === "achievementTheme"){
                achievement.themes.add(itemsEntries[x][2]);
            } else if (itemsEntries[x][1] === "achievementScene"){
                achievement.scenes.add(itemsEntries[x][2]);
            } else if (itemsEntries[x][1] === "achievementAccessory"){
                achievement.accessories.add(itemsEntries[x][2]);
                if (buyItem[0] === ""){
                    buyItem = [itemsEntries[x][0], itemsEntries[x][2]];
                }
            }
        }

        // All items that exist should be available
        const items1 = Array.from(getAllItems(testResources, testCollection, achievement, "bull/bull_default")).map((value) => value[0]);
        const preview1 = getAllItemsPreview(testResources, testCollection, achievement, "bull/bull_default").map((value) => value.name);
        expect(items1).to.include.members(defaultItems);
        expect(items1).to.include.members(achievementItems);
        expect(preview1).to.be.an("array").that.has.members(items1);

        // Once a cosmetic item is bought, it should no longer be available
        testResources.accessories.push(buyItem[1]);
        const items2 = Array.from(getAllItems(testResources, testCollection, achievement, "bull/bull_default")).map((value) => value[0]);
        expect(items2).to.not.include(buyItem[0]);
    });

    it("Select a new featured pin, given a user's collection", function(){
        // No brawlers unlocked, no pins available
        expect(refreshFeaturedItem({})).to.equal("");

        // All brawlers unlocked, all pins available
        const testBrawlers1 = Object.fromEntries(allSkins.map((value) => [value.name, {}]));
        expect(refreshFeaturedItem(testBrawlers1)).to.match(featuredItemMatch);

        // Only bull unlocked, all pins available
        const testBrawlers2 = {"bull": {}};
        expect(refreshFeaturedItem(testBrawlers2)).to.match(bullMatch);

        // All brawlers unlocked except frank, all pins unlocked except bull_default
        const testBrawlers3 = Object.fromEntries(
            allSkins.filter((value) => value.name !== "frank")
            .map((value) => [
                value.name,
                Object.fromEntries(value.pins.filter((pin) => pin.name !== "bull_default").map((pin) => [pin.name, 1]))
            ])
        );
        // bull_default is the only pin the collection is missing
        expect(refreshFeaturedItem(testBrawlers3)).to.equal("bull/bull_default");
    });

    it("Determine the correct tiered avatar, given a user's collection", function(){
        const testResources: UserResources = {
            brawlers: {},
            avatars: [],
            themes: [],
            scenes: [],
            accessories: [],
            wild_card_pins: [],
            tokens: 0,
            token_doubler: 0,
            coins: 0,
            points: 0,
            trade_credits: 0
        };

        // collection_01 should be offered
        const items1 = getAchievementItems(testResources, testCollection, 60, 1);
        expect(items1.avatars).to.be.a("set").that.includes("collection_01");

        // Up to collection_03 is available but only collection_01 has been collected so only offer collection_02
        testResources.avatars.push("collection_01");
        const items2 = getAchievementItems(testResources, testCollection, 1200, 1);
        expect(items2.avatars).to.be.a("set").that.includes("collection_02");
        expect(items2.avatars).to.not.include("collection_03");
    });
});
