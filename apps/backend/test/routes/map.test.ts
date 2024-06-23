import chai, {expect} from "chai";
import "chai-http";
import server from "../../bull/index";
import {events} from "../../bull/modules/maps";

describe("Game Modes and Maps endpoints", function(){
    it("/gamemode", async function(){
        const res = await chai.request(server).get("/gamemode");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");

        for (let x = 0; x < res.body.length; x++){
            expect(res.body[x]).to.have.keys(["name", "displayName"]);
        }
    });

    describe("/gamemode/:gamemode", function(){
        it("Game mode exists", async function(){
            const res = await chai.request(server).get("/gamemode/brawlball");
            expect(res).to.have.status(200);
        });

        it("Game mode does not exist", async function(){
            const res = await chai.request(server).get("/gamemode/not-a-gamemode");
            expect(res).to.have.status(404);
        });
    });

    describe("/map/:map", function(){
        it("Map exists", async function(){
            const res = await chai.request(server).get(`/map/${events[0].gameModes[0].maps[0].name}`);
            expect(res).to.have.status(200);
        });

        it("Map does not exist", async function(){
            const res = await chai.request(server).get("/map/not-a-map");
            expect(res).to.have.status(404);
        });
    });

    describe("/mapsearch", function(){
        it("Valid search query", async function(){
            const res = await chai.request(server).get("/mapsearch").query({"search": "a"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf.at.least(1);
        });

        it("No search query provided", async function(){
            const res = await chai.request(server).get("/mapsearch");
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.be.empty;
        });
    });
});
