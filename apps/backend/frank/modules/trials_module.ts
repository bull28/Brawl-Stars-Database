import accessoryList from "../data/accessories_data.json";
import itemList from "../data/trials_items_data.json";
import {trialStates, allTrials, allCharacters, characterTiers, trialLevels, allRarities, allBoxes, guaranteedDraws, fallbackItems, gearWeights, starPowerWeights, trialUpgrades, spriteConfig} from "../data/trials_data";
import {getMasteryLevel} from "../modules/resources_module";
import {getGameMod} from "./challenges_module";
import {REPORT_FORMAT} from "./report_module";
import {RNG} from "./utils";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR, CURRENCY_IMAGE_DIR, ACCESSORY_IMAGE_DIR, TRIAL_IMAGE_DIR, TIER_IMAGE_DIR} from "../data/constants";
import {UserCharacter, UserResources, GameModUpgradeValues, ChallengeGameMod, UserSetGameMod, ChallengeRewardResult, TrialData, TrialPreview, TrialDisplay, ItemConfig, ItemPreview, TrialListEntry} from "../types";

const {TRIAL_READY, TRIAL_PLAYING, TRIAL_REWARD, TRIAL_FAILED, TRIAL_COMPLETE} = trialStates;

const CharacterValue = {
    createNew: (index: number, accessory: boolean, starPowers: number, gears: number) =>
        (((index & 15) << 12) | ((accessory ? 1 : 0) << 11) | ((starPowers & 7) << 8) | (gears & 127)),
    getIndex: (value: number) => ((value >> 12) & 15),
    getAccessory: (value: number) => (((value >> 11) & 1) === 1),
    getStarPowers: (value: number) => ((value >> 8) & 7),
    getGears: (value: number) => (value & 127)
};
const ItemValue = {
    createNew: (active: boolean, unlocked: boolean, collected: number, inventory: number) =>
        (((active ? 1 : 0) << 15) | ((unlocked ? 1 : 0) << 14) | ((collected & 127) << 7) | (inventory & 127)),
    addStacks: (value: number, stacks: number) =>
        (((value >> 14) << 14) | (Math.min(127, ((value >> 7) & 127) + stacks) << 7) | Math.min(127, (value & 127) + stacks)),
    removeStacks: (value: number, stacks: number) =>
        (((value >> 7) << 7) | Math.min(127, (value & 127) - stacks)),
    consumeItem: (value: number) =>
        ((((value >> 14) & 1) << 14) | (((value >> 7) & 127) << 7) | Math.max(0, (value & 127) - 1)),
    setActive: (value: number) => (value | 32768),
    setInactive: (value: number) => (value & -32769),
    getActive: (value: number) => (((value >> 15) & 1) === 1),
    getUnlocked: (value: number) => (((value >> 14) & 1) === 1),
    getCollected: (value: number) => ((value >> 7) & 127),
    getInventory: (value: number) => (value & 127),
};

function isItemActive(values: number[], index: number): boolean{
    return (index < values.length && ItemValue.getActive(values[index]));
}

const emptyItem: ItemPreview = {displayName: "", image: "", type: "", rarity: 0, count: 0};

// Map from accessory item keys to index in playerAccessories
const accessoryMapIngame = new Map<string, number>();
const accessoryCostsIngame: number[] = [];

let characterOffset = -1;
let accessoryOffset = -1;
let powerupOffset = -1;

for (let x = 0; x < accessoryList.length; x++){
    accessoryMapIngame.set(accessoryList[x].name, x);
    accessoryCostsIngame.push(accessoryList[x].cost);
}

for (let x = 0; x < itemList.length; x++){
    if (characterOffset < 0 && itemList[x].type === "character"){
        characterOffset = x;
    } if (accessoryOffset < 0 && itemList[x].type === "accessory"){
        accessoryOffset = x;
    } if (powerupOffset < 0 && itemList[x].type === "powerup"){
        powerupOffset = x;
    }
}
export const offsets = {characterOffset, accessoryOffset, powerupOffset};


export function getTrialList(): TrialListEntry[]{
    const trials: TrialListEntry[] = [];
    for (let x = 0; x < allTrials.length; x++){
        trials.push({
            displayName: allTrials[x].displayName,
            challenges: allTrials[x].challenges.length
        });
    }
    return trials;
}

