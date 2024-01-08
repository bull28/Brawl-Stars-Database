import {IMAGE_FILE_EXTENSION, RESOURCE_IMAGE_DIR} from "../data/constants";
import {
    RNG, 
    Reward, 
    CoinsReward, 
    TokenDoublerReward, 
    PinReward, 
    FixedRarityPinReward, 
    WildCardPinReward, 
    BrawlerReward, 
    TradeCreditsReward, 
    AvatarReward, 
    ThemeReward
} from "./rewards";
import {UserResources, BrawlBoxDrop} from "../types";

// Contains the cost, draws, and probabilities for a Brawl Box
interface BrawlBox{
    cost: number;
    draws: number[][];
    rewards: Reward[];
    display?: {
        name: string;
        image: string;
        description: string;
        dropsDescription: string[];
    };
}

// Brawl Box that can change reward probabilities based on its quality
interface DynamicBrawlBox{
    cost: number;
    maxQuality: number;
    draws: {
        reward: Reward;
        quality: number;
        minQuality: number;
    }[];
}

// Type of brawl box information sent to the user
interface BrawlBoxPreview{
    name: string;
    displayName: string;
    cost: number;
    image: string;
    description: string;
    dropsDescription: string[];
}


// List of all brawl boxes
const boxes: {[k: string]: BrawlBox} = {
    "brawlBox": {
        cost: 100,
        draws: [
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 1, 0, 0],
            [0, 0, 10, 5, 0, 3, 2],
            [3, 0, 2, 0, 0, 0, 0]
        ],
        rewards: [
            new Reward(),
            new CoinsReward(150, 30),
            new PinReward(),
            new WildCardPinReward(),
            new BrawlerReward(),
            new TradeCreditsReward(),
            new TokenDoublerReward(200)
        ],
        display: {
            name: "Brawl Box",
            image: "brawlbox_default",
            description: "Contains a variety of items including brawlers, pins, and bonus items.",
            dropsDescription: [
                "Coins: 120 - 180",
                "Draw 1: Pin: 2/3, Brawler: 1/3",
                "Draw 2: Pin: 1/2, Wild Card Pin: 1/4, Bonus Item: 1/4",
                "Draw 3: Pin: 2/5, Nothing: 3/5",
                "Duplicate brawlers are converted to coins."
            ]
        }
    },
    "pinPack": {
        cost: 80,
        draws: [
            [0, 1, 2],
            [0, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0],
            [2, 1, 0]
        ],
        rewards: [
            new Reward(),
            new PinReward([36, 24, 15, 9, 6], [24, 16, 10, 6, 4], [10, 10, 10, 10, 10], [20, 50, 100, 150, 250]),
            new WildCardPinReward()
        ],
        display: {
            name: "Pin Pack",
            image: "brawlbox_pinpack",
            description: "Contains only pins but has a higher chance to give rarer pins and lower chance to give duplicate pins.",
            dropsDescription: [
                "Coins: 0",
                "Draw 1: Pin: 1",
                "Draw 2: Pin: 1/3, Wild Card Pin: 2/3",
                "Draws 3 to 6: Pin: 1/3, Nothing: 2/3"
            ]
        }
    },
    "megaBox": {
        cost: 240,
        draws: [
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 8, 6, 5, 4, 1],
            [0, 1, 1, 0, 0, 0],
            [0, 1, 3, 0, 0, 0]
        ],
        rewards: [
            new CoinsReward(750, 150),
            new PinReward([36, 24, 0, 0, 0], [36, 24, 0, 0, 0], [1, 1, 1, 1, 1], [20, 50, 0, 0, 0]),
            new BrawlerReward([0, 24, 24, 16, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], 50),
            new TradeCreditsReward(),
            new TokenDoublerReward(200),
            new AvatarReward()
        ],
        display: {
            name: "Mega Box",
            image: "brawlbox_megabox",
            description: "Contains many coins, brawlers, and pins. Does not contain any brawlers above Epic rarity or pins above Rare rarity.",
            dropsDescription: [
                "Coins: 600 - 900",
                "Draws 1 to 3: Pin: 1",
                "Draw 4: Pin: 1/3, Brawler: 1/4, Bonus Item: 5/12",
                "Draw 5: Pin: 1/2, Brawler: 1/2",
                "Draw 6: Pin: 1/4, Brawler: 3/4",
                "Duplicate brawlers are converted to coins."
            ]
        }
    },
    "newBrawler": {
        cost: 0,
        draws: [
            [1]
        ],
        rewards: [
            new BrawlerReward([0, 30, 15, 12, 6, 1, 0], [0, 0, 0, 0, 0, 0, 0], 0)
        ]
    }
};

