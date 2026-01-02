//------------------------------------------------------------------------------------------------//

/**
 * Empty object used for a route callback
 */
export type Empty = Record<string, never>;

/**
 * Format of error responses returned by endpoints
 */
export interface ApiError{
    error: {
        title: string;
        detail: string;
        userDetail: string;
    };
}

//------------------------------------------------------------------------------------------------//

/**
 * Display for a brawler's rarity
 */
interface BrawlerRarity{
    value: number;
    name: string;
    color: string;
}

/**
 * Summary of brawler data
 */
export interface BrawlerPreview{
    name: string;
    displayName: string;
    rarity: BrawlerRarity;
    image: string;
}

/**
 * Full brawler data sent to the user
 */
export interface BrawlerData{
    name: string;
    displayName: string;
    rarity: BrawlerRarity;
    description: string;
    image: string;
    defaultSkin: string;
    title: string;
    masteryIcon: string;
    skins: SkinPreview[];
    pins: PinPreview[];
}

/**
 * Display for a skin's rarity
 */
interface SkinRarity{
    value: number;
    name: string;
    icon: string;
}

/**
 * Display information for a skin group
 */
export interface SkinGroup{
    name: string;
    image: string;
    icon: string;
}

/**
 * Cost of a skin and the required currency
 */
export interface SkinCost{
    amount: number;
    currency: string;
    icon: string;
}

/**
 * Summary of skin data
 */
export interface SkinPreview{
    name: string;
    displayName: string;
}

/**
 * Full skin data sent to the user
 */
export interface SkinData{
    name: string;
    displayName: string;
    cost: SkinCost;
    costBling: SkinCost;
    rarity: SkinRarity;
    requires: string;
    features: string[];
    groups: SkinGroup[];
    limited: boolean;
    unlock: string;
    foundIn: string[];
    release: {month: number; year: number;};
    rating: number;
    image: string;
}

/**
 * Possible option for a group in a skin search
 */
export interface SkinSearchGroup{
    name: string;
    displayName: string;
}

/**
 * All filters that can be applied when searching for skins
 */
export type SkinSearchFilters = Partial<{
    query: string;
    rarity: number;
    minCost: number;
    maxCost: number;
    groups: string[];
    foundIn: string;
    bling: boolean;
    limited: boolean;
    startDate: {
        month: number;
        year: number;
    };
    endDate: {
        month: number;
        year: number;
    };
}>;

/**
 * One skin in a result of a skin search
 */
export interface SkinSearchResult{
    name: string;
    brawler: string;
    displayName: string;
    image: string;
    background: string;
}

/**
 * Display for a pin's rarity
 */
type PinRarity = BrawlerRarity;

/**
 * Summary of pin data
 */
export interface PinPreview{
    image: string;
    rarity: PinRarity;
}

//------------------------------------------------------------------------------------------------//

/**
 * Representation of the time in an event slot
 */
export type SeasonTime = number;

/**
 * Display properties of a game mode
 * 
 * This type is used with a game mode, where the name already exists in the object
 */
export interface GameModeDisplay{
    image: string;
    backgroundColor: string;
    textColor: string;
}

/**
 * Summary of game mode data
 */
export interface GameModePreview{
    name: string;
    displayName: string;
}

/**
 * Full game mode data sent to the user
 */
export interface GameModeData{
    name: string;
    displayName: string;
    data: GameModeDisplay;
    maps: MapPreview[];
}

/**
 * Display properties but with the name included
 * 
 * This type is used with a map, where the game mode's name does not already exist in the object
 */
export interface GameModeMapDisplay extends GameModeDisplay{
    name: string;
}

/**
 * Summary of map data
 */
export type MapPreview = GameModePreview;

/**
 * Summary of map data, used when not nested in a game mode object
 */
export interface MapSearchPreview extends MapPreview{
    gameMode: GameModeMapDisplay;
}

/**
 * Full map data sent to the user
 */
export interface MapData{
    name: string;
    displayName: string;
    gameMode: GameModeMapDisplay;
    rankedMap: boolean;
    image: string;
    bannerImage: string;
    nextStart: SeasonTime;
}

/**
 * Represents an event, a game mode and map combined
 */
export interface EventData{
    gameMode: {
        name: string;
        displayName: string;
        data: GameModeDisplay;
    };
    map: {
        name: string;
        displayName: string;
        bannerImage: string;
    };
}

/**
 * Represents the state of an event slot at a particular time
 */
interface EventSlotState{
    current: EventData;
    upcoming: EventData;
    timeLeft: SeasonTime;
}

/**
 * Full current event data sent to the user
 */
export interface CurrentEvents{
    time: SeasonTime;
    valid: boolean;
    events: EventSlotState[];
}

//------------------------------------------------------------------------------------------------//

/**
 * Includes a token and the name of the user who requested it
 */
export interface UserTokenResult{
    token: string;
    username: string;
}

/**
 * Data stored for each of a user's characters
 */
export interface UserCharacter{
    name: string;
    tier: number;
}

/**
 * Data stored for each of a user's accessories
 */
export interface UserAccessory{
    name: string;
    badges: number;
    unlocked: boolean;
}

/**
 * Format of user data for updating resources
 */
export interface UserResources{
    mastery: number;
    coins: number;
    characters: UserCharacter[];
    accessories: UserAccessory[];
    last_save: number;
    menu_theme: string;
}

