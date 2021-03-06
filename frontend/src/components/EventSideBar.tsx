import { Flex, Text, Divider, Icon, RadioGroup, Stack, Radio, Input, Select, InputGroup, InputRightElement, Button, useMediaQuery, Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure, 
    useToast} from "@chakra-ui/react";

import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import { useState } from "react";
import axios from 'axios';


export default function EventSideBar({ changeData }: {changeData: any}){
    const [choice, setChoice] = useState<string>("current");
    const [select, setSelect] = useState<string>("at_time");
    const [time, setTime] = useState<string[]>(["", "", ""]);
    const [searchText, setSearchText] = useState<string>("");
    const [date, setDate] = useState<string>("");

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

    const update = () => {
        let endpoint = "";

        if (choice === "current"){
            endpoint = "/event/current"

        } else if (choice === "season_time" && !time.includes("")){
            if (select === "at_time"){
                endpoint = `/event/seasontime/${time[0]}/${time[1]}/${time[2]}`
            } else if (select === "from_now"){
                endpoint = `/event/later/${time[0]}/${time[1]}/${time[2]}`
            }

        } else if (choice === "world_time" && date !== ""){
            endpoint = `/event/worldtime/${getSeconds(date)}`
        }
        
        if (endpoint !== ""){

            axios.get(endpoint)
                .then((res) => {
                    changeData(res.data)

                    if (choice === "season_time" && select === "at_time"){
                        setTime([res.data.time.hour, res.data.time.minute, res.data.time.second])
                    }
                })
            
            
        } else {
            toast({
                title: 'Please Enter a Valid Time.',
                status: 'error',
                duration: 3000,
                isClosable: true
            })
        }
        
    }

    if (query){
        return (
            <Flex flexDir={'column'} h={"80vh"} style={{caretColor: "transparent"}} border={'1px'} borderRadius={'md'} borderColor={'gray.200'} w={'25%'} maxW={'350px'} justifyContent={'space-around'} px={5} mr={10} ml={3} boxShadow={'rgba(99, 99, 99, 0.2) 0px 1px 4px 0px'}>
                <Text fontSize={"2xl"} fontWeight={'bold'}>Event Menu</Text>
                <Divider color={'black'} opacity={1} pr={5}/>
                <RadioGroup onChange={setChoice} value={choice}>
                    <Stack direction={'column'} spacing={[5, 10]}>
                        <Radio value='current'>Current</Radio>
                        <Radio value='season_time'>Season Time</Radio>
                        <Stack direction={'row'} alignItems={'center'}>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 0)} value={time[0]}/>
                            <Text>:</Text>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 1)} value={time[1]}/>
                            <Text>:</Text>
                            <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 2)} value={time[2]}/>
                        </Stack>
                        <Select onChange={(e) => setSelect(e.target.value)} value={select}>
                            <option value='at_time'>At Time</option>
                            <option value='from_now'>From Now</option>                            
                        </Select>
                        <Radio value='world_time'>World Time</Radio>
                        <Input type={'datetime-local'} onChange={(e) => setDate(e.target.value)} value={date}/>
                        <Button type={'button'} colorScheme={'facebook'} onClick={update}>Update</Button>
                    </Stack>
                </RadioGroup>
    
                <Divider color={'black'} opacity={0} my={10} orientation={'horizontal'}/>
                <Flex alignItems={'center'} alignContent={'center'} textAlign={'center'} mb={4} position={'absolute'} bottom={0}>
                    <form onSubmit={e => {
                        e.preventDefault();
                        search()}
                    }>
                        <InputGroup>
                            <Input type={'text'} value={searchText} onChange={e => setSearchText(e.target.value)}/>
                            <InputRightElement>
                                <Icon as={SearchIcon} onClick={search} cursor={'pointer'} fontSize={'xl'}/>
                            </InputRightElement>
                        </InputGroup>
                    </form>
                </Flex>
                    
                
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
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 0)} value={time[0]}/>
                                    <Text>:</Text>
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 1)} value={time[1]}/>
                                    <Text>:</Text>
                                    <Input type={'number'} onChange={(e) => handleTimeChange(e.target.value, 2)} value={time[2]}/>
                                </Stack>
                                <Select onChange={(e) => setSelect(e.target.value)} value={select}>
                                    <option value='at_time'>At Time</option>
                                    <option value='from_now'>From Now</option>                            
                                </Select>
                                <Radio value='world time'>World Time</Radio>
                                <Input type={'datetime-local'} onChange={(e) => setDate(e.target.value)} value={date}/>
                                <Button type={'button'} colorScheme={'facebook'} onClick={() => {update(); onClose();}}>Update</Button>
                            </Stack>
                            </RadioGroup>
                        </DrawerBody>
                        <DrawerFooter>
                            <InputGroup>
                                <Input type={'text'}/>
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