import allSkins from "./data/brawlers_data.json";
import eventList from "./data/maps_data.json";

//------------------------------------------------------------------------------------------------//
//                                           Route Types                                          //
//------------------------------------------------------------------------------------------------//

/**
 * Empty object used for a route callback
 */
export type Empty = Record<string, never>;

/**
 * Request body type for a route that requires authentication
 */
export interface TokenReqBody{
    token: string;
}

//------------------------------------------------------------------------------------------------//
//                                          Brawler Types                                         //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a brawler from the data file
 */
export type Brawler = typeof allSkins[number];

/**
 * Summary of brawler data
 */
export interface BrawlerPreview{
    name: Brawler["name"];
    displayName: Brawler["displayName"];
    rarity: Brawler["rarity"];
    image: Brawler["image"];
}

/**
 * Full brawler data sent to the user
 */
export interface BrawlerData{
    name: Brawler["name"];
    displayName: Brawler["displayName"];
    rarity: Brawler["rarity"];
    description: Brawler["description"];
    image: Brawler["image"];
    defaultSkin: Brawler["defaultSkin"];
    title: Brawler["title"];
    masteryIcon: Brawler["masteryIcon"];
    skins: SkinPreview[];
    pins: PinPreview[];
}

//------------------------------------------------------------------------------------------------//
//                                           Skin Types                                           //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a skin from the data file
 */
export type Skin = typeof allSkins[number]["skins"][number];

/**
 * Type that allows checking whether a 3D model exists before trying to load it
 */
export interface ModelData{
    geometry: {
        exists: boolean;
        path: string;
    };
    winAnimation: {
        exists: boolean;
        path: string;
    };
    loseAnimation: {
        exists: boolean;
        path: string;
    };
}

/**
 * Summary of skin data
 */
export interface SkinPreview{
    name: Skin["name"];
    displayName: Skin["displayName"];
}

/**
 * Full skin data sent to the user
 */
export interface SkinData{
    name: Skin["name"];
    displayName: Skin["displayName"];
    cost: Skin["cost"];
    currency: Skin["currency"];
    costBling: Skin["costBling"];
    requires: Skin["requires"];
    features: Skin["features"];
    group: Skin["group"];
    limited: Skin["limited"];
    rating: Skin["rating"];
    image: Skin["image"];
    model: ModelData;
}

//------------------------------------------------------------------------------------------------//
//                                            Pin Types                                           //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a pin from the data file
 */
export type Pin = typeof allSkins[number]["pins"][number];

/**
 * Summary of pin data
 */
export interface PinPreview{
    image: Pin["image"];
    rarity: Pin["rarity"];
}

//------------------------------------------------------------------------------------------------//
//                                         Game Mode Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a game mode from the data file
 */
export type GameModeAttributes = typeof eventList[number]["gameModes"][number];

/**
 * Display properties of a game mode
 * 
 * This type is used with a game mode, where the name already exists in the object
 */
export type GameModeDisplay = typeof eventList[number]["gameModes"][number]["data"];

/**
 * Summary of game mode data
 */
export interface GameModePreview{
    name: GameModeAttributes["name"];
    displayName: GameModeAttributes["displayName"];
}

/**
 * Full game mode data sent to the user
 */
export interface GameModeData{
    name: GameModeAttributes["name"];
    displayName: GameModeAttributes["displayName"];
    data: GameModeDisplay;
    maps: MapPreview[];
}

//------------------------------------------------------------------------------------------------//
//                                            Map Types                                           //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a map from the data file
 */
export type MapAttributes = typeof eventList[number]["gameModes"][number]["maps"][number];

/**
 * Display properties but with the name included
 * 
 * This type is used with a map, where the game mode's name does not already exist in the object
 */
export interface GameModeMapDisplay extends GameModeDisplay{
    name: GameModeAttributes["name"];
}

/**
 * Summary of map data
 */
export interface MapPreview{
    name: MapAttributes["name"];
    displayName: MapAttributes["displayName"];
};

/**
 * Summary of map data, used when not nested in a game mode object
 */
export interface MapSearchPreview extends MapPreview{
    gameMode: GameModeMapDisplay;
}

/**
 * Contains the times that a map will become active
 */
export interface NextStartTimes{
    all: SeasonTimeData[];
    next: SeasonTimeData;
    duration: SeasonTimeData;
}

/**
 * Full map data sent to the user
 */
export interface MapData{
    name: MapAttributes["name"];
    displayName: MapAttributes["displayName"];
    gameMode: GameModeMapDisplay;
    powerLeagueMap: MapAttributes["powerLeagueMap"];
    image: MapAttributes["image"];
    bannerImage: MapAttributes["bannerImage"];
    times: NextStartTimes;
}

