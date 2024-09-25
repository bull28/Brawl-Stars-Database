import chai, {expect} from "chai";
import "chai-http";
import server from "../../bull/index";

describe("Bullgame endpoints", function(){
    it("/bullgame GET", async function(){
        const res = await chai.request(server).get("/bullgame");
        expect(res).to.have.status(200);
        expect(res).to.have.header("Content-Type", /text\/html/);
    });

    describe("/bullgame POST", function(){
        it("Valid game modification", async function(){
            const res = await chai.request(server).post("/bullgame")
            .send({data: JSON.stringify({options: {gameName: "Test"}})});
            expect(res).to.have.status(200);
            expect(res).to.have.header("Content-Type", /text\/html/);
        });

        it("Invalid game modification", async function(){
            const res = await chai.request(server).post("/bullgame")
            .send({data: false});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Invalid game modification provided.");
        });

        it("Missing game modification", async function(){
            const res = await chai.request(server).post("/bullgame")
            .send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("No game modification provided.");
        });
    });
});
