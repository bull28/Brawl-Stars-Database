import { Box, Button, Divider, Flex, HStack, IconButton, Image, keyframes, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { MdDoneOutline } from 'react-icons/md'
import AuthRequest from '../helpers/AuthRequest'
import { PinObject } from '../types/TradeData'
import { IoMdRemoveCircleOutline } from 'react-icons/io'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'

export interface TradeData {
    tradeid: number,
    cost: number,
    offer: PinObject[],
    request: PinObject[],
    timeLeft: {
        season: number,
        hour: number,
        minute: number,
        second: number,
        hoursPerSeason: number,
        maxSeasons: number
    },
    accepted: boolean
}

interface TradeAcceptData {
    complete: boolean,
    acceptedBy: string,
    pins: [PinObject]
}

export default function MyTrades() {
    const [username, setUsername] = useState<string>()
    const [data, setData] = useState<[TradeData]>()
    const [acceptData, setAcceptData] = useState<TradeAcceptData>()

    const {isOpen, onOpen, onClose} = useDisclosure()
    const navigate = useNavigate()

    const contentTransition = keyframes`
    from {transform: scale(0.3);}
    to {transform: scale(1.0)}
    `

    useEffect(() => {
        AuthRequest('/resources', {setState: [{func: setUsername, attr: "username"}]})        
    }, [])

    useEffect(() => {
        getTrades();   
    }, [username])

    const getTrades = () => {
        if (username){
            AuthRequest('/trade/user', {data: {username: username}, setState: [{func: setData, attr: ""}], fallback: () => {}})
        }
    }

    const removeTrade = (tradeid: number) => {
        AuthRequest('/trade/close', {data: {tradeid: tradeid}, setState: [{func: setAcceptData, attr: ""}], message: {title: 'Removed Trade!', description: 'Successfully removed trade.', status: 'success'}, callback: () => {getTrades()}})
        onOpen()
    }

    const claimTrade = (tradeid: number) => {
        AuthRequest('/trade/close', {data: {tradeid: tradeid}, setState: [{func: setAcceptData, attr: ""}], message: {title: 'Claimed Trade!', description: 'Successfully claimed trade.', status: 'success'}, callback: () => {getTrades()}})
        onOpen()
    }

  return (
    <Flex flexDir={'column'} alignItems={'center'} overflow={'hidden'}>
        <Text fontSize={'2xl'} color={'white'} className={'heading-2xl'} my={3}>My Trades</Text>
        <IconButton pos={'absolute'} top={'2vh'} left={'2vh'} colorScheme={'gray'} as={ArrowBackIcon} aria-label="back to trades menu" onClick={() => {navigate('/trade')}} cursor={'pointer'}/>
        <Flex flexDir={'column'} ml={'10vw'} mt={'5vh'}>
            <Text  fontSize={'xl'} color={'#9f9'} className={'heading-2xl'}>Accepted</Text>
            <Box bgColor={'gray.200'} h={'2px'} w={'100vw'} my={3}/>
            <HStack overflowX={'auto'} maxW={'100vw'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,
                    },
                }}>
                {
                    data?.map((trade) => {
                        if (trade.accepted){
                            return (
                                <Flex flexDir={'column'}>
                                <Flex h={'25vh'} maxW={'fit-content'} flexDir={'column'} alignItems={'center'} justifyContent={'space-between'} textAlign={'center'} bgColor={'blue.800'} p={3} borderRadius={'xl'} border={'3px solid #75fa9d'} cursor={'pointer'} _hover={{transform: "scale(110%)"}} transition={'0.25s'}>
                <Flex w={'85%'} justifyContent={'space-between'} color={'white'} fontSize={'lg'}>
                    <Text color={'red.500'}>Requesting</Text>
                    <Text color={'green.400'}>Offering</Text>
                </Flex>

                <Flex justifyContent={'center'} alignItems={'center'} maxH={'70%'} >

                    
                        <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,
                    },
                }}>
                            {trade.request.map((request) => (
                                <Flex p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                    <Image maxW={'60px'} src={`/image/${request.pinImage}`} fallback={<Spinner/>}/>
                                    <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'white'}>{request.amount}</Text>
                                </Flex>
                            ))}
                        </SimpleGrid>
                    

                    <Flex flexDir={'column'} justifyContent={'space-evenly'} alignItems={'center'} mx={'1vw'}  color={'white'} h={'100%'}>
                        <Flex alignItems={'center'}>
                            <Image w={'30px'} h={'30px'} src={'/image/resources/resource_trade_credits.webp'}/>
                            <Text ml={1} fontSize={'2xl'}>{trade.cost}</Text>                                
                        </Flex>

                        <HiOutlineSwitchHorizontal fontSize={'30px'}/>
                    </Flex>

                    
                        <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,
                    },
                }}>
                            {trade.offer.map((offer) => (
                                <Flex p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                    <Image  maxW={'60px'} src={`/image/${offer.pinImage}`} fallback={<Spinner/>}/>
                                    <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'white'}>{offer.amount}</Text>
                                </Flex>
                            ))}
                        </SimpleGrid>

                </Flex>
                <Flex w={'90%'} justifyContent={'space-between'}>
                    <Flex color={(trade.timeLeft.hour < 5 && trade.timeLeft.season === 0) ? 'red.500' : 'white'}>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.hour > 0 ? ` ${trade.timeLeft.hour}h` : ""}</Text>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.minute > 0 ? ` ${trade.timeLeft.minute}m` : ""}</Text>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.second > 0 ? ` ${trade.timeLeft.second}s` : ""}</Text>
                        <Text>{(trade.timeLeft.hour === 0 && trade.timeLeft.minute === 0 && trade.timeLeft.second === 0) ? `> ${trade.timeLeft.hoursPerSeason} hours` : ""}</Text>
                    </Flex>             
                </Flex>        
            </Flex>
            <Button colorScheme={'whatsapp'} onClick={() => {claimTrade(trade.tradeid)}} rightIcon={<MdDoneOutline/>} my={3}>Claim</Button>
            <br></br>                                    
            </Flex>
                            )
                        }
                    })
                }

            </HStack>
        </Flex>

        <Flex flexDir={'column'} ml={'10vw'} mt={'5vh'}>
            <Text fontSize={'xl'} color={'orange'} className={'heading-xl'}>Pending</Text>
            <Box bgColor={'gray.200'} h={'2px'} w={'100vw'} my={3}/>
            <HStack overflowX={'auto'} maxW={'100vw'} pr={'6vw'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,                  
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,                    
                    },
                }}>
                {
                    data?.map((trade) => {
                        if (!trade.accepted){
                            return (
                                <Flex flexDir={'column'}>
                                <Flex h={'25vh'} maxW={'fit-content'} flexDir={'column'} alignItems={'center'} justifyContent={'space-between'} textAlign={'center'} bgColor={'blue.800'} p={3} borderRadius={'xl'} border={'3px solid orange'} cursor={'pointer'} _hover={{transform: "scale(110%)"}} transition={'0.25s'}>
                <Flex w={'85%'} justifyContent={'space-between'} color={'white'} fontSize={'lg'}>
                    <Text color={'red.500'}>Requesting</Text>
                    <Text color={'green.400'}>Offering</Text>
                </Flex>

                <Flex justifyContent={'center'} alignItems={'center'} maxH={'70%'} >

                    
                        <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,
                    },
                }}>
                            {trade.request.map((request) => (
                                <Flex p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                    <Image maxW={'60px'} src={`/image/${request.pinImage}`} fallback={<Spinner/>}/>
                                    <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'white'}>{request.amount}</Text>
                                </Flex>
                            ))}
                        </SimpleGrid>
                    

                    <Flex flexDir={'column'} justifyContent={'space-evenly'} alignItems={'center'} mx={'1vw'}  color={'white'} h={'100%'}>
                        <Flex alignItems={'center'}>
                            <Image w={'30px'} h={'30px'} src={'/image/resources/resource_trade_credits.webp'}/>
                            <Text ml={1} fontSize={'2xl'}>{trade.cost}</Text>                                
                        </Flex>

                        <HiOutlineSwitchHorizontal fontSize={'30px'}/>
                    </Flex>

                    
                        <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={{
                    '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                    backgroundColor: `rgba(0, 0, 0, 0.5)`,
                    borderRadius: `6px`,
                    },
                }}>
                            {trade.offer.map((offer) => (
                                <Flex p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                    <Image  maxW={'60px'} src={`/image/${offer.pinImage}`} fallback={<Spinner/>}/>
                                    <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'white'}>{offer.amount}</Text>
                                </Flex>
                            ))}
                        </SimpleGrid>

                </Flex>
                <Flex w={'90%'} justifyContent={'space-between'}>
                    <Flex color={(trade.timeLeft.hour < 5 && trade.timeLeft.season === 0) ? 'red.500' : 'white'}>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.hour > 0 ? ` ${trade.timeLeft.hour}h` : ""}</Text>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.minute > 0 ? ` ${trade.timeLeft.minute}m` : ""}</Text>
                        <Text whiteSpace={"pre"}>{trade.timeLeft.second > 0 ? ` ${trade.timeLeft.second}s` : ""}</Text>
                        <Text>{(trade.timeLeft.hour === 0 && trade.timeLeft.minute === 0 && trade.timeLeft.second === 0) ? `> ${trade.timeLeft.hoursPerSeason} hours` : ""}</Text>
                    </Flex>             
                </Flex>
            </Flex>

            <Button colorScheme={'red'} onClick={() => {removeTrade(trade.tradeid)}} rightIcon={<IoMdRemoveCircleOutline/>} mt={3}>Remove</Button>
            <br></br>
            </Flex>
                            )
                        }
                    })
                }
                
            </HStack>
        </Flex>
        <Modal isOpen={isOpen} onClose={onClose} size={'6xl'}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>{acceptData?.complete ? 'Rewards Claimed!' : 'Returned Pins'}<Divider my={2}/></ModalHeader>
            <ModalCloseButton />
            <ModalBody>                
                <SimpleGrid columns={[2,3,4,5]} spacing={3}>
                    {acceptData?.pins.map((pin, x) => (
                        <Flex py={'20%'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'350px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`}>                                                                                            
                            <Image borderRadius={'xl'} src={`/image/${pin.pinImage}`} loading={'eager'}/>
                            <Text color={'white'} fontSize={'2xl'} className={'heading-2xl'} mt={1}>{`${pin.amount}x`}</Text>
                        </Flex>
                    ))}
                </SimpleGrid>
                <Flex justifyContent={'center'}>
                    <Link p={3} borderRadius={'lg'} my={5} bgColor={'#a9e8da'} fontSize={'lg'} href={`/collection`} color={'white'} className={'heading-md'}>View Collection <ExternalLinkIcon mx={'2px'}/></Link>
                </Flex>      
            </ModalBody>

            <ModalFooter>
                <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                    <Text>{acceptData?.complete ? `Accepted By: ${acceptData?.acceptedBy}` : ``}</Text>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                    Close
                    </Button>
                </Flex>
            </ModalFooter>
            </ModalContent>
        </Modal>
    </Flex>
  )
}