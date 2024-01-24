import {IMAGE_FILE_EXTENSION, RESOURCE_IMAGE_DIR} from "../data/constants";
import {
    RNG, 
    createCoinsReward, 
    createPointsReward, 
    Reward, 
    CoinsReward, 
    TokenDoublerReward, 
    PinReward, 
    FixedRarityPinReward, 
    WildCardPinReward, 
    BrawlerReward, 
    TradeCreditsReward, 
    AvatarReward, 
    ThemeReward, 
    AccessoryReward
} from "./rewards";
import {UserResources, BrawlBoxDrop, ReportData} from "../types";

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

// Brawl Box that can change reward probabilities based on its quality, used for game rewards
interface GameBrawlBox{
    maxQuality: number;
    draws: {
        quality: number;
        minQuality: number;
        reward: Reward;
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
const boxes: Record<string, BrawlBox> = {
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

const gameBoxes: GameBrawlBox[] = [
    {
        maxQuality: 240,
        draws: [
            {quality: 240,  minQuality: 60,    reward: new BrawlerReward([0, 40, 24, 0, 0, 0, 0])},
            {quality: 70,   minQuality: 0,     reward: new FixedRarityPinReward(0)},
            {quality: 240,  minQuality: 12,    reward: new FixedRarityPinReward(1)},
            {quality: 240,  minQuality: 120,   reward: new WildCardPinReward([1, 0, 0, 0, 0])},
            {quality: 640,  minQuality: 24,    reward: new TradeCreditsReward()},
            {quality: 1120, minQuality: 24,    reward: new TokenDoublerReward(300)},
            {quality: 2400, minQuality: 224,   reward: new AccessoryReward([80, 64, 96])}
        ]
    },
    {
        maxQuality: 320,
        draws: [
            {quality: 320,  minQuality: 80,    reward: new BrawlerReward([0, 24, 24, 16, 0, 0, 0])},
            {quality: 90,   minQuality: 0 ,    reward: new FixedRarityPinReward(0)},
            {quality: 180,  minQuality: 16,    reward: new FixedRarityPinReward(1)},
            {quality: 320,  minQuality: 160,   reward: new WildCardPinReward([12, 5, 0, 0, 0])},
            {quality: 640,  minQuality: 32,    reward: new TradeCreditsReward()},
            {quality: 1120, minQuality: 32,    reward: new TokenDoublerReward(300)},
            {quality: 2000, minQuality: 272,   reward: new AccessoryReward([90, 60, 90])}
        ]
    },
    {
        maxQuality: 360,
        draws: [
            {quality: 360,  minQuality: 90,    reward: new BrawlerReward([0, 12, 24, 20, 8, 0, 0])},
            {quality: 90,   minQuality: 0,     reward: new FixedRarityPinReward(0)},
            {quality: 180,  minQuality: 18,    reward: new FixedRarityPinReward(1)},
            {quality: 720,  minQuality: 108,   reward: new FixedRarityPinReward(2)},
            {quality: 360,  minQuality: 180,   reward: new WildCardPinReward([12, 6, 0, 0, 0])},
            {quality: 600,  minQuality: 36,    reward: new TradeCreditsReward()},
            {quality: 1120, minQuality: 36,    reward: new TokenDoublerReward(300)},
            {quality: 1800, minQuality: 304,   reward: new AccessoryReward([100, 56, 84])}
        ]
    },
    {
        maxQuality: 440,
        draws: [
            {quality: 440,  minQuality: 110,   reward: new BrawlerReward([0, 0, 28, 24, 12, 0, 0])},
            {quality: 100,  minQuality: 0,     reward: new FixedRarityPinReward(0)},
            {quality: 200,  minQuality: 22,    reward: new FixedRarityPinReward(1)},
            {quality: 600,  minQuality: 132,   reward: new FixedRarityPinReward(2)},
            {quality: 440,  minQuality: 220,   reward: new WildCardPinReward([12, 5, 2, 0, 0])},
            {quality: 576,  minQuality: 44,    reward: new TradeCreditsReward()},
            {quality: 1120, minQuality: 44,    reward: new TokenDoublerReward(300)},
            {quality: 1760, minQuality: 384,   reward: new AccessoryReward([105, 54, 81])}
        ]
    },
    {
        maxQuality: 480,
        draws: [
            {quality: 480,  minQuality: 120,   reward: new BrawlerReward([0, 0, 20, 24, 12, 8, 0])},
            {quality: 104,  minQuality: 0,     reward: new FixedRarityPinReward(0)},
            {quality: 192,  minQuality: 24,    reward: new FixedRarityPinReward(1)},
            {quality: 384,  minQuality: 144,   reward: new FixedRarityPinReward(2)},
            {quality: 960,  minQuality: 240,   reward: new FixedRarityPinReward(3)},
            {quality: 480,  minQuality: 240,   reward: new WildCardPinReward([18, 8, 4, 0, 0])},
            {quality: 576,  minQuality: 48,    reward: new TradeCreditsReward()},
            {quality: 1000, minQuality: 48,    reward: new TokenDoublerReward(300)},
            {quality: 14400,minQuality: 440,   reward: new ThemeReward()},
            {quality: 1600, minQuality: 416,   reward: new AccessoryReward([110, 52, 78])}
        ]
    },
    {
        maxQuality: 640,
        draws: [
            {quality: 640,  minQuality: 160,   reward: new BrawlerReward([0, 0, 0, 28, 24, 12, 0])},
            {quality: 128,  minQuality: 0,     reward: new FixedRarityPinReward(0)},
            {quality: 216,  minQuality: 32,    reward: new FixedRarityPinReward(1)},
            {quality: 320,  minQuality: 192,   reward: new FixedRarityPinReward(2)},
            {quality: 640,  minQuality: 320,   reward: new FixedRarityPinReward(3)},
            {quality: 640,  minQuality: 320,   reward: new WildCardPinReward([15, 8, 5, 2, 0])},
            {quality: 576,  minQuality: 64,    reward: new TradeCreditsReward()},
            {quality: 1000, minQuality: 64,    reward: new TokenDoublerReward(300)},
            {quality: 12800,minQuality: 520,   reward: new ThemeReward()},
            {quality: 64000,minQuality: 600,   reward: new AvatarReward()},
            {quality: 1280, minQuality: 560,   reward: new AccessoryReward([120, 48, 72])}
        ]
    }
];

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

    // Contains an array of rewards that will be added. Each element is an index in box.rewards.
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
        rewards.splice(0, 0, createCoinsReward(coinsReward, resources.coins));
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

/**
 * Gets all rewards for one run of the game. The game rewards a brawl boxe based on which difficulty the user played.
 * The number of enemies defeated during the run determines the quality of the box. This function modifies the
 * resources object passed to it.
 * @param resources object containing all the user's resources
 * @param report valid game report
 * @returns array of the items the user received
 */
export function getGameReward(resources: UserResources, report: ReportData): BrawlBoxDrop[]{
    if (resources === undefined){
        return [];
    }

    let valid = true;
    for (const x of [
        "brawlers", "avatars", "wild_card_pins", "tokens",
        "token_doubler", "coins", "trade_credits"
    ]){
        if (Object.hasOwn(resources, x) === false){
            valid = false;
        }
    }
    if (valid === false){
        return [];
    }
    if (report.player.difficulty >= gameBoxes.length){
        return [];
    }

    const box = gameBoxes[report.player.difficulty];
    const quality = Math.min(report.enemies, box.maxQuality);

    const rewards: BrawlBoxDrop[] = [];
    let coinsReward = 0;

    // The points reward is separate from all other rewards because it is given exactly once, no matter the box quality
    resources.points += report.points;
    rewards.push(createPointsReward(report.points, resources.points));

    for (let x = 0; x < box.draws.length; x++){
        const draw = box.draws[x];
        let count = 0;

        // The value of count determines how many rewards this draw gives. The integer part of the value is the number
        // of guaranteed rewards. The fractional part of the value is the chance to get one extra reward.
        if (quality >= draw.minQuality && draw.quality > 0){
            count = quality / draw.quality;
        }
        if (Math.random() < count % 1){
            count = Math.ceil(count);
        } else{
            count = Math.floor(count);
        }

        for (let i = 0; i < count; i++){
            let drop: BrawlBoxDrop;
            if (draw.reward instanceof AccessoryReward){
                drop = draw.reward.getReward(resources, report.badges);
            } else{
                drop = draw.reward.getReward(resources);
            }

            if (drop.rewardType === "coins"){
                coinsReward += drop.amount;
            } else if (drop.rewardType !== "empty"){
                rewards.push(drop);
            }
        }
    }

    // Extra coins are given for each enemy defeated
    if (report.coins[0] <= report.coins[1]){
        const bonusCoins = Math.floor(report.coins[0] + Math.random() * (report.coins[1] - report.coins[0] + 1));
        coinsReward += bonusCoins;
        resources.coins += bonusCoins;
    }

    if (coinsReward > 0){
        rewards.splice(0, 0, createCoinsReward(coinsReward, resources.coins));
    }

    return rewards;
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
