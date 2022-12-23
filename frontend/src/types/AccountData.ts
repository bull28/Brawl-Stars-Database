export interface UserInfoProps {
    username: string,
    tokens: number,
    coins: number,
    tokenDoubler: number,
    tradeCredits: number,
    avatar: string,
    avatarColor: string,
    wildCardPins: [{
        rarityName: string,
        rarityColor: string,
        amount: number
    }]
}