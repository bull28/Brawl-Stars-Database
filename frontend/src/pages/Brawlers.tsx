import {useEffect, useState} from "react";
import {Flex, ScaleFade, SimpleGrid, Text} from "@chakra-ui/react";
import axios, {AxiosResponse} from "axios";
import BrawlerView from "../components/BrawlerView";
import {Brawler} from "../types/BrawlerData";
import SkullBackground from "../components/SkullBackground";
import api from "../helpers/APIRoute";

export default function Brawlers(){
    const [brawlers, setBrawlers] = useState<Brawler[]>([]);

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
            <SkullBackground/>
            <Text fontSize={"4xl"} className={"heading-4xl"}>Brawlers</Text>
            <Flex w={"95%"} mt={5} mb={[3, 4, 5, 6, 8, 10]} justifyContent={"center"}>
                <SimpleGrid columns={[2, 3, 4, 5, 6, 7]} spacing={[3, 4, 5, 6, 8, 10]}>
                    {brawlers.map((brawler) =>
                        <Flex key={brawler.name}>
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
