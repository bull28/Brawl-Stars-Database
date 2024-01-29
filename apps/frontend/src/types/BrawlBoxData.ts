export interface BrawlBoxData{
    name: string;
    cost: number;
    image: string;
    displayName: string;
    description: string;
    dropsDescription: string[];
}

export interface BrawlBoxContentsData{
    displayName: string;
    rewardType: string;
    amount: number;
    inventory: number;
    image: string;
    backgroundColor: string;
    description: string;
}

export interface BrawlBoxBadgesData{
    displayName: string;
    unlock: string;
    amount: number;
}
