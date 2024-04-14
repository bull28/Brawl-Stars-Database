export interface FilterData{
    sortMethod: string;
    page: number;
    filterInRequest: boolean;
    brawler: string;
    pin: string;
    pinImage: string;
    username: string;
}

export interface PinObject{
    pinImage: string;
    amount: number;
    rarityValue: number;
    rarityColor: string;
}

export interface TradeData{
    tradeid: number;
    creator: {
        username: string;
        avatar: string;
        avatarColor: string;
    };
    cost: number;
    offer: PinObject[];
    request: PinObject[];
    timeLeft: number;
}

export interface UserTradeData{
    tradeid: number;
    cost: number;
    offer: PinObject[];
    request: PinObject[];
    timeLeft: number;
    accepted: boolean;
}
