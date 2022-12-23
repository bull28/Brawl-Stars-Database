import { Flex, Text, Image, Box, SimpleGrid, Button, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import AccountDisplay from '../components/AccountDisplay'


const topRow = ['Gallery', 'Brawlers', 'Events', 'Trade']
const bottomRow = ['Brawl Box', 'Coming Soon', 'About/Options']

const topLinks = ['/gallery', '/brawlers', '/events', '/trade']
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

  const navigate = useNavigate()

  const login = () => {
    navigate('/login')
  }


  return (
    <>
    <Image w={'100vw'} h={'100vh'} position={'absolute'} objectFit={'cover'} src={require('../assets/backround.webp')} zIndex={'-1'} fallbackSrc={require('../assets/backround.png')}/>
    <Flex position={'absolute'} width={'100%'} justifyContent={'right'}>
      <Flex m={5} alignItems={'center'}>
        <Text mr={5} fontSize={'xl'} className={'heading-xl'} color={'pink.400'}>{`${new Date().getHours()}:${String(new Date().getMinutes()).length === 2 ? new Date().getMinutes() : "0"+new Date().getMinutes()}`}</Text>
        <Tooltip label={`don't ask where this is from...`}>{(new Date().getHours() > 12) ? <Image src={require('../assets/moon.webp')} w={'70px'} mr={5}/> : <Box w={'70px'} h={'70px'} bgColor={'white'} mr={5}></Box>}</Tooltip>
        {localStorage.getItem('username') ? 
          <AccountDisplay/> :
          <Button onClick={login}>Log In</Button>}
        
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