export function getTrialPreview(trial: TrialData): TrialPreview{
    let displayName = "";
    if (trial.trialid >= 0 && trial.trialid < allTrials.length){
        displayName = allTrials[trial.trialid].displayName;
    }

    const r = trial.resources;

    const scores: TrialPreview["scores"] = [];
    const characters: TrialPreview["characters"] = [];
    const accessories: TrialPreview["accessories"] = [];
    const powerups: TrialPreview["powerups"] = [];
    const activeAccessories: number[] = [];
    const activePowerups: number[] = [];

    let tokensUsed = 0;

    for (let x = 0; x < trial.scores.length; x++){
        scores.push(trial.scores[x]);
    }

    for (let x = 0; x < trial.characterBuilds.length; x++){
        const value = trial.characterBuilds[x];
        const cIndex = CharacterValue.getIndex(value);
        const index = characterOffset + cIndex;
        const item = itemList[index];
        if (item !== undefined){
            characters.push({
                index: cIndex,
                gears: CharacterValue.getGears(value),
                starPowers: CharacterValue.getStarPowers(value),
                accessory: CharacterValue.getAccessory(value)
            });
        }
    }

    for (let x = 0; x < itemList.length; x++){
        const item = itemList[x];
        if (item.type === "accessory"){
            accessories.push(ItemValue.getInventory(trial.accessories[item.index] ?? 0));
            if (ItemValue.getActive(trial.accessories[item.index]) === true){
                activeAccessories.push(item.index);
                tokensUsed += item.cost;
            }
        } else if (item.type === "powerup"){
            powerups.push(ItemValue.getInventory(trial.powerups[item.index] ?? 0));
            if (ItemValue.getActive(trial.powerups[item.index]) === true){
                activePowerups.push(item.index);
            }
        }
    }

    const brawlBoxes = getAvailableBoxes(trial);

    return {
        state: trial.state,
        displayName: displayName,
        progress: trial.progress,
        scores: scores,
        resources: {
            power: r.power, gears: r.gears, accessories: r.accessories,
            hyper: r.hyper, credits: r.credits
        },
        selected: {
            character: trial.selected,
            tokensUsed: tokensUsed,
            accessories: activeAccessories,
            powerups: activePowerups
        },
        characters: characters,
        accessories: accessories,
        powerups: powerups,
        brawlBoxes: brawlBoxes
    };
}

export function getTrialDisplay(trial: TrialData): TrialDisplay{
    const rarities: TrialDisplay["rarities"] = [];
    const challenges: TrialDisplay["challenges"] = [];
    const characters: TrialDisplay["characters"] = [];
    const accessories: TrialDisplay["accessories"] = [];
    const powerups: TrialDisplay["powerups"] = [];
    const brawlBoxes: TrialDisplay["brawlBoxes"] = [];

    if (trial.trialid >= 0 && trial.trialid < allTrials.length){
        const config = allTrials[trial.trialid];
        for (let x = 0; x < config.challenges.length; x++){
            challenges.push({
                displayName: config.challenges[x].displayName,
                stages: config.challenges[x].enemyStats.length
            });
        }
    }

    for (let x = 0; x < allRarities.length; x++){
        const r = allRarities[x];
        rarities.push({
            displayName: r.displayName, color: r.color,
            buyCost: r.buyCost, sellCost: r.sellCost
        });
    }

    for (let x = 0; x < trial.characterTiers.length; x++){
        const tierConfig = characterTiers[Math.min(characterTiers.length - 1, trial.characterTiers[x] >> 8)];
        characters.push({
            tier: {
                level: tierConfig.startLevel + (trial.characterTiers[x] & 255), name: tierConfig.name,
                image: TIER_IMAGE_DIR + tierConfig.image + IMAGE_FILE_EXTENSION, color: tierConfig.color
            },
            displayName: "",
            sprite: spriteConfig.characterIndex + x,
            rarity: 0,
            accessoryIndex: allCharacters[x].accsItemIndex ?? -1,
            starPowers: []
        });
    }

    for (let x = 0; x < itemList.length; x++){
        const item = itemList[x];
        if (item.type === "character"){
            const index = item.index;
            if (index >= 0 && index < characters.length){
                characters[index].displayName = item.displayName;
                characters[index].rarity = item.rarity;
                if (index < allCharacters.length){
                    const sp = allCharacters[index].starPowers;
                    for (let i = 0; i < sp.length; i++){
                        characters[index].starPowers[i] = sp[i];
                    }
                }
            }
        } else if (item.type === "accessory"){
            const ingameIndex = accessoryMapIngame.get(item.key);
            accessories.push({
                displayName: item.displayName, sprite: spriteConfig.accessoryIndex + (ingameIndex ?? 0),
                description: item.description, rarity: item.rarity, cost: item.cost
            });
        } else if (item.type === "powerup"){
            powerups.push({
                displayName: item.displayName, sprite: spriteConfig.powerupIndex + Math.max(0, item.index),
                description: item.description, rarity: item.rarity
            });
        }
    }

    for (let x = 0; x < allBoxes.length; x++){
        brawlBoxes.push({
            displayName: allBoxes[x].displayName, description: allBoxes[x].description,
            image: TRIAL_IMAGE_DIR + allBoxes[x].image + IMAGE_FILE_EXTENSION
        });
    }

    return {
        sprites: {
            image: TRIAL_IMAGE_DIR + spriteConfig.imageFile + IMAGE_FILE_EXTENSION,
            rowSize: spriteConfig.rowSize
        },
        builds: {
            gears: {sprite: spriteConfig.gearIndex, count: 7},
            starPowers: {sprite: spriteConfig.starPowerIndex, count: 3}
        },
        rarities, challenges,
        resources: [
            {key: "power", displayName: "Power Points", sprite: spriteConfig.powerPointsIndex},
            {key: "gears", displayName: "Gear Scrap", sprite: spriteConfig.gearScrapIndex},
            {key: "accessories", displayName: "Accessory Tokens", sprite: spriteConfig.accessoryTokenIndex},
            {key: "credits", displayName: "Credits", sprite: spriteConfig.creditsIndex}
        ],
        characters, accessories, powerups, brawlBoxes
    };
}

