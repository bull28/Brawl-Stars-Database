import { useEffect, useState } from 'react'
import { Flex, Text, SimpleGrid, Image, Icon, Link, Spinner } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import BrawlerImage from '../components/SkinView'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { BrawlerData } from '../types/BrawlerData'


export default function Brawler() {
    const params = useParams()
    const [data, setData] = useState<BrawlerData>()

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
            <Flex flexDir={'column'} w={'50%'} textAlign={'center'} bgColor={data.rarity.color} p={5} borderRadius={'lg'} my={5}>
                <Text fontSize={'2xl'} fontWeight={'bold'} color={'white'} textShadow={'-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}>{data.displayName}</Text>
                <Image src={'/image/'+data.image} borderRadius={'lg'} fallback={<Spinner/>}/>
            </Flex>
            <SimpleGrid spacing={5} columns={[1,2,2,3,4]}>{(data.skins).map((skin) => (
                <Flex flexDir={'column'} m={3}>
                    <BrawlerImage skin={skin.name} brawler={data.name}></BrawlerImage>
                </Flex>
            ))}
            </SimpleGrid>
        </Flex>}
    </>
  )
}
