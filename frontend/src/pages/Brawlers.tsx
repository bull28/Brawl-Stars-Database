import {useEffect, useState} from 'react'
import { Flex, SimpleGrid, Text } from '@chakra-ui/react'
import axios from 'axios'
import BrawlerView from '../components/BrawlerView'

export default function Brawlers() {

    interface brawler {
        name: string,
        displayName: string,
        rarity: {
            value: number,
            name: string,
            color: string
        },
        portrait: string
    }

    const [data, setData] = useState<[brawler]>()

    useEffect(() => {
        axios.get('/brawler')
            .then((res) => {
                setData(res.data)
                console.log(res.data)
            })
            
    }, [])

  return (
    <Flex w={'100%'} flexDir={'column'} textAlign={'center'}>
        <Text fontSize={'3xl'}>
            Brawlers
        </Text>
        {data && 
            <SimpleGrid columns={[2,3,4,5,6,7,8]}>
                {data.map((brawler: brawler) => <BrawlerView image={brawler.portrait} name={brawler.name} displayName={brawler.displayName} rarityColor={brawler.rarity.color}/>)}
            </SimpleGrid>
        }
    </Flex>
  )
}