function getCharacterTiers(playerCharacters: UserCharacter[]): number[]{
    const tiers: number[] = [];
    const maxIndex = characterTiers.length - 1;
    let minPower = playerCharacters.length > 0 ? (maxIndex + 1) * 100 : 0;
    let maxPower = 0;

    for (let x = 0; x < playerCharacters.length; x++){
        const tierIndex = Math.min(maxIndex, playerCharacters[x].tier >> 8);
        const powerValue = tierIndex * 100 + Math.min(1,
            (playerCharacters[x].tier & 255) / Math.max(1, characterTiers[tierIndex].maxUpgrades)
        ) * 80;
        minPower = Math.min(minPower, powerValue);
        maxPower = Math.max(maxPower, powerValue);
        tiers.push(powerValue);
    }

    const avgPower = (minPower + maxPower) / 2;
    for (let x = playerCharacters.length; x < allCharacters.length; x++){
        tiers.push(avgPower);
    }

    for (let x = 0; x < tiers.length; x++){
        const newPower = Math.max(maxPower - 60, tiers[x] + (maxPower - tiers[x]) * 2 / 5);
        const tierIndex = Math.min(maxIndex, Math.floor(newPower / 100));
        tiers[x] = (tierIndex << 8) | ((characterTiers[tierIndex].maxUpgrades * Math.min(80, newPower % 100) / 80) & 255);
    }

    return tiers;
}

export function startTrial(trialid: number, resources: UserResources): TrialData | undefined{
    if (trialid < 0 || trialid >= allTrials.length){
        return;
    }
    const config = allTrials[trialid];

    // The trial's mastery level will start at the same level as the player's. Harder trials further increase the level.
    const trialLevel = Math.max(0, Math.min(
        Math.floor(Math.min(35, getMasteryLevel(resources.mastery).level) + config.levelIncrease),
        trialLevels.length - 1
    ));

    const scores: number[] = [];
    for (let x = 0; x < config.challenges.length; x++){
        scores.push(0);
    }

    const tiers = getCharacterTiers(resources.characters);

    const accessories: number[] = [];
    const powerups: number[] = [];
    for (let x = 0; x < itemList.length; x++){
        if (itemList[x].type === "accessory"){
            accessories.push(0);
        } else if (itemList[x].type === "powerup"){
            powerups.push(0);
        }
    }

    return {
        trialid: trialid, level: trialLevel, state: TRIAL_REWARD, progress: 0, selected: 0, scores: scores,
        rewards: {lastScore: 0, coins: 0, mastery: 0, badges: 0, quality: 0, specialBoxes: 1},
        resources: {power: 0, gears: 3, accessories: 25, hyper: 0, credits: 0},
        upgrades: {health: 0, damage: 0, healing: 0, lifeSteal: 0, critical: 0, combo: 0, speed: 0, ability: 0},
        characterTiers: tiers, characterBuilds: [], accessories: accessories, powerups: powerups, maxBuilds: 10
    };
}

export function selectItems(trial: TrialData, character: number, accessories: number[], powerups: number[]): boolean{
    let totalCost = 0;
    let valid = true;
    for (let x = 0; x < accessories.length; x++){
        const dataIndex = accessories[x];
        if (ItemValue.getInventory(trial.accessories[dataIndex]) >= 1){
            const itemIndex = accessoryOffset + dataIndex;
            if (itemIndex < itemList.length){
                totalCost += itemList[itemIndex].cost;
            } else{
                valid = false;
            }
        } else{
            valid = false;
        }
    }
    for (let x = 0; x < powerups.length; x++){
        const dataIndex = powerups[x];
        if (ItemValue.getInventory(trial.powerups[dataIndex]) < 1){
            valid = false;
        }
    }
    if (valid === false || trial.resources.accessories < totalCost){
        return false;
    }

    if (character >= 0 && character < trial.characterBuilds.length){
        trial.selected = character;
    }

    // All active items not in the selection will become inactive.
    const accessoriesSet = new Set(accessories);
    const powerupsSet = new Set(powerups);
    for (let x = 0; x < trial.accessories.length; x++){
        trial.accessories[x] = (accessoriesSet.has(x) === true) ? ItemValue.setActive(trial.accessories[x]) : ItemValue.setInactive(trial.accessories[x]);
    }
    for (let x = 0; x < trial.powerups.length; x++){
        trial.powerups[x] = (powerupsSet.has(x) === true) ? ItemValue.setActive(trial.powerups[x]) : ItemValue.setInactive(trial.powerups[x]);
    }

    return true;
}

