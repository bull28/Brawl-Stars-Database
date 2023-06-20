import {io, Socket} from "socket.io-client";
import {useState, useEffect, ChangeEvent} from "react";
import {useNavigate} from "react-router-dom";
import {
    Flex, Text, Stack, Image, Input, Button, SimpleGrid, useToast,
    Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton, Divider, useDisclosure
} from "@chakra-ui/react";
import {UnitImage, ChallengeName, RoomName, RoomData} from "../types/ChallengeData";
import {displayLong} from "../helpers/LargeNumberDisplay";
import api from "../helpers/APIRoute";

interface ChallengePlayerProps{
    address: string;
    token: string;
    createChallenge: ChallengeName | undefined;
    room: RoomName | undefined;
    unitChoices: UnitImage[];
    onStarted: () => void;
    onJoin: () => void;
    setRoomList: (rooms: RoomData) => void;
    loginRef: React.MutableRefObject<boolean>;
}

type Point = [number, number];
interface MoveRequest{unit: number; position: Point;}
interface AttackRequest{unit: number; targets: number[];}
interface UnitState{
    id: number;
    player: number;
    displayName: string;
    description: string;
    image: string;
    position: Point;
    weight: number;
    stats: {
        health: number;
        maxHealth: number;
        shield: number;
        damage: number;
        range: number;
        targets: number;
        speed: number;
        specialMoves: boolean;
        specialAttacks: boolean;
    };
}
interface ChallengeManagerState{
    players: ({
        username: string;
        avatar: string;
    })[];
    challenge: {
        started: boolean;
        winner: number;
        roundsLeft: number;
        turn: number;
        phase: number;
        gridSize: Point;
        restrictions: ({
            player: number;
            left: number;
            right: number;
            top: number;
            bottom: number
        })[];
        units: UnitState[];
        inactive: UnitState[];
        actionLog: ({
            roundsLeft: number;
            action: string;
            data: {id: number; position: Point;} | {id: number; damage: number;} | {id: number;};
        })[];
    };
}
interface RewardEvent{
    coins: number;
    points: number;
    bonusClaimed: boolean;
    accessory: {
        displayName: string;
        image: string;
    } | undefined;
}

interface ServerToClientEvents{
    message: (message: string) => void;
    error: (message: string) => void;
    login: (message: string) => void;
    state: (state: ChallengeManagerState) => void;
    rooms: (challenges: RoomData) => void;
    join: (playerIndex: number) => void;
    finish: (win: number, reward: RewardEvent) => void;
}

interface ClientToServerEvents{
    login: (token: string) => void;
    create: (challengeid: number, unitNames: string[]) => void;
    rooms: (token: string) => void;
    join: (playerName: string, unitNames: string[]) => void;
    action: (action: string, request: MoveRequest[] | AttackRequest[]) => void;
}

const playerColors: string[] = ["#ff0000", "#a000ff", "#00c040", "#f08000", "#808080"];

function pointToIndex(point: Point, width: number): number{
    return point[0] + width * point[1];
}

function indexToPoint(index: number, width: number): Point{
    return [((index % width) + width) % width, Math.floor(index / width)];
}

function healthBarColor(fraction: number): string{
    fraction = Math.min(1, Math.max(0, fraction));
    let healthColor = "#ffffff";
    if (fraction < 0.5){
        healthColor = (255 * 65536 + Math.floor(510 * fraction) * 256).toString(16);
    }
    else{
        healthColor = (Math.floor(255 - 510 * (fraction - 0.5)) * 65536 + 255 * 256).toString(16);
    }
    while (healthColor.length < 6){
        healthColor = "0" + healthColor;
    }
    return "#" + healthColor;
}

function playerColor(player: number, currentPlayer: number): string{
    if (currentPlayer >= 0 && player === currentPlayer){
        // The current player is the player who is logged in and is always the blue color
        return "#2828ff";
    }
    let index = player;
    if (player > currentPlayer){
        // This makes it so the current player does not take up one of the player colors
        // and that color cannot ever be displayed since the current player's color is always blue
        index--;
    }
    return playerColors[Math.max(0, Math.min(playerColors.length - 1, index))];
}

function phaseText(phase: number): string{
    if (phase === 0){
        return "Move Phase";
    } else if (phase === 1){
        return "Attack Phase";
    }
    return "";
}

function winText(win: number): {text: string; color: string;}{
    if (win === 1){
        return {text: "Challenge Won!", color: "#00ffff"};
    } else if (win === 0){
        return {text: "Draw!", color: "#c0c0c0"};;
    }
    return {text: "Challenge Lost!", color: "#ff0000"};
}

