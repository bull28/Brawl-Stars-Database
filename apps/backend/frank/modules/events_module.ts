import eventList from "../data/maps_data.json";
import {GAMEMODE_IMAGE_DIR, MAP_IMAGE_DIR, MAP_BANNER_DIR} from "../data/constants";
import {SeasonTime, GameModeDisplay, GameModePreview, GameModeData, GameModeMapDisplay, MapPreview, MapSearchPreview, MapData, EventData, CurrentEvents} from "../types";

type GameMode = typeof eventList[number]["gameModes"][number];
type EventMap = typeof eventList[number]["rotation"][number];

export function mod(x: number, y: number): number{
    return (((x % y) + y) % y);
}

export function realToTime(real: number): SeasonTime{
    return Math.floor(real / 1000);
}

class EventSlot{
    startTime: number;
    eventDuration: number;
    ladderEvent: boolean;
    gameModes: GameMode[];
    rotation: EventMap[];

    constructor(eventData: typeof eventList[number]){
        // Time when the first map in this slot's rotation is active. This is the start of the "season" for this slot.
        this.startTime = eventData.startTime;
        // Time between map changes in this slot
        this.eventDuration = Math.max(3600, eventData.eventDuration);
        // Whether this event slot is playable on ladder and should be shown. Ranked-only events should not be shown in
        // the current events but their maps should still be searchable.
        this.ladderEvent = eventData.eventDuration > 0;
        // List of game modes that rotate in this slot
        this.gameModes = eventData.gameModes;
        // Order of maps rotating in this slot. These maps can be from any game mode in the list of game modes.
        this.rotation = eventData.rotation;
    }

    /**
     * Gets the number of times the map has changed since the start of the season. Usually, maps change once per day so
     * the value returned is equal to the number of days since the start of the season.
     * @param seasonTime current time in seconds
     * @returns number
     */
    getDay(seasonTime: SeasonTime): number{
        return Math.floor((seasonTime - this.startTime) / this.eventDuration);
    }

    /**
     * Gets the time remaining until the map changes.
     * @param seasonTime current time in seconds
     * @returns time in seconds
     */
    getTimeLeft(seasonTime: SeasonTime): SeasonTime{
        return this.eventDuration - mod(seasonTime - this.startTime, this.eventDuration) - 1;
    }

    /**
     * Gets a reference to the game mode with the given index.
     * @param index game mode index
     * @returns game mode
     */
    getGameModeData(index: number): GameMode{
        return this.gameModes[mod(index, this.gameModes.length)];
    }

    /**
     * Gets the map that is currently active.
     * @param seasonTime current time in seconds
     * @returns reference to the map
     */
    getCurrentMap(seasonTime: SeasonTime): EventMap{
        const day = this.getDay(seasonTime);
        return this.rotation[mod(day, this.rotation.length)];
    }

    /**
     * Finds the index of the given map in the rotation.
     * @param mapName internal name of the map
     * @returns index of the map or -1 if not found
     */
    searchForMapIndex(mapName: string): number{
        let index = -1;
        for (let x = 0; x < this.rotation.length; x++){
            if (this.rotation[x].name === mapName){
                index = x;
            }
        }
        return index;
    }

    /**
     * Finds a map by its internal name.
     * @param mapName internal name of the map
     * @returns reference to the map
     */
    searchForMap(mapName: string): EventMap | undefined{
        const index = this.searchForMapIndex(mapName);
        if (index < 0){
            return undefined;
        }
        return this.rotation[index];
    }

    /**
     * Finds the index of the given game mode in the list of game modes.
     * @param mapName internal name of the game mode
     * @returns index of the game mode or -1 if not found
     */
    searchForModeIndex(modeName: string): number{
        let index = -1;
        for (let x = 0; x < this.gameModes.length; x++){
            if (this.gameModes[x].name === modeName){
                index = x;
            }
        }
        return index;
    }

    /**
     * Gets the time between the given time and when the given map will appear next. If the map is currently active, 0
     * is returned. If the map does not exist in this event slot, -1 is returned.
     * @param mapName internal name of the map
     * @param seasonTime current time in seconds
     * @returns time in seconds
     */
    getNextStartTime(mapName: string, seasonTime: SeasonTime): SeasonTime{
        if (this.ladderEvent === false){
            // Ranked events are always active so 0 should be returned
            return 0;
        }

        const index = this.searchForMapIndex(mapName);
        if (index === undefined){
            return -1;
        }

        const day = mod(this.getDay(seasonTime), this.rotation.length)
        const daysUntilStart = mod(index - day, this.rotation.length);

        if (daysUntilStart <= 0){
            // Map is currently active
            return 0;
        }
        return (daysUntilStart - 1) * this.eventDuration + this.getTimeLeft(seasonTime);
    }
}


// Exported only for testing
export const events: EventSlot[] = [];
for (let x = 0; x < eventList.length; x++){
    events.push(new EventSlot(eventList[x]));
}

