import {Flex, Image, Text} from "@chakra-ui/react";
import MovingText from "./MovingText";
import {displayLong} from "../helpers/LargeNumberDisplay";
import {MasteryData} from "../types/AccountData";
import cdn from "../helpers/CDNRoute";

export default function MasteryDisplay({data: {level, points, current, next}}: {data: MasteryData;}){
    const {points: currentLevel, image, color} = current;
    const {points: nextLevel} = next;
    return (
        <Flex bgColor={"blue.800"} w={["90vw", "90vw", "37.5em"]} maxW={"37.5em"} flexDir={"column"} alignItems={"center"} p={"0.5em"} border={(nextLevel < 0 && level > 1) ? "0.25em solid #d852ff" : "0.25em solid #000"}>
            {(nextLevel < 0 && level > 1) ?
                <MovingText title={"Bullgame Mastery"} color1="#ff6dea" color2="#fa00d6" fontSize={"2xl"}/>
                :
                <Text fontSize={"2xl"} className={"heading-2xl"}>Bullgame Mastery</Text>
            }
            <Flex w={"100%"} my={3} flexDir={["column", "column", "row"]} alignItems={"center"}>
                <Flex flex={1} maxW={["12em", "12em", "40%"]} flexDir={"column"} alignItems={"center"} cursor={"pointer"}>
                    <Image src={`${cdn}/image/${image}`} w={"30%"}/>
                    <Text color={color} fontSize={"xl"} className={"heading-xl"}>{`Level ${level}`}</Text>
                </Flex>
                <Flex flex={2} w={["100%", "100%", "fit-content"]} bgColor={"#0f00"} justifyContent={"center"}>
                    <Flex alignItems={"center"} w={"90%"} pos={"relative"}>
                        <Image w={"15%"} src={`${cdn}/image/resources/resource_challenge_points_200x.webp`} zIndex={69}/>
                        <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["1.5em", "2em", "2.5em"]}>
                            <Flex pos={"absolute"} w={"90%"} h={"100%"} ml={"10%"} bgColor={"#000"}>
                                <Flex pos={"absolute"} w={(nextLevel > 0 && nextLevel > currentLevel) ? `${Math.max(0, Math.min(1, (points - currentLevel) / (nextLevel - currentLevel))) * 100}%` : "100%"} h={"100%"} bgColor={"#8000f0"}/>
                            </Flex>
                        </Flex>
                        <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["1.5em", "2em", "2.5em"]} pl={"10%" /* Remove padding to center the text on the entire display, not just the bar */}>
                            <Text pos={"absolute"} maxW={"100%"} textAlign={"center"} className={"heading-xl"} lineHeight={1} fontSize={["sm", "lg"]} zIndex={70}>{nextLevel > 0 ? `${displayLong(points)} / ${displayLong(nextLevel)}` : `${displayLong(points)}`}</Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
            <Text className={"heading-md"} fontSize={["xs", "md"]}>{nextLevel <= 0 ? "You have reached the highest Mastery level." : "Collect Mastery Points to reach the next level."}</Text>
        </Flex>
    );
}
