import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import accessoryList from "../../../bull/data/accessories_data.json";
import server from "../../../bull/index";
import {tables} from "../../../bull/modules/database";
import {DatabaseBadges} from "../../../bull/types";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.accessory;
const TEST_USERNAME = "accessory";

describe("Accessory Collection endpoints", function(){
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

    it("/accessory/all", async function(){
        const res = await chai.request(server).get("/accessory/all").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(accessoryList.length);
    });

    describe("/accessory/claim", function(){
        let index = 0;
        const i = accessoryList.findIndex((value) => value.badges > 1);
        if (i > 0){
            index = i;
        }
        const accessory = accessoryList[index];
        const badges: DatabaseBadges = {};
        badges[accessory.name] = accessory.badges;

        it("Allowed to claim accessory", async function(){
            await connection.query(`UPDATE ${tables.bullgame} SET badges = ? WHERE username = ?`, [JSON.stringify(badges), TEST_USERNAME]);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?`, [JSON.stringify([]), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessory/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["displayName", "image", "description"]);
            expect(res.body.displayName).to.equal(accessory.displayName);
        });

        it("Requirements to claim accessory not met", async function(){
            await connection.query(`UPDATE ${tables.bullgame} SET badges = ? WHERE username = ?`, [JSON.stringify({}), TEST_USERNAME]);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?`, [JSON.stringify([]), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessory/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You do not meet the requirements to claim this accessory.");
        });

        it("Already claimed accessory", async function(){
            await connection.query(`UPDATE ${tables.bullgame} SET badges = ? WHERE username = ?`, [JSON.stringify(badges), TEST_USERNAME]);
            await connection.query(`UPDATE ${tables.users} SET accessories = ? WHERE username = ?`, [JSON.stringify([accessory.name]), TEST_USERNAME]);

            const res = await chai.request(server).post("/accessory/claim").auth(TEST_TOKEN, {type: "bearer"})
            .send({accessory: accessory.name});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You have already claimed this accessory.");
        });
    });

    it("/accessory/mastery", async function(){
        const res = await chai.request(server).get("/accessory/mastery").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(["level", "points", "current", "next"]);
        expect(res.body.current).to.have.keys(["points", "image", "color"]);
        expect(res.body.next).to.have.keys(["points", "image", "color"]);

        expect(res.body.level).to.equal(30);
        expect(res.body.points).to.equal(20000000);
    });
});
