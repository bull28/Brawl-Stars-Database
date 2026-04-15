import {expect} from "chai";
import {request} from "chai-http";
import {Connection} from "mysql2/promise";
import {trialStates} from "../../../frank/data/trials_data";
import server from "../../../frank/index";
import {createError} from "../../../frank/modules/utils";
import {bufferUtils} from "../../../frank/modules/database";
import {tables} from "../../../frank/modules/database_access";
import {GAME_VERSION, TEST_TRIAL_ID, sampleGameReport, generateSampleTrial, createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.trials;
const TEST_USERNAME = "trials";
const TEST_CHALLENGE_ID = TEST_TRIAL_ID;
const TEST_CHALLENGE_MODE = 3;

const TRIAL_STATE_OFFSET = 4;

describe("Trial endpoints", function(){
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

    async function updateTrial(username: string, trial: ReturnType<typeof generateSampleTrial>): Promise<void>{
        await connection.query(`DELETE FROM ${tables.trials};`);
        await connection.query(
            `INSERT INTO ${tables.trials} (username, trial_data) VALUES (?, ?);`,
            [username, bufferUtils.trialToBuffer(trial)]
        );
    }

    it("/challenges/get", async function(){
        const trial = generateSampleTrial();
        trial.state = trialStates.TRIAL_READY;
        trial.selected = Math.min(1, trial.characterBuilds.length - 1);
        await updateTrial(TEST_USERNAME, trial);

        const character = trial.characterBuilds[trial.selected] >> 12;

        await connection.query(`DELETE FROM ${tables.challenges};`);
        await connection.query(
            `INSERT INTO ${tables.challenges} (active_key, challengeid, gamemode, accepted, accepted_by) VALUES (?, ?, ?, ?, ?);`,
            ["test1", TEST_CHALLENGE_ID, TEST_CHALLENGE_MODE, 0, TEST_USERNAME]
        );

        const res = await request.execute(server).post("/challenges/get").auth(TEST_TOKEN, {type: "bearer"})
        .send({key: "test1"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.include.keys([
            "options", "difficulties", "stages", "levels",
            "maxScores", "playerAccessories", "playerUpgradeTiers", "playerUpgradeValues"
        ]);

        const tiers = Object.values(res.body.playerUpgradeTiers);
        expect(tiers[character]).to.equal(trial.characterTiers[character]);

        const [results] = await connection.query(
            `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
        );
        const trialBuffer = new DataView(Uint8Array.from(results[0].trial_data).buffer);
        expect(trialBuffer.getUint16(TRIAL_STATE_OFFSET, true)).to.equal(trialStates.TRIAL_PLAYING);
    });

    it("/report", async function(){
        const trial = generateSampleTrial();
        trial.state = trialStates.TRIAL_PLAYING;
        await updateTrial(TEST_USERNAME, trial);

        const report = sampleGameReport.slice(2);
        report[0] = TEST_CHALLENGE_MODE;

        await connection.query(`DELETE FROM ${tables.challenges};`);
        await connection.query(
            `INSERT INTO ${tables.challenges} (active_key, challengeid, gamemode, accepted, accepted_by) VALUES (?, ?, ?, ?, ?);`,
            ["test1", TEST_CHALLENGE_ID, TEST_CHALLENGE_MODE, 1, TEST_USERNAME]
        );

        const res = await request.execute(server).post("/report").auth(TEST_TOKEN, {type: "bearer"})
        .send({username: "ignore", key: "test1", report: [GAME_VERSION, 1].concat(report)});
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["message", "status", "path", "coins", "masteryReward", "masteryData"]);
        expect(res.body.message).to.equal("Score successfully saved.");

        const [results] = await connection.query(
            `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
        );
        const trialAfter = bufferUtils.bufferToTrial(results[0].trial_data)!;
        expect(trialAfter.state).to.equal(trialStates.TRIAL_REWARD);
        expect(trialAfter.progress).to.equal(trial.progress + 1);
        expect(trialAfter.rewards.lastScore).to.equal(report[1]);
    });

    it("/trials", async function(){
        const res = await request.execute(server).get("/trials").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.trials).to.be.an("array");
    });

    it("/trials/state", async function(){
        const trial = generateSampleTrial();
        await updateTrial(TEST_USERNAME, trial);

        const res = await request.execute(server).get("/trials/state").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");

        expect(res.body.state).to.equal(trial.state);
        expect(res.body.progress).to.equal(trial.progress);
    });

    it("/trials/display", async function(){
        const trial = generateSampleTrial();
        await updateTrial(TEST_USERNAME, trial);

        const res = await request.execute(server).get("/trials/display").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
    });

    it("/trials/start", async function(){
        await connection.query(`DELETE FROM ${tables.trials};`);

        const res = await request.execute(server).post("/trials/start").auth(TEST_TOKEN, {type: "bearer"})
        .send({trialid: 0});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.trialid).to.equal(0);

        const [results] = await connection.query(
            `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
        );
        expect(results).to.have.lengthOf(1);
    });

    it("/trials/end", async function(){
        await connection.query(`DELETE FROM ${tables.trials};`);

        const res = await request.execute(server).post("/trials/end").auth(TEST_TOKEN, {type: "bearer"})
        .send({});

        expect(res).to.have.status(404);
        expect(res.body).to.eql(createError("TrialsGetNotFound"));

        await updateTrial(TEST_USERNAME, generateSampleTrial());

        const res2 = await request.execute(server).post("/trials/end").auth(TEST_TOKEN, {type: "bearer"})
        .send({});
        expect(res2).to.have.status(200);
        expect(res2.body).to.be.an("object");
        expect(res2.body.mastery).to.equal(0);
    });

    describe("/trials/next", function(){
        before(async function(){
            const trial = generateSampleTrial();
            for (let x = 0; x < Math.min(20, trial.accessories.length); x++){
                trial.accessories[x] = 0x0081;
            }
            trial.powerups[0] = 0x0081;
            await updateTrial(TEST_USERNAME, trial);
        });

        it("Valid selection", async function(){
            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: 1, accessories: [2, 5, 6, 8], powerups: [0]});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.key).to.be.a("string");

            const [results] = await connection.query(
                `SELECT gamemode, accepted FROM ${tables.challenges} WHERE active_key = ?;`, [res.body.key]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].gamemode).to.equal(TEST_CHALLENGE_MODE);
            expect(results[0].accepted).to.equal(0);
        });

        it("Multiple selections", async function(){
            const selection = [2, 5, 6, 8];
            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: 1, accessories: selection, powerups: [0]});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.key).to.be.a("string");

            const selection2 = [9, 10, 11, 12];
            const res2 = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: 0, accessories: selection2});

            expect(res2).to.have.status(200);
            expect(res2.body).to.be.an("object");
            expect(res2.body.key).to.be.a("string");

            const [results] = await connection.query(
                `SELECT gamemode, accepted FROM ${tables.challenges} WHERE active_key = ? OR active_key = ?;`,
                [res.body.key, res2.body.key]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].gamemode).to.equal(TEST_CHALLENGE_MODE);
            expect(results[0].accepted).to.equal(0);

            const [trialResults] = await connection.query(
                `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
            );
            expect(trialResults).to.have.lengthOf(1);
            const trial = bufferUtils.bufferToTrial(trialResults[0].trial_data)!;

            for (let x = 0; x < selection.length; x++){
                expect(trial.accessories[selection[x]]).to.equal(0x0081);
            }
            for (let x = 0; x < selection2.length; x++){
                expect(trial.accessories[selection2[x]]).to.equal(0x8081);
            }
        });

        it("Selection not allowed", async function(){
            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: 1, accessories: [69], powerups: [0]});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsItemsNotOwned"));
        });

        it("Selection not formatted correctly", async function(){
            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: "2", accessories: 1, powerups: [false]});
            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("TrialsInvalidSelection"));

            const res2 = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: 0, accessories: [0, 1, 2, 3, "4"], powerups: null});
            expect(res2).to.have.status(400);
            expect(res2.body).to.eql(createError("TrialsInvalidSelection"));
        });

        it("Selection not provided", async function(){
            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.key).to.be.a("string");

            const [results] = await connection.query(
                `SELECT gamemode, accepted FROM ${tables.challenges} WHERE active_key = ?;`, [res.body.key]
            );
            expect(results).to.have.lengthOf(1);
            expect(results[0].gamemode).to.equal(TEST_CHALLENGE_MODE);
            expect(results[0].accepted).to.equal(0);
        });
    });

    describe("/trials/brawlbox", function(){
        it("Allowed to open box", async function(){
            const trial = generateSampleTrial();
            trial.state = trialStates.TRIAL_REWARD;
            trial.rewards.specialBoxes = 0xffff;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({brawlboxid: 3});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.items).to.be.an("array");

            const [results] = await connection.query(
                `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
            );
            const trialBuffer = new DataView(Uint8Array.from(results[0].trial_data).buffer);
            expect(trialBuffer.getUint16(TRIAL_STATE_OFFSET, true)).to.equal(trialStates.TRIAL_READY);
        });

        it("Not allowed to open box", async function(){
            const trial = generateSampleTrial();
            trial.state = trialStates.TRIAL_REWARD;
            trial.rewards.specialBoxes = 0;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({brawlboxid: 1});

            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsNotAllowed"));

            const [results] = await connection.query(
                `SELECT trial_data FROM ${tables.trials} WHERE username = ?;`, [TEST_USERNAME]
            );
            const trialBuffer = new DataView(Uint8Array.from(results[0].trial_data).buffer);
            expect(trialBuffer.getUint16(TRIAL_STATE_OFFSET, true)).to.equal(trialStates.TRIAL_REWARD);
        });
    });

    describe("/trials/buy", function(){
        it("Valid buy request", async function(){
            const trial = generateSampleTrial();
            trial.resources.credits = 10000;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/buy").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: [0, 1]});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.count).to.equal(2);
        });

        it("Cannot afford items", async function(){
            const trial = generateSampleTrial();
            trial.resources.credits = 0;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/buy").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: [0, 1]});

            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsBuyDenied"));
        });

        it("Too many items", async function(){
            const trial = generateSampleTrial();
            trial.resources.credits = 10000;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/buy").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]});

            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("TrialsTooManyItems"));
        });

        it("Invalid item list", async function(){
            const trial = generateSampleTrial();
            trial.resources.credits = 10000;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/buy").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: 3});

            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("TrialsInvalidItemList"));
        });
    });

    describe("/trials/sell", function(){
        it("Valid sell request", async function(){
            const trial = generateSampleTrial();
            trial.accessories[0] = 0x0081;
            trial.accessories[1] = 0x0081;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/sell").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: [0, 1]});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body.count).to.equal(2);
        });

        it("Not enough copies of items", async function(){
            const trial = generateSampleTrial();
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/sell").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: [0, 1]});

            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsSellDenied"));
        });

        it("Too many items", async function(){
            const trial = generateSampleTrial();
            const sellItems: number[] = [];
            for (let x = 0; x < 11; x++){
                trial.accessories[x] = 0x0081;
                sellItems.push(x);
            }
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/sell").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: sellItems});

            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("TrialsTooManyItems"));
        });

        it("Invalid item list", async function(){
            const trial = generateSampleTrial();
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/sell").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "accessory", items: 3});

            expect(res).to.have.status(400);
            expect(res.body).to.eql(createError("TrialsInvalidItemList"));
        });
    });

    describe("Incorrect trial states", function(){
        it("/trials/next not in ready state", async function(){
            const trial = generateSampleTrial();
            trial.state = trialStates.TRIAL_PLAYING;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/next").auth(TEST_TOKEN, {type: "bearer"})
            .send({});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsNotAllowed"));
        });

        it("/trials/brawlbox not in reward state", async function(){
            const trial = generateSampleTrial();
            trial.state = trialStates.TRIAL_READY;
            trial.rewards.specialBoxes = 1;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({brawlboxid: 1});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsNotAllowed"));
        });

        it("/trials/buy and /trials/sell not in ready state", async function(){
            const trial = generateSampleTrial();
            trial.state = trialStates.TRIAL_PLAYING;
            trial.resources.credits = 10000;
            await updateTrial(TEST_USERNAME, trial);

            const res = await request.execute(server).post("/trials/buy").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "powerup", items: [0]});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("TrialsNotAllowed"));

            const res2 = await request.execute(server).post("/trials/sell").auth(TEST_TOKEN, {type: "bearer"})
            .send({type: "character", items: [0]});
            expect(res2).to.have.status(403);
            expect(res2.body).to.eql(createError("TrialsNotAllowed"));
        });
    });
});
