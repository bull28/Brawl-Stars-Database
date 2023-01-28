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

type BrawlerImageProps = {
    brawler: string,
    skin: string,
    setModel: React.Dispatch<SetStateAction<string | null>>,
    setWin: React.Dispatch<SetStateAction<string | null>>,
    setLose: React.Dispatch<SetStateAction<string | null>>,
}

type SkinData = {
    name: string,
    displayName: string,
    cost: number,
    currency: string,
    features: [string],
    limited: boolean,
    group: {
        name: string,
        image: string,
        icon: string
    },
    rating: number,
    image: string,
    model: {
        geometry: {exists: boolean, path: string},
        winAnimation: {exists: boolean, path: string},
        loseAnimation: {exists: boolean, path: string}
    }
}

export default function BrawlerImage({ brawler, skin, setModel, setWin, setLose }: BrawlerImageProps) {
    const [data, setData] = useState<SkinData>()
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    useEffect(() => {
        axios.get(`/skin/${brawler}/${skin}`)
            .then((res) => {
                setData(res.data)
            })
    }, [brawler, skin])

  return (
    <>
    {data && Object.keys(data).length !== 0 && 
        <>
            <Flex h={'90%'} bgImage={`/image/${data.group.image}`} borderRadius={'lg'} onClick={onOpen} border={data.limited ? '4px solid gold' : 'none'} backgroundPosition={'center'} justifyContent={'center'}>
                <Image objectFit={'contain'} src={`/image/${data.image}`} alt={data.displayName} fallback={<Spinner/>}/>
            </Flex>
            <Flex alignItems={'center'} alignSelf={'center'} mt={3}>
                    {(data.group.icon !== 'skingroups/icons/icon_default.webp') && <Label label={data.group.name}><Image src={`/image/${data.group.icon}`} w={7} mr={3}/></Label>}            
                <Text fontSize={['md','lg','xl']} className={'heading-lg'} >{data.displayName}</Text>    
                {(data.model.geometry.exists) && <Icon as={RepeatIcon} ml={3} fontSize={'24px'} cursor={'pointer'}  onClick={() => {setModel(`/image/${data.model.geometry.path}`); if (data.model.winAnimation.exists){setWin(`/image/${data.model.winAnimation.path}`);} else{setWin(null);} if (data.model.loseAnimation.exists){setLose(`/image/${data.model.loseAnimation.path}`);} else{setLose(null);} scroll.scrollToTop();}}/>}
            </Flex>
            
            <Flex alignItems={'center'} alignSelf={'center'}>
                <Text fontSize={'xl'} mr={1} >{data.cost === 0 ? 'Default' : data.group.name === 'Brawl Pass' ? 'Included in Brawl Pass' : data.cost}</Text>
                <CurrencyIcon type={data.group.name !== 'Brawl Pass' ? data.currency : ""}/>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
                <ModalContent p={3}>                    
                    <ModalHeader>Extra Features</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody>
                        {(data.features.length > 0) ? data.features.map((feature) => (
                            <Text key={feature}>•  {feature}</Text>
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
