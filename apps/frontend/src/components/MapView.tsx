import React, { useEffect, useImperativeHandle, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Image,
  Button,
  Flex,
  Spinner,
  Tooltip
} from '@chakra-ui/react'
import axios from 'axios'
import {SeasonTime, MapData} from "../types/EventData";
import EventTime from "../helpers/EventTime";
import api from "../helpers/APIRoute";

interface Props{
    map: string;
}

function eventTimeDays(s: SeasonTime): string{
  const days = Math.floor(s.hour / 24);
  const seasonTime: SeasonTime = {
    season: s.season,
    hour: s.hour,
    minute: s.minute,
    second: s.second,
    hoursPerSeason: s.hoursPerSeason,
    maxSeasons: s.maxSeasons
  };
  if (days <= 0){
    const result = EventTime(seasonTime, 0);
    if (result === "0s"){
      return "Currently Active";
    }
    return `Starts in ${result}`;
  }
  seasonTime.hour = seasonTime.hour % 24;
  return `Starts in ${days}d ${EventTime(seasonTime, 0)}`;
}

const MapView = React.forwardRef<{open: () => void}, Props>((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [data, setData] = useState<MapData>()


  useImperativeHandle(
    ref,
    () => ({
      open() {
        onOpen()
      }
    }),
    
  )

  useEffect(() => {
    if (props.map){
      axios.get(`${api}/map/${props.map}`)
        .then((res) => {
          setData(res.data)
      })
    }
    
  }, [props.map])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bgColor={data?.gameMode.backgroundColor}>
          <ModalHeader p={1}>
            {data !== void 0 ?
              <Flex p={2} flexDir={'column'} textAlign={'center'} position={'relative'}>
                <Image maxH={'80px'} objectFit={'cover'} src={`${api}/image/${data.bannerImage}`} borderRadius={'lg'} fallback={<Spinner/>}/>
                <Flex position={'absolute'} left={'50%'} top={'50%'} transform={'translate(-50%,-50%)'} w={'100%'} justifyContent={'center'} alignItems={'center'}>
                  <Image src={`${api}/image/${data.gameMode.image}`} mr={3}/>
                  <Text  fontSize={'3xl'} className={'heading-3xl'} noOfLines={1}>{data.displayName}</Text>
                </Flex>
              </Flex>
              :
              <></>
            }
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            {data !== void 0 ?
              <>
                <Image src={`${api}/image/${data.image}`} fallback={<Spinner/>}/>
                <Flex alignItems={'center'}>
                  <Text fontSize={'2xl'} className={'heading-2xl'}>{eventTimeDays(data.times.next)}</Text>
                  {data.powerLeagueMap && <Tooltip label={"Power League Map"}><Image h={'35px'} ml={2} src={`${api}/image/skingroups/icons/icon_ranked.webp`}/></Tooltip>}
                </Flex>
              </>
              :
              <></>
            }
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
});

export default MapView;
