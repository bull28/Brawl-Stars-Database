class SeasonTime{
    constructor(season, hour, minute, second){
        this.season = season;
        this.hour = hour;
        this.minute = minute;
        this.second = second;

        this.hoursPerSeason = MAP_CYCLE_HOURS;
        this.maxSeasons = MAP_CYCLES_PER_SEASON;
    }

    /**
     * Converts the time to seconds.
     * @returns seconds after season reset
     */
    convertToSeconds(){
        var seconds = 0;
        seconds += this.season * this.hoursPerSeason * 3600;
        seconds += this.hour * 3600;
        seconds += this.minute * 60;
        seconds += this.second;
        return seconds;
    }
}

class EventSlot{
    constructor(gameModes, eventDuration, offset){
        // array of gameMode objects
        this.gameModes = gameModes;

        // how long each event lasts (usually is either 2 or 24 hours)
        this.eventDuration = eventDuration;

        // number of hours after the start of the day when the map for the day appears
        this.offset = 0;
        if (offset > 0){
            this.offset = offset;
        }
    }

    /**
     * Get the active game mode at a specific time.
     * @param {SeasonTime} seasonTime time after the map rotation reset
     * @returns gameMode
     */
    getCurrentGameMode(seasonTime){
        var seasonHour = seasonTime.hour;
        seasonHour -= this.offset;
        seasonHour = mod(seasonHour, MAP_CYCLE_HOURS);

        var gameModeIndex = Math.floor(seasonHour / this.eventDuration);
        gameModeIndex = mod(gameModeIndex, this.gameModes.length);

        var currentGameMode = this.gameModes[gameModeIndex];

        return currentGameMode;
    }
    
    /**
     * Get the active map in the active game mode at a specific time.
     * @param {SeasonTime} seasonTime time after the map rotation reset
     * @returns json object of the active map
     */
    getCurrentGameMap(seasonTime){
        var theGameMode = this.getCurrentGameMode(seasonTime);
        return theGameMode.getMapAtTime(seasonTime, this.offset);
    }

    /**
     * Get the active map in the active game mode at a specific time.
     * Accepts a game mode json object so this can be found without
     * having to search through the game mode list again.
     * @param {Array} theGameMode 
     * @param {SeasonTime} seasonTime time after the map rotation reset
     * @returns json object of the active map
     */
    getCurrentGameMapFast(theGameMode, seasonTime){
        return theGameMode.getMapAtTime(seasonTime, this.offset);
    }

    /**
     * Get the amount of time until the current event ends.
     * @param {SeasonTime} seasonTime time after the map rotation reset
     * @returns SeasonTime
     */
    getEventTimeLeft(seasonTime){
        var seasonHour = seasonTime.hour;
        seasonHour -= this.offset;

        var nextEventHour = (Math.floor(seasonHour / this.eventDuration) + 1) * this.eventDuration;

        var nextEventTime = subtractSeasonTimes(new SeasonTime(seasonTime.season, this.offset + nextEventHour, 0, -1), seasonTime);
        return nextEventTime;
    }

    /**
     * Searches for a specific map in all the game modes in this event slot.
     * @param {String} mapName name of the map
     * @returns json object of the map, empty if not found
     */
    searchForMap(mapName){
        for (var x = 0; x < this.gameModes.length; x++){
            let mapSearchResult = this.gameModes[x].findMapIndex(mapName);
            if (mapSearchResult >= 0){
                return this.gameModes[x].getMap(mapSearchResult);
            }
        }

        return {};
    }

