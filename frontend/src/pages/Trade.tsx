import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, Flex, FormControl, FormLabel, IconButton, Image, Input, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Select, SimpleGrid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner, Stack, Text, useDisclosure, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FilterData, TradeData } from '../types/TradeData'
import { Brawler } from '../types/BrawlerData'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, HamburgerIcon, CloseIcon, ArrowBackIcon } from '@chakra-ui/icons'
import TradeCard from '../components/TradeCard'
import { getToken } from '../helpers/AuthRequest'

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

interface PinRequest {
    amount: number,
    brawler: string,
    pin: string,
    pinImage: string,
    rarityColor: string,
    rarityValue:  number
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
    const [offer, setOffer] = useState<any>([]) //fix
    const [req, setReq] = useState<any>([]) //fix
    const [pickingBrawler, toggleScreen] = useState<boolean>(true)
    const [pinDisplayData, setPinDisplay] = useState<[PinData]>()
    const [amount, setAmount] = useState<number>(1)
    const [pinLocation, setPinLocation] = useState<"offer" | "req">("offer")

    const toast = useToast()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure()
    const { isOpen: isOpen3, onOpen: onOpen3, onClose: onClose3 } = useDisclosure()

    const updateResults = () => {
        axios.post('/trade/all', filter)
            .then((res) => {
                setResults(res.data)
            })
    }
    
    useEffect(() => {
        updateResults();
    }, [filter.page, updateResults])

    useEffect(() => {
        axios.get('/brawler')
            .then((res) => {
                setBrawlerData(res.data)
            })
    }, [])

    useEffect(() =>  {
        axios.get(`/brawler/${filter.brawler}`)
            .then((res) => {
                setPinData(res.data.pins)
            })
    }, [filter.brawler])

    const changeFilter = (query:string, value:any) => {
        updateFilter(prevState => ({
            ...prevState,
            [query]: value
        }))
    }

