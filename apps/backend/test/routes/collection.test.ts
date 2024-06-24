import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import accessoryList from "../../bull/data/accessories_data.json";
import {IMAGE_FILE_EXTENSION, PIN_IMAGE_DIR, AVATAR_IMAGE_DIR} from "../../bull/data/constants";
import {freeAvatarFiles} from "../../bull/modules/fileloader";
import server from "../../bull/index";
import {tables} from "../../bull/modules/database";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.collection;
const TEST_USERNAME = "collection";

describe("Brawler Collection endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES
            (?, "", "", ?, "[]", "[]", "[]", "[]", "[]", "");`, [TEST_USERNAME, JSON.stringify({bull: {"bull_default": 1}, ash: {}})]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    it("/resources", async function(){
        const avatar = freeAvatarFiles[0];
        const values = {
            username: TEST_USERNAME,
            avatar: avatar,
            tokens: 500,
            tokenDoubler: 100,
            coins: 69,
            points: 20000000,
            tradeCredits: 300,
            wildCardPins: [4, 3, 2, 1, 0]
        };

        await connection.query(
            `UPDATE ${tables.users} SET active_avatar = ?, tokens = ?, token_doubler = ?, coins = ?, points = ?, trade_credits = ?, wild_card_pins = ? WHERE username = ?;`,
            [values.avatar, values.tokens, values.tokenDoubler, values.coins, values.points, values.tradeCredits, JSON.stringify(values.wildCardPins), values.username]
        );

        const res = await chai.request(server).get("/resources").auth(TEST_TOKEN, {type: "bearer"});

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys([
            "username", "avatar", "avatarColor", "tokens", "tokenDoubler",
            "coins", "mastery", "tradeCredits", "wildCardPins"
        ]);
        expect(res.body.username).to.equal(values.username);
        expect(res.body.avatar).to.equal(AVATAR_IMAGE_DIR + avatar + IMAGE_FILE_EXTENSION);
        expect(res.body.tokens).to.equal(values.tokens);
        expect(res.body.tokenDoubler).to.equal(values.tokenDoubler);
        expect(res.body.coins).to.equal(values.coins);
        expect(res.body.mastery.points).to.equal(values.points);
        expect(res.body.tradeCredits).to.equal(values.tradeCredits);

        expect(res.body.wildCardPins).to.be.an("array");
        expect(res.body.wildCardPins.map((value: {amount: number}) => value.amount)).to.eql(values.wildCardPins);
    });

    it("/collection", async function(){
        const accessories = [accessoryList[0].name, accessoryList[1].name, accessoryList[2].name];

        await connection.query(
            `UPDATE ${tables.users} SET accessories = ? WHERE username = ?;`,
            [JSON.stringify(accessories), TEST_USERNAME]
        );

        const res = await chai.request(server).get("/collection").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
        expect(res.body.unlockedBrawlers).to.equal(2);
        expect(res.body.unlockedAccessories).to.equal(3);
    });

    describe("/brawlbox", function(){
        it("Getting brawl box names", async function(){
            const res = await chai.request(server).post("/brawlbox").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");

            for (let x = 0; x < res.body.length; x++){
                expect(res.body[x]).to.have.keys([
                    "name", "displayName", "cost", "image", "description", "dropsDescription"
                ]);
            }
        });

        it("Opening a valid box", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?`, [10000, TEST_USERNAME]);

            const res = await chai.request(server).post("/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({boxType: "brawlBox"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf.at.least(1);

            for (let x = 0; x < res.body.length; x++){
                expect(res.body[x]).to.have.keys([
                    "displayName", "rewardType", "amount", "inventory",
                    "image", "backgroundColor", "description"
                ]);
            }
        });

        it("Not enough tokens", async function(){
            await connection.query(`UPDATE ${tables.users} SET tokens = ? WHERE username = ?`, [0, TEST_USERNAME]);

            const res = await chai.request(server).post("/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({boxType: "brawlBox"});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You cannot afford to open this Box!");
        });

        it("Invalid brawl box name", async function(){
            const res = await chai.request(server).post("/brawlbox").auth(TEST_TOKEN, {type: "bearer"})
            .send({boxType: "not-a-brawl-box"});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Box type does not exist.");
        });
    });

    describe("/shop", function(){
        it("Getting shop items", async function(){
            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");

            // Trade credits should always be available
            const names = res.body.map((value: {name: string;}) => value.name);
            expect(names).to.include("tradeCredits1");
        });

        it("Featured item refreshes", async function(){
            const pin = "bull/bull_default";
            await connection.query(`UPDATE ${tables.users} SET last_login = ?, featured_item = ? WHERE username = ?;`,
                [0, pin, TEST_USERNAME]
            );

            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");

            const featuredItem = res.body.find((value: {name: string; image: string;}) => value.name.includes("featured"));
            expect(featuredItem).to.exist;
            expect(featuredItem.image).to.not.equal(PIN_IMAGE_DIR + pin + IMAGE_FILE_EXTENSION);
        });

        it("Featured item does not refresh", async function(){
            const pin = "bull/bull_default";
            await connection.query(`UPDATE ${tables.users} SET last_login = ?, featured_item = ? WHERE username = ?;`,
                [Date.now() + 60000, pin, TEST_USERNAME]
            );

            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");

            const featuredItem = res.body.find((value: {name: string; image: string;}) => value.name.includes("featured"));
            expect(featuredItem).to.exist;
            expect(featuredItem.image).to.equal(PIN_IMAGE_DIR + pin + IMAGE_FILE_EXTENSION);
        });

        it("Featured item already bought", async function(){
            await connection.query(`UPDATE ${tables.users} SET last_login = ?, featured_item = ? WHERE username = ?;`,
                [Date.now() + 60000, "", TEST_USERNAME]
            );

            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");

            const featuredItem = res.body.find((value: {name: string; image: string;}) => value.name.includes("featured"));
            expect(featuredItem).to.not.exist;
        });

        it("Buying a valid item", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ?, trade_credits = ? WHERE username = ?;`,
                [1000000, 25, TEST_USERNAME]
            );

            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"})
            .send({item: "tradeCredits1"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["inventory", "result"]);

            // Bought 1 trade credit so trade credits should now be 26
            expect(res.body.inventory).to.equal(26);
        });

        it("Not enough coins", async function(){
            await connection.query(`UPDATE ${tables.users} SET coins = ?, trade_credits = ? WHERE username = ?;`,
                [0, 50, TEST_USERNAME]
            );

            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"})
            .send({item: "tradeCredits1"});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You cannot afford this item!");

            const [results] = await connection.query(`SELECT trade_credits FROM ${tables.users} WHERE username = ?;`,
                [TEST_USERNAME]
            );
            expect((results[0] as unknown as {trade_credits: number;}).trade_credits).to.equal(50);
        });

        it("Invalid item name", async function(){
            const res = await chai.request(server).post("/shop").auth(TEST_TOKEN, {type: "bearer"})
            .send({item: "not-a-shop-item"});
            expect(res).to.have.status(404);
            expect(res.text).to.equal("Item is currently not available.");
        });
    });
});
