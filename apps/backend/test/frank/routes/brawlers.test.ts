import chai, {expect} from "chai";
import "chai-http";
import allSkins from "../../../frank/data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR} from "../../../frank/data/constants";
import server from "../../../frank/index";
import {BrawlerPreview} from "../../../frank/types";

describe("Brawlers and Skins endpoints", function(){
    it("/brawlers", async function(){
        const res = await chai.request(server).get("/brawlers");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(allSkins.length);

        const images = res.body.filter((value: BrawlerPreview) => 
            value.image.startsWith(PORTRAIT_IMAGE_DIR) && value.image.endsWith(IMAGE_FILE_EXTENSION)
        );
        expect(images).to.have.lengthOf(allSkins.length);
    });

    describe("/brawlers/:brawler", function(){
        it("Brawler exists", async function(){
            const res = await chai.request(server).get("/brawlers/bull");
            expect(res).to.have.status(200);
        });

        it("Brawler does not exist", async function(){
            const res = await chai.request(server).get("/brawlers/not-a-brawler");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Brawler not found.");
        });
    });

    describe("/skins/:brawler/:skin", function(){
        it("Brawler and skin exist", async function(){
            const res = await chai.request(server).get(`/skins/bull/bullguydefault`);
            expect(res).to.have.status(200);
        });

        it("Brawler exists but not skin", async function(){
            const res = await chai.request(server).get("/skins/bull/not-a-bull-skin");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Skin not found.");
        });

        it("Both brawler and skin do not exist", async function(){
            const res = await chai.request(server).get("/skins/not-a-brawler/not-a-skin");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Brawler or skin not found.");
        });
    });

    it("/skinsearch GET", async function(){
        const res = await chai.request(server).get("/skinsearch");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["groups", "foundIn"]);

        for (let x = 0; x < res.body.groups.length; x++){
            expect(res.body.groups[x]).to.have.keys(["name", "displayName"]);
        }
        for (let x = 0; x < res.body.foundIn.length; x++){
            expect(res.body.foundIn[x]).to.be.a.string;
        }
    });

    describe("/skinsearch POST", function(){
        it("Valid search", async function(){
            const res = await chai.request(server).post("/skinsearch").send({filters: {}});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["imagePath", "backgroundPath", "results"]);
        });

        it("Invalid filters object", async function(){
            const res = await chai.request(server).post("/skinsearch").send({filters: []});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid filters object.");
        });

        it("Too many skin groups", async function(){
            const res = await chai.request(server).post("/skinsearch")
            .send({filters: {groups: ["1", "2", "3", "4", "5", "6"]}});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Too many skin groups selected. Select at most 5.");
        });
    });
});
