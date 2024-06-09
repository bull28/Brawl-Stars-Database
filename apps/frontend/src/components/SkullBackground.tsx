import { Flex, Image, keyframes } from "@chakra-ui/react";
import { useState, useEffect } from 'react'
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData} from "../types/CosmeticData";
import cdn from "../helpers/CDNRoute";

export default function SkullBackground({bg, icon}: {bg?: string; icon?: string;}) {
    const [cosmetics, setCosmetics] = useState<CosmeticData | undefined>();
    const [extraImage, setExtraImage] = useState<string>("");
    
    useEffect(() => {
        if (bg && icon){
            setCosmetics({background: bg, icon: icon, music: "", scene: ""});
            AuthRequest<{extra: string;}>(`/cosmetic/extra?${new URLSearchParams({background: bg})}`, {
                setState: (data) => {setExtraImage(data.extra);}
            }, false);
        } else {
            AuthRequest<CosmeticData>("/cosmetic", {
                setState: (data) => {
                    setCosmetics(data);
                    AuthRequest<{extra: string;}>(`/cosmetic/extra?${new URLSearchParams({background: data.background})}`, {
                        setState: (data2) => {setExtraImage(data2.extra);}
                    }, false);
                }
            }, false);
        }
    }, [bg, icon]);    

    const animation1 = keyframes`
        0% {
            transform: translateY(0px);
        }

        100% {
            transform: translateY(255.7407407vh);
        }
    
    `;

    const animation2 = keyframes`
        0% {
            transform: translateY(-255.7407407vh);
        }

        100% {
            transform: translateY(0px);
        }
    
    `;

    return (
        <Flex pos={'fixed'} overflow={'hidden'} zIndex={'-1'} top={0} w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'center'}>     
        {cosmetics && <>
            <Image w={'100vw'} h={'255.7407407vh'} objectFit={'cover'} animation={`${animation1} 175s linear infinite reverse`} pos={'absolute'} src={`${cdn}/image/${cosmetics.icon}`}/>
            <Image w={'100vw'} h={'255.7407407vh'} objectFit={'cover'} animation={`${animation2} 175s linear infinite reverse`} pos={'absolute'} src={`${cdn}/image/${cosmetics.icon}`}/>
            {extraImage.length > 0 && <Image w={'100%'} h={'100%'} src={`${cdn}/image/${extraImage}`} pos={'absolute'}/>}
            <Image w={'100%'} h={'100%'} src={`${cdn}/image/${cosmetics.background}`}/>
        </>}
        </Flex>
        
    )
}
