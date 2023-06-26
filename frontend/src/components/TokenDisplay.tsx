import { Button, Flex, Image, Text } from "@chakra-ui/react";
import AuthRequest from '../helpers/AuthRequest'
import { useEffect, useState } from "react";
import { SeasonTime } from "../types/EventData";
import EventTime from "../helpers/EventTime";
import api from "../helpers/APIRoute";

interface TokenData {
    tokensAvailable: number;
    tokensEarned: number;
    timeLeft: SeasonTime;
}

export default function TokenDisplay({ callback, tokens }: {callback: () => void, tokens: number | undefined}) {
    const [data, setData] = useState<TokenData>()
    const [response, setResponse] = useState<TokenData>()


    useEffect(() => {
        AuthRequest<TokenData>("/claimtokens", {setState: setData, data: {claim: false}})
    }, [response])

    const claimTokens = () => {
       AuthRequest<TokenData>("/claimtokens", {setState: setResponse, callback: () => {
        callback()
       }, message: {description: "Claimed $ Tokens!", status: 'success', data: "tokensEarned"}})
    }

    return (
        <Flex flexDir={'column'} border={'3px solid black'} bgColor={'aquamarine'} p={3} justifyContent={'center'} alignItems={'center'} textAlign={'center'} pos={'relative'}>        
            <Image src={`${api}/image/resources/resource_tokens.webp`}/>
            <Text className={'heading-md'} fontSize={'md'}>{`Tokens Available: ${typeof data !== "undefined" ? data.tokensAvailable : "0"}`}</Text>
            {(data?.tokensAvailable && data?.tokensAvailable > 0) ? <Button my={5} className={'heading-md'} fontSize={'md'} fontWeight={'normal'} color={'#fff'} onClick={claimTokens}>Claim Tokens!</Button> : <Button my={5} className={'heading-md'} fontSize={'md'} fontWeight={'normal'} color={'#fff'} isDisabled>Claim Tokens!</Button>}
            <Text whiteSpace={'pre'} className={'heading-md'} fontSize={'md'}>{typeof data !== "undefined" ? `Next Tokens Available in\n${EventTime(data.timeLeft, 0)}!` : " \n "}</Text>
            <Flex flexDir={'row'} mt={5}>
                <Text fontSize={'2xl'} className={'heading-2xl'}>{tokens}</Text>
                <Image w={'40px'} ml={1} src={`${api}/image/resources/resource_tokens.webp`}/>
            </Flex>
        </Flex>
    )
}