const mapSearchMatch = new RegExp(/[^\w\s.']/g);

// Time that the current map rotation should be valid during. If the current time is outside this range, the user should
// be warned that the map rotation was likely changed and the data returned to them may be inaccurate.
const seasonStart = 1761552000;
const seasonEnd = 1764662400;


function applyGameModeDisplay(display: GameModeDisplay): GameModeDisplay{
    return {
        image: GAMEMODE_IMAGE_DIR + display.image,
        backgroundColor: display.backgroundColor,
        textColor: display.textColor
    }
}

function applyGameModeMapDisplay(gameModeName: string, display: GameModeDisplay): GameModeMapDisplay{
    return {
        name: gameModeName,
        image: GAMEMODE_IMAGE_DIR + display.image,
        backgroundColor: display.backgroundColor,
        textColor: display.textColor
    }
}

/**
 * Get a map's data along with the next time it appears. Returns the first instance of the map in the event list so if a
 * map appears in multiple event slots then only the first will be considered.
 * @param mapName internal name of the map
 * @param realTime time to get data at
 * @returns copy of the map data with file paths added
 */
export function getMapData(mapName: string, realTime: SeasonTime): MapData | undefined{
    const seasonTime = realToTime(realTime);

    let result: MapData | undefined;
    for (let x = 0; x < events.length; x++){
        const mapInSlot = events[x].searchForMap(mapName);

        if (mapInSlot !== undefined){
            const gameMode = events[x].getGameModeData(mapInSlot.gameMode);
            result = {
                name: mapInSlot.name,
                displayName: mapInSlot.displayName,
                gameMode: applyGameModeMapDisplay(gameMode.name, gameMode.data),
                rankedMap: mapInSlot.rankedMap,
                image: `${MAP_IMAGE_DIR}${gameMode.name.replace("ranked", "")}/${mapInSlot.image}`,
                bannerImage: MAP_BANNER_DIR + mapInSlot.bannerImage,
                nextStart: events[x].getNextStartTime(mapName, seasonTime)
            };
        }
    }
    return result;
}

/**
 * Get a game mode's data along with an array of its maps. If the mode appears in multiple event slots then only the
 * first will be considered.
 * @param modeName internal name of the game mode
 * @returns copy of the game mode data with file paths added
 */
export function getModeData(modeName: string): GameModeData | undefined{
    let result: GameModeData | undefined;
    let eventIndex = 0;
    let found = false;

    while (eventIndex < events.length && found === false){
        const slot = events[eventIndex];
        const modeIndex = slot.searchForModeIndex(modeName);
        const gameModeData = slot.getGameModeData(modeIndex);
        if (modeIndex >= 0){
            found = true;

            const mapList: MapPreview[] = [];
            for (let i = 0; i < slot.rotation.length; i++){
                if (slot.rotation[i].gameMode === modeIndex){
                    mapList.push({
                        name: slot.rotation[i].name,
                        displayName: slot.rotation[i].displayName
                    });
                }
            }

            result = {
                name: gameModeData.name,
                displayName: gameModeData.displayName,
                data: applyGameModeDisplay(gameModeData.data),
                maps: mapList
            };
        }
        eventIndex++;
    }
    return result;
}

/**
 * Returns a list of maps with display names matching the search query.
 * @param search search query
 * @returns list of maps with both their internal and display names
 */
export function searchForMapName(search: string): MapSearchPreview[]{
    const exactMatch: MapSearchPreview[] = [];
    const startsWith: MapSearchPreview[] = [];
    const onlyContains: MapSearchPreview[] = [];

    const query = search.toLowerCase().replace(mapSearchMatch, "");

    for (const event of events){
        for (const map of event.rotation){
            const thisMapName = map.displayName.toLowerCase();
            const queryIndex = thisMapName.search(query);

            if (thisMapName.includes(query) === true){
                const mode = event.getGameModeData(map.gameMode);
                const resultObject: MapSearchPreview = {
                    name: map.name,
                    displayName: map.displayName,
                    gameMode: applyGameModeMapDisplay(mode.name, mode.data)
                };

                if (thisMapName === query){
                    exactMatch.push(resultObject);
                } else if (queryIndex === 0){
                    startsWith.push(resultObject);
                } else if (queryIndex > 0){
                    onlyContains.push(resultObject);
                }
            }

        }
    }

    // Search results which are closest to the query first will appear earlier in the result array
    return exactMatch.concat(startsWith, onlyContains);
}

export function getAllModes(): GameModePreview[]{
    const allGameModes: GameModePreview[] = [];
    const alreadyChecked = new Set<string>();

    for (let x = 0; x < events.length; x++){
        for (let y = 0; y < events[x].gameModes.length; y++){
            const gameMode = events[x].gameModes[y];
            if (Object.hasOwn(gameMode, "name") === true && 
            Object.hasOwn(gameMode, "displayName") === true &&
            alreadyChecked.has(gameMode.name) === false){
                alreadyChecked.add(gameMode.name);
                allGameModes.push({
                    name: gameMode.name,
                    displayName: gameMode.displayName
                });
            }
        }
    }

    return allGameModes;
}

function getEventData(event: EventSlot, seasonTime: SeasonTime): EventData{
    const currentMap = event.getCurrentMap(seasonTime);
    const currentMode = event.getGameModeData(currentMap.gameMode);

    return {
        gameMode: {
            name: currentMode.name,
            displayName: currentMode.displayName,
            data: applyGameModeDisplay(currentMode.data)
        },
        map: {
            name: currentMap.name,
            displayName: currentMap.displayName,
            bannerImage: MAP_BANNER_DIR + currentMap.bannerImage
        }
    };
}

export function getCurrentEvents(realTime: number): CurrentEvents{
    const seasonTime = realToTime(realTime);
    const allEvents: CurrentEvents["events"] = [];

    for (let x = 0; x < events.length; x++){
        if (events[x].ladderEvent === true){
            allEvents.push({
                current: getEventData(events[x], seasonTime),
                upcoming: getEventData(events[x], seasonTime + events[x].eventDuration),
                timeLeft: events[x].getTimeLeft(seasonTime)
            });
        }
    }

    return {
        time: seasonTime,
        valid: seasonTime >= seasonStart && seasonTime < seasonEnd,
        events: allEvents
    };
}