    /**
     * Get all the times a map will appear in this event slot, the soonest
     * time a map will appear, and the duration that the map is active for.
     * If a map appears multiple times within a season, currentTime is used
     * to determine the least amount of time until the next appearance of the
     * map. If the map does not appear at all in this event slot, the time
     * [1, 0, 0, 0] is returned.
     * @param {String} mapName name of the map
     * @param {SeasonTime} currentTime the time at which to start the search
     * @returns SeasonTime
     */
    getNextStartTime(mapName, currentTime){
        // if the map is currently active, return 0 because "it can be played right now"

        // if the map is not active, search to see if it exists in this slot
        var result = {};
        var validStartTimes = [];
        var gameModeIndex = -1;
        var mapIndex = -1;

        var lowestStartTime = new SeasonTime(1, 0, 0, 0);

        // search through all the game modes in this event slot to see if the map appears in one of them
        for (var x = 0; x < this.gameModes.length; x++){
            let mapSearchResult = this.gameModes[x].findMapIndex(mapName);
            if (mapSearchResult >= 0){
                gameModeIndex = x;
                mapIndex = mapSearchResult;
            }
        }

        // if gameModeIndex >= 0 then mapIndex is guaranteed to be >= 0 and the map does exist in this event slot
        if (gameModeIndex >= 0){
            var theGameMode = this.gameModes[gameModeIndex];

            // get the list of all possible start times for that map
            var startTime = theGameMode.getTimeAtMap(mapIndex, this.offset, this.eventDuration);
            
            
            // go through all the start times and compute the difference between them and the current time
            // save the lowest difference and return that

            for (var x = 0; x < startTime.length; x++){
                // if a certain start time ends up being less than the current time, add 1 season
                // (can't have negative differences)
                // also, the maximum difference between a start time and the current time is
                // guaranteed to be 1 season because all events that do appear are guaranteed
                // to appear at least once per season
                const thisTime = new SeasonTime(currentTime.season, startTime[x], 0, 0);

                if (seasonTimesLessThan(thisTime, currentTime)){
                    thisTime.season += 1;
                }

                // make sure the game mode is actually active
                if (this.getCurrentGameMode(thisTime) == theGameMode){
                    // update lowest time difference
                    const timeDiff = subtractSeasonTimes(thisTime, currentTime);
                    if (seasonTimesLessThan(timeDiff, lowestStartTime)){
                        lowestStartTime = timeDiff;
                    }

                    // also add the start time to validStartTimes because whether or not the
                    // game mode is active has already been checked
                    validStartTimes.push(new SeasonTime(0, startTime[x], 0, 0));
                }
            }
        }

        result["all"] = validStartTimes;
        if (this.getCurrentGameMap(currentTime).name == mapName){
            result["next"] = new SeasonTime(0, 0, 0, 0);
        } else{
            result["next"] = subtractSeasonTimes(lowestStartTime, new SeasonTime(0, 0, 0, 1));
        }
        result["duration"] = new SeasonTime(0, this.eventDuration, 0, 0);
        

        return result;
    }
}

class GameMode{
    constructor(name, displayName, rotationTime){
        this.name = name;
        this.displayName = displayName;

        // number of hours that each map is active for (usually 24 hours)
        // the event could switch multiple times during the time the map
        // is active. (ex. in the 2 hour map rotation, each heist map would appear 4 times in 24 hours)
        this.rotationTime = rotationTime;

        this.data = {};

        // array of map names, stored as strings
        this.maps = [];
    }

    /**
     * Adds a new map to this game mode's map list.
     * @param {String} mapObject json object of the map
     */
    addMap(mapObject){
        this.maps.push(mapObject);
    }

    /**
     * Gets a map from this game mode's map list.
     * @param {Number} index index of the map in this game mode's map list
     * @returns json object of the map
     */
    getMap(index){
        if (index < this.maps.length){
            return this.maps[index];
        } else{
            return {};
        }
    }

    /**
     * Sets additional json data for this game mode that does not
     * have effect on the map rotation.
     * @param {Object} newData 
     */
    setData(newData){
        this.data = newData;
    }

    /**
     * Searches for the given map name in tis game mode's map list.
     * If successful, return the index of the map.
     * Otherwise, return -1.
     * @param {String} mapName name of the map
     * @returns Number
     */
    findMapIndex(mapName){
        var index = -1;
        for (var x = 0; x < this.maps.length; x++){
            if (this.maps[x].hasOwnProperty("name")){
                if (this.maps[x].name == mapName){
                    index = x;
                }
            }
        }
        return index;
    }

    /**
     * Get the active map in this game mode at a specific time.
     * @param {SeasonTime} seasonTime time after the map rotation reset
     * @param {Number} offset hours after the season reset when the first map in this mode appears
     * @returns json object of the active map
     */
    getMapAtTime(seasonTime, offset){
        var seasonHour = seasonTime.hour;
        seasonHour -= offset;
        seasonHour = mod(seasonHour, MAP_CYCLE_HOURS);

        var mapIndex = Math.floor(seasonHour / this.rotationTime);
        mapIndex = mod(mapIndex, this.maps.length);

        return this.maps[mapIndex];
    }

