import {CHALLENGE_LOSS_MULTIPLIER, CHALLENGE_WIN_MULTIPLIER} from "../constants";
import {
    Point, 
    UnitIndex, 
    UpgradedAbility, 
    UnitStats, 
    AbilityStats, 
    UnitOptions, 
    ChallengeOptions, 
    ScoreData, 
    ChallengeAction, 
    AreaRestriction, 
    ChallengeState, 
    ActionResult
} from "../types";

/**
 * Implements a priority queue using a binary heap 
 * 
 * Used only for the move search so it does not require the update operation
 */
class PriorityQueue<T>{
    heap: [number, T][];

    constructor(){
        // Nodes are stored in an array
        // Parent of node at index i is at Math.floor((i - 1) / 2)
        // Children of node at index i are at i * 2 + 1 and i * 2 + 2
        this.heap = [];
    }

    isEmpty(){
        return (this.heap.length === 0);
    }

    swap(i: number, j: number): void{
        let temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    insert(item: T, priority: number): void{
        if (priority < 0){
            // 0 is the highest priority
            return;
        }

        // Insert new item at the last leaf, swap items on the path
        // from the leaf up to the root if they are out of order.

        this.heap.push([priority, item]);
        let i = this.heap.length - 1;

        let p = Math.floor((i - 1) / 2);
        while (i > 0 && this.heap[i][0] < this.heap[p][0]){
            this.swap(p, i);
            i = p;
            p = Math.floor((i - 1) / 2);
        }
    }

    extractMin(): T | undefined{
        if (this.isEmpty() === true){
            return undefined;
        }

        // Swap root and last leaf, swap items on the path from
        // the root down to the leaf if they are out of order.
        // Must also compare both left and right children at each node.
        
        const item = this.heap[0][1];
        const size = this.heap.length - 1;

        this.heap[0] = [this.heap[size][0], this.heap[size][1]];
        this.heap.pop();

        if (size === 0){
            return item;
        }

        let i = 0;
        while ((i+i+1 < size && this.heap[i+i+1][0] < this.heap[i][0]) || (i+i+2 < size && this.heap[i+i+2][0] < this.heap[i][0])){
            let c = i+i+1;
            if (i+i+2 < size && this.heap[i+i+2][0] < this.heap[i+i+1][0]){
                c = i+i+2;
            }

            this.swap(c, i);
            i = c;
        }

        return item;
    }
}

/**
 * A structure that stores the positions of units in a challenge
 */
class Grid{
    // Grid format (m rows, n columns)
    //  0        1       2   ...     n-1
    //  n       n+1     n+2  ...    2n-1
    //  ...
    //  mn-m  mn-m+1  mn-m+2 ...    mn-1
    // x increases going right (from 0 to n)
    // y increases going down (from 0 to m)

    left: number;
    top: number;
    width: number;
    height: number;
    locations: number[];
    tempLocations: Map<number, number>;

    constructor(width: number, height: number){
        this.left = 0;
        this.top = 0;
        this.width = width;
        this.height = height;

        this.locations = [];
        for (let m = 0; m < this.height; m++){
            for (let n = 0; n < this.width; n++){
                this.locations[m * this.width + n] = -1;
            }
        }

        this.tempLocations = new Map<number, number>();
    }

    mod(x: number, y: number): number{
        return (((x % y) + y) % y);
    }

    getAngle(p1: Point, p2: Point): number{
        // p1 start
        // p2 target
        let angle = 0;
        if (Math.abs(p2[0] - p1[0]) === 0){
            if (p2[1] > p1[1]){
                angle = Math.PI * 1.5;
            } else if (p2[1] < p1[1]){
                angle = Math.PI * 0.5;
            }
        } else{
            angle = this.mod(Math.atan2(p1[1] - p2[1], p2[0] - p1[0]), Math.PI * 2);
        }
        return angle;
    }

    angleDifference(a1: number, a2: number): number{
        if (a1 === a2){
            return 0;
        }

        let higher = Math.max(a1, a2);
        let lower = Math.min(a1, a2);

        if (higher - lower > Math.PI){
            return lower - higher + Math.PI * 2;
        } else{
            return higher - lower;
        }
    }

    betweenAngles(angle: number, lower: number, higher: number): boolean{
        // Checks if angle is in the region between lower and higher, counterclockwise

        angle = this.mod(angle, Math.PI * 2);

        if (higher < lower){
            // This means the region between lower and higher
            // passes through 2*pi so an angle is between if
            // it is between 0 and higher or lower and 2*pi
            return ((angle <= higher && angle >= 0) || (angle >= lower && angle <= Math.PI * 2));
        }

        return (angle >= lower && angle <= higher);
    }

    isValidPoint(p: Point): boolean{
        if (p[0] < this.left || p[0] > this.left + this.width - 1 || p[1] < this.top || p[1] > this.top + this.height - 1){
            return false;
        }
        return true;
    }

    moveDistancePoint(p1: Point, p2: Point): number{
        // Distance between two points, moving only left, right, up, or down
        return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    }

    attackDistancePoint(p1: Point, p2: Point): number{
        // Straight-line distance between two points
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }

    indexToPoint(index: number): Point{
        return [this.mod(index, this.width), Math.floor(index / this.width)];
    }

    pointToIndex(point: Point): number{
        return point[0] + this.width * point[1];
    }

    getPlayerAtIndex(index: number): number{
        if (index >= 0 && index < this.locations.length){
            return this.locations[index];
        }
        return -28;
    }

    setPlayerAtIndex(index: number, player: number): void{
        if (index < 0){
            return;
        }

        if (index < this.locations.length){
            this.locations[index] = player;
        }
    }

    tempMove(start: number, dest: number): void{
        if (start === dest){
            return;
        }
        const player = this.getPlayerAtIndex(start);
        if (player < 0){
            return;
        }
        this.tempLocations.set(dest, player);
        this.tempLocations.set(start, -1);
    }

    clearTempMoves(): void{
        this.tempLocations.clear();
    }

    getValidMoves(index: number, player: number): number[]{
        const point = this.indexToPoint(index);

        if (this.isValidPoint(point) === false){
            return [];
        }
        
        const tiles: Point[] = [
            [point[0] - 1, point[1]],
            [point[0] + 1, point[1]],
            [point[0], point[1] - 1],
            [point[0], point[1] + 1]
        ];

        let locations: number[] = [];

        for (let x = 0; x < tiles.length; x++){
            const thisIndex = this.pointToIndex(tiles[x]);
            const thisPlayer = this.getPlayerAtIndex(thisIndex);
            if ((thisPlayer === -1 || thisPlayer === player) && this.isValidPoint(tiles[x]) === true){
                locations.push(thisIndex);
            }
        }
        
        return locations;
    }

    moveDistance(index1: number, index2: number): number{
        const p1 = this.indexToPoint(index1);
        const p2 = this.indexToPoint(index2);

        return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
    }

    attackDistance(index1: number, index2: number): number{
        const p1 = this.indexToPoint(index1);
        const p2 = this.indexToPoint(index2);

        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    }

    isValidIndex(index: number): boolean{
        const point = this.indexToPoint(index);
        return this.isValidPoint(point);
    }

