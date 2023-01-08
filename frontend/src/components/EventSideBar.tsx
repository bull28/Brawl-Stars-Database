import { Flex, Text, Divider, Icon, RadioGroup, Stack, Radio, Input, Select, InputGroup, InputRightElement, Button, useMediaQuery, Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure, 
    useToast,
    Image,
    Spinner} from "@chakra-ui/react";

import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import { useEffect, useRef, useState, useCallback } from "react";
import MapView from './MapView';
import axios from 'axios';

interface MapData {
    name: string,
    displayName: string,
    gameModeData: {
        name: string,
        image: string,
        backgroundColor: string,
        textColor: string
    }
}

interface Timer {
    start: number,
    offset: number
}

interface EventMode {
    choice: string,
    select: string
}


export default function EventSideBar({ changeData, changeOffset, startTime }: {changeData: Function, changeOffset: Function, startTime: Date}){
    const [choice, setChoice] = useState<string>("current");
    const [select, setSelect] = useState<string>("at_time");
    const [time, setTime] = useState<string[]>(["", "", ""]);
    const [searchText, setSearchText] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [maps, setMaps] = useState<MapData[]>([]);
    const [map, setMap] = useState<string>("");
    const mapViewRef = useRef<{ open: () => void}>(null)
    const [timer, updateTimer] = useState<Timer>({start: startTime.getTime(), offset: 0});// Time since the last update
    const [lastUpdate, setlastUpdate] = useState<number>(3600000);// Time at the last update
    const [eventMode, setEventMode] = useState<EventMode>({choice: "current", select: "at_time"});// User's event mode choices, only updated when "Update" is clicked
    const [success, setSuccess] = useState<boolean>(true);// Whether or not the attemped calls to the API were successful

    const query = useMediaQuery('(min-width: 400px)')[0]
    const { isOpen, onOpen, onClose } = useDisclosure() 
    const toast = useToast()

    const handleTimeChange = (value: string, index: number) => {
        if (String(value).length < 4){
            let tempArr = [...time];
            tempArr[index] = value;
    
            setTime(tempArr);
        }
    }

    const getSeconds = (date: string): number => {
        return Math.floor((new Date(date)).getTime()/1000)
    }


    const search = () => {
        console.log(searchText)
    }
   
    const update = useCallback((choice1: string, choice2: string) => {
        let endpoint = "";

        if (choice1 === "current"){
            endpoint = "/event/current"

        } else if (choice1 === "season_time" && !time.includes("")){
            if (choice2 === "at_time"){
                endpoint = `/event/seasontime`
            } else if (choice2 === "from_now"){
                endpoint = `/event/later`
            }

        } else if (choice1 === "world_time" && date !== ""){
            endpoint = `/event/worldtime`
        }
        
        if (endpoint !== ""){
            axios.get(endpoint, {params: {hour: time[0], minute: time[1], second: (endpoint === "/event/worldtime") ? getSeconds(date) : time[2]}})
                .then((res) => {
                    if (choice1 === "season_time" && choice2 === "at_time"){
                        setTime([res.data.time.hour, res.data.time.minute, res.data.time.second]);
                    }
                    changeData(res.data);
                    setSuccess(true);

                    // Add the milliseconds from the current time to compensate for lower precison
                    // given by the API. (see below)
                    // Correct mod is not required since Date.now() is never negative.
                    setlastUpdate(res.data.time.second * 1000 + Date.now() % 1000);
                }).catch((error) => {
                    // This only occurs when the API encounters an error. Incorrectly formatted user input
                    // is handled by the if-statments above.
                    setSuccess(false);
                })
        } else {
            toast({
                title: 'Please Enter a Valid Time.',
                status: 'error',
                duration: 3000,
                isClosable: true
            })
        }
    }, [changeData, date, time, toast])

    const openMapView = (m: string) => {
        setMap(m);
        mapViewRef.current?.open()
    }

    useEffect(() => {
        axios.post('/mapsearch', {search: searchText})
            .then((res) => {
                setMaps(res.data)
            })
    }, [searchText])

    useEffect(() => {
        const id = setInterval(() => 
        updateTimer((previousTime) => {
            // Pause program if there is an error, a page reload or click on "Update" is required once the error is fixed.
            if (success === false){
                return previousTime;
            }

            // These event mode choices require real-time updating
            if (eventMode.choice === "current" || (eventMode.choice === "season_time" && eventMode.select === "from_now" && !time.includes(""))){
                var elapsed: number = Date.now() - previousTime.start;
                
                // Update when the last updated time + offset passes multiples of 1 minute.
                // If it does, update the events and set offset to 0.
                if (lastUpdate + elapsed >= 60000){
                    update(eventMode.choice, eventMode.select);
                    return {
                        start: Date.now(),
                        offset: 0
                    };
                }

                // If an update was not required, return the offset without changing the last update.
                return {
                    start: previousTime.start,
                    offset: elapsed
                };
            }

            return previousTime;
        })
        , 200)

        return () => {
            clearInterval(id);
        };
    }, [lastUpdate, timer, eventMode, success, time, update])// <- dependency list

    useEffect(() => {
        // When real-time updating is required, add the milliseconds from the last update to make the display
        // more accurate. Since the API only returns values up to a precision of 1 second, store the current
        // millisecond value at the time of the call to the API and add it to the offset. This (hopefullly)
        // makes it so a last updated time of 50s + 900ms and an offset of 5900ms gets displayed using an offset
        // of 56800ms => 56s and not 55900ms => 55s (example). This seemed to have fixed the issue where the
        // countdown skipped a second every once in a while.
        
        // When real-time updating is not required, the precision given by the API is sufficient because the
        // returned events will always be the same, no matter what time the endpoint was called at.

        if (eventMode.choice === "current" || (eventMode.choice === "season_time" && eventMode.select === "from_now" && !time.includes(""))){
            changeOffset(lastUpdate % 1000 + timer.offset);
        } else{
            changeOffset(timer.offset);
        }
    });

    if (query){
        return (
            <Flex flexDir={'column'} minH={"80vh"} style={{caretColor: "transparent"}} border={'1px'} borderRadius={'md'} borderColor={'gray.200'} w={'28%'} maxW={'350px'} justifyContent={'space-around'} px={5} mr={10} ml={3} boxShadow={'rgba(99, 99, 99, 0.2) 0px 1px 4px 0px'}>
                <Text fontSize={"2xl"} className={'heading-2xl'} my={8} >Event Menu</Text>
                <Divider color={'black'} opacity={1} pr={5} mb={6}/>
                <RadioGroup onChange={setChoice} value={choice}>
                    <Stack direction={'column'} spacing={[5, 10]}>
                        <Radio value='current'>Current</Radio>
                        <Radio value='season_time'>Season Time</Radio>
                        <Stack direction={'row'} alignItems={'center'}>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 0)} value={time[0]} style={{caretColor: 'auto'}}/>
                            <Text>:</Text>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 1)} value={time[1]} style={{caretColor: 'auto'}}/>
                            <Text>:</Text>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 2)} value={time[2]} style={{caretColor: 'auto'}}/>
                        </Stack>
                        <Select onChange={(e) => setSelect(e.target.value)} value={select}>
                            <option value='at_time'>At Time</option>
                            <option value='from_now'>From Now</option>                            
                        </Select>
                        <Radio value='world_time'>World Time</Radio>
                        <Input type={'datetime-local'} onChange={(e) => setDate(e.target.value)} value={date}/>
                        <Button type={'button'} onClick={() => {setEventMode({choice: choice, select: select}); update(choice, select); updateTimer({start: Date.now(), offset: 0});}}>Update</Button>
                    </Stack>
                </RadioGroup>
    
                <Divider color={'black'} opacity={0} my={10} orientation={'horizontal'}/>
                <Flex alignItems={'center'} alignContent={'center'} textAlign={'center'} flexDir={'column'} pb={3}>
                    
                    <InputGroup>
                        <Input type={'text'} value={searchText} onChange={e => setSearchText(e.target.value)} style={{caretColor: 'auto'}}/>
                        <InputRightElement>
                            <Icon as={SearchIcon} onClick={search} cursor={'pointer'} fontSize={'xl'}/>
                        </InputRightElement>
                    </InputGroup>
                    <Stack overflow={'auto'} overflowX={'hidden'} maxH={'130px'} mt={1} spacing={0} w={'100%'} sx={{
                        '&::-webkit-scrollbar': {
                        width: '16px',
                        borderRadius: '8px',
                        backgroundColor: `rgba(0, 0, 0, 0.05)`,
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `rgba(0, 0, 0, 0.5)`,
                        borderRadius: `6px`,
                        },
                    }}>
                    {maps.map((m) => (
                        <Button key={m.name} onClick={() => {openMapView(m.name)}} fontSize={['xs', 'xs', 'md', 'lg']} bgColor={'transparent'} py={2} color={m.gameModeData.textColor} fontWeight={'normal'}><Image src={`/image/${m.gameModeData.image}`} h={'100%'} mr={1} fallback={<Spinner/>}></Image>{m.displayName}</Button>
                    ))}
                    </Stack>
                    
                </Flex>
                    
                <MapView map={map} ref={mapViewRef}/>
            </Flex>
        )
    } else {
        return (
            <>
                <Icon as={HamburgerIcon} onClick={onOpen} position={'absolute'} top={2} right={2} fontSize={'3xl'}/>
                <Drawer isOpen={isOpen} placement={'right'} onClose={onClose}>
                    <DrawerOverlay/>
                    <DrawerContent>
                        <DrawerCloseButton/>
                        <DrawerHeader>Filter</DrawerHeader>
                        <DrawerBody>
                            <RadioGroup onChange={setChoice} value={choice}>
                            <Stack direction={'column'} spacing={[5, 10]}>
                                <Radio value='current'>Current</Radio>
                                <Radio value='season time'>Season Time</Radio>
                                <Stack direction={'row'} alignItems={'center'}>
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 0)} value={time[0]} style={{caretColor: 'auto'}}/>
                                    <Text>:</Text>
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 1)} value={time[1]} style={{caretColor: 'auto'}}/>
                                    <Text>:</Text>
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 2)} value={time[2]} style={{caretColor: 'auto'}}/>
                                </Stack>
                                <Select onChange={(e) => setSelect(e.target.value)} value={select}>
                                    <option value='at_time'>At Time</option>
                                    <option value='from_now'>From Now</option>                            
                                </Select>
                                <Radio value='world time'>World Time</Radio>
                                <Input type={'datetime-local'} onChange={(e) => setDate(e.target.value)} value={date}/>
                                <Button type={'button'} onClick={() => {setEventMode({choice: choice, select: select}); update(choice, select); updateTimer({start: Date.now(), offset: 0}); onClose();}}>Update</Button>
                            </Stack>
                            </RadioGroup>
                        </DrawerBody>
                        <DrawerFooter>
                            <InputGroup>
                                <Input type={'text'} style={{caretColor: 'auto'}}/>
                                <InputRightElement>
                                    <Icon as={SearchIcon} onClick={search} cursor={'pointer'}/>
                                </InputRightElement>
                            </InputGroup>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </>
        )
    }
}
