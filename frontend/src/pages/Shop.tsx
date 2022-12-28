import { Box, Button, Divider, Flex, HStack, Image, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BsPerson } from 'react-icons/bs'
import { FaSkull } from 'react-icons/fa'
import { MdOutlineFeaturedPlayList, MdOutlineGeneratingTokens } from 'react-icons/md'
import ShopItem from '../components/ShopItem'
import AuthRequest from '../helpers/AuthRequest'
import { UserInfoProps } from '../types/AccountData'
import ShopData from '../types/ShopData'



export default function Shop() {

    const [data, setData] = useState<[ShopData]>()
    const [userInfo, setUserInfo] = useState<UserInfoProps>()

    const getSeason = (month: number) => {
        if (2 <= month && month <= 4){
            return 0
        }

        if (5 <= month && month <= 7){
            return 1
        }

        if (8 <= month && month <= 10){
            return 2
        }

        return 3
    }

    const season = getSeason(new Date().getMonth())

    useEffect(() => {
        AuthRequest('/shop', {setState: [{func: setData, attr: ""}]})
        AuthRequest('/resources', {setState: [{func: setUserInfo, attr: ""}]})
    }, [])

    //make sections currency, brawlers, special offers
    //make click on button scroll to the type

    return (
        <Flex flexDir={'column'} alignItems={'center'}>
            <Flex zIndex={'-1'} w={'100%'} h={'100%'} pos={'absolute'} backgroundImage={require(`../assets/shopbackground${season}.jpg`)} backgroundAttachment={'fixed'} backgroundRepeat={'no-repeat'}  objectFit={'cover'}>            
            </Flex>
            <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'}>Shop</Text>
            <Flex pos={'absolute'} right={3} top={3}>
                <Flex justifyContent={'center'} alignItems={'center'} p={3} pl={2} pos={'relative'} borderRadius={'lg'}>
                    <Box w={'100%'} h={'100%'} pos={'absolute'} zIndex={'-1'} bgColor={'blue.500'}border={'2px solid'} borderRadius={'lg'} borderColor={'blue.800'}/>
                    <Flex bgColor={'gray.100'} alignItems={'center'} py={2} px={5} borderRadius={'lg'} boxShadow={'rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;'}>
                        <Text>{userInfo?.coins}</Text>
                        <Image ml={1} maxH={'40px'} src={`/image/resources/resource_coins.webp`}/>
                    </Flex>
                    <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} p={'3px'} background={(userInfo?.avatarColor === 'rainbow' ? 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' : userInfo?.avatarColor)} ml={3}>
                        <Image loading={'eager'} src={`/image/${userInfo?.avatar}`} borderRadius={'50%'} w={'50px'}/>
                    </Flex>
                </Flex>
            </Flex>
            <Flex flexDir={'column'} alignItems={'center'} w={'40vw'} pos={'relative'} py={5}>
                <Box  w={'100%'} h={'100%'} bgColor={'gold'} pos={'absolute'} borderRadius={'lg'} border={'3px solid black'} opacity={'0.6'} zIndex={'-1'}/>
                <Flex alignItems={'center'}>
                    <Text>Featured</Text>
                    <MdOutlineFeaturedPlayList/>
                </Flex>
                <Flex>
                    {
                        /*
                        data?.map((item) => (
                            item.name.includes('featured') && <ShopItem data={item}/>
                        ))
                        */
                       data?.map((item, x) => (
                            (x === 3) && <ShopItem data={item}/>
                       ))
                    }     
                </Flex>           
            </Flex>  
            <Flex w={'90%'} justifyContent={'left'}>
                <Flex justifyContent={'space-between'} flexDir={'column'} p={5}>                              
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'} color={'white'} fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Avatars</Text>
                            <BsPerson color={'black'}/>                            
                        </Flex>                        
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.includes('avatar') && <ShopItem data={item}/>
                            ))
                        }
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'} color={'white'} fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Brawlers</Text>
                            <FaSkull/>
                        </Flex>                        
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.includes('brawler') && <ShopItem data={item}/>
                            ))
                        }
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'} color={'white'} fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Currency</Text>
                            <MdOutlineGeneratingTokens/>
                        </Flex>
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.toLowerCase().includes('credit') && <ShopItem data={item}/>
                            ))
                        }
                        </HStack>
                    </Flex>
                </Flex>
            </Flex>
            
            

        </Flex>
    )
}