import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import server from "../../../frank/index";
import {tables} from "../../../frank/modules/database_access";
import {createConnection, closeConnection, tokens, sampleGameReport, GAME_VERSION} from "../database_setup";

const TEST_TOKEN = tokens.report;
const TEST_USERNAME = "report";
const TEST_CHALLENGE_ID = "test";

const reportMode0 = sampleGameReport.slice();
const reportMode2 = sampleGameReport.slice();
// Game mode = 2
reportMode2[0] = 2;

// Expected rewards from reports
const report0Mastery = reportMode0[1] * 240;
const report0Coins = 1600;
const report2Mastery = reportMode2[1] * 6;
const report2Coins = 0;

describe("Game Report endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, characters, accessories) VALUES (?, ?, ?, ?);`,
            [TEST_USERNAME, "", Buffer.alloc(1), Buffer.alloc(1)]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/report", function(){
        // Report end times must be increasing
        let END_TIME = Date.now() - 60000;

        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
            await connection.query(
                `INSERT INTO ${tables.challenges} (active_key, challengeid, accepted, accepted_by) VALUES
                (?, ?, ?, ?),
                (?, ?, ?, ?),
                (?, ?, ?, ?);`,
                [
                    // Used for the valid report
                    "test1", TEST_CHALLENGE_ID, 1, TEST_USERNAME,
                    // Used for challenge not accepted
                    "test2", TEST_CHALLENGE_ID, 0, "",
                    // Used for user started the challenge does not exist
                    "test3", TEST_CHALLENGE_ID, 1, "some other user"
                ]
            );
        });

        it("Valid report from classic mode", async function(){
            const [initial] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );

            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, END_TIME++, reportMode0]});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["message", "coins", "mastery"]);
            expect(res.body.message).to.equal("Score successfully saved.");
            expect(res.body.mastery).to.equal(report0Mastery);
            expect(res.body.coins).to.equal(report0Coins);

            const [results] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );

            expect(results[0].mastery).to.equal(initial[0].mastery + report0Mastery);
            expect(results[0].coins).to.equal(initial[0].coins + report0Coins);
        });

        it("Valid report from challenge", async function(){
            const [initial] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );

            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: "ignore", key: "test1", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["message", "coins", "mastery"]);
            expect(res.body.message).to.equal("Score successfully saved.");
            expect(res.body.mastery).to.equal(report2Mastery);
            expect(res.body.coins).to.equal(report2Coins);

            const [results] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            expect(results[0].mastery).to.equal(initial[0].mastery + report2Mastery);
            expect(results[0].coins).to.equal(initial[0].coins + report2Coins);
        });

        it("Invalid report", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [0]});
            expect(res).to.have.status(403);
            expect(res.body.message).to.equal("Invalid report.");
        });

        it("No username provided", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({report: [GAME_VERSION, END_TIME++, reportMode0]});
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Username is missing.");
        });

        it("No challenge key provided", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal("Username is missing.");
        });

        it("Challenge from report not accepted", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test2", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(403);
            expect(res.body.message).to.equal("This challenge has not been accepted yet.");
        });

        it("User does not exist for classic mode report", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: "ignore", report: [GAME_VERSION, END_TIME++, reportMode0]});
            expect(res).to.have.status(404);
            expect(res.body.message).to.equal("User who started this game was not found.");
        });

        it("User does not exist for challenge report", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test3", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(404);
            expect(res.body.message).to.equal("User who started this game was not found.");
        });

        it("Same report already saved", async function(){
            const [initial] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );

            const time = END_TIME++;
            // Attempt to save the same report two times in a row

            // The first attempt should succeed
            const res1 = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, time, reportMode0]});
            expect(res1).to.have.status(200);
            expect(res1.body.message).to.equal("Score successfully saved.");

            // The second attempt should fail
            const res2 = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, time, reportMode0]});
            expect(res2).to.have.status(403);
            expect(res2.body.message).to.equal("Cannot save the same game more than once.");

            // The mastery and coins should not be added twice
            const [results] = await connection.query(
                `SELECT mastery, coins FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            expect(results[0].mastery).to.equal(initial[0].mastery + report0Mastery);
            expect(results[0].coins).to.equal(initial[0].coins + report0Coins);
        });

        it("Content type not json", async function(){
            const res = await chai.request(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
            .send(JSON.stringify([GAME_VERSION, END_TIME++, reportMode0])).set("Content-Type", "text/plain");
            //console.log(res.text);
            expect(res).to.have.status(403);
            expect(res.body.message).to.equal("Invalid report.");
        });
    });
});
