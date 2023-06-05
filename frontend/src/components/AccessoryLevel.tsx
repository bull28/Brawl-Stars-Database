import {Flex, Image, Text} from "@chakra-ui/react";
import MovingText from "./MovingText";
import {displayLong} from "../helpers/LargeNumberDisplay";

export default function AccessoryLevel({level, points, upgradePoints}: {level: number; points: number; upgradePoints: number;}){
    return (
        <Flex bgColor={"blue.800"} w={"100%"} flexDir={"column"} alignItems={"center"} p={2}>
            {(upgradePoints < 0 && level > 1) ? <MovingText title={`Level ${level}`} color1="#fdf542" color2="#ff9005" fontSize={"xl"}/> : <Text className={"heading-2xl"} fontSize={"2xl"}>{`Level ${level}`}</Text>}
            <Flex alignItems={"center"} w={"90%"} mx={3} mb={2}>
                <Image w={"15%"} src={`/image/resources/resource_challenge_points_200x.webp`} zIndex={69}/>
                <Flex w={"100%"} h={"4vh"} bgColor={"#000"} transform={"translate(-3%, 0)"}>
                    <Flex w={upgradePoints > 0 ? `${Math.max(0, Math.min(1, points / upgradePoints)) * 100}%` : "100%"} h={"100%"} bgColor={"#8000f0"}/>
                    <Flex pos={"absolute"} w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"center"}>
                        <Text className={"heading-xl"} fontSize={"xl"} pos={"absolute"}>{upgradePoints > 0 ? `${displayLong(points)} / ${displayLong(upgradePoints)}` : `${displayLong(points)}`}</Text>
                    </Flex>
                </Flex>
            </Flex>
            <Text className={"heading-md"} fontSize={"md"}>{upgradePoints <= 0 ? "You have reached the maximum Accessory Level." : "Collect Challenge Points to increase your Accessory Level."}</Text>
        </Flex>
    );
}
