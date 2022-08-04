import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Center, Flex, HStack, Icon, Image, Link, SimpleGrid, Spinner, Tag, Text, Tooltip } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { CollectionData } from '../types/CollectionData'
import { RiLock2Line } from 'react-icons/ri'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'


export default function Collection() {
    const [data, setData] = useState<CollectionData>()
    const [loaded, updateLoaded] = useState<any>([])
    const [searchParams] = useSearchParams()
    const [brawlers, setBrawlers] = useState<any>([])
    const navigate = useNavigate()


    useEffect(() => {
        axios.post('/collection', {token: localStorage.getItem('token')})
            .then((res) => {
                setData(res.data)
            }).catch(function(error) {
                if (error.response.status === 400 || error.response.status === 401){
                    localStorage.removeItem('token')
                    navigate('/login')
                }
            })
            //add error codes
    }, [navigate])

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


    return (
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
            <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'}>Collection</Text>
            {(brawlers.length > 0) && <Accordion defaultIndex={[brawlers.indexOf(searchParams.get('brawler'))]} allowMultiple allowToggle>
            <SimpleGrid columns={[1,2,3,4]} spacing={3} w={'95vw'} bgColor={'blue.800'} p={5}>
                {data?.collection.map((brawler) => (
                    <AccordionItem border={brawler.unlockedPins === brawler.totalPins ? '2px solid #E7A210' : '3px solid black'}>
                        {({ isExpanded }) => (
                        <>
                        <h2 id={brawler.name}>
                            <AccordionButton bgColor={brawler.rarityColor}>
                                <Flex flexDir={'column'} mr={5} justifyContent={'center'} alignItems={'center'} textAlign={'center'} w={'100%'} >
                                    <Flex alignItems={'center'}>
                                        <Text fontSize={'2xl'} className={'heading-3xl'} color={'white'} mr={1}>{brawler.displayName}</Text>    
                                    </Flex>
                                    <HStack spacing={5} my={3}>
                                        <Box pos={'relative'}>
                                            <Image filter={!brawler.u ? 'blur(1px)' : 'none'} src={`/image/${brawler.i}`} maxW={'64px'} borderRadius={'lg'} fallback={<Spinner/>}/>
                                            {!brawler.u && <Box w={'100%'} h={'100%'} bgColor={'rgba(0, 0, 0, 0.5)'} pos={'absolute'} top={0} borderRadius={'lg'}/>}
                                            {(!brawler.u) && <Icon as={RiLock2Line} color={'white'} pos={'absolute'} fontSize={'25px'} top={'50%'} left={'50%'} transform={'translate(-50%, -50%)'}></Icon>}
                                        </Box>
                                        
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
                                    <Image w={'80px'} filter={(!pin.u) ? 'grayscale(100%)': 'none'} src={`/image/${brawler.pinFilePath+pin.i}`} fallback={<Spinner/>}/>
                                ))}
                            </HStack>
                            {AddLoadedBrawler(brawler.name)}</>}
                            <Center flexDir={'column'} mt={3}>
                                {!brawler.u && <Tooltip label={'Unlock By Opening Boxes'}><Tag colorScheme={'red'} my={2}>Unlock This Brawler To Collect Pins</Tag></Tooltip>}
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