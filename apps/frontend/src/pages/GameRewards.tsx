import {useEffect, useState, useCallback} from "react";
import AuthRequest from "../helpers/AuthRequest";
import {
    Flex, Text, Image, Button, SimpleGrid,
    Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton, ModalFooter, Divider, useDisclosure, useToast
} from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";
import cdn from "../helpers/CDNRoute";
import EventTime from "../helpers/EventTime";
import {BrawlBoxContentsData, BrawlBoxBadgesData} from "../types/BrawlBoxData";
import BrawlBoxContents from "../components/BrawlBoxContents";

interface Reward{
    reportid: number;
    endTime: number;
    cost: number;
    stats: {
        score: number;
        enemies: number;
        win: boolean;
        difficulty: string;
        brawler: {
            displayName: string;
            image: string;
        };
        starPower: {
            displayName: string;
            image: string;
        };
        gears: {
            displayName: string;
            image: string;
        }[];
    };
}
interface ClaimResult{
    resources: BrawlBoxContentsData[];
    badges: BrawlBoxBadgesData[];
}

export default function GameRewards(){
    const [data, setData] = useState<Reward[]>([]);
    const [currentReward, setCurrentReward] = useState<Reward | undefined>();
    const [boxContents, setBoxContents] = useState<ClaimResult | undefined>();

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
        const currentTime = Date.now();
        AuthRequest<Reward[]>("/report/all", {setState: (data) => {
            data = data.reverse();
            for (let x = 0; x < data.length; x++){
                data[x].endTime = Math.floor((currentTime - data[x].endTime) / 1000);
            }
            setData(data);
        }});
    }, []);

    useEffect(() => {
        loadRewards();
    }, [loadRewards]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <Flex justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame Rewards</Text>
            </Flex>
            {data.length > 0 ?
            <SimpleGrid w={"80vw"} bgColor={"#aaaaaa45"} columns={[1, 1, 2, 2, 3]} spacing={2} overflow={"auto"} alignItems={"flex-start"} p={2} sx={{
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

                if (value.endTime > 86400){
                    timeString = `${Math.floor(value.endTime / 86400)}d ${EventTime({season: 0, hour: 0, minute: 0, second: value.endTime % 86400, hoursPerSeason: 384, maxSeasons: 7}, 0)} ago`;
                } else if (value.endTime > 0){
                    timeString = `${EventTime({season: 0, hour: 0, minute: 0, second: value.endTime, hoursPerSeason: 384, maxSeasons: 7}, 0)} ago`;
                }
                return (
                    <Flex key={value.reportid} flexDir={"column"} bgColor={"blue.800"} p={2} borderRadius={"lg"} border={"2px solid #000"}>
                        <Flex justifyContent={"space-between"} w={"100%"}>
                            <Text fontSize={"lg"}>{`${value.stats.difficulty} ${value.stats.win ? "Win" : "Loss"}`}</Text>
                            <Text>{timeString}</Text>
                        </Flex>
                        <Flex w={"100%"} alignItems={"flex-end"}>
                            <Text w={"80%"} className={"heading-md"}>{`Bull`}</Text>
                            <Button w={"20%"} onClick={() => {setCurrentReward(value); onOpen();}}>Claim</Button>
                        </Flex>
                    </Flex>
                );
            })}
            </SimpleGrid>
            :
            <Text>No rewards to claim</Text>
            }
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent p={3} border={`3px solid #fff`}>
                    <ModalHeader fontWeight={"normal"} fontSize={"3xl"} className={"heading-3xl"} textAlign={"center"}>Claim Reward</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        {currentReward !== undefined ?
                        <Flex flexDir={"column"} alignItems={"center"}>
                            <Text fontSize={"xl"} className={"heading-xl"}>{currentReward.stats.difficulty}</Text>
                            <Text fontSize={"xl"} className={"heading-xl"}>{`Score: ${currentReward.stats.score}`}</Text>
                            <Text fontSize={"xl"} className={"heading-xl"}>{`Enemies Defeated: ${currentReward.stats.enemies}`}</Text>
                            <Flex w={"100%"} mt={5}>
                                <Flex flex={1} flexDir={"column"} h={"fit-content"} p={2} alignItems={"center"}>
                                    <Text>Mastery Only</Text>
                                    <Button w={"100%"} onClick={() => {onClose(); claimReward(currentReward.reportid, false);}}>
                                        <Text fontSize={"xl"}>FREE</Text>
                                    </Button>
                                </Flex>
                                <Flex flex={1} flexDir={"column"} h={"fit-content"} p={2} alignItems={"center"}>
                                    <Text>All Rewards</Text>
                                    <Button w={"100%"} onClick={() => {onClose(); claimReward(currentReward.reportid, true);}}>
                                        <Flex fontSize={"xl"}>
                                            <Text>{currentReward.cost}</Text>
                                            <Image ml={1} src={`${cdn}/image/resources/resource_tokens.webp`} h={5}/>
                                        </Flex>
                                    </Button>
                                </Flex>
                            </Flex>
                        </Flex>
                        :
                        <Flex>No reward available</Flex>
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
                    <ModalFooter flexDir={["column", "row", "row", "row", "row"]}>                     
                        <Button onClick={() => {onClose2(); loadRewards();}}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
}
