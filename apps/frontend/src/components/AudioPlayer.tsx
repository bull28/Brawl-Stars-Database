import { useState, useEffect, useCallback } from "react";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import {HiMusicNote, HiHome} from "react-icons/hi";
import AuthRequest from "../helpers/AuthRequest";
import {CosmeticData} from "../types/CosmeticData";
import cdn from "../helpers/CDNRoute";

export default function AudioPlayer() {
    const [audio] = useState(new Audio());

    const toggle = () => {
        if (audio.paused){
            audio.play();
        } else{
            audio.pause();
        }
    }

    const restartAudio = () => {
        audio.currentTime = 0;
        audio.play();
    };

    const setAudioSrc = useCallback((cosmetics: CosmeticData) => {
        if (typeof cosmetics.music === "string"){
            let playing = !audio.paused;

            const newSrc = `${cdn}/image/${cosmetics.music}`;

            if (newSrc !== audio.src){
                // Only update the audio source if it changed
                audio.src = `${cdn}/image/${cosmetics.music}`;
                audio.loop = true;
                if (playing){
                    // If the old audio was already playing, play the new audio right after it loads
                    audio.play();
                }
            }
        }
    }, [audio]);

    const loadAudio = useCallback(() => {
        AuthRequest<CosmeticData>("/cosmetic", {setState: setAudioSrc}, false);
    }, [setAudioSrc]);
    
    useEffect(() => {
        loadAudio();
    }, [loadAudio]);

    useEffect(() => {
        document.addEventListener("reloadaudio", loadAudio);
        return () => {
            document.removeEventListener("reloadaudio", loadAudio);
        };
    }, [loadAudio]);
    
    return (
        <Flex pos={["relative", "relative", "fixed"]} right={0} bottom={0} float={["right", "right", "none"]}>
            <Link href={"/"}>
                <IconButton icon={<HiHome size={"100%"}/>} bgColor={"blue.500"} p={1} aria-label={"\u{1f44e}"}/>
            </Link>
            <IconButton onClick={toggle} onContextMenu={(event) => {event.preventDefault(); restartAudio();}} icon={<HiMusicNote size={"100%"}/>} bgColor={"blue.500"} p={1} aria-label={"\u{1f44e}"}/>
        </Flex>
    );
};
