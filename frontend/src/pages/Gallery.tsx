import { Button, Flex, Image, list, Text } from "@chakra-ui/react";
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
  ],
  scene: [
    {
      displayName: string,
      path: string,
      preview: string
    }
  ]
}

export default function Gallery() {

  const [data, setData] = useState<ThemeProps>()
  const [update, trigger] = useState<number>(0)
  const [updateButtons, triggerButtons] = useState<number>(0)

  useEffect(() => {
    AuthRequest('/theme', {setState: [{func: setData, attr: ""}]})
    
  }, [])

  const changeBg = (file: string) => {
    trigger(prevState => prevState + 1)

    const userData = JSON.parse(localStorage.getItem('background') || "{}")

    userData[localStorage.getItem('username') || ""] = file

    localStorage.setItem('background', JSON.stringify(userData))
  }

  const changeIcon = (file: string) => {
    trigger(prevState => prevState + 1)

    const userData = JSON.parse(localStorage.getItem('icon') || "{}")

    userData[localStorage.getItem('username') || ""] = file

    localStorage.setItem('icon', JSON.stringify(userData))
  }

  const changeMusic = (file: string) => {
    triggerButtons(prevState => prevState + 1)

    const userData = JSON.parse(localStorage.getItem('music') || "{}")

    userData[localStorage.getItem('username') || ""] = file

    localStorage.setItem('music', JSON.stringify(userData))
  }

  const changeScene = (file: string) => {
    triggerButtons(prevState => prevState + 1)

    const userData = JSON.parse(localStorage.getItem('scene') || "{}")

    userData[localStorage.getItem('username') || ""] = file

    localStorage.setItem('scene', JSON.stringify(userData))
  }

  const readStorage = (key: string) => {
    return JSON.parse(localStorage.getItem(key) || "{}")[localStorage.getItem('username') || ""]
  }


  return (
    <Flex alignItems={'center'} flexDir={'column'}>            
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
              <Flex bgColor={(readStorage('background') === bg.path || ( !readStorage('background') && bg.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} src={`/image/${bg.path}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{bg.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(readStorage('background') === bg.path || ( !readStorage('background') && bg.displayName === 'Default' ) ) ? true : false} onClick={() => {changeBg(bg.path)}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
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
              <Flex bgColor={(readStorage('icon') === icon.path || ( !readStorage('icon') && icon.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`/image/${icon.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{icon.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Background Icons!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(readStorage('icon') === icon.path || ( !readStorage('icon') && icon.displayName === 'Default' ) ) ? true : false} onClick={() => {changeIcon(icon.path)}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex w={'70vw'} justifyContent={'space-around'} mt={'2vh'}>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Music</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} key={updateButtons} sx={{
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
            {data?.music.map((music) => (
              <Flex bgColor={(readStorage('music') === music.path || ( !readStorage('music') && music.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} src={`/image/${music.path}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{music.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background Track!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(readStorage('music') === music.path || ( !readStorage('music') && music.displayName === 'Default' ) ) ? true : false} onClick={() => {changeMusic(music.path)}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Scenes</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} key={updateButtons} sx={{
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
            {data?.scene.map((scene) => (
              <Flex bgColor={(readStorage('scene') === scene.path || ( !readStorage('scene1') && scene.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`/image/${scene.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{scene.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Skin Viewer Scenes!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={readStorage('scene') === scene.path ? true : false} onClick={() => {changeScene(scene.path)}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}