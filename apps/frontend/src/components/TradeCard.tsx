import { ExternalLinkIcon } from '@chakra-ui/icons'
import {keyframes} from "@emotion/react";
import { Flex, Text, SimpleGrid, Image, useDisclosure, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Box, Link, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useState } from 'react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { getToken } from '../helpers/AuthRequest'
import { RainbowBorder } from '../themes/animations'
import { TradeData } from '../types/TradeData'
import {Link as RouterLink} from "react-router-dom";
import {scrollStyle} from "../themes/scrollbar";
import EventTime from "../helpers/EventTime";
import cdn from "../helpers/CDNRoute";
import api from '../helpers/APIRoute'

const tradeCreditsImage = `${cdn}/image/resources/currency/resource_trade_credits.webp`;

interface PinData {
    amount: number;
    pinImage: string;
    rarityColor: string;
    rarityValue: number;
}

export default function TradeCard({ data, onUpdate }: {data: TradeData; onUpdate: () => void;}) {
    const [tradeComplete, setCompletion] = useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [received, setReceived] = useState<PinData[]>();
    const toast = useToast()

    const confirmTrade = () => {
        axios.post(`${api}/trade/accept`, {
            tradeid:  data.tradeid,
            useWildCards: true,
            forceAccept: false
        }, {headers: {"Authorization": `Bearer ${getToken()}`}})
        .then((res) => {
            setReceived(res.data)
            setCompletion(true)
        })
        .catch(function(err){
            toast({title: 'Error', description: err.response.data, status: 'error', duration: 5000, isClosable: true})
        })
    }

    const refreshPage = () => {
        onClose();
        if (tradeComplete){
            //window.location.reload();
            onUpdate();
        }
        
    }

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `

    return (
        <>
            <Flex h={'25vh'} minW={['0px', '0px', '0px', '0px', '384px']} maxW={['500px', '500px', '500px', '500px', '30vw']} w={['80vw', '80vw', '45vw', '40vw', '25vw']} flexDir={'column'} alignItems={'center'} justifyContent={'space-between'} textAlign={'center'} bgColor={'blue.800'} p={3} borderRadius={'xl'} border={'2px solid black'} onClick={onOpen} cursor={'pointer'} _hover={{transform: "scale(110%)"}} transition={'0.25s'} boxShadow={'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;'} overflow={'hidden'}>
                <Flex w={'85%'} justifyContent={'space-between'} fontSize={['md', 'lg']}  wrap={['wrap', 'nowrap']}>
                    <Text color={'red.500'}>Requesting</Text>
                    <Text color={'green.400'}>Offering</Text>
                </Flex>
                <Flex justifyContent={'center'} alignItems={'center'} maxH={'70%'} w={'100%'}>
                    <SimpleGrid w={'40%'} columns={[1, 2]} spacing={[0, 0, 1, 2, 2]} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                        {data.request.map((request) => (
                            <Flex key={request.pinImage} p={[0, 3, 2, 2, 2]} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                <Image w={['40px', '40px', '50px', '50px', '60px']} src={`${cdn}/image/${request.pinImage}`}/>
                                <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={['md', 'md', 'lg']}>{request.amount}</Text>
                            </Flex>
                        ))}
                    </SimpleGrid>
                    <Flex flexDir={'column'} justifyContent={'space-evenly'} alignItems={'center'} mx={'1vw'} w={'20%'} h={'100%'}>
                        <Flex alignItems={'center'} flexDir={['column', 'row', 'row', 'row', 'row']}>
                            <Image w={'30px'} src={tradeCreditsImage}/>
                            <Text ml={1} fontSize={['lg', 'xl', '2xl']}>{data.cost}</Text>                                
                        </Flex>
                        <HiOutlineSwitchHorizontal fontSize={'30px'}/>
                    </Flex>
                    <SimpleGrid w={'40%'} columns={[1, 2]} spacing={[0, 0, 1, 2, 2]} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                        {data.offer.map((offer) => (
                            <Flex key={offer.pinImage} p={[0, 3, 2, 2, 2]} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                <Image w={['40px', '40px', '40px', '50px', '60px']} src={`${cdn}/image/${offer.pinImage}`}/>
                                <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={['md', 'md', 'lg']}>{offer.amount}</Text>
                            </Flex>
                        ))}
                    </SimpleGrid>
                </Flex>
                <Flex w={'90%'} justifyContent={'space-between'} wrap={['wrap', 'nowrap']}>
                    <Text fontSize={['sm', 'md']} whiteSpace={"pre"} color={data.timeLeft < 18000 ? 'red.500' : 'white'}>{data.timeLeft > 1382400 ? `> 384 hours` : EventTime({season: 0, hour: 0, minute: 0, second: data.timeLeft, hoursPerSeason: 0, maxSeasons: 0}, 0)}</Text>
                    <Text fontSize={['sm', 'md']} >{data.creator.username}</Text>                   
                </Flex>
            </Flex>
            <Modal isOpen={isOpen} onClose={refreshPage} size={'6xl'}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader fontWeight={'normal'}  className={'heading-2xl'}>{tradeComplete ? "Success!" :  "Confirm Trade"}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        {!tradeComplete ? 
                        <>
                        <Flex w={'100%'} flexDir={['column', 'row']}>
                            <Flex w={['100%', '50%']} alignItems={'center'} flexDir={'column'}>
                                <Text mb={5} fontSize={'2xl'} className={'heading-2xl'}>You Give</Text>
                                <SimpleGrid columns={[2,3]} spacing={3} overflow={'auto'} sx={scrollStyle}>
                                    {data.request.map((request) => (
                                        <Flex key={request.pinImage} p={5} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                            <Image maxW={'60px'} src={`${cdn}/image/${request.pinImage}`}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'#f00'}>{`- ${request.amount}`}</Text>
                                        </Flex>
                                    ))}
                                </SimpleGrid>
                            </Flex>

                            <Flex w={['100%', '50%']} alignItems={'center'} flexDir={'column'}>
                                <Text mb={5} fontSize={'2xl'} className={'heading-2xl'}>You Receive</Text>
                                <SimpleGrid columns={[2,3]} spacing={3} overflow={'auto'} sx={scrollStyle}>
                                    {data.offer.map((offer) => (
                                        <Flex key={offer.pinImage} p={5} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                            <Image maxW={'60px'} src={`${cdn}/image/${offer.pinImage}`}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'#0f0'}>{`+ ${offer.amount}`}</Text>
                                        </Flex>
                                    ))}
                                </SimpleGrid>
                            </Flex>
                        </Flex>
                        <Flex w={'100%'} flexDir={'row'} mt={5}>
                            <Box w={'50%'} h={'3px'} bgColor={'red'}></Box>
                            <Box w={'50%'} h={'3px'} bgColor={'green'}></Box>
                        </Flex>
                        <Flex w={'100%'} justifyContent={'center'} mt={5}>
                            <Button onClick={confirmTrade} rightIcon={<Image maxH={'40px'} src={tradeCreditsImage}/>} p={8}>
                                <Flex alignItems={'center'} justifyContent={'center'}>
                                    <Text fontSize={'3xl'} className={'heading-2xl'}  mr={2}>{data.cost}</Text>
                                </Flex>        
                            </Button>
                        </Flex>
                        </>
                        :
                        <>
                        <Flex flexDir={'column'}>
                        <Box borderTop={'2px solid #9f9'} bgColor={'#f3fff3'} p={3}>
                            <Flex whiteSpace={'pre-wrap'}>
                                <Text fontSize={'xl'} className={'heading-2xl'} >Your Trade with </Text><Text fontSize={'xl'} className={'heading-2xl'} fontWeight={'bold'}>{data.creator.username}</Text><Text fontSize={'xl'} className={'heading-2xl'}> has been completed!</Text>
                            </Flex>
                            <br></br>
                        </Box>
                        <Flex w={'100%'} justifyContent={'center'} mt={5}>
                            <Text fontSize={'xl'} className={'heading-2xl'} >You Received</Text>
                        </Flex>
                        <SimpleGrid columns={(received && received.length > 4) ? Math.ceil(received.length / 2) : ((received?.length === 1) ? 2 : received?.length)} spacing={10} mt={5}>
                            {received?.map((data, x) => (
                                <Flex key={data.pinImage} p={5} border={'2px solid black'} borderRadius={'lg'} bgColor={data.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`}>
                                    <Image src={`${cdn}/image/${data.pinImage}`}/>
                                    <Text fontSize={'3xl'}  className={'heading-3xl'}>{`+${data.amount}`}</Text>
                                </Flex>
                            ))}
                        </SimpleGrid>
                        </Flex>
                        </>
                    }
                    </ModalBody>
                    <ModalFooter>
                        {!tradeComplete ? <><Text>{`Created By: ${data.creator.username}`}</Text><Image w={'50px'} ml={2} borderRadius={'50%'} animation={(data.creator.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} border={(data?.creator.avatarColor !== 'rainbow') ? `3px solid ${data?.creator.avatarColor}` : ''} src={`${cdn}/image/${data.creator.avatar}`}/></> : 
                        
                        <Flex bgColor={'#f99ff9'} p={2} borderRadius={'lg'}>
                            <Link as={RouterLink} fontSize={'lg'} to={`/collection`} className={'heading-md'}>View Collection <ExternalLinkIcon mx={'2px'}/></Link>
                        </Flex>      
                        }
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}