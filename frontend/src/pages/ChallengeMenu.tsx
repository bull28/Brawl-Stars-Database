import ChallengePlayer from "../components/ChallengePlayer";
import {useEffect, useState, useCallback, useRef} from "react";
import {useNavigate} from "react-router-dom";
import AuthRequest, {getToken} from "../helpers/AuthRequest";
import {Flex, Text, Stack, Button} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";
import TokenDisplay from "../components/TokenDisplay";
import AccessoryLevel from "../components/AccessoryLevel";
import {UnitImage, ChallengeName, RoomName, ChallengeWins, UnitData, RoomData, RoomDataDisplay, ChallengeData} from "../types/ChallengeData";
import ChallengeProgress from "../components/ChallengeProgress";
import UnitSelection from "../components/UnitSelection";
import ChallengeSelection from "../components/ChallengeSelection";
import RoomSelection from "../components/RoomSelection";
import {UserInfoProps} from "../types/AccountData";

export default function ChallengeMenu(){
    // Player's token, used to connect to the server
    const [token, setToken] = useState<string>("");
    // Player's resources, including level, challenge points, coins, and tokens
    const [resources, setResources] = useState<UserInfoProps | undefined>(undefined);
    // Player's progress, including time until next daily reward and total number of wins
    const [progress, setProgress] = useState<ChallengeWins | undefined>(undefined);

    // Units and challenges available to the player
    const [unitList, setUnitList] = useState<UnitData | undefined>(undefined);
    const [challengeList, setChallengeList] = useState<ChallengeData | undefined>(undefined);

    // Challenge id and name that the player is creating
    const [challenge, setChallenge] = useState<ChallengeName | undefined>(undefined);
    // List of rooms that the player can join
    const [roomList, setRoomList] = useState<RoomDataDisplay>([]);
    // Room that the player has selected
    const [room, setRoom] = useState<RoomName | undefined>(undefined);
    // Units that the player will join the challenge with
    const [unitChoices, setUnitChoices] = useState<UnitImage[]>([]);

    // Whether or not the player is waiting for a challenge to start
    const [waiting, setWaiting] = useState<boolean>(false);
    // Whether or not the challenge has started
    const [started, setStarted] = useState<boolean>(false);
    
    const loginRef = useRef<boolean>(false);
    const navigate = useNavigate();
    
    // Called by the challenge player when creating a challenge
    const updateTokens = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setResources});
    }, []);
    // Called by the challenge player when joining a challenge
    const onJoin = useCallback(() => {
        setWaiting(true);
    }, []);
    // Called by the challenge player when the challenge starts
    const onStarted = useCallback(() => {
        setWaiting(false);
        setStarted(true);
    }, []);
    // Called by the challenge player when the list of rooms is refreshed
    const getRoomList = useCallback((rooms: RoomData) => {
        const roomsDisplay = rooms as RoomDataDisplay;
        const key = Date.now();
        for (let x = 0; x < roomsDisplay.length; x++){
            for (let y = 0; y < roomsDisplay[x].players.length; y++){
                roomsDisplay[x].players[y].key = key + y;
            }
        }
        setRoomList(roomsDisplay);
    }, []);
    
    const confirmRoomChoice = (room: RoomName) => {
        setRoom(room);
        setChallenge(undefined);
    }
    const confirmUnitChoices = (units: UnitImage[]) => {
        setUnitChoices(units);
    }
    const confirmChallengeChoice = (challenge: ChallengeName) => {
        setChallenge(challenge);
        if (typeof resources !== "undefined"){
            setRoom({username: resources.username, acceptCost: 0});
        }
    }

    useEffect(() => {
        const x = getToken();
        if (typeof x !== "undefined" && x !== ""){
            AuthRequest<UnitData>("/challenge/unit", {setState: setUnitList});
            AuthRequest<ChallengeData>("/challenge/all", {setState: setChallengeList});
            AuthRequest<ChallengeWins>("/challenge/progress", {setState: setProgress});
            AuthRequest<UserInfoProps>("/resources", {setState: setResources});
            setToken(x);
        }

        return (() => {
            setWaiting(false);
            setStarted(false);
            setUnitList(undefined);
            setChallengeList(undefined);
            setChallenge(undefined);
            setRoomList([]);
            setRoom(undefined);
            setUnitChoices([]);
        });
    }, []);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Challenges</Text>
            </Flex>
            <Stack w={"100%"} mb={"8vh"} mt={"2vh"} justifyContent={"center"} alignItems={"center"} spacing={[3, 3, 3, 3, 0]} direction={["column", "column", "column", "column", "row"]}>
                <Flex w={(started === false && typeof progress !== "undefined" && typeof resources !== "undefined") ? ["100%", "75%", "50%", "50%", "25%"] : undefined} justifyContent={"center"}>
                    <ChallengePlayer address={"http://localhost:11600"} token={token} room={room} createChallenge={challenge} unitChoices={unitChoices} onJoin={onJoin} onStarted={onStarted} updateTokens={updateTokens} setRoomList={getRoomList} loginRef={loginRef}/>
                </Flex>
                {(started === false && waiting === false && typeof progress !== "undefined" && typeof resources !== "undefined") ?
                    <Flex flexDir={"column"} alignItems={"center"} w={["100%", "100%", "100%", "100%", "50%"]} maxW={"720px"}>
                        <ChallengeProgress username={resources.username} avatar={resources.avatar} avatarColor={resources.avatarColor} data={progress}/>
                        <Flex h={"3vh"}/>
                        <AccessoryLevel level={resources.level} points={resources.points} upgradePoints={resources.upgradePoints}/>
                        <Flex h={"2vh"}/>
                        <Button bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} onClick={() => navigate("/leaderboard")}>Challenge Leaderboard</Button>
                    </Flex>
                    :
                    <></>
                }
                {(started === false && waiting === false && typeof progress !== "undefined" && typeof resources !== "undefined") ?
                    <Flex w={"25%"} justifyContent={"center"}>
                        <TokenDisplay callback={updateTokens} tokens={resources.tokens}/>
                    </Flex>
                    :
                    <></>
                }
            </Stack>
            {(loginRef.current === true && started === false && waiting === false && typeof progress !== "undefined" && typeof unitList !== "undefined" && typeof resources !== "undefined" && typeof challengeList !== "undefined") ?
                <Stack direction={"column"} spacing={10} mb={"10vh"} alignItems={"center"}>
                    <UnitSelection data={unitList} setSelected={confirmUnitChoices}/>
                    <RoomSelection data={roomList} level={resources.level} setSelected={confirmRoomChoice}/>
                    <ChallengeSelection data={challengeList} level={resources.level} setSelected={confirmChallengeChoice}/>
                </Stack>
                :
                <></>
            }
            {(started === false && waiting === true) ?
                <Flex flexDir={"column"} alignItems={"center"} w={"100%"}>
                    <Text fontSize={"2xl"} className={"heading-2xl"}>Waiting for players to join</Text>
                </Flex>
                :
                <></>
            }
        </Flex>
    );
}
