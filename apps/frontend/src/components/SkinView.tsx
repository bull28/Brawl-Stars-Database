import axios, {AxiosResponse} from "axios";
import {useEffect, useState} from "react";
import {Flex, Image, Text, Tooltip, useDisclosure, Icon} from "@chakra-ui/react";
import {RepeatIcon} from "@chakra-ui/icons";
import SkinDetails, {currencyImages, getCostText} from "./SkinDetails";
import {SkinData} from "../types/BrawlerData";
import cdn from "../helpers/CDNRoute";
import api from "../helpers/APIRoute";

interface SkinViewProps{
    brawler: string;
    skin: string;
}

function getGroupBackground(groups: SkinData["groups"]): string{
    // The skin group background shown is the first one in the array that is not default.
    // The default background is only shown if all backgrounds in the array are the default.
    if (groups.length === 0){
        return "";
    }
    for (let x = 0; x < groups.length; x++){
        if (!groups[x].image.includes("default") || x >= groups.length - 1){
            return groups[x].image;
        }
    }
    return groups[groups.length - 1].image;
}

export default function SkinView({brawler, skin}: SkinViewProps){
    const [data, setData] = useState<SkinData | undefined>(undefined);
    const {isOpen, onOpen, onClose} = useDisclosure();
    
    useEffect(() => {
        axios.get<{}, AxiosResponse<SkinData>>(`${api}/skin/${brawler}/${skin}`)
        .then((res) => {
            setData(res.data);
        })
        .catch(() => {});
    }, [brawler, skin]);

    return (
    <>
    {data &&
        <Flex flexDir={"column"} h={"100%"}>
            <Flex h={"90%"} p={[0, 1]} bgImage={`${cdn}/image/${getGroupBackground(data.groups)}`} borderRadius={"lg"} onClick={onOpen} border={data.limited ? "4px solid #ffd700" : "none"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} justifyContent={"center"}>
                <Image objectFit={"contain"} src={`${cdn}/image/${data.image}`} alt={data.displayName}/>
            </Flex>
            <Flex flexDir={"column"} alignItems={"center"}>
                <Flex alignItems={"center"} mt={3} mb={1} gap={1}>
                    {data.groups.filter((group) => !group.icon.includes("default")).map((group) => (
                        <Tooltip key={group.name} label={group.name}>
                            <Image src={`${cdn}/image/${group.icon}`} w={7} mr={2}/>
                        </Tooltip>
                    ))}
                    <Text fontSize={["md", "lg", "xl"]} className={"heading-lg"} textAlign={"center"} onClick={onOpen} cursor={"pointer"}>{data.displayName}</Text>    
                    {data.model.geometry.exists && <Icon as={RepeatIcon} ml={[1, 1, 3]} cursor={"pointer"} fontSize={"xl"}/>}
                </Flex>
                
                <Flex mb={1} wrap={"wrap"}>
                    <Flex alignItems={"center"} mx={[1, 1, 3]}>
                        <Text fontSize={["lg", "xl"]} className={"heading-xl"} mr={1}>{getCostText(data)}</Text>
                        {currencyImages.hasOwnProperty(data.currency) === true ? <Image src={`${cdn}/image/resources/currency/${currencyImages[data.currency]}`} alt={data.currency} h={[4, 5, 6]}/> : <></>}
                    </Flex>
                    {(data.costBling > 0) &&
                        <Flex alignItems={"center"} mx={[1, 1, 3]}>
                            <Text fontSize={["lg", "xl"]} className={"heading-xl"} mr={1}>{data.costBling}</Text>
                            {currencyImages.hasOwnProperty("Bling") === true ? <Image src={`${cdn}/image/resources/currency/${currencyImages["Bling"]}`} alt={"Bling"} h={[4, 5, 6]}/> : <></>}
                        </Flex>
                    }
                </Flex>
                <Text fontSize={["sm", "md"]} className={"heading-md"}>{data.requires !== "" ? `Requires ${data.requires}` : "\u00a0"}</Text>
            </Flex>
            <SkinDetails data={data} isOpen={isOpen} onClose={onClose}/>
        </Flex>
    }
    </>
    );
}
