import {Flex, Text, Image, Button, SimpleGrid, Divider} from "@chakra-ui/react";
import {RoomDataDisplay, RoomName} from "../types/ChallengeData";
import api from "../helpers/APIRoute";

interface RoomSelectionProps{
    data: RoomDataDisplay;
    level: number;
    setSelected: (room: RoomName) => void;
}

export default function UnitSelection({data, level, setSelected}: RoomSelectionProps){
    return (
        <Flex flexDir={"column"} bgColor={"gray.800"} alignItems={"center"} border={"3px solid #000"} borderRadius={"lg"}>
            <Text fontSize={"2xl"} className={"heading-2xl"}>Join Challenge</Text>
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
                                <Flex key={value.username} bgColor={"blue.800"} flexDir={"column"} p={2} borderRadius={"lg"} border={"2px solid #000"}>
                                    <Text fontSize={"xl"} className={"heading-xl"}>{`${value.username}'s Room`}</Text>
                                    <Divider my={1}/>
                                    <Text fontSize={"lg"} className={"heading-lg"}>{value.displayName}</Text>
                                    <SimpleGrid columns={[1, 1, 1, 1, 2]} spacing={1}>{value.players.map((player) => {
                                        return (
                                            <Flex key={player.username + player.key.toString()} alignItems={"center"} wrap={"wrap"}>
                                                <Flex h={10} justifyContent={"center"} alignItems={"center"} borderRadius={"50%"} border={"2px solid #fff"}>
                                                    <Image h={"100%"} objectFit={"contain"} borderRadius={"50%"} src={player.avatar !== "" ? `${api}/image/${player.avatar}` : `${api}/image/avatars/free/default.webp`}/>
                                                </Flex>
                                                <Text fontSize={(player.username.length < 10 ? "16px" : `${Math.floor((160 + (player.username.length - 10) * 5) / player.username.length)}px`)} overflow={"hidden"} ml={2}>{player.username !== "" ? player.username : "Empty"}</Text>
                                            </Flex>
                                        );
                                    })}
                                    </SimpleGrid>
                                    <Divider my={1}/>
                                    <Flex w={"100%"} alignItems={"flex-end"}>
                                        <Text w={"80%"} className={"heading-md"}>{`Requires Level ${value.requiredLevel}`}</Text>
                                        <Button w={"20%"} isDisabled={level < value.requiredLevel} onClick={() => setSelected({username: value.username, acceptCost: value.acceptCost})}>
                                            <Text fontSize={"lg"}>{value.acceptCost}</Text>
                                            <Image ml={1} src={`${api}/image/resources/resource_tokens.webp`} h={5}/>
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