//------------------------------------------------------------------------------------------------//
//                                           Event Types                                          //
//------------------------------------------------------------------------------------------------//

/**
 * Copy of SeasonTime attributes, used only to define other types
 * 
 * This is defined here to avoid maps importing this file and this file importing maps
 */
interface SeasonTimeData{
    season: number;
    hour: number;
    minute: number;
    second: number;
    hoursPerSeason: number;
    maxSeasons: number;
}

/**
 * Represents an event, a game mode and map combined
 */
export interface EventData{
    gameMode: {
        name: GameModeAttributes["name"];
        displayName: GameModeAttributes["displayName"];
        data: GameModeDisplay;
    };
    map: {
        name: MapAttributes["name"];
        displayName: MapAttributes["displayName"];
        bannerImage: MapAttributes["bannerImage"];
    };
}

/**
 * Represents the state of an event slot at a particular time
 */
export interface CurrentEvent{
    current: EventData;
    upcoming: EventData;
    timeLeft: SeasonTimeData;
}

/**
 * Full current event data sent to the user
 */
export interface CurrentEventsData{
    time: SeasonTimeData;
    events: CurrentEvent[];
}

//------------------------------------------------------------------------------------------------//
//                                          Account Types                                         //
//------------------------------------------------------------------------------------------------//

/**
 * Payload that is signed using the json web token
 */
export interface UserTokenResult{
    token: string;
    username: string;
}

//------------------------------------------------------------------------------------------------//
//                                        Collection Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Parsed format of the brawler object that is stored in the database as text
 */
export type DatabaseBrawlers = Record<string, Record<string, number>>;

/**
 * Formatted collection data
 */
export interface CollectionData{
    unlockedBrawlers: number;
    completedBrawlers: number;
    totalBrawlers: number;
    unlockedPins: number;
    totalPins: number;
    pinCopies: number;
    unlockedAccessories: number;
    totalAccessories: number;
    collectionScore: string;
    scoreProgress: number;
    avatarColor: string;
    pinRarityColors: string[];
    brawlers: CollectionBrawler[];
    accessories: CollectionAccessory[];
}

/**
 * Brawler object in formatted collection data
 */
export interface CollectionBrawler{
    name: Brawler["name"];
    displayName: Brawler["displayName"];
    rarityColor: Brawler["rarity"]["color"];
    i: Brawler["image"];
    u: boolean;
    unlockedPins: number;
    totalPins: number;
    pinCopies: number;
    pinFilePath: string;
    pins: CollectionPin[];
}

/**
 * Pin object in formatted collection data
 */
export interface CollectionPin{
    i: Pin["image"];
    r: Pin["rarity"]["value"];
    a: number;
}

//------------------------------------------------------------------------------------------------//
//                                       Cosmetic Item Types                                      //
//------------------------------------------------------------------------------------------------//

/**
 * Storage of either avatar or theme lists in one object
 */
interface DefaultCosmeticList{
    free: string[];
    special: string[];
}

/**
 * Storage of both free and special avatar file paths in one object
 */
export type AvatarList = DefaultCosmeticList;
/**
 * Storage of both free and special theme file paths in one object
 */
export type ThemeList = DefaultCosmeticList;
/**
 * Storage of all scene file paths in one object
 */
export type SceneList = string[];

/**
 * Parsed format of the avatars array that is stored in the database as text
 */
export type DatabaseAvatars = string[];
/**
 * Parsed format of the themes array that is stored in the database as text
 */
export type DatabaseThemes = string[];
/**
 * Parsed format of the scenes array that is stored in the database as text
 */
export type DatabaseScenes = string[];
/**
 * Parsed format of the wild card pins array that is stored in the database as text
 */
export type DatabaseWildCard = number[];

/**
 * Represents either a request to set cosmetics or the result of getting cosmetics
 */
export interface DatabaseCosmetics{
    background: string;
    icon: string;
    music: string;
    scene: string;
}

/**
 * Information required to preview a theme on the gallery screen
 */
interface ThemePreview{
    displayName: string;
    path: string;
}

/**
 * Information required to preview an icon on the gallery screen
 * 
 * The icon's image is not suitable for a preview so an alternative image must be displayed
 */
interface ThemeIconPreview{
    displayName: string;
    path: string;
    preview: string;
}

/**
 * Information required to preview a scene on the gallery screen
 * 
 * Also includes a background that can be used with the scene instead of the default background
 */
export interface ThemeScenePreview{
    displayName: string;
    path: string;
    preview: string;
    background: string;
}

/**
 * Full cosmetics preview object sent to the user
 */
