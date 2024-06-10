import {Flex, Text, SimpleGrid} from "@chakra-ui/react";
import axios from "axios";
import {useEffect, useState, useRef} from "react";
import EventView from "../components/EventView";
import EventSideBar from "../components/EventSideBar";
import {EventData} from "../types/EventData";
import MapView from "../components/MapView";
import SkullBackground from "../components/SkullBackground";
import BackButton from "../components/BackButton";
import api from "../helpers/APIRoute";

export default function Events(){
    const [data, setData] = useState<EventData | undefined>(undefined);
    const [offset, setOffset] = useState<number>(0);
    const [map, setMap] = useState<string>("");

    const mapViewRef = useRef<{open: () => void}>({open: () => {}});

    useEffect(() => {
        axios.get(`${api}/event/current`)
        .then((res) => {
            setData(res.data)
        })
        .catch((error) => {
            setData(undefined);
        });
    }, []);

    const openMapView = (m: string) => {
        setMap(m);
        mapViewRef.current.open()
    }

    return (
        <Flex flexDir={"column"} justifyContent={"space-between"} w={"100%"}>
            <SkullBackground/>
            <BackButton/>
            <Flex w={"100%"} textAlign={"center"} justifyContent={"center"}>
                <Text fontSize={"4xl"} className={"heading-4xl"}>Events</Text>  
            </Flex>
            <Flex flexDir={"row"} justifyContent={["center", "center", "flex-start"]}>
                <EventSideBar changeEvents={setData} changeOffset={setOffset} openMapView={openMapView} startTime={new Date()}/>
                <Flex flexDir={"column"} mt={10}>
                {data !== void 0 && <SimpleGrid columns={[1, 1, 2, 2, 2, 3]} spacing={5} w={"100%"}>
                    {data.events.map((event) => (
                        <EventView event={event} offset={offset} openMapView={openMapView} key={event.current.map.name + event.current.gameMode.name}/>
                    ))}
                </SimpleGrid>}
                </Flex>
            </Flex>
            <MapView map={map} ref={mapViewRef}/>
        </Flex>
    );
}
