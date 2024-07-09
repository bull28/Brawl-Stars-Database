import { useEffect, useState, useCallback } from 'react'
import { MdOutlineLogout } from 'react-icons/md'
import { Flex, Text, Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuGroup,
    MenuDivider, 
    Tooltip,
    Image,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Button
    } from '@chakra-ui/react'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi'
import { BsPerson, BsCollection } from 'react-icons/bs'
import {UserInfoProps} from '../types/AccountData'
import AccountMenuDisplay from './AccountMenuDisplay'
import AuthRequest from '../helpers/AuthRequest'
import { useNavigate } from 'react-router-dom'
import { RainbowBorder } from '../themes/animations'
import {displayShort, displayLong} from '../helpers/LargeNumberDisplay'
import { AxiosError } from 'axios'
import {scrollStyle} from "../themes/scrollbar";
import cdn from "../helpers/CDNRoute";

type TokenStorage = {[k: string]: string;};

function parseTokens(text: string | null): TokenStorage{
    if (text === null || text === undefined){
        return {};
    }

    try{
        let data = JSON.parse(text);

        const tokens: TokenStorage = {};

        for (let x in data){
            if (typeof x === "string" && typeof data[x] === "string"){
                tokens[x] = data[x];
            }
        }

        return data;
    } catch (error){}
    
    return {}
}


