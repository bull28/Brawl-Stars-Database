import { Box, Flex, Text, Image, Spinner } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import api from "../helpers/APIRoute";

interface BrawlerCompProps{
    image: string;
    name: string;
    displayName: string;
    rarityColor: string;
}

export default function Brawler({ image, name, displayName, rarityColor }: BrawlerCompProps) { 
    let navigate = useNavigate();

    const redirect = () => {
        navigate(`/brawlers/${name}`)  
    }

    return (
    <>
        <Flex maxW={'sm'} maxH={'sm'} flexDir={'column'} bgColor={rarityColor} borderRadius={'lg'} boxShadow={'rgba(255, 255, 255, 0.3) 0px 7px 29px 0px;'} margin={5} border={'3px solid black'} transition={'all 0.15s ease-in'} cursor={'pointer'} _hover={{transform: 'scale(1.05)'}}>         
        <Box m={3} onClick={redirect} cursor={'pointer'}>
            <Text fontSize={'2xl'} className={'heading-3xl'} >{displayName}</Text>
            <Image src={`${api}/image/${image}`} borderRadius={'lg'} fallback={<Spinner/>}/>
        </Box>
        
        </Flex>
    </>
    )
}
