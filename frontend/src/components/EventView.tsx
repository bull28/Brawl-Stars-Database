import { Flex, Image, Text } from '@chakra-ui/react'
import {event} from '../types/EventData'
import { useState, useEffect } from 'react'

interface MapViewProps {
    event: event
}

export default function MapView({ event }: MapViewProps){

    const [timer, updateTimer] = useState<number>(0)

    useEffect(() => {
      const id = setInterval(() => 
        updateTimer((time) => time + 1)
      , 1000)

      return () => {
        clearInterval(id)
      }
    }, [])


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
                <Text whiteSpace={"pre"}>{event.timeLeft.hour > 0 ? ` ${(event.timeLeft.second-timer < -3600) ? event.timeLeft.hour + Math.floor((event.timeLeft.second - timer)/3600) : event.timeLeft.hour}h` : ""}</Text>
                <Text whiteSpace={"pre"}>{event.timeLeft.minute > 0 ? ` ${(event.timeLeft.second < timer) ? event.timeLeft.minute + Math.floor((event.timeLeft.second - timer)/60) : event.timeLeft.minute}m` : ""}</Text>
                <Text whiteSpace={"pre"}>{event.timeLeft.second > 0 ? ` ${(event.timeLeft.second < timer) ? 60+((event.timeLeft.second - timer)%60) : (event.timeLeft.second - timer)%60}s` : ""}</Text>
                <Text>{(event.timeLeft.hour === 0 && event.timeLeft.minute === 0 && event.timeLeft.second === 0) ? "0s" : ""}</Text>
              </Flex>
            </Flex>
          </Flex>
    )
}