export interface ThemeData{
    background: ThemePreview[];
    icon: ThemeIconPreview[];
    music: ThemePreview[];
    scene: ThemeScenePreview[];
}

//------------------------------------------------------------------------------------------------//
//                                           Shop Types                                           //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a shop item from the data file
 */
export interface ShopItemData{
    displayName: string;
    cost: number;
    itemType: string;
    image: string;
    extraData: string;
    amount: number;
    description: string;
}

/**
 * Shop data file represented as a map from shop item names to their objects
 */
export type ShopList = Map<string, ShopItemData>;

/**
 * Cosmetic items are only available for users who have made enough progress in their collection
 */
export interface AchievementItems{
    avatars: Set<string>;
    themes: Set<string>;
    scenes: Set<string>;
    accessories: Set<string>;
}

//------------------------------------------------------------------------------------------------//
//                                         Brawl Box Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * This is the format of the user's resources that the
 * brawl box function reads from and modifies
 */
export interface UserResources{
    brawlers: DatabaseBrawlers;
    avatars: DatabaseAvatars;
    themes: DatabaseThemes;
    scenes: DatabaseScenes;
    accessories: DatabaseAccessories;
    wild_card_pins: DatabaseWildCard;
    tokens: number;
    token_doubler: number;
    coins: number;
    points: number;
    trade_credits: number;
}

/**
 * Represents the result of one brawl box drop
 * 
 * No computations are done on this and it is only sent to the user
 */
export interface BrawlBoxDrop{
    displayName: string;
    rewardType: string;
    amount: number;
    inventory: number;
    image: string;
    backgroundColor: string;
    description: string;
}

//------------------------------------------------------------------------------------------------//
//                                           Trade Types                                          //
//------------------------------------------------------------------------------------------------//

/**
 * Represents a pin in either offer or request, received from the user
 * 
 * The pin is stored as either an image or pin name
 */
export interface TradePin{
    brawler: Brawler["name"];
    pin: string;
    amount: number;
}

/**
 * A pin in a trade that has been validated and had its rarity determined
 * 
 * Validating a pin replaces the pin attribute with its name
 */
export interface TradePinValid extends TradePin{
    rarityValue: Pin["rarity"]["value"];
    rarityColor: Pin["rarity"]["color"];
}

/**
 * A pin in a preview of a trade, sent to the user
 */
export interface TradePinData{
    pinImage: Pin["image"];
    amount: number;
    rarityValue: Pin["rarity"]["value"];
    rarityColor: Pin["rarity"]["color"];
}

/**
 * Information required to show a trade to the user
 */
interface TradeData{
    tradeid: number;
    cost: number;
    offer: TradePinData[];
    request: TradePinData[];
    timeLeft: number;
}

/**
 * Information required to show a trade to the user
 * 
 * This type is specific to the search by user endpoint
 */
export interface TradeUserData extends TradeData{
    accepted: boolean;
}

/**
 * Information required to show a trade to the user
 * 
 * This type if specific to the search all trades endpoint
 */
export interface TradeAllData extends TradeData{
    creator: {
        username: string;
        avatar: string;
        avatarColor: string;
    }
}

//------------------------------------------------------------------------------------------------//
//                                         Accessory Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Parsed format of the accessories array that is stored in the database as text
 */
export type DatabaseAccessories = string[];

/**
 * Parsed format of the badges object that is stored in the database as text
 */
export type DatabaseBadges = Record<string, number>;

/**
 * Represents a reward of badges for an accessory
 * 
 * This shows the user the progress they made towards unlocking an accessory
 */
export interface BadgeReward{
    displayName: string;
    unlock: string;
    amount: number;
}

/**
 * Accessory object in formatted collection data
 */
export interface CollectionAccessory{
    name: string;
    displayName: string;
    image: string;
    unlocked: boolean;
}

/**
 * Information required to display an accessory in a brawl box
 */
export interface AccessoryPreview{
    displayName: string;
    image: string;
    description: string;
}

/**
 * Full accessory data sent to the user
 */
export interface AccessoryData{
    name: string;
    category: string;
    displayName: string;
    image: string;
    description: string;
    unlocked: boolean;
    badge: {
        collected: number;
        required: number;
        image: string;
        unlockMethod: string;
    };
}

/**
 * Information about a user's mastery level
 */
export interface MasteryData{
    level: number;
    points: number;
    currentLevel: number;
    nextLevel: number;
    image: string;
    color: string;
}

//------------------------------------------------------------------------------------------------//
//                                        Game Report Types                                       //
//------------------------------------------------------------------------------------------------//

/**
 * Player stats report obtained from the game
 */