export function buyItem(trial: TrialData, type: string, index: number): boolean{
    let i = -1;
    if (type === "character"){
        i = characterOffset + index;
    } else if (type === "accessory"){
        i = accessoryOffset + index;
    } else if (type === "powerup"){
        i = powerupOffset + index;
    }
    if (i < 0 || i >= itemList.length){
        return false;
    }

    const item = itemList[i];

    const cost = allRarities[Math.min(allRarities.length - 1, item.rarity)].buyCost;

    if (trial.resources.credits < cost){
        return false;
    }

    const itemResult = addItem(trial, item);

    if (itemResult === undefined){
        return false;
    }

    trial.resources.credits -= cost;
    return true;
}

export function sellItem(trial: TrialData, type: string, index: number): boolean{
    if (index < 0){
        return false;
    }

    if (type === "character"){
        // If the item to sell is a character, index specifies the index in the list of builds since the player may have
        // more than one copy of each character.
        if (index >= trial.characterBuilds.length){
            return false;
        }
        const item = itemList[characterOffset + CharacterValue.getIndex(trial.characterBuilds[index])];
        if (item === undefined){
            return false;
        }

        // If the character to sell is the one currently selected, set the new selected character to the first.
        if (trial.selected === index){
            trial.selected = 0;
        }

        trial.characterBuilds.splice(index, 1);
        trial.resources.credits += allRarities[Math.min(allRarities.length - 1, item.rarity)].sellCost;
        return true;
    }

    let item: ItemConfig | undefined;
    let data: number[] = [];
    if (type === "accessory"){
        item = itemList[accessoryOffset + index];
        data = trial.accessories;
    } else if (type === "powerup"){
        item = itemList[powerupOffset + index];
        data = trial.powerups;
    }

    if (index >= data.length || item === undefined){
        return false;
    }

    const itemCount = ItemValue.getInventory(data[index]);
    if (itemCount < 1){
        return false;
    }

    if (itemCount === 1 && ItemValue.getActive(data[index]) === true){
        // If the item is active and only 1 stack is left, remove it then set to inactive
        data[index] = ItemValue.consumeItem(data[index]);
    } else{
        data[index] = ItemValue.removeStacks(data[index], 1);
    }

    trial.resources.credits += allRarities[Math.min(allRarities.length - 1, item.rarity)].sellCost;
    return true;
}

export function addFinalReward(trial: TrialData, resources: UserResources): number{
    if (trial.trialid < 0 || trial.trialid >= allTrials.length){
        return 0;
    }
    const config = allTrials[trial.trialid];

    if (trial.progress < Math.max(config.challenges.length, trial.scores.length)){
        return 0;
    }
    // The bonus mastery reward is only given if all challenges were completed

    let totalScore = 0;
    for (let x = 0; x < trial.scores.length; x++){
        totalScore += Math.max(0, trial.scores[x] - 300);
    }

    const characters = trial.characterBuilds;
    const accessories = trial.accessories;
    const powerups = trial.powerups;

    const itemRarities: number[] = [];
    for (let x = 0; x < allRarities.length; x++){
        itemRarities.push(0);
    }

    for (let x = 0; x < characters.length; x++){
        const item = itemList[characterOffset + CharacterValue.getIndex(characters[x])];
        if (item !== undefined){
            itemRarities[item.rarity] += 1;
        }
    }
    for (let x = 0; x < accessories.length; x++){
        const item = itemList[accessoryOffset + x];
        if (item !== undefined){
            itemRarities[item.rarity] += ItemValue.getInventory(accessories[x]);
        }
    }
    for (let x = 0; x < powerups.length; x++){
        const item = itemList[powerupOffset + x];
        if (item !== undefined){
            itemRarities[item.rarity] += ItemValue.getInventory(powerups[x]);
        }
    }

    // Every unspent credit increases the final reward by 1%. This intends to discourage the player from selling all
    // their items and buying the best items they can before playing the last challenge.
    let credits = trial.resources.credits;
    for (let x = 0; x < allRarities.length; x++){
        credits += allRarities[x].sellCost * itemRarities[x];
    }
    if ((trial.rewards.specialBoxes & 8) === 8){
        // If the ultra box was unlocked but not opened, convert it to credits
        credits += 25;
    }
    credits = Math.min(100, credits);

    const mastery = Math.floor(
        trialLevels[Math.min(trial.level, trialLevels.length - 1)].baseMastery *
        config.baseMastery * totalScore * (100 + credits + trial.rewards.mastery) / 100
    );

    resources.mastery += mastery;

    for (let x = 0; x < resources.accessories.length; x++){
        if (resources.accessories[x].name === "trials"){
            resources.accessories[x].badges += 1;
        }
    }

    return mastery;
}

