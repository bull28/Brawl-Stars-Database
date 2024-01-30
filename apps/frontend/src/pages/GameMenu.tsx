import {useNavigate} from "react-router-dom";
import {Flex, Text, Button, Link} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";
import api from "../helpers/APIRoute";

export default function GameMenu(){
    const navigate = useNavigate();

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame</Text>
            </Flex>
            <Flex flexDir={"column"}>
                <Link href={`${api}/bullgame`}>
                    <Button w={"100%"} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}}>Play Game</Button>
                </Link>
                <Button bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} onClick={() => navigate("/bullgame/rewards")}>Claim Rewards</Button>
                <Button bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} onClick={() => navigate("/leaderboard")}>Leaderboard</Button>
            </Flex>
        </Flex>
    );
}
