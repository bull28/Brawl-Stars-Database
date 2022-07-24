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
  Spinner
} from '@chakra-ui/react'



import axios from 'axios'

interface Props {
    map: string
}

interface time {
  season: number,
  hour: number,
  minute: number,
  second: number,
  hoursPerSeason: number,
  maxSeasons: number,
}

interface MapData {
  name: string,
  displayName: string,
  gameMode: string,
  powerLeagueMap: boolean,
  image: string,
  bannerImage: string,
  times: {
    all: [time],
    next: time,
    duration: time
  }
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
    axios.get(`/map/${props.map}`)
      .then((res) => {
        setData(res.data)
      })
  }, [props.map])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader p={1}>
            <Flex flexDir={'column'} textAlign={'center'} position={'relative'}>
              <Image maxH={'80px'} objectFit={'fill'} src={`/image/${data?.bannerImage}`} borderRadius={'lg'} fallback={<Spinner/>}/>
              <Text position={'absolute'} left={'50%'} top={'50%'} transform={'translate(-50%,-50%)'} textShadow={'-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'} color={'white'} fontSize={'3xl'} fontWeight={'bold'} noOfLines={1} width={'100%'}>{data?.displayName}</Text>
            </Flex>

          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <Image src={`/image/${data?.image}`} fallback={<Spinner/>}/>
            {data?.times.next && 
            <Flex alignItems={'center'}>
              <Text fontSize={'xl'}>{(data?.times.next.hour === 0 && data.times.next.minute === 0 && data.times.next.season === 0) ? "On Now" : `Starts in ${Math.floor(data?.times.next.hour/24)}d ${data?.times.next.hour % 24}h ${data?.times.next.minute}m ${data?.times.next.second}s`}</Text>
              {data.powerLeagueMap && <Image h={'35px'} ml={2} src={'/image/skingroups/icons/icon_ranked.webp'}/>}
            </Flex>
            }
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
});

export default MapView