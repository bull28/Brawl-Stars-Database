import { Flex, Text, SimpleGrid } from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"
import EventView from '../components/EventView'
import EventSideBar from '../components/EventSideBar'
import {event, time} from '../types/EventData'


interface EventsCurrent {
  time: time,
  events: [event]
}

export default function Maps() {
  const [data, setData] = useState<EventsCurrent>()

  const fetchData = () => {
    axios.get('/event/current')
      .then((res) => {
        setData(res.data)
      })
  }

  useEffect(() => {
    fetchData();

    setInterval(() => {
      fetchData();
    }, 5000)

  }, [])


  return (
    <Flex flexDir={'column'} justifyContent={'space-between'} w={'100%'}>
      <Flex w={'100%'} textAlign={'center'} justifyContent={'center'}>
        <Text fontSize={'3xl'}>Events</Text>  
      </Flex>
      <Flex flexDir={'row'}>
        <EventSideBar/>
        <Flex flexDir={'column'} mt={10}>
          <SimpleGrid columns={[1,2]} spacing={5}>
            {data?.events.map((event) => (
              <EventView event={event}/>
          ))}
          </SimpleGrid>
        </Flex>
      </Flex>
    </Flex>
  )
}
