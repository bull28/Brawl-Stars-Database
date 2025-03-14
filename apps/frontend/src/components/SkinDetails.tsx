import {
    Flex, Image, Text, Modal, ModalContent, ModalHeader, ModalFooter,
    ModalBody, ModalCloseButton, Divider, ModalOverlay
} from "@chakra-ui/react";
import {SkinData} from "../types/BrawlerData";
import cdn from "../helpers/CDNRoute";

interface SkinDetailsProps{
    isOpen: boolean;
    onClose: () => void;
    data: SkinData;
}

export function getCostText(skin: SkinData): string{
    if (skin.cost.amount > 0){
        return `${skin.cost.amount}`;
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

export default function SkinDetails({data, isOpen, onClose}: SkinDetailsProps){
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent p={[1, 3]}>
                <ModalHeader fontWeight={"normal"} fontSize={"2xl"} className={"heading-2xl"} color={"#fff"}>
                    <Flex alignItems={"center"}>
                        {data.rarity.icon !== "" && <Image src={`${cdn}/image/${data.rarity.icon}`} h={"1.5em"} mr={"0.25em"}/>}
                        <Text>{data.displayName}</Text>
                    </Flex>
                </ModalHeader>
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
                            {data.cost.icon !== "" && <Image src={`${cdn}/image/${data.cost.icon}`} alt={data.cost.currency} h={6}/>}
                        </Flex>
                        {(data.costBling.amount > 0) &&
                        <>
                        <Text fontSize={"xl"}>or</Text>
                        <Flex alignItems={"center"}>
                            <Text fontSize={"xl"} mr={1}>{data.costBling.amount}</Text>
                            <Image src={`${cdn}/image/${data.costBling.icon}`} alt={data.costBling.currency} h={6}/>
                        </Flex>
                        </>
                        }
                    </Flex>
                    {data.requires && <Text>{`Requires ${data.requires}`}</Text>}
                    <Divider my={2}/>
                    {data.release.month >= 1 && data.release.year > 0 && <Text fontSize={"lg"}>{getReleaseDate(data.release)}</Text>}
                    {data.limited && <Text fontSize={"lg"} color={"#ffd700"}>This skin is limited</Text>}
                    {data.unlock !== "" && <Text mt={2}>{data.unlock}</Text>}
                    {data.foundIn.length > 0 &&
                    <>
                        <Text fontSize={"lg"} mt={2}>Can be found in</Text>
                        {data.foundIn.map((value) =>
                            <Text key={value} ml={1}>&#x2022; {value}</Text>
                        )}
                    </>
                    }
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
    );
}
