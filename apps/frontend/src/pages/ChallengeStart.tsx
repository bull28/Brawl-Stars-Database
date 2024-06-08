import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {Flex, Box, Text, Image, Button, useToast, IconButton, Input, Select} from "@chakra-ui/react";
import {AxiosError} from "axios";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import {ChallengePreview, ChallengeStartData} from "../types/GameData";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function ChallengeStart(){
    const [challengeList, setChallengeList] = useState<ChallengePreview[]>([]);
    const [challengeid, setChallengeid] = useState<string>("-1");
    const [challenge, setChallenge] = useState<ChallengeStartData | undefined>();

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        AuthRequest<ChallengePreview[]>("/challenge/all", {
            setState: (data) => {
                data.sort((a, b) => {
                    if (a.preset === b.preset){
                        return a.challengeid - b.challengeid;
                    } if (a.preset === ""){
                        return -1;
                    } if (b.preset === ""){
                        return 1;
                    }
                    return 0;
                });
                setChallengeList(data);
            }
        }, false);
    }, []);

    const findChallenge = () => {
        let value = parseInt(challengeid) || -1;

        const input = document.querySelector("input[id=challenge]");
        if (input !== null){
            value = parseInt((input as HTMLInputElement).value) || parseInt(challengeid);
        }

        AuthRequest<ChallengeStartData>("/challenge/start", {
            data: {challengeid: value},
            setState: setChallenge,
            fallback: (error) => {
                const e = error as AxiosError;
                if (e.response !== undefined){
                    const message = e.response.data;
                    if (typeof message === "string"){
                        toast({
                            description: message,
                            status: "error",
                            duration: 3000,
                            isClosable: true
                        });
                    }
                }
            }
        }, true);
    };

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <IconButton pos={["relative", "absolute"]} top={["0", "2vh"]} left={["0", "2vh"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate("/bullgame")}} cursor={"pointer"}/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Play Challenge</Text>
            </Box>
            <Select placeholder={"Select Challenge"} w={"15em"} mt={"10vh"} value={challengeid} onChange={(event) => setChallengeid(event.target.value)}>{challengeList.map((value) => 
                <option key={value.challengeid} value={`${value.challengeid}`}>{value.preset === "" ? `${value.username}'s Challenge` : value.username }</option>
            )}</Select>
            <Input maxW={"15em"} mb={"5vh"} id={"challenge"}/>
            <Button display={"block"} h={"fit-content"} px={4} py={2} onClick={findChallenge}>
                <Text fontSize={"3xl"} className={"heading-3xl"}>Find Challenge</Text>
                <Flex fontSize={"xl"} className={"heading-xl"} justifyContent={"center"}>
                    <Text>100</Text>
                    <Image ml={1} src={`${cdn}/image/resources/resource_tokens.webp`} h={5}/>
                </Flex>
            </Button>
            {challenge !== undefined ?
                <Flex mt={"5vh"} flexDir={"column"} alignItems={"center"}>
                    <Text fontSize={"2xl"} className={"heading-2xl"}>{challenge.displayName}</Text>
                    <Button color={"#fff"} className={"heading-md"} my={5} onClick={() => window.location.href = `${api}/bullgame?bull=${challenge.key}`}>Start Challenge</Button>
                    <Text color={"#ff0"} className={"heading-md"} maxW={"20vw"}>Warning: Once you start the challenge, do not reload or navigate away from the page. You will not be allowed to restart the challenge if you do so.</Text>
                </Flex>
                :
                <></>
            }
        </Flex>
    );
}
