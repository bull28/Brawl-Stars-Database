import { useEffect, useState } from 'react'
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
/*

switch between accounts
remove accounts


*/


export default function AccountDisplay() {
    const [data, setData] = useState<UserInfoProps>()
    const [tokenData, setTokenData] = useState<any>()

    const { isOpen, onOpen, onClose } = useDisclosure()

    
    useEffect(() => {
        
        AuthRequest('/resources', {setState: [{func: setData, attr: ""}]})

        setTokenData(JSON.parse(localStorage.getItem('tokens') || "{}"))
    }, [])


  return (
    <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
        <Menu autoSelect={false} closeOnSelect={false}>
            <MenuButton>
                <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} p={'3px'} background={(data?.avatarColor === 'rainbow' ? 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' : data?.avatarColor)}>
                    <Image loading={'eager'} src={`/image/${data?.avatar}`} borderRadius={'50%'} w={'50px'}/>
                </Flex>
            </MenuButton>
            <MenuList>
                <MenuGroup>
                    <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} my={1}>
                        <Text fontSize={'xl'}>{data?.username}</Text>
                    </Flex>
                </MenuGroup>
                <MenuDivider/>
                <MenuGroup title='Resources' fontSize={'lg'}>

                    <Tooltip label='Tokens are used to open Brawl Boxes. Collect them by vising the website regularly!' placement='left' className='heading-md' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={'/image/resources/resource_tokens.webp'} mr={2}/>{`${data?.tokens ? data.tokens : 0}`}</MenuItem>
                    </Tooltip>

                    <Tooltip label='Token Doubler gives you a bonus token for every token you receieve!' placement='left' className='heading-md' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={'/image/resources/resource_token_doubler.webp'} mr={2}/>{`${data?.tokenDoubler ? data.tokenDoubler : 0}`}</MenuItem>    
                    </Tooltip>

                    <Tooltip label='Coins are used to buy special avatars. Find them in Brawl Boxes!' placement='left' className='heading-md' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={'/image/resources/resource_coins.webp'} mr={2}/>{`${data?.coins ? data.coins : 0}`}</MenuItem>
                    </Tooltip>
                    
                    <Tooltip label='Trade Tokens are used to trade pins with other users!' placement='left' className='heading-md' hasArrow>
                        <MenuItem><Image maxW={'30px'} src={'/image/resources/resource_trade_credits.webp'} mr={2}/>{`${data?.tradeCredits ? data.tradeCredits : 0}`}</MenuItem>    
                    </Tooltip>
    
                </MenuGroup>
                <MenuDivider/>
                <MenuItem icon={<BsPerson fontSize={'22px'}/>} onClick={() => {window.location.href = "/account"}}>Account</MenuItem>
                <MenuItem icon={<BsCollection fontSize={'22px'}/>} onClick={() => {window.location.href = "/collection"}}>Collection</MenuItem>
                <MenuItem icon={<HiOutlineSwitchHorizontal fontSize={'22px'}/>} onClick={onOpen}>Switch Accounts</MenuItem>
                <MenuItem icon={<MdOutlineLogout fontSize={'22px'}/>} onClick={() => {localStorage.removeItem('username'); window.location.reload()}}>Log Out</MenuItem>
                
            </MenuList>
        </Menu>
        <Tooltip label='Tokens are used to open Brawl Boxes. Collect them by vising the website regularly!' placement={'bottom-start'}>
            <Flex justifyContent={'center'} alignItems={'center'} textAlign={'center'} mt={1}> 
                <Image maxW={'25px'} src={'/image/resources/resource_tokens.webp'} mr={1}/>
                <Text fontSize={'xl'}>{data?.tokens}</Text>
            </Flex>
        </Tooltip>
        <Drawer isOpen={isOpen} placement={'right'} onClose={onClose}>
            <DrawerOverlay/>
            <DrawerContent>
                <DrawerCloseButton/>
                <DrawerHeader borderBottomWidth={'1px'}>
                    Accounts
                </DrawerHeader>

                <DrawerBody sx={{
                        '&::-webkit-scrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.5)`,
                        borderRadius: `6px`,
                        },
                    }}>
                    {
                        tokenData && Object.keys(tokenData).map((token) => (

                            <>
                                <AccountMenuDisplay username={token} token={tokenData[token]}/>
                            </>

                        ))
                        
                    }
                </DrawerBody>

                <DrawerFooter>
                    <Button colorScheme={'facebook'} onClick={onClose}>
                        Done
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    </Flex>
  )
}