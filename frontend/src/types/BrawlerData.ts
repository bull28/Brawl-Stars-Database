export interface BrawlerData{
    name: string;
    displayName: string;
    rarity: {value: number, name: string, color: string};
    description: string;
    image: string;
    defaultSkin: string;
    title: string;
    masteryIcon: string;
    skins: {
        name: string;
        displayName: string;
    }[];
    pins: {
        image: string;
        rarity: {
            value: number;
            name: string;
            color: string;
        };
    }[];
}

export interface Brawler{
    name: string;
    displayName: string;
    rarity: {
        value: number;
        name: string;
        color: string;
    };
    image: string;
}

export interface ModelFiles{
    geometry: string | undefined;
    winAnimation: string | undefined;
    loseAnimation: string | undefined;
}
