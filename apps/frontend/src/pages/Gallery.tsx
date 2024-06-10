import { Button, Flex, Image, Text, Link, SimpleGrid, VStack } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import SkullBackground from "../components/SkullBackground";
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData, ThemeProps} from "../types/CosmeticData";
import {scrollStyle} from "../themes/scrollbar";
import BackButton from "../components/BackButton";
import cdn from "../helpers/CDNRoute";

interface Category{
    name: string;
    description: string;
    themes: {
        displayName: string;
        path: string;
        image: string;
    }[];
}

interface ThemeCategories{
    background: Category;
    icon: Category;
    music: Category;
    scene: Category;
}

export default function Gallery() {
    const [themes, setThemes] = useState<ThemeCategories | undefined>(undefined);
    const [cosmetics, setCosmetics] = useState<CosmeticData | undefined>(undefined);

    const updateCosmeticItem = (cosmetics: CosmeticData, key: string, value: string): CosmeticData => {
        const newCosmetics: CosmeticData = {
            background: cosmetics.background,
            icon: cosmetics.icon,
            music: cosmetics.music,
            scene: cosmetics.scene
        };

        if (newCosmetics.hasOwnProperty(key)){
            newCosmetics[key as keyof CosmeticData] = value;
        }

        return newCosmetics;
    }

    const organizeData = useCallback(({background, icon, music, scene}: ThemeProps) => {
        const sortedThemes: ThemeCategories = {
            background: {name: "Backgrounds", description: "Personalize the Website with a New Background!", themes: []},
            icon: {name: "Icons", description: "Personalize the Website with New Background Icons!", themes: []},
            music: {name: "Music", description: "Personalize the Website with a New Background Track!", themes: []},
            scene: {name: "Scenes", description: "Personalize the Website with New Skin Viewer Scenes!", themes: []}
        };

        for (let x = 0; x < background.length; x++){
            sortedThemes.background.themes.push({displayName: background[x].displayName, path: background[x].path, image: background[x].path});
        }
        for (let x = 0; x < icon.length; x++){
            sortedThemes.icon.themes.push({displayName: icon[x].displayName, path: icon[x].path, image: icon[x].preview});
        }
        for (let x = 0; x < music.length; x++){
            sortedThemes.music.themes.push({displayName: music[x].displayName, path: music[x].path,image: ""});
        }
        for (let x = 0; x < scene.length; x++){
            sortedThemes.scene.themes.push({displayName: scene[x].displayName, path: scene[x].path, image: scene[x].preview});
        }
        
        setThemes(sortedThemes);
    }, []);

    useEffect(() => {
        AuthRequest<ThemeProps>("/theme", {setState: organizeData}, false);
        AuthRequest<CosmeticData>("/cosmetic", {setState: setCosmetics}, false);
    }, [organizeData]);

    const saveChanges = () => {
        AuthRequest<CosmeticData>("/cosmetic", {data: {setCosmetics: cosmetics}, message: {title: "Changes Saved!", status: "success", duration: 3000}, errorToastMessage: "Something Went Wrong!"});
    };

    return (
    <Flex alignItems={"center"} flexDir={"column"} justifyContent={"space-between"} maxH={"100vh"}>      
        {cosmetics && <SkullBackground bg={cosmetics.background} icon={cosmetics.icon}/>}
        <BackButton/>
        <Flex flexDir={"column"} alignItems={"center"}>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Gallery</Text>
        </Flex>
        {(cosmetics !== void 0 && themes !== void 0) ?
            <Flex flexDir={"column"} alignItems={"center"}>
            <SimpleGrid columns={[1, 1, 1, 2]} spacingX={"5vw"} spacingY={[5, 10]}>
                {Object.keys(themes).map((key) => {
                    const value = themes[key as keyof ThemeCategories];
                    let selected = "";
                    if (cosmetics.hasOwnProperty(key)){
                        selected = cosmetics[key as keyof typeof cosmetics];
                    }
                    
                    return (
                        <Flex key={key} flexDir={"column"} alignItems={"center"}>
                            <Text fontSize={"3xl"} className={"heading-3xl"} mb={5}>{value.name}</Text>        
                            <VStack p={3} spacing={3} bgColor={"blue.500"} borderRadius={"lg"} border={"3px solid"} borderColor={"blue.700"} overflowY={"scroll"} maxH={"80vh"} sx={scrollStyle}>
                                {value.themes.map((theme) => (
                                <Flex key={theme.path + theme.displayName} w={["80vw", "80vw", "70vw", "40vw", "30vw"]} bgColor={selected === theme.path ? "green.300" : "lightskyblue"} justifyContent={"space-between"} flexDir={["column", "row"]} p={[2, 3, 4]} borderRadius={"lg"} border={"2px solid black"}>
                                    <Flex>
                                        <Image w={["20vw", "20vw", "16vw", "10vw", "8vw"]} h={["20vw", "20vw", "16vw", "10vw", "8vw"]} bgColor={theme.image !== "" ? "#000" : "#0000"} borderRadius={"lg"} border={"2px solid black"} objectFit={"cover"} src={theme.image !== "" ? `${cdn}/image/${theme.image}` : `${cdn}/image/misc/bg_3d_model.webp`} boxShadow={"0px 0px 25px #fff"}/>
                                        
                                        <Flex flexDir={"column"} mx={"5%"}>
                                            <Text className={"heading-2xl"} mb={[0, 1, 1, 1, 1]} fontSize={["lg", "xl", "2xl", "xl", "2xl"]}>{theme.displayName}</Text>
                                            <Text fontSize={["xs", "sm", "md", "sm", "md"]} className={"heading-md"}>{value.description}</Text>
                                        </Flex>
                                    </Flex>
                                    <Flex flexDir={"column"} my={2} justifyContent={"space-around"}>                  
                                        <Button isDisabled={selected === theme.path} onClick={() => {setCosmetics(updateCosmeticItem(cosmetics, key, theme.path))}} fontSize={"xl"} bgColor={"green.500"}>Use</Button>
                                    </Flex>
                                </Flex>
                                ))}
                            </VStack>
                        </Flex>
                    );
                })}
            </SimpleGrid>
            <Button my={"10vh"} fontSize={"2xl"} className={"heading-2xl"} onClick={saveChanges} bgColor={"green.300"} borderColor={"green.500"} border={"2px solid #9f9"} h={"5vh"}>Save</Button>
            </Flex>
            :
            <Flex flexDir={"column"} alignItems={"center"} w={"100vw"} h={"100vh"} justifyContent={"center"} pos={"absolute"} zIndex={-1}>
                <Flex flexDir={"column"} alignItems={"center"} justifyContent={"center"} bgColor={"lightskyblue"} border={"2px solid"} borderColor={"blue.500"} borderRadius={"lg"} p={5}>
                <Text fontSize={"2xl"} className={"heading-2xl"} >Please login to view the Gallery</Text>
                <Link fontSize={"2xl"} className={"heading-xl"} color={"blue.300"} href="/login">Click here to login</Link>
                </Flex>
            </Flex>
        }
    </Flex>
    );
}
