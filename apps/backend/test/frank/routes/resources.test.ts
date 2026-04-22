import {expect} from "chai";
import {request} from "chai-http";
import {Connection} from "mysql2/promise";
import accessoryList from "../../../frank/data/accessories_data.json";
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

    const accessories = new ArrayBuffer(accessoryList.length * 4);
    const view2 = new DataView(accessories);

    it("/enemies", async function(){
        // This endpoint does not require a user logged in
        const res = await request.execute(server).get("/enemies");
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

        const res = await request.execute(server).get("/resources").auth(TEST_TOKEN, {type: "bearer"});

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
        view.setUint16(0, 0x30f, true);
        await connection.query(
            `UPDATE ${tables.users} SET characters = ?, accessories = ? WHERE username = ?;`,
            [Buffer.from(buffer), Buffer.from(accessories), TEST_USERNAME]
        );

        const res = await request.execute(server).get("/characters").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.characters).to.be.an("array");
        expect(res.body.characters).to.have.lengthOf(characterList.length);

        expect(res.body.characters[0].current.tier.level).to.equal(45);
        expect(res.body.characters[0].next.tier.level).to.equal(45);
    });

    describe("/characters/upgrade", function(){
        const i = Math.min(1, characterList.length - 1);
        const name = characterList[i].name;

        const characterIndex = i * 2;
        const accessoryIndex = Math.max(0, accessoryList.findIndex((value) => value.name === name)) * 4;

        const initialCoins = 1000000;
        const initialMastery = 120000000;
        const normalCost = 3140;
        const tierUpCost = 7500;

        async function checkCollection(coins: number, characterLevel: number): Promise<boolean>{
            const [results] = await connection.query(
                `SELECT coins, characters FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const characters = new DataView(Uint8Array.from(results[0].characters).buffer);
            expect(results[0].coins).to.equal(coins);
            expect(characters.getUint16(characterIndex, true)).to.equal(characterLevel);
        }

        beforeEach(async function(){
            view.setUint16(characterIndex, 0x302, true);
            view2.setUint32(accessoryIndex, 500, true);
            await connection.query(
                `UPDATE ${tables.users} SET characters = ?, accessories = ? WHERE username = ?;`,
                [Buffer.from(buffer), Buffer.from(accessories), TEST_USERNAME]
            );
        });

        it("Successful normal upgrade", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ? WHERE username = ?;`, [initialCoins, TEST_USERNAME]);

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(200);
            expect(res.body.current.tier.level).to.equal(33);

            await checkCollection(initialCoins - normalCost, 0x303);
        });

        it("Successful tier up", async function(){
            view.setUint16(characterIndex, 0x30f, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer),TEST_USERNAME]
            );

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(200);
            expect(res.body.current.tier.level).to.equal(45);

            await checkCollection(initialCoins - tierUpCost, 0x400);
        });

        it("Character not found", async function(){
            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: "not a character"});
            expect(res).to.have.status(404);
            expect(res.body).to.eql(createError("CharactersNotFound"));
        });

        it("Not enough coins", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ? WHERE username = ?;`, [normalCost - 1, TEST_USERNAME]);

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersCannotAfford"));

            await checkCollection(normalCost - 1, 0x302);
        });

        it("Mastery level requirement not met", async function(){
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ? WHERE username = ?;`,
                [0, initialCoins, TEST_USERNAME]
            );

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersUpgradeDenied"));

            await checkCollection(initialCoins, 0x302);
        });

        it("Trophy collection requirement not met", async function(){
            view2.setUint32(accessoryIndex, 0, true);
            await connection.query(
                `UPDATE ${tables.users} SET coins = ?, accessories = ? WHERE username = ?;`,
                [initialCoins, Buffer.from(accessories), TEST_USERNAME]
            );

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersUpgradeDenied"));

            await checkCollection(initialCoins, 0x302);
        });

        it("Already maximum level", async function(){
            view.setUint16(characterIndex, 0x700, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, characters = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await request.execute(server).post("/characters/upgrade").auth(TEST_TOKEN, {type: "bearer"})
            .send({character: name});
            expect(res).to.have.status(403);
            expect(res.body).to.eql(createError("CharactersMaxLevel"));

            await checkCollection(initialCoins, 0x700);
        });
    });
});