    isValidMove(start: number, dest: number, moves: number, special: boolean): number{
        // Uses A* search to find a path from the start to the destination (dest)
        // where any location occupied by another player will block the path.
        // Uses a heuristic of "move distance" to the destination.

        if (start === dest){
            // Return immediately if there is no move
            return 0;
        }
        if (this.moveDistance(start, dest) > moves){
            // If the shortest path to the destination is longer than the
            // allowed moves, return immediately
            return -1;
        }
        if (this.isValidIndex(dest) === false){
            // The destination must not be out of bounds
            return -1;
        }
        if (this.tempLocations.has(dest) === true){
            // Check if any temporary moves have been made
            // If one of those moves caused the destination
            // to become empty, allow that move.
            if (this.tempLocations.get(dest) !== -1){
                return -1;
            }
        } else{
            if (this.getPlayerAtIndex(dest) !== -1){
                // The destination must be empty (-1) in order to move there
                return -1;   
            }
        }
        
        
        let player = this.getPlayerAtIndex(start);
        if (this.tempLocations.has(start) === true){
            player = this.tempLocations.get(start)!;
        }
        if (player < 0){
            // The start must not be empty or invalid
            return -1;
        }

        if (special === true){
            // special allows a move from one point to another without
            // other players blocking
            return this.moveDistance(start, dest);
        }
    
        let pq = new PriorityQueue<number>();
        let actions: number[] = [];
        let parents = new Map<number, number>();
        let costs = new Map<number, number>();
        let visited = new Set<number>();
    
        // Start with all the moves from the start position
        const startingMoves = this.getValidMoves(start, player);
        for (let x = 0; x < startingMoves.length; x++){
            const p = startingMoves[x];
            parents.set(p, start);
            costs.set(p, 1);
            pq.insert(p, 1 + this.moveDistance(p, dest));
            visited.add(p);
        }
        visited.add(start);
    
        let done = false;
        while (!done){
            let currentPos = pq.extractMin();
            if (typeof currentPos === "undefined"){
                // No valid path exists
                // This takes care of pq.isEmpty()
                return -1;
            }
    
            // Get the position with lowest cost
            if (costs.has(currentPos) === false){
                return -1;
            }
            let currentCost = costs.get(currentPos)!;
    
            if (currentPos === dest){
                // Path found
                done = true;
            } else{
                const successors = this.getValidMoves(currentPos, player);
                for (let x = 0; x < successors.length; x++){
                    const p = successors[x];
                    // Only add positions to the priority queue if they have not been visited already
                    // and their cost does not exceed the maximum number of moves this path can take.
                    if ((visited.has(p) === false || currentPos === dest) && (costs.get(currentPos)! + 1 <= moves)){
                        parents.set(p, currentPos);
                        costs.set(p, 1 + currentCost);
                        pq.insert(p, 1 + currentCost + this.moveDistance(p, dest));
                        visited.add(p);
                    }
                }
                visited.add(currentPos);
            }
        }

        let currentNode = dest;
        let distance = 0;
        let pathExists = true;
        while (currentNode !== start && pathExists){
            actions.push(currentNode);
            if (parents.has(currentNode) === true){
                currentNode = parents.get(currentNode)!;
                distance++;
            } else{
                pathExists = false;
            }
        }

        if (pathExists === false){
            return -1;
        }

        return distance;
    }

    isValidAttack(start: number, targets: number[], range: number, special: boolean): boolean{
        // Determines whether an attack from the unit at the start position to
        // all the units at the positions in the targets array, is valid.
        // An attack is valid if none of targets are farther away than the attacker's range
        // and none of them are being tanked for by some other target.
        
        if (targets.length === 0){
            return true;
        }
        
        // Get the point which the attack is sent from and the player that sent the attack
        const startPoint = this.indexToPoint(start);
        if (this.isValidPoint(startPoint) === false){
            return false;
        }
        const startPlayer = this.getPlayerAtIndex(start);
        
        // Remove all invalid targets from the array
        targets = targets.filter((value) => this.isValidIndex(value) === true && this.getPlayerAtIndex(value) !== startPlayer);

        // Convert all target indexes to points
        // Use the points to calculate angles and distances

        let outOfRange = false;
        //                         distance  angle
        const targetPoints: [Point, number, number][] = [];
        for (let x = 0; x < targets.length; x++){
            const point = this.indexToPoint(targets[x]);
            const distance = this.attackDistancePoint(startPoint, point);
            if (distance > range){
                outOfRange = true;
            }
            targetPoints.push([point, distance, this.getAngle(startPoint, point)]);
        }

        if (outOfRange === true){
            // If at least one target is out of range, the attacks are invalid
            return false;
        }

        if (special === true){
            // special allows an attack to hit any target within range,
            // even if it is being tanked for by another target
            return true;
        }

        // The target is being tanked for by a target at point p if all these are true:
        // 1. p is closer to the start than the target by at least some amount
        // 2. The angle (start -> target) is not between any two angles (start -> corner of p)
        // 3. p is not already being targeted
        // Note: this only gives an approximation to whether a target is actually being
        // tanked for that is easier to calculate. It does not give exact results.
        
        // If the target is being tanked for, it cannot be attacked and the attack is invalid.

        let isBeingTanked = false;
        
        for (let x = 0; x < this.locations.length ; x++){
            if (this.getPlayerAtIndex(x) !== -1 && this.getPlayerAtIndex(x) !== startPlayer){
                let p = this.indexToPoint(x);

                for (let y = 0; y < targetPoints.length; y++){
                    // Test the three conditions above for each target point and point p

                    // Other angle test (less accurate but faster):
                    // this.angleDifference(this.getAngle(startPoint, p), targetAngles[y]) < (Math.PI / 12)
                    
                    if (
                        isBeingTanked === false &&
                        this.attackDistancePoint(startPoint, p) - targetPoints[y][1] < -0.5 &&
                        targets.includes(this.pointToIndex(p)) === false
                        ){
                        // The unit tanking must be distance of 1 or more closer to the unit being targeted


                        // These are the angles from the start to each corner of p (as a square on the grid)
                        const cornerAngles = [
                            this.getAngle(startPoint, [p[0] - 0.5, p[1] - 0.5]),
                            this.getAngle(startPoint, [p[0] + 0.5, p[1] - 0.5]),
                            this.getAngle(startPoint, [p[0] - 0.5, p[1] + 0.5]),
                            this.getAngle(startPoint, [p[0] + 0.5, p[1] + 0.5])
                        ];

                        // If p passes through 2*pi then some of these angles will be close to 0 and others
                        // close to 2*pi. Choosing the min and max angles out of this array and doing
                        // the betweenAngles comparison will not work since the min and max are not actually
                        // the true min and max.
                        // Example: [0.1, 0.3, 5.9, 6.1]: min, max values are 0.1 and 6.1, true min, max are 5.9 and 0.3

                        // This case happens when the difference between the values of min and max is
                        // greater than pi since the smallest difference between two angles can be at most pi.

                        cornerAngles.sort((a, b) => a - b);

                        let minAngle = cornerAngles[0];
                        let maxAngle = cornerAngles[cornerAngles.length - 1];

                        if (maxAngle - minAngle > Math.PI){
                            // If the difference between min and max is greater than pi, find the index
                            // where the next value is more than pi greater than the current. Since
                            // getAngle returns values between 0 and 2*pi, this will only happen once.

                            // This finds the smallest difference between two angles that is at least pi.

                            let maxIndex = 0;
                            for (let i = 0; i < cornerAngles.length - 1; i++){
                                if (cornerAngles[i + 1] - cornerAngles[i] > Math.PI){
                                    maxIndex = i;
                                }
                            }
                            minAngle = cornerAngles[maxIndex + 1];
                            maxAngle = cornerAngles[maxIndex];
                        }
                        
                        if (this.betweenAngles(targetPoints[y][2], minAngle, maxAngle) === true){
                            isBeingTanked = true;
                        }
                    }
                }
            }
        }
        return (!isBeingTanked);
    }
}

/**
 * An entity that moves and attacks in a challenge
 */
export class Unit{
    unitid: number;
    player: number;
    position: number;
    weight: number;
    displayName: string;
    image: string;
    description: string;
    abilities: UpgradedAbility;
    stats: AbilityStats;

