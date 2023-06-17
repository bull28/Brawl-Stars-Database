import { Button, Flex, Image, Text, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData, ThemeProps} from "../types/CosmeticData";
import {scrollStyle} from "../themes/scrollbar";
import api from "../helpers/APIRoute";



export default function Gallery() {
  const [data, setData] = useState<ThemeProps>()
  const [cosmetics, setCosmetics] = useState<CosmeticData>()

  const updateCosmeticItem = (cosmetics: CosmeticData, key: string, value: string): CosmeticData => {
    const newCosmetics: CosmeticData = {
      background: cosmetics.background,
      icon: cosmetics.icon,
      music: cosmetics.music,
      scene: cosmetics.scene
    };

    if (newCosmetics.hasOwnProperty(key)){
      newCosmetics[key as keyof CosmeticData] = value;
    }

    return newCosmetics;
  }

  useEffect(() => {
    AuthRequest<ThemeProps>("/theme", {setState: setData});
    AuthRequest<CosmeticData>("/cosmetic", {setState: setCosmetics});
  }, [])

  const saveChanges = () => {
    AuthRequest<CosmeticData>("/cosmetic", {data: {setCosmetics: cosmetics}, message: {title: 'Changes Saved!', status: 'success', duration: 3000}, errorToastMessage: 'Something Went Wrong!'});
  }


  return (
    <Flex alignItems={'center'} flexDir={'column'} justifyContent={'space-between'} maxH={'100vh'}>      
      {cosmetics && <SkullBackground bg={cosmetics.background} icon={cosmetics.icon}/>}
      <Flex flexDir={"column"} alignItems={"center"}>
        <Text fontSize={"4xl"} className={"heading-4xl"}>Gallery</Text>
      </Flex>
      {(typeof data !== "undefined" && typeof cosmetics !== "undefined") ?
      <>
      <Flex w={'70vw'} justifyContent={'space-around'} mt={'2vh'}>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Backgrounds</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={scrollStyle}>
            {data?.background.map((bg) => (
              <Flex key={bg.path + bg.displayName} bgColor={(cosmetics?.background === bg.path || ( !cosmetics?.background && bg.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} src={`${api}/image/${bg.path}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{bg.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.background === bg.path || ( !cosmetics?.background && bg.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics(updateCosmeticItem(cosmetics, "background", bg.path))}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Icons</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={scrollStyle}>
            {data?.icon.map((icon) => (
              <Flex key={icon.path + icon.displayName} bgColor={(cosmetics?.icon === icon.path || ( !cosmetics?.icon && icon.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`${api}/image/${icon.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{icon.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Background Icons!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.icon === icon.path || ( !cosmetics?.icon && icon.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics(updateCosmeticItem(cosmetics, "icon", icon.path))}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
      <Flex w={'70vw'} justifyContent={'space-around'} mt={'2vh'}>
        <Flex flexDir={'column'} alignItems={'center'}>
          <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Music</Text>        
          <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={scrollStyle}>
            {data?.music.map((music) => (
              <Flex key={music.path + music.displayName} bgColor={(cosmetics?.music === music.path || ( !cosmetics?.music && music.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                <Flex>
                  <Image  borderRadius={'lg'} border={'2px solid'} borderColor={'black'} w={'15vh'} h={'15vh'} boxShadow={'0px 0px 25px #fff'}/>
                  <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                    <Text className="heading-2xl" fontSize={'2xl'}>{music.displayName}</Text>
                    <Text fontSize={'sm'} className="heading-md">Personalize the Website with a New Background Track!</Text>
                  </Flex>
                </Flex>
                <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                  <Button disabled={(cosmetics?.music === music.path || ( !cosmetics?.music && music.displayName === 'Default' ) ) ? true : false} onClick={() => {setCosmetics(updateCosmeticItem(cosmetics, "music", music.path))}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        {data && data.scene.length > 0 &&
          <Flex flexDir={'column'} alignItems={'center'}>
            <Text fontSize={'3xl'} className={'heading-3xl'} mb={'5'}>Scenes</Text>      
              <Flex bgColor={'blue.500'} flexDir={'column'} py={'1%'} px={'1.5%'} borderRadius={'lg'} border={'3px solid'} borderColor={'blue.700'} overflowY={'auto'} maxH={'80vh'} sx={scrollStyle}>
                {data?.scene.map((scene) => (
                  <Flex key={scene.path + scene.displayName} bgColor={(cosmetics?.scene === scene.path || ( !cosmetics?.scene && scene.displayName === 'Default' ) ) ? 'green.300' : 'lightskyblue'} justifyContent={'space-between'} p={4} borderRadius={'lg'} my={'1%'} border={'2px solid black'}>
                    <Flex>
                      <Image bgColor={'black'} borderRadius={'lg'} border={'2px solid'} borderColor={'white'} w={'15vh'} h={'15vh'} src={`${api}/image/${scene.preview}`} boxShadow={'0px 0px 25px #fff'}/>
                      <Flex flexDir={'column'} ml={'5%'} h={'11vh'}  justifyContent={'space-between'}>
                        <Text className="heading-2xl" fontSize={'2xl'}>{scene.displayName}</Text>
                        <Text fontSize={'sm'} className="heading-md" maxW={'90%'}>Personalize the Website with New Skin Viewer Scenes!</Text>
                      </Flex>
                    </Flex>
                    <Flex flexDir={'column'} h={'13vh'} justifyContent={'space-around'}>                  
                      <Button disabled={cosmetics?.scene === scene.path ? true : false} onClick={() => {setCosmetics(updateCosmeticItem(cosmetics, "scene", scene.path))}} fontSize={'xl'} bgColor={'green.500'}>Use</Button>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
          </Flex>
        }
      </Flex>
      <Button my={'10vh'} fontSize={'2xl'} onClick={saveChanges} bgColor={'green.300'} borderColor={'green.500'} border={'2px solid #9f9'} w={'6vw'} h={'5vh'}>Save</Button>
      </>
      :
      <Flex flexDir={'column'} alignItems={'center'} w={'100vw'} h={'100vh'} justifyContent={'center'} pos={'absolute'} zIndex={-1}>
        <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} bgColor={'lightskyblue'} border={'2px solid'} borderColor={'blue.500'} borderRadius={'lg'} p={5}>
          <Text fontSize={'2xl'} className={'heading-2xl'} >Please login to view the Gallery</Text>
          <Link fontSize={'2xl'} className={'heading-xl'} color={'blue.300'} href="/login">Click here to login</Link>
        </Flex>
      </Flex>
    }
    </Flex>
  )
}