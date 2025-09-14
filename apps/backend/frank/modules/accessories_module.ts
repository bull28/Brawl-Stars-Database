import accessoryList from "../data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, ACCESSORY_IMAGE_DIR} from "../data/constants";
import {findName} from "./utils";
import {getMasteryLevel} from "../modules/resources_module";
import {UserAccessory, AccessoryPreview, AccessoryData, ShopAccessory, ShopAccessoryPreview} from "../types";

interface AccessoryConfig{
    name: string;
    category: string;
    displayName: string;
    description: string;
    unlock: string;
    badges: number;
}

const accessories: AccessoryConfig[] = [];
const indexMap = new Map<string, number>();
for (let x = 0; x < accessoryList.length; x++){
    const a = accessoryList[x];
    accessories.push({
        name: a.name, category: a.category, displayName: a.displayName,
        description: a.description, unlock: a.unlock, badges: a.badges
    });
    indexMap.set(a.name, x);
}

const accessoryShop = new Map<string, ShopAccessory>([
    ["shop1", {cost: 1500, masteryReq: 6}],
    ["shop2", {cost: 1500, masteryReq: 6}],
    ["shop3", {cost: 2500, masteryReq: 8}],
    ["shop4", {cost: 2500, masteryReq: 8}],
    ["shop5", {cost: 4000, masteryReq: 8}],
    ["shop6", {cost: 5000, masteryReq: 10}],
    ["shop7", {cost: 6000, masteryReq: 10}],
    ["shop8", {cost: 6000, masteryReq: 10}],
    ["brawlbox1", {cost: 25000, masteryReq: 22}],
    ["brawlbox2", {cost: 27000, masteryReq: 22}],
    ["brawlbox3", {cost: 12000, masteryReq: 18}],
    ["brawlbox4", {cost: 15000, masteryReq: 18}],
    ["brawlbox5", {cost: 30000, masteryReq: 22}],
    ["brawlbox6", {cost: 8000, masteryReq: 14}],
    ["brawlbox7", {cost: 9000, masteryReq: 14}],
    ["mastery1", {cost: 0, masteryReq: 6}],
    ["mastery2", {cost: 0, masteryReq: 8}],
    ["mastery3", {cost: 0, masteryReq: 12}],
    ["mastery4", {cost: 0, masteryReq: 16}],
    ["mastery5", {cost: 0, masteryReq: 20}],
    ["mastery6", {cost: 0, masteryReq: 25}],
    ["mastery7", {cost: 0, masteryReq: 30}],
    ["mastery8", {cost: 0, masteryReq: 35}]
]);

function accessoryImageName(name: string): string{
    return `${ACCESSORY_IMAGE_DIR}accessory_${name}${IMAGE_FILE_EXTENSION}`;
}

export function findUserAccessory(userAccessories: UserAccessory[], name: string): number{
    return findName(userAccessories, name, indexMap);
}

export function getAccessoryData(userAccessories: UserAccessory[]): AccessoryData[]{
    // Used for the endpoint that gets the list of accessories
    const collection: AccessoryData[] = [];

    const badges = new Map<string, number>();
    const unlocked = new Set<string>();
    for (let x = 0; x < userAccessories.length; x++){
        badges.set(userAccessories[x].name, userAccessories[x].badges);
        if (userAccessories[x].unlocked === true){
            unlocked.add(userAccessories[x].name);
        }
    }

    for (let x = 0; x < accessories.length; x++){
        const a = accessories[x];

        const badgeCount = badges.get(a.name) ?? 0;

        collection.push({
            name: a.name,
            category: a.category,
            displayName: a.displayName,
            image: accessoryImageName(a.name),
            description: a.description,
            unlocked: unlocked.has(a.name),
            badge: {
                collected: badgeCount,
                required: a.badges,
                unlockMethod: a.unlock
            }
        });
    }

    return collection;
}

export function getAccessoryPreview(name: string): AccessoryPreview | undefined{
    const index = findName(accessories, name, indexMap);
    if (index < 0){
        return undefined;
    }
    const a = accessories[index];

    return {
        displayName: a.displayName,
        image: accessoryImageName(a.name),
        description: a.description
    };
}

export function getShopItems(userAccessories: UserAccessory[], mastery: number): ShopAccessoryPreview[]{
    const items: ShopAccessoryPreview[] = [];
    const level = getMasteryLevel(mastery).level;

    accessoryShop.forEach((value, key) => {
        const i = findName(accessories, key, indexMap);
        const u = findName(userAccessories, key, indexMap);
        if (i >= 0 && u >= 0 && level >= value.masteryReq && userAccessories[u].unlocked === false){
            items.push({
                name: key,
                displayName: accessories[i].displayName,
                image: accessoryImageName(key),
                cost: value.cost
            });
        }
    });

    return items;
}

export function accessoryClaimCost(progress: UserAccessory, mastery: number): number{
    const index = findName(accessories, progress.name, indexMap);
    if (index < 0){
        return -1;
    }

    // User has enough badges and can claim without spending any coins
    if (progress.unlocked || progress.badges >= accessories[index].badges){
        return 0;
    }

    const shopItem = accessoryShop.get(progress.name);
    // A shop item exists for this accessory and the user meets the mastery requirement to buy it
    if (shopItem !== undefined && getMasteryLevel(mastery).level >= shopItem.masteryReq){
        return shopItem.cost;
    }

    // The user does not have enough mastery or badges
    return -1;
}
