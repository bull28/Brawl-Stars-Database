import { Button, Flex, Image, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { time } from "../types/EventData";

interface TokenData {
    tokensAvailable: number,
    tokensEarned: number,
    timeLeft: time
}

export default function TokenDisplay({ callback, tokens }: {callback: () => void, tokens: number | undefined}) {
    const [data, setData] = useState<TokenData>()
    const [response, setResponse] = useState<TokenData>()

    const toast = useToast()

    useEffect(() => {
        axios.post('/claimtokens', {token: localStorage.getItem('token'), claim: false})
            .then((res) => {
                setData(res.data)
            })
    }, [response])

    const claimTokens = () => {
        axios.post('/claimtokens', {token: localStorage.getItem('token')})
            .then((res) => {
                setResponse(res.data)

                toast({
                    title: '',
                    description: `Claimed ${res.data.tokensEarned} Tokens!`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                })

                callback()
            })
    }

  return (
    
    <Flex flexDir={'column'} border={'3px solid black'} bgColor={'aquamarine'} p={3} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'}>
        
        <Image src={'/image/resources/resource_tokens.webp'}/>
        <Text>{`Tokens Available: ${data?.tokensAvailable}`}</Text>
        {(data?.tokensAvailable && data?.tokensAvailable > 0) ? <Button my={5} onClick={claimTokens}>Claim Tokens!</Button> : <Button my={5} isDisabled>Claim Tokens!</Button>}
        <Text>{`Next Tokens Available in ${data?.timeLeft.hour}h ${data?.timeLeft.minute}m!`}</Text>
        <Flex flexDir={'row'} pos={'absolute'} bottom={3}>
            <Text fontSize={'2xl'}>{tokens}</Text>
            <Image w={'40px'}  ml={1} src={'/image/resources/resource_tokens.webp'}/>
        </Flex>
    </Flex>
    
  )
}