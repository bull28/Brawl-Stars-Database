import { Button, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import {GiShoppingCart} from 'react-icons/gi'
import { useNavigate } from "react-router-dom";
import CosmeticData from "../types/CosmeticData";

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
  const [cosmetics, setCosmetics] = useState<CosmeticData>()

  const navigate = useNavigate()

  useEffect(() => {
    AuthRequest('/theme', {setState: [{func: setData, attr: ""}]})
    AuthRequest('/cosmetic', {setState: [{func: setCosmetics, attr: ""}]})
  }, [])

  const saveChanges = () => {
    AuthRequest('/cosmetic', {data: {setCosmetics: cosmetics}, message: {title: 'Changes Saved!', status: 'success', duration: 3000}, errorToastMessage: 'Something Went Wrong!'})
  }


  return (
    <Flex alignItems={'center'} flexDir={'column'} justifyContent={'space-between'} maxH={'100vh'}>      
      <IconButton onClick={() => {navigate('/shop')}} as={GiShoppingCart} aria-label="shop" pos={'absolute'} right={'3vh'} top={'3vh'} bgColor={'blue.500'} border={'2px solid'} borderColor={'blue.700'} p={1} size={'lg'} borderRadius={'md'}/>
      {cosmetics && <SkullBackground bg={cosmetics.background} icon={cosmetics.icon}/>}
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
              <Flex bgColor={(cosmetics?.background === bg.path || ( !cosmetics?.background && bg.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} src={`/image/${bg.path}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{bg.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.background === bg.path || ( !cosmetics?.background && bg.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics({...cosmetics, background: bg.path})}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
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
              <Flex bgColor={(cosmetics?.icon === icon.path || ( !cosmetics?.icon && icon.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`/image/${icon.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{icon.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Background Icons!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.icon === icon.path || ( !cosmetics?.icon && icon.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics({...cosmetics, icon: icon.path})}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex w={'70vw'} justifyContent={'space-around'} mt={'2vh'}>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Music</Text>        
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
            {data?.music.map((music) => (
              <Flex bgColor={(cosmetics?.music === music.path || ( !cosmetics?.music && music.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{music.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background Track!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.music === music.path || ( !cosmetics?.music && music.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics({...cosmetics, music: music.path})}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Scenes</Text>      
          {data && data.scene.length > 0 &&
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
              {data?.scene.map((scene) => (
                <Flex bgColor={(cosmetics?.scene === scene.path || ( !cosmetics?.scene && scene.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                  <Flex>
                    <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`/image/${scene.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                    <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                      <Text className="heading-2xl" fontSize={'2xl'}>{scene.displayName}</Text>
                      <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Skin Viewer Scenes!</Text>
                    </Flex>
                  </Flex>
                  <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                    <Button disabled={cosmetics?.scene === scene.path ? true : false} onClick={() => {setCosmetics({...cosmetics, scene: scene.path})}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          } 
        </Flex>
      </Flex>
      <Button my={'10vh'} fontSize={'2xl'} onClick={saveChanges} bgColor={'green.300'} borderColor={'green.500'} border={'2px solid #9f9'} w={'6vw'} h={'5vh'}>Save</Button>
    </Flex>
  )
}