    /**
     * Does the opposite of getMapAtTime.
     * Get all the possible times in the season when a map could appear.
     * To make calculations more simple, only hours are returned from this
     * function because events cannot start between hours. Another function
     * which uses the result of this function can convert them to SeasonTime
     * objects before returning them.
     * @param {Number} mapIndex index of the map in this game mode's map list
     * @param {Number} offset hours after the season reset when the first map in this mode appears
     * @returns array with all possible times, in hours after the map rotation reset
     */
    getTimeAtMap(mapIndex, offset, eventDuration){
        mapIndex = mod(mapIndex, this.maps.length);
        var startTime = mapIndex * this.rotationTime;
        startTime += offset;
        startTime = mod(startTime, MAP_CYCLE_HOURS);


        var activeTimes = [];

        // check if the game mode currently active in this slot matches the map search
        // begin at startTime and do checks at intervals based on this event slot's eventDuration
        // every time the game modes match, add them to the activeTimes, because an event may
        // appear multiple times within 24 hours (or whatever one rotation is for that event)
        // then, repeat again later in the season (for those game modes which take less than a full
        // season to go through all their maps, ex: in the 2 hour rotation, the heist/bounty game modes
        // would repeat every 7 days)
        for (var seasonPos = 0; seasonPos < MAP_CYCLE_HOURS; seasonPos += this.rotationTime * this.maps.length){
            for (var x = startTime + seasonPos; x < (startTime + seasonPos + this.rotationTime); x += eventDuration){
                activeTimes.push(mod(x, MAP_CYCLE_HOURS));
            }
        }

        // this function returns all possible times the map may appear, an event slot
        // would have to check whether this event is actually the one that appears at the time.
        // ex. in the new 24 hour rotation, bounty maps switch every 48 hours
        // but during 24 of those hours, knockout is actually active so the bounty map is only
        // active for 24 hours out of the 48 possible hours that this function identified

        return activeTimes;
    }
}

/**
 * Converts event and map data from a file into EventSlot and GameMode objects.
 * @param {Array} eventData json data from a file
 * @returns array of EventSlot objects
 */
function jsonToEvents(eventData){
    var events = [];
    for (var x = 0; x < eventData.length; x++){
        var gameModes = [];
    
        for (var y = 0; y < eventData[x].gameModes.length; y++){
            let gameModeData = eventData[x].gameModes[y];
            var thisGameMode = new GameMode(gameModeData.name, gameModeData.displayName, gameModeData.rotationTime);
    
            for (var m = 0; m < gameModeData.maps.length; m++){
                thisGameMode.addMap(gameModeData.maps[m]);
            }

            //for (let d in gameModeData){
            //    console.log(d);
            //}
            //temporary solution
            thisGameMode.setData(gameModeData.data);
            gameModes.push(thisGameMode);
        }
        
        var thisEvent = new EventSlot(gameModes, eventData[x].eventDuration, eventData[x].offset);     
        events.push(thisEvent);
    }

    return events;
}



/**
 * Returns the (accurate) result of x % y .
 * @param {Number} x 
 * @param {Number} y 
 * @returns Number (integer)
 */
function mod(x, y){
    // turns out % is remainder and not mod???????
    return (((x % y) + y) % y);
}

/**
 * Converts time after January 1, 1970 to a time after the map rotation reset.
 * @param {Number} real 
 * @returns SeasonTime
 */
function realToTime(real){
    real = Math.floor(real / 1000);
    return secondsToTime(mod((real - first_season_time), SEASON_SECONDS));
}

/**
 * Convert seconds to a SeasonTime object in the format
 * [season, hour, minute, second].
 * @param {Number} seconds seconds after the map rotation reset
 * @returns SeasonTime
 */
function secondsToTime(seconds){
    var seasonTime = new SeasonTime(0, 0, 0, 0);
    seasonTime.season = Math.floor(seconds/MAP_CYCLE_SECONDS);
    seasonTime.hour = Math.floor((Math.floor(seconds/3600) % MAP_CYCLE_HOURS));
    seasonTime.minute = Math.floor((seconds % 3600) / 60);
    seasonTime.second = Math.floor(seconds % 60);
    return seasonTime;
}

/**
 * Computes time1 + time2, where both are SeasonTime objects.
 * @param {SeasonTime} time1 SeasonTime object
 * @param {SeasonTime} time2 SeasonTime object
 * @returns SeasonTime
 */
function addSeasonTimes(time1, time2){
    const resultSeconds = time1.second + time2.second;
    const resultMinutes = time1.minute + time2.minute + Math.floor(resultSeconds / 60);
    const resultHours = time1.hour + time2.hour + Math.floor(resultMinutes / 60);
    const resultSeasons = time1.season + time2.season + Math.floor(resultHours / time1.hoursPerSeason);
    return new SeasonTime(mod(resultSeasons, time1.maxSeasons), mod(resultHours, time1.hoursPerSeason), mod(resultMinutes, 60), mod(resultSeconds, 60));
}

