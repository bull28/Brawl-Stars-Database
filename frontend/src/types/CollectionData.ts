export interface BrawlerCollectionData {
    name: string,
    displayName: string,
    rarityColor: string,
    i: string,
    u: boolean,
    unlockedPins: number,
    totalPins: number,
    pinFilePath: string,
    pins: [{i: string, u: boolean}]
}

export interface CollectionData {
    unlockedBrawlers: number,
    totalBrawlers: number,
    unlockedPins: number,
    totalPins: number,
    collection: [BrawlerCollectionData]
}