import { Flex, Text, Divider, Icon, RadioGroup, Stack, Radio, Input, Select, InputGroup, InputRightElement, Button, useMediaQuery, Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure, } from "@chakra-ui/react";
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons'
import { useState } from "react";



export default function EventSideBar(){
    const [choice, setChoice] = useState<string>("current")
    const query = useMediaQuery('(min-width: 400px)')[0]
    const { isOpen, onOpen, onClose } = useDisclosure() 

    const search = () => {
        console.log('Search!')
    }

    if (query){
        return (
            <Flex flexDir={'column'} h={"80vh"} style={{caretColor: "transparent"}} border={'1px'} borderRadius={'md'} borderColor={'gray.200'} w={'25%'} maxW={'350px'} justifyContent={'space-around'} px={5} mr={10} ml={3} boxShadow={'rgba(99, 99, 99, 0.2) 0px 1px 4px 0px'}>
                <Text fontSize={"2xl"} fontWeight={'bold'}>Event Menu</Text>
                <Divider color={'black'} opacity={1} pr={5}/>
                <RadioGroup onChange={setChoice} value={choice}>
                    <Stack direction={'column'} spacing={[5, 10]}>
                        <Radio value='current'>Current</Radio>
                        <Radio value='season time'>Season Time</Radio>
                        <Stack direction={'row'} alignItems={'center'}>
                            <Input type={'number'}/>
                            <Text>:</Text>
                            <Input type={'number'}/>
                            <Text>:</Text>
                            <Input type={'number'}/>
                        </Stack>
                        <Select>
                            <option value='option1'>Option 1</option>
                            <option value='option2'>Option 2</option>
                            <option value='option3'>Option 3</option>
                        </Select>
                        <Radio value='world time'>World Time</Radio>
                        <Input type={'datetime-local'}/>
                        <Button type={'button'} colorScheme={'facebook'}>Update</Button>
                    </Stack>
                </RadioGroup>
    
                <Divider color={'black'} opacity={0} my={10} orientation={'horizontal'}/>
                <Flex alignItems={'center'} alignContent={'center'} textAlign={'center'} mb={4} position={'absolute'} bottom={0}>
                    <InputGroup>
                        <Input type={'text'}/>
                        <InputRightElement>
                            <Icon as={SearchIcon} onClick={search} cursor={'pointer'}/>
                        </InputRightElement>
                    </InputGroup>
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
                                    <Input type={'number'}/>
                                    <Text>:</Text>
                                    <Input type={'number'}/>
                                    <Text>:</Text>
                                    <Input type={'number'}/>
                                </Stack>
                                <Select>
                                    <option value='option1'>Option 1</option>
                                    <option value='option2'>Option 2</option>
                                    <option value='option3'>Option 3</option>
                                </Select>
                                <Radio value='world time'>World Time</Radio>
                                <Input type={'datetime-local'}/>
                                <Button type={'button'} colorScheme={'facebook'}>Update</Button>
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