/**
 * Opens one Brawl Box and adds resources to the user. This function modifies the resources object passed to it.
 * All Brawl Boxes are guaranteed to contain at least one item. If a box is opened and there is no item, an error
 * occurred somewhere. This function also adds all required file extensions to images.
 * @param box Brawl Box to open
 * @param resources object containing all the user's resources
 * @returns array of the items the user received
 */
function openBox(box: BrawlBox, resources: UserResources): BrawlBoxDrop[]{
    if (resources === undefined){
        return [];
    }
    
    let valid = true;
    for (const x of [
        "brawlers", "avatars", "wild_card_pins", "tokens",
        "token_doubler", "coins", "trade_credits"
    ]){
        if (Object.hasOwn(resources, x) === false){
            // Resources object missing properties
            valid = false;
        }
    }
    for (let x = 0; x < box.draws.length; x++){
        if (box.draws[x].length !== box.rewards.length){
            // Box draw arrays have incorrect lengths
            valid = false;
        }
    }

    if (valid === false){
        return [];
    }

    resources.tokens -= box.cost;

    const rewards: BrawlBoxDrop[] = [];
    let coinsReward = 0;

    // Contains an array of rewards that will be added. Each element is an index in this.rewards.
    const selections = box.draws.map((value) => RNG(value))
    .filter((value) => value >= 0 && value < box.rewards.length);

    for (let x = 0; x < selections.length; x++){
        const drop = box.rewards[selections[x]].getReward(resources);

        if (drop.rewardType === "coins"){
            coinsReward += drop.amount;
        } else if (drop.rewardType !== "empty"){
            rewards.push(drop);
        }
    }

    // All coin rewards are added together in one drop object
    if (coinsReward > 0){
        rewards.splice(0, 0, {
            displayName: "Coins",
            rewardType: "coins",
            amount: coinsReward,
            inventory: resources.coins,
            image: RESOURCE_IMAGE_DIR + "resource_coins_200x" + IMAGE_FILE_EXTENSION,
            backgroundColor: "#8ca0e0",
            description: "Spend these on special avatars and other items in the shop."
        });
    }

    return rewards;
}

/**
 * Checks if the user is able to open the box they are requesting. Since is more than one reason why the user may not
 * be able to open a box, return a status code corresponding to the reason why the user can or cannot open the box.
 * @param boxName name of the box
 * @param tokens user's token count
 * @returns status code
 */
export function canOpenBox(boxName: string, tokens: number): number{
    if (Object.hasOwn(boxes, boxName) === false){
        return 400;
    }

    const box = boxes[boxName];
    if (box.cost <= 0){
        return 400;
    }
    if (tokens < box.cost){
        return 403;
    }
    return 200;
}

export const boxList: BrawlBoxPreview[] = [];
for (const x in boxes){
    const display = boxes[x].display;
    if (boxes[x].cost > 0 && display !== undefined){
        boxList.push({
            name: x,
            displayName: display.name,
            cost: boxes[x].cost,
            image: RESOURCE_IMAGE_DIR + display.image + IMAGE_FILE_EXTENSION,
            description: display.description,
            dropsDescription: display.dropsDescription
        });
    }
}

export default function brawlBox(boxName: string, resources: UserResources): BrawlBoxDrop[]{
    if (Object.hasOwn(boxes, boxName) === true){
        return openBox(boxes[boxName], resources);
    } else{
        return [];
    }
}
