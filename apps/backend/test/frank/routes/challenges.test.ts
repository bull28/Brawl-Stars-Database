import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import server from "../../../frank/index";
import {createError} from "../../../frank/modules/utils";
import {tables} from "../../../frank/modules/database_access";
import {TEST_STATIC_ID, createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.challenges;
const TEST_USERNAME = "challenge";
const TEST_USERNAME_ACCEPT = "challengeAccept";
const TEST_CHALLENGE_ID = TEST_STATIC_ID;
const TEST_CHALLENGE_MODE = 2;

describe("Challenge endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, characters, accessories, mastery) VALUES (?, ?, ?, ?, ?);`,
            [TEST_USERNAME, "", Buffer.alloc(1), Buffer.alloc(1), 20000000]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    it("/challenges", async function(){
        const res = await chai.request(server).get("/challenges").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.challenges).to.be.an("array");
    });

    describe("/challenges/get", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
            await connection.query(
                `INSERT INTO ${tables.challenges} (active_key, challengeid, gamemode, accepted, accepted_by) VALUES
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?);`,
                [
                    // Used for valid challenge
                    "test1", TEST_CHALLENGE_ID, TEST_CHALLENGE_MODE, 0, TEST_USERNAME,
                    // Used for challenge already accepted
                    "test2", TEST_CHALLENGE_ID, TEST_CHALLENGE_MODE, 1, TEST_USERNAME_ACCEPT,
                    // Used for challenge with user preferences
                    "test3", TEST_CHALLENGE_ID, TEST_CHALLENGE_MODE, 0, TEST_USERNAME
                ]
            );
        });

        it("Valid active challenge", async function(){
            const res = await chai.request(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test1"});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.include.keys([
                "options", "difficulties", "stages", "levels",
                "maxScores", "playerAccessories", "playerUpgradeTiers", "playerUpgradeValues"
            ]);

            const [results] = await connection.query(
                `SELECT challengeid, accepted, accepted_by FROM ${tables.challenges} WHERE active_key = ?;`, ["test1"]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].challengeid).to.equal(TEST_CHALLENGE_ID);
            expect(results[0].accepted).to.equal(1);
            expect(results[0].accepted_by).to.equal(TEST_USERNAME);
        });

        it("Challenge already accepted", async function(){
            const res = await chai.request(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test2"});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("ChallengesAccepted"));

            // Should not change the existing accepted by username
            const [results] = await connection.query(
                `SELECT challengeid, accepted, accepted_by FROM ${tables.challenges} WHERE active_key = ?;`, ["test2"]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].challengeid).to.equal(TEST_CHALLENGE_ID);
            expect(results[0].accepted).to.equal(1);
            expect(results[0].accepted_by).to.equal(TEST_USERNAME_ACCEPT);
        });

        it("Challenge with user preferences", async function(){
            const skins = ["belle_coral", "mandy_harvest", "amber_rollerskates"];

            const res = await chai.request(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test3", settings: {playerSkins: skins}});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.include.keys([
                "options", "difficulties", "stages", "levels",
                "maxScores", "playerAccessories", "playerUpgradeTiers",
                "playerUpgradeValues", "playerSkins"
            ]);
            expect(res.body.playerSkins).to.eql(skins);

            const [results] = await connection.query(
                `SELECT challengeid, accepted, accepted_by FROM ${tables.challenges} WHERE active_key = ?;`, ["test3"]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].challengeid).to.equal(TEST_CHALLENGE_ID);
            expect(results[0].accepted).to.equal(1);
            expect(results[0].accepted_by).to.equal(TEST_USERNAME);
        });

        it("Challenge key not provided", async function(){
            const res = await chai.request(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({});
            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("ChallengesGetMissing"));
        });

        it("Challenge with key does not exist", async function(){
            const res = await chai.request(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "not-a-challenge"});
            expect(res).to.have.status(404);
            expect(res.body).to.eql(createError("ChallengesGetNotFound"));
        });
    });

    describe("/challenges/start", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
        });

        it("Challenge successfully started", async function(){
            const res = await chai.request(server).post("/challenges/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: TEST_CHALLENGE_ID});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["key"]);
            expect(res.body.key).to.be.a("string");

            const [results] = await connection.query(
                `SELECT challengeid, accepted FROM ${tables.challenges} WHERE active_key = ?;`, [res.body.key]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].challengeid).to.equal(TEST_CHALLENGE_ID);
            expect(results[0].accepted).to.equal(0);
        });

        it("Invalid challenge ID", async function(){
            const res = await chai.request(server).post("/challenges/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: true});
            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("ChallengesStartMissing"));

            const [results] = await connection.query(`SELECT challengeid FROM ${tables.challenges} WHERE active_key = ?;`, [res.body.key]);
            expect(results).to.have.lengthOf(0);
        });

        it("Challenge does not exist", async function(){
            const res = await chai.request(server).post("/challenges/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: "not a challenge"});
            expect(res).to.have.status(404);
            expect(res.body).to.eql(createError("ChallengesStartNotFound"));

            const [results] = await connection.query(`SELECT challengeid FROM ${tables.challenges} WHERE active_key = ?;`, [res.body.key]);
            expect(results).to.have.lengthOf(0);
        });
    });
});
