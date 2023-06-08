import {AVATAR_IMAGE_DIR, IMAGE_FILE_EXTENSION, CHALLENGE_COINS_PER_TOKEN} from "../data/constants";
import {createUnitOptions, getUnitDisplay} from "./accessories";
import {Challenge} from "./challengelogic";
import {
    Point, 
    ChallengeOptions, 
    UnitOptions, 
    ActionResult, 
    UnitPreview, 
    UnitDisplay, 
    PlayerData, 
    ChallengeManagerOptions, 
    ChallengeManagerState, 
    Player, 
    Reward, 
    MoveRequest, 
    AttackRequest, 
    ChallengeExtraData
} from "../types";

/**
 * Provides an interface for the user to do actions in a
 * challenge. Validates user input and returns error
 * messages when necessary.
 */
export class ChallengeManager{
    challenge: Challenge | undefined;
    players: PlayerData[];
    options: ChallengeOptions;
    extraData: ChallengeExtraData;

    constructor(options: ChallengeManagerOptions){
        this.challenge = undefined;
        this.players = [];
        this.options = options.options;
        this.extraData = {
            challengeid: -1,
            displayName: "",
            requiredLevel: 1,
            acceptCost: 0,
            reward: undefined
        };

        const players = options.players;
        const extraData = options.extraData;
        if (Array.isArray(players) === true){
            for (let x = 0; x < players.length; x++){
                // Create a copy of the player data to avoid modifying the object
                // in the data file. The options object does not need to be modified
                // because the challenge does not modify it.

                const thisPlayer: PlayerData = {
                    username: players[x].username,
                    avatar: players[x].avatar,
                    auto: players[x].auto,
                    status: 0,
                    acceptMethod: 0,
                    strength: 0,
                    units: []
                };

                // Automatically controlled players must be ready
                if (thisPlayer.auto === true){
                    thisPlayer.status = 1;
                }
                
                for (let y = 0; y < players[x].units.length; y++){
                    thisPlayer.units.push(players[x].units[y]);
                }

                this.players.push(thisPlayer);
            }
        }
        if (typeof extraData === "object"){
            // The extra data object contains any data that is not required
            // in the challenge logic such as required level to accept the
            // challenge or token cost to accept the challenge

            this.extraData.challengeid = extraData.challengeid;
            this.extraData.displayName = extraData.displayName;
            this.extraData.requiredLevel = extraData.requiredLevel;
            this.extraData.acceptCost = extraData.acceptCost;
            if (typeof extraData.reward !== "undefined"){
                this.extraData.reward = extraData.reward;
            }
        }
    }

    /**
     * Checks whether the challenge has ended.
     * @returns boolean
     */
    isFinished(): boolean{
        if (typeof this.challenge === "undefined"){
            return false;
        }
        return (this.challenge.getTurn() < 0);
    }

    /**
     * Finds the first active player with the given username
     * @param username username of the player to find
     * @returns player number
     */
    findPlayer(username: string): number{
        let x = 0;
        let found = false;
        while (!found && x < this.players.length){
            if (this.players[x].status === 1 && this.players[x].username === username && this.players[x].auto === false){
                found = true;
            } else{
                x++;
            }
        }
        if (found === true){
            return x;
        }
        return -1;
    }

    /**
     * Creates a challenge object with all the players and their units.
     * 
     * This function does nothing if there are still players who have
     * not yet joined.
     */
    createChallenge(): void{
        if (typeof this.challenge !== "undefined"){
            return;
        }

        // All players must have joined before creating the challenge
        let joined = true;

        // Cannot create a challenge with only automatic players so check
        // that there is at least one real player before creating the challenge
        let realPlayer = false;

        for (let x = 0; x < this.players.length; x++){
            if (this.players[x].status !== 1){
                joined = false;
            }
            if (this.players[x].auto === false){
                realPlayer = true;
            }
        }
        if (joined === false || realPlayer === false){
            return;
        }

        let challengeUnits: UnitOptions[][] = [];
        for (let x = 0; x < this.players.length; x++){
            let strength = 0;
            let playerUnits: UnitOptions[] = [];
            for (let y = 0; y < this.players[x].units.length; y++){
                const thisUnit = createUnitOptions(this.players[x].units[y]);
                if (typeof thisUnit !== "undefined" && typeof thisUnit.stats.weight === "number"){
                    strength += thisUnit.stats.weight;
                    playerUnits.push(thisUnit);
                }
            }
            challengeUnits.push(playerUnits);

            this.players[x].strength = Math.floor(strength);
        }
        
        this.challenge = new Challenge(challengeUnits, this.options);

        for (let x = 0; x < this.players.length; x++){
            if (this.players[x].auto === true){
                this.challenge.setReady(x);
            }
        }
    }

