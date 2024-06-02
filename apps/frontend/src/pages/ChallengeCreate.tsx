import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {Flex, Box, Text, Image, Button, IconButton, Grid, useToast} from "@chakra-ui/react";
import {DndContext, DragEndEvent, DragOverlay, DragStartEvent} from "@dnd-kit/core";
import {AxiosError} from "axios";
import Draggable from "../components/Draggable";
import Droppable from "../components/Droppable";
import AuthRequest from "../helpers/AuthRequest";
import SkullBackground from "../components/SkullBackground";
import cdn from "../helpers/CDNRoute";

interface Upgrades{
    offense: {
        startingPower: number;
        startingGears: number;
        powerPerStage: number;
        gearsPerStage: number;
        maxAccessories: number;
        health: number;
        damage: number;
        healing: number;
        speed: number;
        ability: number;
        lifeSteal: number;
    };
    defense: {
        difficulty: number;
        maxEnemies: number[];
        enemyStats: number[];
        waves: number[][];
    };
    enemies: {
        name: string;
        displayName: string;
        image: string;
        value: number;
        maxCount: number;
    }[];
}

export default function ChallengeStart(){
    const [enemies, setEnemies] = useState<Upgrades["enemies"]>([]);
    const [enemyMap, setEnemyMap] = useState<Map<string, number>>(new Map());
    const [defense, setDefense] = useState<Upgrades["defense"]>({difficulty: 0, maxEnemies: [], enemyStats: [], waves: []});

    const [activeDisplay, setActiveDisplay] = useState<string | undefined>();
    const [selected, setSelected] = useState<Record<string, Record<string, number>>>({});

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        AuthRequest<Upgrades>("/challenge/upgrades", {setState: (data) => {
            data.enemies.sort((a, b) => a.value - b.value);

            const map = new Map<string, number>();
            for (let x = 0; x < data.enemies.length; x++){
                map.set(data.enemies[x].name, x);
            }

            setEnemies(data.enemies);
            setEnemyMap(map);
            setDefense(data.defense);
        }}, false);
    }, []);

    const create = () => {
        const sendWaves: {level: number; enemies: string[]}[][] = [];
        for (let x = 0; x < defense.waves.length; x++){
            const wave: typeof sendWaves[number] = [];
            for (let y = 0; y < defense.waves[x].length; y++){
                wave.push({level: x, enemies: []});
            }
            sendWaves.push(wave);
        }

        for (const x in selected){
            const indexes = x.split(",").map((value) => parseInt(value));
            if (indexes.length === 2){
                const enemies: string[] = [];
                for (const i in selected[x]){
                    for (let b = 0; b < selected[x][i]; b++){
                        enemies.push(i);
                    }
                }
                if (indexes[0] < sendWaves.length && indexes[1] < sendWaves[indexes[0]].length){
                    sendWaves[indexes[0]][indexes[1]].enemies = enemies;
                }
            }
        }

        AuthRequest<string>("/challenge/create", {
            data: {waves: sendWaves.reduce((previous, current) => previous.concat(current), [])},
            setState: (data) => {
                toast({
                    title: "Success",
                    description: data,
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
            },
            fallback: (error) => {
                const e = error as AxiosError;
                if (e.response !== undefined){
                    const message = e.response.data;
                    if (typeof message === "string"){
                        toast({
                            title: "Could not create challenge",
                            description: message,
                            status: "error",
                            duration: 5000,
                            isClosable: true
                        });
                    }
                }
            }
        });
    };

    const getEnemy = (name: string) => {
        const index = enemyMap.get(name) || enemies.findIndex((value) => value.name === name);
        if (index !== undefined && index >= 0 && index < enemies.length){
            return enemies[index];
        }
        return undefined;
    };

    const getEnemyElement = (name: string, count: number = 0, image: boolean = true) => {
        const enemy = getEnemy(name);
        return (
            <Flex flexDir={"column"} alignItems={"center"} justifyContent={"center"} w={"100%"} h={"100%"} pos={"relative"} userSelect={"auto"}>
            {enemy !== undefined ?
                <>
                {(image && enemy.image !== "") && <Image src={`${cdn}/image/${enemy.image}`} p={2} draggable={false}/>}
                <Text pos={"absolute"} left={"0.1875em"} top={"0.0625em"} lineHeight={1} fontSize={"lg"} className={"heading-lg"} color={"#0ff"}>{enemy.value * Math.max(1, count)}</Text>
                <Text pos={"absolute"} left={"0.125em"} bottom={"0.125em"} lineHeight={1} className={"heading-md"}>{enemy.displayName + (count > 1 ? ` x${count}` : "")}</Text>
                </>
                :
                <Text className={"heading-md"}>???</Text>
            }
            </Flex>
        );
    };

    const stageValueColor = (value: number, maxValue: number) => {
        if (value < maxValue){return "#ff0";}
        else if (value === maxValue){return "#0f0";}
        return "#f00";
    }
    
    const waveValueColor = (value: number, maxValue: number) => {
        if (value <= 0){return "#ff0";}
        else if (value <= maxValue){return "#0f0";}
        return "#f00";
    };

    const totalEnemyValue = (wave: Record<string, number>) => {
        let total = 0;
        for (const x in wave){
            const enemy = getEnemy(x);
            if (enemy !== undefined){
                total += enemy.value * wave[x];
            }
        }
        return total;
    }

    const changeEnemyCount = (waveid: string, enemyid: string, change: number) => {
        if (selected[waveid] !== undefined && selected[waveid][enemyid] !== undefined){
            selected[waveid][enemyid] = Math.max(0, selected[waveid][enemyid] + change);
            setSelected({...selected});
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDisplay(`${event.active.id}`);
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDisplay(undefined);

        const {active, over} = event;
    
        if (over !== null){
            const overid = over.id;
            const activeid = `${active.id}`;

            if (selected[overid] !== undefined){
                if (selected[overid][activeid] !== undefined){
                    selected[overid][activeid]++;
                } else{
                    selected[overid][activeid] = 1;
                }
            } else{
                const newWave: Record<string, number> = {};
                newWave[activeid] = 1;
                selected[overid] = newWave;
            }
            setSelected({...selected});
        }
    };

    return (
        <Flex flexDir={"column"} alignItems={"center"}>
            <SkullBackground/>
            <IconButton pos={["relative", "absolute"]} top={["0", "2vh"]} left={["0", "2vh"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate("/bullgame")}} cursor={"pointer"}/>
            <Box justifyContent={"center"} mb={10}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Create Challenge</Text>
            </Box>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Flex w={"100%"} h={["fit-content", "fit-content", "90vh"]} flexDir={["column", "column", "row"]} gap={10} p={4}>
                    <Box>
                        <Box overflow={"auto"}>
                            <Grid templateColumns={["4", "6", "3", "6"].map((value) => `repeat(${value}, 1fr)`)} w={"fit-content"} h={"fit-content"} gap={1} bgColor={"gray.800"} p={"0.75em"} borderRadius={"0.75em"}>
                            {enemies.map((value) =>
                                <Draggable key={value.name} id={value.name} className={"draggable-enemy-box"}>
                                    {getEnemyElement(value.name)}
                                </Draggable>
                            )}
                            </Grid>
                        </Box>
                        <Box maxW={["20em", "20em", "15em", "30em"]} my={5}>
                            <Text fontSize={["lg", "xl"]} className={"heading-xl"}>Instructions</Text>
                            <Text fontSize={["md", "lg"]} className={"heading-lg"} lineHeight={1.2}>
                                Add enemies to the challenge by dragging the desired enemy from the box above and dropping it in the desired wave.
                                Left click on an enemy already added to a wave to remove it from the wave.
                            </Text>
                        </Box>
                        <Button className={"heading-md"} onClick={() => {create()}}>Create Challenge</Button>
                    </Box>

                    <Flex flexDir={"row"} maxW={"72em"} h={"fit-content"} maxH={"100%"} overflowY={"auto"} gap={5} flex={1} wrap={"wrap"}>
                    {defense.waves.map((stage, stageIndex) => {
                        let stageTotalValue = 0;
                        const stageMaxValue = stageIndex < defense.maxEnemies.length ? defense.maxEnemies[stageIndex] : 0;
                        const enemyStats = stageIndex < defense.enemyStats.length ? defense.enemyStats[stageIndex] : 0;
                        let waveValues: number[] = [];
                        for (let waveIndex = 0; waveIndex < stage.length; waveIndex++){
                            const value = selected[`${stageIndex},${waveIndex}`] !== undefined ? totalEnemyValue(selected[`${stageIndex},${waveIndex}`]) : 0
                            stageTotalValue += value;
                            waveValues.push(value);
                        }

                        return (
                        <Flex key={`Stage${stageIndex}`} w={"100%"} maxW={"30em"} h={"fit-content"} bgColor={"gray.800"} flexDir={"column"} gap={2} p={"0.75em"} borderRadius={"0.75em"}>
                            <Flex alignItems={"center"} wrap={"wrap"}>
                                <Text fontSize={"2xl"} className={"heading-2xl"} mr={"1em"}>{`Stage ${stageIndex + 1}`}</Text>
                                <Flex mr={"2em"} flexDir={["column", "row"]}>
                                    <Text fontSize={"2xl"} className={"heading-2xl"} w={"5em"} textAlign={"center"} color={stageValueColor(stageTotalValue, stageMaxValue)}>{`${stageTotalValue} / ${stageMaxValue}`}</Text>
                                    <Text fontSize={"2xl"} className={"heading-2xl"} w={"5em"} textAlign={"center"}>{`(${Math.max(0, stageMaxValue - stageTotalValue)} left)`}</Text>
                                </Flex>
                                <Text lineHeight={1.2} className={"heading-md"}>{`Power Cubes: ${Math.floor((enemyStats - 100) / 12.5)}`}</Text>
                            </Flex>
                            {stage.map((waveMaxValue, waveIndex) => {
                                const waveid = `${stageIndex},${waveIndex}`;
                                const waveTotalValue = waveValues[waveIndex];
                                return (
                                <Droppable key={waveid} id={waveid} style={{backgroundColor: "#400080", padding: "0.5em", borderRadius: "0.5em"}} isOverStyle={{backgroundColor: "#8000c0"}}>
                                    <Flex alignItems={"center"} gap={3} mb={1}>
                                        <Text fontSize={"lg"} className={"heading-lg"}>{`Wave ${waveIndex + 1}`}</Text>
                                        <Text fontSize={"lg"} className={"heading-lg"} w={"5em"} textAlign={"center"} color={waveValueColor(waveTotalValue, waveMaxValue)}>{`${waveTotalValue} / ${waveMaxValue}`}</Text>
                                    </Flex>
                                    <Flex w={"100%"} minH={"5em"} gap={1}>
                                    {selected[waveid] !== undefined &&
                                        <Flex gap={1} wrap={"wrap"}>{Object.entries(selected[waveid]).filter(([_, __]) => __ > 0).map(([enemy, count]) => 
                                            <Flex key={`${waveid}${enemy}`} className={"draggable-enemy-box"} onClick={(___) => {
                                                changeEnemyCount(waveid, enemy, -1);
                                            }} onContextMenu={(event) => {
                                                event.preventDefault();
                                                changeEnemyCount(waveid, enemy, 1);
                                            }}>
                                                {getEnemyElement(enemy, count)}
                                            </Flex>
                                        )}</Flex>
                                    }
                                    </Flex>
                                </Droppable>
                                );
                            })}
                        </Flex>
                        );
                    })}
                    </Flex>

                    <DragOverlay>
                        {activeDisplay &&
                        <Box className={"draggable-enemy-box"}>
                            {getEnemyElement(activeDisplay, 0, false)}
                        </Box>
                        }
                    </DragOverlay>
                </Flex>
            </DndContext>
        </Flex>
    );
}
