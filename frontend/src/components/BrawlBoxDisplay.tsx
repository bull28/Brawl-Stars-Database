import React, { useRef, useState } from 'react'
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Flex, Image, keyframes, Modal, ModalBody, ModalContent, ModalFooter, SimpleGrid, Spinner, Text, ToastId, useDisclosure, useToast } from '@chakra-ui/react'
import { BrawlBoxContentsData, BrawlBoxData } from '../types/BrawlBoxData'
import CountUp from 'react-countup'
import AuthRequest from '../helpers/AuthRequest'


export default function BrawlBoxDisplay({ data, tokens, loadResources }: {data: BrawlBoxData, tokens: number | undefined, loadResources: () => void}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure() //fix

    const [ boxContents, setBoxContents ] = useState<[BrawlBoxContentsData]>()
    const cancelRef: React.RefObject<HTMLButtonElement> = useRef(null)
    const toastRef: React.MutableRefObject<ToastId> = useRef(1549687458)

    const toast = useToast()

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `

    const openBox = (id: string) => {
        setBoxContents(undefined)
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

    return (
        
        <Flex py={5} flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'} bgColor={'lightskyblue'} px={10} borderRadius={'lg'} cursor={'pointer'} border={'2px solid black'} onClick={onOpen}>
            <Image src={`/image/${data.image}`} fallback={<Spinner/>}/>
            <Flex w={'100%'} justifyContent={'center'} mt={3}>
                <Text fontSize={'xl'} className={'heading-2xl'} mr={1}>{data.cost}</Text>
                <Image w={'22px'} h={'22px'} src={'/image/resources/resource_tokens.webp'}/>
            </Flex>
            <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontWeight={"normal"}>
                            {data.displayName}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Image src={`/image/${data.image}`}/>
                            <Text>{data.description}</Text>
                            <Flex flexDir={'column'}>
                                {typeof data !== "undefined" ? <Text whiteSpace={"pre"}>{data.dropsDescription.reduce((previousValue, currentValue) => previousValue + "\n" + currentValue)}</Text> : <></>}
                            </Flex>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onClose} ref={cancelRef}>
                                Cancel
                            </Button>
                            <Button colorScheme={(tokens && (tokens < data.cost)) ? 'red' : 'facebook'} onClick={() => {openBox(data.name)}} ml={3}>
                                <Flex alignItems={'center'} justifyContent={'center'} textAlign={'center'}>
                                    <Text fontSize={'lg'} mr={1}>{data.cost}</Text>
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
                                <Flex key={content.rewardType + content.displayName + content.image} py={'20%'} bgColor={content.backgroundColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'350px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`} w={'20vw'}>                                    
                                
                                    <Text mb={2}  fontSize={'3xl'} className={'heading-2xl'}>{content.displayName}</Text>                                    
                                    <Image borderRadius={'xl'} src={`/image/${content.image}`} loading={'eager'}/>
                                    {content.amount > 1 && <Text fontSize={'2xl'} className={'heading-2xl'}>{`+${content.amount}`}</Text>}
                                    <Text mx={6}  className={'heading-lg'} fontSize={'xl'}>{content.description}</Text>
                                    <Text mt={'20%'}  className={'heading-lg'} fontSize={'lg'}><CountUp prefix={'Inventory: '} end={content.inventory} duration={1.5}/></Text>
                                </Flex>               
                            ))}
                        </SimpleGrid>       
                        </Flex>       
                    </ModalBody>
                    <ModalFooter>                     
                        <Button onClick={() => {loadResources(); onClose2()}}>
                            Close
                        </Button>
                        <Button onClick={() => {openBox(data.name)}} ml={3}>
                            <Flex alignItems={"center"}>
                                <Text mr={3}>Open Again</Text>
                                <Text mr={0.5}>{data.cost}</Text>
                                <Image src={'/image/resources/resource_tokens.webp'} w={'22px'}/>
                            </Flex>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    
    )
}