/**
 * Current upgrade tier of a user's character
 */
export interface UpgradeTier{
    level: number;
    name: string;
    image: string;
    color: string;
}

/**
 * Information about a user's mastery level
 */
export interface MasteryData{
    level: number;
    points: number;
    current: {
        points: number;
        image: string;
        color: string;
    };
    next: {
        points: number;
        image: string;
        color: string;
    };
}

/**
 * Summary of a character's data
 */
export interface CharacterPreview{
    name: string;
    displayName: string;
    image: string;
    masteryReq: number;
    tier: UpgradeTier;
}

type CharacterCombatStats = {[k in "health" | "damage" | "healing" | "lifeSteal"]: number};
type CharacterOtherStats = {[k in "reload" | "speed" | "range" | "targets"]: number};
export type CharacterUnlockStats = {[k in "gears" | "starPowers" | "hcLevel"]: number};
export type CharacterHyperStats = {[k in "healing" | "damage" | "speed" | "duration" | "charge"]: number};

/**
 * Stats that change when a character is upgraded
 */
interface CharacterStats{
    tier: UpgradeTier;
    stats: CharacterCombatStats;
    unlocks: CharacterUnlockStats;
    hcStats: CharacterHyperStats;
}

/**
 * Full data for a user's character
 */
export interface CharacterStatus{
    name: string;
    displayName: string;
    image: string;
    masteryReq: number;
    current: CharacterStats;
    next: CharacterStats;
    upgrade: {
        cost: number;
        masteryReq: number;
        //badgesReq: number;
    };
    otherStats: CharacterOtherStats;
}

/**
 * Full description of an enemy sent to the user
 */
export interface EnemyData{
    name: string;
    displayName: string;
    image: string;
    fullImage: string;
    enemyClass: string;
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
    } & Omit<EnemyData, "name" | "image" | "fullImage" | "enemyClass" | "enemies">)[];
}

//------------------------------------------------------------------------------------------------//

/**
 * Player stats report obtained from the game
 */
export type GameReport = number[];

/**
 * Data from a game report required to update progress
 */
export interface ReportData{
    gameMode: number;
    player: {
        difficulty: number;
        brawler: number;
        upgradeTier: number;
        starPower: number;
        gears: number[];
        accessories: number[];
    };
    score: {
        win: boolean;
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
 * Information required to show a report to the user (not used?)
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

/**
 * Player stats that increase with mastery and can be used in challenges
 */
export interface PlayerUpgrades{
    startingPower: number;
    startingGears: number;
    powerPerStage: number;
    gearsPerStage: number;
    maxExtraPower: number;
    maxExtraGears: number;
    maxAccessories: number;
}

/**
 * Information shown to the user when selecting a challenge to start
 */
export interface ChallengePreview{
    challengeid: string;
    displayName: string;
    stages: number;
    recommendedLvl: number;
}

/**
 * Reward and display configuration for a challenge
 */
export interface ChallengeConfig{
    displayName: string;
    recommendedLvl: number;
    baseWinMastery: number[];
    baseLossMastery: number[];
    baseCoins: number[];
    baseBadges: number[];
}

type GameModUpgradeValues = {
    [k in "health" | "damage" | "healing" | "lifeSteal" | "speed" | "combo" | "ability"]: {
        value?: [number, number];
        cost?: number[];
        maxLevel?: number;
    };
};

/**
 * Game modification object for a challenge, sent to the game
 */
export interface ChallengeGameMod{
    options?: Partial<{
        username: string;
        key: string;
        gameMode: number;
        gameName: string;
        startingPower: number;
        startingGears: number;
        startingHyper: number;
        bonusResources: boolean;
        addBonusEnemies: boolean;
        classicUnlocks: boolean;
        maxAccessories: number;
        maxReportLevels: number;
        upgradesAtStart: boolean;
        menuTheme: string;
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
    playerAccessories?: number[];
    playerUpgradeTiers?: Record<string, number>;
    playerUpgradeValues?: Partial<GameModUpgradeValues>;
    playerSkins?: string[];
}

/**
 * Game modification options that can be directly set by the user
 * 
 * Only includes cosmetic preferences, not gameplay options
 */
export interface UserSetGameMod{
    playerSkins?: string[];
    hiddenBrawlers?: string[];
}

/**
 * Multipliers for each type of reward the player can receive from a challenge
 */
export interface ChallengeRewardResult{
    mastery: number;
    coins: number;
    badges: number;
}

/**
 * Defines the operations that the handler for a challenge category must support
 */
export interface ChallengeCategory{
    challengeExists: (challengeid: string) => boolean;
    getChallengeList: () => ChallengePreview[];
    getGameMod: (challengeid: string) => ChallengeGameMod | undefined;
    getRewards: (challengeid: string, difficulty: number, win: boolean) => ChallengeRewardResult;
}

//------------------------------------------------------------------------------------------------//

/**
 * Information required to display an accessory as a reward
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
        unlockMethod: string;
    };
}

export interface ShopAccessory{
    cost: number;
    masteryReq: number;
}

export interface ShopAccessoryPreview{
    name: string;
    displayName: string;
    image: string;
    cost: number;
}

//------------------------------------------------------------------------------------------------//
