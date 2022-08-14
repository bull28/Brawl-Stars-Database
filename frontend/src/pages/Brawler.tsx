import { Suspense, useEffect, useState } from 'react'
import { Flex, Text, SimpleGrid, Image, Icon, Link, Spinner } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import SkinView from '../components/SkinView'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { BrawlerData } from '../types/BrawlerData'
import ModelViewer from '../components/3D_Model_Viewer'


export default function Brawler() {
    const params = useParams()
    const [data, setData] = useState<BrawlerData>()
    const [model, setModel] = useState<string | null>(null)


    useEffect(() => {
        axios.get(`/brawler/${params.brawler}`)
            .then((res) => {
                setData(res.data)
                setModel(`/image/${res.data.model}`)
            })
    }, [params])
  return (
    <>
    {data && Object.keys(data).length !== 0 && 
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} textAlign={'center'} alignItems={'center'} bgColor={data.rarity.color}>
            <Link position={'absolute'} left={'10'} top={'5'} href={'/brawlers'}><Icon as={ArrowBackIcon} fontSize={'3xl'} color={'white'}/></Link>
            <Flex w={'100%'} justifyContent={'center'} mt={3} mb={5}>
                <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'}>{data.displayName}</Text>
            </Flex>
                
            <Flex flexDir={'row'} h={'60vh'} w={'100%'} alignItems={'center'} justifyContent={'space-around'} mb={5}>
                
                <Flex flexDir={'column'} textAlign={'center'} h={'100%'} justifyContent={'center'} alignItems={'center'} w={'33%'}>
                    <Image src={'/image/'+data.image} borderRadius={'sm'} fallback={<Spinner/>} objectFit={'contain'} h={'60%'} border={'8px solid black'} mb={3}/>                
                    <Text w={'60%'} color={'white'} fontSize={['x-small', 'sm', 'md']} className={'heading-md'}>{data.description}</Text>
                </Flex>

                <Flex justifyContent={'center'} alignItems={'center'} h={'100%'} w={'33%'} bgImage={"/image/misc/bg_3d_model.webp"} backgroundPosition={"center"} backgroundSize={"cover"} backgroundRepeat={"no-repeat"} border={'3px solid white'}>
                    <Suspense fallback={<Spinner/>}>
                        {model && <ModelViewer scale={1.0} modelPath={model} position={[0, 0, 0]}/>}
                    </Suspense>
                </Flex>

                <Flex w={'33%'} flexDir={'column'} justifyContent={'center'} alignItems={'center'} maxH={'60vh'}>
                    <Text color={'white'} fontSize={'2xl'} className={'heading-2xl'}>Pins</Text>
                    <SimpleGrid columns={[1,2,2,3,3,4]} spacing={3} bgColor={'black'} p={3} borderRadius={'md'} w={'90%'} border={'1px solid rgba(255,255,255,0.8)'} overflowY={'scroll'} sx={{
                        '&::-webkit-scrollbar': {
                        width: '10px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(255, 255, 255, 0.5)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(255, 255, 255, 1)`,
                        borderRadius: `6px`,
                        },
                    }}>
                        {data.pins.map((pin) => (
                            <Flex bgColor={pin.rarity.color} borderRadius={'lg'} p={1} key={pin.image} border={'1px solid rgba(255,255,255,0.5)'}>
                                <Image src={`/image/${pin.image}`} fallback={<Spinner/>}/>
                            </Flex>
                        ))}
                    </SimpleGrid>
                    {localStorage.getItem('username') ? 
                        <Link href={`/collection?brawler=${data.name}`} color={'white'} fontSize={'lg'} className={'heading-xs'}>{`View ${data.displayName} Collection `}<ExternalLinkIcon mx={'2px'}/></Link>
                            :
                        <Text color={'white'} fontSize={'lg'} ><Link color={'blue.400'} href="/login">Log In</Link> To View Collection</Text>
                    }
                </Flex>
            </Flex>
            
            <SimpleGrid spacing={5} columns={[1,2,2,3,4]} bgColor={'blue.900'} pt={5} px={6}>{(data.skins).map((skin) => (
                <Flex key={skin.name} flexDir={'column'} m={3}>
                    <SkinView skin={skin.name} brawler={data.name} setModel={setModel}></SkinView>
                </Flex>
            ))}
            </SimpleGrid>
        </Flex>}
    </>
  )
}
