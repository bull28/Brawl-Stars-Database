import express, {Request, Response} from "express";
import {createServer} from "http";
import {Server, BroadcastOperator} from "socket.io";
import {AVATAR_IMAGE_DIR, IMAGE_FILE_EXTENSION, DAILY_CHALLENGE_REFRESH, DAILY_CHALLENGE_MULTIPLIER, REPLAY_CHALLENGE_START} from "./data/constants";
import {validateToken} from "./modules/authenticate";
import {getAccessoryDisplay, createUnitList, getPresetChallenge, updateLevelProgress} from "./modules/accessories";
import {ChallengeManager} from "./modules/challengemanager";
import {parseStringArray, parseNumberArray, updateTokens, checkChallengeRequirement, afterChallenge, addChallengeReward} from "./modules/database";
import {ActionResult, ChallengeManagerState, MoveRequest, AttackRequest, UnitPreview, UnitDisplay, RewardEvent, ChallengeRoomPreview} from "./types";

const MAX_ACTIVE_CHALLENGES = 100;

interface ServerToClientEvents{
    message: (message: string) => void;
    error: (message: string) => void;
    state: (state: ChallengeManagerState) => void;
    rooms: (challenges: ChallengeRoomPreview[]) => void;
    preview: (units: UnitDisplay[]) => void;
    join: (playerIndex: number) => void;
    finish: (win: boolean, reward: RewardEvent) => void;
}

interface ClientToServerEvents{
    login: (token: string) => void;
    create: (challengeid: number) => void;
    rooms: (token: string) => void;
    preview: (playerRoom: string) => void;
    join: (playerName: string, unitNames: string[]) => void;
    action: (action: string, request: MoveRequest[] | AttackRequest[]) => void;
}

interface InterServerEvents{
    bull: () => void;
}

interface SocketData{
    ash: number;
}

interface ChallengeMapResult{
    challenge: ChallengeManager;
    room: string;
    username: string;
}

function sendState(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, challengeData: ChallengeMapResult): void{
    const state = challengeData.challenge.getState();
    if (typeof state !== "undefined"){
        io.in(challengeData.room).emit("state", state);
    }
}

function createChallengeManager(challengeid: number): ChallengeManager | undefined{
    const challengeData = getPresetChallenge(challengeid);
    if (typeof challengeData !== "undefined"){
        return new ChallengeManager(challengeData);
    }
    return undefined;
}

function getChallenge(socketid: string, socketidMap: Map<string, string>, userMap: Map<string, string>, challengeMap: Map<string, ChallengeManager>): ChallengeMapResult | undefined{
    const username = socketidMap.get(socketid);
    if (typeof username !== "undefined"){
        const roomName = userMap.get(username);
        if (typeof roomName !== "undefined"){
            const challenge = challengeMap.get(roomName);
            if (typeof challenge !== "undefined"){
                return {challenge: challenge, room: roomName, username: username};
            }
        }
    }
    return undefined;
}

function userExists(socketidMap: Map<string, string>, username: string): boolean{
    let exists = false;
    socketidMap.forEach((value) => {
        if (value === username){
            exists = true;
        }
    });
    return exists;
}

function isMoveRequest(request: (MoveRequest | AttackRequest)[]): request is MoveRequest[]{
    if (request.length === 0){
        return true;
    } else if (request.length >= 1){
        let isMove = true;
        for (let x = 0; x < request.length; x++){
            isMove = isMove && ((request[x] as MoveRequest).position !== undefined);
        }
        return isMove;
    }
    return false;
}

function isAttackRequest(request: (MoveRequest | AttackRequest)[]): request is AttackRequest[]{
    if (request.length === 0){
        return true;
    } else if (request.length >= 1){
        let isAttack = true;
        for (let x = 0; x < request.length; x++){
            isAttack = isAttack && ((request[x] as AttackRequest).targets !== undefined);
        }
        return isAttack;
    }
    return false;
}