    constructor(unitid: number, player: number, options: UnitOptions){
        this.unitid = unitid;
        this.player = player;
        this.position = 0;
        this.weight = 1;

        //------------------------------------------------------------------------------------------------//
        //                        These are all the stats that abilities can access                       //
        //------------------------------------------------------------------------------------------------//
        this.stats = {
            state: 0,
            health: 1,
            maxHealth: 1,
            shield: 0,
            damage: 1,
            range: 1,
            targets: 1,
            speed: 1,
            specialMoves: false,
            specialAttacks: false,
            positionPoint: [0, 0]
        };
        //------------------------------------------------------------------------------------------------//
        // Note: health and shield work differently from the rest of these values
        // Since these two values may be modified by an external source (another unit), the ability
        // functions cannot determine their values using the state alone.
        //
        // Therefore, health and shield are stored in the object and computations are
        // done with the values directly. However, every time an event occurs, the corresponding
        // ability function is called which may set a new value depending on the event.
        // maxHealth is different from health, it is just a constant and does not change when the
        // unit is attacked.
        //------------------------------------------------------------------------------------------------//

        // These functions are called to get or update the unit's stats.
        // Units that have abilities have a non-default function for each stat which uses information
        // about the unit like its state and returns a value for the stat. health, maxHealth, and shield
        // ability functions are only used to update those values since the unit does not have control
        // over those values after they are initially set.

        this.abilities = {
            update: (state, event) => state,
            health: (owner, event) => owner.health,
            shield: (owner, event) => owner.shield,
            maxHealth: (owner) => owner.maxHealth,
            damage: (owner) => owner.damage,
            range: (owner) => owner.range,
            targets: (owner) => owner.targets,
            speed: (owner) => owner.speed,
            specialMoves: (owner) => owner.specialMoves,
            specialAttacks: (owner) => owner.specialAttacks,
            damageToUnit: (owner, ownerDamage, opponent, opponentAbilities) => ownerDamage,
            description: (state) => ""
        };

        //------------------------------------------------------------------------------------------------//

        this.displayName = "";
        this.image = "";
        this.description = "";
        
        // Assigning values to the unit's player information, stats and abilities
        const display = options.display;
        const stats = options.stats;
        const abilities = options.abilities;
        if (typeof display === "object"){
            if (typeof display.displayName === "string"){
                this.displayName = display.displayName;
            } if (typeof display.image === "string"){
                this.image = display.image;
            } if (typeof display.description === "string"){
                this.description = display.description;
            }
        }
        if (typeof stats === "object"){
            if (typeof stats.health === "number"){
                this.stats.health = stats.health;
                this.stats.maxHealth = stats.health;
            } if (typeof stats.shield === "number"){
                this.stats.shield = stats.shield;
            } if (typeof stats.damage === "number"){
                this.stats.damage = stats.damage;
            } if (typeof stats.range === "number"){
                this.stats.range = stats.range;
            } if (typeof stats.targets === "number"){
                this.stats.targets = stats.targets;
            } if (typeof stats.speed === "number"){
                this.stats.speed = stats.speed;
            } if (typeof stats.specialMoves === "boolean"){
                this.stats.specialMoves = stats.specialMoves;
            } if (typeof stats.specialAttacks === "boolean"){
                this.stats.specialAttacks = stats.specialAttacks;
            } if (typeof stats.weight === "number"){
                this.weight = stats.weight;
            }
        }
        if (typeof abilities === "object"){
            if (typeof abilities.update === "function"){
                this.abilities.update = abilities.update;
            } if (typeof abilities.health === "function"){
                this.abilities.health = abilities.health;
            } if (typeof abilities.shield === "function"){
                this.abilities.shield = abilities.shield;
            } if (typeof abilities.maxHealth === "function"){
                this.abilities.maxHealth = abilities.maxHealth;
            } if (typeof abilities.damage === "function"){
                this.abilities.damage = abilities.damage;
            } if (typeof abilities.range === "function"){
                this.abilities.range = abilities.range;
            } if (typeof abilities.targets === "function"){
                this.abilities.targets = abilities.targets;
            } if (typeof abilities.speed === "function"){
                this.abilities.speed = abilities.speed;
            } if (typeof abilities.specialMoves === "function"){
                this.abilities.specialMoves = abilities.specialMoves;
            } if (typeof abilities.specialAttacks === "function"){
                this.abilities.specialAttacks = abilities.specialAttacks;
            } if (typeof abilities.damageToUnit === "function"){
                this.abilities.damageToUnit = abilities.damageToUnit;
            } if (typeof abilities.description === "function"){
                this.abilities.description = abilities.description;
            }
        }
        
    }

    update(event: number): void{
        if (this.isDefeated() === false){
            // Update events:
            // 0 = at the beginning of every turn after the first
            // 1 = when moving
            // 2 = when setting a target (can be sent multiple times)
            // 3 = when defeating another unit (sent once per unit defeated)
            this.stats.state = this.abilities.update(this.stats.state, event);

            // Health and shield functions are called after the state is updated
            this.stats.health = this.abilities.health(this.stats, event);
            this.stats.shield = this.abilities.shield(this.stats, event);
        }
    }

    isDefeated(): boolean{
        return (this.stats.health <= 0);
    }

    getStats(): UnitStats{
        return {
            health: this.stats.health,
            maxHealth: this.abilities.maxHealth(this.stats),
            shield: this.stats.shield,
            damage: this.abilities.damage(this.stats),
            range: this.abilities.range(this.stats),
            targets: this.abilities.targets(this.stats),
            speed: this.abilities.speed(this.stats),
            specialMoves: this.abilities.specialMoves(this.stats),
            specialAttacks: this.abilities.specialAttacks(this.stats)
        };
    }

    setPosition(index: number, point: Point): void{
        this.position = index;
        this.stats.positionPoint = point;
    }

    getPositionPoint(): Point{
        return this.stats.positionPoint;
    }

    takeDamage(damage: number, attacks: number): void{
        if (damage <= 0 || attacks <= 0){
            return;
        }
        if (this.stats.shield > damage * attacks){
            // Attacks do less damage than the remaining shield
            this.stats.shield -= damage * attacks;
        } else if (this.stats.shield > 0){
            // Attacks do more damage than the remaining shield
            // Destroy the shield then subtract remaining damage from the health
            this.stats.health -= damage * (attacks - Math.ceil(this.stats.shield / damage));
            this.stats.shield = 0;
        } else{
            // No shield active
            this.stats.health -= damage * attacks;
        }
    }

    getHitsToDefeat(damage: number): number{
        // Call this with damage = 1 to get EHP
        if (damage <= 0){
            return -1;
        }
        return Math.ceil(this.stats.health / damage) + Math.ceil(this.stats.shield / damage);
    }

    getDamageToUnit(opponent: Unit): number{
        return this.abilities.damageToUnit(this.stats, this.abilities.damage(this.stats), opponent.stats, opponent.abilities);
    }