export default function AccountDisplay() {
    const [data, setData] = useState<UserInfoProps | undefined>()
    const [tokenData, setTokenData] = useState<TokenStorage>({})
    const [removing, toggleRemoving] = useState<boolean>(false)
    const [invalid, setInvalid] = useState<boolean>(false)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const navigate = useNavigate()

    const loadAccount = useCallback(() => {
        AuthRequest<UserInfoProps>("/resources", {setState: setData, fallback: (e) => {
            const error = e as AxiosError;
            if (error.response !== undefined){
                if (error.response.status === 404){
                    setInvalid(true);
                } else if (error.response.status === 401){
                    setData(undefined);
                }
            }
        }}, false);
        setTokenData(parseTokens(localStorage.getItem("tokens")));
    }, []);

    const logOut = () => {
        localStorage.removeItem('username');
        document.dispatchEvent(new CustomEvent("reloadaudio"));
        setData(undefined);
    };
    
    useEffect(() => {
        loadAccount();
    }, [loadAccount]);


    return (
    <>
    {data !== undefined ? <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
        {invalid && <Button fontSize={"lg"} className={"heading-lg"} color={"#fff"} onClick={logOut}>Log out</Button>}
        <Menu autoSelect={false} closeOnSelect={false}>
            <MenuButton>
                <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} border={(data.avatarColor !== 'rainbow') ? `3px solid ${data.avatarColor}` : ''} animation={(data.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''}>
                    <Image loading={'eager'} src={data !== void 0 ? `${cdn}/image/${data.avatar}` : undefined} borderRadius={'50%'} w={'50px'}/>
                </Flex>
            </MenuButton>
            <MenuList>
                <MenuGroup>
                    <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} my={1}>
                        <Text fontSize={`${Math.min(20, 300 / Math.max(1, data.username.length))}px`}>{data.username}</Text>
                    </Flex>
                </MenuGroup>
                <MenuDivider/>
                <MenuGroup>

                    <Tooltip label='Tokens are used to open Brawl Boxes and purchase rewards from Bullgame. Collect them by visiting the website regularly!' placement='left' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={`${cdn}/image/resources/resource_tokens.webp`} mr={2}/>{`${displayLong(data.tokens)}`}</MenuItem>
                    </Tooltip>

                    <Tooltip label='Token Doubler gives you a bonus token for every token you receive!' placement='left' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={`${cdn}/image/resources/resource_token_doubler.webp`} mr={2}/>{`${displayLong(data.tokenDoubler)}`}</MenuItem>    
                    </Tooltip>

                    <Tooltip label='Coins are used to buy brawlers and cosmetic items. Collect them from Brawl Boxes and Bullgame!' placement='left' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={`${cdn}/image/resources/resource_coins.webp`} mr={2}/>{`${displayLong(data.coins)}`}</MenuItem>
                    </Tooltip>
                    
                    <Tooltip label='Trade Credits are used to trade pins with other users!' placement='left' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={`${cdn}/image/resources/resource_trade_credits.webp`} mr={2}/>{`${displayLong(data.tradeCredits)}`}</MenuItem>    
                    </Tooltip>

                </MenuGroup>
                <MenuDivider/>
                <MenuGroup>
                    <Tooltip label='Mastery Points are used to unlock certain accessories. Collect them by playing Bullgame!' placement='left' hasArrow>
                        <MenuItem>
                        <Flex alignItems={'center'}>
                            <Image maxW={'30px'} src={`${cdn}/image/resources/resource_challenge_points.webp`} mr={2}/>
                            <Flex flexDir={'column'}>
                                <Flex alignItems={"center"}>
                                    <Image h={5} mr={1} src={`${cdn}/image/${data.mastery.current.image}`}/>
                                    <Text color={data.mastery.current.color}>{`Level ${data.mastery.level}`}</Text>
                                </Flex>
                                <Flex>{data.mastery.next.points > 0 ? `${displayLong(data.mastery.points)} / ${displayShort(data.mastery.next.points)}` : `${displayLong(data.mastery.points)}`}</Flex>
                            </Flex>
                        </Flex>
                        </MenuItem>    
                    </Tooltip>
                </MenuGroup>
                <MenuDivider/>
                <MenuItem icon={<BsPerson fontSize={'22px'}/>} onClick={() => {navigate('/account')}}>Account</MenuItem>
                <MenuItem icon={<BsCollection fontSize={'22px'}/>} onClick={() => {navigate('/collection')}}>Collection</MenuItem>
                <MenuItem icon={<HiOutlineSwitchHorizontal fontSize={'22px'}/>} onClick={onOpen}>Switch Accounts</MenuItem>
                <MenuItem icon={<MdOutlineLogout fontSize={'22px'}/>} onClick={logOut}>Log Out</MenuItem>
                
            </MenuList>
        </Menu>
        <Tooltip label='Tokens are used to open Brawl Boxes and purchase rewards from Bullgame. Collect them by visiting the website regularly!' placement={'bottom-start'}>
            {invalid === false ?
                <Flex justifyContent={'center'} alignItems={'center'} textAlign={'center'} mt={1}> 
                    <Image maxW={'25px'} src={`${cdn}/image/resources/resource_tokens.webp`} mr={1}/>
                    <Text  className={'heading-xl'} fontSize={'xl'}>{data?.tokens}</Text>
                </Flex>
                :
                <></>
            }
        </Tooltip>
        <Drawer isOpen={isOpen} placement={'right'} onClose={onClose}>
            <DrawerOverlay/>
            <DrawerContent>
                <DrawerCloseButton/>
                <DrawerHeader borderBottomWidth={'1px'} fontWeight={'normal'}>
                    Accounts
                </DrawerHeader>

                <DrawerBody sx={scrollStyle}>
                    {Object.keys(tokenData).map((token) => (
                        <div key={token}>
                            <AccountMenuDisplay username={token} token={tokenData[token]} toggleRemove={removing} onUpdate={() => {loadAccount(); document.dispatchEvent(new CustomEvent("reloadaudio"));}}/>
                        </div>
                    ))}
                </DrawerBody>

                <DrawerFooter>
                    <Flex w={'100%'} justifyContent={'space-around'} flexDir={['column', 'row', 'row', 'row', 'row']}>
                        <Button onClick={() => {navigate('/login')}} boxShadow={'md'} className={'heading-md'} fontWeight={'normal'}>
                            Add Account
                        </Button>

                        <Button boxShadow={'md'} className={'heading-md'} fontWeight={'normal'} onClick={() => {toggleRemoving(!removing)}}>
                            Remove Account
                        </Button>
                    </Flex>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    </Flex>
    :
    <Button onClick={() => navigate("/login")} fontWeight={"normal"} fontSize={"lg"} className={"heading-lg"} color={"#fff"}>Log In</Button>
    }
    </>
    );
}