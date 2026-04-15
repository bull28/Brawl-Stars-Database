import {expect} from "chai";
import {request} from "chai-http";
import server from "../../bull/index";

describe("FRANK API", function(){
    it("Make a request to the root endpoint of FRANK API", async function(){
        const res = await request.execute(server).get("/");
        expect(res).to.have.status(200);
        expect(res.text).to.equal("FRANK API");
    });

    it("Make a request to an endpoint that does not exist", async function(){
        const res = await request.execute(server).get("/BULLDARRYLELPRIMOFRANKASHHANK");
        expect(res).to.have.status(404);
        expect(res.text).to.equal("Not Found");
    });
});
