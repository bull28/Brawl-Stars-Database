import ChallengePlayer from "../components/ChallengePlayer";
import {getToken} from "../helpers/AuthRequest";
import {Flex, Text} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";

export default function ChallengeMenu(){
    const token = getToken();
    const tokenString: string = (typeof token === "string" ? token : "");

    return (
        <Flex flexDir={"column"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Challenges</Text>
            </Flex>
            <ChallengePlayer address={"http://localhost:11600"} token={tokenString}/>
        </Flex>
    );
}
