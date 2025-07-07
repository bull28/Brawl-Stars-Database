import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import characterList from "../../../frank/data/characters_data.json";
import server from "../../../frank/index";
import {createError} from "../../../frank/modules/utils";
import {tables} from "../../../frank/modules/database_access";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.resources;
const TEST_USERNAME = "resources";

describe("User Resources endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, characters, accessories, mastery, coins) VALUES (?, ?, ?, ?, ?, ?);`,
            [TEST_USERNAME, "", Buffer.alloc(1), Buffer.alloc(1), 20000000, 50000]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    const buffer = new ArrayBuffer(characterList.length * 2);
    const view = new DataView(buffer);
    for (let x = 0; x < characterList.length; x++){
        view.setUint16(x * 2, 0x209, true);
    }

    it("/enemies", async function(){
        // This endpoint does not require a user logged in
        const res = await chai.request(server).get("/enemies");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.enemies).to.be.an("array");
    });

    it("/resources", async function(){
        view.setUint16(0, 0x208, true);
        await connection.query(
            `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ? WHERE username = ?;`,
            [20000000, 50000, Buffer.from(buffer), TEST_USERNAME]
        );

        const res = await chai.request(server).get("/resources").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["username", "coins", "mastery", "characters"]);

        expect(res.body.coins).to.equal(50000);

        expect(res.body.mastery).to.be.an("object");
        expect(res.body.mastery.points).to.equal(20000000);

        expect(res.body.characters).to.be.an("array");
        expect(res.body.characters).to.have.lengthOf(characterList.length);
        expect(res.body.characters[0].tier.level).to.equal(28);
    });

    it("/characters", async function(){
        view.setUint16(0, 0x30a, true);
        await connection.query(
            `UPDATE ${tables.users} SET characters = ? WHERE username = ?;`,
            [Buffer.from(buffer), TEST_USERNAME]
        );

        const res = await chai.request(server).get("/characters").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.characters).to.be.an("array");
        expect(res.body.characters).to.have.lengthOf(characterList.length);

        expect(res.body.characters[0].current.tier.level).to.equal(40);
        expect(res.body.characters[0].next.tier.level).to.equal(40);
    });

    describe("/characters/upgrade", function(){
        const index = 0;

        const name = characterList[0].name;

        const initialCoins = 1000000;
        const initialMastery = 20000000;
        const normalCost = 4540;
        const tierUpCost = 18000;

        beforeEach(async function(){
            view.setUint16(index, 0x302, true);
            await connection.query(
                `UPDATE ${tables.users} SET characters = ? WHERE username = ?;`,
                [Buffer.from(buffer), TEST_USERNAME]
            );
        });

        it("Successful normal upgrade", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ? WHERE username = ?;`, [initialCoins, TEST_USERNAME]);

            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(200);
            expect(res.body.current.tier.level).to.equal(33);

            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(initialCoins - normalCost);
            expect(characters.getUint16(index * 2, true)).to.equal(0x303);
        });

        it("Successful tier up", async function(){
            view.setUint16(index, 0x30a, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer),TEST_USERNAME]
            );

            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(200);
            expect(res.body.current.tier.level).to.equal(40);

            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(initialCoins - tierUpCost);
            expect(characters.getUint16(index * 2, true)).to.equal(0x400);
        });

        it("Character not found", async function(){
            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: "not a character"});
            expect(res).to.have.status(404);
            expect(res.body).to.eql(createError("CharactersNotFound"));
        });

        it("Not enough coins", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ? WHERE username = ?;`, [normalCost - 1, TEST_USERNAME]);

            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersCannotAfford"));

            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(normalCost - 1);
            expect(characters.getUint16(index * 2, true)).to.equal(0x302);
        });

        it("Requirements to upgrade not met", async function(){
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ? WHERE username = ?;`,
                [0, initialCoins, TEST_USERNAME]
            );

            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersUpgradeDenied"));

            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(initialCoins);
            expect(characters.getUint16(index * 2, true)).to.equal(0x302);
        });

        it("Already maximum level", async function(){
            view.setUint16(index, 0x700, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersMaxLevel"));

            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(initialCoins);
            expect(characters.getUint16(index * 2, true)).to.equal(0x700);
        });
    });
});
