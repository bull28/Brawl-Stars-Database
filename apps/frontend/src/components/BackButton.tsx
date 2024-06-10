import {useNavigate} from "react-router-dom";
import {IconButton} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";

export default function BackButton({path}: {path?: string;}){
    const navigate = useNavigate();

    return (
        <IconButton pos={["relative", "absolute"]} top={["0", "0.5em"]} left={["0", "0.5em"]} alignSelf={"flex-start"} as={ArrowBackIcon} aria-label="Back to game menu" onClick={() => {navigate(path !== undefined ? path : "./..")}} cursor={"pointer"}/>
    );
}