import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {PIN_IMAGE_DIR, SKIN_IMAGE_DIR, CHALLENGE_REPORT_COST} from "../../bull/data/constants";
import server from "../../bull/index";
import {createConnection, closeConnection, tables, tokens} from "../database_setup";

const TEST_TOKEN = tokens.challenge;
const TEST_USERNAME = "challenge";

describe("Challenge endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item, points) VALUES
            (?, "", "", "{}", "[]", "[]", "[]", "[]", "[]", "", ?);`, [TEST_USERNAME, 20000000]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    it("/challenge/enemies", async function(){
        const res = await chai.request(server).get("/challenge/enemies").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");

        for (let x = 0; x < res.body.length; x++){
            expect(res.body[x]).to.have.keys([
                "name", "displayName", "image", "fullImage", "description", "strengthTier",
                "value", "health", "speed", "attacks", "enemies"
            ]);
            const validImage =
                (res.body[x].image.startsWith(PIN_IMAGE_DIR) || res.body[x].image === "") &&
                (res.body[x].fullImage.startsWith(SKIN_IMAGE_DIR) || res.body[x].fullImage === "");
            expect(validImage).to.be.true;
        }
    });

    it("/challenge/upgrades", async function(){
        const res = await chai.request(server).get("/challenge/upgrades").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
    });

    it("/challenge/all", async function(){
        await connection.query(`DELETE FROM ${tables.challenges};`);
        await connection.query(
            `INSERT INTO ${tables.challenges} (challengeid, preset, username, strength, stats, waves) VALUES
            (?, ?, ?, ?, ?, ?);`, [1, "test-preset", "BULL", 1000, JSON.stringify([]), JSON.stringify([])]
        );

        const res = await chai.request(server).get("/challenge/all").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
    });

    describe("/challenge/get", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
            await connection.query(
                `INSERT INTO ${tables.challenges} (challengeid, preset, username, strength, stats, waves) VALUES
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?);`,
                [
                    2, "", "BULL", 1000, JSON.stringify([]), JSON.stringify([]),
                    3, "not-a-preset", "BULL", 1000, JSON.stringify([]), JSON.stringify([]),
                ]
            );
            await connection.query(`DELETE FROM ${tables.activechallenges};`);
            await connection.query(
                `INSERT INTO ${tables.activechallenges} (active_key, challengeid, accepted, accepted_by) VALUES
                (?, ?, ?, ?),
                (?, ?, ?, ?),
                (?, ?, ?, ?);`,
                [
                    // Used for valid challenge
                    "test1", 2, 0, TEST_USERNAME,
                    // Used for challenge already accepted
                    "test2", 2, 1, TEST_USERNAME,
                    // Used for preset does not exist
                    "test3", 3, 0, TEST_USERNAME
                ]
            );
        });

        it("Valid active challenge", async function(){
            const res = await chai.request(server).post("/challenge/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test1"});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.include.keys([
                "options", "difficulties", "stages", "levels",
                "maxScores", "playerAccessories", "playerUpgradeValues"
            ]);
        });

        it("Challenge already accepted", async function(){
            const res = await chai.request(server).post("/challenge/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test2"});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("This challenge has already been accepted.");
        });

        it("Challenge key not provided", async function(){
            const res = await chai.request(server).post("/challenge/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Challenge not found.");
        });

        it("Challenge with key does not exist", async function(){
            const res = await chai.request(server).post("/challenge/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "not-a-challenge"});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Challenge not found.");
        });

        it("Challenge with preset does not exist", async function(){
            const res = await chai.request(server).post("/challenge/get").auth(TEST_TOKEN, {type: "bearer"})
            .send({key: "test3"});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Challenge not found.");
        });
    });

    describe("/challenge/create", function(){
        it("Valid challenge object", async function(){
            const waves = [
                {level: 0, enemies: ["colette"]},
                {level: 1, enemies: ["bibi"]},
                {level: 2, enemies: ["max"]},
                {level: 3, enemies: ["amber"]}
            ];

            const res = await chai.request(server).post("/challenge/create").auth(TEST_TOKEN, {type: "bearer"})
            .send({waves: waves});

            expect(res).to.have.status(200);
            expect(res.text).to.equal("Challenge successfully created");
        });

        it("Challenge object missing properties", async function(){
            const res = await chai.request(server).post("/challenge/create").auth(TEST_TOKEN, {type: "bearer"})
            .send({waves: false});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Challenge waves incorrectly formatted.");
        });
    });

    describe("/challenge/start", function(){
        before(async function(){
            await connection.query(`DELETE FROM ${tables.challenges};`);
            await connection.query(
                `INSERT INTO ${tables.challenges} (challengeid, preset, username, strength, stats, waves) VALUES
                (?, ?, ?, ?, ?, ?);`,
                [
                    4, "", "BULL", 1000, JSON.stringify([]), JSON.stringify([]),
                ]
            );
            await connection.query(`DELETE FROM ${tables.activechallenges};`);
        });

        it("Challenge successfully started", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?;`, [CHALLENGE_REPORT_COST, TEST_USERNAME]);

            const res = await chai.request(server).post("/challenge/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: 4});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["key", "displayName", "enemies"]);
            expect(res.body.key).to.be.a("string");
            expect(res.body.displayName).to.equal("BULL's Challenge");

            const [results] = await connection.query(`SELECT challengeid FROM ${tables.activechallenges} WHERE active_key = ?`, [res.body.key]);
            expect(results).to.have.lengthOf(1);
            expect(results[0].challengeid).to.equal(4);
        });

        it("Invalid challenge ID", async function(){
            const res = await chai.request(server).post("/challenge/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: true});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Invalid challenge ID.");
        });

        it("Challenge does not exist", async function(){
            const res = await chai.request(server).post("/challenge/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: 69});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Challenge does not exist.");
        });

        it("Not enough tokens", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?;`, [0, TEST_USERNAME]);

            const res = await chai.request(server).post("/challenge/start").auth(TEST_TOKEN, {type: "bearer"})
            .send({challengeid: 4});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You cannot afford to start a challenge!");
        });
    });
});