    const viewTrade = ( id: number ) => {
        console.log(`Viewing Trade with ID ${id}`)
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
                pin: offer[k].pin
            }
            offerObject.push(temp)
        }

        for (k in req){
            let temp;
            temp = {
                amount: req[k].amount,
                brawler: req[k].brawler,
                pin: req[k].pin
            }
            reqObject.push(temp)
        }

        axios.post('/trade/create', {
            token: getToken(),
            searchByName: true,
            offer: offerObject,
            request: reqObject
        })
        .then(() => {
            window.location.reload()
        })
        .catch(() => {
            toast({title: 'Invalid Trade Request', description: 'Make sure you have the required trade credits and pins for your trade.', status: 'error', duration: 3000, isClosable: true})
        })
    }

    const showPins = (brawler: string) => {
        axios.get(`/brawler/${brawler}`)
        .then((res) => {
            setPinDisplay(res.data.pins)
            toggleScreen(false)
        })
    }

    const addOffer = (pin: PinData) => {
        let pinName:string = pin.image.split('/')[2].split('.')[0]
        let brawlerName:string = pinName.split('_')[0]

        setAmount(1)
        setOffer((prevState: any) => ([...prevState, {amount: amount, brawler: brawlerName, pin: pinName, pinImage: pin.image, rarityColor: pin.rarity.color, rarityValue: pin.rarity.value}]))
        
        toast({title: 'Pin Added!', description: 'Pin successfully added to offer.', status: 'success', duration: 2000})
    }

    const addReq = (pin: PinData) => {
        let pinName:string = pin.image.split('/')[2].split('.')[0]
        let brawlerName:string = pinName.split('_')[0]

        setAmount(1)
        setReq((prevState: any) => ([...prevState, {amount: amount, brawler: brawlerName, pin: pinName, pinImage: pin.image, rarityColor: pin.rarity.color, rarityValue: pin.rarity.value}]))
        
        toast({title: 'Pin Added!', description: 'Pin successfully added to request.', status: 'success', duration: 2000})
    }
    

    return (
        <Flex justifyContent={'space-evenly'} alignItems={'center'} flexDir={'column'}>            
            <IconButton aria-label='open filter' as={HamburgerIcon} pos={'absolute'} top={0} left={0} m={5} onClick={onOpen}></IconButton>
            <Text mt={5} fontSize={'3xl'} className={'heading-3xl'} color={'white'}>Trades</Text>
            <Flex pos={'absolute'} top={0} right={0} m={5}>
                <Button h={'50px'} m={2} rightIcon={<AddIcon/>} colorScheme={'whatsapp'} className={'heading-md'} fontWeight={'normal'} onClick={onOpen2}>New Trade</Button>
                <Box w={'50px'} h={'50px'} bgColor={'red'} m={2}></Box>
                <Box w={'50px'} h={'50px'} bgColor={'red'} m={2}></Box>
                <Box w={'50px'} h={'50px'} bgColor={'red'} m={2}></Box>
                <Box w={'50px'} h={'50px'} bgColor={'red'} m={2}></Box>
                <Box w={'50px'} h={'50px'} bgColor={'red'} m={2}></Box>
            </Flex>       
            <Flex mt={'60px'}>
                <Drawer isOpen={isOpen} placement={'left'} onClose={onClose} colorScheme={'linkedin'}>
                    <DrawerContent bgColor={'purple.600'}>
                        <IconButton aria-label='close filter' as={CloseIcon} color={'white'} pos={'absolute'} right={0} top={0} bgColor={'transparent'} transform={'scale(50%)'} _hover={{backgroundColor: 'transparent'}} cursor={'pointer'} onClick={onClose}/>
                        <DrawerBody>
                                <FormControl h={'100%'} color={'white'}>
                                    <Flex flexDir={'column'} h={'60%'} justifyContent={'space-between'}>
                                        <Flex w={'100%'} justifyContent={'center'}>
                                            <FormLabel fontSize={'2xl'} color={'white'} className={'heading-2xl'}>
                                                Filter
                                            </FormLabel>
                                        </Flex>
                                        <Select color={'black'} value={filter.sortMethod} onChange={(e) => {changeFilter("sortMethod", e.target.value)}}>
                                            <option value='oldest'>Oldest</option>
                                            <option value='lowcost'>Cost Ascending</option>
                                            <option value='highcost'>Cost Descending</option>
                                        </Select>
                                        <FormLabel fontSize={'xl'} color={'white'} className={'heading-xl'}>
                                            Filter In
                                        </FormLabel>
                                        <RadioGroup value={String(filter.filterInRequest)} onChange={(e) => {changeFilter("filterInRequest", e === "true")}}>
                                            <Stack direction={'column'}>
                                                <Radio value='false'>Offer</Radio>
                                                <Radio value='true'>Request</Radio>
                                            </Stack>
                                        </RadioGroup>
                                        <FormLabel fontSize={'xl'} color={'white'} className={'heading-xl'}>
                                            Brawler
                                        </FormLabel>
                                        <Select color={'black'} value={filter.brawler} placeholder='Filter by brawler' onChange={(e) => {changeFilter("brawler", e.target.value); changeFilter("pin", "")}} sx={{
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
                                            {brawlerData?.map((brawler) => (
                                                <option value={brawler.name}><Text>{brawler.displayName}</Text></option>
                                            ))}
                                        </Select>
                                        <FormLabel fontSize={'xl'} color={'white'} className={'heading-xl'}>
                                            Pin
                                        </FormLabel>
                                        <Menu>
                                            <MenuButton border={'1px solid white'} borderRadius={'md'}>
                                                <Text my={2} fontSize={'xl'}>{filter.pin ? filter.pin : 'Choose Pin'}</Text>
                                            </MenuButton>
                                            <MenuList>
                                            <SimpleGrid columns={3}>
                                            {brawlerPinData?.map((pin) => (
                                                <MenuItem onClick={(e) => {changeFilter("pin", pin.image.split('/')[2].split('.')[0])}}><Image maxW={'60px'} src={`/image/${pin.image}`}></Image></MenuItem>
                                            ))}
                                            </SimpleGrid>
                                            </MenuList>
                                            
                                        </Menu>
                                        <FormLabel fontSize={'xl'} color={'white'} className={'heading-xl'}>
                                            Username
                                        </FormLabel>
                                        <Input type={'text'} value={filter.username} onChange={(e) => {changeFilter("username", e.target.value)}}/>
                                    </Flex>
                                </FormControl>                            
                        </DrawerBody>
                        <DrawerFooter>
                            <Flex flexDir={'row'} w={'100%'} justifyContent={'space-between'}>
                                <Button  colorScheme={'red'} onClick={clearFilter}>Clear Filter</Button>
                                <Button colorScheme={'facebook'} onClick={updateResults}>Update</Button>
                            </Flex>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            <SimpleGrid columns={[1,2,2,3]} spacing={3}>
                {results?.map((trade) => {
                     if (trade.creator.toLowerCase().includes(filter.username.toLowerCase())) {return <TradeCard data={trade}/>}
                    })}
            </SimpleGrid>
        </Flex>

        <Flex justifyContent={'right'} alignItems={'center'} w={'95%'} mb={5}>
            <IconButton aria-label='previous page' as={ChevronLeftIcon} onClick={previousPage}/>
            <Flex w={'50px'} bgColor={'gray.200'} h={'100%'} borderRadius={'lg'} justifyContent={'center'} alignItems={'center'}>
                <Text fontSize={'2xl'} color={'white'} className={'heading-2xl'}>{filter.page}</Text>
            </Flex>
            <IconButton aria-label='next page' as={ChevronRightIcon} onClick={nextPage}/>
        </Flex>
        <Modal isOpen={isOpen2} onClose={onClose2} size={'6xl'}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>New Trade</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                
                <Flex w={'100%'} flexDir={'row'}>
                    
                    <Flex w={'50%'} alignItems={'center'} flexDir={'column'}>
                        <Text mb={5} fontSize={'2xl'} className={'heading-2xl'} color={'white'}>You Give</Text>
                        
            
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
                        {offer?.map((pin: any) => (
                                        <Flex p={5} border={'2px solid black'} borderRadius={'lg'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {setOffer(offer.filter((item: any) => item !== pin))}}>
                                            <Image  maxW={'60px'} src={`/image/${pin.pinImage}`} fallback={<Spinner/>}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'red'}>{`- ${pin.amount}`}</Text>
                                        </Flex>
                                    ))}
                            
                        </SimpleGrid>
                        <IconButton onClick={() => {onOpen3(); setPinLocation("offer")}} colorScheme={'whatsapp'} p={2} as={AddIcon} aria-label="add pin" mt={5}/>
                    
                    </Flex>

                    <Flex w={'50%'} alignItems={'center'} flexDir={'column'}>
                        <Text mb={5} fontSize={'2xl'} className={'heading-2xl'} color={'white'}>You Receive</Text>
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
                        {req?.map((pin: any) => (
                                        <Flex p={5} border={'2px solid black'} borderRadius={'lg'} bgColor={pin.rarityColor} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {setReq(req.filter((item: any) => item !== pin))}}>
                                            <Image  maxW={'60px'} src={`/image/${pin.pinImage}`} fallback={<Spinner/>}/>
                                            <Text pos={'absolute'} className={'heading-lg'} top={0} right={1} fontSize={'lg'} color={'green'}>{`+ ${pin.amount}`}</Text>
                                        </Flex>
                                    ))}
                            
                        </SimpleGrid>
                        <IconButton onClick={() => {onOpen3(); setPinLocation('req')}} colorScheme={'whatsapp'} p={2} as={AddIcon} aria-label="add pin" mt={5}/>
                        
                    </Flex>

                
                </Flex>

                <Flex w={'100%'} flexDir={'row'} mt={5}>
                    <Box w={'50%'} h={'3px'} bgColor={'red'}></Box>
                    <Box w={'50%'} h={'3px'} bgColor={'green'}></Box>
                </Flex>

                <Modal isOpen={isOpen3} onClose={onClose3} size={'2xl'}>
                    <ModalOverlay />
                    <ModalContent>
                    <ModalHeader>Add Pin</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    {pickingBrawler ? <>
                        <SimpleGrid spacing={3} columns={[3,4,5]}>
                        {brawlerData?.map((brawler) => (
                            <Flex flexDir={'column'} alignItems={'center'}>
                                <Flex p={2} border={'2px solid black'} borderRadius={'lg'} bgColor={brawler.rarity.color} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'} onClick={() => {showPins(brawler.name)}}>
                                    <Image borderRadius={'20%'} src={`/image/${brawler.portrait}`} fallback={<Spinner/>}/>                                
                                </Flex>
                                <Text>{brawler.displayName}</Text>
                            </Flex>
                        ))}

                        </SimpleGrid>                    
                    </> : <>
                        <IconButton colorScheme={'gray'} as={ArrowBackIcon} aria-label="choose brawler" onClick={() => {toggleScreen(true)}} cursor={'pointer'}/>
                        <SimpleGrid spacing={3} columns={[3,4,5]} mt={5}>
                        {pinDisplayData?.map((pin) => (
                            <Flex flexDir={'column'} alignItems={'center'} onClick={() => {if (pinLocation === "offer"){addOffer(pin)} else {addReq(pin)}}}>
                                <Flex p={2} border={'2px solid black'} borderRadius={'lg'} bgColor={pin.rarity.color} flexDir={'column'} justifyContent={'center'} alignItems={'center'} pos={'relative'} cursor={'pointer'}>
                                    <Image borderRadius={'20%'} src={`/image/${pin.image}`} fallback={<Spinner/>}/>                                
                                </Flex>                                
                            </Flex>
                        ))}

                        </SimpleGrid>
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
                    </ModalContent>
                </Modal>

            </ModalBody>

            <ModalFooter>
                <Button colorScheme='red' fontSize={'2xl'} p={5}  mr={3} fontWeight={'normal'} onClick={onClose2}>
                Cancel
                </Button>
                <Button colorScheme={'whatsapp'} fontSize={'2xl'} p={5} fontWeight={'normal'} onClick={createTrade} rightIcon={<Image maxH={'40px'} src={'/image/resources/resource_trade_credits.webp'}/>}>69</Button>
            </ModalFooter>
            </ModalContent>
      </Modal>
    </Flex>
 
    )
}