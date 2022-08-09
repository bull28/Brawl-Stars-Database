import { Flex, Image, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { time } from "../types/EventData";

interface TokenData {
    tokensEarned: number,
    timeLeft: time
}

export default function TokenDisplay() {
    const [data, setData] = useState<TokenData>()


    useEffect(() => {
        axios.post('/claimtokens', {token: localStorage.getItem('token')})
            .then((res) => {
                setData(res.data)
            })
    }, [])
  return (
    
    <Flex flexDir={'column'} border={'3px solid black'} bgColor={'aquamarine'} p={3}>
        
        <Image src={'/image/resources/resource_tokens.webp'}/>
        <Text>Claim Tokens</Text>
        <Text>{(data?.timeLeft.hour === data?.timeLeft.minute && data?.timeLeft.hour === data?.timeLeft.second && data?.timeLeft.hour === 0) ? "Tokens Ready!" : `Tokens Available in ${data?.timeLeft.hour}h ${data?.timeLeft.minute}m!`}</Text>
        {}
    </Flex>
    
  )
}