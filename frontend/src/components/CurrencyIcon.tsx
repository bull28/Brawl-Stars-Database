import { Image } from '@chakra-ui/react'

type CurrencyIconProps = {
    type: string
}

export default function CurrencyIcon({ type }: CurrencyIconProps) {
    if (type === 'Gems'){
        return (
            <Image src={require('../assets/currency/gem.png')} w={6} h={6}/>
        )
    } else if (type === 'Coins'){
        return (
            <Image src={require('../assets/currency/coins.webp')} w={6} h={6}/>
        )
    } else if (type === 'StarPoints'){
        return (
            <Image src={require('../assets/currency/starpoints.webp')} w={6} h={6}/>
        )
    } else if( type === 'ClubCoins'){
        return (
            <Image src={require('../assets/currency/clubcoins.webp')} w={6} h={6}/>
        )
    } else {
        return (
            <></>
        )
    }

}
