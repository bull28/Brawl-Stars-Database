import axios from 'axios'
import { useEffect, useState } from 'react'
import { Flex, Image, Text, Modal,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Divider,
    ModalOverlay,
    Spinner
    } from '@chakra-ui/react'
import CurrencyIcon from './CurrencyIcon'
import Label from './Label'

type BrawlerImageProps = {
    brawler: string,
    skin: string
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
    model: {exists: boolean, image: string}
}

export default function BrawlerImage({ brawler, skin }: BrawlerImageProps) {
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
            <Flex w={'100%'} h={'100%'} bgImage={`/image/${data.group.image}`} borderRadius={'lg'} onClick={onOpen}>
                <Image objectFit={'cover'} src={`/image/${data.image}`} alt={data.displayName} fallback={<Spinner/>}/>
            </Flex>
            <Flex alignItems={'center'} alignSelf={'center'} mt={3}>
                    {(data.group.icon !== 'misc/skingroups/icons/icon_default.png') && <Label label={data.group.name}><Image src={`/image/${data.group.icon}`} w={7} mr={3}/></Label>}            
                <Text fontSize={['md','lg','xl']} fontWeight={'bold'} >{data.displayName}</Text>    
            </Flex>
            
            <Flex alignItems={'center'} alignSelf={'center'}>
                <Text fontSize={'xl'} mr={1}>{data.cost === 0 ? 'Default' : data.group.name === 'Brawl Pass' ? 'Included in Brawl Pass' : data.cost}</Text>
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
