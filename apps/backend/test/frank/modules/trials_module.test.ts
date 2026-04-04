import {expect} from "chai";
import accessoryList from "../../../frank/data/accessories_data.json";
import characterList from "../../../frank/data/characters_data.json";
import itemList from "../../../frank/data/trials_items_data.json";
import {trialStates, allTrials, allCharacters, allRarities, allBoxes, trialUpgrades, spriteConfig} from "../../../frank/data/trials_data";
import {IMAGE_FILE_EXTENSION, TRIAL_IMAGE_DIR} from "../../../frank/data/constants";
import {REPORT_FORMAT} from "../../../frank/modules/report_module";
import {offsets, getTrialList, getTrialPreview, getTrialDisplay, startTrial, selectItems, buyItem, sellItem, addFinalReward, openBrawlBox, getAvailableBoxes, getNextChallenge, saveChallengeReport} from "../../../frank/modules/trials_module";
import {sampleGameReport, generateSampleTrial} from "../database_setup";

const {characterOffset, accessoryOffset, powerupOffset} = offsets;

const resources = {
    mastery: 20000000,
    coins: 0,
    characters: [
        {name: characterList[0].name, tier: 0x600},
        {name: characterList[1].name, tier: 0x601}
    ],
    accessories: [
        {name: accessoryList[0].name, badges: 0, unlocked: true},
        {name: accessoryList[1].name, badges: 0, unlocked: false},
        {name: accessoryList[2].name, badges: 0, unlocked: true}
    ],
    last_save: 0,
    menu_theme: "retropolis"
};

