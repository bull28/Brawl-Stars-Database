import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Center, Divider, Flex, HStack, Icon, Image, Link, SimpleGrid, Spinner, Stack, Tag, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
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


export default function Collection() {
    const [data, setData] = useState<CollectionData>()
    const [brawlBoxData, setBrawlBoxData] = useState<[BrawlBoxData]>()
    const [loaded, updateLoaded] = useState<any>([])
    const [searchParams] = useSearchParams()
    const [brawlers, setBrawlers] = useState<any>([])
    const [ tokens, setTokens ] = useState<number>()

    const loadResources = () => {
        AuthRequest('/collection', {setState: [{func: setData, attr: ""}], navigate: true})
        AuthRequest('/brawlbox', {setState: [{func: setBrawlBoxData, attr: ""}]})
        updateTokens()
    }

    useEffect(() => {
        loadResources();
    }, [])

    useEffect(() => {
        data?.collection.forEach(element => {
            setBrawlers((brawlers: any) => [...brawlers, element.name])
        })
    }, [data])

    const AddLoadedBrawler = (brawler: string) => {
        if (loaded && !loaded.includes(brawler)) {
            updateLoaded((loaded: any) => [...loaded, brawler])
        }
    }

    const updateTokens = () => {
        AuthRequest('/resources', {setState: [{func: setTokens, attr: "tokens"}]})
    }


    return (
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>            
            <SkullBackground/>
            <Text fontSize={'3xl'} className={'heading-3xl'} >Collection</Text>
            {localStorage.getItem('username') && 
                <Flex my={10} justifyContent={'center'}>
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
                            </VStack>
                        </Flex>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Text  className={'heading-2xl'} fontSize={'2xl'} mb={3}>Brawl Boxes</Text>
                        <HStack bgColor={'blue.800'} p={5} maxW={'90vw'}>
                        {brawlBoxData?.map((brawlBox: BrawlBoxData) => (
                            <BrawlBoxDisplay data={brawlBox} tokens={tokens} loadResources={loadResources}/>
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
            {(brawlers.length > 0) && <Accordion defaultIndex={[brawlers.indexOf(searchParams.get('brawler'))]} allowMultiple allowToggle>
            <SimpleGrid columns={[1,2,3,4]} spacing={3} w={'100vw'} bgColor={'blue.800'} p={5} mb={3}>
                {data?.collection.map((brawler) => (
                    <AccordionItem border={brawler.unlockedPins === brawler.totalPins ? '3px solid #E7A210' : '3px solid black'}>
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
                            {(isExpanded || loaded?.includes(brawler.name) ) && <>

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
                                        <Box minW={'100px'} bgColor={Object.values(data?.pinRarityColors || {})[pin.r]} p={3} borderRadius={'md'} border={'2px solid black'}>
                                            <Image w={'100px'} filter={(pin.a === 0) ? 'grayscale(100%)': 'none'} src={`/image/${brawler.pinFilePath+pin.i}`} fallback={<Spinner/>}/>                            
                                            <Text my={1} color={(pin.a === 0) ? 'gray' : 'white'} fontSize={'lg'} className={'heading-lg'}>{`${pin.a}x`}</Text>                                            
                                        </Box>                                                                                                                                                          
                                ))}                                
                            </HStack>
                            {AddLoadedBrawler(brawler.name)}</>}
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
        </Flex>
    )
}