    getHealth(): number {return Math.max(0, this.stats.health);}

    getShield(): number {return Math.max(0, this.stats.shield);}

    getDamage(): number {return this.abilities.damage(this.stats);}

    getRange(): number {return this.abilities.range(this.stats);}

    getTargets(): number {return this.abilities.targets(this.stats);}

    getSpeed(): number {return this.abilities.speed(this.stats);}

    getSpecialMoves(): boolean {return this.abilities.specialMoves(this.stats);}

    getSpecialAttacks(): boolean {return this.abilities.specialAttacks(this.stats);}

    getAbilityDescription(): string {return this.abilities.description(this.stats.state)}
}

/**
 * Contains the logic required to run a challenge.
 */
export class Challenge{
    winner: number;
    roundsLeft: number;
    turnPhases: number;
    turn: number;
    phase: number;
    started: boolean;
    gridWidth: number;
    gridHeight: number;
    moveLimit: number;
    restrictions: AreaRestriction[];
    scores: ScoreData[];
    inactive: Unit[][];
    units: Unit[][];
    grid: Grid;
    idMap: Map<number, UnitIndex>;
    attackMap: Map<number, UnitIndex[]>;
    penaltyMap: Map<number, number>;
    actionLog: ChallengeAction[];

    constructor(units: UnitOptions[][], options: ChallengeOptions){
        // Turn represents which player's turn it currently is
        // Only moves and attacks can be done by that player
        // A negative turn represents a finished challenge (no players
        // are able to do any actions)

        // Phase represents which actions the current player is
        // able to do: 0 = can only move or activate units, 1 = can only attack

        this.winner = -1;
        this.roundsLeft = 25;
        this.turnPhases = 2;
        this.turn = 0;
        this.phase = 0;
        this.started = false;


        let players = 2;

        // These are stored as properties because they are required to display the grid
        // and therefore must be included when getting the state of the challenge
        this.gridWidth = 2;
        this.gridHeight = 2;
        this.moveLimit = 20;
        this.restrictions = [];

        if (typeof options === "object"){
            Object.keys(options).forEach((value) => {
                if (value === "gridWidth"){
                    this.gridWidth = Math.max(2, options.gridWidth);
                } else if (value === "gridHeight"){
                    this.gridHeight = Math.max(2, options.gridHeight);
                } else if (value === "maxRounds"){
                    this.roundsLeft = Math.max(1, options.maxRounds);
                } else if (value === "moveLimit"){
                    this.moveLimit = Math.max(0, options.moveLimit);
                } else if (value === "restrictions"){
                    if (typeof options.restrictions !== "undefined"){
                        for (let x of options.restrictions){
                            if (x.left < x.right && x.top < x.bottom){
                                this.restrictions.push(x);
                            }
                        }
                    }
                }
            });
        }

        // Score data for each player
        // Also includes whether each player is ready or not
        this.scores = [];
        
        this.inactive = [];
        this.units = [];
        this.grid = new Grid(this.gridWidth, this.gridHeight);

        // Provides easier access from unit id to index in the units arrays
        // This is used when the user sends data using ids and a search for
        // a unit by id has to be done.
        // This must be updated when a unit is deleted because indexes change.
        this.idMap = new Map<number, UnitIndex>();

        // Manages all the "targeted" units
        // Keys: ids, values: arrays of indexes in this.units
        // Keys are numbers so they can be looked up
        // Represents ids of units currently targeting the unit with that id.
        // When dealing damage, the id key has to be converted to an index
        // using the idMap.
        this.attackMap = new Map<number, UnitIndex[]>();

        this.penaltyMap = new Map<number, number>();

        this.actionLog = [];

        
        // Initialize the challenge with units
        // Once it is initialized, no more units can be added to the challenge.
        // By default, all units are set to inactive and will not appear on the
        // grid an cannot be used. Units can be activated on a player's turn
        // which allows them to move and attack from then on.

        // nextid is not a property of the challenge because units cannot be
        // added after the challenge is initialized
        let nextid = 0;

        if (Array.isArray(units) === true){
            players = Math.max(2, units.length);
            for (let x = 0; x < players; x++){
                let playerUnits = 0;
                let playerWeight = 0;

                this.inactive.push([]);
                this.units.push([]);
                if (x < units.length){
                    if (Array.isArray(units[x]) === true){
                        for (let y = 0; y < units[x].length; y++){
                            const thisUnit = units[x][y];
                            if (typeof thisUnit === "object"){
                                if (Object.hasOwn(thisUnit, "display") === true &&
                                Object.hasOwn(thisUnit, "stats") === true &&
                                Object.hasOwn(thisUnit, "abilities") === true){
                                    const unitObject = new Unit(nextid, x, thisUnit);

                                    if (typeof thisUnit.position !== "undefined"){
                                        const point = thisUnit.position;
                                        const position = this.grid.pointToIndex(thisUnit.position);

                                        if (this.grid.getPlayerAtIndex(position) !== -1){
                                            this.inactive[x].push(unitObject);
                                        } else{
                                            unitObject.setPosition(position, point);

                                            this.units[x].push(unitObject);
                                            this.grid.setPlayerAtIndex(position, x);
                                            this.idMap.set(unitObject.unitid, [x, this.units[x].length - 1]);
                                        }
                                    } else{
                                        this.inactive[x].push(unitObject);
                                    }
                                    
                                    if (unitObject.weight > 0){
                                        playerUnits++;
                                        playerWeight += unitObject.weight;
                                    }
                                    nextid++;
                                }
                            }
                        }
                    }
                }

                this.scores.push({
                    ready: false,
                    score: -1,
                    defeated: 0,
                    initialUnits: playerUnits,
                    totalWeight: playerWeight
                });
            }
        } else{
            for (let i = 0; i < players; i++){
                this.scores.push({
                    ready: false,
                    score: -1,
                    defeated: 0,
                    initialUnits: 0,
                    totalWeight: 0
                });
                this.inactive.push([]);
                this.units.push([]);
            }
        }
    }

    updateIdMap(): void{
        this.idMap.clear();
        for (let x = 0; x < this.units.length; x++){
            for (let y = 0; y < this.units[x].length; y++){
                this.idMap.set(this.units[x][y].unitid, [x, y]);
            }
        }
    }

    /**
     * Remove old actions from more than 2 rounds ago
     * 
     * This should be called before roundsLeft is decreased
     */
    updateActionLog(): void{
        this.actionLog = this.actionLog.filter((value) => value.roundsLeft - this.roundsLeft < 2);
        //for (let x = this.actionLog.length - 1; x >= 0; x--){
        //    if (this.actionLog[x].roundsLeft - this.roundsLeft >= 2){
        //        this.actionLog.splice(x, 1);
        //    }
        //}
    }

    advanceTurn(): void{
        // Check if any players are eliminated (have 0 units left) and skip their turns
        // Players who are not ready are allowed to have 0 units because they may
        // not have activated their units yet
        let advanceTurns = 1;
        const playerCount = this.units.length;
        if (playerCount > 1 && playerCount === this.scores.length){
            while (
                this.units[(this.turn + advanceTurns) % playerCount].length === 0 && 
                this.scores[(this.turn + advanceTurns) % playerCount].ready === true && 
                advanceTurns < playerCount
            ){
                advanceTurns++;
            }
        }

        // Automatically call finishRound if the last player finished their turn
        if (this.turn + advanceTurns >= playerCount){
            this.finishRound();

            // After finishing a turn, the player who is going next might have just been eliminated
            // That means the turns may continue to advance
            if (this.turn >= 0){
                while (
                    this.units[(this.turn + advanceTurns) % playerCount].length === 0 && 
                    this.scores[(this.turn + advanceTurns) % playerCount].ready === true && 
                    advanceTurns < playerCount
                ){
                    advanceTurns++;
                }
                this.turn = (this.turn + advanceTurns) % playerCount;
            }
        } else{
            // This cannot execute if the turn is -1
            this.turn = (this.turn + advanceTurns) % playerCount;
        }
    }

