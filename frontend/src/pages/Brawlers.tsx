import {useEffect, useState} from 'react'
import { Flex, ScaleFade, SimpleGrid, Text } from '@chakra-ui/react'
import axios from 'axios'
import BrawlerView from '../components/BrawlerView'
import { Brawler } from '../types/BrawlerData'

export default function Brawlers() {

    const [data, setData] = useState<[Brawler]>()

    useEffect(() => {
        axios.get('/brawler')
            .then((res) => {
                setData(res.data)
            })
            
    }, [])

  return (
    <Flex w={'100%'} flexDir={'column'} textAlign={'center'}>
        <Text fontSize={'3xl'}>
            Brawlers
        </Text>
        {data && 
            <SimpleGrid columns={[2,3,4,5,6,7,8]}>
                {data.map((brawler) => <ScaleFade in={true} delay={0.15}><BrawlerView key={brawler.name} image={brawler.portrait} name={brawler.name} displayName={brawler.displayName} rarityColor={brawler.rarity.color}/></ScaleFade>)}
            </SimpleGrid>
        }
    </Flex>
  )
}
