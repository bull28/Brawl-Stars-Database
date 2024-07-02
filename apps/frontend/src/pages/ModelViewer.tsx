import {useState, useEffect, useRef} from "react";
import {Flex, Text, Image, Input, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from "@chakra-ui/react";
import axios, {AxiosResponse} from "axios";
import {scrollStyle} from "../themes/scrollbar";
import BackButton from "../components/BackButton";
import AnimationViewer from "../components/AnimationViewer";
import api from "../helpers/APIRoute";
import cdn from "../helpers/CDNRoute";

interface ModelList{
    name: string;
    displayName: string;
    image: string;
    skins: {
        displayName: string;
        geometry: string;
        winAnimation: string;
        loseAnimation: string;
    }[];
}

function ModelSelector({onChangeSkin}: {onChangeSkin: (skin: ModelList["skins"][number]) => void;}){
    const [models, setModels] = useState<ModelList[]>([]);
    const [search, setSearch] = useState<string>("");
    const [showMenu, setShowMenu] = useState<boolean>(true);
    const [selectedBrawler, setSelectedBrawler] = useState<string>("");
    const [selectedSkin, setSelectedSkin] = useState<string>("");

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        axios.get<{}, AxiosResponse<ModelList[]>>(`${api}/models`)
        .then((res) => {
            setModels(res.data);
        })
        .catch((error) => {
            setModels([]);
        });
    }, []);

    return (
    <>
        <Text pos={["relative", "absolute"]} zIndex={69} fontSize={"4xl"} className={"heading-4xl"}>3D Model Viewer</Text>
        <Button pos={"absolute"} zIndex={71} maxW={"60vw"} left={["3em", "3.5em"]} top={["0", "0.5em"]} className={"heading-md"} onClick={() => setShowMenu(!showMenu)}>Show / Hide Brawlers</Button>
        <Flex pos={"absolute"} zIndex={70} left={0} display={showMenu ? "flex" : "none"} w={["100%", "100%", "20vw"]} maxW={["100%", "100%", "20em"]} h={"100vh"} bgColor={"#000000b6"} flexDir={"column"} pt={"3.5em"} overflowY={"scroll"} sx={scrollStyle}>
            <Flex>
                <Input ref={inputRef} fontSize={"xl"} placeholder={"Search Brawler"}/>
                <Button className={"heading-md"} onClick={() => {if (inputRef.current !== null){setSearch(inputRef.current.value);}}}>Search</Button>
            </Flex>
            <Accordion allowToggle>
            {models.map((brawler) => (
                <AccordionItem key={brawler.name} display={brawler.name.startsWith(search) ? "block" : "none"}>
                    <AccordionButton p={1}>
                        <Flex w={"100%"} justifyContent={"space-between"}>
                            <Flex alignItems={"center"}>
                                <Image src={`${cdn}/image/${brawler.image}`} h={7} mr={2}/>
                                <Text fontSize={"xl"} className={"heading-xl"} margin={0} color={brawler.displayName === selectedBrawler ? "#0f0" : "#fff"}>{brawler.displayName}</Text>
                            </Flex>
                            <AccordionIcon/>
                        </Flex>
                    </AccordionButton>
                    <AccordionPanel px={"0.5em"}>
                        <Flex flexDir={"column"}>
                        {brawler.skins.map((skin) => (
                            <Button className={"heading-md"} color={skin.displayName === selectedSkin ? "#0f0" : "#fff"} p={0} w={"100%"} key={brawler.name + skin.displayName} onClick={() => {
                                setSelectedSkin(skin.displayName);
                                setSelectedBrawler(brawler.displayName);
                                onChangeSkin(skin);
                            }}>{skin.displayName}</Button>
                        ))}
                        </Flex>
                    </AccordionPanel>
                </AccordionItem>
            ))}
            </Accordion>
        </Flex>
    </>
    );
}

export default function ModelViewer(){
    const onChangeSkin = (skin: ModelList["skins"][number]) => {
        setSkin(skin);
    };

    const [skin, setSkin] = useState<ModelList["skins"][number]>({displayName: "", geometry: "", winAnimation: "", loseAnimation: ""});

    return (
        <Flex w={"100vw"} flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <ModelSelector onChangeSkin={onChangeSkin}/>
            <Flex flexDir={["column", "column", "row"]} w={"100%"} flex={1}>
                <Flex w={"100%"} h={["80vh", "80vh", "100vh"]} mt={["10vh", "10vh", "0"]}>
                    <AnimationViewer
                        modelFile={skin.geometry}
                        winFile={skin.winAnimation !== "" ? skin.winAnimation : undefined}
                        loseFile={skin.loseAnimation ? skin.loseAnimation : undefined}
                        sceneFile={""}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
}
