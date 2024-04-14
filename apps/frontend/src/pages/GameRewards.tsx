import {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import AuthRequest from "../helpers/AuthRequest";
import {
    Flex, Box, Text, Image, Button, SimpleGrid, IconButton,
    Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton, ModalFooter, Divider, useDisclosure, useToast
} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";
import SkullBackground from "../components/SkullBackground";
import EventTime from "../helpers/EventTime";
import {BrawlBoxContentsData, BrawlBoxBadgesData} from "../types/BrawlBoxData";
import BrawlBoxContents from "../components/BrawlBoxContents";
import {UserInfoProps} from "../types/AccountData";
import {Reward} from "../types/GameData";
import TokenDisplay from "../components/TokenDisplay";
import cdn from "../helpers/CDNRoute";

interface ClaimResult{
    resources: BrawlBoxContentsData[];
    badges: BrawlBoxBadgesData[];
}

export default function GameRewards(){
    const [data, setData] = useState<Reward[]>([]);
    const [reward, setReward] = useState<Reward | undefined>();
    const [boxContents, setBoxContents] = useState<ClaimResult | undefined>();
    
    const [resources, setResources] = useState<UserInfoProps | undefined>(undefined);
    const updateTokens = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setResources}, false);
    }, []);

    const navigate = useNavigate();
    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2} = useDisclosure();

    const claimReward = (reportid: number, claim: boolean): void => {
        AuthRequest<ClaimResult>("/report/claim", {
            data: {reportid: reportid, claim: claim},
            setState: (brawlbox) => {
                setBoxContents(brawlbox);
                onOpen2();
            },
            fallback: (error) => {
                toast({
                    description: "You don't have enough tokens to purchase this reward.",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
        });
    }

    const loadRewards = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setResources}, false);
        AuthRequest<Reward[]>("/report/all", {setState: (data) => {
            data = data.reverse();
            setData(data);
        }}, false);
    }, []);

    useEffect(() => {
        loadRewards();
    }, [loadRewards]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <IconButton pos={["relative", "absolute"]} top={["0", "2vh"]} left={["0", "2vh"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate("/bullgame")}} cursor={"pointer"}/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame Rewards</Text>
            </Box>
            <Flex w={"100%"} my={"3vh"} justifyContent={"space-around"} alignItems={"center"} wrap={"wrap"}>
                <Flex w={"40vw"} minW={"min(20em, 80vw)"} flexDir={"column"} bgColor={"#000000b6"} gap={"1vh"} fontSize={["md", "md", "lg"]} className={"heading-lg"} borderRadius={"lg"} p={5} my={2}>
                    <Text>Completing a game run and saving your score gives Bullgame mastery points. For each run, there are two additional rewards that can be purchased with tokens.</Text>
                    <Text>Brawl Box reward: Can contain pins, brawlers, bonus items, and accessories.</Text>
                    <Text>Accessory Progress reward: Collect progress towards unlocking accessories.</Text>
                    <Text>The score determines the number of mastery points rewarded. The difficulty played and the number of enemies defeated determines the quality and number of items in the Brawl Box reward.</Text>
                </Flex>
                {resources !== undefined ? <TokenDisplay callback={updateTokens} tokens={resources !== undefined ? resources.tokens : 0}/> : <></>}
            </Flex>
            <Box w={"80vw"} h={"50vh"} minH={"30em"} mb={"2em"} borderRadius={"lg"} bgColor={"gray.800"}>
                {data.length > 0 ?
                <SimpleGrid w={"100%"} h={"fit-content"} maxH={"100%"} columns={[1, 1, 2, 2, 3]} spacing={2} overflow={"auto"} alignItems={"flex-start"} p={2} sx={{
                    "&::-webkit-scrollbar": {
                    width: "8px",
                    borderRadius: "8px",
                    backgroundColor: `rgba(0, 0, 0, 0.2)`
                    },
                    "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "6px"
                    },
                    "&::-webkit-scrollbar-corner": {
                    backgroundColor: "rgba(0, 0, 0, 0)"
                    }
                }}>
                {data.map((value) => {
                    let timeString = "";
                    const endTime = Math.floor((Date.now() - value.endTime) / 1000);

                    if (endTime >= 86400){
                        timeString = `${Math.floor(endTime / 86400)}d ${EventTime({season: 0, hour: 0, minute: 0, second: Math.floor((endTime % 86400) / 3600) * 3600, hoursPerSeason: 384, maxSeasons: 7}, 0)} ago`.replace("0s", "");
                    } else if (endTime >= 3600){
                        timeString = `${EventTime({season: 0, hour: 0, minute: 0, second: Math.floor(endTime / 60) * 60, hoursPerSeason: 384, maxSeasons: 7}, 0)} ago`;
                    } else if (endTime > 0){
                        timeString = `${EventTime({season: 0, hour: 0, minute: 0, second: endTime, hoursPerSeason: 384, maxSeasons: 7}, 0)} ago`;
                    }
                    return (
                        <Box key={value.reportid} bgColor={"blue.800"} borderRadius={"lg"} border={"2px solid #000"}>
                            <Flex justifyContent={"space-between"} alignItems={"center"} w={"100%"} bgColor={value.stats.win ? "#0f0" : "#f00"} wrap={"wrap"} borderTopRadius={"md"} px={2} py={1}>
                                <Text fontSize={["md", "lg", "lg", "xl"]} className={"heading-xl"}>{`${value.title} ${value.stats.win ? "Win" : "Loss"}`}</Text>
                                <Text fontSize={["sm", "sm", "sm", "md"]} className={"heading-md"}>{timeString}</Text>
                            </Flex>
                            <Flex justifyContent={"space-between"} alignItems={["flex-start", "flex-end"]} flexDir={["column", "row"]} fontSize={["sm", "md", "md", "lg"]} p={2} pt={1}>
                                <Box>
                                    <Text>{`Score: ${value.stats.score}`}</Text>
                                    <Text>{`Enemies Defeated: ${value.stats.enemies}`}</Text>
                                    <Flex alignItems={"center"}>
                                        <Image h={8} mr={1} src={`${cdn}/image/${value.stats.brawler.image}`}/>
                                        <Text fontSize={["md", "lg", "lg", "xl"]}>{value.stats.brawler.displayName}</Text>
                                    </Flex>
                                    <Flex alignItems={"center"} wrap={"wrap"}>
                                        <Image h={8} mr={1} src={`${cdn}/image/${value.stats.starPower.image}`}/>
                                        {value.stats.gears.map((gear) => (
                                            <Image key={gear.displayName} h={8} mr={1} src={`${cdn}/image/${gear.image}`}/>
                                        ))}
                                    </Flex>
                                </Box>
                                <Button px={6} onClick={() => {setReward(value); onOpen();}}>Claim</Button>
                            </Flex>
                        </Box>
                    );
                })}
                </SimpleGrid>
                :
                <Text w={"100%"} textAlign={"center"} fontSize={["xl", "2xl"]} my={3}>No rewards to claim</Text>
                }
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent p={[0, 3]} border={`3px solid #fff`} color={"#fff"}>
                    <ModalHeader fontWeight={"normal"} fontSize={["2xl", "3xl"]} className={"heading-3xl"} textAlign={"center"} p={[1, 4]}>Claim Reward</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        {reward !== undefined ?
                        <Box fontSize={["md", "lg", "lg", "xl"]} className={"heading-xl"}>
                            <Text>{new Date(reward.endTime).toLocaleString()}</Text>
                            <Divider my={1}/>
                            <Text>{reward.stats.difficulty}</Text>
                            <Text>{`Score: ${reward.stats.score}`}</Text>
                            <Text>{`Enemies Defeated: ${reward.stats.enemies}`}</Text>
                            <Divider my={1}/>
                            <Flex w={"100%"} flexDir={["column", "row"]}>
                                <Box flex={1}>
                                    <Flex alignItems={"center"}>
                                        <Image h={8} mr={1} src={`${cdn}/image/${reward.stats.brawler.image}`}/>
                                        <Text>{reward.stats.brawler.displayName}</Text>
                                    </Flex>
                                    <Flex alignItems={"center"}>
                                        <Image h={8} mr={1} src={`${cdn}/image/${reward.stats.starPower.image}`}/>
                                        <Text>{reward.stats.starPower.displayName}</Text>
                                    </Flex>
                                </Box>
                                <Box flex={1}>
                                    {reward.stats.gears.map((gear) => (
                                        <Flex key={gear.displayName} alignItems={"center"}>
                                            <Image h={8} mr={1} src={`${cdn}/image/${gear.image}`}/>
                                            <Text>{gear.displayName}</Text>
                                        </Flex>
                                    ))}
                                </Box>
                            </Flex>
                            <Divider my={1}/>
                            <Flex flexDir={["column", "row"]} w={"100%"} mt={5} fontSize={"md"} className={"heading-md"}>
                                <Box flex={1} h={"fit-content"} p={[0, 2]}>
                                    <Text textAlign={"center"}>Mastery Only</Text>
                                    <Button w={"100%"} onClick={() => {onClose(); claimReward(reward.reportid, false);}}>
                                        <Text fontSize={"xl"} color={"#5f5"}>FREE</Text>
                                    </Button>
                                </Box>
                                <Box flex={1} h={"fit-content"} p={[0, 2]}>
                                    <Text textAlign={"center"}>All Rewards</Text>
                                    <Button w={"100%"} onClick={() => {onClose(); claimReward(reward.reportid, true);}}>
                                        <Flex fontSize={"xl"}>
                                            <Text color={resources !== undefined && resources.tokens >= reward.cost ? "#5f5" : "#f55"}>{reward.cost}</Text>
                                            <Image ml={1} src={`${cdn}/image/resources/resource_tokens.webp`} h={5}/>
                                        </Flex>
                                    </Button>
                                </Box>
                            </Flex>
                        </Box>
                        :
                        <Box>No reward available</Box>
                        }
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal size={"full"} isOpen={isOpen2} onClose={onClose2} scrollBehavior={"inside"}>
                <ModalContent>
                    <ModalBody p={[0, 3, 5, 5, 5]}>
                        {boxContents !== undefined &&
                            <BrawlBoxContents boxContents={boxContents.resources} badges={boxContents.badges.filter((value) => value.amount > 0)}/>
                        }
                    </ModalBody>
                    <ModalFooter flexDir={["column", "row"]}>                     
                        <Button onClick={() => {onClose2(); loadRewards();}}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}
