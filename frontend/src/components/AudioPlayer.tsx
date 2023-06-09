import { useState, useEffect, useCallback } from "react";
import { Flex, IconButton } from "@chakra-ui/react";
import {HiMusicNote} from "react-icons/hi";
import AuthRequest from "../helpers/AuthRequest";
import CosmeticData from "../types/CosmeticData";

export default function AudioPlayer() {
    const [audio] = useState(new Audio());
    const [playing, setPlaying] = useState<boolean>(false);
    const toggle = () => setPlaying(!playing);

    const setAudioSrc = useCallback((cosmetics: CosmeticData) => {
        if (typeof cosmetics.music === "string"){
            setPlaying(false);
            audio.pause();
            audio.src = `/image/${cosmetics.music}`;
        }
    }, [audio]);
    
    useEffect(() => {
        AuthRequest<CosmeticData>("/cosmetic", {setState: setAudioSrc});
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
        <Flex pos={"fixed"} right={0} bottom={0}>
            <IconButton onClick={toggle} icon={<HiMusicNote size={"100%"}/>} bgColor={'blue.500'} p={1} aria-label="play/pause music"/>
        </Flex>
    );
};