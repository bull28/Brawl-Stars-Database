export interface Reward{
    reportid: number;
    endTime: number;
    cost: number;
    title: string;
    stats: {
        score: number;
        enemies: number;
        win: boolean;
        difficulty: string;
        brawler: {
            displayName: string;
            image: string;
        };
        starPower: {
            displayName: string;
            image: string;
        };
        gears: {
            displayName: string;
            image: string;
        }[];
        accessories: {
            displayName: string;
            image: string;
        }[];
    };
}

export interface Accessory{
    name: string;
    category: string;
    displayName: string;
    image: string;
    unlocked: boolean;
    badge: {
        collected: number;
        required: number;
        image: string;
        unlockMethod: string;
    };
}
