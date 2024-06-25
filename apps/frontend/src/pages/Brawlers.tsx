import {useEffect, useState, useRef} from "react";
import {useSearchParams} from "react-router-dom";
import {Flex, ScaleFade, SimpleGrid, Text} from "@chakra-ui/react";
import axios, {AxiosResponse} from "axios";
import BrawlerView from "../components/BrawlerView";
import {Brawler} from "../types/BrawlerData";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";

export default function Brawlers(){
    const [brawlers, setBrawlers] = useState<Brawler[]>([]);
    const ref = useRef<HTMLDivElement>(null);
    const loaded = useRef<number>(0);

    const [params, setParams] = useSearchParams();
    const scrollToBrawler = params.get("brawler");

    const loadImage = () => {
        loaded.current += 1;
        if (loaded.current >= brawlers.length && ref.current !== null){
            ref.current.scrollIntoView({block: "center"});
            params.delete("brawler");
            setParams(params, {replace: true});
        }
    };

    useEffect(() => {
        axios.get<{}, AxiosResponse<Brawler[]>>(`${api}/brawler`)
        .then((res) => {
            setBrawlers(res.data);
        })
        .catch((error) => {
            setBrawlers([]);
        });
    }, []);

    return (
        <Flex w={"100%"} flexDir={"column"} alignItems={"center"}>
            <BackButton/>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Brawlers</Text>
            <Flex w={"95%"} mt={5} mb={[3, 4, 5, 6, 8, 10]} justifyContent={"center"} onLoad={loadImage}>
                <SimpleGrid columns={[2, 3, 4, 5, 6, 7]} spacing={[3, 4, 5, 6, 8, 10]}>
                    {brawlers.map((brawler) =>
                        <Flex ref={brawler.name === scrollToBrawler ? ref : undefined} key={brawler.name} id={brawler.name}>
                            <ScaleFade in={true} delay={0.15}>
                                <BrawlerView image={brawler.image} name={brawler.name} displayName={brawler.displayName} rarityColor={brawler.rarity.color}/>
                            </ScaleFade>
                        </Flex>
                    )}
                </SimpleGrid>
            </Flex>
        </Flex>
    );
}
