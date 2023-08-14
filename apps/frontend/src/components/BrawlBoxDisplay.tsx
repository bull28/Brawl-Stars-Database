import React, { useRef, useState } from 'react'
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Flex, Image, keyframes, Modal, ModalBody, ModalContent, ModalFooter, SimpleGrid, Spinner, Text, ToastId, useDisclosure, useToast, Divider } from '@chakra-ui/react'
import { BrawlBoxContentsData, BrawlBoxData } from '../types/BrawlBoxData'
import CountUp from 'react-countup'
import AuthRequest from '../helpers/AuthRequest'
import { AxiosError } from 'axios'
import cdn from "../helpers/CDNRoute";

export default function BrawlBoxDisplay({data, tokens, loadResources}: {data: BrawlBoxData; tokens: number | undefined; loadResources: () => void;}){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure() //fix

    const [ boxContents, setBoxContents ] = useState<BrawlBoxContentsData[]>([])
    const cancelRef: React.RefObject<HTMLButtonElement> = useRef(null)
    const toastRef: React.MutableRefObject<ToastId> = useRef(1549687458)

    const toast = useToast()

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `

    const openBox = (id: string) => {
        setBoxContents([])
        AuthRequest<BrawlBoxContentsData[]>("/brawlbox", {setState: setBoxContents, data: {boxType: id}, callback: () => {
            onClose()
            onClose2()
            onOpen2()
        }, fallback: function(error: Error) {
            const e = error as AxiosError;
            if (e.response !== void 0 && e.response.status === 403){
                if (!toast.isActive(toastRef.current)){
                    toastRef.current = toast({
                        description: `You don't have enough tokens to open this box!`,
                        status: 'error',
                        duration: 3000,
                        isClosable: true
                    })
                }
            }
        }});
    }

    return (
        <Flex py={5} flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'} bgColor={'lightskyblue'} px={[3, 5, 5, 5, 10]} borderRadius={'lg'} cursor={'pointer'} border={'2px solid black'} onClick={onOpen}>
            <Image src={`${cdn}/image/${data.image}`} fallback={<Spinner/>}/>
            <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} mt={3}>
                <Text fontSize={'xl'} className={'heading-2xl'} mr={1}>{data.cost}</Text>
                <Image w={'22px'} h={'22px'} src={`${cdn}/image/resources/resource_tokens.webp`}/>
            </Flex>
            <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontWeight={"normal"}>
                            {data.displayName}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Image src={`${cdn}/image/${data.image}`}/>
                            <Divider my={2}/>
                            <Text>{data.description}</Text>
                            <Divider my={2}/>
                            <Flex flexDir={'column'}>
                                {data !== void 0 ? <Text fontSize={["sm", "md", "md", "md", "md"]} whiteSpace={"pre-line"}>{data.dropsDescription.reduce((previousValue, currentValue) => previousValue + "\n" + currentValue)}</Text> : <></>}
                            </Flex>
                            <Divider my={2}/>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onClose} ref={cancelRef}>
                                Cancel
                            </Button>
                            <Button colorScheme={(tokens && (tokens < data.cost)) ? 'red' : 'facebook'} onClick={() => {openBox(data.name)}} ml={3}>
                                <Flex alignItems={'center'} justifyContent={'center'} textAlign={'center'}>
                                    <Text fontSize={'lg'} mr={1}>{data.cost}</Text>
                                    <Image src={`${cdn}/image/resources/resource_tokens.webp`} w={'22px'}/>
                                </Flex>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <Modal size={'full'} isOpen={isOpen2} onClose={onClose2}>
                <ModalContent>
                    <ModalBody p={[0, 3, 5, 5, 5]}>
                        <Flex mt={5} w={'100%'} h={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>       
                            <SimpleGrid columns={[1, 2, 3, 3, 4].map((value) => Math.min(value, boxContents.length))} spacing={[3, 4, 5, 5, 5]}>
                                {boxContents.map((content, x) => (
                                    <Flex key={content.rewardType + content.displayName + content.image} px={[3, 2, 5, 6, 6]} py={'20%'} w={['90vw', '40vw', '27vw', '27vw', '20vw']} bgColor={content.backgroundColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`}>
                                        <Text mb={2} fontSize={['2xl', '2xl', '2xl', '3xl', '3xl']} className={'heading-2xl'}>{content.displayName}</Text>                                    
                                        <Image borderRadius={'xl'} src={`${cdn}/image/${content.image}`} loading={'eager'} maxW={['75vw', '30vw', '20vw', '20vw', '20vw']}/>
                                        {content.amount > 1 && <Text fontSize={'2xl'} className={'heading-2xl'}>{`+${content.amount}`}</Text>}
                                        <Text mx={0} className={'heading-xl'} fontSize={['lg', 'md', 'lg', 'xl', 'xl']}>{content.description}</Text>
                                        <Text mt={'20%'}  className={'heading-lg'} fontSize={'lg'}><CountUp prefix={'Inventory: '} end={content.inventory} duration={1.5}/></Text>
                                    </Flex>
                                ))}
                            </SimpleGrid>
                        </Flex>       
                    </ModalBody>
                    <ModalFooter flexDir={['column', 'row', 'row', 'row', 'row']}>                     
                        <Button onClick={() => {loadResources(); onClose2()}}>
                            Close
                        </Button>
                        <Button onClick={() => {openBox(data.name)}} ml={[0, 3, 3, 3, 3]} mt={[3, 0, 0, 0, 0]}>
                            <Flex alignItems={"center"} justifyContent={"center"} flexDir={['column', 'row', 'row', 'row', 'row']}>
                                <Text mr={[0, 3, 3, 3, 3]}>Open Again</Text>
                                <Flex alignItems={"center"}>
                                    <Text mr={[0, 0.5, 0.5, 0.5, 0.5]}>{data.cost}</Text>
                                    <Image src={`${cdn}/image/resources/resource_tokens.webp`} w={'22px'}/>
                                </Flex>
                            </Flex>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}
