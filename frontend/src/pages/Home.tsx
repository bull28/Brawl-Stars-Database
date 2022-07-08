import { Flex, Text, Image } from '@chakra-ui/react'


export default function Home() {
  return (
    <>
    <Image w={'100vw'} h={'100vh'} position={'absolute'} objectFit={'cover'} src={require('../assets/backround.webp')} zIndex={'-1'} fallbackSrc={require('../assets/backround.png')}/>
      <Flex w={'100%'} flexDir={'column'} textAlign={'center'}>
      
        <Text fontSize={'3xl'} color={'red.500'} textShadow={'-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}>
            Brawl Stars Database
        </Text>
        
      </Flex>
    </>
  )
}
