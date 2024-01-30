import { Button, Flex, Image, Text } from "@chakra-ui/react";
import AuthRequest from "../helpers/AuthRequest";
import { useEffect, useState } from "react";
import { SeasonTime } from "../types/EventData";
import EventTime from "../helpers/EventTime";
import cdn from "../helpers/CDNRoute";

interface TokenData {
    tokensAvailable: number;
    tokensEarned: number;
    timeLeft: SeasonTime;
}

export default function TokenDisplay({ callback, tokens }: {callback: () => void; tokens: number | undefined;}){
    const [data, setData] = useState<TokenData | undefined>();
    const [response, setResponse] = useState<TokenData | undefined>();

    useEffect(() => {
        AuthRequest<TokenData>("/claimtokens", {setState: setData, data: {claim: false}});
    }, [response]);

    const claimTokens = () => {
        AuthRequest<TokenData>("/claimtokens", {
            setState: setResponse,
            callback: () => {callback();},
            message: {description: "Claimed $ Tokens!", status: "success", data: "tokensEarned"}
        });
    };

    return (
        <Flex flexDir={"column"} border={"3px solid black"} bgColor={"#389cfc"} p={3} justifyContent={"center"} alignItems={"center"} textAlign={"center"} pos={"relative"} maxW={"90vw"}>        
            <Image src={`${cdn}/image/resources/resource_tokens.webp`}/>
            <Text className={"heading-md"} fontSize={"md"}>{`Tokens Available: ${data !== undefined ? data.tokensAvailable : 0}`}</Text>
            <Button my={5} className={"heading-md"} fontSize={"md"} fontWeight={"normal"} color={"#fff"} bgColor={"#00000045"} onClick={claimTokens} isDisabled={data !== undefined && data.tokensAvailable <= 0}>Claim Tokens!</Button>
            <Text className={"heading-md"} fontSize={"md"} maxW={"11em"}>{data !== undefined ? `More Tokens available in ${EventTime(data.timeLeft, 0)}!` : " \n "}</Text>
            <Flex flexDir={"row"} mt={5}>
                <Text fontSize={"2xl"} className={"heading-2xl"}>{tokens !== undefined ? tokens : 0}</Text>
                <Image w={"40px"} ml={1} src={`${cdn}/image/resources/resource_tokens.webp`}/>
            </Flex>
        </Flex>
    )
}