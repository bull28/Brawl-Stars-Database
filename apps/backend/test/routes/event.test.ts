import chai, {expect} from "chai";
import "chai-http";
import server from "../../bull/index";

describe("Game Modes and Maps endpoints", function(){
    it("/event/current", async function(){
        const res = await chai.request(server).get("/event/current");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["time", "events"]);
    });

    describe("/event/seasontime", async function(){
        it("Valid season time query", async function(){
            const res = await chai.request(server).get("/event/seasontime").query({hour: 0, minute: 0, second: 0});
            expect(res).to.have.status(200);
        });

        it("Missing some values", async function(){
            const res = await chai.request(server).get("/event/seasontime").query({hour: 0});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Invalid inputs", async function(){
            const res = await chai.request(server).get("/event/seasontime").query({hour: "", minute: "", second: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/event/seasontime");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });

    describe("/event/later", async function(){
        it("Valid season time query", async function(){
            const res = await chai.request(server).get("/event/later").query({hour: 0, minute: 0, second: 0});
            expect(res).to.have.status(200);
        });

        it("Missing some values", async function(){
            const res = await chai.request(server).get("/event/later").query({hour: 0});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Invalid inputs", async function(){
            const res = await chai.request(server).get("/event/later").query({hour: "", minute: "", second: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/event/later");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });

    describe("/event/worldtime", async function(){
        it("Valid world time query", async function(){
            const res = await chai.request(server).get("/event/worldtime").query({second: 1700000000000});
            expect(res).to.have.status(200);
        });

        it("Invalid input", async function(){
            const res = await chai.request(server).get("/event/worldtime").query({second: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });

        it("Missing entire query", async function(){
            const res = await chai.request(server).get("/event/worldtime");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid input.");
        });
    });
});
