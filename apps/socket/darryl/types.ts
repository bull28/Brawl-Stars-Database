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
        unlockMethod: string;
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
 * Parsed format of the accessories array that is stored in the database as text
 */
export type DatabaseAccessories = string[];

/**
 * Parsed format of the completed challenges array that is stored in the database as text
 */
export type DatabaseCompletions = number[];

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
    unlockMethod: string;
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
    name: string;
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
 * Challenge data displayed to players when they are creating a room
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
    players: number;
}

/**
 * Challenge data displayed to players when they are selecting a room to join
 * 
 * Any challenges displayed in this format were created by other players
 */
export interface ChallengeRoomPreview{
    username: string;
    displayName: string;
    requiredLevel: number;
    acceptCost: number;
    players: Player[];
}

//------------------------------------------------------------------------------------------------//
