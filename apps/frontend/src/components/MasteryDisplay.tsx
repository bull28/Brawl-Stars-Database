import {Flex, Image, Text} from "@chakra-ui/react";
import MovingText from "./MovingText";
import {displayShort, displayLong} from "../helpers/LargeNumberDisplay";
import {MasteryData} from "../types/AccountData";
import cdn from "../helpers/CDNRoute";

export default function MasteryDisplay({data: {level, points, current, next}}: {data: MasteryData;}){
    const {points: currentLevel, image: currentImage, color: currentColor} = current;
    const {points: nextLevel, image: nextImage, color: nextColor} = next;
    return (
        <Flex bgColor={"blue.800"} w={["90vw", "90vw", "32em"]} maxW={"32em"} flexDir={"column"} alignItems={"center"} p={"0.5em"} border={(nextLevel < 0 && level > 1) ? "0.25em solid #d852ff" : "0.25em solid #000"}>
            {(nextLevel < 0 && level > 1) ?
                <MovingText title={"Bullgame Mastery"} color1={"#ff6dea"} color2={"#fa00d6"} fontSize={"2xl"}/>
                :
                <Text fontSize={"2xl"} className={"heading-2xl"}>Bullgame Mastery</Text>
            }
            <Flex alignItems={"center"}>
                <Image src={`${cdn}/image/resources/currency/resource_challenge_points_200px.webp`} h={"1.5em"}/>
                <Flex ml={"0.25em"} mr={"0.25em"}>
                    {(nextLevel < 0 && level > 1) ?
                        <MovingText title={`Level ${level}`} color1={"#ff6dea"} color2={"#fa00d6"} fontSize={"lg"}/>
                        :
                        <Text fontSize={"lg"} className={"heading-lg"}>{`Level ${level}`}</Text>
                    }
                </Flex>
            </Flex>
            <Flex w={"100%"} my={2} flexDir={["column", "column", "row"]} alignItems={"center"} justifyContent={"center"}>
                {/* <Flex flex={1} maxW={["12em", "12em", "40%"]} flexDir={"column"} alignItems={"center"} cursor={"pointer"}>
                    <Image src={`${cdn}/image/resources/resource_challenge_points_200x.webp`} w={"30%"}/>
                </Flex> */}
                <Flex flex={2} maxW={"25em"} w={["100%", "100%", "fit-content"]} mb={"1em"} bgColor={"#0f00"} justifyContent={"center"}>
                    <Flex alignItems={"center"} w={"90%"} pos={"relative"}>
                        <Flex w={"100%"} justifyContent={"space-between"} zIndex={69}>
                            <Flex w={"20%"} flexDir={"column"} alignItems={"center"} pos={"relative"}>
                                <Image objectFit={"contain"} src={`${cdn}/image/${currentImage}`}/>
                                <Flex w={"100%"} h={"100%"} pos={"absolute"} alignItems={"center"} justifyContent={"center"}>
                                    {level > 0 && <Text fontSize={["lg", "2xl"]} className={"heading-2xl"} lineHeight={1} mb={"0.125em"} color={currentColor}>{level}</Text>}
                                </Flex>
                                <Text fontSize={["sm", "md"]} className={"heading-md"} pos={"absolute"} bottom={"-0.75em"} lineHeight={1} color={"#fff"}>{displayShort(currentLevel)}</Text>
                            </Flex>
                            {nextLevel > 0 && <Flex w={"20%"} flexDir={"column"} alignItems={"center"} pos={"relative"}>
                                <Image objectFit={"contain"} src={`${cdn}/image/${nextImage}`}/>
                                <Flex w={"100%"} h={"100%"} pos={"absolute"} alignItems={"center"} justifyContent={"center"}>
                                    <Text fontSize={["lg", "2xl"]} className={"heading-2xl"} lineHeight={1} mb={"0.125em"} color={nextColor}>{level + 1}</Text>
                                </Flex>
                                <Text fontSize={["sm", "md"]} className={"heading-md"} pos={"absolute"} bottom={"-0.75em"} lineHeight={1} color={"#fff"}>{displayShort(nextLevel)}</Text>
                            </Flex>}
                        </Flex>
                        <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["2em", "2.5em"]}>
                            <Flex pos={"absolute"} w={"80%"} h={"100%"} bgColor={"#000"}>
                                <Flex pos={"absolute"} w={(nextLevel > 0 && nextLevel > currentLevel) ? `${Math.max(0, Math.min(1, (points - currentLevel) / (nextLevel - currentLevel))) * 100}%` : "100%"} h={"100%"} bgColor={"#8000f0"}/>
                            </Flex>
                        </Flex>
                        <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["2em", "2.5em"]}>
                            <Text pos={"absolute"} maxW={"70%"} textAlign={"center"} className={"heading-xl"} lineHeight={1} fontSize={["lg", "xl"]} zIndex={70}>{displayLong(points)}</Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
            <Text className={"heading-md"} fontSize={["xs", "md"]}>{nextLevel <= 0 ? "You have reached the highest Mastery level." : "Collect Mastery Points to reach the next level."}</Text>
        </Flex>
    );
}
