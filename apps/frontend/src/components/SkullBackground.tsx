import { Flex, Image, keyframes } from "@chakra-ui/react";
import { useState, useEffect } from 'react'
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData} from "../types/CosmeticData";
import api from "../helpers/APIRoute";

export default function SkullBackground({bg, icon}: {bg?: string; icon?: string;}) {

    const [cosmetics, setCosmetics] = useState<CosmeticData>()
    
    useEffect(() => {
        if (bg && icon){
            setCosmetics({background: bg, icon: icon, music: "", scene: ""});
        } else {
            AuthRequest<CosmeticData>("/cosmetic", {setState: setCosmetics});
        }
    }, [bg, icon])
    

    const animation1 = keyframes`
        0% {
            transform: translateY(0px);
        }

        100% {
            transform: translateY(255.7407407vh);
        }
    
    `

    const animation2 = keyframes`
        0% {
            transform: translateY(-255.7407407vh);
        }

        100% {
            transform: translateY(0px);
        }
    
    `

    return (
        <Flex pos={'fixed'} overflow={'hidden'} zIndex={'-1'} top={0} w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'center'}>     
        {cosmetics && <>               
            <Image w={'100vw'} h={'255.7407407vh'} objectFit={'cover'} animation={`${animation1} 175s linear infinite reverse`} pos={'absolute'} src={`${api}/image/${cosmetics.icon}`}/>
            <Image w={'100vw'} h={'255.7407407vh'} objectFit={'cover'} animation={`${animation2} 175s linear infinite reverse`} pos={'absolute'} src={`${api}/image/${cosmetics.icon}`}/>
            <Image w={'100%'} h={'100%'} src={`${api}/image/${cosmetics.background}`}/>
        </>}
        </Flex>
        
    )
}
