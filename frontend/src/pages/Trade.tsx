import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, FormLabel, HStack, Icon, IconButton, Image, Input, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, ScaleFade, Select, SimpleGrid, SlideFade, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner, Stack, Text, useDisclosure, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState, useCallback } from 'react'
import { FilterData, TradeData, UserTradeData } from '../types/TradeData'
import { Brawler } from '../types/BrawlerData'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, HamburgerIcon, CloseIcon, ArrowBackIcon } from '@chakra-ui/icons'
import TradeCard from '../components/TradeCard'
import AuthRequest, { getToken } from '../helpers/AuthRequest'
import { UserInfoProps } from '../types/AccountData'
import { useNavigate } from 'react-router-dom'
import { BsPersonFill } from 'react-icons/bs'
import { CollectionData } from '../types/CollectionData'
import { RiLock2Line } from 'react-icons/ri'
import SkullBackground from '../components/SkullBackground'
import api from "../helpers/ApiRoute";

/*
    To-Do

    serach trades of specific players and trade ids

*/

interface PinData {
    image: string,
    rarity: {
        value: number,
        name: string,
        color: string
    }
}

interface TradePreview{
    amount: number;
    brawler: string;
    name: string;
    pinImage: string;
    rarityColor: string;
}

export default function Trade() {
    const [filter, updateFilter] = useState<FilterData>({
        sortMethod: "",
        page: 1,
        filterInRequest: false,
        brawler: "",
        pin: "",
        pinImage: "",
        username: ""
    }) 
    const [results, setResults] = useState<[TradeData]>()
    const [brawlerData, setBrawlerData] = useState<[Brawler]>()
    const [brawlerPinData, setPinData] = useState<[PinData]>()
    const [offer, setOffer] = useState<TradePreview[]>([]) //fix
    const [req, setReq] = useState<TradePreview[]>([]) //fix
    const [pickingBrawler, toggleScreen] = useState<boolean>(true)
    const [brawlerchoice, setBrawlerChoice] = useState<string>()
    const [amount, setAmount] = useState<number>(1)
    const [pinLocation, setPinLocation] = useState<"offer" | "req">("offer")
    const [resources, setResources] = useState<UserInfoProps>()
    const [tradeLength, setTradeLength] = useState<number>(48)
    const [tradeCost, setTradeCost] = useState<number>()
    const [collectionData, setCollectionData] = useState<CollectionData>()
    const [username, setUsername] = useState<string>()
    const [userTradeData, setUserTradeData] = useState<UserTradeData[]>()

    const toast = useToast()
    const navigate = useNavigate()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
    const { isOpen: isOpen3, onOpen: onOpen3, onClose: onClose3 } = useDisclosure()

    const updateResults = useCallback(() => {
        axios.post(`${api}/trade/all`, filter)
            .then((res) => {
                setResults(res.data)
            })
    }, [filter]);

    const setAllResources = useCallback((data: UserInfoProps) => {
        setResources(data);
        setUsername(data.username);
    }, []);

    const getCost = useCallback(() => {
        let offerObject = []
        let reqObject = []

        for (var k in offer){
            let temp;
            temp = {
                amount: offer[k].amount,
                brawler: offer[k].brawler,
                pin: offer[k].name
            }
            offerObject.push(temp)
        }

        for (k in req){
            let temp;
            temp = {
                amount: req[k].amount,
                brawler: req[k].brawler,
                pin: req[k].name
            }
            reqObject.push(temp)
        }

        if (offerObject.length > 0 || reqObject.length > 0){
            axios.post(`${api}/trade/create`, {
                token: getToken(),
                searchByName: true,
                offer: offerObject,
                request: reqObject,
                tradeDurationHours: tradeLength,
                getCost: true
            }).then((res) => {
                setTradeCost(res.data.tradeCost)
            }).catch((error) => {});
        } else {
            setTradeCost(0)
        }

    }, [offer, req, tradeLength]);

    useEffect(() => {
        
        getCost();
        
    }, [offer, req, tradeLength, getCost])

    useEffect(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setAllResources});
    }, [setAllResources])
    
    useEffect(() => {
        updateResults();
    }, [filter.page, updateResults])

    useEffect(() => {
        axios.get(`${api}/brawler`)
            .then((res) => {
                setBrawlerData(res.data)
            })
    }, [])

    useEffect(() =>  {
        axios.get(`${api}/brawler/${filter.brawler}`)
            .then((res) => {
                setPinData(res.data.pins)
            })
    }, [filter.brawler])

    useEffect(() => {
        AuthRequest<CollectionData>("/collection", {setState: setCollectionData});
    }, [])

    const getTrades = useCallback(() => {
        if (username){
            AuthRequest<UserTradeData[]>("/trade/user", {data: {username: username}, setState: setUserTradeData, fallback: () => {}});
        }
    }, [username]);

    useEffect(() => {
        getTrades();   
    }, [username, getTrades])

    const changeFilter = (query: string, value: string | number | boolean) => {
        const newFilter: FilterData = {
            sortMethod: filter.sortMethod,
            page: filter.page,
            filterInRequest: filter.filterInRequest,
            brawler: filter.brawler,
            pin: filter.pin,
            pinImage: filter.pinImage,
            username: filter.username
        };
        
        if (query === "page" && typeof value === "number"){
            newFilter.page = value;
        } else if (query === "filterInRequest" && typeof value === "boolean"){
            newFilter.filterInRequest = value;
        } else if (typeof value === "string"){
            if (query === "sortMethod"){
                newFilter.sortMethod = value;
            } else if (query === "brawler"){
                newFilter.brawler = value;
                newFilter.pin = "";
            } else if (query === "pin"){
                newFilter.pin = value;
            } else if (query === "pinImage"){
                newFilter.pinImage = value;
            } else if (query === "username"){
                newFilter.username = value;
            }
        }

        updateFilter(newFilter);
    }

    const clearFilter = () => {
        updateFilter({
            sortMethod: "",
            page: 1,
            filterInRequest: false,
            brawler: "",
            pin: "",
            pinImage: "",
            username: ""
        })
    }

    const nextPage = async () => {
        if (results && results.length > 0){ 
            changeFilter("page", filter.page + 1); 
        }
    }

    const previousPage = async () => {
        if (filter.page > 1){
            changeFilter("page", filter.page - 1)
        }
    }


    const createTrade = () => {
        let offerObject = []
        let reqObject = []

        for (var k in offer){
            let temp;
            temp = {
                amount: offer[k].amount,
                brawler: offer[k].brawler,
                pin: offer[k].name
            }
            offerObject.push(temp)
        }

        for (k in req){
            let temp;
            temp = {
                amount: req[k].amount,
                brawler: req[k].brawler,
                pin: req[k].name
            }
            reqObject.push(temp)
        }

        axios.post(`${api}/trade/create`, {
            token: getToken(),
            searchByName: true,
            offer: offerObject,
            request: reqObject,
            tradeDurationHours: tradeLength,
            getCost: false
        })
        .then(() => {
            window.location.reload()
        })
        .catch((error) => {
            toast({title: 'Invalid Trade Request', description: error.response.data, status: 'error', duration: 3000, isClosable: true})
        })
    }

    const showPins = (brawler: string) => {
        setBrawlerChoice(brawler)
        toggleScreen(false)
    }

    const addOffer = (pin: {image: string, r: number}) => {
        let pinName:string = pin.image.split('/')[2].split('.')[0]
        let brawlerName:string = pinName.split('_')[0]

        let color: string = Object.values(collectionData?.pinRarityColors || {})[pin.r]

        let duplicate:boolean = false;

        //check if pin already exists in offer

        for (let i = 0; i<offer.length; i++){
            
            if (offer[i].name === pinName){
                offer[i].amount = Math.min(offer[i].amount + amount, 1000)

                duplicate = true;

                break
            }
        }

        if (!duplicate){            
            setOffer(offer.concat({amount: amount, brawler: brawlerName, name: pinName, pinImage: pin.image, rarityColor: color}));
        }
        
        setAmount(1)
        
        toast({title: 'Pin Added!', description: 'Pin successfully added to offer.', status: 'success', duration: 2000})
    }

    const addReq = (pin: {image: string, r: number}) => {
        let pinName:string = pin.image.split('/')[2].split('.')[0]
        let brawlerName:string = pinName.split('_')[0]

        let color: string = Object.values(collectionData?.pinRarityColors || {})[pin.r]

        let duplicate:boolean = false;

         //check if pin already exists in request

         for (let i = 0; i<req.length; i++){
            
            if (req[i].name === pinName){
                req[i].amount = Math.min(req[i].amount + amount, 1000)

                duplicate = true;

                break
            }
        }

        if (!duplicate){
            setReq(req.concat({amount: amount, brawler: brawlerName, name: pinName, pinImage: pin.image, rarityColor: color}));
        }

        setAmount(1)        
        
        toast({title: 'Pin Added!', description: 'Pin successfully added to request.', status: 'success', duration: 2000})
    }

    const redirect = () => {
        navigate('/mytrades')
    }

    return (
        <Flex justifyContent={'space-evenly'} alignItems={'center'} flexDir={'column'}>      
            <SkullBackground/>
            <IconButton aria-label='open filter' as={HamburgerIcon} pos={'absolute'} top={0} left={0} m={5} mt={"69px"} onClick={onOpen}></IconButton>
            <Text fontSize={'4xl'} className={'heading-4xl'}>Trade</Text>
            <Flex pos={["relative", "relative", "relative", "relative", "absolute"]} top={0} right={0} p={2.5} m={5}>
                <Button h={'50px'} mr={3} rightIcon={<AddIcon/>} bgColor={'green.300'} className={'heading-md'} fontWeight={'normal'} onClick={onOpen2}>New Trade</Button>
                <IconButton borderRadius={'md'} onClick={redirect} cursor={'pointer'} size={'lg'} p={1} colorScheme={(userTradeData && userTradeData?.filter((trade) => trade.accepted === true).length > 0) ? 'whatsapp' : 'twitter'} icon={<BsPersonFill size={"100%"}/>} aria-label="open my trades menu"/>
                {userTradeData && (userTradeData?.filter((trade) => trade.accepted === true).length) > 0 && 
                <Box pos={'absolute'} top={0} right={0} bgColor={'red.500'} borderRadius={'50%'} w={'25px'} h={'25px'} textAlign={'center'}>
                    <Text >{userTradeData?.filter((trade) => trade.accepted === true).length}</Text>
                </Box>                            
                }
            </Flex>
            <Flex mt={3}>
                <Flex>
                    <HStack>
                        <Flex  h={'40px'} pr={'30px'} bgColor={'#f98f92'} justifyContent={'space-between'} alignItems={'center'} borderRadius={'5%'} border={'2px solid black'}>
                            <Image h={'50px'}  src={`${api}/image/resources/resource_trade_credits.webp`}/>                        
                            <Text  fontSize={'lg'} h={'30px'} className={'heading-lg'} >{resources?.tradeCredits}</Text>
                        </Flex>
                        {resources?.wildCardPins.map((wildCard) => {
                            return (
                                <Flex key={wildCard.rarityName + wildCard.rarityColor} py={'15px'} h={'50px'} px={'30px'} bgColor={wildCard.rarityColor}justifyContent={'space-around'} alignItems={'center'} borderRadius={'5%'}>
                                    <Image h={'50px'} src={`${api}/image/resources/wildcard_pin.webp`}/>                        
                                    <Text  fontSize={'lg'} className={'heading-lg'} >{wildCard.amount}</Text>
                                </Flex>    
                            );
                        })}
                    </HStack>
                </Flex>
            </Flex>       
            <Flex mt={'60px'}>
                <Drawer isOpen={isOpen} placement={'left'} onClose={onClose}>
                    <DrawerContent>
                        <IconButton aria-label='close filter' as={CloseIcon}  pos={'absolute'} right={0} top={0} bgColor={'transparent'} transform={'scale(50%)'} _hover={{backgroundColor: 'transparent'}} cursor={'pointer'} onClick={onClose}/>
                        <DrawerBody>
                                <FormControl h={'100%'} >
                                    <Flex flexDir={'column'} h={'60%'} justifyContent={'space-between'}>
                                        <Flex w={'100%'} justifyContent={'center'}>
                                            <FormLabel fontSize={'2xl'}  className={'heading-2xl'}>
                                                Filter
                                            </FormLabel>
                                        </Flex>
                                        <Select color={'#fff'} value={filter.sortMethod} onChange={(e) => {changeFilter("sortMethod", e.target.value)}}>
                                            <option value='oldest'>Oldest</option>
                                            <option value='lowcost'>Cost Ascending</option>
                                            <option value='highcost'>Cost Descending</option>
                                        </Select>
                                        <FormLabel fontSize={'xl'} className={'heading-xl'}>
                                            Filter In
                                        </FormLabel>
                                        <RadioGroup value={String(filter.filterInRequest)} onChange={(e) => {changeFilter("filterInRequest", e === "true")}}>
                                            <Stack direction={'column'}>
                                                <Radio value='false'>Offer</Radio>
                                                <Radio value='true'>Request</Radio>
                                            </Stack>
                                        </RadioGroup>
                                        <FormLabel fontSize={'xl'}  className={'heading-xl'}>
                                            Brawler
                                        </FormLabel>
                                        <Select color={'#fff'} value={filter.brawler} placeholder='Filter by brawler' onChange={(e) => {changeFilter("brawler", e.target.value);}} sx={{
                        '&::-webkit-scrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.5)`,
                        borderRadius: `6px`,
                        }
                    }}>
                                            {brawlerData?.map((brawler) => (
                                                <option key={brawler.name} value={brawler.name}>{brawler.displayName}</option>
                                            ))}
                                        </Select>
                                        <FormLabel fontSize={'xl'}  className={'heading-xl'}>
                                            Pin
                                        </FormLabel>
                                        <Menu>
                                            <MenuButton border={'1px solid white'} borderRadius={'md'}>
                                                <Text my={2} fontSize={'xl'}>{filter.pin ? filter.pin : 'Choose Pin'}</Text>
                                            </MenuButton>
                                            <MenuList>
                                            <SimpleGrid columns={3}>
                                            {brawlerPinData?.map((pin) => (
                                                <MenuItem key={pin.image} onClick={(e) => {changeFilter("pin", pin.image.split('/')[2].split('.')[0])}}><Image maxW={'60px'} src={`${api}/image/${pin.image}`}></Image></MenuItem>
                                            ))}
                                            </SimpleGrid>
                                            </MenuList>
                                            
                                        </Menu>
                                        <FormLabel fontSize={'xl'}  className={'heading-xl'}>
                                            Username
                                        </FormLabel>
                                        <Input type={'text'} value={filter.username} onChange={(e) => {changeFilter("username", e.target.value)}}/>
                                    </Flex>
                                </FormControl>                            
                        </DrawerBody>
                        <DrawerFooter>
                            <Flex flexDir={'row'} w={'100%'} justifyContent={'space-between'}>
                                <Button bgColor={'red.500'} onClick={clearFilter}>Clear Filter</Button>
                                <Button bgColor={'green.500'} onClick={updateResults}>Update</Button>
                            </Flex>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            <SimpleGrid columns={[1,1,2,3]} spacing={3}>
                {results?.filter((trade) => (trade.creator.username.toLowerCase().includes(filter.username.toLowerCase()) && !(trade.timeLeft.hour === trade.timeLeft.minute && trade.timeLeft.hour === trade.timeLeft.second && trade.timeLeft.hour === trade.timeLeft.season && trade.timeLeft.hour === 0))).map((trade) => <Flex key={trade.tradeid}><ScaleFade in={true}><TradeCard data={trade}/></ScaleFade></Flex>)}
            </SimpleGrid>
        </Flex>

        <Flex justifyContent={'right'} alignItems={'center'} w={'95%'} mb={5}>
            <IconButton aria-label='previous page' as={ChevronLeftIcon} onClick={previousPage}/>
            <Flex w={'50px'} bgColor={'gray.200'} h={'100%'} borderRadius={'lg'} justifyContent={'center'} alignItems={'center'}>
                <Text fontSize={'2xl'}  className={'heading-2xl'}>{filter.page}</Text>
            </Flex>
            <IconButton aria-label='next page' as={ChevronRightIcon} onClick={nextPage}/>
        </Flex>
        <Modal isOpen={isOpen2} onClose={onClose2} size={'6xl'}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader fontWeight={"normal"}>New Trade</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                
                <Flex w={'100%'} flexDir={'row'}>
                    
                    <Flex w={'50%'} alignItems={'center'} flexDir={'column'}>
                        <Text mb={5} fontSize={'2xl'} className={'heading-2xl'} >You Give</Text>
                        
            
                        <SimpleGrid columns={[2,3]} spacing={3} overflow={'auto'} sx={{
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
                        {offer?.map((pin) => (
                                        <Flex p={5} key={pin.name} border={'2px solid black'} borderRadius={'lg'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {setOffer(offer.filter((item) => item !== pin))}}>
                                            <Image  maxW={'60px'} src={`${api}/image/${pin.pinImage}`} fallback={<Spinner/>}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'red'}>{`- ${pin.amount}`}</Text>
                                        </Flex>
                                    ))}
                            
                        </SimpleGrid>
                        <IconButton onClick={() => {onOpen3(); setPinLocation("offer")}} p={2} as={AddIcon} aria-label="add pin" mt={5}/>
                    
                    </Flex>

                    <Flex w={'50%'} alignItems={'center'} flexDir={'column'}>
                        <Text mb={5} fontSize={'2xl'} className={'heading-2xl'} >You Receive</Text>
                        <SimpleGrid columns={[2,3]} spacing={3} overflow={'auto'} sx={{
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
                        {req?.map((pin) => (
                                        <Flex p={5} key={pin.name} border={'2px solid black'} borderRadius={'lg'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {setReq(req.filter((item) => item !== pin))}}>
                                            <Image  maxW={'60px'} src={`${api}/image/${pin.pinImage}`} fallback={<Spinner/>}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'green'}>{`+ ${pin.amount}`}</Text>
                                        </Flex>
                                    ))}
                            
                        </SimpleGrid>
                        <IconButton onClick={() => {onOpen3(); setPinLocation('req')}} p={2} as={AddIcon} aria-label="add pin" mt={5}/>
                        
                    </Flex>

                
                </Flex>

                <Flex w={'100%'} flexDir={'row'} mt={5}>
                    <Box w={'50%'} h={'3px'} bgColor={'red'}></Box>
                    <Box w={'50%'} h={'3px'} bgColor={'green'}></Box>
                </Flex>

                <Modal isOpen={isOpen3} onClose={onClose3} size={'3xl'}>
                    <ModalOverlay />
                    <ModalContent>
                    <ModalHeader fontWeight={"normal"}>Add Pin</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    {pickingBrawler ? <>
                            <SlideFade in={true}>
                                <SimpleGrid spacing={3} columns={[3,4,5]}>
                                {collectionData?.brawlers.map((brawler) => (
                                    <Flex key={brawler.name} flexDir={'column'} alignItems={'center'} userSelect={'none'}>
                                        <Flex p={1} border={'2px solid black'} borderRadius={'lg'} bgColor={brawler.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {if (brawler.u){showPins(brawler.name)}}}>
                                            <Box pos={'relative'}>
                                                <Image filter={!brawler.u ? 'blur(1px)' : 'none'} draggable={'false'} borderRadius={'20%'} src={`${api}/image/${brawler.i}`} fallback={<Spinner/>}/>                                                                                
                                            </Box>
                                            {!brawler.u && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                                            {(!brawler.u) && <Icon as={RiLock2Line}  pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                                            
                                        </Flex>
                                        <Text>{brawler.displayName}</Text>
                                    </Flex>
                                ))}

                                </SimpleGrid>               
                            </SlideFade>
                    </> : <>
                        <IconButton as={ArrowBackIcon} aria-label="choose brawler" onClick={() => {toggleScreen(true)}} cursor={'pointer'}/>
                        <ScaleFade in={true}>
                            <SimpleGrid spacing={3} columns={[3,4,5]} mt={5}>
                            {collectionData?.brawlers.filter((brawler) => brawler.name === brawlerchoice).map((brawler) => {
                                return brawler.pins.map((pin) => (
                                    <Flex key={brawler.name + pin.i} flexDir={'column'} alignItems={'center'} userSelect={'none'}>
                                        <Flex p={2} border={'2px solid black'} borderRadius={'lg'} bgColor={Object.values(collectionData?.pinRarityColors || {})[pin.r]} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {if (pinLocation === "offer"){ if (pin.a !== 0 ){addOffer({image: `${brawler.pinFilePath}${pin.i}`, r: pin.r})}} else {addReq({image: `${brawler.pinFilePath}${pin.i}`, r: pin.r})}}}>
                                            <Image draggable={'false'} borderRadius={'20%'} src={`${api}/image/${brawler.pinFilePath}${pin.i}`} fallback={<Spinner/>}/>                                                                                
                                            {(pin.a === 0 && pinLocation === "offer") && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                                            {(pin.a === 0 && pinLocation === "offer") && <Icon as={RiLock2Line}  pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}                                                
                                        </Flex>                                
                                        <Text  fontSize={'xl'} className={'heading-2xl'}>{`${pin.a}x`}</Text>
                                    </Flex>
                                ));
                            })}

                            </SimpleGrid>
                        </ScaleFade>
                        <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Slider min={1} max={10} my={5} value={amount} onChange={(val) => {setAmount(val)}}>
                            <SliderTrack bg='blue.300'>
                                <SliderFilledTrack bg='blue.700' />
                            </SliderTrack>
                            <SliderThumb bg='teal.500' />
                        </Slider>
                        <Text>{`${amount}x`}</Text>
                        </Flex>
                    </>}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose3}>Close</Button>
                    </ModalFooter>
                    </ModalContent>
                </Modal>
                <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} mt={5}>
                <Text fontSize={'xl'}  className={'heading-2xl'}>Trade Length</Text>
                
                <Slider min={1} max={336} mt={5} value={tradeLength} onChange={(val) => {setTradeLength(val)}}>
                    <SliderTrack bg='skyblue'>
                        <Box position='relative' right={10} />
                        <SliderFilledTrack bg='blue.400' />
                    </SliderTrack>
                    <SliderThumb boxSize={6} bgColor={'blue.700'}/>   
                </Slider>
                <Text fontSize={'lg'}  className={'heading-xl'}>{`${tradeLength}h`}</Text>
                </Flex>
            </ModalBody>

            <ModalFooter>
                <Button fontSize={'2xl'} p={5}  mr={3} fontWeight={'normal'} onClick={onClose2}>
                Cancel
                </Button>
                <Button fontSize={'2xl'} p={5} fontWeight={'normal'} onClick={createTrade} rightIcon={<Image maxH={'40px'} src={`${api}/image/resources/resource_trade_credits.webp`}/>}>{tradeCost}</Button>
            </ModalFooter>
            </ModalContent>
      </Modal>
    </Flex>
 
    )
}