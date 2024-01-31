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
    mastery: {
        level: number;
        points: number;
        currentLevel: number;
        nextLevel: number;
        image: string;
        color: string;
    }
}

export interface MasteryData{
    level: number;
    points: number;
    currentLevel: number;
    nextLevel: number;
    image: string;
    color: string;
}
