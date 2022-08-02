import React, { useEffect, useImperativeHandle, useState } from 'react'
import {  Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Text,
    SimpleGrid,
    Image,
    Box,
    Flex, } from '@chakra-ui/react'
import axios from 'axios'


type Props = {
    avatar: string,
    setAvatar: any
}

//subject to change to actual endpoint
//must provide name with each avatar
interface Avatars {
    name: string,
    displayName: string,
    rarity: {
        value: number,
        name: string,
        color: string
    },
    portrait: string
}

const AvatarSelect = React.forwardRef<{open: () => void}, Props>((props, ref) => {
    const [avatars, setAvatars] = useState<[Avatars]>()

    const { isOpen, onOpen, onClose } = useDisclosure()
    
    useImperativeHandle(
        ref,
        () => ({
          open() {
            onOpen()
          }
        }),
        
    )
    
    useEffect(() => {
        axios.get('/brawler')
            .then((res) => {
                setAvatars(res.data)
            })
    }, [])

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader><Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}><Text fontSize={'3xl'} className={'heading-3xl'} color={'white'}>Change Avatar</Text></Flex></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={[4,5,6,7,8]} spacing={2}>
                {avatars?.map((a) => (
                    <Box w={'fit-content'} onClick={() => {props.setAvatar(a.name)}} cursor={'pointer'}>
                        <Image src={`/image/${a.portrait}`} w={'100px'} borderRadius={'40%'} border={(a.name === props.avatar) ? '3px solid #87CEEB' : 'none'}/>
                    </Box>
                ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  )
})

export default AvatarSelect