describe("Trials module", function(){
    it("Get the list of all challenges", function(){
        const trials = getTrialList();
        expect(trials).to.be.an("array");
        expect(trials).to.have.lengthOf(allTrials.length);

        expect(trials).to.eql(allTrials.map((value) => ({
            displayName: value.displayName, challenges: value.challenges.length
        })));
    });

    it("Get the preview object for a trial", function(){
        const trial = generateSampleTrial();

        const selected = {
            character: trial.selected,
            tokensUsed: 14,
            accessories: [1, 4, 5],
            powerups: [0, 2]
        };

        for (let x = 0; x < selected.accessories.length; x++){
            trial.accessories[selected.accessories[x]] = 0x8101;
        }
        for (let x = 0; x < selected.powerups.length; x++){
            trial.powerups[selected.powerups[x]] = 0x8101;
        }

        const preview = getTrialPreview(trial);

        expect(preview).to.have.keys([
            "state", "displayName", "progress", "scores", "resources",
            "selected", "characters", "accessories", "powerups", "brawlBoxes"
        ]);

        expect(preview.state).to.equal(trial.state);
        expect(preview.displayName).to.equal(allTrials[trial.trialid].displayName);
        expect(preview.progress).to.equal(trial.progress);
        expect(preview.resources).to.eql(trial.resources);

        expect(preview.accessories).to.eql(trial.accessories.map((value) => value & 127));
        expect(preview.powerups).to.eql(trial.powerups.map((value) => value & 127));
        expect(preview.scores).to.eql(trial.scores);

        expect(preview.characters).to.eql(trial.characterBuilds.map((value) => ({
            index: value >> 12, gears: value & 127,
            starPowers: (value >> 8) & 7, accessory: ((value >> 11) & 1) === 1
        })));

        expect(preview.selected).to.eql(selected);
    });

    it("Get the display object for a trial", function(){
        const trial = generateSampleTrial();

        const display = getTrialDisplay(trial);

        expect(display).to.have.keys([
            "sprites", "builds", "rarities", "challenges", "resources",
            "characters", "accessories", "powerups", "brawlBoxes"
        ]);

        expect(display.sprites).to.eql({
            image: TRIAL_IMAGE_DIR + spriteConfig.imageFile + IMAGE_FILE_EXTENSION, rowSize: spriteConfig.rowSize
        });

        expect(display.builds).to.eql({
            gears: {sprite: spriteConfig.gearIndex, count: 7},
            starPowers: {sprite: spriteConfig.starPowerIndex, count: 3}
        });

        expect(display.rarities).to.eql(allRarities);

        const challenges = allTrials[trial.trialid].challenges;
        expect(display.challenges).to.eql(challenges.map((value) => ({
            displayName: value.displayName, stages: value.enemyStats.length
        })));

        expect(display.resources).to.be.an("array");
        expect(display.resources).to.have.lengthOf(4);
        expect(display.resources[0]).to.eql({
            key: "power", displayName: "Power Points", sprite: spriteConfig.powerPointsIndex
        });
        expect(display.resources[1]).to.eql({
            key: "gears", displayName: "Gear Scrap", sprite: spriteConfig.gearScrapIndex
        });
        expect(display.resources[2]).to.eql({
            key: "accessories", displayName: "Accessory Tokens", sprite: spriteConfig.accessoryTokenIndex
        });
        expect(display.resources[3]).to.eql({
            key: "credits", displayName: "Credits", sprite: spriteConfig.creditsIndex
        });

        expect(display.characters).to.be.an("array");
        expect(display.characters).to.have.lengthOf(trial.characterTiers.length);
        for (let x = 0; x < display.characters.length; x++){
            expect(display.characters[x].sprite).to.equal(spriteConfig.characterIndex + x);
            expect(display.characters[x].accessoryIndex).to.equal(allCharacters[x].accsItemIndex);
        }

        const map = new Map(accessoryList.map((value, index) => [value.name, index]));
        const accessories = itemList.slice(accessoryOffset, accessoryOffset + trial.accessories.length);
        expect(display.accessories).to.eql(accessories.map((value) => ({
            displayName: value.displayName, description: value.description,
            sprite: spriteConfig.accessoryIndex + (map.get(value.key) ?? 0), rarity: value.rarity, cost: value.cost
        })));

        const powerups = itemList.slice(powerupOffset, powerupOffset + trial.powerups.length);
        expect(display.powerups).to.eql(powerups.map((value) => ({
            displayName: value.displayName, description: value.description,
            sprite: spriteConfig.powerupIndex + value.index, rarity: value.rarity
        })));

        expect(display.brawlBoxes).to.eql(allBoxes.map((value) => ({
            displayName: value.displayName, description: value.description,
            image: TRIAL_IMAGE_DIR + value.image + IMAGE_FILE_EXTENSION
        })));
    });

    it("Create a new trial object", function(){
        const trial = startTrial(1, resources)!;
        const sample = generateSampleTrial();

        expect(trial.trialid).to.equal(1);
        expect(trial.state).to.equal(trialStates.TRIAL_REWARD);
        expect(trial.rewards.specialBoxes).to.equal(1);
        expect(trial.characterTiers).to.have.lengthOf(sample.characterTiers.length);
        expect(trial.accessories).to.have.lengthOf(sample.accessories.length);
        expect(trial.powerups).to.have.lengthOf(sample.powerups.length);
    });

    it("Mark items as selected in a trial", function(){
        const trial = generateSampleTrial();

        const owned = [2, 5, 6, 8, 10, 16, 17, 19, 25, 28];
        const owned2 = [1, 3, 9];
        for (let x = 0; x < owned.length; x++){
            trial.accessories[owned[x]] = 0x0081;
        }
        for (let x = 0; x < owned2.length; x++){
            trial.powerups[owned2[x]] = 0x0081;
        }

        // Valid selection
        const selected = [2, 5, 6, 8];
        const selected2 = [3];
        const success = selectItems(trial, 1, selected, selected2);

        expect(success).to.be.true;
        expect(trial.selected).to.equal(1);
        for (let x = 0; x < owned.length; x++){
            const value = selected.includes(owned[x]) === true ? 0x8081 : 0x0081;
            expect(trial.accessories[owned[x]]).to.equal(value);
        }
        for (let x = 0; x < owned2.length; x++){
            const value = selected2.includes(owned2[x]) === true ? 0x8081 : 0x0081;
            expect(trial.powerups[owned2[x]]).to.equal(value);
        }

        // Partially invalid selection
        const trial2 = generateSampleTrial();
        for (let x = 0; x < owned.length; x++){
            trial2.accessories[owned[x]] = 0x0081;
        }
        for (let x = 0; x < owned2.length; x++){
            trial2.powerups[owned2[x]] = 0x0081;
        }
        const before = trial2.accessories.slice();

        expect(selectItems(trial2, 1, owned, selected2)).to.be.false;
        expect(trial2.accessories).to.eql(before);

        expect(selectItems(trial2, 1, [1], selected2)).to.be.false;
        expect(trial2.accessories).to.eql(before);

        expect(selectItems(trial2, 1, [999], selected2)).to.be.false;
        expect(trial2.accessories).to.eql(before);
    });

    it("Buy an item in a trial", function(){
        const trial = generateSampleTrial();
        const builds = trial.characterBuilds.length;
        let credits = 10000;
        trial.resources.credits = credits;

        expect(buyItem(trial, "accessory", 0)).to.be.true;
        credits -= allRarities[itemList[accessoryOffset].rarity].buyCost;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.accessories[0]).to.equal(0x0081);

        expect(buyItem(trial, "character", 1)).to.be.true;
        credits -= allRarities[itemList[characterOffset + 1].rarity].buyCost;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.characterBuilds).to.have.lengthOf(builds + 1);
        expect(trial.characterBuilds[builds] >> 12).to.equal(1);

        expect(buyItem(trial, "accessory", 999)).to.be.false;
        expect(buyItem(trial, "not an item type", 0)).to.be.false;

        trial.resources.credits = 1;
        expect(buyItem(trial, "accessory", 1)).to.be.false;
        expect(trial.accessories[1]).to.equal(0);
        expect(trial.resources.credits).to.equal(1);
    });

    it("Sell an item in a trial", function(){
        const trial = generateSampleTrial();
        const builds = trial.characterBuilds.length;
        let credits = 0;
        trial.resources.credits = credits;

        trial.characterBuilds.push(0x3000);
        trial.accessories[0] = 0x0081;
        trial.accessories[1] = 0x8081;
        trial.accessories[2] = 0x0180;

        expect(sellItem(trial, "accessory", 0)).to.be.true;
        credits += allRarities[itemList[accessoryOffset].rarity].sellCost;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.accessories[0]).to.equal(0x0080);

        expect(sellItem(trial, "accessory", 1)).to.be.true;
        credits += allRarities[itemList[accessoryOffset + 1].rarity].sellCost;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.accessories[1]).to.equal(0x0080);

        expect(sellItem(trial, "character", builds)).to.be.true;
        credits += allRarities[itemList[characterOffset + 3].rarity].sellCost;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.characterBuilds).to.have.lengthOf(builds);

        expect(sellItem(trial, "accessory", 2)).to.be.false;
        expect(trial.resources.credits).to.equal(credits);
        expect(trial.accessories[2]).to.equal(0x0180);

        expect(sellItem(trial, "accessory", 999)).to.be.false;
        expect(sellItem(trial, "not an item type", 0)).to.be.false;
    });

    it("Get the final reward for a trial", function(){
        const trial = generateSampleTrial();

        trial.rewards.mastery = 60;
        let totalScore = 0;
        for (let x = 0; x < trial.scores.length; x++){
            trial.scores[x] = 500;
            totalScore += 500;
        }
        trial.progress = trial.scores.length;
        trial.state = trialStates.TRIAL_COMPLETE;

        const initialResources = {
            mastery: 0, coins: 0,
            characters: [],
            accessories: [{name: "trials", badges: 0, unlocked: false}],
            last_save: 0, menu_theme: ""
        };

        const reward = addFinalReward(trial, initialResources);

        expect(reward).to.equal(
            (totalScore - 300 * trial.scores.length) * allTrials[trial.trialid].baseMastery * 160 / 100
        );
        expect(initialResources.mastery).to.equal(reward);
        expect(initialResources.accessories[0].badges).to.equal(1);

        trial.progress = 0;
        expect(addFinalReward(trial, initialResources)).to.equal(0);
        expect(initialResources.mastery).to.equal(reward);
        expect(initialResources.accessories[0].badges).to.equal(1);
    });

    it("Open a Brawl Box in a trial", function(){
        const trial = generateSampleTrial();
        trial.state = trialStates.TRIAL_REWARD;
        trial.rewards.specialBoxes = 0xffff;

        const box = allBoxes[1];
        let items = box.baseQuality;
        items += ((trial.rewards.lastScore - 300) * box.scoreQuality / 300);
        items += trial.progress * box.progressQuality;
        items = Math.floor(items * (100 + trial.rewards.quality) / 100);
        items += box.guaranteed.length;

        const rewards = openBrawlBox(trial, 1);
        expect(rewards).to.have.lengthOf(items);

        for (let x = 0; x < rewards.length; x++){
            expect(rewards[x]).to.have.keys(["displayName", "image", "type", "rarity", "count"]);
        }

        trial.state = trialStates.TRIAL_READY;
        trial.rewards.specialBoxes = 0xffff;
        expect(openBrawlBox(trial, 1)).to.have.lengthOf(0);

        trial.state = trialStates.TRIAL_REWARD;
        trial.rewards.specialBoxes = 0;
        expect(openBrawlBox(trial, 1)).to.have.lengthOf(0);
    });

    it("Get the list of available Brawl Boxes in a trial", function(){
        const trial = generateSampleTrial();
        trial.state = trialStates.TRIAL_REWARD;
        trial.rewards.specialBoxes = 0xffff;

        const boxes = getAvailableBoxes(trial);
        expect(boxes.length).to.equal(allBoxes.length);

        trial.rewards.specialBoxes = 1;
        const boxes2 = getAvailableBoxes(trial);
        expect(boxes2).to.have.lengthOf(1);
        expect(boxes2[0].index).to.equal(0);

        trial.rewards.specialBoxes = 0;
        expect(getAvailableBoxes(trial)).to.have.lengthOf(0);

        trial.state = trialStates.TRIAL_READY;
        trial.rewards.specialBoxes = 0xffff;
        expect(getAvailableBoxes(trial)).to.have.lengthOf(0);
    });

    it("Get the next challenge in a trial", function(){
        const trial = generateSampleTrial();
        trial.progress = 2;
        trial.selected = 2;

        const selected = [2, 5, 6, 8];
        for (let x = 0; x < selected.length; x++){
            trial.accessories[selected[x]] = 0x8081;
        }

        const trialConfig = allTrials[trial.trialid];
        const challengeConfig = trialConfig.challenges[trial.progress];
        const character = trial.characterBuilds[trial.selected];
        const characterIndex = character >> 12;

        const challenge = getNextChallenge(trial, "key", resources, {playerSkins: ["mandy_lava"]})!;

        const options = challenge.options!;
        expect(options.key).to.equal("key");
        expect(options.gameMode).to.equal(3);
        expect(options.gameName).to.equal(challengeConfig.displayName);
        expect(options.menuTheme).to.equal(resources.menu_theme);
        expect(options.autoSelect).to.be.true;
        expect(options.upgradesAtStart).to.be.true;

        const unlocks = challenge.unlocks!;
        expect(unlocks.startingPower).to.equal(trial.resources.power);
        expect(unlocks.startingGears).to.equal(trial.resources.gears);
        expect(unlocks.startingHyper).to.equal(trial.resources.hyper);
        expect(unlocks.gears).to.equal(character & 127);
        expect(unlocks.starPowers).to.equal((character >> 8) & 7);

        const difficulty = challenge.difficulties![0];
        expect(difficulty.name).to.equal(trialConfig.displayName);
        expect(difficulty.strengthTier).to.equal(trialConfig.difficulty.strengthTier);
        expect(difficulty.healthBonusReq).to.equal(trialConfig.difficulty.healthBonusReq);
        expect(difficulty.timePerEnemy).to.equal(trialConfig.difficulty.timePerEnemy);

        expect(challenge.stages).to.have.lengthOf(challengeConfig.enemyStats.length);
        expect(challenge.levels).to.have.lengthOf(challengeConfig.enemyStats.length);

        const keys = selected.map((value) => itemList[accessoryOffset + value].key);
        if (((character >> 11) & 1) === 1){
            keys.push(accessoryList[allCharacters[characterIndex].ingameIndex].name);
        }
        const playerAccessories = challenge.playerAccessories!;
        for (let x = 0; x < accessoryList.length; x++){
            const value = keys.includes(accessoryList[x].name) === true ? 1 : 0;
            expect((playerAccessories[x >> 3] >> (x & 7)) & 1).to.equal(value);
        }

        const characterName = allCharacters[characterIndex].name;
        const playerUpgradeTiers = challenge.playerUpgradeTiers!;
        for (const x in playerUpgradeTiers){
            const value = x === characterName ? trial.characterTiers[characterIndex] : -1;
            expect(playerUpgradeTiers[x]).to.equal(value);
        }

        const playerUpgradeValues = challenge.playerUpgradeValues!;
        for (const x in playerUpgradeValues){
            const key = x as keyof typeof playerUpgradeValues;
            const v = playerUpgradeValues[key]!;
            expect(v.maxLevel).to.equal(trialUpgrades[key].maxLevel - trial.upgrades[key]);
            expect(v.value![0]).to.equal(trialUpgrades[key].value[0] + trialUpgrades[key].value[1] * trial.upgrades[key]);
            expect(v.value![1]).to.equal(trialUpgrades[key].value[1]);
            expect(v.cost!.length).to.equal(v.maxLevel);
        }

        expect(challenge.playerSkins).to.eql(["mandy_lava"]);

        expect(trial.state).to.equal(trialStates.TRIAL_PLAYING);
    });

    it("Update a trial after saving a challenge report", function(){
        const trial = generateSampleTrial();
        trial.progress = 1;
        trial.scores[0] = 500;
        trial.accessories[0] = 0x8081;
        trial.accessories[1] = 0x8102;
        trial.powerups[0] = 0x8081;

        const initialUpgrades = Object.values(trial.upgrades);
        const builds = trial.characterBuilds.slice();
        builds.splice(trial.selected, 1);

        const format = REPORT_FORMAT;
        const report = sampleGameReport.slice();

        report[format.player[0]] = 501;

        const scores = [300, 180, 0, 21, 0, 0];
        const perfect = 3;
        for (let x = 0; x < scores.length; x++){
            report[format.score[0] + x] = scores[x];
        }
        report[format.achievements[0]] = perfect;

        const trialResources = [50, 10, 40];
        for (let x = 0; x < trialResources.length; x++){
            report[format.resources[0] + x] = trialResources[x];
        }

        const upgrades = [2, 0, 1, 0, 3, 1, 1, 0];
        for (let x = 0; x < upgrades.length; x++){
            report[format.upgrades[0] + x] = upgrades[x];
        }

        const result = saveChallengeReport(trial, report);
        expect(result).to.eql({mastery: 1.5, coins: 2, badges: 6});

        expect(trial.progress).to.equal(2);
        expect(trial.scores[1]).to.equal(report[format.player[0]] + 50);
        expect(trial.rewards.lastScore).to.equal(report[format.player[0]]);
        expect(trial.rewards.specialBoxes).to.equal(6);
        expect(trial.resources.power).to.equal(trialResources[0]);
        expect(trial.resources.gears).to.equal(trialResources[1]);
        expect(trial.resources.hyper).to.equal(trialResources[2]);

        const keys = Object.keys(trial.upgrades) as (keyof typeof trial.upgrades)[];
        for (let x = 0; x < keys.length; x++){
            expect(trial.upgrades[keys[x]]).to.equal(initialUpgrades[x] + upgrades[x]);
        }

        expect(trial.characterBuilds).to.eql(builds);
        expect(trial.accessories[0]).to.equal(0x0080);
        expect(trial.accessories[1]).to.equal(0x0101);
        expect(trial.powerups[0]).to.equal(0x0080);
    });
});
