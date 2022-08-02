import {useState} from "react";
import axios from 'axios';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Flex, Box, FormControl, FormLabel, Input, FormHelperText, Text, Alert, AlertIcon, AlertDescription, Link, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {BsFillPersonFill} from 'react-icons/bs';
import {RiKeyFill} from 'react-icons/ri';


function Login(){

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [invalidlogin, setInvalidlogin] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<200 | 400 | 401 | 500>(200)
    
    const navigate = useNavigate();

    const errorMessages = {
        200: "",
        400: "Username and/or Password not Provided.",
        401: "Username and/or Password is incorrect.",
        500: "The Server Encountered an Error. Please Try Again Later."
    }

    const handleLogin = async (e: any) => {
        e.preventDefault()
        
        axios.post('/login', {username: username, password: password})
            .then(res => {
                navigate('/')
                localStorage.setItem('token', res.data.token);
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
        <Box w={'100vw'} h={'100vh'} position={'absolute'} zIndex={-1} bgColor={'blue.100'}></Box>
        <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} w={'100vw'} h={'90vh'}>
            <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'} mb={10}>Log In</Text>
            <Box w={['80%', '50%']} p={6} borderRadius={'xl'} maxW={'500px'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px'} bgColor={'white'}>
                <form onSubmit={handleLogin}>
                <FormControl>
                    <FormLabel htmlFor={'username'}>Username</FormLabel>
                    <InputGroup>
                        <InputLeftElement><BsFillPersonFill/></InputLeftElement>
                        <Input type={'text'} mb={5} value={username} onChange={(e) => {setUsername(e.target.value)}} borderColor={'gray.400'}/>
                    </InputGroup>
                    <FormLabel htmlFor={'password'}>Password</FormLabel>
                    <InputGroup>
                        <InputLeftElement><RiKeyFill/></InputLeftElement>
                        <Input type={'password'}  value={password} onChange={(e) => {setPassword(e.target.value)}} borderColor={'gray.400'}/>
                    </InputGroup>
                    <Flex justifyContent={'right'}>
                        <FormHelperText mb={10} color={'blue.400'}><Link>Forgot Password?</Link></FormHelperText>
                    </Flex>
                    <Input type={'submit'} value={'Login'} backgroundColor={'blue.400'} color={'white'} fontWeight={'500'} _hover={{backgroundColor: "blue.500"}} cursor={'pointer'}/>
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