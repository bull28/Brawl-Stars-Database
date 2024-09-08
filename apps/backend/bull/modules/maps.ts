import eventList from "../data/maps_data.json";
import {GAMEMODE_IMAGE_DIR, MAP_IMAGE_DIR, MAP_BANNER_DIR} from "../data/constants";
import {
    GameModeAttributes, 
    MapAttributes, 
    GameModeDisplay, 
    GameModeData, 
    MapPreview, 
    NextStartTimes, 
    MapData, 
    MapSearchPreview, 
    EventData, 
    CurrentEvent, 
    CurrentEventsData, 
    GameModeMapDisplay, 
    RewardStackTimes
} from "../types";

// Last updated: Brawl Pass Season 30
export const MAP_CYCLE_HOURS = 2880;
const MAP_CYCLE_SECONDS = 10368000;
const SEASON_SECONDS = 72576000;
const MAP_CYCLES_PER_SEASON = 7;

// 6/24/2024 8:00 UTC is the beginning of a map cycle
const next_season_time = (((86400*365) * (2024-1970)) + (13*86400) + (175*86400) + (8*3600));
const first_season_time = next_season_time % SEASON_SECONDS;

const mapSearchMatch = new RegExp(/[^\w\s\.']/g);

export class SeasonTime{
    season: number;
    hour: number;
    minute: number;
    second: number;
    hoursPerSeason: number;
    maxSeasons: number;

    constructor(season: number, hour: number, minute: number, second: number){
        this.season = season;
        this.hour = hour;
        this.minute = minute;
        this.second = second;

        this.hoursPerSeason = MAP_CYCLE_HOURS;
        this.maxSeasons = MAP_CYCLES_PER_SEASON;
    }

    convertToSeconds(): number{
        let seconds = 0;
        seconds += this.season * this.hoursPerSeason * 3600;
        seconds += this.hour * 3600;
        seconds += this.minute * 60;
        seconds += this.second;
        return seconds;
    }
}

class GameMode{
    name: string;
    displayName: string;
    rotationTime: number;
    data: GameModeDisplay;
    maps: MapAttributes[];

    constructor(gameModeObject: GameModeAttributes){
        this.name = gameModeObject.name;
        this.displayName = gameModeObject.displayName;

        // Number of hours that each map is active for (usually 24). The event could switch multiple times during the
        // time the map is active. (ex. in the 2 hour map rotation, each heist map would appear 4 times in 24 hours)
        this.rotationTime = gameModeObject.rotationTime;

        this.data = gameModeObject.data;
        this.maps = gameModeObject.maps;
    }

    getMap(index: number): MapAttributes | undefined{
        if (index < this.maps.length){
            return this.maps[index];
        }
        return undefined;
    }

    /**
     * Searches for the given map name by index in this game mode's map list.
     * @param mapName name of the map
     * @returns index of the map or -1 if not found
     */
    findMapIndex(mapName: string): number{
        let index = -1;
        for (let x = 0; x < this.maps.length; x++){
            if (this.maps[x].name === mapName){
                index = x;
            }
        }
        return index;
    }

    /**
     * Get the active map in this game mode at a specific time.
     * @param seasonTime time after the map rotation reset
     * @param offset hours after the season reset when the first map in this mode appears
     * @returns active map at that time
     */
    getMapAtTime(seasonTime: SeasonTime, offset: number): MapAttributes{
        let seasonHour = seasonTime.hour;
        seasonHour -= offset;
        seasonHour = mod(seasonHour, MAP_CYCLE_HOURS);

        let mapIndex = Math.floor(seasonHour / this.rotationTime);
        mapIndex = mod(mapIndex, this.maps.length);

        return this.maps[mapIndex];
    }

    /**
     * Does the opposite of getMapAtTime.
     * Get all the possible times in the season when a map could appear. To make calculations more simple, only hours
     * are returned from this function because events cannot start between hours. Another function that uses the result
     * of this function can convert them to SeasonTime objects before returning them.
     * @param mapIndex index of the map in this game mode's map list
     * @param offset hours after the season reset when the first map in this mode appears
     * @param eventDuration hours that each map is active for
     * @returns array with all possible times, in hours after the map rotation reset
     */
    getTimeAtMap(mapIndex: number, offset: number, eventDuration: number): number[]{
        if (eventDuration <= 0){
            return [];
        }

        mapIndex = mod(mapIndex, this.maps.length);
        let startTime = mapIndex * this.rotationTime;
        startTime += offset;
        startTime = mod(startTime, MAP_CYCLE_HOURS);


        const activeTimes: number[] = [];

        // Check if the game mode currently active in this slot matches the map search.
        // Begin at startTime and do checks at intervals based on this event slot's eventDuration
        // Every time the game modes match, add them to the activeTimes, because an event may appear multiple times
        // within 24 hours (or whatever one rotation is for that event)
        // Then, repeat again later in the season (for those game modes which take less than a full season to go through
        // all their maps, ex: in the 2 hour rotation, the heist/bounty game modes would repeat every 7 days)
        for (let seasonPos = 0; seasonPos < MAP_CYCLE_HOURS; seasonPos += this.rotationTime * this.maps.length){
            for (let x = startTime + seasonPos; x < (startTime + seasonPos + this.rotationTime); x += eventDuration){
                activeTimes.push(mod(x, MAP_CYCLE_HOURS));
            }
        }

        // An event slot would have to check whether this event is actually the one that appears at the time.
        // Ex. in the new 24 hour rotation, bounty maps switch every 48 hours but during 24 of those hours, knockout is
        // active so the bounty map is only active for 24 hours out of the 48 possible hours that were identified.

        return activeTimes;
    }
}

class EventSlot{
    gameModes: GameMode[];
    eventDuration: number;
    offset: number;

    constructor(gameModes: GameMode[], eventDuration: number, offset: number){
        this.gameModes = gameModes;

        // How long each event lasts (usually is either 2 or 24 hours)
        this.eventDuration = eventDuration;

        // Number of hours after the start of the day when the map for the day appears
        this.offset = 0;
        if (offset > 0){
            this.offset = offset;
        }
    }

    getCurrentGameMode(seasonTime: SeasonTime): GameMode{
        let seasonHour = seasonTime.hour;
        seasonHour -= this.offset;
        seasonHour = mod(seasonHour, MAP_CYCLE_HOURS);

        if (this.eventDuration <= 0){
            return this.gameModes[0];
        }

        let gameModeIndex = Math.floor(seasonHour / this.eventDuration);
        gameModeIndex = mod(gameModeIndex, this.gameModes.length);

        const currentGameMode = this.gameModes[gameModeIndex];

        return currentGameMode;
    }

    getCurrentGameMap(seasonTime: SeasonTime): MapAttributes{
        return this.getCurrentGameMode(seasonTime).getMapAtTime(seasonTime, this.offset);
    }

    getCurrentGameMapFast(gameMode: GameMode, seasonTime: SeasonTime): MapAttributes{
        return gameMode.getMapAtTime(seasonTime, this.offset);
    }

    getEventTimeLeft(seasonTime: SeasonTime): SeasonTime{
        // Some maps are no longer in the ladder rotation but are power league maps. The program should be able to show
        // these maps but they should not be in the active events.
        if (this.eventDuration <= 0){
            return new SeasonTime(0, 0, 0, 0);
        }

        let seasonHour = seasonTime.hour;
        seasonHour -= this.offset;

        const nextEventHour = (Math.floor(seasonHour / this.eventDuration) + 1) * this.eventDuration;

        return subtractSeasonTimes(new SeasonTime(seasonTime.season, this.offset + nextEventHour, 0, -1), seasonTime);
    }

    searchForMap(mapName: string): MapAttributes | undefined{
        for (let x = 0; x < this.gameModes.length; x++){
            const mapSearchResult = this.gameModes[x].findMapIndex(mapName);
            if (mapSearchResult >= 0){
                return this.gameModes[x].getMap(mapSearchResult);
            }
        }
        return undefined;
    }

    /**
     * Get all the times a map will appear in this event slot, the soonest time a map will appear, and the duration that
     * the map is active for. If a map appears multiple times within a season, currentTime is used to determine the
     * least amount of time until the next appearance of the map. If the map does not appear at all in this event slot,
     * the time [1, 0, 0, 0] is returned.
     * @param mapName name of the map
     * @param currentTime the time to start the search at
     * @returns array of start times, next start time, and duration
     */
    getNextStartTime(mapName: string, currentTime: SeasonTime): NextStartTimes{
        // If the map is currently active, return 0 because it can be played right now

        // If the map is not active, search to see if it exists in this slot
        const result: NextStartTimes = {
            all: [],
            next: new SeasonTime(0, 0, 0, 0),
            duration: new SeasonTime(0, 0, 0, 0)
        };
        const validStartTimes: SeasonTime[] = [];
        let gameModeIndex = -1;
        let mapIndex = -1;

        let lowestStartTime = new SeasonTime(1, 0, 0, 0);

        //if (this.eventDuration <= 0){return result;}

        // Search through all the game modes in this event slot to see if the map appears in one of them
        for (let x = 0; x < this.gameModes.length; x++){
            const mapSearchResult = this.gameModes[x].findMapIndex(mapName);
            if (mapSearchResult >= 0){
                gameModeIndex = x;
                mapIndex = mapSearchResult;
            }
        }

        // If gameModeIndex >= 0 then mapIndex is guaranteed to be >= 0 and the map does exist in this event slot
        if (gameModeIndex >= 0){
            const gameMode = this.gameModes[gameModeIndex];

            // Get the list of all possible start times for that map
            const startTime = gameMode.getTimeAtMap(mapIndex, this.offset, this.eventDuration);

            // Go through all the start times and find the lowest difference between each time and the current time
            for (let x = 0; x < startTime.length; x++){
                // If a certain start time ends up being less than the current time, add 1 season (can't have negative
                // differences). The maximum difference between a start time and the current time is guaranteed to be 1
                // season because all events that do appear are guaranteed to appear at least once per season.
                let thisTime = new SeasonTime(currentTime.season, startTime[x], 0, 0);

                // If the map already appeared this season and the next time it appears is during the next season
                if (seasonTimesLessThan(thisTime, currentTime) === true){
                    thisTime = addSeasonTimes(thisTime, new SeasonTime(1, 0, 0, 0));
                }

                // Make sure the game mode is actually active then update the lowest time difference
                if (this.getCurrentGameMode(thisTime) === gameMode){
                    const timeDiff = subtractSeasonTimes(thisTime, currentTime);
                    if (seasonTimesLessThan(timeDiff, lowestStartTime) === true){
                        lowestStartTime = timeDiff;
                    }

                    // Add the start time to validStartTimes because the game mode being active was already checked
                    validStartTimes.push(new SeasonTime(0, startTime[x], 0, 0));
                }
            }
        }

        const currentMap = this.getCurrentGameMap(currentTime);
        if (currentMap === undefined){
            // Game modes in the ranked event slot may have 0 maps so this may be undefined since there is no active map
            return result;
        }

        result.all = validStartTimes;
        if (currentMap.name !== mapName && validStartTimes.length > 0){
            result.next = subtractSeasonTimes(lowestStartTime, new SeasonTime(0, 0, 0, 1));
        }
        result.duration = new SeasonTime(0, this.eventDuration, 0, 0);

        return result;
    }
}

export function mod(x: number, y: number): number{
    return (((x % y) + y) % y);
}

export function isValidTimeQuery(hour: string, minute: string, second: string): boolean{
    let valid = true;
    if (isNaN(+hour) === true || hour === ""){
        valid = false;
    } if (isNaN(+minute) === true || minute === ""){
        valid = false;
    } if (isNaN(+second) === true || second === ""){
        valid = false;
    }
    return valid;
}

/**
 * Converts time after January 1, 1970 to a time after the map rotation reset.
 * @param real milliseconds
 * @returns SeasonTime
 */
export function realToTime(real: number): SeasonTime{
    real = Math.floor(real / 1000);
    return secondsToTime(mod((real - first_season_time), SEASON_SECONDS));
}

/**
 * Convert seconds to a SeasonTime object in the format [season, hour, minute, second].
 * @param seconds seconds after the map rotation reset
 * @returns SeasonTime
 */
function secondsToTime(seconds: number): SeasonTime{
    const seasonTime = new SeasonTime(0, 0, 0, 0);
    seasonTime.season = Math.floor(seconds/MAP_CYCLE_SECONDS);
    seasonTime.hour = Math.floor((Math.floor(seconds/3600) % MAP_CYCLE_HOURS));
    seasonTime.minute = Math.floor((seconds % 3600) / 60);
    seasonTime.second = Math.floor(seconds % 60);
    return seasonTime;
}

export function addSeasonTimes(time1: SeasonTime, time2: SeasonTime): SeasonTime{
    const resultSeconds = time1.second + time2.second;
    const resultMinutes = time1.minute + time2.minute + Math.floor(resultSeconds / 60);
    const resultHours = time1.hour + time2.hour + Math.floor(resultMinutes / 60);
    const resultSeasons = time1.season + time2.season + Math.floor(resultHours / time1.hoursPerSeason);
    return new SeasonTime(mod(resultSeasons, time1.maxSeasons), mod(resultHours, time1.hoursPerSeason), mod(resultMinutes, 60), mod(resultSeconds, 60));
}

export function subtractSeasonTimes(time1: SeasonTime, time2: SeasonTime): SeasonTime{
    const resultSeconds = time1.second - time2.second;
    const resultMinutes = time1.minute - time2.minute + Math.floor(resultSeconds / 60);
    const resultHours = time1.hour - time2.hour + Math.floor(resultMinutes / 60);
    const resultSeasons = time1.season - time2.season + Math.floor(resultHours / time1.hoursPerSeason);
    return new SeasonTime(mod(resultSeasons, time1.maxSeasons), mod(resultHours, time1.hoursPerSeason), mod(resultMinutes, 60), mod(resultSeconds, 60));
}

function seasonTimesLessThan(time1: SeasonTime, time2: SeasonTime): boolean{
    const seconds1 = time1.convertToSeconds();
    const seconds2 = time2.convertToSeconds();
    return seconds1 < seconds2;
}

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
 * Get a game mode's json data along with an array of its maps. If the mode appears in multiple event slots, only the
 * first appearance will be returned. This function also adds all necessary file paths.
 * @param eventList list of all events
 * @param modeName game mode to get data for
 * @returns copy of the game mode data
 */
export function getModeData(eventList: EventSlot[], modeName: string): GameModeData | undefined{
    let result: GameModeData | undefined;
    let x = 0;
    let found = false;

    while (x < eventList.length && found === false){
        let y = 0;
        // Inside each event, look for the game mode in its game mode list
        while (y < eventList[x].gameModes.length){
            if (eventList[x].gameModes[y].name === modeName){
                found = true;
                const thisGameMode = eventList[x].gameModes[y];

                const gameModeResult: GameModeData = {
                    name: thisGameMode.name,
                    displayName: thisGameMode.displayName,
                    data: applyGameModeDisplay(thisGameMode.data),
                    maps: []
                };

                // Only add the list of map names and not the entire data
                const allMaps = thisGameMode.maps;
                const mapList: MapPreview[] = [];
                for (let m = 0; m < allMaps.length; m++){
                    if (Object.hasOwn(allMaps[m], "name") === true && Object.hasOwn(allMaps[m], "displayName") === true){
                        mapList.push({
                            name: allMaps[m].name,
                            displayName: allMaps[m].displayName
                        });
                    }
                }
                gameModeResult.maps = mapList;
                result = gameModeResult;
            }
            y++;
        }
        x++;
    }
    return result;
}

/**
 * Get a map's json data along with the times it appears. Returns the first instance of the map in the eventList given
 * so if a map somehow appears in 2 different event slots then it will only count the first event. This function also
 * adds all necessary file paths.
 * @param eventList list of all events
 * @param mapName map to get data for
 * @param currentTime time to get data at
 * @returns copy of the map data
 */
export function getMapData(eventList: EventSlot[], mapName: string, currentTime: SeasonTime): MapData | undefined{
    let result: MapData | undefined;
    for (let x = 0; x < eventList.length; x++){
        let mapInThisSlot: MapAttributes | undefined;

        const mapTimes = eventList[x].getNextStartTime(mapName, currentTime);

        for (let y = 0; y < eventList[x].gameModes.length; y++){
            const thisGameMode = eventList[x].gameModes[y];
            const mapSearchResult = thisGameMode.findMapIndex(mapName);
            if (mapSearchResult >= 0){
                mapInThisSlot = eventList[x].gameModes[y].getMap(mapSearchResult);

                if (mapInThisSlot !== undefined){
                    const mapSlotData: MapData = {
                        name: mapInThisSlot.name,
                        displayName: mapInThisSlot.displayName,
                        gameMode: applyGameModeMapDisplay(thisGameMode.name, thisGameMode.data),
                        powerLeagueMap: mapInThisSlot.powerLeagueMap,
                        image: MAP_IMAGE_DIR + thisGameMode.name.replace("ranked", "") + "/" + mapInThisSlot.image,
                        bannerImage: MAP_BANNER_DIR + mapInThisSlot.bannerImage,
                        times: mapTimes
                    };
                    result = mapSlotData;
                }
            }
        }
    }
    return result;
}

export function searchForMapName(eventList: EventSlot[], search: string): MapSearchPreview[]{
    const exactMatch: MapSearchPreview[] = [];
    const startsWith: MapSearchPreview[] = [];
    const onlyContains: MapSearchPreview[] = [];

    const query = search.toLowerCase().replace(mapSearchMatch, "");

    for (const event of eventList){
        for (const mode of event.gameModes){
            for (const map of mode.maps){
                const thisMapName = map.displayName.toLowerCase();
                const queryIndex = thisMapName.search(query);

                if (thisMapName.includes(query) === true){
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
    }

    // Search results which are closest to the query first will appear earlier in the result array
    return exactMatch.concat(startsWith, onlyContains);
}

/**
 * Combines the name and game mode of an event with the times that it appears during the season into one json object.
 * @param event specific event to search from
 * @param seasonTime time to calculate event time left at
 * @returns new object with event data
 */
function getEventData(event: EventSlot, seasonTime: SeasonTime): EventData{
    const thisGameMode = event.getCurrentGameMode(seasonTime);
    const thisMap = event.getCurrentGameMapFast(thisGameMode, seasonTime);

    const resultEvent: EventData = {
        gameMode: {
            name: thisGameMode.name,
            displayName: thisGameMode.displayName,
            data: applyGameModeDisplay(thisGameMode.data)
        },
        map: {
            name: thisMap.name,
            displayName: thisMap.displayName,
            bannerImage: MAP_BANNER_DIR + thisMap.bannerImage
        }
    };

    return resultEvent;
}

export function getAllEvents(eventList: EventSlot[], seasonTime: SeasonTime): CurrentEventsData{
    const allEvents: CurrentEvent[] = [];

    for (let x = 0; x < eventList.length; x++){
        // Events with duration 0 are special event slots because they are reserved for maps that are still in the game
        // but not in the ladder rotation such as power league maps
        if (eventList[x].eventDuration > 0){
            allEvents.push({
                current: getEventData(eventList[x], seasonTime),
                upcoming: getEventData(eventList[x], addSeasonTimes(seasonTime, new SeasonTime(0, eventList[x].eventDuration, 0, 0))),
                timeLeft: eventList[x].getEventTimeLeft(seasonTime)
            });
        }
    }

    return {
        time: seasonTime,
        events: allEvents
    };
}

/**
 * Calculates the number of rewards a user can claim based on the current time in the season and the time when they last
 * claimed a reward. This should be used with stackable rewards where one reward is given out every few hours.
 * @param currentTime current time, in milliseconds after January 1, 1970 
 * @param lastClaim time when the reward was last claimed, in milliseconds after January 1, 1970
 * @param hoursPerReward interval that rewards are given at
 * @returns number of stacks and time until next stack
 */
export function getRewardStacks(currentTime: number, lastClaim: number, hoursPerReward: number = 6): RewardStackTimes{
    // Add tokens based on how much time has passed since they last logged in
    hoursPerReward = Math.max(1, Math.round(hoursPerReward));
    const currentSeasonTime = realToTime(currentTime);

    // Stacks to be given to the user
    let rewardsGiven = 0;

    const hoursSinceLastLogin = (currentTime - lastClaim) / 3600000;
    if (hoursSinceLastLogin <= 0){
        rewardsGiven = 0;
    } else if (hoursSinceLastLogin >= MAP_CYCLE_HOURS * currentSeasonTime.maxSeasons){
        rewardsGiven = MAP_CYCLE_HOURS * currentSeasonTime.maxSeasons / hoursPerReward;
    } else{
        let currentSeason = currentSeasonTime.season;
        let currentHour = currentSeasonTime.hour;

        const lastLoginTime = realToTime(lastClaim);
        const lastLoginHour = lastLoginTime.hour;

        // Reward times must be compared on the same season so must handle cases where season values are not the same
        const seasonDiff = currentSeason - lastLoginTime.season;
        if (seasonDiff > 0){
            // Case 1: Positive carry over
            // Represents a case where the map rotation reset since the last login but not the ladder season reset
            // Remove the additional seasons and add a full season worth of hours for each season removed.
            //
            // Ex. Current time: [1, 5, 0, 0], Last login: [0, 309, 0, 0]
            // Remove 1 season and add 336 hours so the comparison becomes [0, 341, 0, 0] and [0, 309, 0, 0]
            currentSeason -= seasonDiff;
            currentHour += currentSeasonTime.hoursPerSeason * seasonDiff;
        } else if (seasonDiff < 0){
            // Case 2: Negative carry over
            // Represents a case where the ladder season reset since the last login
            // The comparison should be done using the higher season number so the lower has to be increased to match it
            //
            // Ex. (Note: the maxSeasons is 3 here because this is supposed to work no matter what maxSeasons is)
            // Current time: [0, 5, 0, 0], Last login: [1, 309, 0, 0], maxSeasons = 3
            // The desired comparison here is [1, 677, 0, 0] and [1, 309, 0, 0] since [0, 5, 0, 0] is actually an entire
            // season + a few hours ahead of [1, 309, 0, 0]
            //
            // Increase the lower season amount by subtracting seasonDiff
            // seasonDiff is negative here so subtracting it increases the value
            // In this example, [0, 5, 0, 0] becomes [1, 5, 0, 0]
            // Now the correct number of hours must be added to make the time equal again while keeping the season value
            // unchanged. To avoid negative numbers, add an entire season worth of hours then subtract the amount of
            // hours added when seasonDiff was subtracted from currentSeason.
            // In this example, [1, 5, 0, 0] +1008 => [1, 1013, 0, 0] -336 => [1, 677, 0, 0]
            // These two numbers of hours to be added/subtracted can both be obtained with (seasonDiff % maxSeasons)
            currentSeason -= seasonDiff;
            currentHour += currentSeasonTime.hoursPerSeason * mod(seasonDiff, currentSeasonTime.maxSeasons);
        } else if (currentHour < lastLoginHour){
            // Case 3: Entire season carry over
            // Represents a case where almost an entire season has passed since the last login
            // Add an entire season worth of hours to the current time to represent time passed since the last login.
            //
            // Ex. Current time: [0, 2, 0, 0], Last login: [0, 7, 0, 0], maxSeasons = 3
            // The current time should be treated as [3, 2, 0, 0] but since maxSeasons is 3, the time given by the
            // function is set to [0, 2, 0, 0] because it is equivalent in terms of the map rotation.
            currentHour += currentSeasonTime.hoursPerSeason * currentSeasonTime.maxSeasons;
        }

        // Rewards are given at multiples of hoursPerReward in the season so find the last multiple before the current
        // time then compare it to the last login time.
        const lastRewardHour = Math.floor(currentHour / hoursPerReward) * hoursPerReward;

        // The user can claim rewards as long as their last login hour is less than the last reward hour. Since rewards
        // are given at the start of the hour, a last login hour the same as the last reward hour means the user logged
        // in right after the reward was given and cannot receive it. Their last login time should be treated as the
        // next hour. To account for this, add 1 to the lastLoginHour.
        // Ex. [0, 309, 28, 44] is treated the same as [0, 310, 0, 0]
        rewardsGiven = Math.floor((lastRewardHour - lastLoginHour - 1) / hoursPerReward) + 1;// rounded up
    }

    return {
        stacks: rewardsGiven,
        nextStack: subtractSeasonTimes(
            new SeasonTime(currentSeasonTime.season, Math.floor(currentSeasonTime.hour / hoursPerReward + 1) * hoursPerReward, 0, -1),
            currentSeasonTime
        )
    };
}

// Read the data from the maps_data file then create GameMode and EventSlot objects from it.
export const events: EventSlot[] = [];
for (let x = 0; x < eventList.length; x++){
    const gameModes: GameMode[] = [];

    for (let y = 0; y < eventList[x].gameModes.length; y++){
        gameModes.push(new GameMode(eventList[x].gameModes[y]));
    }

    if (gameModes.length > 0){
        events.push(new EventSlot(gameModes, eventList[x].eventDuration, eventList[x].offset));
    }
}
