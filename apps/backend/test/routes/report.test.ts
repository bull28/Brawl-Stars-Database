import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {DEFAULT_REPORT_COST} from "../../bull/data/constants";
import server from "../../bull/index";
import {tables} from "../../bull/modules/database";
import {createConnection, closeConnection, tokens, sampleGameReport, GAME_VERSION} from "../database_setup";

const TEST_TOKEN = tokens.report;
const TEST_TOKEN_OTHER_USER = tokens.account;
const TEST_USERNAME = "report";

const reportMode0 = sampleGameReport.slice();
const reportMode2 = sampleGameReport.slice();
// Game mode = 2, strength = 1000
reportMode2[0] = 2;
reportMode2[1] = 1000;

describe("Game Report endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES
            (?, "", "", "{}", "[]", "[]", "[]", "[]", "[]", "");`, [TEST_USERNAME]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/report/save", function(){
        // Report end times must be increasing
        let END_TIME = Date.now() - 60000;

        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
            await connection.query(
                `INSERT INTO ${tables.challenges} (challengeid, username, strength, stats, waves) VALUES
                (?, ?, ?, "", ""),
                (?, ?, ?, "", "");`,
                [
                    1, "BULL", 1000,
                    2, "BULL", 1069
                ]
            );
            await connection.query(`DELETE FROM ${tables.activechallenges};`);
            await connection.query(
                `INSERT INTO ${tables.activechallenges} (active_key, challengeid, accepted, accepted_by) VALUES
                (?, ?, ?, ?),
                (?, ?, ?, ?),
                (?, ?, ?, ?),
                (?, ?, ?, ?);`,
                [
                    // Used for the valid report
                    "test1", 1, 1, TEST_USERNAME,
                    // Used for challenge not accepted
                    "test2", 1, 0, "",
                    // Used for strength not matching
                    "test3", 2, 1, TEST_USERNAME,
                    // Used for user started the challenge does not exist
                    "test4", 1, 1, "some other user"
                ]
            );
        });

        it("Valid report from classic mode", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, END_TIME++, reportMode0]});
            expect(res).to.have.status(200);
            expect(res.text).to.equal("Score successfully saved.");
        });

        it("Valid report from challenge", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test1", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(200);
            expect(res.text).to.equal("Score successfully saved.");
        });

        it("Invalid report", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [0]});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Invalid report.");
        });

        it("No username provided", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({report: [GAME_VERSION, END_TIME++, reportMode0]});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username is missing.");
        });

        it("Challenge from report not accepted", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test2", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("This challenge has not been accepted yet.");
        });

        it("Challenge strength does not match report", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test3", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("Invalid report.");
        });

        it("User who started the challenge does not exist", async function(){
            const res = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test4", report: [GAME_VERSION, END_TIME++, reportMode2]});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Could not find the user.");
        });

        it("Same report already saved", async function(){
            const time = END_TIME++;
            // Attempt to save the same report two times in a row

            // The first attempt should succeed
            const res1 = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, time, reportMode0]});
            expect(res1).to.have.status(200);
            expect(res1.text).to.equal("Score successfully saved.");

            // The second attempt should fail
            const res2 = await chai.request(server).post("/report/save").auth(TEST_TOKEN, {type: "bearer"})
            .send({username: TEST_USERNAME, report: [GAME_VERSION, time, reportMode0]});
            expect(res2).to.have.status(403);
            expect(res2.text).to.equal("Cannot save the same game more than once.");
        });
    });

    describe("/report/all", function(){
        const END_TIME = Date.now() - 60000;

        before(async function(){
            await connection.query(`DELETE FROM ${tables.reports};`);
            await connection.query(
                `INSERT INTO ${tables.reports} (reportid, username, end_time, version, title, stats) VALUES
                (?, ?, ?, ?, ?, ?);`, [1, TEST_USERNAME, END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify(reportMode0)]
            );
        });

        it("User has saved reports", async function(){
            const res = await chai.request(server).get("/report/all").auth(TEST_TOKEN, {type: "bearer"})

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]).to.have.keys(["reportid", "endTime", "cost", "title", "stats"]);

            expect(res.body[0].reportid).to.equal(1);
            expect(res.body[0].endTime).to.equal(END_TIME);
            expect(res.body[0].cost).to.equal(DEFAULT_REPORT_COST);
            expect(res.body[0].title).to.equal("Test Challenge");
        });

        it("User does not have saved reports", async function(){
            const res = await chai.request(server).get("/report/all").auth(TEST_TOKEN_OTHER_USER, {type: "bearer"})
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(0);
        });
    });

    describe("/report/claim", function(){
        const END_TIME = Date.now() - 60000;

        before(async function(){
            await connection.query(`DELETE FROM ${tables.reports};`);
            await connection.query(
                `INSERT INTO ${tables.reports} (reportid, username, end_time, version, title, stats) VALUES
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?);`,
                [
                    // Used for claiming all rewards
                    2, TEST_USERNAME, END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify(reportMode0),
                    // Used for claiming mastery only
                    3, TEST_USERNAME, END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify(reportMode0),
                    // Used for claiming other user's report
                    4, "some other user", END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify(reportMode0),
                    // Used for invalid report stats
                    5, TEST_USERNAME, END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify([0]),
                    // Used for not enough tokens
                    6, TEST_USERNAME, END_TIME, GAME_VERSION, "Test Challenge", JSON.stringify(reportMode0),
                ]
            );
        });

        it("Claiming all rewards", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?;`, [DEFAULT_REPORT_COST, TEST_USERNAME]);

            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 2, claim: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["resources", "badges"]);
            expect(res.body.resources).to.be.an("array");
            expect(res.body.badges).to.be.an("array");

            // The resource rewards are random but must include at least mastery and coins
            expect(res.body.resources).to.have.lengthOf.at.least(2);
        });

        it("Claiming mastery only", async function(){
            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 3, claim: false});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["resources", "badges"]);
            expect(res.body.resources).to.be.an("array");
            expect(res.body.badges).to.be.an("array");

            // The only resource reward should be mastery
            expect(res.body.resources).to.have.lengthOf(1);
            expect(res.body.badges).to.have.lengthOf(0);
        });

        it("Report not found", async function(){
            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 69});
            expect(res).to.have.status(404);
        });

        it("Invalid report ID", async function(){
            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Report ID must be a number.");
        });

        it("Claiming another user's report", async function(){
            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 4});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Cannot claim rewards from another player's game!");
        });

        it("Report stats array has invalid length", async function(){
            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 5});
            expect(res).to.have.status(500);
            expect(res.text).to.equal("Report data could not be loaded.");
        });

        it("Not enough tokens", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?;`, [0, TEST_USERNAME]);

            const res = await chai.request(server).post("/report/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({reportid: 6, claim: true});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You cannot afford to claim these rewards!");
        });
    });
});
