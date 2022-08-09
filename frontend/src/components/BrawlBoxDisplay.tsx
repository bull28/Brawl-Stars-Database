import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, HStack, Image, keyframes, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ScaleFade, SimpleGrid, SlideFade, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { BrawlBoxData } from '../types/BrawlBoxData'

interface BrawlBoxContentsData {
    displayName: string,
    rewardType: string,
    amount: number,
    image: string,
    backgroundColor: string,
    description: string
}


export default function BrawlBoxDisplay({ data }: {data: BrawlBoxData}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure() //fix

    const [ amount, setAmount ] = useState<number>(1)
    const [ boxContents, setBoxContents ] = useState<[BrawlBoxContentsData]>()
    const cancelRef:any = useRef()

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `

    const openBox = (id: string) => {
        for (let i = 0; i < amount; i++){
            axios.post('/brawlbox', {token: localStorage.getItem('token'), boxType: id})
                .then((res) => {
                    setBoxContents(res.data)
                })
        }

        onClose()
        onOpen2()
    
    }

    return (
        
        <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'} bgColor={'lightskyblue'} px={10} py={2} borderRadius={'lg'} cursor={'pointer'} onClick={onOpen}>
            <Image src={`/image/${data.image}`}/>
            <Flex w={'100%'} justifyContent={'center'}>
                <Text fontSize={'lg'} mr={1}>{data.cost}</Text>
                <Image w={'22px'} h={'22px'} src={'/image/resources/resource_tokens.webp'}/>
            </Flex>
            <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            {data.displayName}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Image src={`/image/${data.image}`}/>
                            <Text>{data.description}</Text>
                            <Flex>
                            <Slider value={amount} onChange={(count) => setAmount(count)} max={15} min={1} step={1} w={'70%'}>
                                <SliderMark value={1} mt={'2'} ml={'-2.5'} fontSize={'sm'}>
                                    1x
                                </SliderMark>
                                <SliderMark value={15}>
                                    15x
                                </SliderMark>
                                <SliderTrack>
                                    <SliderFilledTrack/>
                                </SliderTrack>
                                <SliderThumb/>
                            </Slider>
                            <Text ml={10}>{`${amount}x`}</Text>
                            </Flex>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onClose} ref={cancelRef}>
                                Cancel
                            </Button>
                            <Button colorScheme={'facebook'} onClick={() => {openBox(data.name)}} ml={3}>
                                <Flex alignItems={'center'} justifyContent={'center'} textAlign={'center'}>
                                    <Text fontSize={'lg'}>{amount * data.cost}</Text>
                                    <Image src={'/image/resources/resource_tokens.webp'} w={'22px'}/>
                                </Flex>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <Modal size={'full'} isOpen={isOpen2} onClose={onClose2}>
                <ModalContent>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex mt={5} w={'100%'} h={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>       
                        <SimpleGrid columns={(boxContents && boxContents.length > 4) ? Math.ceil(boxContents.length / 2) : boxContents?.length} spacing={10}>
                            {boxContents?.map((content, x) => (        
                                <Flex bgColor={content.backgroundColor} flexDir={'column'} justifyContent={'space-around'} alignItems={'center'} textAlign={'center'} px={'10%'} py={'20%'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'400px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 1s ease-out ${(x+0.5)}s 1 forwards`}>
                                    <Text color={'white'} fontSize={'3xl'} className={'heading-2xl'}>{content.displayName}</Text>                                    
                                    <Image maxH={'60%'} src={`/image/${content.image}`} loading={'eager'}/>
                                    {content.amount > 1 && <Text color={'white'} fontSize={'2xl'}>{`${content.amount}x`}</Text>}
                                    <Text color={'white'} className={'heading-lg'} fontSize={'xl'}>{content.description}</Text>
                                </Flex>               
                            ))}
                        </SimpleGrid>       
                        </Flex>       
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme={'facebook'} onClick={onClose2}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    
    )
}

