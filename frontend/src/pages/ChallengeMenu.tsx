import ChallengePlayer from "../components/ChallengePlayer";
import {useEffect, useState, useCallback} from "react";
import AuthRequest, {getToken} from "../helpers/AuthRequest";
import {Flex, Text} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";
import {UserInfoProps} from "../types/AccountData";
import {UnitImage, ChallengeName, UnitData, RoomData, ChallengeData} from "../types/ChallengeData";
import UnitSelection from "../components/UnitSelection";
import ChallengeSelection from "../components/ChallengeSelection";
import RoomSelection from "../components/RoomSelection";

export default function ChallengeMenu(){
    // Player's resources, including level, challenge points, coins, and tokens
    const [resources, setResources] = useState<UserInfoProps | undefined>(undefined);

    // Units and challenges available to the player
    const [unitList, setUnitList] = useState<UnitData | undefined>(undefined);
    const [challengeList, setChallengeList] = useState<ChallengeData | undefined>(undefined);

    // Challenge id and name that the player is creating
    const [challenge, setChallenge] = useState<ChallengeName | undefined>(undefined);
    // List of rooms that the player can join
    const [roomList, setRoomList] = useState<RoomData>([]);
    // Room that the player has selected
    const [room, setRoom] = useState<string | undefined>(undefined);
    // Units that the player will join the challenge with
    const [unitChoices, setUnitChoices] = useState<UnitImage[]>([]);

    // Whether or not the player is waiting for a challenge to start
    const [waiting, setWaiting] = useState<boolean>(false);
    // Whether or not the challenge has started
    const [started, setStarted] = useState<boolean>(false);

    
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
        setRoomList(rooms);
    }, []);
    
    const confirmRoomChoice = (room: string) => {
        setRoom(room);
        setChallenge(undefined);
    }
    const confirmUnitChoices = (units: UnitImage[]) => {
        setUnitChoices(units);
    }
    const confirmChallengeChoice = (challenge: ChallengeName) => {
        setChallenge(challenge);
        if (typeof resources !== "undefined"){
            setRoom(resources.username);
        }
    }

    const token = getToken();
    const tokenString: string = (typeof token === "string" ? token : "");

    useEffect(() => {
        AuthRequest<UnitData>("/challenge/unit", {setState: (value: UnitData) => setUnitList(value)});
        AuthRequest<ChallengeData>("/challenge/all", {setState: (value: ChallengeData) => setChallengeList(value)});
        AuthRequest<UserInfoProps>("/resources", {setState: setResources});

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
            <ChallengePlayer address={"http://localhost:11600"} token={tokenString} room={room} createChallenge={challenge} unitChoices={unitChoices} onJoin={onJoin} onStarted={onStarted} setRoomList={getRoomList}/>
            {(started === false && waiting === false && typeof unitList !== "undefined" && typeof resources !== "undefined" && typeof challengeList !== "undefined") ?
                <Flex flexDir={"column"} alignItems={"center"}>
                    <UnitSelection data={unitList} setSelected={confirmUnitChoices}/>
                    <RoomSelection data={roomList} level={resources.level} setSelected={confirmRoomChoice}/>
                    <ChallengeSelection data={challengeList} level={resources.level} setSelected={confirmChallengeChoice}/>
                </Flex>
                :
                <></>
            }
            {(started === false && waiting === true) ?
                <Flex flexDir={"column"} alignItems={"center"}>
                    <Text fontSize={"2xl"} className={"heading-2xl"}>Waiting for players to join</Text>
                </Flex>
                :
                <></>
            }
        </Flex>
    );
}