function getBoxQuality(trial: TrialData, config: typeof allBoxes[number]): number{
    const score = (Math.max(0, Math.min(300, trial.rewards.lastScore - 300)) * config.scoreQuality / 300);
    const progress = (Math.max(0, trial.progress) * config.progressQuality);
    return Math.floor((config.baseQuality + score + progress) * (100 + trial.rewards.quality) / 100);
}

function createCharacterBuild(index: number): number{
    return CharacterValue.createNew(
        index,
        Math.random() < 0.1,
        Math.max(0, RNG(starPowerWeights)),
        Math.max(0, RNG(gearWeights))
    );
}

function addItem(trial: TrialData, item: ItemConfig): ItemPreview | undefined{
    let image = "";

    if (item.type === "resource"){
        const key = item.key as keyof TrialData["resources"];
        if (Object.hasOwn(trial.resources, key) === false){
            return;
        }
        trial.resources[key] += item.stack;

        if (item.key === "power"){
            image = "icon_power_points";
        } else if (item.key === "gears"){
            image = "icon_gear_scrap";
        } else if (item.key === "accessories"){
            image = "icon_token_doubler";
        }
        if (image !== ""){
            image = CURRENCY_IMAGE_DIR + image + IMAGE_FILE_EXTENSION;
        }
    } else if (item.type === "credits"){
        if (Object.hasOwn(trial.resources, "credits") === false){
            return;
        }
        trial.resources.credits += item.stack;
        image = `${CURRENCY_IMAGE_DIR}icon_credits${IMAGE_FILE_EXTENSION}`;
    } else if (item.type === "character"){
        if (item.index < 0 || item.index >= trial.characterTiers.length){
            return;
        }
        trial.characterBuilds.push(createCharacterBuild(item.index));
        if (trial.characterBuilds.length > trial.maxBuilds){
            trial.maxBuilds = Math.max(trial.characterBuilds.length, trial.maxBuilds * 2);
        }
        image = `${PORTRAIT_IMAGE_DIR}portrait_${item.key}${IMAGE_FILE_EXTENSION}`;
    } else if (item.type === "accessory"){
        if (item.index < 0 || item.index >= trial.accessories.length){
            return;
        }
        trial.accessories[item.index] = ItemValue.addStacks(trial.accessories[item.index], item.stack);
        image = `${ACCESSORY_IMAGE_DIR}accessory_${item.key}${IMAGE_FILE_EXTENSION}`;
    } else if (item.type === "powerup"){
        if (item.index < 0 || item.index >= trial.powerups.length){
            return;
        }
        trial.powerups[item.index] = ItemValue.addStacks(trial.powerups[item.index], item.stack);
        image = TRIAL_IMAGE_DIR + item.key + IMAGE_FILE_EXTENSION;
    }
    return {displayName: item.displayName, image: image, type: item.type, rarity: item.rarity, count: item.stack};
}

export function openBrawlBox(trial: TrialData, boxType: number): ItemPreview[]{
    if (boxType < 0 || boxType >= allBoxes.length){
        return [];
    }
    const config = allBoxes[boxType];

    if (trial.state !== TRIAL_REWARD || (trial.rewards.specialBoxes & config.requirement) !== config.requirement){
        // Not allowed to open the box
        return [];
    }

    const quality = getBoxQuality(trial, config);

    const rarityCount = config.rarities.length;
    if (rarityCount <= 0){
        return [];
    }

    const weights: number[] = [];
    for (let x = 0; x < itemList.length; x++){
        weights.push(0);
    }
    const weightMods = new Map<string, number>();
    for (let x = 0; x < config.weights.length; x++){
        weightMods.set(config.weights[x].itemType, config.weights[x].multiplier);
    }

    const resultItems: ItemPreview[] = [];

    // Roll guaranteed items
    for (let x = 0; x < config.guaranteed.length; x++){
        const g = config.guaranteed[x];
        if (g < guaranteedDraws.length){
            const draw = guaranteedDraws[g];
            const index = RNG(draw);
            if (index >= 0){
                const result = addItem(trial, itemList[index]);
                resultItems.push(result ?? emptyItem);
            }
        }
    }

    // Roll additional items
    const itemCounts: number[] = [];
    // The box quality is the number of additional items that are given
    let remaining = quality;

    for (let x = rarityCount - 1; x >= 1; x--){
        const factor = Math.max(1, config.rarities[x]);

        let count = Math.min(remaining, Math.floor(quality / factor));
        remaining -= count;

        if (remaining >= 1 && Math.random() < (quality % factor) / factor){
            count += 1;
            remaining -= 1;
        }

        itemCounts.push(count);
    }
    itemCounts.push(remaining);
    itemCounts.reverse();

    // With item counts for each rarity, choose items from each rarity to add
    let item: ItemConfig | undefined;
    for (let rarity = 0; rarity < itemCounts.length; rarity++){
        for (let x = 0; x < itemList.length; x++){
            if (itemList[x].rarity === rarity){
                if (weightMods.size > 0){
                    weights[x] = Math.round(itemList[x].weight * (weightMods.get(itemList[x].type) ?? 1));
                } else{
                    weights[x] = itemList[x].weight;
                }
            } else{
                weights[x] = 0;
            }
        }

        for (let x = 0; x < itemCounts[rarity]; x++){
            const index = RNG(weights);
            if (index >= 0){
                item = itemList[index];
            } else if (rarity < fallbackItems.length){
                item = fallbackItems[rarity];
            }

            if (item !== undefined){
                const result = addItem(trial, item);
                resultItems.push(result ?? emptyItem);
            }
        }
    }

    trial.rewards.quality = 0;
    trial.state = TRIAL_READY;

    return resultItems;
}

