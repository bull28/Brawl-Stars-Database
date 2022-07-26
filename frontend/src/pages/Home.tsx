import { Flex, Text, Image, Box, SimpleGrid } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const topRow = ['Gallary', 'Brawlers', 'Events', 'Coming Soon']
const bottomRow = ['Brawl Box', 'Coming Soon', 'About/Options']

const topLinks = ['', '/brawlers', '/events', '']
const bottomLinks = ['', '', '']

const LargeTile = ({ link, children }: {link: string, children: React.ReactNode}) => {
  const redirect = useNavigate();

  const handleRedirect = () => {
    redirect(link)
  }
  return (
    <Box fontSize={'2xl'} bgColor={'blue.200'} className={'heading-2xl'} borderRadius={'lg'} p={5} border={'2px'} onClick={handleRedirect} cursor={'pointer'} color={'#fff'} borderColor={'#000'}>{children}</Box>
  )
}

const SmallTile = ({ link, children }: {link: string, children: React.ReactNode}) => {
  const redirect = useNavigate();

  const handleRedirect = () => {
    redirect(link)
  }
  return (
    <Box fontSize={'xl'} bgColor={'purple.400'} className={'heading-xl'} borderRadius={'lg'} p={5} border={'2px'} onClick={handleRedirect} cursor={'pointer'} color={'#fff'} borderColor={'#000'}>{children}</Box>
  )
}

export default function Home() {
  return (
    <>
    <Image w={'100vw'} h={'100vh'} position={'absolute'} objectFit={'cover'} src={require('../assets/backround.webp')} zIndex={'-1'} fallbackSrc={require('../assets/backround.png')}/>
    <Flex position={'absolute'} width={'100%'} justifyContent={'right'}>
      <Flex m={5} alignItems={'center'}>
        <Text mr={5} fontSize={'xl'} className={'heading-xl'}>15:30</Text>
        <Box w={'70px'} h={'70px'} bgColor={'white'}></Box>
      </Flex>

    </Flex>
      <Flex w={'100%'} flexDir={'column'} textAlign={'center'} justifyContent={'center'} alignItems={'center'}>
      
        <Text fontSize={'4xl'} color={'rgb(255,0,0)'} className={'heading-4xl'} mt={'5%'} mb={20}>
            Brawl Stars Database
        </Text>

        <SimpleGrid columns={[2,4]} spacing={20} mb={20}>
          {[0,1,2,3].map((i) => (
            <LargeTile link={topLinks[i]}>{topRow[i]}</LargeTile>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={[1,3]} spacing={20}>
          {[0,1,2].map((i) => (
            <SmallTile link={bottomLinks[i]}>{bottomRow[i]}</SmallTile>
          ))}
        </SimpleGrid>
        
      </Flex>
    </>
  )
}
