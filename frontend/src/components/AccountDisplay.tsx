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
    <Flex>
        <Menu autoSelect={false} closeOnSelect={false}>
            <MenuButton>
                <Image src={`/image/${data?.avatar}`} borderRadius={'50%'} w={'50px'} border={'2px solid black'}/>
            </MenuButton>
            <MenuList>
                <MenuGroup>
                    <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} my={1}>
                        <Text fontSize={'xl'}>{data?.username}</Text>
                    </Flex>
                </MenuGroup>
                <MenuDivider/>
                <MenuGroup title='Stats' fontSize={'lg'}>

                    <Tooltip label='Collect tokens by vising the website. Used to open Brawl Boxes.' placement='left' className='heading-md' hasArrow>
                        <MenuItem>{`Tokens: ${data?.tokens ? data.tokens : 0}`}</MenuItem>
                    </Tooltip>
                    
                    <Tooltip label='For every token collected, receive an additional token as a bonus.' placement='left' className='heading-md' hasArrow>
                        <MenuItem>{`Tokens Remaining: ${data?.tokenDoubler ? data.tokenDoubler : 0}`}</MenuItem>    
                    </Tooltip>
                    
                    <Tooltip label='Use these to trade pins with other users.' placement='left' className='heading-md' hasArrow>
                        <MenuItem>{`Trade Credits: ${data?.tradeCredits ? data.tradeCredits : 0}`}</MenuItem>    
                    </Tooltip>
    
                </MenuGroup>
                <MenuDivider/>
                <MenuItem onClick={() => {window.location.href = "/account"}}>Account</MenuItem>
                <MenuItem onClick={() => {window.location.href = "/collection"}}>Collection</MenuItem>
                <MenuItem icon={<MdOutlineLogout fontSize={'22px'}/>} onClick={() => {localStorage.removeItem('token'); window.location.reload()}}>Log Out</MenuItem>
                
            </MenuList>
        </Menu>
    </Flex>
  )
}