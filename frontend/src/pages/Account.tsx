import { Box, Flex, FormControl, FormHelperText, FormLabel, Icon, Image, Input, InputGroup, Stack, Text, useToast } from "@chakra-ui/react";
import axios from 'axios'
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserInfoProps } from "../types/AccountData";
import { MdOutlineEdit } from 'react-icons/md'
import { BsFillPersonFill } from "react-icons/bs";
import { RiKeyFill } from "react-icons/ri";
import AvatarSelect from '../components/AvatarSelect';
import { changeToken, getToken } from "../helpers/AuthRequest";
import AuthRequest from '../helpers/AuthRequest'
import { RainbowBorder } from "../themes/animations";

export default function Account() {
  const [data, setData] = useState<UserInfoProps>()
  const [avatar, setAvatar] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [oldPassword, setOldPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")

  const toast = useToast()

  const navigate = useNavigate()

  const avatarSelectRef = useRef<{ open: () => void}>(null)

  useEffect(() => {
    if (localStorage.getItem('username')){
     AuthRequest('/resources', {setState: [{func: setData, attr: ""}, {func: setAvatar, attr: "avatar"}, {func: setUsername, attr: "username"}], navigate: true})
    } else {
      navigate('/login')
    }
  }, [navigate])

  const changeAvatar = () => {
    avatarSelectRef.current?.open()
  }

  const handleUpdate = () => {
    toast.closeAll();

    axios.post('/update', {newUsername: username, currentPassword: oldPassword, newPassword: newPassword, newAvatar: avatar, token: getToken()})
      .then((res) => {
        changeToken(res.data.username, res.data.token)
        
        toast({
          title: 'Success',
          description: 'Updated Profile.',
          status: 'success',
          duration: 3000,
          isClosable: true
        })
      }).catch(function(error) {
        let description;

        switch(error.response.status) {
          case 401:
            description = "Incorrect Password or Username Is Already Taken."
            break;
          case 403:
            description = "Invalid Avatar."
            break;
          case 500:
            description = "Internal Server Error. Please Try Again Later."
            break;
        
        }

        toast({
          title: "Error",
          description: description,
          status: 'error',
          duration: 3000,
          isClosable: true
        })
    })

  }
  

  return (
    <Flex w={'100%'} justifyContent={'center'} textAlign={'center'} flexDir={'column'} alignItems={'center'}>
        <Text fontSize={'4xl'} className={'heading-4xl'} >{data?.username}</Text>
        <Flex position={'relative'} pt={3} w={'fit-content'} mt={3}>
          <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} animation={(data?.avatarColor === 'rainbow') ? `${RainbowBorder()} 12s infinite` : ''} border={(data?.avatarColor !== 'rainbow') ? `3px solid ${data?.avatarColor}` : ''} >
            <Image src={`/image/${avatar}`} borderRadius={'50%'}/>
          </Flex>
          <Icon fontSize={'3xl'} position={'absolute'} top={0} right={0} as={MdOutlineEdit} onClick={changeAvatar} cursor={'pointer'}/>
        </Flex>
        <FormControl w={'fit-content'} textAlign={'left'} mt={5}>
          <Stack direction={'column'} spacing={6}>
            <Box>
              <FormLabel><Flex alignItems={'center'}><Text mr={1}>Username</Text><BsFillPersonFill/></Flex></FormLabel>
              <Input type='text' value={username} onChange={(e) => {setUsername(e.target.value)}} style={{caretColor: 'auto'}}/>
            </Box>
            <Box>
              <FormLabel><Flex alignItems={'center'}><Text mr={1}>Change Password</Text><RiKeyFill/></Flex></FormLabel>
              <InputGroup flexDir={'column'}>
                <FormHelperText>Old Password</FormHelperText>
                <Input type='text' value={oldPassword} onChange={(e) => {setOldPassword(e.target.value)}} style={{caretColor: 'auto'}}/>
                <FormHelperText>New Password</FormHelperText>  
              <Input type='text' value={newPassword} onChange={(e) => {setNewPassword(e.target.value)}} style={{caretColor: 'auto'}}/>
              </InputGroup>
            </Box>
            <Input type={'submit'} value={'Update'} backgroundColor={'blue.400'}  fontWeight={'500'} _hover={{backgroundColor: "blue.500"}} cursor={'pointer'} onClick={handleUpdate}/>
          </Stack>
        </FormControl>
        <AvatarSelect avatar={avatar} setAvatar={setAvatar} ref={avatarSelectRef}/>
    </Flex>
  )
}