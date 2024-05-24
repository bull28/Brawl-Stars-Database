import {useNavigate} from "react-router-dom";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {Flex, Box, Text, IconButton} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";

export default function ChallengeStart(){
    const navigate = useNavigate();

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <IconButton pos={["relative", "absolute"]} top={["0", "2vh"]} left={["0", "2vh"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate("/bullgame")}} cursor={"pointer"}/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Create Challenge</Text>
            </Box>
            <Box w={"100%"}>
            </Box>
        </Flex>
    );
}
