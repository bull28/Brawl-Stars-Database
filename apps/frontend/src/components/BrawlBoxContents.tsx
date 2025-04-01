import {Flex, Text, Image, SimpleGrid} from "@chakra-ui/react";
import {keyframes} from "@emotion/react";
import CountUp from "react-countup";
import {displayLong} from "../helpers/LargeNumberDisplay";
import {BrawlBoxContentsData, BrawlBoxBadgesData} from "../types/BrawlBoxData";
import cdn from "../helpers/CDNRoute";

interface BrawlBoxContentsProps{
    boxContents: BrawlBoxContentsData[];
    badges?: BrawlBoxBadgesData[];
}

export default function BrawlBoxContents({boxContents, badges}: BrawlBoxContentsProps){
    const itemTransition = keyframes`
    from {transform: scale(0.3); visibility: visible;}
    to {transform: scale(1.0); visibility: visible;}
    `;
    const transitionTime = Math.min(0.5, Math.max(0.3, 0.66 - boxContents.length * 0.02));

    return (
        <>
        <Flex mt={5} w={"100%"} h={"100%"} justifyContent={"center"} alignItems={"center"} textAlign={"center"}>       
            <SimpleGrid columns={[1, 2, 3, 3, 4].map((value) => Math.min(value, boxContents.length))} spacing={[3, 4, 5, 5, 5]}>
                {boxContents.map((content, x) => (
                    <Flex key={content.rewardType + content.displayName + content.image + `${content.inventory}`} px={[3, 2, 5, 6, 6]} py={"20%"} w={["90vw", "40vw", "27vw", "27vw", "20vw"]} bgColor={content.backgroundColor} flexDir={"column"} justifyContent={"space-between"} alignItems={"center"} textAlign={"center"} borderRadius={"2xl"} border={"2px solid black"} boxShadow={"rgba(149, 157, 165, 0.2) 0px 8px 24px;"} visibility={"hidden"} animation={`${itemTransition} 0.5s ease-out ${(0.5 + x * transitionTime)}s 1 forwards`}>
                        <Text mb={2} fontSize={["2xl", "2xl", "2xl", "3xl", "3xl"]} className={"heading-2xl"}>{content.displayName}</Text>                                    
                        <Image borderRadius={"xl"} src={`${cdn}/image/${content.image}`} loading={"eager"} maxW={["75vw", "30vw", "20vw", "20vw", "20vw"]} py={3}/>
                        {content.amount > 1 && <Text fontSize={"2xl"} className={"heading-2xl"}>{`+${displayLong(content.amount)}`}</Text>}
                        <Text mx={0} className={"heading-xl"} fontSize={["lg", "md", "lg", "xl", "xl"]}>{content.description}</Text>
                        <Text mt={"20%"}  className={"heading-lg"} fontSize={"lg"}><CountUp prefix={"Inventory: "} end={content.inventory} duration={1.5}/></Text>
                    </Flex>
                ))}
            </SimpleGrid>
        </Flex>
        {badges !== undefined && badges.length > 0 &&
            <Flex flexDir={"column"} alignItems={"center"}>
                <Text fontSize={"2xl"} className={"heading-2xl"} transform={"scale(0)"} animation={`${itemTransition} 0s ${(0.5 + boxContents.length * transitionTime)}s 1 forwards`} mt={"6vh"} mb={"1.5vh"}>Accessory Progress</Text>
                <SimpleGrid columns={[1, 1, 2, 2, 3].map((value) => Math.min(value, badges.length))} spacing={3}>
                    {badges.map((value, x) => (
                        <Flex key={value.displayName + value.unlock} w={["90vw", "80vw", "45vw", "40vw", "30vw", "25vw"]} fontSize={["lg", "xl"]} bgColor={"gray.800"} borderRadius={"xl"} wrap={"wrap"} px={3} py={1} visibility={"hidden"} animation={`${itemTransition} 0.5s ease-out ${(0.5 + (boxContents.length + x / 2) * transitionTime)}s 1 forwards`}>
                            <Flex flex={"75%"} overflow={"hidden"} flexDir={"column"}>
                                <Text>{value.displayName}</Text>
                                <Text fontSize={["sm", "md"]} textIndent={"0"}>{value.unlock}</Text>
                            </Flex>
                            <Flex flex={"25%"} minW={"60px"} alignItems={"center"}>
                                <Image src={`${cdn}/image/resources/currency/resource_badge.webp`} h={[5, 7, 8]}/>
                                <Text overflowWrap={"anywhere"} lineHeight={1}>{`+${value.amount}`}</Text>
                            </Flex>
                        </Flex>
                    ))}
                </SimpleGrid>
            </Flex>
        }
        </>
    );
}