export type GameReport = [number, number, number[]];

/**
 * Data from a game report required to update progress
 */
export interface ReportData{
    gameMode: number;
    player: {
        difficulty: number;
        brawler: number;
        starPower: number;
        gears: number[];
        accessories: number[];
    };
    score: {
        total: number;
        categories: {
            completion: number;
            time: number;
            destination: number;
            health: number;
            gear: number;
            enemy: number;
        };
    };
    enemies: number;
    coins: [number, number];
    points: number;
    badges: Map<string, number>;
}

/**
 * Information required to show a report to the user
 */
export interface ReportPreview{
    reportid: number;
    endTime: number;
    cost: number;
    title: string;
    stats: {
        score: number;
        enemies: number;
        win: boolean;
        difficulty: string;
        brawler: {
            displayName: string;
            image: string;
        };
        starPower: {
            displayName: string;
            image: string;
        };
        gears: {
            displayName: string;
            image: string;
        }[];
        accessories: {
            displayName: string;
            image: string;
        }[];
    };
}

//------------------------------------------------------------------------------------------------//
//                                         Challenge Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Full description of an enemy sent to the user
 */
export interface EnemyData{
    name: string;
    displayName: string;
    image: string;
    fullImage: string;
    description: string;
    strengthTier: string;
    value: number;
    health: number;
    speed: number;
    attacks: {
        displayName: string;
        minDamage: number;
        maxDamage: number;
        damageType: number;
        range: number;
        reload: number;
        knockback: number;
        fireDamage: number;
        description: string;
    }[];
    enemies: ({
        count: number;
    } & Omit<EnemyData, "name" | "image" | "fullImage" | "enemies">)[];
}

/**
 * Data for player upgrade values in a game modification object
 */
type GameModUpgradeValues = {
    [k in "health" | "damage" | "healing" | "speed" | "ability" | "lifeSteal"]: {
        value?: [number, number];
        cost?: number[];
        maxLevel?: number;
    };
};

/**
 * Player's offense and defense upgrade progression values in challenges
 */
export type PlayerUpgrades = {
    offense: {
        startingPower: number;
        startingGears: number;
        powerPerStage: number;
        gearsPerStage: number;
        maxExtraPower: number;
        maxExtraGears: number;
        maxAccessories: number;
    } & {
        [k in keyof GameModUpgradeValues]: number;
    };
    defense: {
        difficulty: number;
        maxEnemies: number[];
        enemyStats: number[];
        waves: number[][];
    };
};

/**
 * Player upgrade progression and enemies available in challenges, sent to the user
 */
export interface ChallengeUpgrades{
    offense: PlayerUpgrades["offense"];
    defense: PlayerUpgrades["defense"];
    enemies: {
        name: string;
        displayName: string;
        image: string;
        value: number;
        maxCount: number;
    }[];
}

/**
 * Storage of one wave in a challenge
 */
export interface ChallengeWave{
    level: number;
    enemies: string[];
    delay?: number;
    maxEnemies?: number;
}

/**
 * Format of challenge waves that the user inputs
 */
export type UserWaves = Pick<ChallengeWave, "level" | "enemies">[];

/**
 * Data required to create a game modification object for a challenge
 */
export interface ChallengeData{
    owner: string;
    difficulty: number;
    levels: number;
    stats: number[];
    waves: ChallengeWave[];
}

/**
 * Game modification object for a challenge, sent to the game
 */
export interface ChallengeGameMod{
    options?: Partial<{
        key: string;
        gameMode: number;
        gameName: string;
        startingPower: number;
        startingGears: number;
        bonusResources: boolean;
        addBonusEnemies: boolean;
        maxAccessories: number;
        maxReportLevels: number;
    }>;
    difficulties?: {
        difficultyid: number;
        name: string;
        countTier: number;
        strengthTier: number;
        healthBonusReq: number;
        timePerEnemy: number;
        enemyStats: number[];
    }[];
    stages?: {
        completion: number;
        time: number;
        powerReward: number;
        gearsReward: number;
    }[];
    levels?: {
        levelid: number;
        waves: {
            names: string[][];
            multiple: {
                name: string;
                count: number[];
            }[];
            delay?: number;
            maxEnemies?: number;
            onDifficulty?: number;
        }[];
        background: string;
        displayName: string;
        stages: number[];
        destination: number;
    }[];
    maxScores?: {
        completion: number;
        time: number;
        destination: number;
        health: number;
        gear: number;
        enemy: number;
    };
    playerAccessories?: string[];
    playerUpgradeValues?: Partial<GameModUpgradeValues>;
}

//------------------------------------------------------------------------------------------------//