    /**
     * Skips the remainder of the current player's turn and
     * advances the turn to the next player.
     */
    skipTurn(): void{
        if (this.turn < 0){
            return;
        }

        this.phase = 0;
        this.advanceTurn();
    }

    /**
     * Advances the phase of the current player's turn by 1. If the
     * current player's turn is finished, advance the turn until the
     * next non-automatic player.
     */
    updateTurn(): void{
        if (this.turn < 0){
            // Cannot update turns if the challenge is over
            return;
        }

        const newPhase = this.phase + 1;
        if (newPhase >= this.turnPhases){
            // Current player has done all their actions and it is now the next player's turn

            this.phase = 0;

            this.advanceTurn();
        } else{
            // Currrent player is still doing their actions
            this.phase = newPhase;
        }
    }

    getUnit(player: number, unit: number): Unit | undefined{
        // Check if the unit exists
        if (player >= this.units.length){
            return undefined;
        } if (unit >= this.units[player].length){
            return undefined;
        }
        return this.units[player][unit];
    }

    deleteUnit(player: number, unit: number): void{
        // Attack map does not need to be cleared nor does it need
        // to be empty

        // If a unit was being targeted then it gets deleted, it
        // will be skipped in the applyAttacks. The entry in the
        // map will be cleared if a successful attack occurs.

        const thisUnit = this.getUnit(player, unit);
        if (typeof thisUnit === "undefined"){
            return;
        }

        // When a unit is defeated, add its weight to the total defeated
        // weight of its owner
        if (player < this.scores.length){
            this.scores[player].defeated += thisUnit.weight;
        }

        // Set the player at the location of the unit to be deleted to -1
        this.grid.setPlayerAtIndex(thisUnit.position, -1);
        this.idMap.delete(thisUnit.unitid);
        this.units[player].splice(unit, 1);
    }

    movePlayer(player: number, unit: number, dest: number, penalty: number): void{
        // Note: this function does not check whether a move is valid in terms of the grid
        // It may overwrite a unit already at the destination.
        // This function is not intended to be called directly by the user.
        const thisUnit = this.getUnit(player, unit);
        if (typeof thisUnit === "undefined"){
            return;
        }

        const point = this.grid.indexToPoint(dest);
        if (thisUnit.position !== dest){
            // Update with event "on move" for thisUnit if it doesn't move to the same spot
            thisUnit.update(1);

            this.actionLog.push({roundsLeft: this.roundsLeft, action: "move", data: {id: thisUnit.unitid, position: point}});
            
            if (penalty > 1){
                this.penaltyMap.set(thisUnit.unitid, penalty - 1);
            }
        }

        this.grid.setPlayerAtIndex(thisUnit.position, -1);
        this.grid.setPlayerAtIndex(dest, player);
        // id map does not have to be updated because it does not store positions

        thisUnit.setPosition(dest, point);
    }

    setTargetPlayer(player: number, unit: number, targetPlayer: number, targetUnit: number): void{
        // Note: this function does not check whether an attack is valid in terms of the grid
        // This function is not intended to be called directly by the user.
        const attacker = this.getUnit(player, unit);
        const defender = this.getUnit(targetPlayer, targetUnit);
        if (typeof attacker === "undefined" || typeof defender === "undefined"){
            return;
        }

        const unitid = defender.unitid;

        if (this.attackMap.has(unitid) === true){
            // If some other unit is already targeting this unit
            // add this unit to the array
            this.attackMap.get(unitid)!.push([player, unit]);
        } else{
            // If this unit is the first one to target, create a new array
            this.attackMap.set(unitid, [[player, unit]]);
        }
        // Update with event "on attack" for attacker
        // A unit may receive this event multiple times
        attacker.update(2);
    }
    
    takeDamage(defender: Unit, damage: number, attacks: number): void{
        // Deals damage to a unit and adds the corresponding action to the action log
        const initialHealth = defender.getHealth();
        const initialShield = defender.getShield();

        defender.takeDamage(damage, attacks);

        const damageTaken = Math.max(0, (initialHealth + initialShield - defender.getHealth() - defender.getShield()));
        this.actionLog.push({roundsLeft: this.roundsLeft, action: "attack", data: {id: defender.unitid, damage: damageTaken}});
    }

    applyAttacks(): void{
        if (this.attackMap.size === 0){
            // No attacks to do
            return;
        }

        let damageMap = new Map<number, number>();

        let minHits = -1;

        let updateDefeat: Unit[] = [];


        // First, apply penalties before computing minHits
        this.attackMap.forEach((value, key) => {
            if (this.idMap.has(key) === true && this.penaltyMap.has(key) === true && value.length > 0){
                const index = this.idMap.get(key)!;
                const penalty = this.penaltyMap.get(key)!;
                const defender = this.getUnit(index[0], index[1]);
                if (typeof defender === "undefined"){
                    return;
                }

                let damage = 0;

                // Store the units who are targeting the defender and if the defender is
                // defeated then add these units to updateDefeat without having to loop
                // through value again
                let penaltyFromUnits: Unit[] = [];

                for (let x of value){
                    if (x.length === 2){
                        const attacker = this.getUnit(x[0], x[1]);
                        if (typeof attacker !== "undefined"){
                            // Do not require units to be not defeated here
                            // When two units attack each other and both have penalties, if the first one
                            // defeats the second, the second will not be able to attack the first
                            damage += attacker.getDamageToUnit(defender);
                            penaltyFromUnits.push(attacker);
                        }
                    }
                }

                this.takeDamage(defender, damage, Math.floor(penalty));

                if (defender.isDefeated() === true){
                    if (defender.weight > 0){
                        for (let x = 0; x < penaltyFromUnits.length; x++){
                            updateDefeat.push(penaltyFromUnits[x]);
                        }
                    }

                    this.actionLog.push({roundsLeft: this.roundsLeft, action: "defeat", data: {id: defender.unitid}});
                }
            }
        });

        this.penaltyMap.clear();


        // Determine the minimum number of attacks that have to be
        // done before any unit is defeated.
        this.attackMap.forEach((value, key) => {
            if (this.idMap.has(key) === true && value.length > 0){
                const index = this.idMap.get(key)!;
                const defender = this.getUnit(index[0], index[1]);
                if (typeof defender === "undefined"){
                    // This only returns from the callback
                    return;
                }

                // The only way a unit can be defeated here is if it had a penalty.
                // In this case, the minimum number of hits before any unit is defeated
                // is 0 because a unit was already defeated.
                if (defender.isDefeated() === true){
                    minHits = 0;
                    return;
                }

                let damage = 0;

                // For all of the units targeting this unit, add their damage
                // to the damage this unit will receive.
                for (let x of value){
                    if (x.length === 2){
                        const attacker = this.getUnit(x[0], x[1]);
                        if (typeof attacker !== "undefined"){
                            // Some units may be defeated when applying penalties and those
                            // units should be unable to attack during the normal attack phase
                            if (attacker.isDefeated() === false){
                                damage += attacker.getDamageToUnit(defender);
                            }
                        }
                    }
                }

                const hits = defender.getHitsToDefeat(damage);
                if (minHits === -1 || hits < minHits){
                    minHits = hits;
                }

                damageMap.set(key, damage);
            }
        });


        if (minHits > 0){
            // All units attack the number of times determined above in minHits
            this.attackMap.forEach((value, key) => {
                if (this.idMap.has(key) === true && damageMap.has(key) === true && value.length > 0){
                    const index = this.idMap.get(key)!;
                    const defender = this.getUnit(index[0], index[1]);
                    if (typeof defender === "undefined"){
                        return;
                    }

                    this.takeDamage(defender, damageMap.get(key)!, minHits);

                    if (defender.isDefeated() === true){
                        if (defender.weight > 0){
                            for (let x of value){
                                const attacker = this.getUnit(x[0], x[1]);
                                if (typeof attacker !== "undefined"){
                                    // Units only get the update defeat event if they defeat a unit with nonzero weight
                                    updateDefeat.push(attacker);
                                }
                            }
                        }

                        this.actionLog.push({roundsLeft: this.roundsLeft, action: "defeat", data: {id: defender.unitid}});
                    }
                }
            });
        }

        // Some units may change their stats when defeating another unit
        // so to avoid different behavior depending on the order that units are
        // updated in, update all units at once after all attacks are done.
        for (let x = updateDefeat.length - 1; x >= 0; x--){
            updateDefeat[x].update(3);
        }

        damageMap.clear();
        this.attackMap.clear();
    }

