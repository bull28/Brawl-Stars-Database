import allSkins from "./data/brawlers_data.json";
import eventList from "./data/maps_data.json";

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
    gameModeData: GameModeMapDisplay;
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
export type DatabaseBrawlers = Map<string, Map<string, number>>;

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
    collectionScore: string;
    scoreProgress: number;
    avatarColor: string;
    pinRarityColors: string[];
    brawlers: CollectionBrawler[];
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
interface ThemeDescription{
    displayName: string;
    path: string;
}

/**
 * Information required to preview a theme on the gallery screen
 * 
 * Some themes such as icons and scenes require a preview because they
 * have no image or their image is not descriptive enough
 */
export interface ThemeDescriptionPreview extends ThemeDescription{
    preview: string;
}

/**
 * Full cosmetics preview object sent to the user
 */
export interface ThemeData{
    background: ThemeDescription[];
    icon: ThemeDescriptionPreview[];
    music: ThemeDescription[];
    scene: ThemeDescriptionPreview[];
}

//------------------------------------------------------------------------------------------------//
//                                           Shop Types                                           //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a shop item from the data file
 */
export interface ShopItem{
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
export type ShopList = Map<string, ShopItem>;

//------------------------------------------------------------------------------------------------//
//                                         Brawl Box Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Attributes of a brawl box from the data file
 */
export interface BrawlBoxAttributes{
    displayName: string;
    cost: number;
    image: string;
    description: string;
    dropsDescription: string[];
    draws: number[][];
    rewardTypeValues: string[];
}

/**
 * Hidden brawl boxes are not intended to be opened directly by
 * the user and do not have all the visual attributes
 */
export interface HiddenBrawlBoxAttributes{
    cost: number;
    image: string;
    draws: number[][];
    rewardTypeValues: string[];
}

/**
 * Value and weight of a random variable in a probability distribution
 * 
 * The weight describes its probability relative to all other values
 * in the distribution
 */
export interface PmfValue{
    value: number | string;
    weight: number;
}

// Various reward types available in brawl boxes
/**
 * Reward containing only a numeric amount of currency
 */
export interface RewardTypeCurrency{
    minAmount: number;
    maxAmount: number;
}
/**
 * Reward type with multiple tiers and a probability mass function to
 * determine which tier is selected
 * 
 * Also contains a coin conversion value for each tier and a
 * multiplier to make duplicates less common
 */
export interface RewardTypePin{
    raritypmf: number[];
    minraritypmf: number[];
    newPinWeight: number[];
    coinConversion: number[];
}
/**
 * Reward type with multiple tiers and a probability mass function to
 * determine which tier is selected
 * 
 * Also contains a coin conversion value for each tier but has
 * no multiplier for duplicates
 */
export interface RewardTypeBrawler{
    raritypmf: number[];
    minraritypmf: number[];
    coinConversion: number[];
}
/**
 * Reward type that includes a set of rewards and a probability mass
 * function that determines which reward is selected
 */
export interface RewardTypeBonus{
    pmfobject: PmfValue[];
}

/**
 * Full brawl box drop chances object with rewards
 */
export interface BrawlBoxData{
    boxes: Map<string, BrawlBoxAttributes | HiddenBrawlBoxAttributes>;
    rewardTypes: Map<string, 
    RewardTypeCurrency | RewardTypePin | RewardTypeBrawler | RewardTypeBonus>;
}

/**
 * This is the format of the user's resources that the
 * brawl box function reads from and modifies
 */
export interface UserResources{
    brawlers: DatabaseBrawlers;
    avatars: DatabaseAvatars;
    wild_card_pins: DatabaseWildCard;
    tokens: number;
    token_doubler: number;
    coins: number;
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
 * A pin in a trade that has been validated had its rarity determined
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
    timeLeft: SeasonTimeData;
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
//                                         Challenge Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Represents a position in a 2D grid
 */
export type Point = [number, number];

/**
 * Represents the index of a unit in storage
 * 
 * The first number is the player and the second is the index
 * of the unit in that player's array
 */
export type UnitIndex = [number, number];

/**
 * Functions used by an ability to determine unit stats
 */
export interface Ability{
    update: (state: number, event: number) => number;
    health: (values: number[], owner: AbilityStats, event: number) => number;
    shield: (values: number[], owner: AbilityStats, event: number) => number;
    maxHealth: (values: number[], owner: AbilityStats) => number;
    damage: (values: number[], owner: AbilityStats) => number;
    range: (values: number[], owner: AbilityStats) => number;
    targets: (values: number[], owner: AbilityStats) => number;
    speed: (values: number[], owner: AbilityStats) => number;
    specialMoves: (owner: AbilityStats) => boolean;
    specialAttacks: (owner: AbilityStats) => boolean;
    damageToUnit: (
        values: number[], 
        owner: AbilityStats, 
        ownerDamage: number, 
        opponent: AbilityStats, 
        opponentAbilities: UpgradedAbility
    ) => number;
    description: (state: number) => string;
}

/**
 * Functions used by an ability to determine unit stats
 * 
 * These functions represent an upgraded ability because they have been
 * partially applied with stat values at a specific level
 */
export interface UpgradedAbility{
    update: (state: number, event: number) => number;
    health: (owner: AbilityStats, event: number) => number;
    shield: (owner: AbilityStats, event: number) => number;
    maxHealth: (owner: AbilityStats) => number;
    damage: (owner: AbilityStats) => number;
    range: (owner: AbilityStats) => number;
    targets: (owner: AbilityStats) => number;
    speed: (owner: AbilityStats) => number;
    specialMoves: (owner: AbilityStats) => boolean;
    specialAttacks: (owner: AbilityStats) => boolean;
    damageToUnit: (
        owner: AbilityStats, 
        ownerDamage: number, 
        opponent: AbilityStats, 
        opponentAbilities: UpgradedAbility
    ) => number;
    description: (state: number) => string;
}

/**
 * Contains four arrays of numbers that abilities have
 * access to when determining stat values
 * 
 * Health array is available to the health, shield, and maxHealth abilities
 * 
 * Damage array is available to the damage and damageToUnit abilities
 * 
 * Range array is available to the range ability
 * 
 * Other array is available to the targets and speed abilities
 */
interface AbilityValueList{
    health: number[];
    damage: number[];
    range: number[];
    other: number[];
}

/**
 * Object containing unit stat values
 */
interface BasicStats{
    health: number;
    shield: number;
    damage: number;
    range: number;
    targets: number;
    speed: number;
    specialMoves: boolean;
    specialAttacks: boolean;
}

/**
 * Contains all stat values that are returned for
 * each unit when getting the challenge state
 */
export interface UnitStats extends BasicStats{
    maxHealth: number;
}

/**
 * Contains all stat values on a unit that abilities
 * have access to
 */
export interface AbilityStats extends BasicStats{
    maxHealth: number;
    positionPoint: Point;
    state: number;
}

/**
 * Represents a rectangle on a 2D grid where players
 * cannot add new units to
 */
export interface AreaRestriction{
    player: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * Various parameters of a challenge that can be set
 */
export interface ChallengeOptions{
    gridWidth: number;
    gridHeight: number;
    maxRounds: number;
    moveLimit: number;
    restrictions?: AreaRestriction[];
}

/**
 * Contains all necessary information to initialize a unit
 */
export interface UnitOptions{
    position: Point | undefined;
    display: {
        displayName: string;
        image: string;
        description: string;
    };
    stats: BasicStats & {
        weight: number;
    };
    abilities: Partial<UpgradedAbility>;
}

/**
 * Storage format of UnitOptions
 * 
 * Before creating a UnitOptions object, the health and damage
 * values in the abilityValues property of this object are
 * upgraded then partially applied to the ability functions
 */
export interface UnitOptionsStorage{
    display: Partial<UnitOptions["display"]>;
    stats: Partial<UnitOptions["stats"]>;
    abilities: Partial<Ability>;
    abilityValues: Partial<AbilityValueList>;
    accessory: {
        unlockLevel: number;
        collectionName: string;
        collectionImage: string;
    }
}

/**
 * Values stored for each player that are used to determine scores
 * for all players
 */
export interface ScoreData{
    ready: boolean;
    score: number;
    initialUnits: number;
    defeated: number;
    totalWeight: number;
}

/**
 * Move action log entry
 */
interface MoveAction{id: number; position: Point;}

/**
 * Attack action log entry
 */
interface AttackAction{id: number; damage: number;}

/**
 * Unit defeat action log entry
 */
interface AddDefeatAction{id: number;}

/**
 * An action that occurred during a challenge
 * 
 * Actions include moving, attacking, and defeating units
 */
export interface ChallengeAction{
    roundsLeft: number;
    action: string;
    data: MoveAction | AttackAction | AddDefeatAction;
}

/**
 * The result of a user's request to do an action
 * 
 * Contains a boolean, indicating whether the request
 * was successful, and a message
 */
export interface ActionResult{
    success: boolean;
    message: string;
}

/**
 * Information available for each unit in a challenge state
 */
interface UnitState{
    id: number;
    player: number;
    displayName: string;
    description: string;
    image: string;
    position: Point;
    weight: number;
    stats: UnitStats;
}

/**
 * State of a challenge, including all necessary information
 * to display the challenge to the user
 */
export interface ChallengeState{
    started: boolean;
    winner: number;
    roundsLeft: number;
    turn: number;
    phase: number;
    gridSize: Point;
    restrictions: AreaRestriction[];
    units: UnitState[];
    inactive: UnitState[];
    actionLog: ChallengeAction[];
}

//------------------------------------------------------------------------------------------------//
//                                         Accessory Types                                        //
//------------------------------------------------------------------------------------------------//

/**
 * Name and image that is required to display an accessory to the user
 */
export interface AccessoryPreview{
    displayName: string;
    image: string;
}

/**
 * Reward that is given at the end of a challenge
 */
export interface RewardEvent{
    coins: number;
    points: number;
    bonusClaimed: boolean;
    accessory: AccessoryPreview | undefined;
}

/**
 * Full accessory data sent to the user when not in a challenge
 */
export interface AccessoryData{
    displayName: string;
    unitName: string;
    image: string;
    unlocked: boolean;
    unlockLevel: number;
}

//------------------------------------------------------------------------------------------------//
//                                     Challenge Manager Types                                    //
//------------------------------------------------------------------------------------------------//

/**
 * Most compact storage format of a unit
 * 
 * The user specifies units in this format then other functions
 * convert it to a unit object
 */
export interface UnitPreview{
    name: string;
    level: number;
    defense: boolean;
    position: Point | undefined;
}

/**
 * Full unit data sent to the user when not in a challenge
 */
interface UnitData{
    display: {
        displayName: string;
        image: string;
        description: string;
    };
    stats: BasicStats;
}

/**
 * Includes all the units that a user can select and the maximum
 * number of units they can use in one challenge
 */
export interface UnitSelection{
    unitsPerChallenge: number;
    unitsAvailable: UnitData[];
}

/**
 * Contains the display properties of a unit and its level
 */
export interface UnitDisplay{
    displayName: string;
    image: string;
    level: number;
};

/**
 * All of a player's visual data
 */
export interface Player{
    username: string;
    avatar: string;
}

/**
 * Additional data required when initializing a player but
 * not when accessing a player during a challenge
 */
export interface PlayerInput extends Player{
    auto: boolean;
    units: UnitPreview[];
}

/**
 * Player data required to be tracked but not visible to the user
 * 
 * This data cannot be specified when joining a challenge and it
 * is automatically initialized by the challenge manager
 */
export interface PlayerData extends PlayerInput{
    status: number;
    acceptMethod: number;
    strength: number;
}

/**
 * Format of a request to move or activate a unit
 */
export interface MoveRequest{
    unit: number;
    position: Point;
}

/**
 * Format of a request to set a unit's target to another unit
 */
export interface AttackRequest{
    unit: number;
    targets: number[];
}

/**
 * Stores the reward that a player would receive when
 * they finish the challenge
 */
export interface Reward{
    coins: number;
    points: number;
    accessory: string;
    bonus: boolean;
}

/**
 * Contains the state of the challenge managed by the challenge
 * manager and the data of the players who are participating
 */
export interface ChallengeManagerState{
    players: Player[];
    challenge: ChallengeState;
}

/**
 * Includes all data for a challenge manager that is not required in
 * the logic of the challenge
 */
export interface ChallengeExtraData{
    challengeid: number;
    displayName: string;
    requiredLevel: number;
    acceptCost: number;
    reward: Reward | undefined;
}

/**
 * Contains all necessary information to initialize a challenge manager
 */
export interface ChallengeManagerOptions{
    options: ChallengeOptions;
    players: PlayerInput[];
    extraData: ChallengeExtraData;
}

/**
 * Challenge data displayed to the user when selecting a challenge to start
 */
export interface ChallengePreview{
    challengeid: number;
    displayName: string;
    requiredLevel: number;
    acceptCost: number;
    completed: boolean;
    reward: {
        coins: number;
        points: number;
        accessory: AccessoryPreview;
    }
    players: Player[];
}

//------------------------------------------------------------------------------------------------//
