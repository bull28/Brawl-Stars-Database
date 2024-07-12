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
    description: string;
    unlocked: boolean;
    badge: {
        collected: number;
        required: number;
        image: string;
        unlockMethod: string;
    };
}

export interface ChallengePreview{
    challengeid: number;
    username: string;
    preset: string;
    strength: number;
}

export interface ChallengeStartData{
    key: string;
    displayName: string;
    enemies: string[];
}

export interface GameUpgrades{
    offense: {
        startingPower: number;
        startingGears: number;
        powerPerStage: number;
        gearsPerStage: number;
        maxExtraPower: number;
        maxExtraGears: number;
        maxAccessories: number;
        health: number;
        damage: number;
        healing: number;
        speed: number;
        ability: number;
        lifeSteal: number;
    };
    defense: {
        difficulty: number;
        maxEnemies: number[];
        enemyStats: number[];
        waves: number[][];
    };
    enemies: {
        name: string;
        displayName: string;
        image: string;
        value: number;
        maxCount: number;
    }[];
}

export interface Enemy{
    name: string;
    displayName: string;
    image: string;
    fullImage: string;
    description: string;
    strengthTier: string;
    value: number;
    health: number;
    speed: number;
    attacks: {
        displayName: string;
        minDamage: number;
        maxDamage: number;
        damageType: number;
        range: number;
        reload: number;
        knockback: number;
        fireDamage: number;
        description: string;
    }[];
    enemies: ({
        count: number;
    } & Omit<Enemy, "name" | "image" | "fullImage" | "enemies">)[];
}