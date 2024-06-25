import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Center, Flex, HStack, Icon, Image, Link, SimpleGrid, Stack, Tag, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { CollectionData } from '../types/CollectionData'
import { RiLock2Line } from 'react-icons/ri'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useSearchParams } from 'react-router-dom'
import { BrawlBoxData } from '../types/BrawlBoxData'
import BrawlBoxDisplay from '../components/BrawlBoxDisplay'
import TokenDisplay from '../components/TokenDisplay'
import AuthRequest from '../helpers/AuthRequest'
import { RainbowBackground, RainbowBorder } from '../themes/animations'
import MovingText from '../components/MovingText'
import {UserInfoProps} from '../types/AccountData'
import {scrollStyle} from "../themes/scrollbar";
import BackButton from '../components/BackButton'
import cdn from "../helpers/CDNRoute";

export default function Collection() {
    const [data, setData] = useState<CollectionData>()
    const [brawlBoxData, setBrawlBoxData] = useState<BrawlBoxData[]>()
    const [searchParams] = useSearchParams()
    const [tokens, setTokens] = useState<number>(0)

    const setAllResources = useCallback((data: UserInfoProps) => {
        setTokens(data.tokens);
    }, []);

    const updateTokens = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setAllResources}, false);
    }, [setAllResources]);

    const loadResources = useCallback(() => {
        AuthRequest<CollectionData>("/collection", {setState: setData, navigate: true}, false);
        AuthRequest<BrawlBoxData[]>("/brawlbox", {setState: setBrawlBoxData}, false);
        updateTokens();
    }, [updateTokens]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    return (
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} overflowX={'hidden'}>
            <BackButton/>
            <Text fontSize={'4xl'} className={'heading-4xl'}>Collection</Text>
            {localStorage.getItem('username') && 
                <Flex mt={10} justifyContent={'center'}>
                    <Stack w={'95%'} spacing={'5'} direction={['column', 'column', 'column', 'row']} alignItems={'center'}>
                    <Flex justifyContent={'center'} textAlign={'center'} alignItems={'center'} p={3} borderRadius={'lg'} flexDir={'column'}>
                        <Text fontSize={'2xl'} className={'heading-2xl'}  mb={3}>Collection Score</Text>
                        <Flex animation={(data?.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} bgColor={(data?.avatarColor === 'rainbow') ? 'black' : data?.avatarColor} flexDir={'column'} p={10}  border={'3px solid black'} mb={5}>
                            {data !== void 0 ?
                                <>
                                {(data.collectionScore === 'S+') ?
                                    <MovingText title={data.collectionScore || ""} color1="#fdf542" color2="#ff9005" fontSize={'2xl'}/>
                                    :
                                    <Text  className={'heading-2xl'} fontSize={'2xl'}>{data.collectionScore}</Text>
                                }
                                <Tooltip label={`${data.scoreProgress && (data.scoreProgress * 100).toFixed(1)}% to next letter grade`}>
                                    <Box py={2} mt={1} mb={5}>
                                        <Box w={'100%'} h={'6px'} bgColor={'white'} borderRadius={'sm'}>
                                            <Box borderRadius={'sm'} h={'6px'} w={`${data.scoreProgress * 100}%`} animation={(data.avatarColor === 'rainbow') ? `${RainbowBackground()} 12s infinite` : ''} bgColor={'blue.400'}></Box>                            
                                        </Box>
                                    </Box>
                                </Tooltip>
                                <VStack spacing={1}>
                                    <Text className={'heading-md'}  fontSize={'md'}>Brawlers Unlocked:</Text>
                                    {(data.unlockedBrawlers >= data.totalBrawlers) ?
                                        <MovingText title={`${data.unlockedBrawlers}/${data.totalBrawlers}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                        :
                                        <Text fontSize={'lg'} className={'heading-lg'} color={'white'} >{`${data.unlockedBrawlers}/${data.totalBrawlers}`}</Text>
                                    }
                                    <Text className={'heading-md'} fontSize={'md'}>Unique Pins Unlocked:</Text>
                                    {(data.unlockedPins >= data.totalPins) ?
                                        <MovingText title={`${data.unlockedPins}/${data.totalPins}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                        :
                                        <Text fontSize={'lg'} className={'heading-lg'} color={'white'} >{`${data.unlockedPins}/${data.totalPins}`}</Text>
                                    }
                                    <Text className={'heading-md'} fontSize={'md'}>Completed Brawlers:</Text>
                                    {(data.completedBrawlers >= data.totalBrawlers) ?
                                        <MovingText title={`${data.completedBrawlers}/${data.totalBrawlers}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                        :
                                        <Text fontSize={'lg'} className={'heading-lg'} color={'white'} >{`${data.completedBrawlers}/${data.totalBrawlers}`}</Text>
                                    }
                                    <Text className={'heading-md'} fontSize={'md'}>Total Pins:</Text>
                                    {(data.unlockedPins >= data.totalPins) ?
                                        <MovingText title={data.pinCopies.toString()} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                        :
                                        <Text fontSize={'lg'} className={'heading-lg'} color={'white'}>{data.pinCopies}</Text>
                                    }
                                    <Text className={'heading-md'} fontSize={'md'}>Accessories Unlocked:</Text>
                                    {(data.unlockedAccessories >= data.totalAccessories && data.unlockedAccessories > 0) ?
                                        <MovingText title={`${data.unlockedAccessories}/${data.totalAccessories}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                        :
                                        <Text fontSize={'lg'} className={'heading-lg'} color={'white'}>{`${data.unlockedAccessories}/${data.totalAccessories}`}</Text>
                                    }
                                </VStack>
                                </>
                                :
                                <></>
                            }
                        </Flex>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Text className={'heading-2xl'} fontSize={'2xl'} mb={3}>Brawl Boxes</Text>
                        <HStack bgColor={'blue.800'} p={[2, 4, 5, 5, 5]} mx={10} justifyContent={'center'} maxW={'960px'} wrap={['wrap', 'wrap', 'nowrap', 'nowrap', 'nowrap']}>
                        {brawlBoxData?.map((brawlBox: BrawlBoxData) => (
                            <Flex key={brawlBox.name}>
                                <BrawlBoxDisplay data={brawlBox} tokens={tokens} loadResources={loadResources}/>
                            </Flex>
                        ))}
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Text className={'heading-2xl'} fontSize={'2xl'} mb={3}>Tokens</Text>
                        <TokenDisplay callback={updateTokens} tokens={tokens}/>
                    </Flex>
                    </Stack>
                </Flex>
            }
            <Text fontSize={'3xl'} className={'heading-3xl'} my={10}>Brawlers and Pins</Text>
            {(data !== void 0 && data.brawlers.length > 0) &&
            <Accordion defaultIndex={[data.brawlers.findIndex((value) => value.name === searchParams.get('brawler'))]} allowMultiple={true} >
                <SimpleGrid columns={[1, 1, 2, 3, 4]} spacing={3} w={'80vw'} bgColor={'blue.800'} p={5} mb={10}>
                    {data && data.brawlers.map((brawler) => (
                        <AccordionItem key={brawler.name} borderTopWidth={'0px'} _last={{borderBottomWidth: undefined}} border={brawler.unlockedPins === brawler.totalPins ? '3px solid #e7a210' : '3px solid black'}>
                        {({ isExpanded }) => (
                            <>
                            <h2 id={brawler.name}>
                                <AccordionButton bgColor={brawler.rarityColor}>
                                    <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} w={'100%'}>
                                        <Flex alignItems={'center'}>
                                            <Text fontSize={'2xl'} className={'heading-2xl'}>{brawler.displayName}</Text>    
                                        </Flex>
                                        <HStack spacing={5} my={3} wrap={['wrap', 'nowrap', 'nowrap', 'nowrap', 'nowrap']} justifyContent={'center'}>
                                            <Box pos={'relative'}>
                                                <Image filter={!brawler.u ? 'blur(1px)' : 'none'} src={`${cdn}/image/${brawler.i}`} maxW={'64px'} borderRadius={'lg'}/>
                                                {!brawler.u && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                                                {(!brawler.u) && <Icon as={RiLock2Line} pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                                            </Box>
                                            
                                            <Text color={(brawler.unlockedPins !== brawler.totalPins) ? 'white' : 'gold'} fontSize={'md'} className={'heading-md'}>{`${brawler.unlockedPins}/${brawler.totalPins} Unlocked`}</Text>
                                            <AccordionIcon/>
                                        </HStack>
                                    </Flex>
                                </AccordionButton>
                            </h2>
                            <AccordionPanel>
                                {(isExpanded) && <>
                                    <HStack overflowX={'scroll'} spacing={3} sx={scrollStyle}> 
                                        {brawler.pins.map((pin) => (
                                                <Box key={brawler.name + pin.i} minW={'100px'} bgColor={Object.values(data?.pinRarityColors || {})[pin.r]} p={3} borderRadius={'md'} border={'2px solid black'}>
                                                    <Image w={'100px'} filter={(pin.a === 0) ? 'grayscale(100%)': 'none'} src={`${cdn}/image/${brawler.pinFilePath+pin.i}`}/>
                                                    <Text my={1} color={(pin.a === 0) ? 'gray' : 'white'} fontSize={'lg'} className={'heading-lg'}>{`${pin.a}x`}</Text>
                                                </Box>
                                        ))}
                                    </HStack>
                                </>}
                                <Center flexDir={'column'} mt={3}>
                                    {!brawler.u && <Tooltip label={'Unlock By Opening Boxes'}><Tag colorScheme={'red'} my={2}>Unlock This Brawler To Collect Pins</Tag></Tooltip>}
                                    <Text mb={'30px'}  className={'heading-sm'}>{`Total ${brawler.displayName} Pins: ${brawler.pinCopies}`}</Text>
                                    <Link href={`/brawlers/${brawler.name}`}  className={'heading-sm'}>View Brawler Page <ExternalLinkIcon mx={'2px'}/></Link>
                                </Center>
                            </AccordionPanel>
                            </>
                        )}
                        </AccordionItem>
                    ))}
                </SimpleGrid>
            </Accordion>
            }
            <Text fontSize={'3xl'} className={'heading-3xl'} my={10}>Accessories</Text>
            <SimpleGrid columns={[1, 1, 2, 3, 4]} spacing={3} w={'80vw'} bgColor={'blue.800'} p={5} mb={10}>
                {data && data.accessories.map((accessory) => (
                    <Flex key={accessory.displayName + accessory.image} bgColor={accessory.unlocked ? '#a248ff' : '#512480'} flexDir={'column'} alignItems={'center'} border={accessory.unlocked === true ? '3px solid #e7a210' : '3px solid black'}>
                        <Text fontSize={['lg', 'xl', '2xl', '2xl', '2xl']} className={'heading-2xl'}>{accessory.displayName}</Text>
                        <Box pos={'relative'} maxW={'40%'} m={2}>
                            <Image filter={accessory.unlocked === true ? 'drop-shadow(0 0 2rem rgb(255, 255, 255));' : ''} src={`${cdn}/image/${accessory.image}`}/>
                            {accessory.unlocked === false && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                            {accessory.unlocked === false && <Icon as={RiLock2Line} pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                        </Box>
                        <Text fontSize={['sm', 'md', 'md', 'md', 'md']} className={'heading-md'} mb={1} alignItems={'center'}>{accessory.unlocked === true ? 'Unlocked' : 'Not Unlocked'}</Text>
                    </Flex>
                ))}
            </SimpleGrid>
        </Flex>
    )
}