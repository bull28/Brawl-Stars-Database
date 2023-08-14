export interface UnitImage{
    name: string;
    image: string;
    key: number;
}

export interface ChallengeName{
    challengeid: number;
    displayName: string;
    acceptCost: number;
}

export interface RoomName{
    username: string;
    acceptCost: number;
}

export interface ChallengeWins{
    nextDailyBonus: {
        season: number;
        hour: number;
        minute: number;
        second: number;
        hoursPerSeason: number;
        maxSeasons: number;
    };
    totalWins: number;
}

export interface UnitData{
    unitsPerChallenge: number;
    unitsAvailable: ({
        name: string;
        display: {
            displayName: string;
            image: string;
            description: string;
        };
        stats: {
            health: number;
            shield: number;
            damage: number;
            range: number;
            targets: number;
            speed: number;
            specialMoves: boolean;
            specialAttacks: boolean;
        };
    })[];
}

export type ChallengeData = ({
    challengeid: number;
    displayName: string;
    requiredLevel: number;
    acceptCost: number;
    completed: boolean;
    reward: {
        coins: number;
        points: number;
        accessory: {
            displayName: string;
            image: string;
        };
    }
    players: number;
})[];

interface Room{
    username: string;
    displayName: string;
    requiredLevel: number;
    acceptCost: number;
    players: ({
        username: string;
        avatar: string;
    })[];
}

interface RoomDisplay extends Room{
    players: (Room["players"][number] & {key: number;})[]
}

export type RoomData = Room[];

export type RoomDataDisplay = RoomDisplay[];
