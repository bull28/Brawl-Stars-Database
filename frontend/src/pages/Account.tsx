import { Box, Flex, FormControl, FormHelperText, FormLabel, Icon, Image, Input, InputGroup, Stack, Text, useToast } from "@chakra-ui/react";
import axios from 'axios'
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserInfoProps } from "../types/AccountData";
import { MdOutlineEdit } from 'react-icons/md'
import { BsFillPersonFill } from "react-icons/bs";
import { RiKeyFill } from "react-icons/ri";
import AvatarSelect from '../components/AvatarSelect';

export default function Account() {
  const [data, setData] = useState<UserInfoProps>()
  const [avatar, setAvatar] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [oldPassword, setOldPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")

  const toast = useToast()

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const avatarSelectRef = useRef<{ open: () => void}>(null)

  useEffect(() => {
    if (token){
      axios.post('/resources', {token: token})
        .then((res) => {
          setData(res.data)
          setAvatar(res.data.avatar)
          setUsername(res.data.username)
        }).catch(function(error) {
          if (error.response.status === 400 || error.response.status === 401){
              localStorage.removeItem('token')
              navigate('/login')
          }
      })
    } else {
      navigate('/login')
    }
  }, [token, navigate])

  const changeAvatar = () => {
    avatarSelectRef.current?.open()
  }

  const handleUpdate = () => {
    toast.closeAll();

    axios.post('/update', {newUsername: username, currentPassword: oldPassword, newPassword: newPassword, newAvatar: avatar, token: localStorage.getItem('token')})
      .then((res) => {
        localStorage.setItem('token', res.data.token)
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
        <Text fontSize={'4xl'} className={'heading-4xl'} color={'white'}>{data?.username}</Text>
        <Flex position={'relative'} pt={3} w={'fit-content'} mt={3}>
          <Flex justifyContent={'center'} alignItems={'center'} borderRadius={'50%'} p={'3px'} background={(data?.avatarColor === 'rainbow' ? 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' : data?.avatarColor)}>
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
            <Input type={'submit'} value={'Update'} backgroundColor={'blue.400'} color={'white'} fontWeight={'500'} _hover={{backgroundColor: "blue.500"}} cursor={'pointer'} onClick={handleUpdate}/>
          </Stack>
        </FormControl>
        <AvatarSelect avatar={avatar} setAvatar={setAvatar} ref={avatarSelectRef}/>
    </Flex>
  )
}