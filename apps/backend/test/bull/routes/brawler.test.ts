import chai, {expect} from "chai";
import "chai-http";
import allSkins from "../../../bull/data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR, SKIN_MODEL_DIR} from "../../../bull/data/constants";
import server from "../../../bull/index";
import {BrawlerPreview} from "../../../bull/types";

describe("Brawlers and Skins endpoints", function(){
    it("/brawler", async function(){
        const res = await chai.request(server).get("/brawler");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(allSkins.length);

        const images = res.body.filter((value: BrawlerPreview) => 
            value.image.startsWith(PORTRAIT_IMAGE_DIR) && value.image.endsWith(IMAGE_FILE_EXTENSION)
        );
        expect(images).to.have.lengthOf(allSkins.length);
    });

    describe("/brawler/:brawler", function(){
        it("Brawler exists", async function(){
            const res = await chai.request(server).get("/brawler/bull");
            expect(res).to.have.status(200);
        });

        it("Brawler does not exist", async function(){
            const res = await chai.request(server).get("/brawler/not-a-brawler");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Brawler not found.");
        });
    });

    describe("/skin/:brawler/:skin", function(){
        it("Brawler and skin exist", async function(){
            const res = await chai.request(server).get(`/skin/bull/bullguydefault`);
            expect(res).to.have.status(200);
        });

        it("Brawler exists but not skin", async function(){
            const res = await chai.request(server).get("/skin/bull/not-a-bull-skin");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Skin not found.");
        });

        it("Both brawler and skin do not exist", async function(){
            const res = await chai.request(server).get("/skin/not-a-brawler/not-a-skin");
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Brawler or skin not found.");
        });
    });

    it("/models", async function(){
        const res = await chai.request(server).get("/models");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(allSkins.length);

        for (let x = 0; x < res.body.length; x++){
            expect(res.body[x]).to.have.keys(["name", "displayName", "image", "skins"]);
            expect(res.body[x].image.startsWith(PORTRAIT_IMAGE_DIR) && res.body[x].image.endsWith(IMAGE_FILE_EXTENSION)).to.be.true;

            for (let y = 0; y < res.body[x].skins.length; y++){
                const skin = res.body[x].skins[y];
                expect(skin).to.have.keys(["displayName", "geometry", "winAnimation", "loseAnimation"]);
                expect(skin.geometry.startsWith(SKIN_MODEL_DIR)).to.be.true;
                // Animations should either exist or be empty strings
                expect(skin.winAnimation.startsWith(SKIN_MODEL_DIR) || skin.winAnimation === "").to.be.true;
                expect(skin.loseAnimation.startsWith(SKIN_MODEL_DIR) || skin.loseAnimation === "").to.be.true;
            }
        }
    });

    it("/skingroups", async function(){
        const res = await chai.request(server).get("/skingroups");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    it("/skinfoundin", async function(){
        const res = await chai.request(server).get("/skinfoundin");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    describe("/skinsearch", function(){
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
