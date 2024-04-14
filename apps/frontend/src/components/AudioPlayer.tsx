import { useState, useEffect, useCallback } from "react";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import {HiMusicNote, HiOutlineRefresh, HiHome} from "react-icons/hi";
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData} from "../types/CosmeticData";
import cdn from "../helpers/CDNRoute";

export default function AudioPlayer() {
    const [audio] = useState(new Audio());
    const [playing, setPlaying] = useState<boolean>(false);
    const toggle = () => setPlaying(!playing);

    const setAudioSrc = useCallback((cosmetics: CosmeticData) => {
        if (typeof cosmetics.music === "string"){
            setPlaying(false);
            audio.pause();
            audio.src = `${cdn}/image/${cosmetics.music}`;
            audio.loop = true;
        }
    }, [audio]);
    
    useEffect(() => {
        AuthRequest<CosmeticData>("/cosmetic", {setState: setAudioSrc}, false);
    }, [setAudioSrc]);

    useEffect(() => {
        if (audio.src !== ""){
            playing ? audio.play() : audio.pause();
        }
    }, [playing, audio]);
    
    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));

        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };

    }, [audio]);
    
    return (
        <Flex pos={["relative", "relative", "fixed"]} right={0} bottom={0} float={["right", "right", "none"]}>
            <Link href={"/"}>
                <IconButton icon={<HiHome size={"100%"}/>} bgColor={'blue.500'} p={1} aria-label="play/pause music"/>
            </Link>
            <IconButton onClick={toggle} icon={<HiMusicNote size={"100%"}/>} bgColor={'blue.500'} p={1} aria-label="play/pause music"/>
            <IconButton onClick={() => {AuthRequest<CosmeticData>("/cosmetic", {setState: setAudioSrc}, false);}} icon={<HiOutlineRefresh size={"100%"}/>} bgColor={'blue.500'} p={1} aria-label="play/pause music"/>
        </Flex>
    );
};