import { Image } from '@chakra-ui/react'

export default function CurrencyIcon({type}: {type: string;}){
    if (type === 'Gems'){
        return (
            <Image src={require('../assets/currency/gem.webp')} h={6}/>
        )
    } else if (type === 'Coins'){
        return (
            <Image src={require('../assets/currency/coins.webp')} h={6}/>
        )
    } else if (type === 'StarPoints'){
        return (
            <Image src={require('../assets/currency/starpoints.webp')} h={6}/>
        )
    } else if( type === 'ClubCoins'){
        return (
            <Image src={require('../assets/currency/clubcoins.webp')} h={6}/>
        )
    } else if (type === 'Bling'){
        return (
            <Image src={require('../assets/currency/bling.webp')} h={6}/>
        )
    } else {
        return (
            <></>
        )
    }
}
