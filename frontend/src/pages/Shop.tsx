import { Box, Flex, HStack, Image, Link, ScaleFade, SimpleGrid, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BsEmojiLaughing, BsPalette, BsPerson } from 'react-icons/bs'
import { MdOutlineGeneratingTokens } from 'react-icons/md'
import MovingText from '../components/MovingText'
import ShopItem from '../components/ShopItem'
import AuthRequest, { getToken } from '../helpers/AuthRequest'
import { RainbowBorder } from '../themes/animations'
import { UserInfoProps } from '../types/AccountData'
import ShopData from '../types/ShopData'
import EventTime from '../helpers/EventTime'

interface Timer {
    start: number,
    offset: number
}

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

    const [timer, updateTimer] = useState<Timer>({start: Date.now(), offset: 0});
    const [initialTimeLeftms, setNewInitialTime] = useState<number>(((86400 + (new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 - new Date().getHours() * 3600 - new Date().getMinutes() * 60 - new Date().getSeconds()) % 86400) * 1000);
    const [secondsLeft, updateSecondsLeft] = useState<number>(Math.floor(initialTimeLeftms / 1000));

    useEffect(() => {        
        const timer = setInterval(() => {
            updateTimer((previousTime) => {
                var elapsed: number = Date.now() - previousTime.start;

                let timeLeft: number = Math.floor((initialTimeLeftms - elapsed) / 1000);
                if (timeLeft >= 3600){
                    updateSecondsLeft(Math.floor(timeLeft / 60) * 60);
                } else{
                    updateSecondsLeft(timeLeft);
                }
                if (initialTimeLeftms - elapsed < -1000){
                    window.location.reload();
                    setNewInitialTime(86400000);
                    return {
                        start: Date.now(),
                        offset: 0
                    };
                }
                return {
                    start: previousTime.start,
                    offset: elapsed
                };
            });
        }, 200)

        return () => {
            clearInterval(timer)
        }                    
    }, [initialTimeLeftms, timer, secondsLeft])

    useEffect(() => {
        AuthRequest('/shop', {setState: [{func: setData, attr: ""}]})
        AuthRequest('/resources', {setState: [{func: setUserInfo, attr: ""}]})
    }, [])

    return (
        <Flex flexDir={'column'} alignItems={'center'} minH={'100vh'}>
            <Flex zIndex={'-1'} w={'100%'} h={'100%'} pos={'absolute'} backgroundImage={require(`../assets/shopbackground${season}.webp`)} backgroundAttachment={'fixed'} backgroundRepeat={'no-repeat'} objectFit={'cover'}>            
            </Flex>
            <MovingText title="Shop" color1="#fdf542" color2="#ff9005" fontSize='3xl'/>
            { getToken() ? <>
            <Flex pos={'absolute'} right={3} top={3}>
                <Flex justifyContent={'center'} alignItems={'center'} p={3} pl={2} pos={'relative'} borderRadius={'lg'}>
                    <Box w={'100%'} h={'100%'} pos={'absolute'} zIndex={'-1'} bgColor={'blue.500'}border={'2px solid'} borderRadius={'lg'} borderColor={'blue.800'}/>
                    <Flex bgColor={'gray.100'} alignItems={'center'} py={2} px={5} borderRadius={'lg'} boxShadow={'rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;'}>
                        <Text className={'heading-lg'}>{userInfo?.coins}</Text>
                        <Image ml={1} maxH={'40px'} src={`/image/resources/resource_coins.webp`}/>
                    </Flex>
                    <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} animation={(userInfo?.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} border={(userInfo?.avatarColor !== 'rainbow') ? `3px solid ${userInfo?.avatarColor}` : ''} ml={3}>
                        <Image loading={'eager'} src={`/image/${userInfo?.avatar}`} borderRadius={'50%'} w={'50px'}/>
                    </Flex>
                </Flex>
            </Flex>
            <Flex flexDir={'column'} alignItems={'center'} pb={'5vh'} pt={'10vh'}>  
                {
                    data?.map((item) => (
                        (item.name === 'featuredItem') && <ScaleFade in={true}><ShopItem data={item} coins={userInfo?.coins || 0} isFeatured={true} timeLeftString={EventTime({season: 0, hour: Math.floor(secondsLeft / 3600), minute: Math.floor(secondsLeft / 60) % 60, second: secondsLeft % 60, hoursPerSeason: 336, maxSeasons: 2}, 0)}/></ScaleFade>
                    ))
                }               
            </Flex>  
            <Flex w={'90%'} justifyContent={'left'}>
                <Flex justifyContent={'space-between'} flexDir={'column'} p={5}>                              
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'}  fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Avatars</Text>
                            <BsEmojiLaughing color={'black'}/>                            
                        </Flex>                        
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.includes('avatar') && <ScaleFade in={true}><ShopItem data={item} coins={userInfo?.coins || 0} timeLeftString={""}/></ScaleFade>
                            ))
                        }
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'}  fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Brawlers</Text>
                            <BsPerson color={'black'}/>
                        </Flex>                        
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.includes('brawler') && <ScaleFade in={true}><ShopItem data={item} coins={userInfo?.coins || 0} timeLeftString={""}/></ScaleFade>
                            ))
                        }
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'}  fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Currency</Text>
                            <MdOutlineGeneratingTokens color={'black'}/>
                        </Flex>
                        <HStack>
                        {
                            data?.map((item) => (
                                item.name.toLowerCase().includes('credit') && <ScaleFade in={true}><ShopItem data={item} coins={userInfo?.coins || 0} timeLeftString={""}/></ScaleFade>
                            ))
                        }
                        </HStack>
                    </Flex>
                    <Flex flexDir={'column'}>
                        <Flex alignItems={'center'}  fontSize={'3xl'} className={'heading-3xl'} ml={5} mb={3} mt={'5vh'}>
                            <Text mr={1}>Themes</Text>
                            <BsPalette color={'black'}/>
                        </Flex>
                        <SimpleGrid columns={7} spacing={3}>
                        {
                            data?.map((item) => (
                                item.name.toLowerCase().includes('theme') && <ScaleFade in={true}><ShopItem data={item} coins={userInfo?.coins || 0} timeLeftString={""}/></ScaleFade>
                            ))
                        }
                        </SimpleGrid>
                    </Flex>
                    
                </Flex>
                
            </Flex>
            </>
            :
            <>
            <Flex flexDir={'column'} alignItems={'center'} w={'100vw'} h={'100vh'} justifyContent={'center'} pos={'absolute'}>
                <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} bgColor={'lightskyblue'} border={'2px solid'} borderColor={'blue.500'} borderRadius={'lg'} p={5}>
                    <Text fontSize={'2xl'} className={'heading-2xl'} >Please Login to View the Shop</Text>
                    <Link fontSize={'2xl'} className={'heading-xl'} color={'blue.300'} href="/login">Click here to login</Link>
                </Flex>
            </Flex>

            </>
        }
            
            

        </Flex>
    )
}