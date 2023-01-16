import { useState, useEffect } from "react";
import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { HiMusicNote } from 'react-icons/hi'

export default function AudioPlayer() {

    const [audio] = useState(new Audio(require('../assets/test.ogg')));

    const [playing, setPlaying] = useState<boolean>(false)
    
    const toggle = () => setPlaying(!playing)
    

    useEffect(() => {
        playing ? audio.play() : audio.pause();

        }, [playing]);

    useEffect(() => {
        document.addEventListener('click', () => {
            audio.loop = true
            audio.play()
            toggle()
        }, {once: true})

        }, []);
    
    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));

        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };

        }, []);
    
        
    return (
        <Flex pos={'absolute'} right={0} bottom={0}>
            <Tooltip label="Play or Pause Music">
                <IconButton onClick={toggle} bgColor={'blue.500'} p={1} as={HiMusicNote} aria-label="play/pause music"/>                
            </Tooltip>
        </Flex>
    );
};