async function claimReward(username: string, challenge: ChallengeManager, room: BroadcastOperator<ServerToClientEvents, SocketData>): Promise<void>{
    const reward = challenge.getReward(username);

    try{
        const results = await afterChallenge({username: username});

        // Updating reward:
        //  1. Get the player's coins, level, points, accessories, last_win, and completed
        //  2. Compare last_win with the current time and set the daily bonus multiplier
        //  3. Check if the challenge is preset and if the player already completed it
        //     and the player won
        //  4. If they did complete it, stop and return (they get no reward)
        //  5. If not, add the id to the completed challenge array if it is preset
        //  6. Add the coins reward to the coins value
        //  7. Call updateLevelProgress with [level, points] and the reward points to get
        //     the new [level, points]
        //  8. If the reward includes an accessory (not ""), add it to accessories if not
        //     already there
        //  9. If the challenge costed tokens to accept, update to the player's total wins
        // 10. Update the database with the new values
        //    Only update last_win if they did claim the daily bonus

        const isWinner = challenge.isWinner(username);

        const accessories = parseStringArray(results[0].accessories);
        const completed = parseNumberArray(results[0].completed);

        const currentTime = Date.now();
        let multiplier = 1;
        let lastWin = results[0].last_win;
        let totalWins = results[0].total_wins;
        if (isWinner === true && reward.bonus === true && currentTime - lastWin >= DAILY_CHALLENGE_REFRESH){
            multiplier = DAILY_CHALLENGE_MULTIPLIER;
            lastWin = currentTime;
        }
        
        const challengeid = challenge.extraData.challengeid;

        if (challengeid < REPLAY_CHALLENGE_START && isWinner === true){
            if (completed.includes(challengeid) === true){
                room.emit("finish", isWinner, {
                    coins: 0,
                    points: 0,
                    bonusClaimed: false,
                    accessory: undefined
                });
                return;
            }
            completed.push(challengeid);
        }

        const [level, points] = updateLevelProgress([results[0].level, results[0].points], reward.points * multiplier);

        // Only show the accessory reward if the player has not already unlocked it
        let accessoryUnlocked = false;
        if (reward.accessory !== "" && accessories.includes(reward.accessory) === false){
            accessories.push(reward.accessory);
            accessoryUnlocked = true;
        }

        if (isWinner === true && challenge.extraData.acceptCost > 0){
            totalWins++;

            // Some accessories are unlocked after winning enough challenges
            if (totalWins >= 25 && accessories.includes("brock") === false){
                accessories.push("brock");
            } if (totalWins >= 100 && accessories.includes("lola") === false){
                accessories.push("lola");
            } if (totalWins >= 500 && accessories.includes("meg") === false){
                accessories.push("meg");
            }
        }

        await addChallengeReward({
            coins: results[0].coins + reward.coins,
            level: level,
            points: points,
            accessories: JSON.stringify(accessories),
            last_win: lastWin,
            total_wins: totalWins,
            completed: JSON.stringify(completed),
            username: username
        });

        // Only send event to the client after the write to the database because if it throws then the player gets no reward
        const newAccessory = getAccessoryDisplay(reward.accessory);
        room.emit("finish", isWinner, {
            coins: reward.coins,
            points: reward.points * multiplier,
            bonusClaimed: (multiplier > 1),
            accessory: (accessoryUnlocked === true && typeof newAccessory !== "undefined") ? {displayName: newAccessory.displayName, image: newAccessory.image} : undefined
        });
    } catch (error){}
}


const app = express();

/**
 * Maps socket ids to usernames.
 */
const socketidMap = new Map<string, string>();

/**
 * Maps usernames to room names.
 */
const userMap = new Map<string, string>();

/**
 * Maps room names to challenge manager objects.
 */
const challengeMap = new Map<string, ChallengeManager>();

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {cors: {origin: "*"}});

app.get("/", (req: Request, res: Response) => {
    res.send("");
});

