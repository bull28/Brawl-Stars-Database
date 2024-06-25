import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Flex, Box, Text, Button, Link, useToast} from "@chakra-ui/react";
import {AxiosError} from "axios";
import AuthRequest from "../helpers/AuthRequest";
import MasteryDisplay from "../components/MasteryDisplay";
import {MasteryData} from "../types/AccountData";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";

export default function GameMenu(){
    const [mastery, setMastery] = useState<MasteryData>({
        level: 0, 
        points: 0,
        current: {points: 0, image: "", color: "#000000"},
        next: {points: 1, image: "", color: "#000000"}
    });
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>();
    const [rewardCount, setRewardCount] = useState<number>(0);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        AuthRequest<MasteryData>("/accessory/mastery", {setState: (data) => {
            setMastery(data);
            setLoggedIn(true);
            //setNotLoggedIn(false);

            AuthRequest<Record<string, unknown>[]>("/report/all", {setState: (data1) => {
                // The type of this value does not matter, only the length is used
                setRewardCount(data1.length);
            }}, false);
        }, fallback: (error) => {
            setLoggedIn(false);
            //setNotLoggedIn(true);
            const e = error as AxiosError;
            if (e.response !== undefined && e.response.status !== 400 && e.response.status !== 401){
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
        }}, false);
    }, [toast]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame</Text>
            </Box>
            <Box w={"100%"}>
                <Flex w={"100%"} flexDir={"column"} gap={5} alignItems={"center"}>
                    {loggedIn === true &&
                        <>
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} gap={1}>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => window.location.href = `${api}/bullgame`}>Play Classic Mode</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/challenges")}>Play Challenge</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/createchallenge")}>Create Challenge</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/rewards")}>{`Claim Rewards ${rewardCount > 0 ? `(${rewardCount})` : ""}`}</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/accessories")}>View Accessories</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/enemies")}>View Game Enemies</Button>
                        </Flex>
                        <MasteryDisplay data={mastery}/>
                        </>
                    }
                    {loggedIn === false &&
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} className={"heading-lg"} gap={"0.5em"}>
                            <Text>You are currently not logged in.</Text>
                            <Text>You can still play the game but you need to be logged in to earn rewards from playing.</Text>
                            <Link color={"blue.300"} href={`${api}/bullgame`}>Click here to play while logged out</Link>
                            <Link color={"blue.300"} href={"/login"}>Click here to login</Link>
                        </Flex>
                    }
                </Flex>
            </Box>
        </Flex>
    );
}
