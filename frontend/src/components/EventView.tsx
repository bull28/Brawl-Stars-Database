import { Flex, Image, Text } from '@chakra-ui/react'
import {event} from '../types/EventData'


interface MapViewProps {
    event: event
}

export default function MapView({ event }: MapViewProps){

    return (
          <Flex flexDir={'column'} key={event.map.name}>
            <Flex flexDir={'row'} bgColor={event.gameMode.data.backgroundColor}>
              <Image src={`/image/${event.gameMode.data.image}`}/>
              <Flex flexDir={'column'}>
                <Text>{event.gameMode.displayName}</Text>
                <Text>{event.map.displayName}</Text>
              </Flex>
            </Flex>
            <Image src={`/image/${event.map.bannerImage}`}/>
            <Flex color={event.gameMode.data.textColor} w={'100%'} justifyContent={'space-between'} bgColor={'black'}>
              <Text>{`Next: idk bruh`}</Text>
              <Text>{`${event.timeLeft.hour}h ${event.timeLeft.minute}m ${event.timeLeft.second}s`}</Text>
            </Flex>
          </Flex>
    )
}

