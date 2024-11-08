import { Flex, Text } from "@chakra-ui/react";
import { MovingBackground } from "../themes/animations";

interface MovingTextProps{
    title: string;
    fontSize: string;
    color1?: string;
    color2?: string;
    colors?: string[];
}

export default function MovingText({title, color1, color2, colors, fontSize}: MovingTextProps){
    let colorString = "";
    if (colors !== undefined){
        colorString = colors.reduce((previous, current) => previous += `, ${current}`, colors[colors.length - 1]);
    } else if (color1 !== undefined && color2 !== undefined){
        colorString = `${color1}, ${color2}, ${color1}`;
    }
    return (
        <Flex pos={"relative"} justifyContent={"center"}>
            <Text
                pos={"absolute"}
                background={`linear-gradient(to left, ${colorString})`}
                backgroundClip={"text"}
                color={"transparent"}
                animation={`${MovingBackground()} 30s linear infinite`}
                fontSize={fontSize}
            >{title}</Text>
            <Text color={"black"} fontSize={fontSize} className={`heading-${fontSize}`}>{title}</Text>            
        </Flex>
    );
}
