import { Box, Flex, Image, Link, ScaleFade, SimpleGrid, Text } from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { BsEmojiLaughing, BsPalette, BsPerson } from 'react-icons/bs'
import { MdOutlineGeneratingTokens } from 'react-icons/md'
import { BiLandscape } from 'react-icons/bi'
import ShopItem from '../components/ShopItem'
import AuthRequest from '../helpers/AuthRequest'
import { RainbowBorder } from '../themes/animations'
import { UserInfoProps } from '../types/AccountData'
import ShopData from '../types/ShopData'
import EventTime from '../helpers/EventTime'
import BackButton from "../components/BackButton";
import cdn from "../helpers/CDNRoute";

interface Timer{
    start: number;
    offset: number;
}

interface Category{
    name: string;
    search: string;
    icon: JSX.Element;
    items: ShopData[];
}

interface ShopItemCategories{
    currency: Category;
    brawlers: Category;
    accessories: Category;
    avatars: Category;
    themes: Category;
    scenes: Category;
}

export default function Shop() {
    const [featured, setFeatured] = useState<ShopData | undefined>();
    const [userInfo, setUserInfo] = useState<UserInfoProps | undefined>();
    const [items, setItems] = useState<ShopItemCategories | undefined>();
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>();
    const [featuredLoaded, setFeaturedLoaded] = useState<boolean>(false);

    const [timer, updateTimer] = useState<Timer>({start: Date.now(), offset: 0});
    const [initialTimeLeftms, setNewInitialTime] = useState<number>(((86400 + (new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 - new Date().getHours() * 3600 - new Date().getMinutes() * 60 - new Date().getSeconds()) % 86400) * 1000);
    const [secondsLeft, updateSecondsLeft] = useState<number>(Math.floor(initialTimeLeftms / 1000));

    const getItems = useCallback(() => {
        AuthRequest<ShopData[]>("/shop", {setState: (items: ShopData[]) => {
            const sortedItems: ShopItemCategories = {
                currency: {name: "Currency", search: "credit", icon: <MdOutlineGeneratingTokens color={'black'}/>, items: []},
                brawlers: {name: "Brawlers", search: "brawler", icon: <BsPerson color={'black'}/>, items: []},
                accessories: {name: "Accessories", search: "accessory", icon: <BsPerson color={'black'}/>, items: []},
                avatars: {name: "Avatars", search: "avatar", icon: <BsEmojiLaughing color={'black'}/>, items: []},
                themes: {name: "Themes", search: "theme", icon: <BsPalette color={'black'}/>, items: []},
                scenes: {name: "Scenes", search: "scene", icon: <BiLandscape color={'black'}/>, items: []}
            };
    
            let featuredItem: ShopData | undefined;
            for (let x = 0; x < items.length; x++){
                if (items[x].name === "featuredItem"){
                    featuredItem = items[x];
                } else{
                    for (let y in sortedItems){
                        if (items[x].name.toLowerCase().includes(sortedItems[y as keyof ShopItemCategories].search)){
                            sortedItems[y as keyof ShopItemCategories].items.push(items[x]);
                        }
                    }
                }
            }
            setFeatured(featuredItem);
            
            setItems(sortedItems);
        }, fallback: () => setLoggedIn(false)});      
        AuthRequest<UserInfoProps>("/resources", {setState: setUserInfo}, false);
    }, [setUserInfo]);

    useEffect(() => {        
        const id = setTimeout(() => {
            updateTimer((previousTime) => {
                let elapsed: number = Date.now() - previousTime.start;

                let timeLeft: number = Math.floor((initialTimeLeftms - elapsed) / 1000);
                if (timeLeft >= 3600){
                    updateSecondsLeft(Math.floor(timeLeft / 60) * 60);
                } else{
                    updateSecondsLeft(timeLeft);
                }
                if (initialTimeLeftms - elapsed < -1000){
                    getItems();
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
        }, 500);

        return (() => {
            clearTimeout(id);
        });
    }, [initialTimeLeftms, timer, secondsLeft, getItems]);

    useEffect(() => {
        //AuthRequest<ShopData[]>("/shop", {setState: organizeData, fallback: () => setLoggedIn(false)});      
        //AuthRequest<UserInfoProps>("/resources", {setState: setUserInfo}, false);
        getItems();
    }, [getItems]);

    return (
        <Flex flexDir={'column'} alignItems={'center'} minH={'101vh'} pb={featuredLoaded ? '5vh' : '5vh'} transition={'padding-bottom 0.5s ease-out'}>
            <Flex zIndex={'-1'} w={'100%'} h={'100%'} pos={'fixed'} alignItems={'center'} justifyContent={'center'}>
                <Image objectFit={'cover'} w={'100%'} h={'100%'} src={require(`../assets/shopbackground${Math.floor(((((new Date().getMonth() - 2) % 12) + 12) % 12) / 3)}.webp`)}/>
            </Flex>
            <BackButton/>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Shop</Text>
            {userInfo &&
                <>
                <Flex pos={['relative', 'relative', 'absolute', 'absolute', 'absolute']} right={3} top={3}>
                    <Flex justifyContent={'center'} alignItems={'center'} p={3} pl={2} pos={'relative'} borderRadius={'lg'}>
                        <Box w={'100%'} h={'100%'} pos={'absolute'} zIndex={'-1'} bgColor={'blue.500'}border={'2px solid'} borderRadius={'lg'} borderColor={'blue.800'}/>
                        <Flex bgColor={'gray.100'} alignItems={'center'} py={2} px={5} borderRadius={'lg'} boxShadow={'rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;'}>
                            <Text className={'heading-lg'}>{userInfo.coins}</Text>
                            <Image ml={1} w={'30px'} h={'30px'} src={`${cdn}/image/resources/currency/resource_coins.webp`}/>
                        </Flex>
                        <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} animation={(userInfo.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} border={(userInfo.avatarColor !== 'rainbow') ? `3px solid ${userInfo.avatarColor}` : ''} ml={3}>
                            <Image loading={'eager'} src={`${cdn}/image/${userInfo.avatar}`} borderRadius={'50%'} w={'50px'} h={'50px'}/>
                        </Flex>
                    </Flex>
                </Flex>
                <Flex flexDir={'column'} alignItems={'center'} pb={'5vh'} pt={'10vh'}>  
                    {featured &&
                        <ScaleFade in={true} onViewportEnter={() => setFeaturedLoaded(true)}>
                            <ShopItem data={featured} coins={userInfo.coins} isFeatured={true} timeLeftString={EventTime({season: 0, hour: Math.floor(secondsLeft / 3600), minute: Math.floor(secondsLeft / 60) % 60, second: secondsLeft % 60, hoursPerSeason: 336, maxSeasons: 2}, 0)} onBuyItem={() => getItems()}/>
                        </ScaleFade>
                    }
                </Flex>
                <Flex w={'90%'} justifyContent={'left'}>
                    {items &&
                        <Flex justifyContent={'space-between'} flexDir={'column'} p={[0, 2, 4, 5, 5]}>
                            {Object.keys(items).map((key) => {
                                const value = items[key as keyof ShopItemCategories];

                                return (value.items.length > 0) && (
                                    <Flex key={key} flexDir={'column'}>
                                        <Flex alignItems={'center'} fontSize={'3xl'} className={'heading-3xl'} ml={[0, 2, 5, 5, 5]} mb={[1, 2, 3, 3, 3]} mt={'5vh'}>
                                            <Text mr={1}>{value.name}</Text>
                                            {value.icon}
                                        </Flex>                        
                                        <SimpleGrid columns={[2, 3, 4, 5, 6, 7]} spacing={3}>
                                            {value.items.map((item) => (
                                                <ScaleFade key={item.name} in={true}><ShopItem data={item} coins={userInfo.coins} timeLeftString={""} onBuyItem={() => getItems()}/></ScaleFade>
                                            ))}
                                        </SimpleGrid>
                                    </Flex>
                                );
                            })}
                        </Flex>
                    }
                </Flex>
                </>
            }
            {loggedIn === false &&
                <Flex flexDir={'column'} alignItems={'center'} w={'100%'} h={'100%'} justifyContent={'center'} pos={'absolute'}>
                    <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} bgColor={'lightskyblue'} border={'2px solid'} borderColor={'blue.500'} borderRadius={'lg'} p={5}>
                        <Text fontSize={'2xl'} className={'heading-2xl'} >Please Login to View the Shop</Text>
                        <Link as={RouterLink} fontSize={'2xl'} className={'heading-xl'} color={'blue.300'} to={`/login?${new URLSearchParams({next: "/shop"})}`}>Click here to login</Link>
                    </Flex>
                </Flex>
            }
        </Flex>
    )
}
