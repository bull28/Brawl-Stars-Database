import { Flex, Text, Image, Box, SimpleGrid, Button, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import AccountDisplay from '../components/AccountDisplay'
import isSun from '../helpers/SunOrMoon'


const topRow = ['Gallery', 'Brawlers', 'Events', 'Trade']
const bottomRow = ['Shop', 'Challenges', 'About/Options']

const topLinks = ['/gallery', '/brawlers', '/events', '/trade']
const bottomLinks = ['/shop', '/challenges', '']

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
    <Flex flexDir={'column'} alignItems={'center'}>
    <Image w={'100vw'} h={'100vh'} position={'fixed'} objectFit={'cover'} src={(!isSun()) ? require('../assets/backroundnight.webp') : require('../assets/backround.webp')} zIndex={'-1'}/>
    <Flex mt={3} pos={['relative', 'relative', 'absolute']} width={['90%', '90%', '90%', '95%']} justifyContent={['space-between', 'space-between', 'space-between', 'right']} alignItems={'center'}>
        <Flex justifyContent={'center'} alignItems={'center'}>
          <Text mr={3} fontSize={'xl'} className={'heading-xl'} color={'pink.400'}>{`${new Date().getHours()}:${String(new Date().getMinutes()).length === 2 ? new Date().getMinutes() : "0"+new Date().getMinutes()}`}</Text>
          <Tooltip label={`don't ask where this is from...`}>{(!isSun()) ? <Image src={require('../assets/moon.webp')} w={'70px'} mr={5}/> : <Box w={'70px'} h={'70px'} bgColor={'white'} mr={5}></Box>}</Tooltip>
        </Flex>
        {localStorage.getItem('username') ? 
          <AccountDisplay/> :
          <Button onClick={login} fontWeight={"normal"} fontSize={"lg"} className={"heading-lg"} color={"#fff"}>Log In</Button>}        
    </Flex>
      <Flex w={'100%'} flexDir={'column'} textAlign={'center'} justifyContent={'center'} alignItems={'center'}>
      
        <Text fontSize={['2xl', '3xl', '4xl']} color={'rgb(255,0,0)'} className={'heading-4xl'} mt={'5%'} mb={20}>
            Brawl Stars Database
        </Text>

        <SimpleGrid columns={[1,2,4]} spacing={[5, 10, 15, 20]} mb={20}>
          {[0,1,2,3].map((i, x) => (
            <LargeTile key={x} link={topLinks[i]}>{topRow[i]}</LargeTile>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={[1,1,3]} spacing={[5, 10, 15, 20]}>
          {[0,1,2].map((i, x) => (
            <SmallTile key={x} link={bottomLinks[i]}>{bottomRow[i]}</SmallTile>
          ))}
        </SimpleGrid>
        
      </Flex>
    </Flex>
  )
}
