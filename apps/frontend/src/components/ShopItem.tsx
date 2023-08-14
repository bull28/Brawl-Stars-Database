import { Box, Button, Flex, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ScaleFade, Text, useDisclosure } from '@chakra-ui/react'
import AuthRequest from '../helpers/AuthRequest'
import ShopData from '../types/ShopData'
import { useState } from 'react'
import { GrPowerReset } from 'react-icons/gr'
import { BrawlBoxContentsData } from '../types/BrawlBoxData'
import CountUp from 'react-countup'
import { useNavigate } from 'react-router-dom'
import api from "../helpers/APIRoute";

interface PurchaseData{
    inventory: number;
    result: BrawlBoxContentsData[];
}

function itemFontSize(length: number): {size: string[]; class: string;}{
    if (length >= 20){
        return {size: ["xs", "sm", "md", "md", "md", "lg"], class: "heading-lg"};
    } else if (length >= 15){
        return {size: ["sm", "md", "lg", "lg", "lg", "lg"], class: "heading-lg"};
    }
    return {size: ["md", "lg", "xl", "xl", "xl", "xl"], class: "heading-xl"};
}

export default function ShopItem({data, coins, isFeatured, timeLeftString}: {data: ShopData, coins: number, isFeatured?: boolean, timeLeftString: string}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [accepted, setAccepted] = useState<boolean>()  
    const [purchaseData, setPurchaseData] = useState<PurchaseData>()

    const navigate = useNavigate()

    const purchase = (itemName: string) => {
        AuthRequest<PurchaseData>("/shop", {data: {item: itemName}, setState: setPurchaseData, callback: () => {setAccepted(true)}, errorToastMessage: "Invalid Purchase"});
    }

    if (isFeatured){
        return (
            <Flex alignItems={'center'} flexDir={'column'} borderRadius={'lg'} onClick={onOpen} w={['90vw', '80vw', '50vw', '35vw', '35vw']} minW={['0%', '0%', '400px', '600px', '600px']} maxW={['400px', '400px', '600px', '600px', '100vw']} p={5} cursor={'pointer'} pos={'relative'} background={'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)'} bgColor={'#8EC5FC'} border={'3px solid'} borderColor={'blue.400'} _hover={{transform: 'scale(1.05)'}} transition={'transform 0.1s linear'}>                                        
                <Flex p={5}>
                    <Image loading={'eager'} w={'200px'} h={'200px'} borderRadius={'lg'} src={`${api}/image/${data.image}`}/>
                </Flex>
                <Flex>                    
                    <Text fontSize={'2xl'}  className={'heading-2xl'}>{data.displayName}</Text>
                </Flex>
                <Flex alignItems={'center'} mt={3}>
                    <Text fontSize={'xl'}  className={'heading-xl'}>{data.cost}</Text>
                    <Image ml={1} maxH={'30px'} src={`${api}/image/resources/resource_coins.webp`}/>
                </Flex>
                <Flex w={'100%'} justifyContent={'right'} mt={5}>
                    <Flex px={5} py={3} borderRadius={'30px'} bgColor={'lightskyblue'} alignItems={'center'} border={'2px solid'} borderColor={'blue.500'}>
                        <GrPowerReset fontSize={'20px'}/>
                        <Text ml={2} className={'heading-md'}>{`Offer ends in ${timeLeftString}`}</Text>
                    </Flex>
                </Flex>
    
                <Modal isOpen={isOpen} onClose={onClose} size={'3xl'} preserveScrollBarGap={true}>
                    <ModalOverlay />
                        <ModalContent bgColor={(accepted) ? '#9f9' : 'lightskyblue'} border={'2px solid '}>
                        <ModalHeader fontSize={'2xl'}  className={'heading-2xl'} fontWeight={'normal'}>{accepted ? 'Purchase Successful!' : `Purchase ${data.displayName}`}</ModalHeader>
                        <ModalBody>
                            <Flex justifyContent={'center'}>
                                <Flex boxShadow={(accepted) ? '0px 0px 50px #fff' : ''} borderRadius={'50%'}>
                                    <Image src={`${api}/image/${data.image}`}/>
                                </Flex>                                    
                            </Flex>
                        </ModalBody>
    
                        <ModalFooter>
                            <Button className={'heading-md'} mr={3} onClick={(accepted) ? () => {window.location.reload()} : onClose}>Close</Button>
                            {accepted ? 
                                <Button className={'heading-md'} mr={3} onClick={() => {navigate('/collection')}}>
                                    View Collection
                                </Button>
                                :
                                <Button className={'heading-md buttonGreen'} color={(coins < data.cost) ? 'red.500' : 'white'} onClick={() => {purchase(data.name)}}>{data.cost}<Image ml={1} maxH={'25px'} src={`${api}/image/resources/resource_coins.webp`}/></Button>
                            }
                        </ModalFooter>
                        </ModalContent>
                </Modal>
            </Flex>
        )
    } else{
        return (
            <Flex alignItems={'center'} flexDir={'column'} borderRadius={'lg'} onClick={onOpen} p={5} cursor={'pointer'} pos={'relative'} bgColor={'lightskyblue'} border={'3px solid'} borderColor={'blue.500'} _hover={{
            ".top": {transitionDelay: "0s", transform: "scaleX(1)"},
            ".right": {transitionDelay: "0.05s", transform: "scaleY(1)"},
            ".bottom": {transitionDelay: "0.1s", transform: "scaleX(1)"},
            ".left": {transitionDelay: "0.15s", transform: "scaleY(1)"}
            }}>            
                <Box className='top' pos={'absolute'} display={'block'} background={'blue.500'} transition={`all 0.1s linear`} w={'100%'} height={'3px'} transform={'scaleX(0)'} top={0} left={0} transitionDelay={'0.15s'} transformOrigin={'top left'}></Box>
                <Box className='bottom' pos={'absolute'} display={'block'} background={'blue.500'} transition={`all 0.1s linear`} w={'100%'} height={'3px'} transform={'scaleX(0)'} bottom={0} right={0} transitionDelay={'0.05s'} transformOrigin={'top right'}></Box>
                <Box className='left' pos={'absolute'} display={'block'} background={'blue.500'} transition={`all 0.1s linear`} w={'3px'} height={'100%'} transform={'scaleY(0)'} top={0} left={0} transformOrigin={'bottom left'}></Box>
                <Box className='right' pos={'absolute'} display={'block'} background={'blue.500'} transition={`all 0.1s linear`} w={'3px'} height={'100%'} transform={'scaleY(0)'} top={0} right={0} transitionDelay={'0.1s'} transformOrigin={'top left'}></Box>
    
                <Flex p={[2, 3, 3, 3, 4, 5]}>
                    <Image filter={'drop-shadow(0 0 2rem rgb(255, 255, 255));'} borderRadius={'lg'} src={`${api}/image/${data.image}`}/>
                </Flex>
                <Flex>                    
                    <Text fontSize={itemFontSize(data.displayName.length).size} lineHeight={[6, 7, 8, 8, 8]} className={itemFontSize(data.displayName.length).class}>{data.displayName}</Text>
                </Flex>
                <Flex alignItems={'center'} mt={3}>
                    <Text fontSize={['sm', 'md', 'lg', 'lg', 'lg', 'xl']}  className={'heading-lg'}>{data.cost}</Text>
                    <Image ml={1} maxH={'30px'} src={`${api}/image/resources/resource_coins.webp`}/>
                </Flex>
    
                <Modal isOpen={isOpen} onClose={onClose} size={'3xl'} preserveScrollBarGap={true}>
                    <ModalOverlay />
                        <ModalContent bgColor={(accepted) ? '#9f9' : 'lightskyblue'} border={'2px solid '}>
                        <ModalHeader fontSize={'2xl'}  className={'heading-2xl'} fontWeight={'normal'}>{accepted ? 'Purchase Successful!' : `Purchase ${data.displayName}`}</ModalHeader>
                        <ModalBody>
                            <Flex flexDir={'column'} alignItems={'center'}>
                                {(( purchaseData?.result.length || 0 ) < 1) ?
                                <>
                                    <Flex boxShadow={(accepted) ? '0px 0px 50px #fff' : ''} borderRadius={'50%'} >
                                        <Image src={`${api}/image/${data.image}`}/>
                                    </Flex>
                                    <Text w={['90%', '80%', '75%', '75%', '75%']} textAlign={'center'} mt={'5%'} fontSize={['md', 'lg', 'xl', 'xl', 'xl']} className={'heading-xl'}>{data.description}</Text>
                                    <Flex fontSize={'xl'} className={'heading-xl'} mt={5}>
                                        {accepted && purchaseData && purchaseData.inventory !== 1 && <CountUp prefix={'Inventory: '} end={purchaseData.inventory} duration={0.5}/>}
                                    </Flex>
                                </>
                                :
                                <ScaleFade in={true} delay={1}>
                                    {purchaseData !== void 0 ?
                                        <Flex bgColor={purchaseData.result[0].backgroundColor} flexDir={'column'} alignItems={'center'} justifyContent={'center'} borderRadius={'lg'} textAlign={'center'} py={5} border={'3px solid black'} boxShadow={'0px 0px 50px #fff'}>
                                            <Text mb={5} fontSize={'3xl'} className={'heading-3xl'}>{purchaseData.result[0].displayName}</Text>
                                            <Flex mb={5}>
                                                <Image border={'2px solid black'} borderRadius={'lg'} src={`${api}/image/${purchaseData.result[0].image}`}/>
                                            </Flex>    
                                            <Text mb={5} fontSize={'xl'} className={'heading-2xl'}>{purchaseData.result[0].description}</Text>                                  
                                        </Flex>
                                        :
                                        <></>
                                    }
                                </ScaleFade>
                                }
                            </Flex>
                        </ModalBody>
    
                        <ModalFooter>
                            <Button className={'heading-md'} mr={3} onClick={(accepted) ? () => {window.location.reload()} : onClose}>Close</Button>
                            {accepted ? 
                                <></>
                                :
                                <Button className={'heading-md'} color={(coins < data.cost) ? 'red.500' : 'white'} onClick={() => {purchase(data.name)}}>{data.cost}<Image ml={1} maxH={'25px'} src={`${api}/image/resources/resource_coins.webp`}/></Button>
                            }

                            {(( purchaseData?.result.length || 0 ) < 1) ?
                                <></>
                                :                            
                                <Button className={'heading-md'} mr={3} onClick={() => {navigate('/collection')}}>View Collection</Button>
                            }
                        </ModalFooter>
                        </ModalContent>
                </Modal>
            </Flex>
        )
    }
}
