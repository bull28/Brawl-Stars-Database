import {Flex, Text, Image, Button, SimpleGrid, HStack, Divider} from "@chakra-ui/react";
import {useState} from "react";
import {UnitImage, UnitData} from "../types/ChallengeData";

interface UnitSelectionProps{
    data: UnitData;
    setSelected: (units: UnitImage[]) => void;
}

export default function UnitSelection({data, setSelected}: UnitSelectionProps){
    const [units, setUnits] = useState<UnitImage[]>([]);
    const [currentUnit, setCurrentUnit] = useState<UnitData["unitsAvailable"][number] | undefined>(undefined);

    return (
        <Flex>
            <Flex flexDir={"column"} bgColor={"gray.800"} alignItems={"center"} borderRadius={"lg"}>
                <Text fontSize={"2xl"} className={"heading-2xl"}>Select Units</Text>
                <Divider/>
                <Flex flexDir={"column"} minW={"480px"} w={"30vw"} minH={"45vh"} p={2}>
                    <Flex h={"100%"} wrap={"wrap"}>
                        <Flex flexDir={"column"} alignItems={"center"}>
                            <SimpleGrid columns={[5]} spacing={0}>
                                {data.unitsAvailable.map((value) => {
                                    return (
                                        <Button key={value.name} border={"2px solid #0000"} borderRadius={"md"} bgImage={`url(/image/${value.display.image})`} bgRepeat={"no-repeat"} bgSize={"cover"} _hover={{}} onMouseOver={() => setCurrentUnit(value)} onMouseOut={() => setCurrentUnit(undefined)} onClick={() => {if (units.length + 1 <= data.unitsPerChallenge){setUnits(units.concat([{name: value.name, image: value.display.image}]));}}}></Button>
                                    );
                                })}
                            </SimpleGrid>
                        </Flex>
                        {(typeof currentUnit !== "undefined") ?
                            <Flex w={"40%"} pos={"relative"} ml={2}>
                                <Flex flexDir={"column"} alignItems={"center"} w={"100%"}>
                                    <Text fontSize={"xl"}>{currentUnit.display.displayName}</Text>
                                    <Flex flexDir={"column"} alignItems={"flex-start"} w={"100%"}>
                                        <Divider bgColor={"#fff"} my={1}/>
                                        <Flex w={"100%"}>
                                            <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#ff5"}>Health</Text>
                                            <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#ff5"}>{currentUnit.stats.health}</Text>
                                        </Flex>
                                        {currentUnit.stats.shield > 0 ?
                                            <Flex w={"100%"}>
                                                <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#ff5"}>Shield</Text>
                                                <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#ff5"}>{currentUnit.stats.shield}</Text>
                                            </Flex>
                                            :
                                            <></>
                                        }
                                        <Divider bgColor={"#fff"} my={1}/>
                                        <Flex w={"100%"}>
                                            <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#f55"}>Damage</Text>
                                            <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#f55"}>{currentUnit.stats.damage}</Text>
                                        </Flex>
                                        <Flex w={"100%"} >
                                            <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#5ff"}>Range</Text>
                                            <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#5ff"}>{currentUnit.stats.range}</Text>
                                        </Flex>
                                        <Flex w={"100%"}>
                                            <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#5f5"}>Targets</Text>
                                            <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#5f5"}>{currentUnit.stats.targets}</Text>
                                        </Flex>
                                        <Flex w={"100%"}>
                                            <Text w={"40%"} fontSize={"20px"} lineHeight={"24px"} color={"#f5f"}>Speed</Text>
                                            <Text w={"60%"} fontSize={"20px"} lineHeight={"24px"} color={"#f5f"}>{currentUnit.stats.speed}</Text>
                                        </Flex>
                                        <Divider bgColor={"#fff"} my={1}/>
                                        <Flex alignItems={"center"} flexDir={"column"} w={"100%"}>
                                            {currentUnit.stats.specialMoves === true ? <Flex fontSize={"16px"} lineHeight={"16px"} color={"#ffc700"}>Can jump over units</Flex> : <></>}
                                            {currentUnit.stats.specialAttacks === true ? <Flex fontSize={"16px"} lineHeight={"16px"} color={"#ffc700"}>Can attack through units</Flex> : <></>}
                                            {currentUnit.stats.specialMoves === true || currentUnit.stats.specialAttacks === true ? <Divider bgColor={"#fff"} my={1}/> : <></>}
                                        </Flex>
                                        <Flex w={"100%"}>
                                            <Flex flexDir={"column"} w={"100%"}>
                                                <Text fontSize={"sm"} paddingLeft={1} paddingRight={1}>{currentUnit.display.description}</Text>
                                                {currentUnit.display.description !== "" ? <Divider bgColor={"#fff"} my={1}/> : <></>}
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                            :
                            <Flex w={"40%"} pos={"relative"} ml={2}/>
                        }
                    </Flex>
                    <Flex flexDir={"column"} justifyContent={"flex-start"}>
                        <Text color={units.length === data.unitsPerChallenge ? "#0f0" : "#ff0"}>{`${units.length} / ${data.unitsPerChallenge} Units Selected`}</Text>
                        <Flex>
                            <Button onClick={() => setUnits([])} isDisabled={units.length <= 0}>Clear All</Button>
                            <Button onClick={() => setUnits(units.slice(0, -1))} isDisabled={units.length <= 0}>Clear Last</Button>
                            <Button onClick={() => setSelected(units)}>Confirm</Button>
                        </Flex>
                        <Flex>
                        
                        <HStack spacing={1} wrap={"wrap"}>
                            {units.map((value, index) => {
                                return (
                                    <Image key={index} h={10} objectFit={"contain"} src={`/image/${value.image}`}/>
                                )
                            })}
                        </HStack>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
