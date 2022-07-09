import { Flex, Text, Divider, Icon, RadioGroup, Stack, Radio, Input, Select, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from "react";



export default function EventSideBar(){
    const [choice, setChoice] = useState<string>("current")

    const search = () => {
        console.log('Search!')
    }
    return (
        <Flex flexDir={'column'} h={"100vh"} style={{caretColor: "transparent"}} borderRight={'1px'} borderColor={'gray.200'} maxW={'25%'} justifyContent={'space-between'} px={5}>
            <Text fontSize={"2xl"} fontWeight={'bold'}>Event Menu</Text>
            <Divider color={'black'} opacity={1} mt={3} mb={6} pr={10}/>
            <RadioGroup onChange={setChoice} value={choice}>
                <Stack direction={'column'} spacing={5}>
                    <Radio value='current'>Current</Radio>
                    <Radio value='upcoming'>Upcoming</Radio>
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
}