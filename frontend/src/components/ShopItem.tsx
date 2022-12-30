import { Box, Button, Divider, Flex, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Tag, Text, useDisclosure } from '@chakra-ui/react'
import AuthRequest from '../helpers/AuthRequest'
import ShopData from '../types/ShopData'
import { useState } from 'react'



export default function ShopItem({data}: {data: ShopData}) {

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [accepted, setAccepted] = useState<boolean>()

    

    const purchase = (itemName: string) => {
        AuthRequest('/shop', {data: {item: itemName}})
    }

    return (
        <Flex alignItems={'center'} flexDir={'column'} borderRadius={'lg'} onClick={onOpen} w={'10vw'} p={5} cursor={'pointer'} pos={'relative'} bgColor={'lightskyblue'} border={'3px solid'} borderColor={'blue.500'} _hover={{
        ".top": {
            transitionDelay: "0s",
            transform: "scaleX(1)"
          },
          ".right": {
            transitionDelay: "0.05s",
            transform: "scaleY(1)"
          },
          ".bottom": {
            transitionDelay: "0.1s",
            transform: "scaleX(1)"
          },
          ".left": {
            transitionDelay: "0.15s",
            transform: "scaleY(1)"
          }
        }}>            
            <Box className='top' pos={'absolute'} display={'block'} background={'purple.300'} transition={`all 0.1s linear`} w={'100%'} height={'3px'} transform={'scaleX(0)'} top={0} left={0} transitionDelay={'0.15s'} transformOrigin={'top left'}></Box>
            <Box className='bottom' pos={'absolute'} display={'block'} background={'purple.300'} transition={`all 0.1s linear`} w={'100%'} height={'3px'} transform={'scaleX(0)'} bottom={0} right={0} transitionDelay={'0.05s'} transformOrigin={'top right'}></Box>
            <Box className='left' pos={'absolute'} display={'block'} background={'purple.300'} transition={`all 0.1s linear`} w={'3px'} height={'100%'} transform={'scaleY(0)'} top={0} left={0} transformOrigin={'bottom left'}></Box>
            <Box className='right' pos={'absolute'} display={'block'} background={'purple.300'} transition={`all 0.1s linear`} w={'3px'} height={'100%'} transform={'scaleY(0)'} top={0} right={0} transitionDelay={'0.1s'} transformOrigin={'top left'}></Box>

            <Flex p={5}>
                <Image borderRadius={'lg'} src={`/image/${data.image}`}/>
            </Flex>
            <Flex>
                {/*<Tag colorScheme={'red'} size={'sm'} mr={1}>NEW</Tag>*/}
                <Text fontSize={'xl'} color={'white'} className={'heading-2xl'}>{data.displayName}</Text>
            </Flex>
            <Flex alignItems={'center'} mt={3}>
                <Text fontSize={'lg'} color={'white'} className={'heading-xl'}>{data.cost}</Text>
                <Image ml={1} maxH={'30px'} src={`/image/resources/resource_coins.webp`}/>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>{accepted ? 'Purchase Successful!' : 'Purchase Item'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='red' mr={3} onClick={onClose}>
                    Close
                    </Button>
                    <Button colorScheme={'whatsapp'} onClick={() => {purchase(data.name)}}>Buy</Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>       
    )
}