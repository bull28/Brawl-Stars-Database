import {useState, useEffect} from "react";
import {Flex, Box, Text, Image, Button, useToast, Input, Tooltip, Divider} from "@chakra-ui/react";
import {AxiosError} from "axios";
import AuthRequest from "../helpers/AuthRequest";
import {ChallengePreview, ChallengeStartData} from "../types/GameData";
import {scrollStyle} from "../themes/scrollbar";
import TokenDisplay from "../components/TokenDisplay";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function ChallengeStart(){
    const [challengeList, setChallengeList] = useState<ChallengePreview[]>([]);
    const [challengeid, setChallengeid] = useState<number>(-1);
    const [challenge, setChallenge] = useState<ChallengeStartData | undefined>();

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
        let value = challengeid || -1;

        const input = document.querySelector("input[id=challenge]");
        if (input !== null){
            value = parseInt((input as HTMLInputElement).value) || challengeid;
        }

        AuthRequest<ChallengeStartData>("/challenge/start", {
            data: {challengeid: value},
            setState: setChallenge,
            callback: () => {
                document.dispatchEvent(new CustomEvent("updatetokens"));
            },
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
            <BackButton/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Play Challenge</Text>
            </Box>
            <Flex w={"100%"} my={"3vh"} justifyContent={"space-around"} alignItems={"center"} wrap={"wrap"}>
                <Flex w={"40vw"} minW={"min(20em, 80vw)"} maxW={"48em"} flexDir={"column"} bgColor={"#000000b6"} gap={"1vh"} fontSize={["md", "md", "lg"]} className={"heading-lg"} borderRadius={"lg"} p={5} my={2}>
                    <Flex flexDir={"column"} alignItems={"center"}>
                        <Text lineHeight={1}>Your Challenge Rating:</Text>
                        <Text fontSize={"3xl"}>0</Text>
                    </Flex>
                    <Text>
                        Challenge strength is the overall difficulty of a challenge that is based on how many and which types of enemies are in that challenge.
                        Challenge rating is the recommended strength for you when choosing a challenge to play.
                        Rating changes based on your previous scores in challenges.
                    </Text>
                </Flex>
                <TokenDisplay/>
            </Flex>
            <Flex flexDir={"column"} bgColor={"gray.800"} w={"90vw"} maxW={"48em"} p={3} borderRadius={"lg"}>
                <Text fontSize={["md", "2xl"]} className={"heading-2xl"} mb={4}>Select a challenge</Text>
                <Flex px={[1, 5]} gap={[1, 3]} mr={"8px"} fontSize={["md", "xl"]} className={"heading-xl"}>
                    <Text flex={1}>Challenge Name</Text>
                    <Text flex={1}>Strength</Text>
                </Flex>
                <Flex flexDir={"column"} w={"100%"} maxH={"60vh"} gap={1} fontSize={["md", "xl"]} className={"heading-xl"} overflowY={"scroll"} sx={scrollStyle}>{challengeList.map((value) =>
                    <Flex key={value.challengeid} px={[1, 5]} gap={[1, 3]} bgColor={challengeid === value.challengeid ? "#c040ff" : "#400080"} borderRadius={"md"} cursor={"pointer"} onClick={() => setChallengeid(value.challengeid)}>
                        <Text flex={1} overflowWrap={"anywhere"}>{value.preset === "" ? `${value.username}'s Challenge` : value.username}</Text>
                        <Text flex={1}>{value.strength}</Text>
                    </Flex>
                )}
                </Flex>
                <Divider my={3}/>
                <Input maxW={"15em"} id={"challenge"} placeholder={"Search by Challenge ID"}/>
                <Divider my={3}/>
                <Tooltip label={
                    challenge !== undefined ?
                    `You have already spent tokens to start a challenge.
                    If you start another challenge, you will not be able to claim rewards from your current challenge and your tokens will be wasted.
                    If you want to start another challenge anyway, reload the page.
                    ` : ""
                } placement={"top"}>
                <Button display={"block"} h={"fit-content"} px={4} py={2} mt={3} isDisabled={challenge !== undefined} onClick={findChallenge}>
                    <Text fontSize={["xl", "3xl"]} className={"heading-3xl"}>Find Challenge</Text>
                    <Flex fontSize={"xl"} className={"heading-xl"} justifyContent={"center"}>
                        <Text>100</Text>
                        <Image ml={1} src={`${cdn}/image/resources/resource_tokens.webp`} h={5}/>
                    </Flex>
                </Button>
                </Tooltip>
            </Flex>
            {challenge !== undefined &&
            <Flex bgColor={"gray.800"} w={"90vw"} maxW={"48em"} p={3} mt={"5vh"} borderRadius={"lg"} flexDir={"column"} alignItems={"center"}>
                <Text fontSize={"2xl"} className={"heading-2xl"}>{challenge.displayName}</Text>
                <Button color={"#fff"} className={"heading-md"} my={5} onClick={() => window.location.href = `${api}/bullgame?bull=${challenge.key}`}>Start Challenge</Button>
                <Text color={"#ff0"} className={"heading-md"} maxW={["100%", "60%"]}>Warning: Once you start the challenge, do not reload or navigate away from the page. You will not be allowed to restart the challenge if you do so.</Text>
            </Flex>
            }
        </Flex>
    );
}