export function getAvailableBoxes(trial: TrialData): TrialPreview["brawlBoxes"]{
    const boxReq = trial.rewards.specialBoxes;
    const boxes: TrialPreview["brawlBoxes"] = [];

    if (trial.state !== TRIAL_REWARD){
        return boxes;
    }

    for (let x = 0; x < allBoxes.length; x++){
        if ((boxReq & allBoxes[x].requirement) === allBoxes[x].requirement){
            const quality = getBoxQuality(trial, allBoxes[x]);
            const rareItems: number[] = [];
            for (let i = 1; i < allBoxes[x].rarities.length; i++){
                rareItems.push(Math.floor(quality * 10000 / allBoxes[x].rarities[i]) / 100);
            }
            boxes.push({
                index: x, items: quality + allBoxes[x].guaranteed.length, rareItems: rareItems
            });
        }
    }
    return boxes;
}

function getChallengeUpgrades(trial: TrialData): Partial<GameModUpgradeValues>{
    const upgrades: Partial<GameModUpgradeValues> = {};
    const completed = trial.upgrades;

    for (const x in trialUpgrades){
        const key = x as keyof GameModUpgradeValues;
        const tu = trialUpgrades[key];
        const maxLevel = Math.min(tu.maxLevel, tu.cost.length);

        const costs: number[] = [];
        for (let x = completed[key]; x < maxLevel; x++){
            costs.push(tu.cost[x]);
        }

        upgrades[key] = {
            value: [tu.value[0] + tu.value[1] * Math.min(maxLevel, completed[key]), tu.value[1]],
            //cost: costs,
            maxLevel: Math.max(0, maxLevel - completed[key])
        };
        if (costs.length > 0){
            upgrades[key].cost = costs;
        }
    }

    return upgrades;
}

