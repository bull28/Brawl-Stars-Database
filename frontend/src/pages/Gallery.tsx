import { Button, Flex, Image, Text } from "@chakra-ui/react";
import SkullBackground from "../components/SkullBackground";

export default function Gallery() {

  interface DataProps {
    file: string,
    name: string,
    cost: number
  }

  const data: DataProps[] = [
    {file: "giftshop", name: "Gift Shop", cost: 200},
    {file: "lunar", name: "Lunar", cost: 500},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},


  ]

  const data2: DataProps[] = [
    {file: "giftshop", name: "Gift Shop", cost: 200},
    {file: "lunar", name: "Lunar", cost: 500},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},
    {file: "lny_20", name: "Lunar 2020", cost: 2000},

  ]

  const changeBg = (file: string) => {
    localStorage.setItem('background', file)
    window.location.reload()
  }

  const changeIcon = (file: string) => {
    localStorage.setItem('icon', file)
    window.location.reload()
  }

  return (
    <Flex justifyContent={'center'}>            
      <SkullBackground/>
      <Flex w={'60vw'} justifyContent={'space-around'} mt={'2vh'}>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Backgrounds</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={{
                          '&::-webkit-scrollbar': {
                          height: '12px',
                          borderRadius: '8px',
                          backgroundColor: `rgba(0, 0, 0, 0.05)`,
                          width: '10px'
                          },
                          '&::-webkit-scrollbar-thumb': {
                          backgroundColor: `rgba(0, 0, 0, 0.5)`,
                          borderRadius: `6px`,
                          },
                      }}>
            {data.map((bg) => (
              <Flex bgColor={'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'blue.800'} w={'15vh'} h={'15vh'} src={require(`../assets/backgrounds/bg_${bg.file}.webp`)}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{bg.name}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>
                  <Button isDisabled={true} fontSize={'xl'} bgColor={'green.300'}>Buy</Button>
                  <Button onClick={() => {changeBg(bg.file)}} fontSize={'xl'} bgColor={'blue.500'}>Try</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Icons</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={{
                          '&::-webkit-scrollbar': {
                          height: '12px',
                          borderRadius: '8px',
                          backgroundColor: `rgba(0, 0, 0, 0.05)`,
                          width: '10px'
                          },
                          '&::-webkit-scrollbar-thumb': {
                          backgroundColor: `rgba(0, 0, 0, 0.5)`,
                          borderRadius: `6px`,
                          },
                      }}>
            {data2.map((icon) => (
              <Flex bgColor={'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'blue.800'} w={'15vh'} h={'15vh'} src={require(`../assets/icons/icon_${icon.file}.webp`)}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{icon.name}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with New Background Icons!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>
                  <Button isDisabled={true} fontSize={'xl'} bgColor={'green.300'}>Buy</Button>
                  <Button onClick={() => {changeIcon(icon.file)}} fontSize={'xl'} bgColor={'blue.500'}>Try</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}