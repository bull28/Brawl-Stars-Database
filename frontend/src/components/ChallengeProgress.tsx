import {Flex, Text, Divider, Image} from "@chakra-ui/react";
import {ChallengeWins} from "../types/ChallengeData";
import EventTime from "../helpers/EventTime";
import {RainbowBorder} from "../themes/animations";

interface DailyRewardDisplayProps{
    username: string;
    avatar: string;
    avatarColor: string;
    data: ChallengeWins;
}

export default function ChallengeProgress({username, avatar, avatarColor, data}: DailyRewardDisplayProps){
    return (
        <Flex justifyContent={"space-around"} bgColor={"green.800"} borderRadius={"lg"} p={2} wrap={"wrap"}>
            <Flex flexDir={"column"} mx={3} alignItems={"center"}>
                <Flex w={"5vw"} justifyContent={"center"} alignItems={"center"} borderRadius={"50%"} animation={(avatarColor === "rainbow") ? `${RainbowBorder()} 12s infinite` : undefined} border={(avatarColor !== "rainbow") ? `3px solid ${avatarColor}` : undefined}>
                    <Image objectFit={"contain"} src={`/image/${avatar}`} borderRadius={"50%"}/>
                </Flex>
                <Text fontSize={"xl"} className={"heading-xl"}>{username}</Text>
            </Flex>
            <Flex w={"12vw"} flexDir={"column"} mx={3} alignItems={"center"} justifyContent={"center"} bgColor={"blue.500"} borderRadius={"lg"} p={1}>
                    <Text fontSize={"lg"} className={"heading-lg"}>Challenge Wins</Text>
                    <Text fontSize={"lg"} className={"heading-lg"}>{data.totalWins}</Text>
                    <Divider my={1}/>
                    {EventTime(data.nextDailyBonus, 0) === "0s" ?
                        <>
                            <Text fontSize={"lg"} className={"heading-lg"}>Next Daily Bonus</Text>
                            <Text fontSize={"lg"} className={"heading-lg"}>Ready</Text>
                        </>
                        :
                        <>
                            <Text fontSize={"lg"} className={"heading-lg"}>Next Daily Bonus</Text>
                            <Text fontSize={"lg"} className={"heading-lg"}>{EventTime(data.nextDailyBonus, 0)}</Text>
                        </>
                    }
            </Flex>
        </Flex>
    );
}
