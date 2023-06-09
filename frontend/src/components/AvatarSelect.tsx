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

import AuthRequest from '../helpers/AuthRequest'


type Props = {
    avatar: string,
    setAvatar: any
}


const AvatarSelect = React.forwardRef<{open: () => void}, Props>((props, ref) => {
    const [avatars, setAvatars] = useState<string[]>([])

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
      AuthRequest<string[]>("/avatar", {setState: setAvatars});
    }, [])

  return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader><Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}><Text fontSize={'3xl'} className={'heading-3xl'} >Change Avatar</Text></Flex></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={[4,5,6,7,8]} spacing={2}>
                {avatars?.map((a) => (
                    <Box key={a} w={'fit-content'} onClick={() => {props.setAvatar(a); onClose();}} cursor={'pointer'}>
                        <Image src={`/image/${a}`} w={'100px'} borderRadius={'50%'} border={(a === props.avatar) ? '3px solid #87C1FF' : '2px solid black'}/>
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