    finishRound(): void{
        if (this.turn < 0){
            return;
        }

        // Makes all units attack their chosen targets then clears attackMap
        this.applyAttacks();

        // Remove all units that are defeated
        let remainingPlayers = 0;
        let winner = -1;

        // Never remove any players from this.units
        // To represent an eliminated player, have their array be empty
        let eliminated: number[] = [];
        for (let x = this.units.length - 1; x >= 0; x--){
            // Some units like "walls" should not have to be defeated in order
            // to win. These units are given values of 0. If a player's total
            // value across all remaining units is 0, they are eliminated.
            let totalWeight = 0;

            for (let y = this.units[x].length - 1; y >= 0; y--){
                if (this.units[x][y].isDefeated() === true){
                    this.deleteUnit(x, y);
                } else{
                    // Update with event "on turn" for all units not defeated
                    this.units[x][y].update(0);
                    totalWeight += this.units[x][y].weight;
                }
            }

            if (this.units[x].length > 0 && totalWeight > 0){
                remainingPlayers++;

                // This is only used when there is one player left
                // If there is only one player left, this variable will get assigned
                // only once with the number of the player who wins.
                winner = x;
            } else{
                eliminated.push(x);
            }
        }
        
        // If a player is eliminated, remove all their units.
        // This is required because when advancing the turn, a player
        // is eliminated only if their units array is empty. If their "main target"
        // is defeated, the player is eliminated so their array must be emptied.
        for (let i of eliminated){
            this.units[i].splice(0, this.units[i].length);
            this.inactive[i].splice(0, this.inactive[i].length);
        }

        // Loop again to determine scores (units left when the player was eliminated)
        // Must do this only after removing all units from eliminated players above
        // because 2 or more players may be eliminated at the same time
        for (let i of eliminated){
            // This check prevents the score from updating even after a player has been eliminated
            if (this.scores[i].score < 0){
                this.scores[i].score = this.getDefeatedScore(i);
            }
        }

        // Update id map (this is very important)
        this.updateIdMap();

        // Remove older actions from the log
        this.updateActionLog();

        
        if (remainingPlayers === 1){
            // Challenge finished: there is one winner
            this.turn = -1;
            this.phase = 0;
            this.winner = winner;
            this.roundsLeft = Math.max(1, this.roundsLeft);
        } else if (remainingPlayers === 0){
            // Challenge finished: draw between one or more players
            this.turn = -1;
            this.phase = 0;
            this.roundsLeft = Math.max(1, this.roundsLeft);
        } else if (this.roundsLeft <= 1){
            // Challenge finished: took too long, no winner

            // Do this check after remainingPlayers === 0 because the
            // last two players might take each other out on the last turn
            // and that still counts as a draw / win.
            this.turn = -1;
            this.phase = 0;
            this.roundsLeft = 0;
        } else{
            // Challenge not finished yet
            //this.turn = 0;
            this.phase = 0;
            this.roundsLeft--;
        }
    }

    /**
     * Gets the total weight of all opponent units that have been defeated.
     * Opponent units are determined based on the player provided.
     * @param player player number
     * @returns score for that player
     */
    getDefeatedScore(player: number): number{        
        if (player >= this.units.length){
            return 0;
        } if (this.units.length < 2){
            return 0;
        }

        // When there are multiple opponents, the score gained from each player is
        // divided by the number of opponents.

        let score = 0;
        for (let x = 0; x < this.scores.length; x++){
            if (x !== player){
                score += (this.scores[x].defeated / (this.units.length - 1));
            }
        }
        return score;
    }



    // These are the methods that the challenge manager should use.
    // All methods above should not be used directly by the challenge manager.

    /**
     * Gets the current state of the challenge and various information
     * necessary to display it to the user.
     * @returns challenge state
     */
    getState(): ChallengeState{
        let state: ChallengeState = {
            started: this.started,
            winner: this.winner,
            roundsLeft: this.roundsLeft,
            turn: this.turn,
            phase: this.phase,
            gridSize: [this.gridWidth, this.gridHeight],
            restrictions: this.restrictions,
            units: [],
            inactive: [],
            actionLog: this.actionLog
        };

        for (let x = 0; x < this.units.length; x++){
            for (let y = 0; y < this.units[x].length; y++){
                const thisUnit = this.units[x][y];
                state.units.push({
                    id: thisUnit.unitid,
                    player: x,
                    displayName: thisUnit.displayName,
                    description: (thisUnit.description + " " + thisUnit.getAbilityDescription()).trimEnd(),
                    image: thisUnit.image,
                    position: thisUnit.getPositionPoint(),
                    weight: thisUnit.weight,
                    stats: thisUnit.getStats(),
                });
            }
        }

        for (let x = 0; x < this.inactive.length; x++){
            for (let y = 0; y < this.inactive[x].length; y++){
                const thisUnit = this.inactive[x][y];
                state.inactive.push({
                    id: thisUnit.unitid,
                    player: x,
                    displayName: thisUnit.displayName,
                    description: (thisUnit.description + " " + thisUnit.getAbilityDescription()).trimEnd(),
                    image: thisUnit.image,
                    position: [-1, -1],
                    weight: thisUnit.weight,
                    stats: thisUnit.getStats(),
                });
            }
        }

        return state;
    }

    /**
     * Only get the turn value from the current state
     * 
     * Use when the full state is not required
     * @returns turn number, -1 if challenge is finished
     */
    getTurn(): number{
        return this.turn;
    }

    /**
     * Only get the started value from the current state
     * 
     * Use when the full state is not required
     * @returns boolean
     */
    getStarted(): boolean{
        return this.started;
    }

