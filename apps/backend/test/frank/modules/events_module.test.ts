import {expect} from "chai";
import {GAMEMODE_IMAGE_DIR, MAP_IMAGE_DIR, MAP_BANNER_DIR} from "../../../frank/data/constants";
import {
    SeasonTime, 
    mod, 
    isValidTimeQuery, 
    realToTime, 
    addSeasonTimes, 
    subtractSeasonTimes, 
    getModeData, 
    getMapData, 
    events, 
    MAP_CYCLE_HOURS
} from "../../../frank/modules/events_module";

describe("Events, Game Modes, and Maps module", function(){
    it("Must contain at least 1 event slot", function(){
        expect(events).to.have.lengthOf.at.least(1);
    });

    it("Convert a season time to seconds", function(){
        const time = new SeasonTime(0, 24, 1, 9);
        const seconds = time.convertToSeconds();
        expect(seconds).to.equal(86469);

        const newTime = new SeasonTime(0, 0, 0, seconds);
        expect(newTime.convertToSeconds()).to.equal(seconds);
    });

    it("Correctly mod 2 numbers when the first could be negative", function(){
        expect(mod(0, 336)).to.equal(0);
        expect(mod(1, 336)).to.equal(1);
        expect(mod(336, 336)).to.equal(0);
        expect(mod(-1, 336)).to.equal(335);
        expect(mod(-336, 336)).to.equal(0);
    });

    it("Detect when a season time query contains invalid numbers", function(){
        expect(isValidTimeQuery("0", "0", "0")).to.be.true;
        expect(isValidTimeQuery("1", "1", "1")).to.be.true;
        expect(isValidTimeQuery("a", "1", "1")).to.be.false;
        expect(isValidTimeQuery("1", "a", "1")).to.be.false;
        expect(isValidTimeQuery("1", "1", "a")).to.be.false;
        expect(isValidTimeQuery("", "", "")).to.be.false;
    });

    it("Convert a time in seconds to a season time", function(){
        const time = realToTime(1719216000000);
        expect(time).to.have.keys(["season", "hour", "minute", "second", "hoursPerSeason", "maxSeasons"]);
        expect(time.season).to.equal(0);
        expect(time.hour).to.equal(0);
        expect(time.minute).to.equal(0);
        expect(time.second).to.equal(0);
    });

    it("Add 2 season times", function(){
        const time1 = new SeasonTime(0, 126, 28, 6);
        const seconds = time1.convertToSeconds();
        // No carry over
        expect(addSeasonTimes(time1, new SeasonTime(0, 5, 5, 5)).convertToSeconds()).to.equal(seconds + 5 * 3600 + 5 * 60 + 5);
        // Carry over in seconds
        expect(addSeasonTimes(time1, new SeasonTime(0, 0, 0, 58)).convertToSeconds()).to.equal(seconds + 58);
        // Carry over in minutes
        expect(addSeasonTimes(time1, new SeasonTime(0, 0, 58, 0)).convertToSeconds()).to.equal(seconds + 58 * 60);
        // Carry over in hours (to next season)
        const result1 = addSeasonTimes(time1, new SeasonTime(0, MAP_CYCLE_HOURS - 1, 0, 0));
        expect(result1.convertToSeconds()).to.equal(seconds + (MAP_CYCLE_HOURS - 1) * 3600);
        expect(result1.season).to.equal(time1.season + 1);
        // Carry over in all places
        const result2 = addSeasonTimes(new SeasonTime(0, MAP_CYCLE_HOURS - 3, 50, 55), new SeasonTime(0, 5, 15, 15));
        expect(result2.season).to.equal(1);
        expect(result2.hour).to.equal(3);
        expect(result2.minute).to.equal(6);
        expect(result2.second).to.equal(10);
    });

    it("Subtract 2 season times", function(){
        const time1 = new SeasonTime(1, 126, 28, 6);
        const seconds = time1.convertToSeconds();
        // No carry over
        expect(subtractSeasonTimes(time1, new SeasonTime(0, 5, 5, 5)).convertToSeconds()).to.equal(seconds - 5 * 3600 - 5 * 60 - 5);
        // Carry over in seconds
        expect(subtractSeasonTimes(time1, new SeasonTime(0, 0, 0, 58)).convertToSeconds()).to.equal(seconds - 58);
        // Carry over in minutes
        expect(subtractSeasonTimes(time1, new SeasonTime(0, 0, 58, 0)).convertToSeconds()).to.equal(seconds - 58 * 60);
        // Carry over in hours (to previous season)
        const result1 = subtractSeasonTimes(time1, new SeasonTime(0, MAP_CYCLE_HOURS - 1, 0, 0));
        expect(result1.convertToSeconds()).to.equal(seconds - (MAP_CYCLE_HOURS - 1) * 3600);
        expect(result1.season).to.equal(time1.season - 1);
        // Carry over in all places
        const result2 = subtractSeasonTimes(new SeasonTime(1, 4, 10, 19), new SeasonTime(0, 5, 20, 21));
        expect(result2.season).to.equal(0);
        expect(result2.hour).to.equal(MAP_CYCLE_HOURS - 2);
        expect(result2.minute).to.equal(49);
        expect(result2.second).to.equal(58);
    });

    it("Get data for a game mode", function(){
        const gameMode = events[0].gameModes[0];
        const data = getModeData(events, gameMode.name)!;

        expect(data).to.be.an("object");
        expect(data).to.have.keys(["name", "displayName", "data", "maps"]);
        expect(data.data).to.have.keys(["image", "backgroundColor", "textColor"]);

        expect(data.name).to.equal(gameMode.name);
        expect(data.displayName).to.equal(gameMode.displayName);
        expect(data.data.image).to.equal(GAMEMODE_IMAGE_DIR + gameMode.data.image);
        expect(data.data.backgroundColor).to.equal(gameMode.data.backgroundColor);
        expect(data.data.textColor).to.equal(gameMode.data.textColor);

        expect(data.maps).to.be.an("array");
        expect(data.maps).to.have.lengthOf(gameMode.maps.length);

        for (let x = 0; x < data.maps.length; x++){
            expect(data.maps[x]).to.have.keys(["name", "displayName"]);
            expect(data.maps[x].name).to.equal(gameMode.maps[x].name);
            expect(data.maps[x].displayName).to.equal(gameMode.maps[x].displayName);
        }
    });

    it("Get data for a map", function(){
        expect(events[0].gameModes[0].maps).to.have.lengthOf.at.least(1);

        const map = events[0].gameModes[0].maps[0];
        const data = getMapData(events, map.name, new SeasonTime(0, 0, 0, 0))!;

        expect(data).to.be.an("object");
        expect(data).to.have.keys(["name", "displayName", "gameMode", "powerLeagueMap", "image", "bannerImage", "times"]);
        expect(data.gameMode).to.have.keys(["name", "image", "backgroundColor", "textColor"]);
        expect(data.times).to.have.keys(["all", "next", "duration"]);

        expect(data.name).to.equal(map.name);
        expect(data.displayName).to.equal(map.displayName);
        expect(data.powerLeagueMap).to.equal(map.powerLeagueMap);
        expect(data.image).to.equal(`${MAP_IMAGE_DIR}${events[0].gameModes[0].name}/${map.image}`);
        expect(data.bannerImage).to.equal(MAP_BANNER_DIR + map.bannerImage);

        expect(data.times.duration).to.eql(new SeasonTime(0, events[0].eventDuration, 0, 0));
    });
});
