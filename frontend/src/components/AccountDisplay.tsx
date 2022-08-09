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
    } from '@chakra-ui/react'
import axios from 'axios'
import {UserInfoProps} from '../types/AccountData'


export default function AccountDisplay() {

    const [data, setData] = useState<UserInfoProps>()

    useEffect(() => {
        axios.post('/resources', {token: localStorage.getItem('token')})
            .then((res) => {
                setData(res.data)
            }).catch(function(error) {
                if (error.response.status === 400 || error.response.status === 401){
                    localStorage.removeItem('token')
                }
            })
    }, [])
  return (
    <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
        <Menu autoSelect={false} closeOnSelect={false}>
            <MenuButton>
                <Image src={`/image/${data?.avatar}`} borderRadius={'50%'} w={'50px'} border={`3px solid ${data?.avatarColor}`}/>
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
                <MenuItem onClick={() => {window.location.href = "/account"}}>Account</MenuItem>
                <MenuItem onClick={() => {window.location.href = "/collection"}}>Collection</MenuItem>
                <MenuItem icon={<MdOutlineLogout fontSize={'22px'}/>} onClick={() => {localStorage.removeItem('token'); window.location.reload()}}>Log Out</MenuItem>
                
            </MenuList>
        </Menu>
        <Tooltip label='Tokens are used to open Brawl Boxes. Collect them by vising the website regularly!' placement={'bottom-start'}>
            <Flex justifyContent={'center'} alignItems={'center'} textAlign={'center'} mt={1}> 
                <Image maxW={'25px'} src={'/image/resources/resource_tokens.webp'} mr={1}/>
                <Text fontSize={'xl'}>{data?.tokens}</Text>
            </Flex>
        </Tooltip>
    </Flex>
  )
}