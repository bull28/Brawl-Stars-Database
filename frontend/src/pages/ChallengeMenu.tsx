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

    // Uunits and challenges available to the player
    const [units, setUnits] = useState<UnitData | undefined>(undefined);
    const [challenges, setChallenges] = useState<ChallengeData | undefined>(undefined);

    // Challenge id and name that the player is creating
    const [challenge, setChallenge] = useState<ChallengeName | undefined>(undefined);
    // List of rooms that the player can join
    const [roomList, setRoomList] = useState<RoomData>([]);
    // Room that the player has selected
    const [room, setRoom] = useState<string | undefined>(undefined);
    // Units that the player will join the challenge with
    const [unitChoices, setUnitChoices] = useState<UnitImage[]>([]);

    // Whether or not the challenge has started
    const [started, setStarted] = useState<boolean>(false);

    
    // Called by the challenge player when the challenge starts
    const onStarted = useCallback(() => {
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
        AuthRequest("/unit", {setState: [{func: (value: UnitData) => {console.log(value); setUnits(value);}, attr: ""}]});
        AuthRequest("/challenge", {setState: [{func: (value: ChallengeData) => {console.log(value); setChallenges(value);}, attr: ""}]});
        AuthRequest("/resources", {setState: [{func: setResources, attr: ""}]});

        return (() => {
            setStarted(false);
            setUnits(undefined);
            setChallenges(undefined);
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
            <ChallengePlayer address={"http://localhost:11600"} token={tokenString} room={room} createChallenge={challenge} unitChoices={unitChoices} onStarted={onStarted} setRoomList={getRoomList}/>
            {started === false ?
                <Flex flexDir={"column"} alignItems={"center"}>
                <Flex h={"200px"}/>
                {typeof units !== "undefined" ? <UnitSelection data={units} setSelected={confirmUnitChoices}/> : <></>}
                <RoomSelection data={roomList} level={(typeof resources !== "undefined" ? resources.level : 1)} setSelected={confirmRoomChoice}/>
                {(typeof challenges !== "undefined" && typeof resources !== "undefined") ? <ChallengeSelection data={challenges} level={(typeof resources !== "undefined" ? resources.level : 1)} setSelected={confirmChallengeChoice}/> : <></>}
                </Flex>
                :
                <></>
            }
            
        </Flex>
    );
}