/**
 * Computes time1 - time2, where both are SeasonTime objects.
 * @param {SeasonTime} time1 the initial time
 * @param {SeasonTime} time2 the time being subtracted from time1
 * @returns SeasonTime
 */
function subtractSeasonTimes(time1, time2){
    const resultSeconds = time1.second - time2.second;
    const resultMinutes = time1.minute - time2.minute + Math.floor(resultSeconds / 60);
    const resultHours = time1.hour - time2.hour + Math.floor(resultMinutes / 60);
    const resultSeasons = time1.season - time2.season + Math.floor(resultHours / time1.hoursPerSeason);
    return new SeasonTime(mod(resultSeasons, time1.maxSeasons), mod(resultHours, time1.hoursPerSeason), mod(resultMinutes, 60), mod(resultSeconds, 60));
}

/**
 * Computes time1 < time2, where both are SeasonTime objects.
 * @param {SeasonTime} time1 SeasonTime object
 * @param {SeasonTime} time2 SeasonTime object
 * @returns boolean
 */
function seasonTimesLessThan(time1, time2){
    const seconds1 = time1.convertToSeconds();
    const seconds2 = time2.convertToSeconds();
    return seconds1 < seconds2;
}




/**
 * Get a game mode's json data along with an array of
 * its maps. If the mode appears in multiple event slots,
 * only the first appearance will be returned.
 * @param {Array} eventList 
 * @param {String} modeName 
 * @returns json object of the game mode
 */
function getModeInformation(eventList, modeName){
    var result = {};

    var x = 0;
    var found = false;
    // go through all the events first
    while (x < eventList.length && found == false){
        var y = 0;
        // inside each event, look for the game mode in its game mode list
        while (y < eventList[x].gameModes.length){
            if (eventList[x].gameModes[y].name == modeName){
                found = true;
                // thisGameMode is a gameMode object
                const thisGameMode = eventList[x].gameModes[y];

                // these are properties of a GameMode object so they have to exist
                result.name = thisGameMode.name;
                result.displayName = thisGameMode.displayName;
                result.data = thisGameMode.data;

                // only add the list of map names and not the entire json data
                const allMaps = thisGameMode.maps;
                var mapList = [];
                for (var m = 0; m < allMaps.length; m++){
                    if (allMaps[m].hasOwnProperty("name") && allMaps[m].hasOwnProperty("displayName")){
                        mapList.push({
                            "name": allMaps[m].name,
                            "displayName": allMaps[m].displayName
                        });
                    }
                }
                result.maps = mapList;
            }
            y++;
        }
        x++;        
    }

    return result;
}

/**
 * Get a map's json data along with the times it appears.
 * Returns the first instance of the map in the eventList given
 * so if a map somehow appears in 2 different event slots then
 * it will only count the first event.
 * @param {Array} eventList list of EventSlot objects
 * @param {String} mapName name of the map
 * @param {SeasonTime} currentTime time used to calculate next appearance of the map
 * @returns json object of the map
 */
function getMapInformation(eventList, mapName, currentTime){
    var result = {};

    var x = 0;
    var found = false;
    while (x < eventList.length && found == false){
        //const mapInThisSlot = eventList[x].searchForMap(mapName);
        var mapInThisSlot = {};
        var isEmpty = true;
        for (var y = 0; y < eventList[x].gameModes.length; y++){
            let mapSearchResult = eventList[x].gameModes[y].findMapIndex(mapName);
            if (mapSearchResult >= 0){
                mapInThisSlot = eventList[x].gameModes[y].getMap(mapSearchResult);
                isEmpty = false;
            }
        }
        
        if (isEmpty == false){
            found = true;

            for (var y in mapInThisSlot){
                result[y] = mapInThisSlot[y];
            }
            result["times"] = eventList[x].getNextStartTime(mapName, currentTime);
            
        }
        x++;
    }

    return result;
}

/**
 * Searches the entire list of maps and returns those whose
 * display names contain the query. Maps whose display name
 * are a closer match to the query are at the beginning of the
 * result array.
 * @param {Array} eventList list of EventSlot objects to search through
 * @param {String} query search query
 * @returns array containing the search results
 */
