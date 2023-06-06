import ChallengePlayer from "../components/ChallengePlayer";
import {useEffect, useState} from "react";
import AuthRequest, {getToken} from "../helpers/AuthRequest";
import {Flex, Text} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";
import {UnitData, ChallengeData} from "../types/ChallengeData";

export default function ChallengeMenu(){
    const [units, setUnits] = useState<UnitData | undefined>(undefined);
    const [challenges, setChallenges] = useState<ChallengeData | undefined>(undefined);

    const token = getToken();
    const tokenString: string = (typeof token === "string" ? token : "");

    useEffect(() => {
        AuthRequest("/unit", {setState: [{func: (value: UnitData) => {console.log(value); setUnits(value);}, attr: ""}]});
        AuthRequest("/challenge", {setState: [{func: (value: ChallengeData) => {console.log(value); setChallenges(value);}, attr: ""}]});
    }, []);

    return (
        <Flex flexDir={"column"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Challenges</Text>
            </Flex>
            <ChallengePlayer address={"http://localhost:11600"} token={tokenString} units={units} challenges={challenges}/>
        </Flex>
    );
}
