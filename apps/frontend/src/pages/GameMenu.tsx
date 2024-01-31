import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Flex, Text, Button, Link, useToast} from "@chakra-ui/react";
import {AxiosError} from "axios";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import MasteryDisplay from "../components/MasteryDisplay";
import {MasteryData} from "../types/AccountData";
import api from "../helpers/APIRoute";

export default function GameMenu(){
    const [mastery, setMastery] = useState<MasteryData>({level: 0, points: 0, currentLevel: 0, nextLevel: 1, image: "", color: "#000000"});
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        AuthRequest<MasteryData>("/accessory/mastery", {setState: (data) => {
            setMastery(data);
            setLoggedIn(true);
        }, fallback: (error) => {
            setLoggedIn(false);
            const e = error as AxiosError;
            if (e.response !== undefined && e.response.status !== 400){
                const message = e.response.data;
                if (typeof message === "string"){
                    toast({
                        description: message,
                        status: "error",
                        duration: 3000,
                        isClosable: true
                    });
                }
            }
        }});
    }, [toast]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame</Text>
            </Flex>
            <Flex flexDir={"column"} w={"100%"}>
                <Flex w={"100%"} flexDir={"column"} gap={3} alignItems={"center"}>
                    <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} gap={1}>
                        <Link minW={["50%", "15em"]} href={`${api}/bullgame`}>
                            <Button w={"100%"} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"}>Play Game</Button>
                        </Link>
                        <Button minW={["50%", "15em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={loggedIn ? () => navigate("/bullgame/rewards") : () => navigate("/login")}>Claim Rewards</Button>
                        <Button minW={["50%", "15em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/leaderboard")}>Leaderboard</Button>
                        <Link minW={["50%", "15em"]} href={`${api}/bullgame`}>
                            <Button w={"100%"} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"}>How to Play</Button>
                        </Link>
                    </Flex>
                    {loggedIn === true ?
                        <MasteryDisplay data={mastery}/>
                        :
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} className={"heading-lg"} gap={"0.5em"}>
                            <Text>You are currently not logged in.</Text>
                            <Text>You can still play the game but you need to be logged in to earn rewards from playing.</Text>
                            <Link color={"blue.300"} href={"/login"}>Click here to login</Link>
                        </Flex>
                    }
                </Flex>
            </Flex>
        </Flex>
    );
}
