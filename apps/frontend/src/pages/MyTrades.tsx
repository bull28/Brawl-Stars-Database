import { Box, Button, Divider, Flex, IconButton, Image, keyframes, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ScaleFade, SimpleGrid, Text, useDisclosure, Stack } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import AuthRequest from '../helpers/AuthRequest'
import { PinObject, UserTradeData } from '../types/TradeData'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import SkullBackground from '../components/SkullBackground'
import {UserInfoProps} from '../types/AccountData'
import {scrollStyle} from "../themes/scrollbar";
import cdn from "../helpers/CDNRoute";

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
        AuthRequest<UserInfoProps>("/resources", {setState: setResourcesUsername}, false);
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
    <Flex flexDir={'column'} alignItems={'center'} overflow={'hidden'} pb={10}>
        <SkullBackground/>
        <Text fontSize={'4xl'} className={'heading-4xl'} mb={3}>My Trades</Text>
        <IconButton pos={'absolute'} top={'2vh'} left={'2vh'} as={ArrowBackIcon} aria-label="back to trades menu" onClick={() => {navigate('/trade')}} cursor={'pointer'}/>
        {trades !== void 0 ? (Object.keys(trades).map((key) => {
            const value = trades[key as keyof TradeCategories];

            return (
            <Flex key={key} flexDir={'column'} mt={'5vh'}>
                <Text fontSize={'2xl'} className={'heading-2xl'} color={value.color}>{value.description}</Text>
                <Box bgColor={'gray.200'} h={'2px'} w={'90vw'} my={3}/>
                <Stack direction={['column', 'column', 'row', 'row', 'row']} overflowX={'auto'} alignItems={'center'} maxW={'90vw'} sx={scrollStyle}>
                    {value.trades.map((trade) => {
                        return (
                        <ScaleFade key={trade.tradeid} in={true}>
                            <Flex flexDir={'column'}>
                            <Flex h={'25vh'} minW={['0px', '0px', '0px', '0px', '384px']} maxW={['500px', '500px', '500px', '500px', '30vw']} w={['80vw', '80vw', '45vw', '40vw', '25vw']} flexDir={'column'} alignItems={'center'} justifyContent={'space-between'} textAlign={'center'} bgColor={'blue.800'} p={3} borderRadius={'xl'} border={'2px solid black'} overflow={'hidden'} cursor={'pointer'} transition={'0.25s'}>
                                <Flex w={'85%'} justifyContent={'space-between'} fontSize={'lg'}>
                                    <Text color={'red.500'}>Requesting</Text>
                                    <Text color={'green.400'}>Offering</Text>
                                </Flex>

                                <Flex justifyContent={'center'} alignItems={'center'} maxH={'70%'} w={'100%'}>
                                    <SimpleGrid w={'40%'} columns={2} spacing={[0, 0, 1, 2, 2]} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                                        {trade.request.map((request) => (
                                            <Flex key={request.pinImage} p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={request.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                                <Image w={['40px', '40px', '50px', '50px', '60px']} maxW={'60px'} src={`${cdn}/image/${request.pinImage}`}/>
                                                <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} >{request.amount}</Text>
                                            </Flex>
                                        ))}
                                    </SimpleGrid>
                                    <Flex flexDir={'column'} justifyContent={'space-evenly'} alignItems={'center'} mx={'1vw'} w={'20%'} h={'100%'}>
                                        <Flex alignItems={'center'} flexDir={['column', 'row', 'row', 'row', 'row']}>
                                            <Image w={'30px'} h={'30px'} src={`${cdn}/image/resources/resource_trade_credits.webp`}/>
                                            <Text ml={1} fontSize={'2xl'}>{trade.cost}</Text>                                
                                        </Flex>
                                        <HiOutlineSwitchHorizontal fontSize={'30px'}/>
                                    </Flex>
                                    <SimpleGrid w={'40%'} columns={2} spacing={[0, 0, 1, 2, 2]} overflow={'auto'} maxH={'100%'} sx={scrollStyle}>
                                        {trade.offer.map((offer) => (
                                            <Flex key={offer.pinImage} p={3} border={'2px solid black'} borderRadius={'lg'} bgColor={offer.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'}>
                                                <Image w={['40px', '40px', '40px', '50px', '60px']} maxW={'60px'} src={`${cdn}/image/${offer.pinImage}`}/>
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
                                        <Text>{(trade.timeLeft.season > 0 && trade.timeLeft.hour === 0 && trade.timeLeft.minute === 0 && trade.timeLeft.second === 0) ? `> ${trade.timeLeft.hoursPerSeason} hours` : ""}</Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Button minW={['0px', '0px', '0px', '0px', '384px']} maxW={['500px', '500px', '500px', '500px', '30vw']} onClick={() => {claimTrade(trade.tradeid, value.message)}} my={3}>{value.buttonText}</Button>
                            </Flex>
                        </ScaleFade>
                        );
                    })}
                </Stack>
            </Flex>);
        })) : <></>}

        <Modal isOpen={isOpen} onClose={onClose} size={'6xl'}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader fontWeight={'normal'}>
                    {acceptData?.complete ? 'Rewards Claimed!' : 'Returned Pins'}
                    <Divider my={2}/>
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody>                
                    <SimpleGrid columns={[2,3,4,5]} spacing={3}>
                    {acceptData?.pins.map((pin, x) => (
                        <Flex key={pin.pinImage} py={'20%'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'space-between'} alignItems={'center'} textAlign={'center'} borderRadius={'2xl'} border={'2px solid black'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px;'} maxW={'350px'} maxH={'600px'} transform={'scale(0)'} animation={`${contentTransition} 0.5s ease-out ${((x/2)+0.5)}s 1 forwards`}>                                                                                            
                            <Image borderRadius={'xl'} src={`${cdn}/image/${pin.pinImage}`} loading={'eager'}/>
                            <Text  fontSize={'2xl'} className={'heading-2xl'} mt={1}>{`${pin.amount}x`}</Text>
                        </Flex>
                    ))}
                    </SimpleGrid>
                    <Flex justifyContent={'center'}>
                        <Link p={3} borderRadius={'lg'} my={5} bgColor={'#a9e8da'} fontSize={'lg'} href={`/collection`} className={'heading-md'}>View Collection <ExternalLinkIcon mx={'2px'}/></Link>
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
