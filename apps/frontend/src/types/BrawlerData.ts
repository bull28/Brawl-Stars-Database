interface Rarity{
    value: number;
    name: string;
    color: string;
}

interface Cost{
    amount: number;
    currency: string;
    icon: string;
}

export interface BrawlerData{
    name: string;
    displayName: string;
    rarity: Rarity;
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
        rarity: Rarity;
    }[];
}

export interface Brawler{
    name: string;
    displayName: string;
    rarity: Rarity;
    image: string;
}

export interface ModelFiles{
    geometry: string | undefined;
    winAnimation: string | undefined;
    loseAnimation: string | undefined;
}

export interface SkinData{
    name: string;
    displayName: string;
    cost: Cost;
    costBling: Cost;
    rarity: {
        value: number;
        name: string;
        icon: string;
    };
    requires: string;
    features: string[];
    limited: boolean;
    groups: {
        name: string;
        image: string;
        icon: string;
    }[];
    unlock: string;
    release: {
        month: number;
        year: number;
    };
    rating: number;
    image: string;
    model: {
        geometry: {exists: boolean, path: string};
        winAnimation: {exists: boolean, path: string};
        loseAnimation: {exists: boolean, path: string};
    };
}

export type SkinSearchFilters = Partial<{
    query: string;
    rarity: number;
    minCost: number;
    maxCost: number;
    groups: string[];
    bling: boolean;
    limited: boolean;
    startDate: {
        month: number;
        year: number;
    };
    endDate: {
        month: number;
        year: number;
    };
}>;

export interface SkinSearchResult{
    imagePath: string;
    backgroundPath: string;
    results: {
        name: string;
        brawler: string;
        displayName: string;
        image: string;
        background: string;
    }[];
}
