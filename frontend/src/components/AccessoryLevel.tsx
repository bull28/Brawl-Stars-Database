import {Flex, Image, Text} from "@chakra-ui/react";
import MovingText from "./MovingText";
import {displayLong} from "../helpers/LargeNumberDisplay";

export default function AccessoryLevel({level, points, upgradePoints}: {level: number; points: number; upgradePoints: number;}){
    return (
        <Flex bgColor={"blue.800"} w={["90vw", "90vw", "600px", "600px"]} maxW={"600px"} flexDir={"column"} alignItems={"center"} p={2} border={(upgradePoints < 0 && level > 1) ? "3px solid #d852ff" : "3px solid #000"}>
            {(upgradePoints < 0 && level > 1) ? <MovingText title={`Level ${level}`} color1="#ff6dea" color2="#fa00d6" fontSize={"2xl"}/> : <Text className={"heading-2xl"} fontSize={"2xl"}>{`Level ${level}`}</Text>}
            <Flex alignItems={"center"} w={"90%"} mx={3} mb={2} pos={"relative"}>
                <Image w={"15%"} src={`/image/resources/resource_challenge_points_200x.webp`} zIndex={69}/>
                <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["25px", "35px", "40px", "40px", "40px"]}>
                    <Flex pos={"absolute"} w={"90%"} h={"100%"} ml={"10%"} bgColor={"#000"} transform={"translate(0%, 0)"}>
                        <Flex pos={"absolute"} w={upgradePoints > 0 ? `${Math.max(0, Math.min(1, points / upgradePoints)) * 100}%` : "100%"} h={"100%"} bgColor={"#8000f0"}/>
                    </Flex>
                </Flex>
                <Flex pos={"absolute"} w={"100%"} justifyContent={"center"} alignItems={"center"} h={["25px", "35px", "40px", "40px", "40px"]}>
                    <Text pos={"absolute"} maxW={"100%"} textAlign={"center"} className={"heading-xl"} fontSize={["sm", "xl", "xl", "xl", "xl"]} zIndex={70}>{upgradePoints > 0 ? `${displayLong(points)} / ${displayLong(upgradePoints)}` : `${displayLong(points)}`}</Text>
                </Flex>
            </Flex>
            <Text className={"heading-md"} fontSize={["xs", "md", "md", "md", "md"]}>{upgradePoints <= 0 ? "You have reached the maximum Accessory Level." : "Collect Challenge Points to increase your Accessory Level."}</Text>
        </Flex>
    );
}
