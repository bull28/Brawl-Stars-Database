import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Center, Flex, HStack, Icon, Image, Link, SimpleGrid, Spinner, Stack, Tag, Text, Tooltip, VStack } from '@chakra-ui/react'
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
import SkullBackground from '../components/SkullBackground'
import AccessoryLevel from "../components/AccessoryLevel";
import {UserInfoProps} from '../types/AccountData'

export default function Collection() {
    const [data, setData] = useState<CollectionData>()
    const [brawlBoxData, setBrawlBoxData] = useState<BrawlBoxData[]>()
    const [searchParams] = useSearchParams()
    const [tokens, setTokens] = useState<number>(0)
    const [level, setLevel] = useState<number>(1)
    const [points, setPoints] = useState<number>(0)
    const [upgradePoints, setUpgradePoints] = useState<number>(1)

    const setAllResources = useCallback((data: UserInfoProps) => {
        setTokens(data.tokens);
        setLevel(data.level);
        setPoints(data.points);
        setUpgradePoints(data.upgradePoints);
    }, []);

    const updateTokens = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setAllResources});
    }, [setAllResources]);

    const loadResources = useCallback(() => {
        AuthRequest<CollectionData>("/collection", {setState: setData, navigate: true});
        AuthRequest<BrawlBoxData[]>("/brawlbox", {setState: setBrawlBoxData});
        updateTokens();
    }, [updateTokens]);

    useEffect(() => {
        loadResources();
    }, [loadResources])

    return (
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} overflowX={'hidden'}>            
            <SkullBackground/>
            <Text fontSize={'4xl'} className={'heading-4xl'} >Collection</Text>
            {localStorage.getItem('username') && 
                <Flex mt={10} justifyContent={'center'}>
                    <Stack w={'95%'} spacing={'5'} direction={['column', 'column', 'column', 'row']} alignItems={'center'}>
                    <Flex justifyContent={'center'} textAlign={'center'} alignItems={'center'} p={3} borderRadius={'lg'} flexDir={'column'}>
                        <Text fontSize={'2xl'} className={'heading-2xl'}  mb={3}>Collection Score</Text>
                        <Flex animation={(data?.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} bgColor={(data?.avatarColor === 'rainbow') ? 'black' : data?.avatarColor} flexDir={'column'} p={10}  border={'3px solid black'} mb={5}>
                            {(data?.collectionScore !== 'S+') ?
                                <Text  className={'heading-2xl'} fontSize={'2xl'}>{data?.collectionScore}</Text>
                                :
                            <MovingText title={data?.collectionScore || ""} color1="#fdf542" color2="#ff9005" fontSize={'2xl'}/>
                            }
                            
                            <Tooltip label={`${data?.scoreProgress && (data?.scoreProgress * 100).toFixed(1)}% to next letter grade`}>
                                <Box py={2} mt={1} mb={5}>
                                    <Box w={'100%'} h={'6px'} bgColor={'white'} borderRadius={'sm'}>
                                        <Box borderRadius={'sm'} h={'6px'} w={data ? `${data?.scoreProgress * 100}%` : '0%'} animation={(data?.avatarColor === 'rainbow') ? `${RainbowBackground()} 12s infinite` : ''} bgColor={'blue.400'}></Box>                            
                                    </Box>
                                </Box>
                            </Tooltip>
                            
                            <VStack spacing={1}>                          
                                <Text  className={'heading-md'}  fontSize={'md'}>Brawlers Unlocked: </Text>
                                {(data?.unlockedBrawlers !== data?.totalBrawlers) ?
                                    <Text fontSize={'lg'} className={'heading-lg'} color={(data && data?.unlockedBrawlers === data?.totalBrawlers) ? 'gold' : 'white'} >{`${data?.unlockedBrawlers ? data.unlockedBrawlers : '0'}/${data?.totalBrawlers ? data.totalBrawlers : '0'}`}</Text>
                                    :
                                    <MovingText title={`${data?.unlockedBrawlers ? data.unlockedBrawlers : '0'}/${data?.totalBrawlers ? data.totalBrawlers : '0'}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                }
                                <Text  className={'heading-md'} fontSize={'md'}>Unique Pins Unlocked:  </Text>
                                {(data?.unlockedPins !== data?.totalPins) ?
                                    <Text fontSize={'lg'} className={'heading-lg'} color={(data && data?.unlockedPins === data?.totalPins) ? 'gold' : 'white'} >{`${data?.unlockedPins ? data.unlockedPins : '0'}/${data?.totalPins ? data.totalPins : '0'}`}</Text>
                                    :
                                    <MovingText title={`${data?.unlockedPins ? data.unlockedPins : '0'}/${data?.totalPins ? data.totalPins : '0'}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                }
                                <Text  className={'heading-md'} fontSize={'md'}>Completed Brawlers:  </Text>
                                {(data?.completedBrawlers !== data?.totalBrawlers) ?
                                    <Text fontSize={'lg'} className={'heading-lg'} color={(data && data?.completedBrawlers === data?.totalBrawlers) ? 'gold' : 'white'} >{`${data?.completedBrawlers ? data.completedBrawlers : '0'}/${data?.totalBrawlers ? data.totalBrawlers : '0'}`}</Text>
                                    :
                                    <MovingText title={`${data?.completedBrawlers ? data.completedBrawlers : '0'}/${data?.totalBrawlers ? data.totalBrawlers : '0'}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                }
                                <Text  className={'heading-md'} fontSize={'md'}>Total Pins: </Text>
                                {(data?.unlockedPins !== data?.totalPins) ?
                                    <Text fontSize={'lg'} className={'heading-lg'} color={(data && data?.unlockedPins === data?.totalPins) ? 'gold' : 'white'}>{data?.pinCopies ? data.pinCopies : '0'}</Text>
                                    :
                                    <MovingText title={data?.pinCopies ? String(data.pinCopies) : '0'} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                }
                                <Text  className={'heading-md'} fontSize={'md'}>Accessories Unlocked: </Text>
                                {(data?.unlockedAccessories !== data?.totalAccessories) ?
                                    <Text fontSize={'lg'} className={'heading-lg'} color={(data && data?.unlockedAccessories === data?.totalAccessories) ? 'gold' : 'white'}>{`${data?.unlockedAccessories ? data.unlockedAccessories : '0'}/${data?.totalAccessories ? data.totalAccessories : '1'}`}</Text>
                                    :
                                    <MovingText title={`${data?.unlockedAccessories ? data.unlockedAccessories : '0'}/${data?.totalAccessories ? data.totalAccessories : '1'}`} color1="#fdf542" color2="#ff9005" fontSize={'lg'}/>
                                }
                            </VStack>
                        </Flex>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Text  className={'heading-2xl'} fontSize={'2xl'} mb={3}>Brawl Boxes</Text>
                        <HStack bgColor={'blue.800'} p={5} mx={10} maxW={'50vw'}>
                        {brawlBoxData?.map((brawlBox: BrawlBoxData) => (
                            <Flex key={brawlBox.name}>
                                <BrawlBoxDisplay data={brawlBox} tokens={tokens} loadResources={loadResources}/>
                            </Flex>
                        ))}
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Text  className={'heading-2xl'} fontSize={'2xl'} mb={3}>Tokens</Text>                    
                        <TokenDisplay callback={updateTokens} tokens={tokens}/>
                    </Flex>
                    </Stack>
                </Flex>
            }
            <Text fontSize={'3xl'} className={'heading-3xl'} my={10}>Brawlers and Pins</Text>
            {(typeof data !== "undefined" && data.brawlers.length > 0) && <Accordion defaultIndex={[data.brawlers.findIndex((value) => value.name === searchParams.get('brawler'))]} allowMultiple>
            <SimpleGrid columns={[1,2,3,4]} spacing={3} w={'80vw'} bgColor={'blue.800'} p={5} mb={10}>
                {data && data.brawlers.map((brawler) => (
                    <AccordionItem key={brawler.name} border={brawler.unlockedPins === brawler.totalPins ? '3px solid #e7a210' : '3px solid black'}>
                        {({ isExpanded }) => (
                        <>
                        <h2 id={brawler.name}>
                            <AccordionButton bgColor={brawler.rarityColor}>
                                <Flex flexDir={'column'} mr={5} justifyContent={'center'} alignItems={'center'} textAlign={'center'} w={'100%'} >
                                    <Flex alignItems={'center'}>
                                        <Text fontSize={'2xl'} className={'heading-3xl'}  mr={1}>{brawler.displayName}</Text>    
                                    </Flex>
                                    <HStack spacing={5} my={3}>
                                        <Box pos={'relative'}>
                                            <Image filter={!brawler.u ? 'blur(1px)' : 'none'} src={`/image/${brawler.i}`} maxW={'64px'} borderRadius={'lg'} fallback={<Spinner/>}/>
                                            {!brawler.u && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                                            {(!brawler.u) && <Icon as={RiLock2Line}  pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                                        </Box>
                                        
                                        <Text color={(brawler.unlockedPins !== brawler.totalPins) ? 'white' : 'gold'} fontSize={'md'} className={'heading-md'}>{`${brawler.unlockedPins}/${brawler.totalPins} Unlocked`}</Text>

                                        <AccordionIcon/>
                                    </HStack>
                                </Flex>
                                
                            </AccordionButton>      
                        </h2>
                        <AccordionPanel>
                            {(isExpanded) && <>

                            <HStack overflowX={'scroll'} spacing={3} sx={{
                        '&::-webkit-scrollbar': {
                        height: '12px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.5)`,
                        borderRadius: `6px`,
                        },
                    }}> 
                                {brawler.pins.map((pin) => (                                        
                                        <Box key={brawler.name + pin.i} minW={'100px'} bgColor={Object.values(data?.pinRarityColors || {})[pin.r]} p={3} borderRadius={'md'} border={'2px solid black'}>
                                            <Image w={'100px'} filter={(pin.a === 0) ? 'grayscale(100%)': 'none'} src={`/image/${brawler.pinFilePath+pin.i}`}/>                            
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
            </Accordion>}
            <Text fontSize={'3xl'} className={'heading-3xl'} my={10}>Accessories</Text>
            <Flex mb={10}>
                <AccessoryLevel level={level} points={points} upgradePoints={upgradePoints}/>
            </Flex>
            <SimpleGrid columns={[1,2,3,4]} spacing={3} w={'80vw'} bgColor={'blue.800'} p={5} mb={10}>
                {data && data.accessories.sort((a, b) => a.unlockLevel - b.unlockLevel).map((accessory) => (
                    <Flex key={accessory.displayName + accessory.image} bgColor={level >= accessory.unlockLevel ? '#a248ff' : '#512480'} flexDir={'column'} alignItems={'center'} border={accessory.unlocked === true ? '3px solid #e7a210' : '3px solid black'}>
                        <Text fontSize={'2xl'} className={'heading-2xl'}>{accessory.displayName}</Text>
                        <Box pos={'relative'} maxW={'40%'} m={2}>
                            <Image filter={accessory.unlocked === true ? 'drop-shadow(0 0 2rem rgb(255, 255, 255));' : ''} src={`/image/${accessory.image}`}/>
                            {accessory.unlocked === false && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                            {accessory.unlocked === false && <Icon as={RiLock2Line}  pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                        </Box>
                        <Text fontSize={'md'} className={'heading-md'} mb={1} alignItems={'center'}>{accessory.unlocked === true ? 'Unlocked' : ((level < accessory.unlockLevel) ? `Requires Level ${accessory.unlockLevel}` : accessory.unlockMethod)}</Text>
                    </Flex>
                ))}
            </SimpleGrid>
        </Flex>
    )
}