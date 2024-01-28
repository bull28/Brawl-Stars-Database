import {Flex, Text, Image, SimpleGrid, keyframes} from "@chakra-ui/react";
import CountUp from "react-countup";
import {BrawlBoxContentsData} from "../types/BrawlBoxData";
import cdn from "../helpers/CDNRoute";

export default function BrawlBoxContents({boxContents}: {boxContents: BrawlBoxContentsData[];}){
    const itemTransition = keyframes`
    from {transform: scale(0.3);}
    to {transform: scale(1.0)}
    `;

    return (
        <Flex mt={5} w={"100%"} h={"100%"} justifyContent={"center"} alignItems={"center"} textAlign={"center"}>       
            <SimpleGrid columns={[1, 2, 3, 3, 4].map((value) => Math.min(value, boxContents.length))} spacing={[3, 4, 5, 5, 5]}>
                {boxContents.map((content, x) => (
                    <Flex key={content.rewardType + content.displayName + content.image + `${content.inventory}`} px={[3, 2, 5, 6, 6]} py={"20%"} w={["90vw", "40vw", "27vw", "27vw", "20vw"]} bgColor={content.backgroundColor} flexDir={"column"} justifyContent={"space-between"} alignItems={"center"} textAlign={"center"} borderRadius={"2xl"} border={"2px solid black"} boxShadow={"rgba(149, 157, 165, 0.2) 0px 8px 24px;"} transform={"scale(0)"} animation={`${itemTransition} 0.5s ease-out ${(0.5 + x * Math.min(0.5, Math.max(0.3, 0.66 - boxContents.length * 0.02)))}s 1 forwards`}>
                        <Text mb={2} fontSize={["2xl", "2xl", "2xl", "3xl", "3xl"]} className={"heading-2xl"}>{content.displayName}</Text>                                    
                        <Image borderRadius={"xl"} src={`${cdn}/image/${content.image}`} loading={"eager"} maxW={["75vw", "30vw", "20vw", "20vw", "20vw"]}/>
                        {content.amount > 1 && <Text fontSize={"2xl"} className={"heading-2xl"}>{`+${content.amount}`}</Text>}
                        <Text mx={0} className={"heading-xl"} fontSize={["lg", "md", "lg", "xl", "xl"]}>{content.description}</Text>
                        <Text mt={"20%"}  className={"heading-lg"} fontSize={"lg"}><CountUp prefix={"Inventory: "} end={content.inventory} duration={1.5}/></Text>
                    </Flex>
                ))}
            </SimpleGrid>
        </Flex>
    );
}
