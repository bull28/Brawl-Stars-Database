import { Flex, Image, Text } from '@chakra-ui/react'
import {event} from '../types/EventData'


interface MapViewProps {
    event: event
}

export default function MapView({ event }: MapViewProps){

    return (
          <Flex flexDir={'column'} key={event.current.map.name} bgColor={'gray.200'} p={3} borderRadius={'lg'}>
            <Flex flexDir={'row'} bgColor={event.current.gameMode.data.backgroundColor}>
              <Image src={`/image/${event.current.gameMode.data.image}`}/>
              <Flex h={'100%'} alignItems={'center'} textAlign={'center'} w={'100%'} justifyContent={'center'}>
                <Text fontSize={'2xl'} fontWeight={'bold'}>{event.current.map.displayName}</Text>
              </Flex>
            </Flex>
            <Image src={`/image/${event.current.map.bannerImage}`}/>
            <Flex color={event.upcoming.gameMode.data.textColor} w={'100%'} justifyContent={'space-between'} bgColor={'black'}>
              <Text>{`Next: ${event.upcoming.map.displayName}`}</Text>
              <Text>{`${event.timeLeft.hour}h ${event.timeLeft.minute}m ${event.timeLeft.second}s`}</Text>
            </Flex>
          </Flex>
    )
}

