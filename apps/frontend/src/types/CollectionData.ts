export interface BrawlerCollectionData{
    name: string;
    displayName: string;
    rarityColor: string;
    i: string;
    u: boolean;
    unlockedPins: number;
    totalPins: number;
    pinCopies: number;
    pinFilePath: string;
    pins: {i: string, a: number, r: number}[];
}

export interface AccessoryData{
    displayName: string;
    image: string;
    unlocked: boolean;
}

export interface CollectionData{
    unlockedBrawlers: number;
    completedBrawlers: number;
    totalBrawlers: number;
    unlockedPins: number;
    totalPins: number;
    pinCopies: number;
    unlockedAccessories: number;
    totalAccessories: number;
    collectionScore: string;
    scoreProgress: number;
    avatarColor: string;
    pinRarityColors: string[];
    brawlers: BrawlerCollectionData[];
    accessories: AccessoryData[];
}
