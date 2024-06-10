import {useState, useEffect} from "react";
import {Flex, Box, Text, Image, SimpleGrid, Grid} from "@chakra-ui/react";
import axios, {AxiosResponse} from "axios";
import {Enemy} from "../types/GameData";
import {scrollStyle} from "../themes/scrollbar";
import EnemyAttack from "../components/EnemyAttack";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

export default function GameEnemies(){
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [currentEnemy, setCurrentEnemy] = useState<Enemy | undefined>();

    useEffect(() => {
        axios.get<{}, AxiosResponse<Enemy[]>>(`${api}/challenge/enemies`)
        .then((res) => {
            setEnemies(res.data);
        })
        .catch((error) => {
            setEnemies([]);
        });
    }, []);

    const speedValues = (speed: number): string => {
        if (speed <= 0){
            return "Stationary";
        } else if (speed < 6){
            return "Very Slow";
        } else if (speed < 10){
            return "Slow";
        } else if (speed < 16){
            return "Normal";
        } else if (speed < 22){
            return "Fast";
        }
        return "Very Fast";
    };

    const gridAreasEnemies = [`"a a" "b b" "c c" "d d"`, `"a a" "b b" "c c" "d d"`, `"a b" "c c" "d d"`];
    const gridAreasNoEnemies = [`"a a" "b b" "c c"`, `"a a" "b b" "c c"`, `"a b" "c c"`];

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Box justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Bullgame Enemies</Text>
            </Box>
            <Flex w={"100%"} maxW={"128em"} h={["fit-content", "fit-content", "fit-content", "90vh"]} bgColor={"gray.800"} flexDir={["column", "column", "column", "row"]} overflowX={"hidden"}>
                <Flex bgColor={"#000"} overflowY={"scroll"} sx={scrollStyle} w={["100vw", "100vw", "100vw", "35vw"]} maxW={["100vw", "100vw", "100vw", "100vw", "100vw", "48em"]} h={["50vh", "50vh", "50vh", "100%"]}>
                    <SimpleGrid columns={[2, 3, 5, 3, 4]} spacing={2} w={"100%"} h={"fit-content"} p={"0.5em"}>{(enemies.map((value) => 
                        <Flex bgColor={"purple.400"} key={value.name} flexDir={"column"} alignItems={"center"} p={2} borderRadius={"xl"} cursor={"pointer"} onClick={() => setCurrentEnemy(value)}>
                            <Text fontSize={"xl"} className={"heading-xl"}>{value.displayName}</Text>
                            <Image src={`${cdn}/image/${value.image !== "" ? value.image : "skingroups/icons/icon_default.webp"}`} w={"75%"} draggable={false}/>
                        </Flex>
                    ))}</SimpleGrid>
                </Flex>
                <Flex flex={1} bgColor={"#400080"} overflowY={["visible", "visible", "visible", "scroll"]} sx={scrollStyle}>
                    {currentEnemy !== undefined ?
                        <Grid templateAreas={currentEnemy.enemies.length > 0 ? gridAreasEnemies : gridAreasNoEnemies} templateColumns={"1fr 1fr"} templateRows={"minmax(25em, max-content) 1fr min-content"} gap={"1em"} w={"100%"} p={"0.5em"}>
                            <Flex gridArea={"a"} flexDir={"column"}>
                                <Text fontSize={"3xl"} className={"heading-3xl"}>{currentEnemy.displayName}</Text>
                                <Text fontSize={"lg"} className={"heading-lg"} lineHeight={1.2}>{currentEnemy.description}</Text>
                                {/* <Flex flexDir={"column"} w={"50%"} gap={2} pr={2} my={5}> */}
                                <SimpleGrid columns={[1, 2]} spacing={2} my={5} p={"0.5em"} bgColor={"#4000c0"} borderRadius={"xl"}>
                                    <Box className={"enemy-stat-box"}>
                                        <Text variant={"enemyStatName"}>Enemy Value</Text>
                                        <Text variant={"enemyStatValue"}>{currentEnemy.value}</Text>
                                    </Box>
                                    <Box></Box>
                                    <Box className={"enemy-stat-box"}>
                                        <Text variant={"enemyStatName"}>Health</Text>
                                        <Text variant={"enemyStatValue"}>{currentEnemy.health}</Text>
                                    </Box>
                                    <Box className={"enemy-stat-box"}>
                                        <Text variant={"enemyStatName"}>Speed</Text>
                                        <Text variant={"enemyStatValue"}>{speedValues(currentEnemy.speed)}</Text>{/* `${speedValues(currentEnemy.speed)} (${currentEnemy.speed})` */}
                                    </Box>
                                </SimpleGrid>
                                {currentEnemy.strengthTier !== "" &&
                                    <Box my={3}>
                                        <Text fontSize={"lg"} className={"heading-lg"}>On higher difficulties:</Text>
                                        <Text fontSize={"lg"} className={"heading-lg"} lineHeight={1.2}>{currentEnemy.strengthTier}</Text>
                                    </Box>
                                }
                            </Flex>
                            <Flex gridArea={"b"}>
                                <Flex w={["100%", "100%", "25em"]} h={["20em", "25em"]} justifyContent={"center"} bgColor={currentEnemy.fullImage !== "" ? "#4000c0" : ""} borderRadius={"xl"} p={2}>
                                {currentEnemy.fullImage !== "" &&
                                    <Image src={`${cdn}/image/${currentEnemy.fullImage}`} maxH={"100%"} objectFit={"contain"}/>
                                }
                                </Flex>
                            </Flex>
                            <Flex gridArea={"c"} flexDir={"column"}>
                                <Text fontSize={"2xl"} className={"heading-2xl"}>Attacks</Text>
                                <SimpleGrid columns={[1, 1, 2]} spacing={"1em"}>{currentEnemy.attacks.map((value) => 
                                    <EnemyAttack key={`${value.displayName}${value.minDamage}`} attack={value}/>
                                )}</SimpleGrid>
                            </Flex>
                            {currentEnemy.enemies.length > 0 && <Flex gridArea={"d"} flexDir={"column"}>
                                <Text fontSize={"2xl"} className={"heading-2xl"}>Enemies Spawned</Text>
                                <Flex flexDir={"column"} gap={8}>{currentEnemy.enemies.map((value) => 
                                    <Flex key={value.displayName} flexDir={"column"}>
                                        <Text fontSize={"3xl"} className={"heading-3xl"}>{`${value.displayName} x${value.count}`}</Text>
                                        <Flex flexDir={"column"} w={["100%", "100%", "50%"]} pr={["0em", "0em", "0.5em"]}>
                                            <Text fontSize={"lg"} className={"heading-lg"} lineHeight={1.2}>{value.description}</Text>
                                            <Flex flexDir={["column", "row"]} gap={2} my={5} p={"0.5em"} bgColor={"#4000c0"} borderRadius={"xl"}>
                                                <Box className={"enemy-stat-box"} flex={1}>
                                                    <Text variant={"enemyStatName"}>Health</Text>
                                                    <Text variant={"enemyStatValue"}>{value.health}</Text>
                                                </Box>
                                                <Box className={"enemy-stat-box"} flex={1}>
                                                    <Text variant={"enemyStatName"}>Speed</Text>
                                                    <Text variant={"enemyStatValue"}>{speedValues(value.speed)}</Text>
                                                </Box>
                                            </Flex>
                                        </Flex>
                                        <SimpleGrid columns={[1, 1, 2]} spacing={"1em"}>{value.attacks.map((value2) => 
                                            <EnemyAttack key={`${value.displayName}${value2.minDamage}`} attack={value2}/>
                                        )}</SimpleGrid>
                                    </Flex>
                                )}</Flex>
                            </Flex>}
                        </Grid>
                        :
                        <Box p={2}>
                            <Text fontSize={"2xl"} className={"heading-2xl"}>Select an enemy to view information about it</Text>
                        </Box>
                    }
                </Flex>
            </Flex>
        </Flex>
    );
}
