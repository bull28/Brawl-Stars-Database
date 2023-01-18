import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";


interface ThemeProps {
  background: [
    {
      displayName: string,
      path: string
    }
  ],
  icon: [
    {
      displayName: string,
      path: string,
      preview: string
    }
  ],
  music: [
    {
      displayName: string,
      path: string
    }
  ]
}

export default function Gallery() {

  const [data, setData] = useState<ThemeProps>()
  const [update, trigger] = useState<number>(0)

  useEffect(() => {
    AuthRequest('/theme', {setState: [{func: setData, attr: ""}]})
    
  }, [])

  const changeBg = (file: string) => {
    trigger(prevState => prevState + 1)
    localStorage.setItem('background', file)    
  }

  const changeIcon = (file: string) => {
    trigger(prevState => prevState + 1)
    localStorage.setItem('icon', file)
  }

  


  return (
    <Flex justifyContent={'center'}>      
      <SkullBackground key={update}/>
      <Flex w={'70vw'} justifyContent={'space-around'} mt={'2vh'}>
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
            {data?.background.map((bg) => (
              <Flex bgColor={(localStorage.getItem('background') || '') === bg.path ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} src={`/image/${bg.path}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{bg.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(localStorage.getItem('background') || '') === bg.path ? true : false} onClick={() => {changeBg(bg.path)}} fontSize={'xl'} bgColor={'green.500'}>Try</Button>
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
            {data?.icon.map((icon) => (
              <Flex bgColor={(localStorage.getItem('background') || '') === icon.path ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`/image/${icon.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{icon.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Background Icons!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(localStorage.getItem('icon') || '') === icon.path ? true : false} onClick={() => {changeIcon(icon.path)}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}