    /**
     * Gets a score for a player. When a player is eliminated, their score
     * is computed from the weights of the units that were defeated while that
     * player was still active. Scores are only updated when a player is
     * eliminated or the challenge ends.
     * @param player player number
     * @returns score
     */
    getScore(player: number): number{
        if (player >= this.scores.length || player >= this.units.length){
            return 0;
        }

        if (this.turn < 0 && (this.winner === player || this.units[player].length > 0)){
            // If the challenge ended in a draw or a win, only compute scores for players 
            // who were not eliminated because those who were eliminated have already got
            // their scores recorded
            return this.getDefeatedScore(player);
        }
        // In all other cases, the player was eliminated and their score was recorded
        // during the turn when they were eliminated
        return Math.max(0, this.scores[player].score);
    }

    /**
     * Computes the score multiplier for a player based on how well they performed.
     * @param player player number
     * @returns score multiplier
     */
    getScoreMultiplier(player: number): number{
        // Player scores are multiplied based on whether they are the winner.
        // If a player does not win but was close to winning, they also
        // get their score multiplied, but by a smaller amount.

        if (this.scores.length !== this.units.length){
            return 0;
        } if (this.scores.length !== this.inactive.length){
            return 0;
        }

        let units = 0;
        let totalUnits = 0;

        for (let x = 0; x < this.scores.length; x++){
            if (x !== player){
                units += this.units[x].filter((value) => value.weight > 0).length;
                units += this.inactive[x].filter((value) => value.weight > 0).length;
                totalUnits += this.scores[x].initialUnits;
            }
        }

        if (totalUnits === 0){
            return 0;
        }

        if (units === 0 && this.winner === player){
            // Player defeated all units and won
            return CHALLENGE_WIN_MULTIPLIER;
        } if (units / totalUnits <= 0.5){
            // Player defeated at least half of the units
            return CHALLENGE_LOSS_MULTIPLIER;
        }

        return 1;
    }

    /**
     * Creates a map that can be passed to setTarget which makes
     * each unit of the player attack its closest targets
     * @param player player number to get closest targets for
     * @returns map from unit IDs to targets
     */
    getClosestTargets(player: number): Map<number, number[]>{
        let targetMap = new Map<number, number[]>();

        // These cases result in an empty map because any closest targets
        // data not on the player's turn may be incorrect
        if (player !== this.turn || this.turn < 0){
            return targetMap;
        }
        if (this.phase !== 1){
            return targetMap;
        }

        for (let x = 0; x < this.units[player].length; x++){
            const targets = this.units[player][x].getTargets();
            const range = this.units[player][x].getRange();

            if (targets > 0 && range > 0){
                let idDistances: [number, number][] = [];
                for (let i = 0; i < this.units.length; i++){
                    if (i !== player){
                        for (let j = 0; j < this.units[i].length; j++){
                            const distance = this.grid.attackDistancePoint(this.units[player][x].getPositionPoint(), this.units[i][j].getPositionPoint());
                            if (distance <= range){
                                // Only add targets that are in range because all others have
                                // no chance of being selected
                                idDistances.push([distance, this.units[i][j].unitid]);
                            }
                        }
                    }
                }

                // Sort targets by distance ascending so the closest are at the beginning
                idDistances.sort((a, b) => a[0] - b[0]);

                // The resulting target array will contain either the maximum number of targets
                // the unit can hit or the maximum number of targets available, whichever is lower.
                let closest: number[] = [];
                
                const c = Math.min(idDistances.length, targets);
                for (let i = 0; i < c; i++){
                    closest.push(idDistances[i][1]);
                }
                
                targetMap.set(this.units[player][x].unitid, closest);
            }
        }
        return targetMap;
    }

    /**
     * Sets the given player as ready.
     * The challenge starts when all players are ready.
     * @param player player number
     */
    setReady(player: number): void{

        if (this.started === true){
            return;
        }
        if (player >= this.units.length || player >= this.scores.length){
            return;
        }
        if (player < 0){
            return;
        }
        this.scores[player].ready = true;

        let allReady = true;
        for (let x = 0; x < this.scores.length; x++){
            // A score of -1 represents not ready
            if (this.scores[x].ready === false){
                allReady = false;
            }
        }
        
        if (allReady === true){
            this.started = true;
        }
    }

    /**
     * Removes the given player from the challenge then advances
     * the turn to the next active player. This function immediately
     * removes all units from a player and eliminates them from the
     * challenge.
     * @param player player number
     */
    leave(player: number): void{
        if (player >= this.units.length || player >= this.inactive.length || player >= this.scores.length){
            return;
        }

        // Set the player to ready so they do not stop other players from doing actions by being not ready
        this.scores[player].ready = true;

        if (player === this.turn){
            // Set this so updating the turn immediately goes to the next player
            this.phase = this.turnPhases;
            this.updateTurn();
        }
        
        for (let x = this.units[player].length - 1; x >= 0; x--){
            this.deleteUnit(player, x);
        }
        for (let x = this.inactive[player].length - 1; x >= 0; x--){
            // Units can be directly deleted from inactive because they are not in any maps
            this.inactive[player].splice(x, 1);
        }
    }

    /**
     * Activates any number of a player's units and initializes their positions
     * @param player player number
     * @param activateMap map from unit IDs to positions
     * @returns result with success or a failure message
     */
    activate(player: number, activateMap: Map<number, Point>): ActionResult{
        if (activateMap.size === 0){
            return {success: true, message: ""};
        }
        if (player >= this.units.length || player >= this.inactive.length || player >= this.scores.length){
            return {success: false, message: "Invalid player."};
        }
        if (this.started === true){
            // If the challenge has started, then a player can only activate
            // units on their turn before moving.
            if (player !== this.turn || this.turn < 0){
                return {success: false, message: "It is not your turn."};
            }
            if (this.phase !== 0){
                return {success: false, message: "You can only activate units before moving."};
            }
        } else{
            // If the challenge has not started, then a player can activate
            // units as long as they are not yet ready. This allows all players
            // to place their initial units before their first turn, otherwise
            // they will lose before their first turn since they have no units.
            if (this.scores[player].ready === true){
                return {success: false, message: "The challenge has not started yet."};
            }
        }
        

        // First, check that all the activations and their positions are valid
        // Go through the current player's inactive units and every time the
        // current unit's id matches one in the activateMap, add its position
        // to usedPositions.
        let usedPositions: number[] = [];
        for (let x = 0; x < this.inactive[player].length; x++){
            if (activateMap.has(this.inactive[player][x].unitid) === true){
                const point = activateMap.get(this.inactive[player][x].unitid)!;
                const position = this.grid.pointToIndex(point);
                if (usedPositions.includes(position) === false && this.grid.getPlayerAtIndex(position) === -1){

                    let restricted = false;
                    for (let y of this.restrictions){
                        if (player === y.player && point[0] >= y.left && point[0] <= y.right && point[1] >= y.top && point[1] <= y.bottom){
                            restricted = true;
                        }
                    }

                    if (restricted === false){
                        usedPositions.push(position);
                    }
                }
            }
        }

        if (activateMap.size !== usedPositions.length){
            // If the sizes here are different, at least one of the map's units
            // do not belong to the player
            return {success: false, message: "You cannot add those units to those locations."};
        }
        if (new Set<number>(usedPositions).size !== usedPositions.length){
            // If the sizes here are different, at least two of the map's units
            // are being activated at the same position.
            return {success: false, message: "You cannot activate multiple units at the same position."};
        }


        // Once the activations are validated, move the units from
        // inactive to units and update the grid
        for (let x = this.inactive[player].length - 1; x >= 0; x--){
            if (activateMap.has(this.inactive[player][x].unitid) === true){
                const point = activateMap.get(this.inactive[player][x].unitid)!;
                const position = this.grid.pointToIndex(point);

                let unitObject = this.inactive[player][x];
                unitObject.setPosition(position, point);

                this.units[player].push(unitObject);
                this.grid.setPlayerAtIndex(position, player);
                this.idMap.set(unitObject.unitid, [player, this.units[player].length - 1]);

                this.inactive[player].splice(x, 1);

                this.actionLog.push({roundsLeft: this.roundsLeft, action: "activate", data: {id: unitObject.unitid, position: point}});
            }
        }

        return {success: true, message: ""};
    }