    /**
     * If the current player is automatically controlled, this function
     * takes their turn for them.
     */
    autoTurns(): void{
        if (typeof this.challenge === "undefined"){
            return;
        }

        let triesLeft = this.players.length + 1;
        let turn = this.challenge.getTurn();

        
        // For each automatically controlled player, do an empty move action (because automatic
        // players cannot move) then attack the closest targets.
        // If this fails for some reason, the loop will terminate after enough failed attempts.
        while (triesLeft > 0 && turn >= 0 && this.players[turn].auto){
            this.challenge.move(turn, new Map<number, Point>());
            
            const targets = this.challenge.getClosestTargets(turn);
            this.challenge.setTarget(turn, targets);

            turn = this.challenge.getTurn();
            triesLeft--;
        }
    }
    
    getState(): ChallengeManagerState | undefined{
        if (typeof this.challenge === "undefined"){
            return undefined;
        }

        let state: ChallengeManagerState = {
            players: [],
            challenge: this.challenge.getState()
        };

        for (let x = 0; x < this.players.length; x++){
            const thisPlayer = {
                username: this.players[x].username,
                avatar: this.players[x].avatar
            };
            if (thisPlayer.avatar !== ""){
                thisPlayer.avatar = AVATAR_IMAGE_DIR + thisPlayer.avatar + IMAGE_FILE_EXTENSION;
            }
            state.players.push(thisPlayer);
        }

        return state;
    }

    /**
     * Gives the user a preview of what units they may expect to face in
     * a challenge. This function is intended to be called before a challenge
     * starts and the user is supposed to use this information to decide
     * which units to use in the challenge.
     * @returns all active units in the challenge
     */
    getPreviewState(): UnitDisplay[]{
        let units: UnitDisplay[] = [];
        for (let x = 0; x < this.players.length; x++){
            for (let y = 0; y < this.players[x].units.length; y++){
                const thisUnit = this.players[x].units[y];
                if (typeof thisUnit.position !== "undefined"){
                    const display = getUnitDisplay(thisUnit);
                    if (typeof display !== "undefined"){
                        units.push(display);
                    }
                }
            }
        }
        return units;
    }

    /**
     * Checks if a specific player is the winner of the challenge. Searches by username
     * instead of player index.
     * @param username player name
     * @returns -1 if loss, 0 if draw, 1 if win
     */
    isWinner(username: string): number{
        if (typeof this.challenge === "undefined"){
            return -1;
        }

        const playerIndex = this.findPlayer(username);
        if (playerIndex < 0){
            return -1;
        }

        const state = this.challenge.getState();
        if (playerIndex === state.winner){
            return 1;
        } else if (state.winner === -1 && state.turn === -1){
            return 0;
        }
        return -1;
    }

    /**
     * Returns the reward a player would receive based on the strengths of their units
     * and whether or not they won the challenge.
     * 
     * Note: this function will return the same value, even if called multiple times.
     * Calling this function only computes a value, it does not know whether or not
     * the player already claimed their reward.
     * @param username player name
     * @returns reward object
     */
    getReward(username: string): Reward{
        let reward: Reward = {
            coins: 0,
            points: 0,
            accessory: "",
            bonus: true
        };

        let playerIndex = this.findPlayer(username);
        if (playerIndex < 0 || typeof this.challenge === "undefined"){
            return reward;
        }

        // Some challenges have fixed rewards that do not depend on the strength
        // If a fixed reward was set for this challenge, return it
        if (typeof this.extraData.reward !== "undefined"){
            if (playerIndex === this.challenge.getState().winner){
                reward.coins = this.extraData.reward.coins;
                reward.points = this.extraData.reward.points;
                reward.accessory = this.extraData.reward.accessory;
                reward.bonus = this.extraData.reward.bonus;
            }
            // Losing a challenge with a fixed reward gives a reward of 0
            return reward;
        }

        if (playerIndex === this.challenge.getState().winner){
            reward.coins = this.extraData.acceptCost * CHALLENGE_COINS_PER_TOKEN;
        }

        // If the reward is not fixed, determine the reward based on the units the
        // player has defeated
        // There is a reward cap of 50 times the player's strength
        reward.points = Math.min(this.players[playerIndex].strength * 50, Math.floor(
            this.challenge.getScore(playerIndex) * 
            this.challenge.getScoreMultiplier(playerIndex)
        ));
        
        return reward;
    }

