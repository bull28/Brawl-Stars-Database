import axios, {AxiosResponse} from "axios";
import {useEffect, useState} from "react";
import {
    Flex, Image, Text, Modal, Tooltip,
    ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Divider, ModalOverlay, Icon
} from "@chakra-ui/react";
import {RepeatIcon} from "@chakra-ui/icons";
import {SkinData} from "../types/BrawlerData";
import cdn from "../helpers/CDNRoute";
import api from "../helpers/APIRoute";

interface SkinViewProps{
    brawler: string;
    skin: string;
}

const currencyImages: Record<string, string> = {
    Gems: "icon_gems.webp",
    Coins: "icon_coins.webp",
    ClubCoins: "icon_clubcoins.webp",
    Bling: "icon_bling.webp"
};

function getCostText(skin: SkinData): string{
    if (skin.cost > 0){
        return skin.cost.toString();
    }
    if (skin.name.includes("default") === true){
        return "Default";
    }
    return "Free";
}

function getReleaseDate(release: SkinData["release"]): string{
    const date = new Date(release.year, release.month - 1);
    const text = Date.now() > date.getTime() ? "Released" : "Expected to release";
    return `${text} ${date.toLocaleString("default", {month: "long"})} ${release.year}`;
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
        .catch((error) => {});
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
                        {currencyImages.hasOwnProperty(data.currency) === true ? <Image src={`${cdn}/image/resources/${currencyImages[data.currency]}`} alt={data.currency} h={[4, 5, 6]}/> : <></>}
                    </Flex>
                    {(data.costBling > 0) &&
                        <Flex alignItems={"center"} mx={[1, 1, 3]}>
                            <Text fontSize={["lg", "xl"]} className={"heading-xl"} mr={1}>{data.costBling}</Text>
                            {currencyImages.hasOwnProperty("Bling") === true ? <Image src={`${cdn}/image/resources/${currencyImages["Bling"]}`} alt={"Bling"} h={[4, 5, 6]}/> : <></>}
                        </Flex>
                    }
                </Flex>
                <Text fontSize={["sm", "md"]} className={"heading-md"}>{data.requires !== "" ? `Requires ${data.requires}` : "\u00a0"}</Text>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent p={[1, 3]}>
                    <ModalHeader fontWeight={"normal"} fontSize={"2xl"} className={"heading-2xl"} color={"#fff"}>{data.displayName}</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody className={"heading-xl"} color={"#fff"}>
                        <Flex flexDir={"column"}>
                            {data.groups.map((group) => (
                            <Flex key={group.name} alignItems={"center"}>
                                {!group.icon.includes("default") && <Image src={`${cdn}/image/${group.icon}`} w={7} mr={2}/>}
                                <Text fontSize={"lg"}>{group.name}</Text>
                            </Flex>
                            ))}
                        </Flex>
                        <Flex wrap={"wrap"} gap={"0.375em"} mt={2}>
                            <Text fontSize={"xl"}>Cost:</Text>
                            <Flex alignItems={"center"}>
                                <Text fontSize={"xl"} mr={1}>{getCostText(data)}</Text>
                                {currencyImages.hasOwnProperty(data.currency) === true ? <Image src={`${cdn}/image/resources/${currencyImages[data.currency]}`} alt={data.currency} h={6}/> : <></>}
                            </Flex>
                            {(data.costBling > 0) &&
                            <>
                            <Text fontSize={"xl"}>or</Text>
                            <Flex alignItems={"center"}>
                                <Text fontSize={"xl"} mr={1}>{data.costBling}</Text>
                                {currencyImages.hasOwnProperty("Bling") === true ? <Image src={`${cdn}/image/resources/${currencyImages["Bling"]}`} alt={"Bling"} h={6}/> : <></>}
                            </Flex>
                            </>
                            }
                        </Flex>
                        {data.requires && <Text>{`Requires ${data.requires}`}</Text>}
                        <Divider my={2}/>
                        {data.release.month >= 1 && data.release.year > 0 && <Text fontSize={"lg"}>{getReleaseDate(data.release)}</Text>}
                        {data.limited && <Text fontSize={"lg"} color={"#ffd700"}>This skin is limited</Text>}
                        {data.unlock !== "" && <Text mt={2}>{data.unlock}</Text>}
                        {(data.features.length > 0) &&
                        <>
                            <Divider my={2}/>
                            <Text fontSize={"lg"} mb={1}>Custom Features</Text>
                            {data.features.map((feature) => (
                                <Text ml={1} key={feature}>&#x2022; {feature}</Text>
                            ))}
                        </>
                        }
                    </ModalBody>
                    <ModalFooter/>
                </ModalContent>
            </Modal>
        </Flex>
    }
    </>
    );
}
