import {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {Flex, Box, Text, Image, Button, SimpleGrid, Link, Divider, useToast} from "@chakra-ui/react";
import {AxiosError} from "axios";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import MasteryDisplay from "../components/MasteryDisplay";
import {MasteryData} from "../types/AccountData";
import {Accessory} from "../types/GameData";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function GameMenu(){
    const [mastery, setMastery] = useState<MasteryData>({level: 0, points: 0, currentLevel: 0, nextLevel: 1, image: "", color: "#000000"});
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [rewardCount, setRewardCount] = useState<number>(0);
    const [accessories, setAccessories] = useState<Accessory[]>([]);

    const navigate = useNavigate();
    const toast = useToast();

    const claimAccessory = (accessory: string): void => {
        AuthRequest<string>("/accessory/claim", {
            data: {accessory: accessory},
            setState: (preview) => {
                // Update accessory list so the user cannot click claim again if the claim was successful
                loadAccessories();
            },
            fallback: (error) => {
                const e = error as AxiosError;
                if (e.response !== undefined){
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
            }
        });
    }

    const loadAccessories = useCallback(() => {
        AuthRequest<Accessory[]>("/accessory/all", {setState: setAccessories}, false);
    }, []);

    useEffect(() => {
        AuthRequest<MasteryData>("/accessory/mastery", {setState: (data) => {
            setMastery(data);
            setLoggedIn(true);

            AuthRequest<Record<string, unknown>[]>("/report/all", {setState: (data1) => {
                // The type of this value does not matter, only the length is used
                setRewardCount(data1.length);
            }}, false);

            loadAccessories();
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
        }}, false);
    }, [toast, loadAccessories]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame</Text>
            </Box>
            <Box w={"100%"}>
                <Flex w={"100%"} flexDir={"column"} gap={5} alignItems={"center"}>
                    <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} gap={1}>
                        <Link minW={["50%", "15em"]} href={`${api}/bullgame`}>
                            <Button w={"100%"} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"}>Play Game</Button>
                        </Link>
                        <Button minW={["50%", "15em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={loggedIn ? () => navigate("/bullgame/rewards") : () => navigate("/login")}>{`Claim Rewards ${rewardCount > 0 ? `(${rewardCount})` : ""}`}</Button>
                        <Button minW={["50%", "15em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/leaderboard")}>Leaderboard</Button>
                        <Link minW={["50%", "15em"]} href={`${api}/bullgame`}>
                            <Button w={"100%"} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"}>How to Play</Button>
                        </Link>
                    </Flex>
                    {loggedIn === true ?
                        <>
                        <MasteryDisplay data={mastery}/>
                        <Text fontSize={"3xl"} className={"heading-3xl"} mt={10}>Accessories</Text>
                        <Box w={["90vw", "90vw", "90vw", "80vw"]} maxW={"100em"} mb={"2em"} borderRadius={"lg"} bgColor={"gray.800"} padding={3}>
                            <SimpleGrid w={"100%"} columns={[1, 1, 2, 2, 2, 3]} spacing={3}>
                            {accessories.map((value) => (
                                <Flex key={value.name} bgColor={(value.unlocked || value.badge.collected >= value.badge.required) ? "#a248ff" : "#512480"} flexDir={"column"} alignItems={"center"} borderRadius={"lg"}>
                                    <Flex w={"100%"} px={"1em"} flexDir={["column", "row"]} alignItems={"center"}>
                                        <Flex flex={1} maxW={["50%", "100%"]} py={"0.5em"}>
                                            <Image filter={(value.unlocked || value.badge.collected >= value.badge.required) ? "drop-shadow(0 0 0.5em #ffffffc0);" : ""} src={`${cdn}/image/${value.image}`}/>
                                        </Flex>
                                        <Flex flex={3} flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
                                            <Text fontSize={["md", "lg", "lg", "xl"]} className={"heading-xl"} mb={1}>{value.displayName}</Text>
                                            {value.unlocked === false ?
                                                (value.badge.collected >= value.badge.required ?
                                                    <Flex h={"2em"} alignItems={"center"}>
                                                        <Button maxH={"100%"} bgColor={"#ffc000"} _hover={{bgColor: "#ffe045"}} _active={{bgColor: "#fff"}} color={"#000"} onClick={() => {claimAccessory(value.name);}}>Claim</Button>
                                                    </Flex>
                                                    :
                                                    <Flex w={"60%"} minW={["100%", "10em"]} maxW={"15em"}>
                                                        <Flex alignItems={"center"} w={"90.9090909090909090%" /* This width is 1 / (1 + margin left of the bar) so the text above is aligned with the bar and not the bar + image */} pos={"relative"}>
                                                            <Flex w={"20%"}>
                                                                <Image src={`${cdn}/image/resources/resource_badge.webp`} objectFit={"contain"} zIndex={69}/>
                                                            </Flex>
                                                            <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={"1.5em"}>
                                                                <Flex pos={"absolute"} w={"90%"} h={"100%"} ml={"10%"} bgColor={"#000"}>
                                                                    <Flex pos={"absolute"} w={value.badge.required > 0 ? `${value.badge.collected / value.badge.required * 100}%` : "0"} h={"100%"} bgColor={"#ffc000"}/>
                                                                </Flex>
                                                            </Flex>
                                                            <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={"1.5em"} pl={"10%"}>
                                                                <Text pos={"absolute"} maxW={"100%"} textAlign={"center"} className={"heading-xl"} lineHeight={1} fontSize={["sm", "md", "md", "lg"]} zIndex={70}>{`${value.badge.collected} / ${value.badge.required}`}</Text>
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                )
                                                :
                                                <Flex h={"2em"} alignItems={"center"}>
                                                    <Text maxH={"100%"} fontSize={"lg"} className={"heading-lg"} color={"#ffc000"}>Unlocked</Text>
                                                </Flex>
                                            }
                                        </Flex>
                                    </Flex>
                                    <Divider my={1} borderBottomWidth={2} borderColor={"#ffff"}/>
                                    <Box>
                                        <Text textAlign={"center"} fontSize={["sm", "sm", "sm", "md"]} className={"heading-md"}>{value.badge.unlockMethod}</Text>
                                    </Box>
                                </Flex>
                            ))}
                            </SimpleGrid>
                        </Box>
                        </>
                        :
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} className={"heading-lg"} gap={"0.5em"}>
                            <Text>You are currently not logged in.</Text>
                            <Text>You can still play the game but you need to be logged in to earn rewards from playing.</Text>
                            <Link color={"blue.300"} href={"/login"}>Click here to login</Link>
                        </Flex>
                    }
                </Flex>
            </Box>
        </Flex>
    );
}
