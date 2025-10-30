import {expect} from "chai";
import {GAMEMODE_IMAGE_DIR, MAP_IMAGE_DIR, MAP_BANNER_DIR} from "../../../frank/data/constants";
import {mod, realToTime, getModeData, getMapData, events} from "../../../frank/modules/events_module";

describe("Events, Game Modes, and Maps module", function(){
    it("Must contain at least 1 event slot", function(){
        expect(events).to.have.lengthOf.at.least(1);
    });

    it("Correctly mod 2 numbers when the first could be negative", function(){
        expect(mod(0, 336)).to.equal(0);
        expect(mod(1, 336)).to.equal(1);
        expect(mod(336, 336)).to.equal(0);
        expect(mod(-1, 336)).to.equal(335);
        expect(mod(-336, 336)).to.equal(0);
    });

    it("Convert a time in milliseconds to a season time", function(){
        const ms = 1719216000000;
        const time = realToTime(1719216000000);
        expect(time).to.equal(Math.floor(ms / 1000));
    });

    it("Get data for a game mode", function(){
        const gameMode = events[0].gameModes[0];
        const data = getModeData(gameMode.name)!;

        expect(data).to.be.an("object");
        expect(data).to.have.keys(["name", "displayName", "data", "maps"]);
        expect(data.data).to.have.keys(["image", "backgroundColor", "textColor"]);

        expect(data.name).to.equal(gameMode.name);
        expect(data.displayName).to.equal(gameMode.displayName);
        expect(data.data.image).to.equal(GAMEMODE_IMAGE_DIR + gameMode.data.image);
        expect(data.data.backgroundColor).to.equal(gameMode.data.backgroundColor);
        expect(data.data.textColor).to.equal(gameMode.data.textColor);

        expect(data.maps).to.be.an("array");

        for (let x = 0; x < data.maps.length; x++){
            expect(data.maps[x]).to.have.keys(["name", "displayName"]);
        }
    });

    it("Get data for a map", function(){
        expect(events[0].rotation).to.have.lengthOf.at.least(1);

        const map = events[0].rotation[0];
        const data = getMapData(map.name, events[0].startTime * 1000)!;

        expect(data).to.be.an("object");
        expect(data).to.have.keys(["name", "displayName", "gameMode", "rankedMap", "image", "bannerImage", "nextStart"]);
        expect(data.gameMode).to.have.keys(["name", "image", "backgroundColor", "textColor"]);

        expect(data.name).to.equal(map.name);
        expect(data.displayName).to.equal(map.displayName);
        expect(data.rankedMap).to.equal(map.rankedMap);
        expect(data.image).to.equal(`${MAP_IMAGE_DIR}${events[0].gameModes[0].name}/${map.image}`);
        expect(data.bannerImage).to.equal(MAP_BANNER_DIR + map.bannerImage);
        expect(data.nextStart).to.equal(0);
    });
});
