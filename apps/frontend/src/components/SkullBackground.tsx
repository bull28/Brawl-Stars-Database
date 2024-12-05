import {Flex, Image, keyframes} from "@chakra-ui/react";
import {useState, useEffect, useCallback} from "react"
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData} from "../types/CosmeticData";
import cdn from "../helpers/CDNRoute";

export default function SkullBackground({bg, icon}: {bg?: string; icon?: string}){
    const [cosmetics, setCosmetics] = useState<CosmeticData | undefined>();
    const [extraImage, setExtraImage] = useState<string>("");

    const updateBackground = useCallback((event: Event) => {
        const cosmetics = ((event as CustomEvent).detail as CosmeticData);
        setCosmetics(cosmetics);
    }, []);

    useEffect(() => {
        if (bg && icon){
            setCosmetics({background: bg, icon: icon, music: "", scene: "", extra: ""});

            const name = bg.split("/");
            const cosmeticName = name[name.length - 1].split("_")[0];
            AuthRequest<{extra: string;}>(`/cosmetic/search/${cosmeticName}`, {
                setState: (data) => {setExtraImage(data.extra);}
            }, false);
        } else {
            AuthRequest<CosmeticData>("/cosmetic", {
                setState: (data) => {
                    setCosmetics(data);
                    setExtraImage(data.extra);
                }
            }, false);
        }
    }, [bg, icon]);

    useEffect(() => {
        document.addEventListener("updatecosmetics", updateBackground);
        return () => {
            document.removeEventListener("updatecosmetics", updateBackground);
        };
    }, [updateBackground]);

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
        <Flex pos={"fixed"} overflow={"hidden"} zIndex={"-1"} top={0} w={"100%"} h={"100%"} alignItems={"center"} justifyContent={"center"}>     
        {cosmetics && <>
            <Image w={"100vw"} h={"255.7407407vh"} zIndex={"2"} objectFit={"cover"} animation={`${animation1} 175s linear infinite reverse`} pos={"absolute"} src={`${cdn}/image/${cosmetics.icon}`}/>
            <Image w={"100vw"} h={"255.7407407vh"} zIndex={"2"} objectFit={"cover"} animation={`${animation2} 175s linear infinite reverse`} pos={"absolute"} src={`${cdn}/image/${cosmetics.icon}`}/>
            {extraImage.length > 0 && <Image minW={"100%"} maxW={"none"} minH={"100%"} zIndex={"3"} pos={"absolute"} src={`${cdn}/image/${extraImage}`}/>}
            <Image minW={"100%"} maxW={"none"} minH={"100%"} zIndex={"1"} pos={"absolute"} src={`${cdn}/image/${cosmetics.background}`}/>
        </>}
        </Flex>
    );
}
