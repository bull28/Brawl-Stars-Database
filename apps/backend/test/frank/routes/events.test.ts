import chai, {expect} from "chai";
import "chai-http";
import server from "../../../frank/index";
import {events} from "../../../frank/modules/events_module";

describe("Game Modes and Maps endpoints", function(){
    it("/events/current", async function(){
        const res = await chai.request(server).get("/events/current");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["time", "events"]);
    });

    describe("/events/seasontime", async function(){
        it("Valid season time query", async function(){
            const res = await chai.request(server).get("/events/seasontime").query({hour: 0, minute: 0, second: 0});
            expect(res).to.have.status(200);
        });

        it("Missing some values", async function(){
            const res = await chai.request(server).get("/events/seasontime").query({hour: 0});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Invalid inputs", async function(){
            const res = await chai.request(server).get("/events/seasontime").query({hour: "", minute: "", second: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/events/seasontime");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });

    describe("/events/later", async function(){
        it("Valid season time query", async function(){
            const res = await chai.request(server).get("/events/later").query({hour: 0, minute: 0, second: 0});
            expect(res).to.have.status(200);
        });

        it("Missing some values", async function(){
            const res = await chai.request(server).get("/events/later").query({hour: 0});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Invalid inputs", async function(){
            const res = await chai.request(server).get("/events/later").query({hour: "", minute: "", second: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/events/later");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });

    describe("/event/worldtime", async function(){
        it("Valid world time query", async function(){
            const res = await chai.request(server).get("/events/worldtime").query({second: 1700000000000});
            expect(res).to.have.status(200);
        });

        it("Invalid input", async function(){
            const res = await chai.request(server).get("/events/worldtime").query({second: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/events/worldtime");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });

    it("/gamemodes", async function(){
        const res = await chai.request(server).get("/gamemodes");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");

        for (let x = 0; x < res.body.length; x++){
            expect(res.body[x]).to.have.keys(["name", "displayName"]);
        }
    });

    describe("/gamemodes/:gamemode", function(){
        it("Game mode exists", async function(){
            const res = await chai.request(server).get("/gamemodes/brawlball");
            expect(res).to.have.status(200);
        });

        it("Game mode does not exist", async function(){
            const res = await chai.request(server).get("/gamemodes/not-a-gamemode");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Game mode not found.");
        });
    });

    describe("/maps/:map", function(){
        it("Map exists", async function(){
            const res = await chai.request(server).get(`/maps/${events[0].gameModes[0].maps[0].name}`);
            expect(res).to.have.status(200);
        });

        it("Map does not exist", async function(){
            const res = await chai.request(server).get("/maps/not-a-map");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Map not found.");
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