    /**
     * Attempts to add the player with the given username to the challenge and set their units.
     * @param player player name, avatar, and avatar color
     * @param units array of units to add
     * @returns result with success or a failure message
     */
    setPlayer(player: Player, units: UnitPreview[]): ActionResult{
        // Takes in a Player type instead of PlayerData because PlayerData contains attributes
        // that the user is not allowed to specify when joining a challenge.

        // Rules for which player data to assign the user to:
        // If data exists with the exact same username, add the user to that one.
        // If not, try to find a player data with name "" (representing a spot any user can claim).
        // Otherwise, the player is not allowed in the challenge.

        // Players cannot join a challenge that they are already in as an automatic player.

        if (player.username === ""){
            return {success: false, message: "Invalid username."};
        }

        
        let exactIndex = -1;// Index of the player with an exact username match
        let emptyIndex = -1;// Index of the player spot that is unclaimed
        let hasJoined = false;// Whether or not the player has already joined the challenge
        
        for (let x = 0; x < this.players.length; x++){
            if (this.players[x].username === player.username){
                hasJoined = true;
            } else{
                if (exactIndex === -1 && this.players[x].username === player.username && this.players[x].status === 0){
                    exactIndex = x;
                }
                if (emptyIndex === -1 && this.players[x].username === "" && this.players[x].status === 0){
                    emptyIndex = x;
                }
            }
        }

        if (hasJoined === true){
            // Player cannot participate multiple times in the same challenge
            return {success: false, message: "You are already participating in this challenge."};
        }
        
        let playerIndex = exactIndex;
        let acceptMethod = 2;
        if (playerIndex < 0){
            playerIndex = emptyIndex;
            acceptMethod = 1;
        }

        if (playerIndex < 0){
            return {success: false, message: "You are not allowed to accept this challenge."};
        }

        this.players[playerIndex].username = player.username;
        this.players[playerIndex].avatar = player.avatar;
        this.players[playerIndex].status = 1;
        this.players[playerIndex].acceptMethod = acceptMethod;
        
        for (let x = 0; x < units.length; x++){
            this.players[playerIndex].units.push(units[x]);
        }

        // Attempt to create the challenge, this will succeed if all players have joined
        this.createChallenge();

        return {success: true, message: "Successfully accepted the challenge."};
    }

    setReady(username: string): ActionResult{
        // Sets the player with the given username as ready, within the challenge.
        // Once all players are ready, they can start doing actions in the challenge.
        // This extra confirmation is required so players can see who they are against
        // before the challenge starts or activate their units.

        if (typeof this.challenge === "undefined"){
            return {success: false, message: "The challenge has not started yet."};
        }

        const started = this.challenge.getStarted();

        this.challenge.setReady(this.findPlayer(username));

        if (this.challenge.getStarted() === true && started === false){
            // If the challenge has just started, attempt to take turns for an
            // automatic player because the first player may be automatic.
            this.autoTurns();
        }

        return {success: true, message: "You are now ready."};
    }

    leave(username: string): ActionResult{
        // Attempts to remove the player with the given username from the challenge.
        // This will result in the player automatically being eliminated from the challenge.
        // If a player leaves, they are unable to rejoin.
        

        let playerIndex = this.findPlayer(username);
        if (playerIndex < 0){
            return {success: false, message: "You are not currently in this challenge."};
        }

        if (typeof this.challenge === "undefined"){
            // This has to undo the steps done by setPlayer
            // acceptMethod is used to determine whether the player joined the challenge
            // using a reserved spot for them only or an open spot (with name "")

            const acceptMethod = this.players[playerIndex].acceptMethod;

            this.players[playerIndex].avatar = "";
            this.players[playerIndex].status = 0;

            this.players[playerIndex].acceptMethod = 0;
            this.players[playerIndex].units.splice(0, this.players[playerIndex].units.length);
            if (acceptMethod < 2){
                this.players[playerIndex].username = "";
            }

            return {success: true, message: "Successfully left the challenge."};
        }

        this.players[playerIndex].status = 2;

        this.challenge.leave(playerIndex);

        return {success: true, message: "Successfully left the challenge."};
    }

    activate(username: string, activateList: MoveRequest[]): ActionResult{
        if (typeof this.challenge === "undefined"){
            return {success: false, message: "The challenge has not started yet."};
        }

        let activateMap = new Map<number, Point>();
        for (let x of activateList){
            if (typeof x.unit === "number" && Array.isArray(x.position) === true){
                if (x.position.length === 2){
                    activateMap.set(x.unit, x.position);
                }
            }
        }

        if (activateMap.size !== activateList.length){
            return {success: false, message: "Request incorrectly formatted."};
        }

        const result = this.challenge.activate(this.findPlayer(username), activateMap);

        return result;
    }

    move(username: string, moveList: MoveRequest[]): ActionResult{
        if (typeof this.challenge === "undefined"){
            return {success: false, message: "The challenge has not started yet."};
        }

        let moveMap = new Map<number, Point>();
        for (let x of moveList){
            if (typeof x.unit === "number" && Array.isArray(x.position) === true){
                if (x.position.length === 2){
                    moveMap.set(x.unit, x.position);
                }
            }
        }

        if (moveMap.size !== moveList.length){
            return {success: false, message: "Request incorrectly formatted."};
        }

        const result = this.challenge.move(this.findPlayer(username), moveMap);

        return result;
    }

    setTarget(username: string, targetList: AttackRequest[]): ActionResult{
        if (typeof this.challenge === "undefined"){
            return {success: false, message: "The challenge has not started yet."};
        }

        let targetMap = new Map<number, number[]>();
        for (let x of targetList){
            if (typeof x.unit === "number" && Array.isArray(x.targets) === true){
                let validTargets = true;
                for (let y of x.targets){
                    if (typeof y !== "number"){
                        validTargets = false;
                    }
                }

                if (validTargets === true){
                    targetMap.set(x.unit, x.targets);
                }
            }
        }

        if (targetMap.size !== targetList.length){
            return {success: false, message: "Request incorrectly formatted."};
        }

        const result = this.challenge.setTarget(this.findPlayer(username), targetMap);
        if (result.success === true){
            this.autoTurns();
        }

        return result;
    }
}
