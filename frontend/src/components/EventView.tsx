import { Flex, Image, Text } from '@chakra-ui/react'
import {EventSlot} from '../types/EventData'
import EventTime from '../helpers/EventTime'
import api from "../helpers/APIRoute";

interface MapViewProps{
    event: EventSlot;
    offset: number;
}

export default function MapView({ event, offset }: MapViewProps){
  return (
    <Flex flexDir={'column'} key={event.current.map.name} borderRadius={'xl'} border={'3px solid black'} minW={'20vw'}>
      <Flex borderRadius={'lg'} borderBottomRadius={'none'} p={1} flexDir={'row'} bgColor={event.current.gameMode.data.backgroundColor}>
      <Image src={`${api}/image/${event.current.gameMode.data.image}`}/>
        <Flex h={'100%'} alignItems={'center'} textAlign={'center'} w={'100%'} justifyContent={'center'}>
          <Text fontSize={['lg', 'xl', 'xl', '2xl', '2xl']} className={'heading-2xl'} color={'#fff'}>{event.current.map.displayName}</Text>
        </Flex>
      </Flex>
      <Image borderRadius={'lg'} borderTopRadius={'none'} borderBottomRadius={'none'} src={`${api}/image/${event.current.map.bannerImage}`}/>
      <Flex borderRadius={'lg'} borderTopRadius={'none'} color={event.upcoming.gameMode.data.textColor} w={'100%'} h={'100%'} justifyContent={'space-between'} bgColor={'black'} p={2}>
        <Flex alignItems={'center'} w={'100%'} justifyContent={'space-between'} wrap={'wrap'}>
          <Flex alignItems={'center'}>
            <Text className={'heading-md'} fontSize={['xs', 'sm', 'sm', 'md', 'md']}>Next: </Text>          
            <Image ml={3} mr={1} maxH={['20px', '25px', '30px', '30px', '30px']} src={`${api}/image/${event.upcoming.gameMode.data.image}`}/>
            <Text className={'heading-md'} fontSize={['xs', 'sm', 'sm', 'md', 'md']} mr={2}>{event.upcoming.map.displayName}</Text>
          </Flex>
          <Text className={'heading-md'} fontSize={['xs', 'sm', 'sm', 'md', 'md']} whiteSpace={"pre"}>{EventTime(event.timeLeft, offset)}</Text>
        </Flex>        
      </Flex>
    </Flex>
  )
}
