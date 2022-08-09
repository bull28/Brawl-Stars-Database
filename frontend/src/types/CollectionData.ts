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
    completedBrawlers: number,
    totalBrawlers: number,
    unlockedPins: number,
    totalPins: number,
    collectionScore: string,
    avatarColor: string,
    collection: [BrawlerCollectionData]
}