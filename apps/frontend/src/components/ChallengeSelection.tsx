import {Flex, Text, Image, Button, SimpleGrid, Divider} from "@chakra-ui/react";
import {ChallengeName, ChallengeData} from "../types/ChallengeData";
import {displayLong} from "../helpers/LargeNumberDisplay";
import {animateScroll} from "react-scroll";
import cdn from "../helpers/CDNRoute";

interface ChallengeSelectionProps{
    data: ChallengeData;
    level: number;
    setSelected: (challenge: ChallengeName) => void;
}

export default function ChallengeSelection({data, level, setSelected}: ChallengeSelectionProps){
    return (
        <Flex flexDir={"column"} bgColor={"gray.800"} alignItems={"center"} border={"3px solid #000"} borderRadius={"lg"}>
            <Text fontSize={"2xl"} className={"heading-2xl"}>Create Challenge</Text>
            <Divider/>
            <Flex flexDir={"column"} w={"75vw"} h={"50vh"} p={2}>
                <Flex h={"100%"} wrap={"wrap"}>
                    <Flex w={"100%"} h={"100%"} flexDir={"column"} alignItems={"center"}>
                        {data.length > 0 ?
                        <SimpleGrid w={"100%"} h={"100%"} columns={[1, 1, 2, 2, 3]} spacing={2} overflow={"auto"} alignItems={"flex-start"} sx={{
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
                        }}>{data.map((value) => {
                            return (
                                <Flex key={value.challengeid} bgColor={"blue.800"} flexDir={"column"} p={2} borderRadius={"lg"} border={"2px solid #000"}>
                                    <Text fontSize={"xl"} className={"heading-xl"}>{value.displayName.length > 0 ? value.displayName : " "}</Text>
                                    <Divider my={1}/>
                                    <Flex justifyContent={"center"}>
                                        <Text className={"heading-md"}>{value.players === 1 ? "1 Player" : `${value.players} Players`}</Text>
                                    </Flex>
                                    <Divider my={1} border={"0px solid #0000"}/>
                                    <Flex w={"100%"} wrap={"wrap"}>
                                        <Flex w={"50%"} flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
                                            <Flex alignItems={"center"}>
                                                <Text fontSize={"lg"} className={"heading-lg"} mr={1}>{displayLong(value.reward.coins)}</Text>
                                                <Image src={`${cdn}/image/resources/resource_coins.webp`} h={5}/>
                                            </Flex>
                                            <Flex alignItems={"center"}>
                                                <Text fontSize={"lg"} className={"heading-lg"} mr={1}>{displayLong(value.reward.points)}</Text>
                                                <Image src={`${cdn}/image/resources/resource_challenge_points.webp`} h={5}/>
                                            </Flex>
                                        </Flex>
                                        {(value.reward.accessory.displayName !== "") ?
                                            <Flex w={"50%"} flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
                                                <Text fontSize={"lg"} className={"heading-lg"}>New Accessory</Text>
                                                <Flex alignItems={"center"}>
                                                    <Text fontSize={value.reward.accessory.displayName.length < 20 ? "lg" : "md"} className={value.reward.accessory.displayName.length < 20 ? "heading-lg" : "heading-md"} mr={1}>{value.reward.accessory.displayName}</Text>
                                                    <Image src={`${cdn}/image/${value.reward.accessory.image}`} objectFit={"contain"} h={6}/>
                                                </Flex>
                                            </Flex>
                                            :
                                            (value.players > 1 && !69 ?
                                                <Flex w={"50%"} flexDir={"column"} alignItems={"center"} justifyContent={"center"}>
                                                    <Text className={"heading-md"}>Rewards depend on</Text>
                                                    <Text className={"heading-md"}>opponents' strengths</Text>
                                                </Flex>
                                                :
                                                <></>
                                            )
                                        }
                                    </Flex>
                                    <Divider my={1}/>
                                    <Flex w={"100%"} alignItems={"flex-end"}>
                                        <Text w={"80%"} className={"heading-md"}>{`Requires Level ${value.requiredLevel}`}</Text>
                                        <Button w={"20%"} isDisabled={level < value.requiredLevel} onClick={() => {setSelected({challengeid: value.challengeid, displayName: value.displayName, acceptCost: value.acceptCost}); animateScroll.scrollToTop();}}>
                                            <Text fontSize={"lg"}>{value.acceptCost}</Text>
                                            <Image ml={1} src={`${cdn}/image/resources/resource_tokens.webp`} h={5}/>
                                        </Button>
                                    </Flex>
                                </Flex>
                            );
                        })}
                        </SimpleGrid>
                        :
                        <Text fontSize={"xl"} className={"heading-xl"}>No Rooms currently available to join</Text>
                        }
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
