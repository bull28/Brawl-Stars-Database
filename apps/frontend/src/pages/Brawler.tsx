import {useEffect, useState} from "react";
import {Flex, Text, SimpleGrid, Image, Stack, keyframes} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import axios, {AxiosResponse} from "axios";
import SkinView from "../components/SkinView";
import {BrawlerData, ModelFiles, SkinData} from "../types/BrawlerData";
import BackButton from "../components/BackButton";
import cdn from "../helpers/CDNRoute";
import api from "../helpers/APIRoute";

export default function Brawler(){
    const params = useParams();
    const [data, setData] = useState<BrawlerData | undefined>();
    const [defaultSkin, setDefaultSkin] = useState<SkinData | undefined>();

    useEffect(() => {
        axios.get<{}, AxiosResponse<BrawlerData>>(`${api}/brawler/${params.brawler}`)
        .then((res) => {
            res.data.skins = res.data.skins.filter((value) => value.name !== res.data.defaultSkin);
            setData(res.data);
            axios.get<{}, AxiosResponse<SkinData>>(`${api}/skin/${params.brawler}/${res.data.defaultSkin}`)
            .then((skinRes) => {
                let defaultModel: ModelFiles = {
                    geometry: skinRes.data.model.geometry.path,
                    winAnimation: undefined,
                    loseAnimation: undefined
                };
                if (skinRes.data.model.winAnimation.exists){
                    defaultModel.winAnimation = skinRes.data.model.winAnimation.path;
                } if (skinRes.data.model.loseAnimation.exists){
                    defaultModel.loseAnimation = skinRes.data.model.loseAnimation.path;
                }
                setDefaultSkin(skinRes.data);
            })
            .catch((error) => {});
        })
        .catch((error) => {
            setData(undefined);
        });
    }, [params]);

    return (
    <>
    {data &&
        <Flex flexDir={"column"} w={"100%"} maxW={"100vw"} justifyContent={"center"} alignItems={"center"} bgColor={data.rarity.color} overflowX={"hidden"}>
            <BackButton path={`/brawlers?${new URLSearchParams({brawler: data.name})}`}/>
            <Flex w={"100%"} justifyContent={"center"} mt={3} mb={5}>
                <Text fontSize={"3xl"} className={"heading-3xl"} color={"#fff"}>{data.displayName}</Text>
            </Flex>
            <Stack direction={["column", "column", "column", "column", "row"]} h={["fit-content", "fit-content", "fit-content", "fit-content", "60vh"]} minH={["0px", "0px", "0px", "0px", "600px"]} w={"100%"} alignItems={"center"} justifyContent={"center"} spacing={["3vh", "3vh", "3vh", "3vh", "0vh"]} mb={5}>
                <Flex flexDir={"column"} textAlign={"center"} h={"100%"} justifyContent={"center"} alignItems={"center"} w={["100%", "80%", "69%", "50%", "33%"]}>
                    <Image src={`${cdn}/image/${data.image}`} borderRadius={"sm"} objectFit={"contain"} h={"50%"} border={"8px solid #000"} mb={7}/>
                    <Flex pos={"relative"} justifyContent={"center"}>
                        <Text pos={"absolute"} background={`linear-gradient(to left, #ffd12e, #ffdaac, #ffd12e, #f29928, #ffd12e)`} w={"120%"} backgroundClip={"text"} color={"transparent"} animation={`${keyframes`0%{background-position: 0rem;} 100%{background-position: ${Math.max(1, data.title.length) * 12.5}rem;}`} 60s linear infinite`} fontSize={"xl"} fontStyle={"italic"}>{data.title}</Text>
                        <Text color={"#000"} fontSize={"xl"} fontStyle={"italic"} className={`heading-xl`}>{data.title}</Text>
                    </Flex>
                    <Image src={`${cdn}/image/${data.masteryIcon}`} objectFit={"contain"} h={"20%"} mb={7} mt={2}/>
                    <Text w={["90%", "60%"]} color={"#fff"} fontSize={["sm", "md"]} className={"heading-md"}>{data.description}</Text>
                </Flex>

                <Flex justifyContent={"center"} alignItems={"center"} h={["60vw", "60vw", "50vw", "40vw", "100%"]} w={["60vw", "60vw", "50vw", "40vw", "33%"]} p={2} borderRadius={"xl"} bgColor={"#000"} bgImage={defaultSkin !== undefined ? `url(${cdn}/image/${defaultSkin?.group.image})` : undefined} backgroundPosition={"center"} backgroundSize={"cover"} backgroundRepeat={"no-repeat"}>
                {defaultSkin !== undefined && 
                    <Image src={`${cdn}/image/${defaultSkin.image}`} h={"100%"} objectFit={"contain"}/>
                }
                </Flex>

                <Flex w={["100%", "100%", "100%", "100%", "33%"]} h={"100%"} maxH={["60vh", "60vh", "60vh", "60vh", "100%"]} flexDir={"column"} justifyContent={"center"} alignItems={"center"}>
                    <Text color={"#fff"} fontSize={"2xl"} className={"heading-2xl"}>Pins</Text>
                    <SimpleGrid columns={[2, 4, 5, 6, 4]} spacing={3} bgColor={"gray.800"} p={3} borderRadius={"md"} w={"90%"} border={"1px solid rgba(255,255,255,0.8)"} overflowY={"scroll"} sx={{
                        "&::-webkit-scrollbar": {
                        width: "10px",
                        borderRadius: "8px",
                        backgroundColor: `rgba(255, 255, 255, 0.5)`,
                        },
                        "&::-webkit-scrollbar-thumb": {
                        backgroundColor: `rgba(255, 255, 255, 1)`,
                        borderRadius: `6px`,
                        },
                    }}>
                        {data.pins.map((pin) => (
                            <Flex bgColor={pin.rarity.color} borderRadius={"lg"} p={1} key={pin.image} border={"1px solid #ffffff80"}>
                                <Image src={`${cdn}/image/${pin.image}`}/>
                            </Flex>
                        ))}
                    </SimpleGrid>
                    {/*localStorage.getItem("username") ? 
                        <Link href={`/collection?brawler=${data.name}`} color={"#fff"} fontSize={"lg"} className={"heading-lg"}>{`View ${data.displayName} Collection `}<ExternalLinkIcon mx={"2px"}/></Link>
                        :
                        <Text color={"#fff"} fontSize={"lg"} className={"heading-lg"}><Link color={"blue.400"} href="/login">Log In</Link> To View Collection</Text>
                    */}
                </Flex>
            </Stack>
            <SimpleGrid spacing={[4, 3, 5, 5, 5]} columns={[1, 2, 2, 3, 4]} bgColor={"blue.900"} pt={"3vh"} w={"100%"} px={[1, 2, 4, 6, 6]}>{(data.skins).map((skin) => (
                <Flex key={skin.name} flexDir={"column"} m={[1, 2, 3]}>
                    <SkinView skin={skin.name} brawler={data.name}></SkinView>
                </Flex>
            ))}
            </SimpleGrid>
        </Flex>
    }
    </>
    );
}
