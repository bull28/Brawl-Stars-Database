import axios from 'axios'
import { SetStateAction, useEffect, useState } from 'react'
import { Flex, Image, Text, Modal,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Divider,
    ModalOverlay,
    Icon,
    Spinner
    } from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
import CurrencyIcon from './CurrencyIcon'
import Label from './Label'
import { animateScroll as scroll } from 'react-scroll'
import { ModelFiles } from '../types/BrawlerData'
import api from "../helpers/ApiRoute";

type BrawlerImageProps = {
    brawler: string,
    skin: string,
    setModel: React.Dispatch<SetStateAction<ModelFiles>>
}

type SkinData = {
    name: string;
    displayName: string;
    cost: number;
    currency: string;
    costBling: number;
    requires: string;
    features: [string];
    limited: boolean;
    group: {
        name: string;
        image: string;
        icon: string;
    };
    rating: number;
    image: string;
    model: {
        geometry: {exists: boolean, path: string};
        winAnimation: {exists: boolean, path: string};
        loseAnimation: {exists: boolean, path: string};
    };
}

function getCostText(skin: SkinData): string{
    if (skin.cost > 0){
        return skin.cost.toString();
    }
    if (skin.name.includes("default") === true){
        return "Default";
    }
    return "Free";
}

export default function BrawlerImage({ brawler, skin, setModel }: BrawlerImageProps) {
    const [data, setData] = useState<SkinData>()
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    useEffect(() => {
        axios.get(`${api}/skin/${brawler}/${skin}`)
            .then((res) => {
                setData(res.data)
            })
    }, [brawler, skin])

  return (
    <>
    {data && Object.keys(data).length !== 0 && 
        <>
            <Flex h={'90%'} bgImage={`${api}/image/${data.group.image}`} borderRadius={'lg'} onClick={onOpen} border={data.limited ? '4px solid gold' : 'none'} backgroundPosition={'center'} justifyContent={'center'}>
                <Image objectFit={'contain'} src={`${api}/image/${data.image}`} alt={data.displayName} fallback={<Spinner/>}/>
            </Flex>
            <Flex alignItems={'center'} alignSelf={'center'} mt={3} mb={1}>
                    {(data.group.icon !== 'skingroups/icons/icon_default.webp') && <Label label={data.group.name}><Image src={`${api}/image/${data.group.icon}`} w={7} mr={3}/></Label>}            
                <Text fontSize={['md','lg','xl']} className={'heading-lg'} >{data.displayName}</Text>    
                {(data.model.geometry.exists) && <Icon as={RepeatIcon} ml={3} fontSize={'24px'} cursor={'pointer'} onClick={() => {let skinModel: ModelFiles = {geometry: `${api}/image/${data.model.geometry.path}`, winAnimation: undefined, loseAnimation: undefined}; if (data.model.winAnimation.exists){skinModel.winAnimation = `${api}/image/${data.model.winAnimation.path}`;} if (data.model.loseAnimation.exists){skinModel.loseAnimation = `${api}/image/${data.model.loseAnimation.path}`;} setModel(skinModel); scroll.scrollToTop();}}/>}
            </Flex>
            
            <Flex alignSelf={'center'} mb={1}>
                <Flex alignItems={'center'} mx={3}>
                    <Text fontSize={'xl'} className={"heading-xl"} mr={1} >{getCostText(data)}</Text>
                    <CurrencyIcon type={data.currency !== "" ? data.currency : ""}/>
                </Flex>
                {(data.costBling > 0) ?
                    <Flex alignItems={'center'} mx={3}>
                        <Text fontSize={"xl"} className={"heading-xl"} mr={1}>{data.costBling}</Text>
                        <CurrencyIcon type={"Bling"}/>
                    </Flex>
                    :
                    <></>
                }
            </Flex>
            {(data.requires !== "") ?
                <Text className={"heading-md"}>{`Requires ${data.requires}`}</Text>
                :
                <Text className={"heading-md"}>{data.group.name === "Brawl Pass" ? "Included in Brawl Pass" : " "}</Text>
            }
            <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
                <ModalContent p={3}>                    
                    <ModalHeader fontWeight={"normal"}>Extra Features</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        {(data.features.length > 0) ? data.features.map((feature) => (
                            <Text key={feature}>&#x2022;  {feature}</Text>
                        )) : <Text>This skin has no extra features.</Text>}
                    </ModalBody>
                    <ModalFooter/>
                </ModalContent>
            </Modal>
        </>
        }
    </>
  )
}
