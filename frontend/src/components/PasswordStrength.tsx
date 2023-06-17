import { Box, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"

const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '=', '+', '[', ']', '{', '}', '|', ':', ';', '<', '>', ',', '.', '?', '/']

const strengthData: {msg: string, color: string}[] = [{msg: 'Password must be between 3-100 characters.', color: 'black'}, {msg: 'Weak', color: 'red.400'}, {msg: 'Fair', color: 'yellow.400'}, {msg: 'Strong', color: 'green.300'}, {msg: 'Very Strong', color: 'green.500'}, {msg: 'x1', color: 'black'}]


export default function PasswordStrength({password}: {password: string;}) {
    const [strength, setStrength] = useState<number>(0)

    const calculateStrength = ( password: string ) => {
        let score = 1;


        for (let i = 0; i<symbols.length; i++){
            if (password.includes(symbols[i])){
                score = score + 1
                break
            }
        }

        for (let i = 0; i<password.length; i++){
            if (password[i] >= 'A' && password[i] <= 'Z'){
                score = score + 1
                break
            }
        }

        if (/\d/.test(password)){
            score = score + 1
        }

        if ( password.length < 3 || password.length > 100){
            score = 0
        }

        return score
    }

    useEffect(() => {
        setStrength(calculateStrength(password))

    }, [password])


  return (
    <>
        <Text className={'heading-md'} mt={5}>{(strength !== 0) ?  `Strength: ${strengthData[strength].msg}` : strengthData[strength].msg}</Text>
        <Box h={'5px'} w={'100%'} bgColor={strengthData[strength].color}></Box>
    </>
  )
}