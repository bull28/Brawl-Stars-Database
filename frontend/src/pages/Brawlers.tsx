import {useEffect, useState} from 'react'
import { Flex, ScaleFade, SimpleGrid, Text } from '@chakra-ui/react'
import axios from 'axios'
import BrawlerView from '../components/BrawlerView'
import { Brawler } from '../types/BrawlerData'
import SkullBackground from '../components/SkullBackground'
import api from "../helpers/APIRoute";

export default function Brawlers() {

    const [data, setData] = useState<Brawler[]>()

    useEffect(() => {
        axios.get(`${api}/brawler`)
            .then((res) => {
                setData(res.data)
            })
            
    }, [])

  return (
    <Flex w={'100%'} flexDir={'column'} textAlign={'center'} alignItems={'center'}>
        <SkullBackground/>
        <Text fontSize={'4xl'} className={'heading-4xl'}>
            Brawlers
        </Text>
        {data && 
            <SimpleGrid columns={[2,3,4,5,6,7,8]} w={'95%'}>
                {data.map((brawler) =>
                    <Flex key={brawler.name}>
                        <ScaleFade in={true} delay={0.15}>
                            <BrawlerView image={brawler.image} name={brawler.name} displayName={brawler.displayName} rarityColor={brawler.rarity.color}/>
                        </ScaleFade>
                    </Flex>
                )}
            </SimpleGrid>
        }
    </Flex>
  )
}
