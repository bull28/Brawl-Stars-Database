import chai, {expect} from "chai";
import "chai-http";
import server from "../../frank/index";
import {createError} from "../../frank/modules/utils";

describe("FRANK API", function(){
    it("Make a request to the root endpoint of FRANK API", async function(){
        const res = await chai.request(server).get("/");
        expect(res).to.have.status(200);
        expect(res.text).to.equal("FRANK API");
    });

    it("Make a request to an endpoint that does not exist", async function(){
        const res = await chai.request(server).get("/BULLDARRYLELPRIMOFRANKASHHANK");
        expect(res).to.have.status(404);
        expect(res.body).to.eql(createError("GeneralNotFound"));
    });
});
