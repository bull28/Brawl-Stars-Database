import { Suspense, useEffect, useState } from 'react'
import { Flex, Text, SimpleGrid, Image, Icon, Link, Spinner, Stack, keyframes } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import SkinView from '../components/SkinView'
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { BrawlerData, ModelFiles } from '../types/BrawlerData'
import AnimationViewer from '../components/AnimationViewer'
import AuthRequest from '../helpers/AuthRequest'
import {CosmeticData} from '../types/CosmeticData'
import api from "../helpers/APIRoute";

export default function Brawler() {
    const params = useParams()
    const [data, setData] = useState<BrawlerData>()
    const [model, setModel] = useState<ModelFiles>({geometry: undefined, winAnimation: undefined, loseAnimation: undefined})
    const [cosmetics, setCosmetics] = useState<CosmeticData>()
    
    useEffect(() => {
        AuthRequest<CosmeticData>("/cosmetic", {setState: setCosmetics});
    }, [])

    useEffect(() => {
        axios.get(`${api}/brawler/${params.brawler}`)
        .then((res) => {
            setData(res.data);
            axios.get(`${api}/skin/${params.brawler}/${res.data.defaultSkin}`)
            .then((skinRes) => {
                let defaultModel: ModelFiles = {
                    geometry: `${api}/image/${skinRes.data.model.geometry.path}`,
                    winAnimation: undefined,
                    loseAnimation: undefined
                };
                if (skinRes.data.model.winAnimation.exists){
                    defaultModel.winAnimation = `${api}/image/${skinRes.data.model.winAnimation.path}`;
                } if (skinRes.data.model.loseAnimation.exists){
                    defaultModel.loseAnimation = `${api}/image/${skinRes.data.model.loseAnimation.path}`;
                }
                setModel(defaultModel);
            });
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
            <Stack direction={['column', 'column', 'column', 'column', 'row']} h={['fit-content', 'fit-content', 'fit-content', 'fit-content', '60vh']} w={'100%'} alignItems={'center'} justifyContent={'space-around'} spacing={['3vh', '3vh', '3vh', '3vh', 0]} mb={5}>
                <Flex flexDir={'column'} textAlign={'center'} h={'100%'} justifyContent={'center'} alignItems={'center'} w={['100%', '80%', '69%', '50%', '33%']}>
                    <Image src={`${api}/image/${data.image}`} borderRadius={'sm'} fallback={<Spinner/>} objectFit={'contain'} h={'50%'} border={'8px solid black'} mb={7}/>
                    <Flex pos={'relative'} justifyContent={'center'}>
                        <Text pos={'absolute'} background={`linear-gradient(to left, #ffd12e, #ffdaac, #ffd12e, #f29928, #ffd12e)`} w={'120%'} backgroundClip={'text'} color={'transparent'} animation={`${keyframes`0%{background-position: 0px;} 100%{background-position: ${Math.max(1, data.title.length) * 200}px;}`} 60s linear infinite`} fontSize={'xl'} fontStyle={'italic'}>{data.title}</Text>
                        <Text color={'black'} fontSize={'xl'} fontStyle={'italic'} fontWeight={'bold'} className={`heading-xl`}>{data.title}</Text>
                    </Flex>
                    <Image src={`${api}/image/${data.masteryIcon}`} objectFit={'contain'} h={'20%'} mb={7} mt={2}/>
                    <Text w={'60%'} color={'white'} fontSize={['x-small', 'sm', 'md']} className={'heading-md'}>{data.description}</Text>
                </Flex>

                <Flex justifyContent={'center'} alignItems={'center'} h={'100%'} w={['60%', '60%', '50%', '40%', '33%']} bgColor={'#000'} backgroundPosition={'center'} backgroundSize={'cover'} backgroundRepeat={'no-repeat'} border={'3px solid white'}>
                    <Suspense fallback={<Spinner/>}>
                        {model.geometry && <AnimationViewer modelFile={model.geometry} winFile={model.winAnimation} loseFile={model.loseAnimation} bgFile={`${api}/image/${cosmetics?.scene}`}/>}
                    </Suspense>
                </Flex>

                <Flex w={['100%', '100%', '100%', '100%', '33%']} flexDir={'column'} justifyContent={'center'} alignItems={'center'} maxH={'60vh'}>
                    <Text color={'white'} fontSize={'2xl'} className={'heading-2xl'}>Pins</Text>
                    <SimpleGrid columns={[2, 4, 5, 6, 4]} spacing={3} bgColor={'black'} p={3} borderRadius={'md'} w={'90%'} border={'1px solid rgba(255,255,255,0.8)'} overflowY={'scroll'} sx={{
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
                                <Image src={`${api}/image/${pin.image}`} fallback={<Spinner/>}/>
                            </Flex>
                        ))}
                    </SimpleGrid>
                    {localStorage.getItem('username') ? 
                        <Link href={`/collection?brawler=${data.name}`} color={'white'} fontSize={'lg'} className={'heading-lg'}>{`View ${data.displayName} Collection `}<ExternalLinkIcon mx={'2px'}/></Link>
                            :
                        <Text color={'white'} fontSize={'lg'} className={'heading-md'}><Link color={'blue.400'} href='/login'>Log In</Link> To View Collection</Text>
                    }
                </Flex>
            </Stack>
            <SimpleGrid spacing={5} columns={[1,2,2,3,4]} bgColor={'blue.900'} pt={'3vh'} w={'100%'} px={6}>{(data.skins).map((skin) => (
                <Flex key={skin.name} flexDir={'column'} m={3}>
                    <SkinView skin={skin.name} brawler={data.name} setModel={setModel}></SkinView>
                </Flex>
            ))}
            </SimpleGrid>
        </Flex>
        }
    </>
  )
}