function searchForMapName(eventList, query){
    var result = [];
    var exactMatch = [];
    var startsWith = [];
    var onlyContains = [];
    for (let event of eventList){
        for (let mode of event.gameModes){
            for (let map of mode.maps){
                query = query.toLowerCase();
                const thisMapName = map.displayName.toLowerCase();

                // some characters like "." are special parameters to the
                // string search so they may produce unintended results.
                // check whether the query is actually in the string
                // before adding it. The queryIndex only determines the
                // order they are added in.
                const queryIndex = thisMapName.search(query);
                const includes = thisMapName.includes(query);

                if (includes){
                    if (thisMapName == query){
                        exactMatch.push({"name":map.name, "displayName":map.displayName});
                    } else if (queryIndex == 0){
                        startsWith.push({"name":map.name, "displayName":map.displayName});
                    } else if (queryIndex > 0){
                        onlyContains.push({"name":map.name, "displayName":map.displayName});
                    }
                }
                 
            }
        }
    }

    // search results which are closest to the query first will
    // appear earlier in the result array
    for (let x of exactMatch){
        result.push(x);
    } for (let x of startsWith){
        result.push(x);
    } for (let x of onlyContains){
        result.push(x);
    }
    
    return result;
}

/**
 * Combines the name and game mode of an event with the times
 * that it appears during the season into one json object.
 * @param {EventSlot} event event to get information from
 * @param {SeasonTime} seasonTime time at which to calculate event time left from
 * @returns json object
 */
function getEventInformation(event, seasonTime){
    var thisEvent = {};

    thisEvent["gameMode"] = {};
    thisEvent["map"] = {};
    //thisEvent["timeLeft"] = new SeasonTime(0, 0, 0, 0);//this is now included in getAllEvents

    // only finding this once and reusing its values
    const thisGameMode = event.getCurrentGameMode(seasonTime);
    const thisMap = event.getCurrentGameMapFast(thisGameMode, seasonTime);

    // take the properties from the map and copy them to the json
    // object that gets returned
    // only copy values over that are useful (ex. user can't do anything with rotationTime)

    // these values are not copied over
    const excludeFromGameMode = ["maps", "rotationTime"];
    const excludeFromMap = ["image", "gameMode", "powerLeagueMap"];
    
    for (var x in thisGameMode){
        if (x == "data"){
            // "" tells the function to remove the image
            //thisEvent["gameMode"][x] = copyMapData(thisGameMode[x], "");
            thisEvent["gameMode"][x] = thisGameMode[x];
        }
        //else if (x != "maps" && x != "rotationTime"){
        else if (!(excludeFromGameMode.includes(x))){
            thisEvent["gameMode"][x] = thisGameMode[x];
        }
    }
    for (var x in thisMap){
        //if (x != "image" && x != "gameMode"){/////////////////////////
        if (!(excludeFromMap.includes(x))){
            thisEvent["map"][x] = thisMap[x];
        }
    }
    
    //thisEvent.timeLeft = event.getEventTimeLeft(seasonTime);

    return thisEvent;
}

/**
 * For each event slot, get the currently active and upcoming 
 * map and game mode in the slot.
 * @param {Array} eventList list of EventSlot objects
 * @param {SeasonTime} seasonTime time to use in the calculation of current and upcoming events
 * @returns array of json objects for the events
 */
function getAllEvents(eventList, seasonTime){
    var allEvents = [];

    for (var x = 0; x < eventList.length; x++){
        var thisEvent = {};
        
        thisEvent["current"] = getEventInformation(eventList[x], seasonTime);
        thisEvent["upcoming"] = getEventInformation(eventList[x], addSeasonTimes(seasonTime, new SeasonTime(0, eventList[x].eventDuration, 0, 0)));
        thisEvent["timeLeft"] = eventList[x].getEventTimeLeft(seasonTime);

        allEvents.push(thisEvent);
    }

    return allEvents;
}

/**
 * Adds the imagePath and bannerPath file paths to the appropriate image
 * file names in a map object.
 * @param {Object} data 
 * @param {String} imagePath 
 * @param {String} bannerPath 
 * @returns json object of the map with the file paths added
 */
function addPathMap(data, imagePath, bannerPath){
    var resultData = {};
    for (var x in data){
        if (x == "image"){
            resultData[x] = imagePath + data.gameMode + "/" + data.image;
        } else if (x == "bannerImage"){
            resultData[x] = bannerPath + data.bannerImage;
        } else{
            resultData[x] = data[x];
        }
    }
    return resultData;
}

/**
 * Adds the filePath to the image file name of a game mode.
 * @param {Object} data 
 * @param {String} filePath 
 * @returns json object of the game mode with the file path added.
 */