export function getNextChallenge(trial: TrialData, key: string, resources: UserResources, prefs?: UserSetGameMod): ChallengeGameMod | undefined{
    if (trial.trialid < 0 || trial.trialid >= allTrials.length){
        return;
    }
    const config = allTrials[trial.trialid];

    if (trial.progress >= config.challenges.length){
        return;
    }

    const challenge = config.challenges[trial.progress];

    trial.selected = Math.min(trial.selected, trial.characterBuilds.length - 1);
    const c = trial.selected >= 0 ? trial.characterBuilds[trial.selected] : 0;
    const selIndex = CharacterValue.getIndex(c);
    const selAccs = CharacterValue.getAccessory(c);
    let selGears = CharacterValue.getGears(c);
    let selSps = CharacterValue.getStarPowers(c);

    const characters: UserCharacter[] = [];
    for (let x = 0; x < allCharacters.length; x++){
        characters.push({
            name: allCharacters[x].name,
            tier: selIndex === x ? trial.characterTiers[x] : -1
        });
    }

    // Start with the game modification object for the next challenge then modify it based on the current characters,
    // accessories, and powerups selected in the trial. Set mastery points such that the level requirement to use each
    // character is met.
    const trialPrefs: UserSetGameMod = {};
    if (prefs !== undefined && prefs.playerSkins !== undefined){
        trialPrefs.playerSkins = prefs.playerSkins.slice();
    }
    const gameMod = getGameMod(challenge.challengeid, key, {
        mastery: 20000000,
        coins: 0,
        characters: characters,
        accessories: [],
        last_save: 0,
        menu_theme: resources.menu_theme
    }, trialPrefs);

    if (gameMod === undefined){
        return;
    }

    const playerAccessories = gameMod.playerAccessories ?? [];
    let ingameTokens = 0;
    for (let x = 0; x < itemList.length; x++){
        if (itemList[x].type === "accessory" && itemList[x].index >= 0){
            // Accessory value inside trial object
            const trialAccs = trial.accessories[itemList[x].index];

            if (ItemValue.getActive(trialAccs) === true){
                // Index of accessory in the list of all accessories
                const ingameIndex = accessoryMapIngame.get(itemList[x].key);

                if (ingameIndex !== undefined){
                    playerAccessories[ingameIndex >> 3] |= (1 << (ingameIndex & 7));
                    ingameTokens += accessoryCostsIngame[ingameIndex];
                }
            }
        }
    }
    // Set the player-specific accessory if the selected character build has it unlocked
    if (selAccs === true && selIndex < allCharacters.length){
        let ingameIndex = -1;
        const item = itemList[characterOffset + selIndex];
        if (item !== undefined){
            ingameIndex = accessoryMapIngame.get(item.key) ?? -1;
        }

        if (ingameIndex > 0){
            const m = (1 << (ingameIndex & 7));
            if ((playerAccessories[ingameIndex >> 3] & m) !== m){
                playerAccessories[ingameIndex >> 3] |= m;
                ingameTokens += accessoryCostsIngame[ingameIndex];
            }
        }
    }

    const upgrades = getChallengeUpgrades(trial);

    const powerups = trial.powerups;

    let statDecrease = 0;
    let tpeIncrease = 0;
    let hbrDecrease = 0;
    let delayIncrease = 0;
    let startingHyper = trial.resources.hyper;

    if (isItemActive(powerups, 0) === true){
        // Speed increase
        const speed = upgrades.speed;
        if (speed !== undefined && speed.value !== undefined){
            speed.value[0] += 2;
        }
    } if (isItemActive(powerups, 1) === true){
        // Super charge increase
        const ability = upgrades.ability;
        if (ability !== undefined && ability.value !== undefined){
            ability.value[0] += 30;
        }
    } if (isItemActive(powerups, 2) === true){
        // Temporary tier up
        let maxTier = 0;
        for (let x = 0; x < trial.characterTiers.length; x++){
            maxTier = Math.max(maxTier, trial.characterTiers[x]);
        }
        const tiers = gameMod.playerUpgradeTiers;
        if (tiers !== undefined){
            for (const x in tiers){
                if (tiers[x] >= 0){
                    tiers[x] = maxTier;
                }
            }
        }
    } if (isItemActive(powerups, 3) === true){
        // All star powers
        selSps |= 7;
    } if (isItemActive(powerups, 4) === true){
        // All gears
        selGears |= 127;
    } if (isItemActive(powerups, 5) === true){
        // Weaker enemies
        statDecrease = 5;
    } if (isItemActive(powerups, 6) === true){
        // Easier speed score
        tpeIncrease = 40;
    } if (isItemActive(powerups, 7) === true){
        // Easier health bonus score
        hbrDecrease = 30;
    } if (isItemActive(powerups, 9) === true){
        // Longer spawn delay
        delayIncrease = 50;
    }

    if (isItemActive(trial.accessories, 88) === true){
        // Start with hypercharge
        startingHyper = 200;
    }

    const options = gameMod.options;
    if (options !== undefined){
        options.key = key;
        options.gameMode = 3;
        options.upgradesAtStart = true;
        options.autoSelect = true;
    } else{
        gameMod.options = {key: key, gameMode: 3, upgradesAtStart: true, autoSelect: true};
    }

    const newUnlocks: Required<ChallengeGameMod>["unlocks"] = {
        maxAccessories: ingameTokens,
        startingPower: trial.resources.power,
        startingGears: trial.resources.gears,
        startingHyper: startingHyper,
        gearCost: 6,
        gearSlots: 2,
        gears: selGears,
        starPowers: selSps
    };
    if (gameMod.unlocks !== undefined){
        for (const x in newUnlocks){
            const key = x as keyof typeof newUnlocks;
            if (newUnlocks[key] !== undefined){
                gameMod.unlocks[key] = newUnlocks[key];
            }
        }
    } else{
        gameMod.unlocks = newUnlocks;
    }

    const levelStats = trialLevels[Math.min(trial.level, trialLevels.length - 1)];

    const difficulties = gameMod.difficulties;
    if (difficulties !== undefined){
        const enemyStats = challenge.enemyStats;

        for (let x = 0; x < difficulties.length; x++){
            const diff = difficulties[x];

            diff.name = config.displayName;
            diff.strengthTier = config.difficulty.strengthTier;
            diff.healthBonusReq = Math.max(0, config.difficulty.healthBonusReq * (100 - hbrDecrease) / 100);
            diff.timePerEnemy = Math.max(0, config.difficulty.timePerEnemy * (100 + tpeIncrease) / 100);

            for (let y = 0; y < diff.enemyStats.length; y++){
                diff.enemyStats[y] = Math.max(8, Math.round(levelStats.enemyStats * enemyStats[y] * (100 - statDecrease) / 10000));
            }
        }
    }

    const stages = gameMod.stages;
    if (stages !== undefined){
        for (let x = 0; x < stages.length; x++){
            stages[x].powerReward = challenge.powerReward;
            stages[x].gearsReward = challenge.gearsReward;
        }
    }

    const levels = gameMod.levels;
    if (levels !== undefined){
        for (let x = 0; x < levels.length; x++){
            for (let y = 0; y < levels[x].waves.length; y++){
                const wave = levels[x].waves[y];
                wave.delay = (wave.delay ?? 0) * (100 + delayIncrease) / 100;
            }
        }
    }

    gameMod.playerUpgradeValues = upgrades;

    trial.state = TRIAL_PLAYING;

    return gameMod;
}

