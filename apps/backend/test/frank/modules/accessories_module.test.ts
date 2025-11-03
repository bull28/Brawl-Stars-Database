import {expect} from "chai";
import accessoryList from "../../../frank/data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, ACCESSORY_IMAGE_DIR} from "../../../frank/data/constants";
import {getAccessoryPreview, getAccessoryData, getShopItems, accessoryClaimCost} from "../../../frank/modules/accessories_module";

describe("Accessories module", function(){
    it("Must contain exactly 88 accessories", function(){
        expect(accessoryList).to.have.lengthOf(88);
    });

    it("Get the preview for an accessory", function(){
        const accessory = accessoryList[0];
        const preview = getAccessoryPreview(accessory.name)!;

        expect(preview).to.be.an("object");
        expect(preview).to.have.keys(["displayName", "image", "description"]);
        expect(preview.displayName).to.equal(accessory.displayName);
        expect(preview.image).to.equal(`${ACCESSORY_IMAGE_DIR}accessory_${accessory.name}${IMAGE_FILE_EXTENSION}`);
        expect(preview.description).to.include(accessory.description);

        expect(getAccessoryPreview("not an accessory")).to.be.undefined;
    });

    it("Get all accessories that can be bought with coins", function(){
        const userAccessories = accessoryList.map((value) => ({name: value.name, badges: 0, unlocked: false}));
        const items = getShopItems(userAccessories, 19999999);
        expect(items).to.be.an("array");
        expect(items[0]).to.be.an("object");
        expect(items[0]).to.have.keys(["name", "displayName", "image", "cost"]);

        // Should filter out accessories that cannot be bought at the current mastery level
        const items2 = getShopItems(userAccessories, 20000000);
        expect(items2).to.have.lengthOf(items.length + 1);
    });

    it("Determine the cost of claiming or buying an accessory", function(){
        let index = 0;
        let shopIndex = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        const s = accessoryList.findIndex((value) => value.name.includes("shop"));
        if (i > 0){
            index = i;
        }
        if (s > 0){
            shopIndex = s;
        }

        const accessory = accessoryList[index];
        const shopItem = accessoryList[shopIndex];

        // Not enough badges, not claimed yet
        expect(accessoryClaimCost({name: accessory.name, badges: 0, unlocked: false}, 0)).to.equal(-1);

        // Not enough badges, already claimed
        expect(accessoryClaimCost({name: accessory.name, badges: 0, unlocked: true}, 0)).to.equal(0);

        // Enough badges, not claimed yet
        expect(accessoryClaimCost({name: accessory.name, badges: accessory.badges, unlocked: false}, 0)).to.equal(0);

        // Enough badges, already claimed
        expect(accessoryClaimCost({name: accessory.name, badges: accessory.badges, unlocked: true}, 0)).to.equal(0);

        // Accessory does not exist
        expect(accessoryClaimCost({name: "not an accessory", badges: 69, unlocked: false}, 0)).to.equal(-1);

        if (index === shopIndex){
            // No shop items exist;
            return;
        }

        // Shop item exists, mastery too low, not enough badges, not claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: 0, unlocked: false}, 0)).to.equal(-1);

        // Shop item exists, mastery too low, not enough badges, already claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: 0, unlocked: true}, 0)).to.equal(0);

        // Shop item exists, mastery too low, enough badges, not claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: shopItem.badges, unlocked: false}, 0)).to.equal(0);

        // Shop item exists, mastery too low, enough badges, already claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: shopItem.badges, unlocked: true}, 0)).to.equal(0);

        // Shop item exists, mastery high enough, not enough badges, not claimed (only case where coins can be spent)
        expect(accessoryClaimCost({name: shopItem.name, badges: 0, unlocked: false}, 20000000)).to.be.at.least(1);

        // Shop item exists, mastery high enough, not enough badges, already claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: 0, unlocked: true}, 20000000)).to.equal(0);

        // Shop item exists, mastery high enough, enough badges, not claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: shopItem.badges, unlocked: false}, 20000000)).to.equal(0);

        // Shop item exists, mastery high enough, enough badges, already claimed
        expect(accessoryClaimCost({name: shopItem.name, badges: shopItem.badges, unlocked: true}, 20000000)).to.equal(0);
    });

    describe("Get the full data for an accessory", function(){
        // Test with an accessory that requires more than 1 badge to unlock (if such an accessory exists)
        let index = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        if (i > 0){
            index = i;
        }

        const accessory = accessoryList[index];
        const someProgress = Math.floor(accessory.badges / 2);
        const fullProgress = accessory.badges;

        it("No badge progress and accessory locked", function(){
            const data = getAccessoryData([]);
            expect(data).to.be.an("array");
            expect(data).to.have.lengthOf(accessoryList.length);
            expect(data[index]).to.have.keys(["name", "category", "displayName", "image", "description", "unlocked", "badge"]);
            expect(data[index].badge).to.have.keys(["collected", "required", "unlockMethod"]);

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
            const data = getAccessoryData([{name: accessory.name, badges: someProgress, unlocked: false}]);
            expect(data[index].unlocked).to.be.false;
            expect(data[index].badge.collected).to.equal(someProgress);
        });

        it("Some badge progress but accessory already unlocked", function(){
            const data = getAccessoryData([{name: accessory.name, badges: someProgress, unlocked: true}]);
            expect(data[index].unlocked).to.be.true;
            expect(data[index].badge.collected).to.equal(someProgress);
        });

        it("Full badge progress and accessory unlocked", function(){
            const data = getAccessoryData([{name: accessory.name, badges: fullProgress, unlocked: true}]);
            expect(data[index].unlocked).to.be.true;
            expect(data[index].badge.collected).to.equal(fullProgress);
            expect(data[index].badge.collected).to.equal(data[index].badge.required);
        });
    });
});
