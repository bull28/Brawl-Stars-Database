import { Box, Flex, Text, Image, Spinner } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

type BrawlerCompProps =  {
    image: string,
    name: string,
    displayName: string,
    rarityColor: string
}

export default function Brawler({ image, name, displayName, rarityColor }: BrawlerCompProps) { 
    let navigate = useNavigate();

    const redirect = () => {
        navigate(`/brawlers/${name}`)  
    }

  return (
    <>
        <Flex maxW={'sm'} maxH={'sm'} flexDir={'column'} bgColor={rarityColor} borderRadius={'lg'} boxShadow={'lg'} margin={5} border='1px' borderColor='gray.400' transition={'all 0.15s ease-in'} cursor={'pointer'} _hover={{transform: 'scale(1.05)'}}>
         
        <Box m={3} onClick={redirect} cursor={'pointer'}>
            <Text fontSize={'2xl'} className={'heading-2xl'} color={'white'}>{displayName}</Text>
            <Image src={'/image/portraits/'+image} borderRadius={'lg'} fallback={<Spinner/>}/>
        </Box>
        
        </Flex>
    </>
  )
}