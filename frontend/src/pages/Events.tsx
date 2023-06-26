import {Flex, Text, SimpleGrid} from "@chakra-ui/react";
import axios from "axios";
import {useEffect, useState} from "react";
import EventView from "../components/EventView";
import EventSideBar from "../components/EventSideBar";
import {EventData} from "../types/EventData";
import SkullBackground from "../components/SkullBackground";
import api from "../helpers/APIRoute";

export default function Events(){
    const [data, setData] = useState<EventData | undefined>(undefined);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        axios.get(`${api}/event/current`)
        .then((res) => {
            setData(res.data)
        })
        .catch((error) => {
            setData(undefined);
        });
    }, []);

    return (
        <Flex flexDir={"column"} justifyContent={"space-between"} w={"100%"}>
            <SkullBackground/>
            <Flex w={"100%"} textAlign={"center"} justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Events</Text>  
            </Flex>
            <Flex flexDir={"row"}>
                <EventSideBar changeEvents={setData} changeOffset={setOffset} startTime={new Date()}/>
                <Flex flexDir={"column"} mt={10}>
                {typeof data !== "undefined" && <SimpleGrid columns={[1, 1, 2, 2, 2, 3]} spacing={5} w={"100%"}>
                    {data?.events.map((event) => (
                    <EventView event={event} offset={offset} key={event.current.map.name + event.current.gameMode.name}/>
                    ))}
                </SimpleGrid>}
                </Flex>
            </Flex>
        </Flex>
    );
}
