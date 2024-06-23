import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR} from "../../bull/data/constants";
import server from "../../bull/index";
import {createConnection, closeConnection, tables} from "../database_setup";

const TEST_USERNAME_CREATE = "tradesCreate";
const TEST_USERNAME_ACCEPT = "tradesAccept";

describe("Trade Viewing endpoints", function(){
    let connection: Connection;

    const validOffer = [
        {brawler: "bull", pin: "bull_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}
    ];
    const validRequest = [
        {brawler: "ash", pin: "ash_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}
    ];

    before(async function(){
        connection = await createConnection();

        await connection.query(`DELETE FROM ${tables.trades};`);
        await connection.query(`INSERT INTO ${tables.trades} (tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration) VALUES
            (?, ?, "", "", ?, ?, ?, ?),
            (?, ?, "", "", ?, ?, ?, ?),
            (?, ?, "", "", ?, ?, ?, ?);`,
            [
                1, TEST_USERNAME_CREATE, JSON.stringify(validOffer), JSON.stringify(validRequest), 10, Date.now() + 3600000,
                2, TEST_USERNAME_CREATE, JSON.stringify(validRequest), JSON.stringify(validOffer), 20, Date.now() + 3600000,
                3, "some other user", JSON.stringify([]), JSON.stringify([]), 30, Date.now() + 350000,
            ]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/trade/id", function(){
        it("Trade exists", async function(){
            const res = await chai.request(server).get("/trade/id").query({tradeid: 1});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys([
                "creator", "cost", "offer", "request",
                "timeLeft", "accepted", "acceptedBy"
            ]);

            expect(res.body.creator).to.have.keys(["username", "avatar", "avatarColor"]);

            expect(res.body.offer).to.be.an("array");
            expect(res.body.request).to.be.an("array");
            expect(res.body.offer).to.have.lengthOf(1);
            expect(res.body.request).to.have.lengthOf(1);

            expect(res.body.creator.username).to.equal(TEST_USERNAME_CREATE);
            expect(res.body.cost).to.equal(1);
            expect(res.body.offer[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validOffer[0].brawler}/${validOffer[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(res.body.request[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validRequest[0].brawler}/${validRequest[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(res.body.accepted).to.be.false;
            expect(res.body.acceptedBy).to.equal("");
        });

        it("Trade does not exist", async function(){
            const res = await chai.request(server).get("/trade/id").query({tradeid: 69});
            expect(res).to.have.status(404);
        });

        it("Invalid trade ID", async function(){
            const res = await chai.request(server).get("/trade/id").query({tradeid: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid Trade ID.");
        });
    });

    describe("/trade/user", function(){
        it("User has trades", async function(){
            const res = await chai.request(server).post("/trade/user").send({username: TEST_USERNAME_CREATE});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(2);

            for (let x = 0; x < res.body.length; x++){
                expect(res.body[x]).to.be.an("object");
                expect(res.body[x]).to.have.keys(["tradeid", "cost", "offer", "request", "timeLeft", "accepted"]);
            }

            const trade = res.body[0]
            expect(trade.tradeid).to.equal(1);
            expect(trade.cost).to.equal(1);
            expect(trade.offer[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validOffer[0].brawler}/${validOffer[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(trade.request[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validRequest[0].brawler}/${validRequest[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(trade.accepted).to.be.false;
        });

        it("User has no trades", async function(){
            const res = await chai.request(server).post("/trade/user").send({username: TEST_USERNAME_ACCEPT});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(0);
        });

        it("No username provided", async function(){
            const res = await chai.request(server).post("/trade/user").send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("No username provided.");
        });
    });

    describe("/trade/all", function(){
        it("No search filters", async function(){
            const res = await chai.request(server).post("/trade/all").send({});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(3);

            for (let x = 0; x < res.body.length; x++){
                expect(res.body[x]).to.be.an("object");
                expect(res.body[x]).to.have.keys(["tradeid", "creator", "cost", "offer", "request", "timeLeft"])
            }

            // With no search filters, trade 1 should be included in the results
            const trade = res.body.find((value: {tradeid: number;}) => value.tradeid === 1)!;
            expect(trade).to.exist;
            expect(trade.tradeid).to.equal(1);
            expect(trade.creator.username).to.equal(TEST_USERNAME_CREATE);
            expect(trade.cost).to.equal(1);
            expect(trade.offer[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validOffer[0].brawler}/${validOffer[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(trade.request[0].pinImage).to.equal(`${PIN_IMAGE_DIR}${validRequest[0].brawler}/${validRequest[0].pin}${IMAGE_FILE_EXTENSION}`);
        });

        it("Sort by expiring soon", async function(){
            const res = await chai.request(server).post("/trade/all").send({sortMethod: "lowtime"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(3);
            expect(res.body[0].tradeid).to.equal(3);
        });

        it("Sort by lowest cost", async function(){
            const res = await chai.request(server).post("/trade/all").send({sortMethod: "lowcost"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(3);
            expect(res.body[0].tradeid).to.equal(1);
        });

        it("Sort by highest cost", async function(){
            const res = await chai.request(server).post("/trade/all").send({sortMethod: "highcost"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(3);
            expect(res.body[0].tradeid).to.equal(3);
        });

        it("Filter offer by brawler", async function(){
            const res = await chai.request(server).post("/trade/all").send({brawler: "bull"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].tradeid).to.equal(1);
        });

        it("Filter offer by pin", async function(){
            const res = await chai.request(server).post("/trade/all").send({pin: "bull_default"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].tradeid).to.equal(1);
        });

        it("Filter matches no trades", async function(){
            const res = await chai.request(server).post("/trade/all").send({pin: "frank_default"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(0);
        });
    });
});
