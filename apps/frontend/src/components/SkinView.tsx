import axios, {AxiosResponse} from "axios";
import {SetStateAction, useEffect, useState} from "react";
import {
    Flex, Image, Text, Modal, Tooltip,
    ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Divider, ModalOverlay, Icon
} from "@chakra-ui/react";
import {RepeatIcon} from "@chakra-ui/icons";
import {animateScroll as scroll} from "react-scroll";
import {ModelFiles} from "../types/BrawlerData";
import {SkinData} from "../types/BrawlerData";
import api from "../helpers/APIRoute";

interface SkinViewProps{
    brawler: string;
    skin: string;
    setModel: React.Dispatch<SetStateAction<ModelFiles>>;
}

const currencyImages: {[k: string]: string;} = {
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

export default function SkinView({brawler, skin, setModel}: SkinViewProps){
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
    {data !== void 0 ?
        <Flex flexDir={"column"} h={"100%"}>
            <Flex h={"90%"} p={[0, 1]} bgImage={`${api}/image/${data.group.image}`} borderRadius={"lg"} onClick={onOpen} border={data.limited ? "4px solid #ffd700" : "none"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"} justifyContent={"center"}>
                <Image objectFit={"contain"} src={`${api}/image/${data.image}`} alt={data.displayName}/>
            </Flex>
            <Flex flexDir={"column"} alignItems={"center"}>
                <Flex alignItems={"center"} mt={3} mb={1}>
                    {(data.group.icon !== "skingroups/icons/icon_default.webp") ?
                        <Tooltip label={data.group.name}>
                            <Image src={`${api}/image/${data.group.icon}`} w={7} mr={3}/>
                        </Tooltip>
                        :
                        <></>
                    }            
                    <Text fontSize={["md", "lg", "xl"]} className={"heading-lg"} textAlign={"center"}>{data.displayName}</Text>    
                    {(data.model.geometry.exists) ? <Icon as={RepeatIcon} ml={[1, 1, 3]} cursor={"pointer"} fontSize={"xl"} onClick={() => {let skinModel: ModelFiles = {geometry: data.model.geometry.path, winAnimation: undefined, loseAnimation: undefined}; if (data.model.winAnimation.exists){skinModel.winAnimation = data.model.winAnimation.path;} if (data.model.loseAnimation.exists){skinModel.loseAnimation = data.model.loseAnimation.path;} setModel(skinModel); scroll.scrollToTop();}}/> : <></>}
                </Flex>
                
                <Flex mb={1} wrap={"wrap"}>
                    <Flex alignItems={"center"} mx={[1, 1, 3]}>
                        <Text fontSize={["lg", "xl"]} className={"heading-xl"} mr={1}>{getCostText(data)}</Text>
                        {Object.hasOwn(currencyImages, data.currency) === true ? <Image src={`${api}/image/resources/${currencyImages[data.currency]}`} alt={data.currency} h={[4, 5, 6]}/> : <></>}
                    </Flex>
                    {(data.costBling > 0) ?
                        <Flex alignItems={"center"} mx={[1, 1, 3]}>
                            <Text fontSize={["lg", "xl"]} className={"heading-xl"} mr={1}>{data.costBling}</Text>
                            {Object.hasOwn(currencyImages, "Bling") === true ? <Image src={`${api}/image/resources/${currencyImages["Bling"]}`} alt={"Bling"} h={[4, 5, 6]}/> : <></>}
                        </Flex>
                        :
                        <></>
                    }
                </Flex>
                {(data.requires !== "") ?
                    <Text fontSize={["sm", "md"]} className={"heading-md"}>{`Requires ${data.requires}`}</Text>
                    :
                    <Text fontSize={["sm", "md"]} className={"heading-md"}>{data.group.name === "Brawl Pass" ? "Included in Brawl Pass" : "\u00a0"}</Text>
                }
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent p={[1, 3]}>
                    <ModalHeader fontWeight={"normal"}>Extra Features</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        {(data.features.length > 0) ?
                            data.features.map((feature) => (
                                <Text key={feature}>&#x2022;  {feature}</Text>
                            ))
                            :
                            <Text>This skin has no extra features.</Text>
                        }
                    </ModalBody>
                    <ModalFooter/>
                </ModalContent>
            </Modal>
        </Flex>
        :
        <></>
        }
    </>
    );
}
