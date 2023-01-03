import { Flex, Image, Text } from '@chakra-ui/react'
import {event} from '../types/EventData'
import EventTime from '../helpers/EventTime'

interface MapViewProps {
    event: event,
    offset: number
}

export default function MapView({ event, offset }: MapViewProps){
  return (
    <Flex flexDir={'column'} key={event.current.map.name} bgColor={'gray.300'} p={2} borderRadius={'lg'}>
      <Flex borderRadius={'lg'} borderBottomRadius={'none'} p={1} flexDir={'row'} bgColor={event.current.gameMode.data.backgroundColor}>
      <Image src={`/image/${event.current.gameMode.data.image}`}/>
        <Flex h={'100%'} alignItems={'center'} textAlign={'center'} w={'100%'} justifyContent={'center'}>
          <Text fontSize={'2xl'} className={'heading-2xl'} color={'#fff'}>{event.current.map.displayName}</Text>
        </Flex>
      </Flex>
      <Image borderRadius={'lg'} borderTopRadius={'none'} borderBottomRadius={'none'} src={`/image/${event.current.map.bannerImage}`}/>
      <Flex borderRadius={'lg'} borderTopRadius={'none'} color={event.upcoming.gameMode.data.textColor} w={'100%'} justifyContent={'space-between'} bgColor={'black'} p={2}>
        <Text>{`Next: ${event.upcoming.map.displayName}`}</Text>
        <Flex>
          <Text whiteSpace={"pre"}>{EventTime(event.timeLeft, offset)}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

