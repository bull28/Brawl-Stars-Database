import accessoryList from "../data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, ACCESSORY_IMAGE_DIR} from "../data/constants";
import {findName} from "./utils";
import {getMasteryLevel} from "../modules/resources_module";
import {UserAccessory, AccessoryPreview, AccessoryData, ShopAccessoryPreview} from "../types";

interface AccessoryConfig{
    name: string;
    category: string;
    displayName: string;
    description: string;
    unlock: string;
    badges: number;
    masteryReq: number;
}

export interface ShopItemConfig{
    cost: number;
    masteryReq: number;
}

const accessories: AccessoryConfig[] = [];
const indexMap = new Map<string, number>();
for (let x = 0; x < accessoryList.length; x++){
    const a = accessoryList[x];
    accessories.push({
        name: a.name, category: a.category, displayName: a.displayName, description: a.description,
        unlock: a.unlock, badges: a.badges, masteryReq: a.masteryReq
    });
    indexMap.set(a.name, x);
}

const accessoryShop = new Map<string, number>([
    ["shop1", 1500],
    ["shop2", 1500],
    ["shop3", 2500],
    ["shop4", 2500],
    ["shop5", 4000],
    ["shop6", 5000],
    ["shop7", 6000],
    ["shop8", 6000],
    ["brawlbox1", 25000],
    ["brawlbox2", 27000],
    ["brawlbox3", 12000],
    ["brawlbox4", 15000],
    ["brawlbox5", 30000],
    ["brawlbox6", 8000],
    ["brawlbox7", 9000],
    ["mastery1", 0],
    ["mastery2", 0],
    ["mastery3", 0],
    ["mastery4", 0],
    ["mastery5", 0],
    ["mastery6", 0],
    ["mastery7", 0],
    ["mastery8", 0]
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
                masteryReq: a.masteryReq,
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
        if (i >= 0 && u >= 0 && level >= accessories[i].masteryReq && userAccessories[u].unlocked === false){
            items.push({
                name: key,
                displayName: accessories[i].displayName,
                image: accessoryImageName(key),
                cost: value
            });
        }
    });

    return items;
}

export function accessoryClaimCost(progress: UserAccessory, mastery: number): number{
    const index = findName(accessories, progress.name, indexMap);

    // The user does not meet the mastery level requirement to claim the accessory
    if (index < 0 || getMasteryLevel(mastery).level < accessories[index].masteryReq){
        return -1;
    }

    // User has enough badges and can claim without spending any coins
    if (progress.unlocked || progress.badges >= accessories[index].badges){
        return 0;
    }

    const shopItem = accessoryShop.get(progress.name);
    // A shop item exists for this accessory and the user meets the mastery requirement to buy it
    // The user does not have enough mastery or badges
    return shopItem ?? -1;
}
