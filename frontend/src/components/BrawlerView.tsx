import {Box, Flex, Text, Image} from "@chakra-ui/react"
import {useNavigate} from "react-router-dom"
import api from "../helpers/APIRoute";

interface BrawlerViewProps{
    image: string;
    name: string;
    displayName: string;
    rarityColor: string;
}

export default function BrawlerView({image, name, displayName, rarityColor}: BrawlerViewProps){ 
    let navigate = useNavigate();
    return (
        <Flex flexDir={"column"} bgColor={rarityColor} borderRadius={"lg"} boxShadow={"rgba(255, 255, 255, 0.3) 0px 7px 29px 0px;"} border={"3px solid #000"} transition={"all 0.15s ease-in"} cursor={"pointer"} _hover={{transform: "scale(1.05)"}}>         
            <Box m={[1, 2, 3, 3, 3]} onClick={() => navigate(`/brawlers/${name}`)} cursor={"pointer"}>
                <Text textAlign={"center"} fontSize={["md", "lg", "xl", "2xl", "2xl"]} className={"heading-2xl"} overflowWrap={"anywhere"}>{displayName}</Text>
                <Image src={`${api}/image/${image}`} borderRadius={"lg"}/>
            </Box>
        </Flex>
    );
}
