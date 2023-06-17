import {useState} from "react";
import axios from 'axios';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Flex, Box, FormControl, FormLabel, Input, FormHelperText, Text, Alert, AlertIcon, AlertDescription, Link, InputGroup, InputLeftElement, useColorMode} from '@chakra-ui/react';
import {BsFillPersonFill} from 'react-icons/bs';
import {RiKeyFill} from 'react-icons/ri';
import { changeToken } from "../helpers/AuthRequest";
import api from "../helpers/ApiRoute";


function Login(){

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [invalidlogin, setInvalidlogin] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<200 | 400 | 401 | 500>(200)
    
    const { colorMode } = useColorMode()

    const navigate = useNavigate();

    const errorMessages = {
        200: "",
        400: "Username and/or Password not Provided.",
        401: "Incorrect Username and/or Password.",
        500: "The Server Encountered an Error. Please Try Again Later."
    }

    const handleLogin = async (e: any) => {
        e.preventDefault()
        
        axios.post(`${api}/login`, {username: username, password: password})
            .then(res => {
                navigate('/')
                
                changeToken(res.data.username, res.data.token)

                setInvalidlogin(false);
            })
            .catch(function(error) {
                if (error.response){
                    setInvalidlogin(true);
                    setErrorCode(error.response.status)
                }
            })

        setUsername("");
        setPassword("");
    }

    return(
        <>
        <Box w={'100vw'} h={'100vh'} position={'absolute'} zIndex={-1} bgColor={(colorMode === 'dark') ? '' : 'blue.100'}></Box>
        <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} w={'100vw'} h={'90vh'}>
            <Text fontSize={'3xl'} className={'heading-3xl'}  mb={10}>Log In</Text>
            <Box w={['80%', '50%']} p={6} borderRadius={'xl'} maxW={'500px'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px'} bgColor={(colorMode === 'dark') ? 'gray.800' : 'white'}>
                <form onSubmit={handleLogin}>
                <FormControl>
                    <FormLabel htmlFor={'username'}>Username</FormLabel>
                    <InputGroup>
                        <InputLeftElement><BsFillPersonFill/></InputLeftElement>
                        <Input id={"username"} type={'text'} mb={5} value={username} onChange={(e) => {setUsername(e.target.value)}} borderColor={'gray.400'} style={{caretColor: 'auto'}}/>
                    </InputGroup>
                    <FormLabel htmlFor={'password'}>Password</FormLabel>
                    <InputGroup>
                        <InputLeftElement><RiKeyFill/></InputLeftElement>
                        <Input id={"password"} type={'password'}  value={password} onChange={(e) => {setPassword(e.target.value)}} borderColor={'gray.400'} style={{caretColor: 'auto'}}/>
                    </InputGroup>
                    <Flex justifyContent={'right'} mb={10}/>
                    <Input id={"bull"} type={'submit'} value={'Log In'} backgroundColor={'blue.400'} color={'white'} fontWeight={'500'} _hover={{backgroundColor: "blue.500"}} cursor={'pointer'}/>
                    <Flex mt={5} justifyContent={'space-between'}>
                        <FormHelperText>Don't have an account? <Link as={RouterLink} to="/signup" color={'blue.400'}>Sign Up</Link></FormHelperText>
                        <FormHelperText><Link as={RouterLink} to="/" color={'blue.600'}>Return Home</Link></FormHelperText>
                    </Flex>
                    {invalidlogin && <Alert status="error" borderRadius={'lg'} mt={5} size={'50'}><AlertIcon/><AlertDescription>{errorMessages[errorCode]}</AlertDescription></Alert>}
                </FormControl>
                </form>
            </Box>    
        </Flex>
        </>
    )
}

export default Login;