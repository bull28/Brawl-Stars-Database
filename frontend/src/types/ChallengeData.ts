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
    players: ({
        username: string;
        avatar: string;
    })[];
})[];