function addPathGameMode(data, filePath){
    var resultData = {};
    for (var x in data){
        // when getting to the data of data, use the image file
        // to determine which image to get later
        if (x == "data"){
            // if for some reason this image doesn't exist, the file will point
            // to something unknown which will throw error later on
            if (data[x].hasOwnProperty("image")){
                filePath = filePath + data[x].image;
            }

            
            // copy all pieces of data and add the image file path
            var dataCopy = {};
            for (var y in data[x]){
                if (y == "image"){
                    dataCopy[y] = filePath;
                } else{
                    dataCopy[y] = data[x][y];
                }
            }
            resultData[x] = dataCopy;
        } else{
            resultData[x] = data[x];
        }
    }
    return resultData;
}

const MAP_CYCLE_HOURS=336;
const MAP_CYCLE_SECONDS=1209600;
const SEASON_SECONDS=2419200;
const MAP_CYCLES_PER_SEASON=2;

const next_season_time = (((86400*365)*(2021-1970))+(12*86400)+(263*86400)+(8*3600));
const first_season_time = next_season_time % SEASON_SECONDS;


exports.MAP_CYCLE_HOURS = MAP_CYCLE_HOURS;

exports.SeasonTime = SeasonTime;

exports.jsonToEvents = jsonToEvents;
exports.mod = mod;
exports.realToTime = realToTime;
exports.addSeasonTimes = addSeasonTimes;
exports.getModeInformation = getModeInformation;
exports.getMapInformation = getMapInformation;
exports.searchForMapName = searchForMapName;
exports.getAllEvents = getAllEvents;
exports.addPathMap = addPathMap;
exports.addPathGameMode = addPathGameMode;


/*




for (var x=0;x<361;x+=2){
    var hour1 = x.toString();
    if (hour1<10){
        hour1 = "  "+hour1;
    } else if (hour1<100){
        hour1 = " "+hour1;
    }

    var strings = [hour1,"\t"];
    let BULTIME = new SeasonTime(0, x, 0, 0);
    for (var i=0;i<events2.length;i++){       
        strings.push(events2[i].getCurrentGameMode(BULTIME).displayName);

        var mapname = events2[i].getCurrentGameMap(BULTIME).displayName;
        strings.push(mapname);

        var maptime = events2[i].getEventTimeLeft(BULTIME);
        strings.push(maptime.hour.toString());
        strings.push(":");
        strings.push(maptime.minute.toString());
        strings.push(":");
        strings.push(maptime.second.toString());
        
        strings.push(" | ");
        //console.log("\n");
    }
    console.log.apply(console,strings);
}

var BUL = events2[3].getMapStartTimes("goldarm-gulch");
console.log(BUL);
var E = events2[3].getMapStartTimes("goldarm-gulch");
E[0][0].hour = 169;
console.log(E);
console.log(events2[3].getMapStartTimes("shooting-star"));
console.log(events2[5].getMapStartTimes("shooting-star"));
console.log(events2[6].getMapStartTimes("dueling-beetles"));



var time = (realToTime(Date.now()));
var real1 = Date.now();
real1 = Math.floor(real1 / 1000);
var season_seconds = (real1 - first_season_time) % SEASON_SECONDS;


var hour1 = time.toString();
var strings = [hour1,"\t"];

for (var i=0;i<events2.length;i++){
    strings.push(events2[i].getCurrentGameMode(time[1]).displayName);

    var mapname = events2[i].getCurrentGameMap(time[1]).displayName;
    strings.push(mapname);

    var maptime = events2[i].getEventTimeLeft(season_seconds);
    strings.push(maptime.toString());
        
    strings.push(" | ");
}
console.log.apply(console,strings);


strings = [" ","\t"];
for (var i=0;i<events2.length;i++){
    strings.push(events2[i].getCurrentGameMode(time[1]+events2[i].eventDuration).displayName);

    var mapname = events2[i].getCurrentGameMap(time[1]+events2[i].eventDuration).displayName;
    strings.push(mapname);

    var maptime = events2[i].getEventTimeLeft(season_seconds);
    strings.push(maptime.toString());
        
    strings.push(" | ");
}
console.log.apply(console,strings);


console.log(events2[3].getMapStartTimes("goldarm-gulch"));
console.log(events2[3].getMapStartTimes("shooting-star"));
console.log(events2[5].getMapStartTimes("shooting-star"));
console.log(events2[6].getMapStartTimes("dueling-beetles"));

*/