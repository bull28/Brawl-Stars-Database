import { useRef, useState } from 'react'
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Flex, Image, keyframes, Modal, ModalBody, ModalContent, ModalFooter, SimpleGrid, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { BrawlBoxData } from '../types/BrawlBoxData'
import CountUp from 'react-countup'
import AuthRequest from '../helpers/AuthRequest'

interface BrawlBoxContentsData {
    displayName: string,
    rewardType: string,
    amount: number,
    inventory: number,
    image: string,
    backgroundColor: string,
    description: string
}


export default function BrawlBoxDisplay({ data, tokens, loadResources }: {data: BrawlBoxData, tokens: number | undefined, loadResources: () => void}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure() //fix

    const [ amount, setAmount ] = useState<number>(1)
    const [ boxContents, setBoxContents ] = useState<[BrawlBoxContentsData]>()
    const cancelRef:any = useRef()
    const toastRef:any = useRef()

    const toast = useToast()

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `

    const openBox = (id: string) => {
        setBoxContents(undefined)
        for (let i = 0; i < amount; i++){
            AuthRequest('/brawlbox', {setState: [{func: setBoxContents, attr: ""}], data: {boxType: id}, callback: () => {
                onClose()
                onClose2()
                onOpen2()
            }, fallback: function(error: any) {
                if (error.response.status === 403){

                    if (!toast.isActive(toastRef.current)){
                        toastRef.current = toast({
                            description: `You don't have enough tokens to open this box!`,
                            status: 'error',
                            duration: 3000,
                            isClosable: true
                        })
                    }
                }
            }})
        }
    }

    return (
        
        <Flex py={5} flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'} bgColor={'lightskyblue'} px={10} borderRadius={'lg'} cursor={'pointer'} onClick={onOpen}>
            <Image src={`/image/${data.image}`} fallback={<Spinner/>}/>
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
                            <Flex flexDir={'column'}>
                                {data?.dropsDescription.map((drop) => (
                                    <Text>{drop}</Text>
                                ))}     
                             </Flex>     
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
                            <Button colorScheme={(tokens && (tokens < amount * data.cost)) ? 'red' : 'facebook'} onClick={() => {openBox(data.name)}} ml={3}>
                                <Flex alignItems={'center'} justifyContent={'center'} textAlign={'center'}>
                                    <Text  fontSize={'lg'}>{amount * data.cost}</Text>
                                    <Image src={'/image/resources/resource_tokens.webp'} w={'22px'}/>
                                </Flex>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <Modal size={'full'} isOpen={isOpen2} onClose={onClose2}>
                <ModalContent>
                    <ModalBody>
                        <Flex mt={5} w={'100%'} h={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>       
                        <SimpleGrid columns={(boxContents && boxContents.length > 4) ? Math.ceil(boxContents.length / 2) : boxContents?.length} spacing={10}>
                            {boxContents?.map((content, x) => (        
                                <Flex py={'20%'} bgColor={content.backgroundColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'350px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`} w={'20vw'}>                                    
                                
                                    <Text mb={2} color={'white'} fontSize={'3xl'} className={'heading-2xl'}>{content.displayName}</Text>                                    
                                    <Image borderRadius={'xl'} src={`/image/${content.image}`} loading={'eager'}/>
                                    {content.amount > 1 && <Text color={'white'} fontSize={'2xl'} className={'heading-2xl'}>{`${content.amount}x`}</Text>}
                                    <Text mx={6} color={'white'} className={'heading-lg'} fontSize={'xl'}>{content.description}</Text>
                                    <Text mt={'20%'} color={'white'} className={'heading-lg'} fontSize={'lg'}><CountUp prefix={'Inventory: '} end={content.inventory} duration={1.5}/></Text>
                                </Flex>               
                            ))}
                        </SimpleGrid>       
                        </Flex>       
                    </ModalBody>
                    <ModalFooter>                     
                        <Button colorScheme={'red'} onClick={() => {loadResources(); onClose2()}}>
                            Close
                        </Button>
                        <Button colorScheme={'facebook'} onClick={() => {openBox(data.name)}} ml={3}>
                            Open Again
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    
    )
}

