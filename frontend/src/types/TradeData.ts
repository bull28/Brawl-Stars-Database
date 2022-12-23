export interface FilterData {
    sortMethod: string,
    page: number,
    filterInRequest: boolean,
    brawler: string,
    pin: string,
    pinImage: string,
    username: string
}

export interface PinObject {
    brawler: string,
    pin: string,
    pinImage: string,
    amount: number,
    rarityValue: number,
    rarityColor: string
}

export interface TradeData {
    tradeid: number,
    creator: string,
    cost: number,
    offer: PinObject[],
    request: PinObject[]
}