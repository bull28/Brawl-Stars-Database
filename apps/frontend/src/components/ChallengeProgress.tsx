import {Flex, Text, Divider, Image} from "@chakra-ui/react";
import {ChallengeWins} from "../types/ChallengeData";
import EventTime from "../helpers/EventTime";
import {RainbowBorder} from "../themes/animations";
import cdn from "../helpers/CDNRoute";

interface DailyRewardDisplayProps{
    username: string;
    avatar: string;
    avatarColor: string;
    data: ChallengeWins;
}

export default function ChallengeProgress({username, avatar, avatarColor, data}: DailyRewardDisplayProps){
    return (
        <Flex bgColor={"blue.800"} borderRadius={"lg"} p={2} w={"60%"} flexDir={["column", "row"]}>
            <Flex flexDir={"column"} mx={[0, 3]} alignItems={"center"} justifyContent={"center"} w={["100%", "40%"]}>
                <Flex w={"50%"} justifyContent={"center"} alignItems={"center"} borderRadius={"50%"} animation={(avatarColor === "rainbow") ? `${RainbowBorder()} 12s infinite` : undefined} border={(avatarColor !== "rainbow") ? `3px solid ${avatarColor}` : undefined}>
                    <Image objectFit={"contain"} src={`${cdn}/image/${avatar}`} borderRadius={"50%"}/>
                </Flex>
                <Text maxW={"100%"} pos={"relative"} mt={1} fontSize={username.length < 15 ? ["sm", "lg"] : ["xs", "md"]} className={"heading-xl"}>{username}</Text>
            </Flex>
            <Flex w={["100%", "60%"]} flexDir={"column"} mx={[0, 3]} alignItems={"center"} justifyContent={"center"} bgColor={"#00c000"} borderRadius={"lg"} p={1}>
                <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>Challenge Wins</Text>
                <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>{data.totalWins}</Text>
                <Divider borderColor={"#000"} my={1}/>
                {EventTime(data.nextDailyBonus, 0) === "0s" ?
                    <>
                        <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>Next Daily Bonus</Text>
                        <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>Ready</Text>
                    </>
                    :
                    <>
                        <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>Next Daily Bonus</Text>
                        <Text fontSize={["sm", "md", "lg"]} className={"heading-lg"}>{EventTime(data.nextDailyBonus, 0)}</Text>
                    </>
                }
            </Flex>
        </Flex>
    );
}
