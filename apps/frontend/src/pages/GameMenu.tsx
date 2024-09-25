import {useState, useEffect, useRef} from "react";
import {useNavigate, Link as RouterLink} from "react-router-dom";
import {
    Flex, Box, Text, Button, Link, useToast,
    Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton, ModalFooter, Divider, useDisclosure
} from "@chakra-ui/react";
import {AxiosError} from "axios";
import AuthRequest from "../helpers/AuthRequest";
import MasteryDisplay from "../components/MasteryDisplay";
import {MasteryData, UserInfoProps} from "../types/AccountData";
import {GameUpgrades} from "../types/GameData";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";

export default function GameMenu(){
    const [mastery, setMastery] = useState<MasteryData>({
        level: 0, 
        points: 0,
        current: {points: 0, image: "", color: "#000000"},
        next: {points: 1, image: "", color: "#000000"}
    });
    const [upgrades, setUpgrades] = useState<GameUpgrades | undefined>();
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>();
    const [username, setUsername] = useState<string>("");
    const [rewardCount, setRewardCount] = useState<number>(0);

    const navigate = useNavigate();
    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure();

    const formRef = useRef<HTMLFormElement>(null);

    const getPowerCubesText = (enemyStats: GameUpgrades["defense"]["enemyStats"]): string => {
        if (enemyStats.length < 1){
            return "0";
        } else if (enemyStats.length === 1){
            return `${Math.floor((enemyStats[0] - 100) / 12.5)}`;
        }

        const minPower = Math.floor((Math.min(...enemyStats) - 100) / 12.5);
        const maxPower = Math.floor((Math.max(...enemyStats) - 100) / 12.5);
        return `${minPower} - ${maxPower}`;
    };

    const submitForm = () => {
        //window.location.href = `${api}/bullgame`;
        if (formRef.current === null || username === ""){
            toast({
                title: "Error Starting Game",
                description: "Classic mode is currently not available.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }
        const data = formRef.current.data;
        if (data instanceof HTMLInputElement){
            data.value = JSON.stringify({options: {username: username}});
            formRef.current.submit();
        }
    };

    useEffect(() => {
        //AuthRequest<MasteryData>("/accessory/mastery", {setState: (data) => {
        AuthRequest<UserInfoProps>("/resources", {setState: (data) => {
            setUsername(data.username);
            setMastery(data.mastery);
            setLoggedIn(true);

            AuthRequest<Record<string, unknown>[]>("/report/all", {setState: (data1) => {
                // The type of this value does not matter, only the length is used
                setRewardCount(data1.length);
            }}, false);

            AuthRequest<GameUpgrades>("/challenge/upgrades", {setState: (data1) => {
                setUpgrades(data1);
            }}, false);
        }, fallback: (error) => {
            setLoggedIn(false);
            const e = error as AxiosError;
            if (e.response !== undefined && e.response.status !== 400 && e.response.status !== 401){
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
        }}, false);
    }, [toast]);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame</Text>
            </Box>
            <Box w={"100%"}>
                <Flex w={"100%"} flexDir={"column"} gap={5} alignItems={"center"}>
                    {loggedIn === true &&
                        <>
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} gap={1}>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={submitForm}>Play Classic Mode</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/challenges")}>Play Challenge</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/createchallenge")}>Create Challenge</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/rewards")}>{`Claim Rewards ${rewardCount > 0 ? `(${rewardCount})` : ""}`}</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/accessories")}>View Accessories</Button>
                            <Button minW={["50%", "20em"]} bgColor={"gray.800"} _hover={{"backgroundColor": "gray.600"}} fontSize={"inherit"} onClick={() => navigate("/bullgame/enemies")}>View Game Enemies</Button>
                        </Flex>
                        <Box onClick={onOpen} cursor={"pointer"}>
                            <MasteryDisplay data={mastery}/>
                        </Box>
                        </>
                    }
                    {loggedIn === false &&
                        <Flex flexDir={"column"} alignItems={"center"} fontSize={"lg"} className={"heading-lg"} gap={"0.5em"}>
                            <Text>You are currently not logged in.</Text>
                            <Text>You can still play the game but you need to be logged in to earn rewards from playing.</Text>
                            <Link color={"blue.300"} href={`${api}/bullgame`}>Click here to play while logged out</Link>
                            <Link as={RouterLink} color={"blue.300"} to={`/login?${new URLSearchParams({next: "/bullgame"})}`}>Click here to login</Link>
                        </Flex>
                    }
                </Flex>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
                <ModalOverlay/>
                <ModalContent p={[0, 3]} border={`3px solid #fff`} color={"#fff"}>
                    <ModalHeader fontWeight={"normal"} fontSize={["2xl", "3xl"]} className={"heading-3xl"} textAlign={"center"} p={[1, 4]}>Mastery Progression</ModalHeader>
                    <ModalCloseButton/>
                    <Divider/>
                    <ModalBody className={"heading-md"}>
                    {upgrades !== undefined ?
                        <>
                        <Text fontSize={"2xl"}>Offensive Upgrades</Text>
                        <Text>These make you stronger when playing other challenges.</Text>

                        <Text fontSize={"xl"} mt={3}>Power Points</Text>
                        <Text>{`Start with ${upgrades.offense.startingPower}.`}</Text>
                        <Text>{`Get up to ${upgrades.offense.maxExtraPower} more from completing stages (max. ${upgrades.offense.powerPerStage} per stage).`}</Text>

                        <Text fontSize={"xl"} mt={3}>Gears</Text>
                        <Text>{`Start with ${upgrades.offense.startingGears}.`}</Text>
                        <Text>{`Get up to ${upgrades.offense.maxExtraGears} more from completing stages (max. ${upgrades.offense.gearsPerStage} per stage).`}</Text>

                        <Text fontSize={"xl"} mt={3}>Accessories</Text>
                        <Text>{`You can use up to ${upgrades.offense.maxAccessories} ${upgrades.offense.maxAccessories === 1 ? "accessory" : "accessories"} in a challenge.`}</Text>

                        <Divider my={2}/>
                        <Text fontSize={"2xl"}>Defensive Upgrades</Text>
                        <Text>These give you stronger enemies to use when creating your own challenge.</Text>

                        <Text fontSize={"xl"} mt={3}>{`Enemies per Challenge: ${upgrades.defense.maxEnemies.reduce((previous, current) => previous + current, 0)}`}</Text>

                        <Text fontSize={"xl"} mt={3}>{`Power Cubes: ${getPowerCubesText(upgrades.defense.enemyStats)}`}</Text>
                        <Text>Power Cubes increase the health and damage of enemies. Enemies in later stages will have more Power Cubes.</Text>

                        <Text fontSize={"xl"} mt={3}>{`Enemy Tier: ${upgrades.defense.difficulty}`}</Text>
                        <Text>Higher tiers make enemies stronger in ways other than health and damage. These may include stats such as movement speed or attributes specific to an enemy.</Text>
                        </>
                        :
                        <Text>No upgrades found</Text>
                    }
                    </ModalBody>
                    <Divider/>
                    <ModalFooter justifyContent={"flex-start"} className={"heading-md"}>
                        <Text>{(mastery.next.points < 0 && mastery.level > 1) ? "All available mastery upgrades unlocked." : "These upgrades are improved when reaching higher mastery levels."}</Text>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <form action={`${api}/bullgame`} method={"post"} style={{display: "none"}} ref={formRef}>
                <input type={"hidden"} name={"data"}/>
            </form>
        </Flex>
    );
}