function pointInRange(start: Point, target: Point, range: number): boolean{
    if (Math.sqrt((target[0] - start[0]) * (target[0] - start[0]) + (target[1] - start[1]) * (target[1] - start[1])) <= range){
        return true;
    }
    return false;
}

function unitButtonDisabled(challenge: ChallengeManagerState["challenge"] | undefined, player: number, unit: UnitState, lastUnit: UnitState | undefined): boolean{
    // Returns whether the button corresponding to "unit" should be disabled
    // given the current phase, current player, and the last unit clicked on
    if (typeof challenge === "undefined"){
        return false;
    }

    if (challenge.phase === 0){
        if (typeof lastUnit !== "undefined" && unit.id !== lastUnit.id){
            // A unit cannot move to a position that already contains a unit
            return true;
        }
    } else if (challenge.phase === 1){
        if (typeof lastUnit !== "undefined"){
            if ((unit.player === player && unit.id !== lastUnit.id) || pointInRange(lastUnit.position, unit.position, lastUnit.stats.range) === false){
                // The player cannot attack their own unit or another unit outside its range
                return true;
            }
        }
    }

    return false;
}

function showStats(unit: UnitState, owner: string): JSX.Element{
    const unitStats = unit.stats;
    const healthFraction = Math.min(1, Math.max(0, unitStats.health / Math.max(1, unitStats.maxHealth)));

    const titleFontSizes = ["20px", "24px", "28px", "28px", "28px"];
    const fontSizes = ["16px", "16px", "20px", "20px", "20px"];
    const lineHeights = ["20px", "20px", "24px", "24px", "24px"];
    const fontSizes2 = ["12px", "16px", "16px", "16px", "16px"];

    return (
        <Flex w={"250px"} px={"5px"} bgColor={"gray.800"} flexDir={"column"}>
            <Flex justifyContent={"center"} fontSize={titleFontSizes} mt={2}>{unit.displayName}</Flex>
            <Flex justifyContent={"center"} fontSize={"16px"}>{`Owner: ${owner}`}</Flex>
            <Flex bgColor={"#808080"} w={"100%"} h={"3px"} mt={2} mb={2}/>
            <Flex w={"100%"} alignItems={"center"} flexDir={"column"}>
                <Text maxW={"100%"} fontSize={fontSizes} whiteSpace={"pre"}>
                    {unitStats.shield > 0 ? `${unitStats.health} \u2764  +  ${unitStats.shield} \u2748` : `${unitStats.health} / ${unitStats.maxHealth} \u2764`}
                </Text>
                <Flex w={"80%"} h={"15px"} bgColor={"#333"}>
                    <Flex w={`${100 * healthFraction}%`} h={"15px"} bgColor={unitStats.shield > 0 ? "#ff03cc" : healthBarColor(healthFraction)}/>
                </Flex>
            </Flex>
            <Flex bgColor={"#808080"} w={"100%"} h={"3px"} mt={2} mb={2}/>
            <Flex flexDir={"column"} paddingLeft={1} paddingRight={1}>
                <Flex color={"#f55"}>
                    <Flex w={"100px"} fontSize={fontSizes} lineHeight={lineHeights}>Damage</Flex>
                    <Flex fontSize={fontSizes} lineHeight={lineHeights}>{unitStats.damage}</Flex>
                </Flex>
                <Flex color={"#5ff"}>
                    <Flex w={"100px"} fontSize={fontSizes} lineHeight={lineHeights}>Range</Flex>
                    <Flex fontSize={fontSizes} lineHeight={lineHeights}>{unitStats.range}</Flex>
                </Flex>
                <Flex color={"#5f5"}>
                    <Flex w={"100px"} fontSize={fontSizes} lineHeight={lineHeights}>Targets</Flex>
                    <Flex fontSize={fontSizes} lineHeight={lineHeights}>{unitStats.targets}</Flex>
                </Flex>
                <Flex color={"#f5f"}>
                    <Flex w={"100px"} fontSize={fontSizes} lineHeight={lineHeights}>Speed</Flex>
                    <Flex fontSize={fontSizes} lineHeight={lineHeights}>{unitStats.speed}</Flex>
                </Flex>
            </Flex>
            <Flex bgColor={"#808080"} w={"100%"} h={"3px"} mt={2} mb={2}/>
            <Flex alignItems={"center"} flexDir={"column"}>
                {unitStats.specialMoves === true ? <Flex fontSize={fontSizes2} lineHeight={fontSizes2} color={"#ffc700"}>Can jump over units</Flex> : <></>}
                {unitStats.specialAttacks === true ? <Flex fontSize={fontSizes2} lineHeight={fontSizes2} color={"#ffc700"}>Can attack through units</Flex> : <></>}
                {unitStats.specialMoves === true || unitStats.specialAttacks === true ? <Flex bgColor={"#808080"} w={"100%"} h={"3px"} mt={2} mb={2}/> : <></>}
            </Flex>
            <Flex flexDir={"column"}>
                <Text paddingLeft={1} paddingRight={1}>{unit.description}</Text>
                {unit.description !== "" ? <Flex bgColor={"#808080"} w={"100%"} h={"3px"} mt={2} mb={2}/> : <></>}
            </Flex>
        </Flex>
    );
}

