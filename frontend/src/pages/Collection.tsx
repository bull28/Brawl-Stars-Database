import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Center, Flex, HStack, Icon, Image, Link, SimpleGrid, Spinner, Tag, Text, VStack } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { CollectionData } from '../types/CollectionData'
import { RiLock2Line } from 'react-icons/ri'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useSearchParams } from 'react-router-dom'


export default function Collection() {
    const [data, setData] = useState<CollectionData>()
    const [loaded, updateLoaded] = useState<any>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [brawlers, setBrawlers] = useState<any>([])

    const getBrawlers = () => {
        data?.collection.forEach(element => {
            setBrawlers((brawlers: any) => [...brawlers, element.name])
        })
    }

    useEffect(() => {
        axios.post('/collection', {token: localStorage.getItem('token')})
            .then((res) => {
                setData(res.data)
            })
            //add error codes
    }, [])

    useEffect(() => {
        getBrawlers()
    }, [data])

    const AddLoadedBrawler = (brawler: string) => {
        if (loaded && !loaded.includes(brawler)) {
            updateLoaded((loaded: any) => [...loaded, brawler])
        }
    }


    return (
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
            <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'}>Collection</Text>
            {(brawlers.length > 0) && <Accordion defaultIndex={[brawlers.indexOf(searchParams.get('brawler'))]} allowMultiple allowToggle>
            <SimpleGrid columns={[1,2,3,4]} spacing={3} w={'95vw'} bgColor={'blue.800'} p={5}>
                {data?.collection.map((brawler) => (
                    <AccordionItem border={'3px solid black'}>
                        {({ isExpanded }) => (
                        <>
                        <h2 id={brawler.name}>
                            <AccordionButton bgColor={brawler.rarityColor}>
                                <Flex flexDir={'column'} mr={5} justifyContent={'center'} alignItems={'center'} textAlign={'center'} w={'100%'} >
                                    <Flex alignItems={'center'}>
                                        <Text fontSize={'xl'} className={'heading-xl'} color={'white'} mr={1}>{brawler.displayName}</Text>
                                        <RiLock2Line fontSize={'20px'}/>
                                    </Flex>
                                    <HStack spacing={5} my={3}>
                                        <Image src={`/image/${brawler.i}`} maxW={'64px'} fallback={<Spinner/>}/>
                                        
                                        <Text color={(brawler.unlockedPins !== brawler.totalPins) ? 'white' : 'gold'} fontSize={'md'} className={'heading-md'}>{`${brawler.unlockedPins}/${brawler.totalPins} Unlocked`}</Text>

                                        <AccordionIcon/>
                                    </HStack>
                                </Flex>
                                
                            </AccordionButton>      
                        </h2>
                        <AccordionPanel>
                            {(isExpanded || loaded?.includes(brawler.name) ) && <>

                            <HStack overflowX={'scroll'} sx={{
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
                                    <Image w={'80px'} filter={'grayscale(70%)'} src={`/image/${brawler.pinFilePath+pin.i}`} fallback={<Spinner/>}/>
                                ))}
                                
                             
                            </HStack>
                            {AddLoadedBrawler(brawler.name)}</>}
                            <Center flexDir={'column'} mt={3}>
                                {!brawler.u && <Tag colorScheme={'red'}>Unlock This Brawler To Collect Pins</Tag>}
                                <Link href={`/brawlers/${brawler.name}`} color={'white'} className={'heading-sm'}>View Brawler Page <ExternalLinkIcon mx={'2px'}/></Link>
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