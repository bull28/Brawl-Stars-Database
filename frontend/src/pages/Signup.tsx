import {useState} from "react";
import axios from 'axios';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Flex, Box, FormControl, FormLabel, Input, FormHelperText, Text, Alert, AlertIcon, AlertDescription, Link, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {BsFillPersonFill} from 'react-icons/bs';
import {RiKeyFill} from 'react-icons/ri';
import { changeToken } from "../helpers/AuthRequest";
import PasswordStrength from "../components/PasswordStrength";


function Signup(){

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [invalid, setInvalid] = useState<boolean>(false);
    const [errorCode, setErrorCode] = useState<200 | 400 | 401 | 500>(200)
    
    const navigate = useNavigate();

    const errorMessages = {
        200: "",
        400: "Invalid Username and/or Password.",
        401: "Username Already Exists.",
        500: "The Server Encountered an Error. Please Try Again Later."
    }

    const handleSignUp = async (e: any) => {
        e.preventDefault()
        
        axios.post('/signup', {username: username, password: password})
            .then(res => {
                navigate('/')
                
                changeToken(res.data.username, res.data.token)

                setInvalid(false);
            })
            .catch(function(error) {
                if (error.response){
                    setInvalid(true);
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
            <Text fontSize={'3xl'} className={'heading-3xl'} color={'white'} mb={10}>Sign Up</Text>
            <Box w={['80%', '50%']} p={6} borderRadius={'xl'} maxW={'500px'} boxShadow={'rgba(149, 157, 165, 0.2) 0px 8px 24px'} bgColor={'white'}>
                <form onSubmit={handleSignUp}>
                <FormControl>
                    <FormLabel htmlFor={'username'}>Username</FormLabel>
                    <InputGroup>
                        <InputLeftElement><BsFillPersonFill/></InputLeftElement>
                        <Input type={'text'} mb={5} value={username} onChange={(e) => {setUsername(e.target.value)}} borderColor={'gray.400'} style={{caretColor: 'auto'}}/>
                    </InputGroup>
                    <FormLabel htmlFor={'password'}>Password</FormLabel>
                    <InputGroup>
                        <InputLeftElement><RiKeyFill/></InputLeftElement>
                        <Input type={'password'}  value={password} onChange={(e) => {setPassword(e.target.value)}} borderColor={'gray.400'} style={{caretColor: 'auto'}}/>
                    </InputGroup>
                    <PasswordStrength password={password}/>
                    <Input type={'submit'} value={'Sign Up'} backgroundColor={'blue.400'} color={'white'} fontWeight={'500'} _hover={{backgroundColor: "blue.500"}} cursor={'pointer'} mt={10}/>
                    <Flex mt={5} justifyContent={'space-between'}>
                    <FormHelperText>Already Have an Account? <Link as={RouterLink} to="/login" color={'blue.400'}>Log In</Link></FormHelperText>
                    <FormHelperText><Link as={RouterLink} to="/" color={'blue.600'}>Return Home</Link></FormHelperText>
                    </Flex>
                    {invalid && <Alert status="error" borderRadius={'lg'} mt={5} size={'50'}><AlertIcon/><AlertDescription>{errorMessages[errorCode]}</AlertDescription></Alert>}
                </FormControl>
                </form>
            </Box>    
        </Flex>
        </>
    )
}

export default Signup;