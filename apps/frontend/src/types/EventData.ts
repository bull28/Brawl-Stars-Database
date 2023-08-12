export interface SeasonTime{
    season: number;
    hour: number;
    minute: number;
    second: number;
    hoursPerSeason: number;
    maxSeasons: number;
}
  
interface Event{
    gameMode: {
        name: string;
        displayName: string;
        data: {
            image: string;
            backgroundColor: string;
            textColor: string;
        };
    };
    map: {
        name: string;
        displayName: string;
        bannerImage: string;
    };
}

export interface EventSlot{
    current: Event;
    upcoming: Event;
    timeLeft: SeasonTime;
}

export interface EventData{
    time: SeasonTime;
    events: EventSlot[];
}

export interface MapData{
    name: string;
    displayName: string;
    gameMode: {
        name: string;
        image: string;
        backgroundColor: string;
        textColor: string;
    };
    powerLeagueMap: boolean;
    image: string;
    bannerImage: string;
    times: {
        all: SeasonTime[];
        next: SeasonTime;
        duration: SeasonTime;
    };
}

export type MapSearchData = Pick<MapData, "name" | "displayName" | "gameMode">;