export function saveChallengeReport(trial: TrialData, report: number[]): ChallengeRewardResult | undefined{
    // The report would have been validated before being passed to this function
    if (trial.trialid < 0 || trial.trialid >= allTrials.length){
        return;
    }

    const format = REPORT_FORMAT;
    const config = allTrials[trial.trialid];

    if (report.length !== format.length[1]){
        return;
    }

    // Set score
    const gameScore = report[format.player[0]];
    const categories = report[format.achievements[0]];

    // Get extra score for each perfect score category
    const activeCategories = [0, 1, 3, 4];
    let perfectBonus = 0;
    for (let x = 0; x < activeCategories.length; x++){
        perfectBonus += ((categories >> activeCategories[x]) & 1);
    }

    if (trial.progress >= trial.scores.length){
        // Cannot save a report after the last challenge was completed
        return;
    }

    const challenge = config.challenges[Math.min(config.challenges.length - 1, trial.progress)];
    const accessories = trial.accessories;
    const powerups = trial.powerups;
    const progress = trial.progress;

    if (gameScore >= 300 && (categories & 1) === 1){
        trial.progress += 1;
        // Get 2 accessory tokens for each challenge completed
        trial.resources.accessories += 2;

        if (trial.progress >= config.challenges.length){
            trial.state = TRIAL_COMPLETE;
        } else{
            trial.state = TRIAL_REWARD;
        }
    } else if (ItemValue.getInventory(powerups[10]) >= 1){
        // If the player has an extra life, reset the state of the trial without modifying any other values
        trial.powerups[10] = ItemValue.consumeItem(powerups[10]);
        trial.state = TRIAL_READY;
        return {mastery: 0, coins: 0, badges: 0};
    } else{
        trial.state = TRIAL_FAILED;
    }

    trial.scores[progress] = Math.max(0, gameScore) + perfectBonus * 25;
    trial.rewards.lastScore = gameScore;

    // Set resources and upgrades
    trial.resources.power = report[format.resources[0]];
    trial.resources.gears = report[format.resources[0] + 1];
    trial.resources.hyper = report[format.resources[0] + 2];
    if (isItemActive(powerups, 10) === true){
        // If the extra life was activated but not needed, give credits instead
        trial.resources.credits += 20;
    }

    const gameUpgrades = report.slice(format.upgrades[0], format.upgrades[1]);
    const keys = Object.keys(trial.upgrades) as (keyof GameModUpgradeValues)[];
    const len = Math.min(gameUpgrades.length, keys.length);
    for (let x = 0; x < len; x++){
        trial.upgrades[keys[x]] += gameUpgrades[x];
    }

    // Set brawl box rewards
    trial.rewards.specialBoxes = 2;
    if (gameScore >= 500){
        trial.rewards.specialBoxes |= 4;
    }

    if (isItemActive(accessories, 87) === true){
        trial.rewards.lastScore = Math.max(trial.rewards.lastScore, 600);
    } if (isItemActive(accessories, 89) === true){
        trial.rewards.specialBoxes |= 8;
        trial.rewards.badges += 50;
    } if (isItemActive(accessories, 90) === true){
        trial.rewards.specialBoxes |= 8;
        trial.rewards.mastery += 50;
    }
    const coinsAccs = [28, 29, 53, 54, 72, 73, 86, 91];
    const coinsRewards = [6, 8, 12, 15, 20, 24, 30, 40];
    let qualityIncrease = 0;
    for (let x = 0; x < coinsAccs.length; x++){
        if (isItemActive(accessories, coinsAccs[x]) === true){
            trial.rewards.coins += coinsRewards[x];
            qualityIncrease = Math.max(qualityIncrease, coinsRewards[x]);
        }
    }
    if (qualityIncrease > 0){
        trial.rewards.quality = qualityIncrease;
    }

    // Consume selected character
    if (isItemActive(powerups, 8) === false && trial.selected >= 0 && trial.selected < trial.characterBuilds.length){
        trial.characterBuilds.splice(trial.selected, 1);
        trial.selected = 0;
    }

    // Consume accessories and powerups
    const duplicate = isItemActive(powerups, 11);
    for (let x = 0; x < accessories.length; x++){
        if (duplicate === true){
            trial.accessories[x] = ItemValue.setInactive(accessories[x]);
        } else if (ItemValue.getActive(accessories[x]) === true){
            trial.accessories[x] = ItemValue.consumeItem(accessories[x]);
        }
    }
    for (let x = 0; x < powerups.length; x++){
        if (ItemValue.getActive(powerups[x]) === true){
            trial.powerups[x] = ItemValue.consumeItem(powerups[x]);
        }
    }

    const levelStats = trialLevels[Math.min(trial.level, trialLevels.length - 1)];

    return {
        mastery: levelStats.baseMastery * challenge.baseMastery,
        coins: levelStats.baseCoins + config.baseCoins,
        badges: config.baseBadges
    };
}
