import {useState, useEffect, useCallback} from "react";
import {Flex, Box, Text, Image, Button, SimpleGrid, Link, Divider, useToast} from "@chakra-ui/react";
import {AxiosError} from "axios";
import AuthRequest from "../helpers/AuthRequest";
import MovingText from "../components/MovingText";
import {Accessory} from "../types/GameData";
import BackButton from "../components/BackButton";
import cdn from "../helpers/CDNRoute";

export default function GameMenu(){
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [unlockedCount, setUnlockedCount] = useState<number>(0);

    const toast = useToast();

    const loadAccessories = useCallback(() => {
        AuthRequest<Accessory[]>("/accessory/all", {
            setState: (data) => {
                setAccessories(data);
                setUnlockedCount(data.filter((value) => value.unlocked).length);
            },
            fallback: (error) => {
                setLoggedIn(false);
            }
        }, false);
    }, []);

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
    };

    useEffect(() => {
        loadAccessories();
    }, [loadAccessories]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Accessories</Text>
            </Box>
            {(unlockedCount >= accessories.length && accessories.length > 0) ?
                <MovingText title={`Unlocked: ${unlockedCount} / ${accessories.length}`} color1={"#fdf542"} color2={"#ff9005"} fontSize={"2xl"}/>
                :
                <Text  className={"heading-2xl"} fontSize={"2xl"}>{`Unlocked: ${unlockedCount} / ${accessories.length}`}</Text>
            }
            <Box w={"100%"}>
                <Flex w={"100%"} flexDir={"column"} gap={5} alignItems={"center"}>
                    {loggedIn === true ?
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
                                    <Flex w={"100%"} minH={"2.5em"} px={2} fontSize={["sm", "sm", "sm", "md"]} className={"heading-md"} lineHeight={1.2} justifyContent={"center"} alignItems={"center"}>
                                        <Text>{value.description}</Text>
                                    </Flex>
                                    <Divider my={1} borderBottomWidth={2} borderColor={"#ffff"}/>
                                    <Box w={"100%"} minH={"2.5em"} px={2} fontSize={["sm", "sm", "sm", "md"]} className={"heading-md"} lineHeight={1.2} textAlign={"center"}>
                                        <Text>Unlock Method:</Text>
                                        <Text>{`${value.badge.unlockMethod}`}</Text>
                                    </Box>
                                </Flex>
                            ))}
                            </SimpleGrid>
                        </Box>
                        :
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} className={"heading-lg"} gap={"0.5em"}>
                            <Text>You must be logged in to collect accessories.</Text>
                            <Link color={"blue.300"} href={"/login"}>Click here to login</Link>
                        </Flex>
                    }
                </Flex>
            </Box>
        </Flex>
    );
}
