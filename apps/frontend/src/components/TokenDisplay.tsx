import {Button, Flex, Image, Text} from "@chakra-ui/react";
import AuthRequest from "../helpers/AuthRequest";
import {useEffect, useState, useCallback} from "react";
import {SeasonTime} from "../types/EventData";
import EventTime from "../helpers/EventTime";
import cdn from "../helpers/CDNRoute";

const tokensImage = `${cdn}/image/resources/currency/resource_tokens.webp`;

interface TokenData {
    tokensAvailable: number;
    tokensEarned: number;
    timeLeft: SeasonTime;
}

export default function TokenDisplay(){
    const [tokens, setTokens] = useState<number>(0);
    const [data, setData] = useState<TokenData | undefined>();
    const [response, setResponse] = useState<TokenData | undefined>();

    const updateTokens = useCallback(() => {
        AuthRequest<TokenData>("/claimtokens", {setState: setData, data: {claim: false}});
        AuthRequest<{tokens: number;}>("/resources", {setState: (data) => {setTokens(data.tokens)}, data: {claim: false}}, false);
    }, []);

    const claimTokens = () => {
        AuthRequest<TokenData>("/claimtokens", {
            setState: setResponse,
            message: {description: "Claimed $ Tokens!", status: "success", data: "tokensEarned"}
        });
    };

    useEffect(() => {
        document.addEventListener("updatetokens", updateTokens);
        return () => {
            document.removeEventListener("updatetokens", updateTokens);
        };
    }, [updateTokens]);

    useEffect(() => {
        updateTokens();
    }, [response, updateTokens]);

    return (
        <Flex flexDir={"column"} border={"3px solid black"} bgColor={"#389cfc"} p={3} justifyContent={"center"} alignItems={"center"} textAlign={"center"} pos={"relative"} maxW={"90vw"}>        
            <Image src={tokensImage}/>
            <Text className={"heading-md"} fontSize={"md"}>{`Tokens Available: ${data !== undefined ? data.tokensAvailable : 0}`}</Text>
            <Button my={5} className={"heading-md"} fontSize={"md"} fontWeight={"normal"} color={"#fff"} bgColor={"#00000045"} onClick={claimTokens} isDisabled={data !== undefined && data.tokensAvailable <= 0}>Claim Tokens!</Button>
            <Text className={"heading-md"} fontSize={"md"} maxW={"11em"}>{data !== undefined ? `More Tokens available in ${EventTime(data.timeLeft, 0)}!` : "\u00a0\n\u00a0"}</Text>
            <Flex flexDir={"row"} mt={5}>
                <Text fontSize={"2xl"} className={"heading-2xl"}>{tokens !== undefined ? tokens : 0}</Text>
                <Image w={"40px"} ml={1} src={tokensImage}/>
            </Flex>
        </Flex>
    );
}