export default function ChallengePlayer({address, token, room, createChallenge, unitChoices, onJoin, onStarted, setRoomList, loginRef}: ChallengePlayerProps){
    // Socket object
    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | undefined>(undefined);
    // Index of the player that is currently logged in
    const [currentPlayer, setCurrentPlayer] = useState<number>(-1);

    // List of players in the challenge
    const [players, setPlayers] = useState<ChallengeManagerState["players"] | undefined>(undefined);
    // Challenge manager state
    const [challenge, setChallenge] = useState<ChallengeManagerState["challenge"] | undefined>(undefined);
    // Which unit is currently being hovered over
    const [currentUnit, setCurrentUnit] = useState<UnitState | undefined>(undefined);
    // Text in the input box
    const [inputText, setInputText] = useState<string>("");
    
    // Last unit that was clicked on
    const [lastUnit, setLastUnit] = useState<UnitState | undefined>(undefined);
    // List of targets that were clicked on since the last unit was changed
    const [lastTargets, setLastTargets] = useState<number[]>([]);
    // Move actions that will be sent on the next turn
    const [moveActions, setMoveActions] = useState<Map<MoveRequest["unit"], MoveRequest["position"]>>(new Map());
    // Attack actions that will be sent on the next turn
    const [attackActions, setAttackActions] = useState<Map<AttackRequest["unit"], AttackRequest["targets"]>>(new Map());

    // Toggle preview mode
    const preview: boolean = true;
    // Toggle showing area restrictions
    const [showRestrictions, setShowRestrictions] = useState<boolean>(false);
    
    // Reward that the player received
    const [reward, setReward] = useState<{winner: number; reward: RewardEvent} | undefined>(undefined);
    // Data for the modal with the challenge confirm button
    const [confirm, setConfirm] = useState<{title: string; text: string; cost: number; action: () => void;}>({title: "Confirm", text: "", cost: 0, action: () => {}});

    
    const toast = useToast();
    const navigate = useNavigate();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm} = useDisclosure();
    
    // Hover over a unit
    const selectUnit = (unit: UnitState | undefined): void => {
        setCurrentUnit(unit);
    }
    // Click on a unit or position on the grid
    const click = (unit: UnitState | undefined, p: Point): void => {
        if (typeof challenge === "undefined"){
            return;
        }
        if (typeof unit !== "undefined"){
            if (challenge.phase === 0){
                // Move phase expects clicks on a unit then a position
                // If the same unit is clicked twice, reset the state
                if (typeof lastUnit !== "undefined" && lastUnit.id === unit.id){
                    setLastUnit(undefined);
                    return;
                } else{
                    setLastUnit(unit);
                }
            } else if (challenge.phase === 1){
                // Attack phase expects clicks on a unit then another unit
                // if the existing last unit is not undefined, add action with that
                // unit and the given id.
                if (typeof lastUnit !== "undefined" && lastUnit.id !== unit.id){
                    // If they click on a unit after already clicking on an attacker, add it to the targets
                    if (lastTargets.includes(unit.id) === false){
                        const newTargets = lastTargets.concat([unit.id]);

                        // If clicking on this unit causes the targets to equal or exceed the number of targets
                        // the unit can attack, immediately add the attack without the player having to click
                        // on the unit again.
                        if (newTargets.length >= lastUnit.stats.targets){
                            setAttackActions(new Map(attackActions.set(lastUnit.id, newTargets)));
                            setLastUnit(undefined);
                            setLastTargets([]);
                        } else{
                            setLastTargets(newTargets);
                        }
                    }
                } else if (typeof lastUnit !== "undefined" && lastUnit.id === unit.id){
                    if (lastTargets.length > 0){
                        // When they click on the attacker unit, add the attack request
                        // with all the targets they clicked on since they clicked on the attacker

                        // Normally, attacks will be automatically added when enough targets are clicked but
                        // the player can still attack fewer targets by clicking on the unit that is attacking
                        setAttackActions(new Map(attackActions.set(lastUnit.id, lastTargets)));
                    }
    
                    setLastUnit(undefined);
                    setLastTargets([]);
                } else{
                    // If this is the first click, set the unit as the attacker
                    setLastUnit(unit);
                }
            }
        }
        if (p[0] >= 0 && p[1] >= 0){
            // This function can execute on both move phase and attack phase
            // On move phase, it may execute when another unit is clicked
            if (challenge.phase === 0){
                // Move phase expects clicks on a unit then a position
                if (typeof lastUnit !== "undefined"){
                    setMoveActions(new Map(moveActions.set(lastUnit.id, p)));
                    setLastUnit(undefined);
                    setLastTargets([]);
                }
            }
        }
    }

    const changeInput = (event: ChangeEvent<HTMLInputElement>): void => {
        setInputText(event.target.value);
    }

    const sendAction = (action: string): void => {
        setLastUnit(undefined);
        setLastTargets([]);
        if (typeof socket !== "undefined"){
            if (action === "move" || action === "activate"){
                socket.emit("action", action, Array.from(moveActions).map((value) => ({unit: value[0], position: value[1]})));
            } else if (action === "attack"){
                socket.emit("action", action, Array.from(attackActions).map((value) => ({unit: value[0], targets: value[1]})));
            } else if (action === "ready"){
                socket.emit("action", "ready", []);
            }
        }
    }

    useEffect(() => {
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(address);
        socket.on("connect", () => {
            setSocket(socket);
        });
    }, [address]);

    useEffect(() => {
        if (typeof socket !== "undefined"){
            socket.removeAllListeners();
            socket.on("state", (data) => {
                onStarted();
                setCurrentUnit(undefined);
                setPlayers(data.players);
                setChallenge(data.challenge);
            });
            socket.on("message", (data) => {
                if (data === ""){
                    // The player cannot make the same moves two turns in a row so clear move actions
                    setMoveActions(new Map());
                    setAttackActions(new Map());
                } else{
                    toast({description: data, status: "info", duration: 2500, isClosable: true});
                }
            });
            socket.on("login", (data) => {
                loginRef.current = true;
                socket.emit("rooms", token);
                toast({description: data, status: "info", duration: 2500, isClosable: true});
            });
            socket.on("rooms", (data) => {
                setRoomList(data);
            });
            socket.on("error", (data) => {
                console.error(data);
                if (loginRef.current === true){
                    toast({description: data, status: "error", duration: 4500, isClosable: true});
                }
            });
            socket.on("finish", (winner, reward) => {
                setReward({winner: winner, reward: reward});
                onOpen();
            });
            socket.on("join", (data) => {
                setCurrentPlayer(data);
                onJoin();
            });

            socket.emit("login", token);
        }
    }, [socket, token, toast, loginRef, setRoomList, onJoin, onStarted, onOpen]);

    useEffect(() => {
        return (() => {
            setCurrentUnit(undefined);
            setPlayers(undefined);
            setChallenge(undefined);
            setCurrentUnit(undefined);
            setInputText("");
            setLastUnit(undefined);
            setLastTargets([]);
            setMoveActions(new Map());
            setAttackActions(new Map());
            setShowRestrictions(false);
            setReward(undefined);
            socket?.disconnect();
        });
    }, [socket]);
    
    const grid: (UnitState | undefined)[] = [];
    let restrictionList: ChallengeManagerState["challenge"]["restrictions"] = [];
    let currentPosition: Point | undefined = undefined;
    let currentTargets: number[] = [];

    let gridWidth = 1;
    let gridHeight = 1;

    if (typeof challenge !== "undefined"){
        gridWidth = Math.max(gridWidth, challenge.gridSize[0]);
        gridHeight = Math.max(gridHeight, challenge.gridSize[1]);
        
        if (currentPlayer >= 0){
            restrictionList = challenge.restrictions.filter((value) => value.player === currentPlayer);
        }

        // Fill all grid spots with undefined first
        for (let y = 0; y < gridHeight; y++){
            for (let x = 0; x < gridWidth; x++){
                grid.push(undefined);
            }
        }
        
        // Then, set data for all spots that have a unit
        for (let unit of challenge.units){
            //let p = unit.position[0] + unit.position[1] * gridWidth;
            let p = pointToIndex(unit.position, gridWidth);

            // If move actions has the current unit id as a key then show that unit
            // at the new location if preview mode is on
            const newPoint = moveActions.get(unit.id);
            if (preview && typeof newPoint !== "undefined"){
                p = pointToIndex(newPoint, gridWidth);
            }

            if (p < grid.length){
                grid[p] = unit;
            }
        }
        // Inactive units only appear on the grid in preview mode

        if (preview){
            for (let unit of challenge.inactive){
                const newPoint = moveActions.get(unit.id);
                if (typeof newPoint !== "undefined"){
                    const p = pointToIndex(newPoint, gridWidth);
    
                    if (p < grid.length){
                        grid[p] = unit;
                    }
                }
            }
        }
        
        // Get the position of the unit that is currently being hovered over
        if (typeof currentUnit !== "undefined"){
            const newPoint = moveActions.get(currentUnit.id);
            if (preview && typeof newPoint !== "undefined"){
                // In preview mode, set the current position to the temporary point
                // so the user can see the range of a unit at its new location after it moves
                currentPosition = newPoint;
            } else{
                if (currentUnit.position[0] >= 0 && currentUnit.position[1] >= 0){
                    currentPosition = currentUnit.position;
                }
            }
            
            if (attackActions.has(currentUnit.id)){
                // When hovering over a unit, show which other units it is currently targeting
                // This does not show on inactive units because even though the player could
                // try to target an inactive unit, all attacks against inactive units are invalid
                currentTargets = attackActions.get(currentUnit.id)!;
            }
        }
    }
    
    return (
        <Flex flexDir={"column"} alignItems={"center"} w={"100%"}>
            {(typeof players !== "undefined" && typeof challenge !== "undefined") ?
                <Flex flexDir={"column"} maxW={"100vw"}>
                    <Flex flexDir={["column","row","row","row","row"]}>
                        <Flex flexDir={"column"} bgColor={"gray.800"} p={2}>
                            <Flex>
                                <SimpleGrid spacing={1} columns={gridWidth}>{grid.map((value, index) => {
                                    const point = indexToPoint(index, gridWidth);
                                    
                                    let inRange = false;
                                    if (typeof currentPosition !== "undefined" && typeof currentUnit !== "undefined"){
                                        if (challenge.phase !== 1 || typeof lastUnit === "undefined" || (currentUnit.player === challenge.turn)){
                                            // Prevent showing attack range of opponent units when setting targets
                                            // Range of opponent units is usually not necessary when determining which targets to attack
                                            // If it were to be helpful, the player can always check before setting targets
                                            // This prevents the screen from flashing green when hovering over many targets quickly
                                            inRange = pointInRange(currentPosition, point, currentUnit.stats.range);
                                        }
                                    }
                    
                                    if (typeof value === "undefined"){
                                        let color = "#808080";
                                        if (inRange){
                                            color = "#0f0";
                                        } else if (showRestrictions && restrictionList.findIndex((rect) => (point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom)) !== -1){
                                            color = "#f05031";
                                        }
                                        return (<Button key={index} w={"50px"} h={"50px"} justifyContent={"center"} alignItems={"center"} fontSize={"12px"} borderRadius={0} color={"#000"} bgColor={color} onClick={() => click(undefined, point)}>{`${point[0]}, ${point[1]}`}</Button>);
                                    }
                                    
                                    const healthFraction = Math.min(1, Math.max(0, value.stats.health / Math.max(1, value.stats.maxHealth)));
                    
                                    let borderColor = playerColor(value.player, currentPlayer);
                                    if (typeof lastUnit !== "undefined" && lastUnit.id === value.id){
                                        borderColor = "#ff0";
                                    } else if (lastTargets.includes(value.id)){
                                        borderColor = "#f0f";
                                    }

                                    return (
                                        <Button key={-1 * value.id - 1} w={"50px"} h={"50px"} fontSize={"16px"} lineHeight={"16px"} bgColor={"#0000"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} alignItems={"flex-start"} justifyContent={"flex-start"} padding={0} borderRadius={0} _hover={{}} _active={{}} border={`2px solid ${borderColor}`} bgImage={value.image !== "" ? `url('${api}/image/${value.image}')`: undefined} isDisabled={preview && (attackActions.has(value.id) || unitButtonDisabled(challenge, currentPlayer, value, lastUnit))} onMouseOver={() => {selectUnit(value);}} onMouseOut={() => {if (!preview || lastUnit?.id !== value.id){selectUnit(undefined);}}} onClick={() => {click(value, point);}}>
                                            <Flex flexDir={"column"} w={"100%"} h={"100%"}>
                                                {value.weight > 0 || healthFraction < 1 ?
                                                    <Flex w={"100%"} h={"3px"} bgColor={"#333"}>
                                                        <Flex w={`${100 * healthFraction}%`} h={"3px"} bgColor={value.stats.shield > 0 ? "#ff03cc" : healthBarColor(healthFraction)}/>
                                                    </Flex>
                                                    :
                                                    <></>
                                                }
                                                <Flex color={(typeof currentUnit !== "undefined" && inRange) ? (currentTargets.includes(value.id) ? "#f4f" : "#0f0") : "#fff"} className={"heading-md"}>{value.id}</Flex>
                                            </Flex>
                                        </Button>
                                    );
                                })}
                                </SimpleGrid>
                            </Flex>
                            <Flex bgColor={"#000"} w={"100%"} mt={1} overflow={"auto"} sx={{
                                "&::-webkit-scrollbar": {
                                width: "8px",
                                borderRadius: "8px",
                                backgroundColor: `rgba(0, 0, 0, 0.2)`
                                },
                                "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(255, 255, 255, 0.5)",
                                borderRadius: "6px"
                                },
                                "&::-webkit-scrollbar-corner": {
                                backgroundColor: "rgba(0, 0, 0, 0)"
                            }}}>{challenge.inactive.map((value) => {
                                let borderColor = playerColor(value.player, currentPlayer);
                                if (typeof lastUnit !== "undefined" && lastUnit.id === value.id){
                                    borderColor = "#ff0";
                                } else if (lastTargets.includes(value.id)){
                                    borderColor = "#f0f";
                                }
                
                                return (
                                    <Button key={value.id} w={"50px"} h={"50px"} fontSize={"16px"} lineHeight={"16px"} bgColor={"#0000"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} alignItems={"flex-start"} justifyContent={"flex-start"} padding={0} borderRadius={0} _hover={{}} _active={{}} border={`2px solid ${borderColor}`} bgImage={value.image !== "" ? `url('${api}/image/${value.image}')`: undefined} isDisabled={preview && (attackActions.has(value.id) || unitButtonDisabled(challenge, currentPlayer, value, lastUnit))} onMouseOver={() => {selectUnit(value);}} onMouseOut={() => {if (!preview || lastUnit?.id !== value.id){selectUnit(undefined);}}} onClick={() => {click(value, [-1, -1])}}>
                                        <Flex w={"100%"} h={"100%"} className={"heading-md"}>{value.id}</Flex>
                                    </Button>
                                );
                            })}
                            </Flex>
                            
                            <Stack mt={3} mb={3} spacing={2} alignItems={"flex-start"} direction={"row"}>{players.map((value, index) => {
                                let turnText = "";
                                if (challenge.winner >= 0 && challenge.winner === index){
                                    turnText = "Winner!";
                                } else if (challenge.started && challenge.turn === index){
                                    turnText = phaseText(challenge.phase);
                                }
                                return (
                                    <Flex w={"150px"} key={value.username + value.avatar} flexDir={"column"} alignItems={"center"} paddingTop={"5px"} bgColor={(challenge.winner >= 0 && challenge.winner === index) ? playerColor(challenge.winner, currentPlayer) : "#0000"}>
                                        <Flex w={"50%"} justifyContent={"center"} alignItems={"center"} borderRadius={"50%"} border={"3px solid #ffffff"}>
                                            <Image src={value.avatar !== "" ? `${api}/image/${value.avatar}` : `${api}/image/avatars/free/default.webp`} borderRadius={"50%"}/>
                                        </Flex>
                                        <Text maxW={"100%"} className={"heading-xs"}>{value.username !== "" ? value.username : "Player"}</Text>
                                        <Flex w={"100%"} h={"3px"} bgColor={playerColor(index, currentPlayer)}/>
                                        {turnText !== "" ?
                                            <Flex maxW={"100%"} className={"heading-md"}>{turnText}</Flex>
                                            :
                                            <Flex color={"#0000"}>BULL</Flex>
                                        }
                                        {(challenge.winner >= 0 && challenge.winner === index && 0) ?
                                            <Flex maxW={"100%"} className={"heading-md"}>Winner!</Flex>
                                            :
                                            <></>
                                        }
                                    </Flex>
                                );
                            })}
                            </Stack>
                        </Flex>
                        <Flex w={"3px"} bgColor={"#808080"}/>
                        {(typeof currentUnit !== "undefined" && currentUnit.player < players.length) ? showStats(currentUnit, players[currentUnit.player].username) : <Flex w={"250px"} px={"5px"} bgColor={"gray.800"} flexDir={"column"}/>}
                    </Flex>
                    <Flex flexDir={["column", "row", "row", "row", "row"]}>
                        <Flex flexDir={"column"} w={["90vw", "300px", "300px", "300px", "300px"]}>
                            <Flex w={"100%"} minH={"100px"} border={"3px solid #fff"} borderRadius={"3%"} flexDir={"column"}>
                                {Array.from(moveActions).map((value) => {
                                    // key should be unique because moveActions is a map and maps require keys to be unique
                                    return <Button key={value[0]} bgColor={"#00000080"} onClick={() => {moveActions.delete(value[0]); setMoveActions(new Map(moveActions));}}>{`Move by ${value[0]} to ${value[1]}`}</Button>
                                })}
                                {Array.from(attackActions).map((value) => {
                                    return <Button key={value[0]} bgColor={"#00000080"} onClick={() => {attackActions.delete(value[0]); setAttackActions(new Map(attackActions));}}>{`Attack by ${value[0]} against ${value[1]}`}</Button>
                                })}
                            </Flex>
                            <Flex w={"100%"}>
                                <Button w={"50%"} className={"heading-md"} onClick={() => setMoveActions(new Map())}>Clear Moves</Button>
                                <Button w={"50%"} className={"heading-md"} onClick={() => setAttackActions(new Map())}>Clear Attacks</Button>
                            </Flex>
                            <Button w={"100%"} className={"heading-md"} onClick={() => {selectUnit(undefined); setShowRestrictions(!showRestrictions);}}>{showRestrictions ? "Hide area restrictions" : "Show area restrictions"}</Button>
                        </Flex>
                        <Flex flexDir={"column"} w={["90vw", "240px", "240px", "240px", "240px"]}>
                            {challenge.started === false ? <Button w={"100%"} className={"heading-md"} onClick={() => sendAction("ready")}>Ready</Button> : <></>}
                            <Flex>
                                <Button className={"heading-md"} isDisabled={challenge.turn !== currentPlayer || currentPlayer < 0 || !challenge.started} onClick={() => sendAction("move")}>Move</Button>
                                <Button className={"heading-md"} isDisabled={challenge.turn !== currentPlayer || currentPlayer < 0 || !challenge.started} onClick={() => sendAction("attack")}>Attack</Button>
                                <Button className={"heading-md"} isDisabled={(challenge.turn !== currentPlayer || currentPlayer < 0) && challenge.started} onClick={() => sendAction("activate")}>Activate</Button>
                            </Flex>
                            <Flex padding={1} fontSize={"xl"} className={"heading-xl"}>{`Rounds left: ${challenge.roundsLeft}`}</Flex>
                        </Flex>
                    </Flex>
                </Flex>
                :
                <Flex alignItems={"center"} justifyContent={"center"} w={"100%"}>
                    <Flex flexDir={"column"} alignItems={"center"} minW={"10vw"} w={"100%"}>
                        {(typeof socket !== "undefined" && loginRef.current === true) ?
                            <Flex justifyContent={"center"} w={"80%"}>
                                <Flex flexDir={"column"} w={"100%"} bgColor={"gray.800"} p={2} borderRadius={"lg"}>
                                    <Input id={"challenge"} onChange={changeInput}/>
                                    
                                    <Button maxW={"100%"} fontSize={"lg"} onClick={() => { if (typeof createChallenge !== "undefined"){ setConfirm({title: "Create Challenge?", text: createChallenge.displayName, cost: createChallenge.acceptCost, action: () => {socket.emit("create", createChallenge.challengeid, unitChoices.map((value) => value.name));}}); onOpenConfirm(); } else if (inputText.length > 0){socket.emit("create", parseInt(inputText), unitChoices.map((value) => value.name));} else{toast({description: "No challenge id specified", status: "error", duration: 4500, isClosable: true});} }}>Create Challenge</Button>
                                    <Flex mb={5} px={1} justifyContent={"center"} borderRadius={"md"} maxW={"100%"} bgColor={"gray.700"}>{typeof createChallenge !== "undefined" ? createChallenge.displayName : " "}</Flex>
                                    <Button maxW={"100%"} fontSize={"lg"} onClick={() => { if (typeof room !== "undefined"){ setConfirm({title: "Join Challenge?", text: `${room.username}'s Room`, cost: room.acceptCost, action: () => {socket.emit("join", room.username, unitChoices.map((value) => value.name));}}); onOpenConfirm(); } else if (inputText.length > 0){socket.emit("join", inputText, unitChoices.map((value) => value.name));} else{toast({description: "No room name specified", status: "error", duration: 4500, isClosable: true}); } }}>Join Challenge</Button>
                                    <Flex mb={5} px={1} justifyContent={"center"} borderRadius={"md"} maxW={"100%"} bgColor={"gray.700"}>{typeof room !== "undefined" ? room.username : " "}</Flex>
                                    <Button maxW={"100%"} fontSize={"lg"} onClick={() => socket.emit("rooms", token)}>Refresh Room List</Button>
                                </Flex>
                            </Flex>
                            :
                            ((typeof socket !== "undefined" && socket.connected === true) ?
                                <Flex flexDir={"column"} alignItems={"center"} bgColor={"gray.800"} p={2} borderRadius={"lg"}>
                                    <Text fontSize={"2xl"} mb={2} mx={3}>You must be logged in to play challenges.</Text>
                                    <Button onClick={() => navigate("/login")}>Log In</Button>
                                </Flex>
                                :
                                <Flex flexDir={"column"} alignItems={"center"} bgColor={"gray.800"} p={2} borderRadius={"lg"}>
                                    <Text fontSize={"2xl"} mb={2} mx={3}>Could not connect to the server.</Text>
                                </Flex>
                            )
                        }
                    </Flex>
                </Flex>
            }
            <Flex flexDir={"column"}>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay/>
                        {typeof reward !== "undefined" ?
                            <ModalContent p={3} border={`3px solid ${winText(reward.winner).color}`}>
                                <ModalHeader fontWeight={"normal"} fontSize={"3xl"} className={"heading-3xl"} textAlign={"center"} color={winText(reward.winner).color}>{winText(reward.winner).text}</ModalHeader>
                                <ModalCloseButton/>
                                <Divider/>
                                <ModalBody>
                                    <Flex flexDir={"column"} alignItems={"center"}>
                                        <Text fontSize={"2xl"} className={"heading-2xl"}>Rewards</Text>
                                        <Flex alignItems={"center"}>
                                            <Text fontSize={"2xl"} className={"heading-2xl"} color={"#fff"} mr={1}>{displayLong(reward.reward.coins)}</Text>
                                            <Image src={`${api}/image/resources/resource_coins.webp`} h={7}/>
                                        </Flex>
                                        <Flex alignItems={"center"} mb={3}>
                                            <Text fontSize={"2xl"} className={"heading-2xl"} color={reward.reward.bonusClaimed === true ? "#0f0" : "#fff"} mr={1}>{displayLong(reward.reward.points)}</Text>
                                            <Image src={`${api}/image/resources/resource_challenge_points.webp`} h={7}/>
                                        </Flex>
                                        {reward.reward.bonusClaimed === true ?
                                            <Text fontSize={"md"} className={"heading-md"} color={"#0f0"}>Daily bonus claimed!</Text>
                                            :
                                            <></>
                                        }
                                        {(typeof reward.reward.accessory !== "undefined") ?
                                            <Flex flexDir={"column"} alignItems={"center"} mt={10}>
                                                <Text fontSize={"2xl"} className={"heading-2xl"}>New Accessory Unlocked!</Text>
                                                <Image src={`${api}/image/${reward.reward.accessory.image}`} maxW={"50%"}/>
                                                <Text fontSize={"2xl"} className={"heading-2xl"}>{reward.reward.accessory.displayName}</Text>
                                            </Flex>
                                            :
                                            <></>
                                        }
                                        <Button onClick={() => window.location.reload()} mt={5}>Exit</Button>
                                    </Flex>
                                </ModalBody>
                            </ModalContent>
                            :
                            <ModalContent p={3}>
                                <ModalHeader fontWeight={"normal"} fontSize={"3xl"} className={"heading-3xl"} textAlign={"center"}>Challenge Results</ModalHeader>
                                <ModalCloseButton/>
                                <Divider/>
                                <ModalBody>
                                    <Flex flexDir={"column"} alignItems={"center"}>
                                        <Text fontSize={"lg"} className={"heading-lg"}>Results could not be loaded.</Text>
                                        <Button onClick={() => window.location.reload()} mt={5}>Exit</Button>
                                    </Flex>
                                </ModalBody>
                            </ModalContent>
                        }
                </Modal>
                <Modal isOpen={isOpenConfirm} onClose={onCloseConfirm}>
                    <ModalOverlay/>
                        <ModalContent p={3}>
                            <ModalHeader fontWeight={"normal"} fontSize={"3xl"} className={"heading-3xl"} textAlign={"center"}>{confirm.title}</ModalHeader>
                            <ModalCloseButton/>
                            <Divider/>
                            <ModalBody>
                                <Flex flexDir={"column"} alignItems={"center"}>
                                    <Text fontSize={"xl"} className={"heading-xl"} mb={5}>{confirm.text}</Text>
                                    <Text fontSize={"lg"} className={"heading-lg"}>Your Units</Text>
                                    {unitChoices.length > 0 ?
                                        <Stack direction={["column", "row", "row", "row", "row"]} wrap={"wrap"}>
                                            {unitChoices.map((value) => {
                                                return (
                                                    <Image key={value.key} w={10} src={`${api}/image/${value.image}`}/>
                                                );
                                            })}
                                        </Stack>
                                        :
                                        <Text className={"heading-md"} color={"#f00"}>No units selected</Text>
                                    }
                                    {confirm.cost > 0 ? <Text mt={8} textAlign={"center"}>Warning: If you leave the page after accepting this challenge, your tokens will not be refunded.</Text> : <></>}
                                    <Button onClick={() => {confirm.action(); onCloseConfirm(); onClose();}} mt={8}>
                                        <Text fontSize={"lg"}>{confirm.cost}</Text>
                                        <Image ml={1} src={`${api}/image/resources/resource_tokens.webp`} h={5}/>
                                    </Button>
                                </Flex>
                            </ModalBody>
                        </ModalContent>
                </Modal>
            </Flex>
        </Flex>
    );
}
