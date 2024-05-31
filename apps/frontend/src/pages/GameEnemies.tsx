import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {Flex, Box, Text, Image, IconButton, SimpleGrid, Grid} from "@chakra-ui/react";
import axios, {AxiosResponse} from "axios";
import {Enemy} from "../types/GameData";
import SkullBackground from "../components/SkullBackground";
import EnemyAttack from "../components/EnemyAttack";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function GameEnemies(){
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [currentEnemy, setCurrentEnemy] = useState<Enemy | undefined>();

    const navigate = useNavigate();

    useEffect(() => {
        axios.get<{}, AxiosResponse<Enemy[]>>(`${api}/challenge/enemies`)
        .then((res) => {
            setEnemies(res.data);
        })
        .catch((error) => {
            setEnemies([]);
        });
    }, []);

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <IconButton pos={["relative", "absolute"]} top={["0", "2vh"]} left={["0", "2vh"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate("/bullgame")}} cursor={"pointer"}/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame Enemies</Text>
            </Box>
            <Flex w={"100%"} h={"80vh"} bgColor={"gray.800"} flexDir={["column", "column", "column", "row"]}>
                <Flex bgColor={"gray.600"} overflowY={"scroll"} w={["100vw", "100vw", "48em"]}>
                    <SimpleGrid columns={[2, 3, 4]} spacing={2} w={"100%"} h={"fit-content"} p={2}>{(enemies.map((value) => 
                        <Flex bgColor={"#0f0"} key={value.name} flexDir={"column"} alignItems={"center"} p={2} borderRadius={"xl"} onClick={() => setCurrentEnemy(value)}>
                            <Text fontSize={"xl"} className={"heading-xl"} h={"25%"}>{value.displayName}</Text>
                            <Image src={`${cdn}/image/${value.image !== "" ? value.image : "skingroups/icons/icon_default.webp"}`} w={"75%"}/>
                        </Flex>
                    ))}</SimpleGrid>
                </Flex>
                <Flex flex={1} bgColor={"green.600"}>
                    {currentEnemy !== undefined ?
                        <Grid templateAreas={`"a b" "c c"`} templateColumns={"1fr 1fr"} w={"100%"}>
                            <Flex gridArea={"a"} bgColor={"#f00"} flexDir={"column"}>
                                <Text fontSize={"3xl"} className={"heading-3xl"}>{currentEnemy.displayName}</Text>
                                <Text fontSize={"lg"} className={"heading-lg"}>{currentEnemy.description}</Text>
                                <Flex flexDir={"column"} w={"50%"} gap={2}>
                                    <Box className={"enemy-stat-box"}>
                                        <Text className={"enemy-stat-name"}>Enemy Value</Text>
                                        <Text className={"enemy-stat-value"}>{currentEnemy.value}</Text>
                                    </Box>
                                    <Box className={"enemy-stat-box"}>
                                        <Text className={"enemy-stat-name"}>Health</Text>
                                        <Text className={"enemy-stat-value"}>{currentEnemy.health}</Text>
                                    </Box>
                                    <Box className={"enemy-stat-box"}>
                                        <Text className={"enemy-stat-name"}>Speed</Text>
                                        <Text className={"enemy-stat-value"}>{currentEnemy.speed}</Text>
                                    </Box>
                                </Flex>
                            </Flex>
                            <Flex gridArea={"b"} bgColor={"#0f0"}></Flex>
                            <Flex gridArea={"c"} bgColor={"#00f"} flexDir={"column"}>
                                <Text fontSize={"2xl"} className={"heading-2xl"}>Attacks</Text>
                                <SimpleGrid columns={2} spacing={"1em"}>{currentEnemy.attacks.map((value) => 
                                    <EnemyAttack key={`${value.displayName}${value.minDamage}`} attack={value}/>
                                )}</SimpleGrid>
                            </Flex>
                        </Grid>
                        :
                        <Text>Select an enemy to view more details</Text>
                    }
                </Flex>
            </Flex>
        </Flex>
    );
}