io.on("connection", (socket) => {
    socket.on("login", (token: string) => {
        // Associates the username provided with the socket id.
        // There can be only one username with each socket id and switching
        // usernames is only allowed if the user has not joined a challenge yet.
        const username = validateToken(token);
        if (username === ""){
            socket.emit("error", "Invalid token.");
            return;
        }

        //let exists = (Array.from(socketidMap.values()).findIndex((value) => value === username) !== -1);
        let exists = userExists(socketidMap, username);

        if (exists === true || userMap.has(username) === true){
            // If the username is a value in socketidMap then it has already been associated with a user
            // If the username is a key in userMap then it has already joined a challenge
            // In both of these cases, the login fails
            socket.emit("error", "The username " + username + " is already active in another session.");
        } else{
            const currentUsername = socketidMap.get(socket.id);
            if (typeof currentUsername !== "undefined"){
                // User has already logged in
                if (userMap.has(currentUsername) === true){
                    socket.emit("error", "You cannot switch usernames after starting a challenge.");
                } else{
                    socketidMap.set(socket.id, username);
                    socket.emit("message", "Switched usernames: " + currentUsername + " \u279c " + username);
                }
            } else{
                // User has not logged in yet
                socketidMap.set(socket.id, username);
                socket.emit("message", "Logged in as " + username);
            }
        }
    });

    socket.on("create", async (challengeid: number) => {
        // Creates a new room and assigns the specified challengeid to the room.
        // The player will have to join their own challenge separately after they have chosen their units.
        // Tokens are deducted when creating a challenge.
        // The user must already be logged in to join a room.

        if (challengeMap.size >= MAX_ACTIVE_CHALLENGES){
            socket.emit("error", "There are too many active challenges. Try again later.");
            return;
        }

        const username = socketidMap.get(socket.id);

        // The user must have already logged in before joining a challenge room
        if (typeof username !== "undefined"){
            // The name of the new room is the same as the username
            const roomName = username;
            // Replace this with database information later (and probably move it to login)

            if (challengeMap.has(roomName) === true){
                // This case can occur if a user creates a challenge then leaves it before it ends.
                // The challenge will still exist because there are still other players participating in it.
                socket.emit("error", "You cannot create a new challenge now.");
                return;
            }

            if (userMap.has(username) === true){
                // If the username is already in userMap then the user already joined a challenge
                // and cannot create a new one.
                socket.emit("error", "You are already in a challenge.");
            } else{
                // Otherwise, get the challenge room name that the user specifies then attempt to join

                const challenge = createChallengeManager(challengeid);

                if (typeof challenge === "undefined"){
                    socket.emit("error", "Challenge with given id not found.");
                    return;
                }

                // Check if the player is allowed to accept the challenge
                try{
                    const resources = await checkChallengeRequirement({username: username});

                    if (resources[0].tokens < challenge.extraData.acceptCost){
                        throw new Error("You do not have enough tokens to accept this challenge.");
                    } if (resources[0].level < challenge.extraData.requiredLevel){
                        throw new Error("Your accessory level is not high enough to accept this challenge.");
                    }

                    await updateTokens({
                        tokens: resources[0].tokens - challenge.extraData.acceptCost,
                        username: username
                    });
                } catch (error){
                    socket.emit("error", (error as Error).message);
                    return;
                }

                // Send the preview state then let them choose which units they want to use
                // After they choose their units, add them to the challenge in the "units" event
                challengeMap.set(roomName, challenge);
                socket.emit("preview", challenge.getPreviewState());
            }
        } else{
            socket.emit("error", "You are not logged in.");
        }
    });

    socket.on("rooms", (token: string) => {
        // Gets a list of all the rooms that can be joined
        // Includes the name of the room and some information about the challenge
        // Any challenges that have already started will not be included here

        const username = validateToken(token);
        if (username === ""){
            socket.emit("error", "Invalid token.");
            return;
        }

        let challenges: ChallengeRoomPreview[] = [];

        challengeMap.forEach((value, key) => {
            if (typeof value.challenge === "undefined"){
                const players: ChallengeRoomPreview["players"] = value.players.filter((player) => player.auto === false).map((player) => {
                    return {
                        username: player.username,
                        avatar: (player.avatar !== "" ? AVATAR_IMAGE_DIR + player.avatar + IMAGE_FILE_EXTENSION : "")
                    };
                });

                challenges.push({
                    username: key,
                    displayName: value.extraData.displayName,
                    requiredLevel: value.extraData.requiredLevel,
                    acceptCost: value.extraData.acceptCost,
                    players: players
                });
            }
        });

        socket.emit("rooms", challenges);
    });

    socket.on("preview", (playerName: string) => {
        // Gets a preview of the units in the challenge.
        // This does not join the challenge and does not cost any tokens to use
        // The user must already be logged in to get a preview.
        // The player who created the room already selected a challenge id

        const username = socketidMap.get(socket.id);
        const roomName = playerName;

        if (typeof username !== "undefined" && roomName !== ""){
            if (userMap.has(username) === true){
                // If the username is already in userMap then the user is already in a challenge
                // and cannot join a new one.
                socket.emit("error", "You are already in a challenge.");
            } else if (userMap.has(roomName) === true){
                // The user map must have the room name otherwise there is no challenge to join

                const challenge = challengeMap.get(roomName);
                if (typeof challenge === "undefined"){
                    socket.emit("error", "Challenge could not be found.");
                    return;
                }
                // Check here if the player is allowed to accept the challenge
                // (enough tokens, required level) and return if not allowed

                if (typeof challenge.getState() !== "undefined"){
                    socket.emit("error", "This challenge has already started.");
                    return;
                }

                // Send the preview state then let them choose which units they want to use
                // After they choose their units, add them to the challenge in the "units" event
                socket.emit("preview", challenge.getPreviewState());
            } else{
                socket.emit("error", "User is not currently in a room.");
            }
        } else if (typeof username !== "undefined"){
            socket.emit("error", "No room name specified.");
        } else{
            socket.emit("error", "You are not logged in.");
        }
    });

    socket.on("join", async (playerName: string, unitNames: string[]) => {
        // Joins the specified player's challenge room.
        // Costs tokens unless the player joins their own challenge.
        // Adds the currently logged in player to the challenge.

        if (Array.isArray(unitNames) === false){
            socket.emit("error", "Request incorrectly formatted.");
            return;
        }

        const username = socketidMap.get(socket.id);
        const roomName = playerName;

        // The room name of the challenge is the same as the name of the user who created it

        if (typeof username !== "undefined" && roomName !== ""){
            if (userMap.has(username) === true){
                socket.emit("error", "You are already in a challenge.");
                return;
            }

            const challenge = challengeMap.get(roomName);
            if (typeof challenge !== "undefined"){
                if (userMap.has(roomName) === false && username !== roomName){
                    // The user who created the challenge must be the first player to join it
                    // Any other players who try to join first will not be allowed to join.
                    socket.emit("error", "User has not started the challenge yet.");
                    return;
                }
                if (typeof challenge.getState() !== "undefined"){
                    // Challenges that have already started cannot be joined.
                    socket.emit("error", "You are not allowed to join this challenge.");
                    return;
                }

                let units: UnitPreview[] = [];
                let avatar = "";

                try{
                    const resources = await checkChallengeRequirement({username: username});

                    if (resources[0].tokens < challenge.extraData.acceptCost){
                        throw new Error("You do not have enough tokens to accept this challenge.");
                    } if (resources[0].level < challenge.extraData.requiredLevel){
                        throw new Error("Your accessory level is not high enough to accept this challenge.");
                    }

                    const accessories = parseStringArray(resources[0].accessories);

                    units = createUnitList(unitNames, accessories, resources[0].level);
                    if (units.length === 0 && unitNames.length !== 0){
                        throw new Error("Unit selection is not valid.");
                    }

                    avatar = resources[0].active_avatar;

                    if (username !== roomName){
                        await updateTokens({
                            tokens: resources[0].tokens - challenge.extraData.acceptCost,
                            username: username
                        });
                    }
                } catch (error){
                    socket.emit("error", (error as Error).message);
                    return;
                }

                const result = challenge.setPlayer({username: username, avatar: avatar}, units);

                // The user must be allowed to join the challenge and they are added to the map
                // only if setPlayer succeeds.
                if (result.success === true){
                    socket.join(roomName);
                    userMap.set(username, roomName);
                    socket.emit("join", challenge.findPlayer(username));
                    sendState(io, {challenge: challenge, room: roomName, username: username});
                } else{
                    // Only send the error to the user who it applies to
                    socket.emit("error", result.message);
                }
            } else{
                socket.emit("error", "Challenge could not be found.");
            }
        } else if (typeof username !== "undefined"){
            socket.emit("error", "No room name specified.");
        } else{
            socket.emit("error", "You are not logged in.");
        }
    });

    socket.on("action", (action: string, request: (MoveRequest | AttackRequest)[]) => {
        // Takes an action in the challenge the user is currently participating in.

        const challengeData = getChallenge(socket.id, socketidMap, userMap, challengeMap);
        if (typeof challengeData !== "undefined"){
            let result: ActionResult = {success: false, message: ""};

            const turnBefore = challengeData.challenge.isFinished();

            if (action === "ready"){
                result = challengeData.challenge.setReady(challengeData.username);
            } else if (action === "activate"){
                if (isMoveRequest(request)){
                    result = challengeData.challenge.activate(challengeData.username, request);
                }
            } else if (action === "move"){
                if (isMoveRequest(request)){
                    result = challengeData.challenge.move(challengeData.username, request);
                }
            } else if (action === "attack"){
                if (isAttackRequest(request)){
                    result = challengeData.challenge.setTarget(challengeData.username, request);
                }
            }

            if (result.success === true){
                socket.emit("message", result.message);
            } else{
                socket.emit("error", result.message);
            }

            const turnAfter = challengeData.challenge.isFinished();
            
            if (turnBefore === false && turnAfter === true){
                const thisRoom = io.sockets.adapter.rooms.get(challengeData.room);
                if (typeof thisRoom !== "undefined"){
                    // For each user in the current room, send a private message to them with the
                    // reward they will receive when they disconnect. Note: this does not actually
                    // give them the reward here.

                    thisRoom.forEach((value) => {
                        // Get their username using socketidMap
                        const thisPlayer = socketidMap.get(value);
                        if (typeof thisPlayer !== "undefined"){
                            claimReward(thisPlayer, challengeData.challenge, io.in(value));
                        }
                    });
                }
            }

            sendState(io, challengeData);
        } else{
            socket.emit("error", "You are not currently in a challenge.");
        }
    });

    socket.on("disconnecting", async () => {
        // When the user disconnects, remove them from all the maps
        // and any challenge they may have been participating in.

        const username = socketidMap.get(socket.id);
        if (typeof username !== "undefined"){
            const roomName = userMap.get(username);
            if (typeof roomName !== "undefined"){
                const challenge = challengeMap.get(roomName);
                if (typeof challenge !== "undefined"){
                    challenge.leave(username);
                    sendState(io, {challenge: challenge, room: roomName, username: username});
                }

                socket.leave(roomName);

                if (io.sockets.adapter.rooms.has(roomName) === false){
                    challengeMap.delete(roomName);
                }

                userMap.delete(username);
            }
            socketidMap.delete(socket.id);

            if (io.sockets.adapter.rooms.has(username) === false){
                // This executes if the user joins a challenge but does not
                // set any units then leaves. They will not be added to the
                // user map so search for the challenge by room name
                challengeMap.delete(username);
            }
        }
    });
});

export default server;
