import { useEffect, useState } from 'react'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdOutlineLogout } from 'react-icons/md'
import { Flex, Text, Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuGroup,
    MenuDivider, 
    Tooltip,
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
                if (error.response){
                    localStorage.removeItem('token')
                }
            })
    })
  return (
    <Flex>
        <Menu autoSelect={false} closeOnSelect={false}>
            <MenuButton>
                <BsFillPersonFill fontSize={'35px'}/>
            </MenuButton>
            <MenuList>
                <MenuGroup>
                    <Flex w={'100%'} justifyContent={'center'} alignItems={'center'} textAlign={'center'} my={1}>
                        <Text fontSize={'xl'}>{data?.username}</Text>
                    </Flex>
                </MenuGroup>
                <MenuDivider/>
                <MenuGroup title='Stats' fontSize={'lg'}>

                    <Tooltip label='1'>
                        <MenuItem>{`Tokens: ${data?.tokens ? data.tokens : 0}`}</MenuItem>
                    </Tooltip>
                    
                    <Tooltip label='2'>
                        <MenuItem>{`Token Doubler: ${data?.tokenDoubler ? data.tokenDoubler : 0}`}</MenuItem>    
                    </Tooltip>
                    
                    <Tooltip label='3'>
                        <MenuItem>{`Trade Credits: ${data?.tradeCredits ? data.tradeCredits : 0}`}</MenuItem>    
                    </Tooltip>
    
                </MenuGroup>
                <MenuDivider/>
                <MenuItem onClick={() => {window.location.href = "/account"}}>Account</MenuItem>
                <MenuItem icon={<MdOutlineLogout fontSize={'22px'}/>} onClick={() => {localStorage.removeItem('token'); window.location.reload()}}>Log Out</MenuItem>
                
            </MenuList>
        </Menu>
    </Flex>
  )
}