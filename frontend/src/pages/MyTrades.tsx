import { Box, Button, Divider, Flex, HStack, IconButton, Image, keyframes, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ScaleFade, SimpleGrid, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import AuthRequest from '../helpers/AuthRequest'
import { PinObject, UserTradeData } from '../types/TradeData'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import SkullBackground from '../components/SkullBackground'
import {UserInfoProps} from '../types/AccountData'
import {scrollStyle} from "../themes/scrollbar";
import api from "../helpers/APIRoute";

interface TradeAcceptData{
    complete: boolean;
    acceptedBy: string;
    pins: PinObject[];
}

interface Category{
    description: string;
    message: string;
    buttonText: string;
    color: string;
    trades: UserTradeData[];
}

interface TradeCategories{
    accepted: Category;
    pending: Category;
    expired: Category;
}

export default function MyTrades() {
    const [username, setUsername] = useState<string>();
    const [acceptData, setAcceptData] = useState<TradeAcceptData>();
    const [trades, setTrades] = useState<TradeCategories | undefined>(undefined);

    const {isOpen, onOpen, onClose} = useDisclosure();
    const navigate = useNavigate();

    const contentTransition = keyframes`
        from {transform: scale(0.3);}
        to {transform: scale(1.0)}
    `;

    const organizeData = useCallback((trades: UserTradeData[]) => {
        const sortedTrades: TradeCategories = {
            accepted: {description: "Accepted", message: "Claimed Trade!", buttonText: "Claim", color: "#9f9", trades: []},
            pending: {description: "Pending", message: "Removed Trade!", buttonText: "Remove", color: "orange", trades: []},
            expired: {description: "Expired", message: "Removed Trade!", buttonText: "Remove", color: "#f56565", trades: []}
        };

        for (let x = 0; x < trades.length; x++){
            if (trades[x].accepted === true){
                sortedTrades.accepted.trades.push(trades[x]);
            } else if (trades[x].timeLeft.hour > 0 || trades[x].timeLeft.minute > 0 || trades[x].timeLeft.second > 0){
                sortedTrades.pending.trades.push(trades[x]);
            } else if (trades[x].accepted === false){
                // trades[x].timeLeft.hour === 0 && trades[x].timeLeft.minute === 0 && trades[x].timeLeft.second === 0
                sortedTrades.expired.trades.push(trades[x]);
            }
        }
        
        setTrades(sortedTrades);
    }, []);

    const setResourcesUsername = useCallback((data: UserInfoProps) => {
        setUsername(data.username);
    }, []);

    useEffect(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setResourcesUsername});
    }, [setResourcesUsername])

    const getTrades = useCallback(() => {
        if (username){
            AuthRequest<UserTradeData[]>("/trade/user", {data: {username: username}, setState: organizeData, fallback: () => {}});
        }
    }, [username, organizeData]);

    useEffect(() => {
        getTrades();   
    }, [username, getTrades])

    const claimTrade = (tradeid: number, message: string) => {
        AuthRequest<TradeAcceptData>("/trade/close", {data: {tradeid: tradeid}, setState: setAcceptData, message: {title: message, description: `Successfully ${message.toLowerCase().slice(0, -1)}.`, status: 'success'}, callback: () => {getTrades()}});
        onOpen();
    }

    return (
    <Flex flexDir={'column'} alignItems={'center'} overflow={'hidden'}>
        <SkullBackground/>
        <Text fontSize={'2xl'}  className={'heading-2xl'} my={3}>My Trades</Text>
        <IconButton pos={'absolute'} top={'2vh'} left={'2vh'} as={ArrowBackIcon} aria-label="back to trades menu" onClick={() => {navigate('/trade')}} cursor={'pointer'}/>
        {typeof trades !== "undefined" ? (Object.keys(trades).map((key) => {
            const value = trades[key as keyof TradeCategories];

            return (<Flex key={key} flexDir={'column'} ml={'10vw'} mt={'5vh'}>
                <Text fontSize={'2xl'} className={'heading-2xl'} color={value.color}>{value.description}</Text>
                <Box bgColor={'gray.200'} h={'2px'} w={'100vw'} my={3}/>
                <HStack overflowX={'auto'} maxW={'100vw'} sx={scrollStyle}>
                    {value.trades.map((trade) => {
                        return (
                        <ScaleFade key={trade.tradeid} in={true}>
                            <Flex flexDir={'column'}>
                            <Flex h={'25vh'} maxW={'fit-content'} flexDir={'column'} alignItems={'center'} justifyContent={'space-between'} textAlign={'center'} bgColor={'blue.800'} p={3} borderRadius={'xl'} border={`3px solid ${value.color}`} cursor={'pointer'} transition={'0.25s'}>
                                <Flex w={'85%'} justifyContent={'space-between'}  fontSize={'lg'}>
                                    <Text color={'red.500'}>Requesting</Text>
                                    <Text color={'green.400'}>Offering</Text>
                                </Flex>

                                <Flex justifyContent={'center'} alignItems={'center'} maxH={'70%'}>
                                    <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                                        {trade.request.map((request) => (
                                            <Flex key={request.pinImage} p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                                <Image maxW={'60px'} src={`${api}/image/${request.pinImage}`} fallback={<Spinner/>}/>
                                                <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} >{request.amount}</Text>
                                            </Flex>
                                        ))}
                                    </SimpleGrid>

                                    <Flex flexDir={'column'} justifyContent={'space-evenly'} alignItems={'center'} mx={'1vw'}   h={'100%'}>
                                        <Flex alignItems={'center'}>
                                            <Image w={'30px'} h={'30px'} src={`${api}/image/resources/resource_trade_credits.webp`}/>
                                            <Text ml={1} fontSize={'2xl'}>{trade.cost}</Text>                                
                                        </Flex>

                                        <HiOutlineSwitchHorizontal fontSize={'30px'}/>
                                    </Flex>
                        
                                    <SimpleGrid w={'10vw'} columns={[1, 2]} spacing={3} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                                        {trade.offer.map((offer) => (
                                            <Flex key={offer.pinImage} p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                                <Image  maxW={'60px'} src={`${api}/image/${offer.pinImage}`} fallback={<Spinner/>}/>
                                                <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} >{offer.amount}</Text>
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
                            <Button onClick={() => {claimTrade(trade.tradeid, value.message)}} my={3}>{value.buttonText}</Button>
                            <br></br>                                    
                            </Flex>
                        </ScaleFade>
                        );
                    })}
                </HStack>
            </Flex>);
        })) : <></>}

        <Modal isOpen={isOpen} onClose={onClose} size={'6xl'}>
            <ModalOverlay/>
            <ModalContent>
            <ModalHeader fontWeight={'normal'}>{acceptData?.complete ? 'Rewards Claimed!' : 'Returned Pins'}<Divider my={2}/></ModalHeader>
            <ModalCloseButton />
            <ModalBody>                
                <SimpleGrid columns={[2,3,4,5]} spacing={3}>
                    {acceptData?.pins.map((pin, x) => (
                        <Flex key={pin.pinImage} py={'20%'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'350px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`}>                                                                                            
                            <Image borderRadius={'xl'} src={`${api}/image/${pin.pinImage}`} loading={'eager'}/>
                            <Text  fontSize={'2xl'} className={'heading-2xl'} mt={1}>{`${pin.amount}x`}</Text>
                        </Flex>
                    ))}
                </SimpleGrid>
                <Flex justifyContent={'center'}>
                    <Link p={3} borderRadius={'lg'} my={5} bgColor={'#a9e8da'} fontSize={'lg'} href={`/collection`}  className={'heading-md'}>View Collection <ExternalLinkIcon mx={'2px'}/></Link>
                </Flex>      
            </ModalBody>

            <ModalFooter>
                <Flex w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                    <Text>{acceptData?.complete ? `Accepted By: ${acceptData?.acceptedBy}` : ``}</Text>
                    <Button mr={3} onClick={onClose}>Close</Button>
                </Flex>
            </ModalFooter>
            </ModalContent>
        </Modal>
    </Flex>
    )
}
