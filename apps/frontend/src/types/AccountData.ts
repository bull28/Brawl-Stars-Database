export interface MasteryData{
    level: number;
    points: number;
    current: {
        points: number;
        image: string;
        color: string;
    };
    next: {
        points: number;
        image: string;
        color: string;
    };
}


export interface UserInfoProps{
    username: string;
    tokens: number;
    coins: number;
    tokenDoubler: number;
    tradeCredits: number;
    avatar: string;
    avatarColor: string;
    wildCardPins: {
        rarityName: string;
        rarityColor: string;
        amount: number;
    }[];
    mastery: MasteryData;
}
