import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import allSkins from "../../bull/data/brawlers_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR} from "../../bull/data/constants";
import server from "../../bull/index";
import {TradePin} from "../../bull/types";
import {tables} from "../../bull/modules/database";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN_CREATE = tokens.tradesCreate;
const TEST_USERNAME_CREATE = "tradesCreate";
const TEST_TOKEN_ACCEPT = tokens.tradesAccept;
const TEST_USERNAME_ACCEPT = "tradesAccept";

describe("Trade Modification endpoints", function(){
    let connection: Connection;

    const validOffer = [
        {brawler: "bull", pin: "bull_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}
    ];
    const validRequest = [
        {brawler: "ash", pin: "ash_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}
    ];

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item, trade_credits) VALUES
            (?, "", "", ?, "[]", "[]", "[]", "[]", "[]", "", ?),
            (?, "", "", ?, "[]", "[]", "[]", "[]", "[]", "", ?);`,
            [
                TEST_USERNAME_CREATE, JSON.stringify({bull: {"bull_default": 1, "bull_facepalm": 535}, ash: {}}), 15,
                TEST_USERNAME_ACCEPT, JSON.stringify({bull: {}, ash: {"ash_default": 5}}), 15
            ]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/trade/create", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.trades};`);
            await connection.query(`ALTER TABLE ${tables.trades} AUTO_INCREMENT = 1;`);
        });

        it("Valid trade", async function(){
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: validOffer, request: validRequest, searchByName: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.key("tradeid");
        });

        it("Trade duration too long", async function(){
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: validOffer, request: validRequest, searchByName: true, tradeDurationHours: 1656});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Cannot create trades outside the range of 1 - 336 hours.");
        });

        it("Missing offer and request", async function(){
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({searchByName: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Offer or request is missing.");
        });

        it("Too many pins in offer or request", async function(){
            const manyPinsBrawler = allSkins.find((value) => value.pins.length >= 11);
            let invalidTrade: TradePin[] = [];

            if (manyPinsBrawler !== undefined){
                invalidTrade = manyPinsBrawler.pins.map((value) => (
                    {brawler: manyPinsBrawler.name, pin: value.name, amount: 1}
                ));
            }
            expect(invalidTrade).to.have.lengthOf.at.least(11);

            const res1 = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: invalidTrade, request: [], searchByName: true});
            expect(res1).to.have.status(400);
            expect(res1.text).to.equal("Too many pins in request or offer.");

            const res2 = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: [], request: invalidTrade, searchByName: true});
            expect(res2).to.have.status(400);
            expect(res2.text).to.equal("Too many pins in request or offer.");
        });

        it("No pins in both offer and request", async function(){
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: [], request: [], searchByName: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Trade does not contain any pins being exchanged.");
        });

        it("Same pin in both offer and request", async function(){
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: validOffer, request: validOffer, searchByName: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Cannot have the same pin in both offer and request.");
        });

        it("Not enough trade credits", async function(){
            const expensiveTrade = [
                {brawler: "bull", pin: "bull_facepalm", amount: 535}
            ];
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: expensiveTrade, request: validRequest, searchByName: true});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Not enough Trade Credits. Open Brawl Boxes to get more.");
        });

        it("Not enough copies of pin being offered", async function(){
            const notEnoughPins = [
                {brawler: "bull", pin: "bull_default", amount: 2}
            ];
            const res = await chai.request(server).post("/trade/create").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({offer: notEnoughPins, request: validRequest, searchByName: true});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not have enough copies of the pins required to create this trade.");
        });
    });

    describe("/trade/accept", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.trades};`);
            await connection.query(`INSERT INTO ${tables.trades} (tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration) VALUES
                (?, ?, "", "", ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?);`,
                [
                    // Used for the valid trade
                    1, TEST_USERNAME_CREATE, JSON.stringify(validOffer), JSON.stringify(validRequest), 10, Date.now() + 3600000,
                    // Used for accepting own trade
                    2, TEST_USERNAME_ACCEPT, JSON.stringify([]), JSON.stringify([]), 10, Date.now() + 3600000,
                    // Used for not enough trade credits
                    3, TEST_USERNAME_CREATE, JSON.stringify(validOffer), JSON.stringify(validRequest), 10000, Date.now() + 3600000,
                    // Used for not enough pins
                    4, TEST_USERNAME_CREATE, JSON.stringify(validOffer),
                    JSON.stringify([{brawler: "ash", pin: "ash_default", amount: 10, rarityValue: 0, rarityColor: "#000000"}]),
                    10, Date.now() + 3600000,
                    // Used for brawler not unlocked
                    5, TEST_USERNAME_CREATE,
                    JSON.stringify([{brawler: "frank", pin: "frank_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}]),
                    JSON.stringify(validRequest), 10, Date.now() + 3600000
                ]
            );
        });

        it("Valid trade", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 1});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(1);

            expect(res.body[0]).to.be.an("object");
            expect(res.body[0]).to.have.keys(["pinImage", "amount", "rarityValue", "rarityColor"]);
            expect(res.body[0].pinImage).to.equal(PIN_IMAGE_DIR + "bull/bull_default" + IMAGE_FILE_EXTENSION);
            expect(res.body[0].amount).to.equal(1);
            expect(res.body[0].rarityValue).to.equal(0);
            expect(res.body[0].rarityColor).to.equal("#000000");
        });

        it("No trade ID provided", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Trade ID is missing.");
        });

        it("Accepting own trade", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 2});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("You cannot accept your own trade!");
        });

        it("Not enough trade credits", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 3});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Not enough Trade Credits. Open Brawl Boxes to get more.");
        });

        it("Not enough copies of pin being requested", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 4});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not have enough copies of the pins required to accept this trade.");
        });

        it("Accepted pin brawler not unlocked", async function(){
            const res = await chai.request(server).post("/trade/accept").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 5});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not have the necessary brawlers unlocked to accept the trade.");
        });
    });

    describe("/trade/close", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.trades};`);
            await connection.query(`INSERT INTO ${tables.trades} (tradeid, creator, creator_avatar, creator_color, offer, request, trade_credits, expiration, accepted, accepted_by) VALUES
                (?, ?, "", "", ?, ?, ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?, ?, ?),
                (?, ?, "", "", ?, ?, ?, ?, ?, ?);`,
                [
                    // Used for the completed trade
                    1, TEST_USERNAME_CREATE, JSON.stringify(validOffer), JSON.stringify(validRequest), 10, Date.now() + 3600000, 1, TEST_USERNAME_ACCEPT,
                    // Used for the cancelled trade
                    2, TEST_USERNAME_CREATE, JSON.stringify(validOffer), JSON.stringify(validRequest), 10, Date.now() - 3600000, 0, "",
                    // Used for not the creator and brawler not unlocked
                    3, TEST_USERNAME_CREATE, JSON.stringify(validOffer),
                    JSON.stringify([{brawler: "frank", pin: "frank_default", amount: 1, rarityValue: 0, rarityColor: "#000000"}]),
                    10, Date.now() + 3600000, 1, TEST_USERNAME_ACCEPT
                ]
            );
        });

        it("Complete trade", async function(){
            const res = await chai.request(server).post("/trade/close").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({tradeid: 1});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["complete", "acceptedBy", "pins"]);

            expect(res.body.complete).to.be.true;
            expect(res.body.acceptedBy).to.equal(TEST_USERNAME_ACCEPT);
            expect(res.body.pins).to.be.an("array");
            expect(res.body.pins).to.have.lengthOf(1);

            // The trade was successful so the user should get the pin in the request
            const pin0 = res.body.pins[0];
            expect(pin0).to.be.an("object");
            expect(pin0).to.have.keys(["pinImage", "amount", "rarityValue", "rarityColor"]);
            expect(pin0.pinImage).to.equal(`${PIN_IMAGE_DIR}${validRequest[0].brawler}/${validRequest[0].pin}${IMAGE_FILE_EXTENSION}`);
            expect(pin0.amount).to.equal(1);
            expect(pin0.rarityValue).to.equal(0);
            expect(pin0.rarityColor).to.equal("#000000");
        });
        it("Cancelled trade", async function(){
            const res = await chai.request(server).post("/trade/close").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({tradeid: 2});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["complete", "acceptedBy", "pins"]);

            expect(res.body.complete).to.be.false;
            expect(res.body.acceptedBy).to.equal("");
            expect(res.body.pins).to.be.an("array");
            expect(res.body.pins).to.have.lengthOf(1);

            // The trade was unsuccessful so the user should get refunded the pin in the offer
            const pin0 = res.body.pins[0];
            expect(pin0).to.be.an("object");
            expect(pin0).to.have.keys(["pinImage", "amount", "rarityValue", "rarityColor"]);
            expect(pin0.pinImage).to.equal(PIN_IMAGE_DIR + "bull/bull_default" + IMAGE_FILE_EXTENSION);
            expect(pin0.amount).to.equal(1);
            expect(pin0.rarityValue).to.equal(0);
            expect(pin0.rarityColor).to.equal("#000000");
        });

        it("No trade ID provided", async function(){
            const res = await chai.request(server).post("/trade/close").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Trade ID is missing.");
        });

        it("Not the creator of the trade", async function(){
            const res = await chai.request(server).post("/trade/close").auth(TEST_TOKEN_ACCEPT, {type: "bearer"})
            .send({tradeid: 3});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("You did not create this trade!");
        });

        it("Accepted pin brawler not unlocked", async function(){
            const res = await chai.request(server).post("/trade/close").auth(TEST_TOKEN_CREATE, {type: "bearer"})
            .send({tradeid: 3});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not have the necessary brawlers unlocked to accept the trade.");
        });
    });
});
