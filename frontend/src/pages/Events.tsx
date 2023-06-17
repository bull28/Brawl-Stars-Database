import { Flex, Text, SimpleGrid } from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"
import EventView from '../components/EventView'
import EventSideBar from '../components/EventSideBar'
import {event, time} from '../types/EventData'
import SkullBackground from "../components/SkullBackground"
import api from "../helpers/ApiRoute";


interface EventsCurrent {
  time: time,
  events: [event]
}

export default function Maps() {
  const [data, setData] = useState<EventsCurrent>()
  const [offset, setOffset] = useState<number>(0);

  const fetchData = () => {
    axios.get(`${api}/event/current`)
      .then((res) => {
        setData(res.data)
      })
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <Flex flexDir={'column'} justifyContent={'space-between'} w={'100%'}>
      <SkullBackground/>
      <Flex w={'100%'} textAlign={'center'} justifyContent={'center'}>
        <Text fontSize={'4xl'} className={'heading-4xl'} >Events</Text>  
      </Flex>
      <Flex flexDir={'row'}>
        <EventSideBar changeData={setData} changeOffset={setOffset} startTime={new Date()}/>
        <Flex flexDir={'column'} mt={10}>
          <SimpleGrid columns={[1, 1, 2, 2, 2, 3]} spacing={5} w={'100%'}>
            {data?.events.map((event) => (
              <EventView event={event} offset={offset} key={event.current.map.name + event.current.gameMode.name}/>
            ))}
          </SimpleGrid>
        </Flex>
      </Flex>
    </Flex>
  )
}
