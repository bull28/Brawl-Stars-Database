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
    pins: [{i: string, a: number, r: number}]
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
    pinRarityColors: {
        0: string,
        1: string,
        2: string,
        3: string
    }
    collection: [BrawlerCollectionData]
}