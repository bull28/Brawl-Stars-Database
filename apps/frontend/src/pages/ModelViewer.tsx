import {useState} from "react";
import {Flex, Text, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from "@chakra-ui/react";
import {scrollStyle} from "../themes/scrollbar";
import BackButton from "../components/BackButton";
import AnimationViewer from "../components/AnimationViewer";

interface ModelList{
    name: string;
    displayName: string;
    skins: {
        displayName: string;
        geometry: string;
        winAnimation?: string;
        loseAnimation?: string;
    }[];
}

export default function ModelViewer(){
    const [models, setModels] = useState<ModelList[]>([]);
    const [selectedBrawler, setSelectedBrawler] = useState<string>("");
    const [selectedSkin, setSelectedSkin] = useState<ModelList["skins"][number]>({displayName: "", geometry: ""});

    return (
        <Flex w={"100%"} flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Text pos={"absolute"} zIndex={69} fontSize={"4xl"} className={"heading-4xl"}>3D Model Viewer</Text>
            <Flex flexDir={["column", "column", "row"]} w={"100%"} flex={1}>
                <Flex flex={[null, null, 1]} minW={"20em"} maxW={["100vw", "100vw", "32em"]} h={["30vh", "30vh", "auto"]} bgColor={"#00000030"} flexDir={"column"} pt={"3.5em"} overflowY={"auto"} sx={scrollStyle}>
                    <Accordion allowToggle>
                    {models.map((brawler) => (
                        <AccordionItem key={brawler.name}>
                            <AccordionButton>
                                <Flex w={"100%"} justifyContent={"space-between"}>
                                    <Text margin={0} color={brawler.displayName === selectedBrawler ? "#0f0" : "#fff"}>{brawler.displayName}</Text>
                                    <AccordionIcon/>
                                </Flex>
                            </AccordionButton>
                            <AccordionPanel px={"0.5em"}>
                            {brawler.skins.map((skin) => (
                                <Button color={skin.displayName === selectedSkin.displayName ? "#0f0" : "#fff"} w={"100%"} key={brawler.name + skin.displayName} onClick={() => {
                                    setSelectedSkin(skin);
                                    setSelectedBrawler(brawler.displayName);
                                }}>{skin.displayName}</Button>
                            ))}
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </Flex>
                <Flex flex={[null, null, 4]} h={["50vh", "50vh", "100vh"]}>
                    <AnimationViewer modelFile={selectedSkin.geometry} winFile={selectedSkin.winAnimation} loseFile={selectedSkin.loseAnimation} sceneFile={""}/>
                </Flex>
            </Flex>
        </Flex>
    );
}
