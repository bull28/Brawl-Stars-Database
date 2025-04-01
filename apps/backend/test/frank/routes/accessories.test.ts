import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import accessoryList from "../../../frank/data/accessories_data.json";
import server from "../../../frank/index";
import {tables} from "../../../frank/modules/database_access";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.accessories;
const TEST_USERNAME = "accessory";

describe("Accessory endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, characters, accessories, mastery) VALUES (?, ?, ?, ?, ?);`,
            [TEST_USERNAME, "", Buffer.alloc(1), Buffer.alloc(accessoryList.length * 4), 20000000]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    it("/accessories", async function(){
        const res = await chai.request(server).get("/accessories").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(accessoryList.length);
    });

    it("/accessories/shop", async function(){
        const res = await chai.request(server).get("/accessories/shop").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    describe("/accessories/claim", function(){
        let index = 0;
        let shopIndex = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        const s = accessoryList.findIndex((value) => value.name.includes("shop"));
        if (i > 0){
            index = i;
        }
        if (s > 0){
            shopIndex = s;
        }

        const initialCoins = 1000000;
        const initialMastery = 20000000;
        const itemCost = 1500;

        const accessory = accessoryList[index];
        const shopItem = accessoryList[shopIndex];

        const buffer = new ArrayBuffer(accessoryList.length * 4);
        const view = new DataView(buffer);

        it("Allowed to claim accessory for free", async function(){
            view.setUint32(index * 4, 0x7fffffff, true);
            await connection.query(
                `UPDATE ${tables.users} SET coins = ?, accessories = ? WHERE username = ?;`,
                [initialCoins, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["displayName", "image", "description"]);
            expect(res.body.displayName).to.equal(accessory.displayName);

            // Should not cost coins
            const [results] = await connection.query(
                `SELECT coins, accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(results[0].coins).to.equal(initialCoins);
            expect(accessories.getUint32(index * 4, true)).to.equal(0xffffffff);
        });

        it("Allowed to buy accessory", async function(){
            view.setUint32(shopIndex * 4, 0x00000000, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, accessories = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: shopItem.name, buyFromShop: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["displayName", "image", "description"]);
            expect(res.body.displayName).to.equal(shopItem.displayName);

            // Should cost coins
            const [results] = await connection.query(
                `SELECT coins, accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(results[0].coins).to.equal(initialCoins - itemCost);
            expect(accessories.getUint32(shopIndex * 4, true)).to.equal(0x80000000);
        });

        it("Prefer claiming for free over buying from shop", async function(){
            view.setUint32(shopIndex * 4, 0x7fffffff, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, accessories = ? WHERE username = ?;`,
                [initialMastery, initialCoins, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: shopItem.name, buyFromShop: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["displayName", "image", "description"]);
            expect(res.body.displayName).to.equal(shopItem.displayName);

            // Should not cost coins
            const [results] = await connection.query(
                `SELECT coins, accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(results[0].coins).to.equal(initialCoins);
            expect(accessories.getUint32(shopIndex * 4, true)).to.equal(0xffffffff);
        });

        it("Requirements to claim accessory not met", async function(){
            view.setUint32(index * 4, 0x00000000, true);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?;`, [Buffer.from(buffer), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not meet the requirements to claim this accessory.");

            const [results] = await connection.query(
                `SELECT accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(accessories.getUint32(index * 4, true)).to.equal(0x00000000);
        });

        it("Already unlocked accessory", async function(){
            view.setUint32(index * 4, 0x80000000, true);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?;`, [Buffer.from(buffer), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You have already unlocked this accessory.");

            const [results] = await connection.query(
                `SELECT accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(accessories.getUint32(index * 4, true)).to.equal(0x80000000);
        });

        it("Not enough badges when claiming", async function(){
            view.setUint32(index * 4, 0x00000000, true);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?;`, [Buffer.from(buffer), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not meet the requirements to claim this accessory.");

            const [results] = await connection.query(
                `SELECT accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(accessories.getUint32(index * 4, true)).to.equal(0x00000000);
        });

        it("Mastery level too low when buying", async function(){
            view.setUint32(shopIndex * 4, 0x00000000, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, accessories = ? WHERE username = ?;`,
                [0, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: shopItem.name, buyFromShop: true});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not meet the requirements to claim this accessory.");

            const [results] = await connection.query(
                `SELECT accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(accessories.getUint32(shopIndex * 4, true)).to.equal(0x00000000);
        });

        it("Not enough coins when buying", async function(){
            view.setUint32(shopIndex * 4, 0x00000000, true);
            await connection.query(
                `UPDATE ${tables.users} SET mastery = ?, coins = ?, accessories = ? WHERE username = ?;`,
                [initialMastery, 0, Buffer.from(buffer), TEST_USERNAME]
            );

            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: shopItem.name, buyFromShop: true});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not have enough coins to buy this accessory.");

            const [results] = await connection.query(
                `SELECT accessories FROM ${tables.users} WHERE username = ?;`, [TEST_USERNAME]
            );
            const accessories = new DataView(Uint8Array.from(results[0].accessories).buffer);
            expect(accessories.getUint32(shopIndex * 4, true)).to.equal(0x00000000);
        });

        it("Accesory does not exist.", async function(){
            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: "not an accessory"});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Accessory not found.");
        });

        it("No accessory provided", async function(){
            const res = await chai.request(server).post("/accessories/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Accessory to claim is missing.");
        });
    });
});
