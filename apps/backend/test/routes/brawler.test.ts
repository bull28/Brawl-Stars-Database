import chai, {expect} from "chai";
import "chai-http";
import allSkins from "../../bull/data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PORTRAIT_IMAGE_DIR} from "../../bull/data/constants";
import server from "../../bull/index";
import {BrawlerPreview} from "../../bull/types";

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
});