    /**
     * Moves any number of a player's units to new positions.
     * All the moves specified here are executed one after another
     * in the order they are inserted to the map.
     * @param player player number
     * @param moveMap map from unit IDs to positions
     * @returns result with success or a failure message
     */
    move(player: number, moveMap: Map<number, Point>): ActionResult{
        if (this.started === false){
            return {success: false, message: "The challenge has not started yet."};
        }
        if (player !== this.turn || this.turn < 0){
            return {success: false, message: "It is not your turn."};
        }
        if (this.phase !== 0){
            return {success: false, message: "You cannot move right now."};
        }

        // unit, destination, penalty
        let validMoves: [UnitIndex, number, number][] = [];
        
        let validMessage = "";
        let distanceLeft = this.moveLimit;
        moveMap.forEach((value, key) => {
            if (this.idMap.has(key) === true){
                const index = this.idMap.get(key)!;
                const thisUnit = this.getUnit(index[0], index[1]);

                if (typeof thisUnit === "undefined"){
                    // Unit to move does not exist
                    validMessage = `Unit ${key} does not exist.`;
                    return;
                }
                if (player !== index[0]){
                    // Player does not own the unit they are moving
                    validMessage = `Unit ${key} belongs to another player.`;
                }
                
                if (validMessage === ""){
                    const dest = this.grid.pointToIndex(value);

                    const speed = thisUnit.getSpeed();

                    // Units can move further than their speed allows but for every <speed> moves
                    // over the limit, they receive one penalty. For each penalty, all other units
                    // that are targeting the unit will attack one extra time. There is a cap
                    // of 11 times the unit's speed on each move, meaning the maximum penalty is 10.
                    
                    const distanceUsed = this.grid.isValidMove(thisUnit.position, dest, speed * 11, thisUnit.getSpecialMoves());
                    if (distanceUsed < 0){
                        validMessage = `Move of unit ${key} to position (${value[0]}, ${value[1]}) is invalid.`;
                    } else{
                        // Subtract the distance required by this move from the current player's
                        // remaining distance. If it is less than 0, the user has exceeded the maximum
                        // distance they can travel in a turn, across all units.
                        distanceLeft -= distanceUsed;
                        if (distanceLeft < 0){
                            validMessage = `Exceeded the total number of moves allowed per turn.`;
                        }

                        // Use temporary moves to store grid states between moves
                        // This is required to implement moves like this: a moves to b, b moves to c
                        // Without storing temporary moves, position of b appears occupied so a can't move
                        // there but b will end up moving to c so b is not actually occupied.
                        // When checking for valid moves, the grid will look at any temporarily stored moves.
                        this.grid.tempMove(thisUnit.position, dest);
                    }

                    // Pass the penalty to the move function because it should only be applied
                    // if all the moves succeed
                    
                    validMoves.push([index, dest, Math.ceil(distanceUsed / speed)]);
                }
            } else{
                validMessage = `Unit ${key} could not be found.`;
            }
        });

        this.grid.clearTempMoves();
        
        if (validMessage === ""){
            for (let x = 0; x < validMoves.length; x++){
                this.movePlayer(validMoves[x][0][0], validMoves[x][0][1], validMoves[x][1], validMoves[x][2]);
            }
            this.updateTurn();
        }

        if (validMessage === ""){
            return {success: true, message: ""};
        }
        return {success: false, message: "One or more moves are not allowed. " + validMessage};
    }

    /**
     * Sets the target of any number of a player's units to other player's units.
     * This function only sets the targets, it does not do any attacks.
     * Once all players have done their moves and set their targets, all attacks
     * will happen at the same time before the next round starts.
     * @param player player number
     * @param targetMap map from the player's unit IDs to array of target unit IDs
     * @returns result with success or a failure message
     */
    setTarget(player: number, targetMap: Map<number, number[]>): ActionResult{
        if (this.started === false){
            return {success: false, message: "The challenge has not started yet."};
        }
        if (player !== this.turn || this.turn < 0){
            return {success: false, message: "It is not your turn."};
        }
        if (this.phase !== 1){
            return {success: false, message: "You cannot attack right now."};
        }

        let validTargets: [UnitIndex, UnitIndex[]][] = [];

        let validMessage = "";
        targetMap.forEach((value, key) => {
            if (this.idMap.has(key) === true){
                const index1 = this.idMap.get(key)!;
                const attacker = this.getUnit(index1[0], index1[1]);

                if (typeof attacker === "undefined"){
                    // Unit to attack with does not exist
                    validMessage = `Unit ${key} does not exist.`;
                    return;
                }
                if (player !== index1[0]){
                    // Player does not own the unit they are attacking with
                    validMessage = `Cannot attack with unit ${key} because it belongs to another player.`;
                }
                if (new Set<number>(value).size !== value.length){
                    validMessage = `Unit ${key} is trying to attack the same target multiple times.`;
                }
                if (value.length > attacker.getTargets()){
                    validMessage = `Unit ${key} is trying to attack more targets than it is allowed to.`;
                }

                let attackerTargets: UnitIndex[] = [];
                if (validMessage === ""){
                    // Check whether the attack is valid

                    // Unit ids have to be converted to positions before checking if the attack is valid
                    const attackerPosition = attacker.position;
                    let defenderPositions: number[] = [];

                    for (let x of value){
                        if (this.idMap.has(x) === true){
                            // Contains [player, unit] for this defender
                            const index2 = this.idMap.get(x)!;
                            const defender = this.getUnit(index2[0], index2[1]);

                            if (typeof defender === "undefined"){
                                validMessage = `Unit ${x} does not exist.`;
                            } else if (index1[0] === index2[0]){
                                validMessage = `Cannot target unit ${x} because it does not belong to another player.`;
                            } else{
                                defenderPositions.push(defender.position);
                            }

                            attackerTargets.push(index2);
                        } else{
                            validMessage = `Unit ${x} does not exist.`;
                        }
                    }

                    const attackResult = this.grid.isValidAttack(attackerPosition, defenderPositions, attacker.getRange(), attacker.getSpecialAttacks());
                    if (attackResult === false){
                        validMessage = `At least one attack by unit ${key} is invalid.`;
                    }
                }

                validTargets.push([index1, attackerTargets]);
            } else{
                validMessage = `Unit ${key} does not exist.`;
            }
        });

        if (validMessage === ""){
            for (let x = 0; x < validTargets.length; x++){
                for (let y = 0; y < validTargets[x][1].length; y++){
                    // validTargets[x] has [[player, unit], [ [player1, unit1], [player2, unit2], ... ]]
                    this.setTargetPlayer(validTargets[x][0][0], validTargets[x][0][1], validTargets[x][1][y][0], validTargets[x][1][y][1]);
                }
            }
            this.updateTurn();
        }

        if (validMessage === ""){
            return {success: true, message: ""};
        }
        return {success: false, message: "One or more attacks are not allowed. " + validMessage};
    }
}
