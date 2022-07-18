import { useEffect, useState } from 'react'
import { Flex, Text, SimpleGrid, Image, Icon, Link, Spinner } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import BrawlerImage from '../components/SkinView'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { BrawlerData } from '../types/BrawlerData'
import ModelViewer from '../components/3D_Model_Viewer'

export default function Brawler() {
    const params = useParams()
    const [data, setData] = useState<BrawlerData>()
    const [hover, setHover] = useState<boolean>(false)

    useEffect(() => {
        axios.get(`/brawler/${params.brawler}`)
            .then((res) => {
                setData(res.data)
            })
    }, [params])
  return (
    <>
    {data && Object.keys(data).length !== 0 && 
        <Flex flexDir={'column'} w={'100%'} justifyContent={'center'} textAlign={'center'} alignItems={'center'}>
            <Link position={'absolute'} left={'10'} top={'5'} href={'/brawlers'}><Icon as={ArrowBackIcon} fontSize={'3xl'}/></Link>
            <Flex w={'100%'} justifyContent={'center'} my={3}>
                <Text fontSize={'2xl'} fontWeight={'bold'} color={'white'} textShadow={'-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}>{data.displayName}</Text>
            </Flex>
                
            <Flex flexDir={'row'} h={'50vh'} w={['90%','60%']} alignItems={'center'} justifyContent={'space-between'}>
                <Flex flexDir={'column'} textAlign={'center'} h={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Image src={'/image/'+data.image} borderRadius={'lg'} fallback={<Spinner/>} objectFit={'contain'} h={'80%'}/>                
                    <Text w={'60%'}>{data.description}</Text>
                </Flex>
                <Flex justifyContent={'center'} alignItems={'center'} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} h={'100%'} w={'50%'} bgImage={"/image/misc/bg_3d_model.webp"} backgroundPosition={"center"} backgroundSize={"cover"} backgroundRepeat={"no-repeat"}>
                    <ModelViewer scale={1.0} modelPath={`/image/${data.model}`} hover={hover} position={[0, 0, 0]}/>
                </Flex>
            </Flex>
            
            
            
            <SimpleGrid spacing={5} columns={[1,2,2,3,4]}>{(data.skins).map((skin) => (
                <Flex key={skin.name} flexDir={'column'} m={3}>
                    <BrawlerImage skin={skin.name} brawler={data.name}></BrawlerImage>
                </Flex>
            ))}
            </SimpleGrid>
        </Flex>}
    </>
  )
}
