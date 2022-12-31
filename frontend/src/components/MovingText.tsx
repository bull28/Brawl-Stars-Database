import { Flex, Text } from "@chakra-ui/react";
import { GoldMovingBackground } from "../themes/rainbow";

export default function MovingText({title, color1, color2, fontSize}: {title: string, color1: string, color2: string, fontSize: string}){
    return (
        <Flex pos={'relative'} justifyContent={'center'}>
            <Text pos={'absolute'} background={`linear-gradient(to left, ${color1}, ${color2}, ${color1})`} backgroundClip={'text'} color={'transparent'} animation={`${GoldMovingBackground()} 30s linear infinite`} fontSize={fontSize} fontWeight={'bold'}>{title}</Text>            
            <Text fontSize={fontSize} fontWeight={'bold'} className={`heading-${fontSize}`}>{title}</Text>            
        </Flex>
    )
}