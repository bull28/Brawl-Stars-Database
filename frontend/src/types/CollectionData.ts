export interface BrawlerCollectionData {
    name: string,
    displayName: string,
    rarityColor: string,
    i: string,
    u: boolean,
    unlockedPins: number,
    totalPins: number,
    pinCopies: number,
    pinFilePath: string,
    pins: [{i: string, a: number}]
}

export interface CollectionData {
    unlockedBrawlers: number,
    completedBrawlers: number,
    totalBrawlers: number,
    unlockedPins: number,
    totalPins: number,
    pinCopies: number,
    scoreProgress: number,
    collectionScore: string,
    avatarColor: string,
    collection: [BrawlerCollectionData]
}