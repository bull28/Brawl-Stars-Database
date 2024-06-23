import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {IMAGE_FILE_EXTENSION, THEME_SPECIAL_DIR, SCENE_IMAGE_DIR} from "../../bull/data/constants";
import server from "../../bull/index";
import {createConnection, closeConnection, tables, tokens} from "../database_setup";

const TEST_TOKEN = tokens.account;
const TEST_USERNAME = "account";

describe("Account endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES (?,
            "34e5e29c5ac22ca11dd5a825646a85d2577beb1923c2fa900efa95fce8638ef8ace7c1a4406de0b150a5748a29b893b799869f42a0b8f69ed671261719f29950BULL451a4e40da1e2650d4f20ff1888a787947f88c44cfbe216da89a2f76f7040416",
            "", "{}", "[]", '["retro"]', '["giftshop"]', "[]", "[]", "");`, [TEST_USERNAME]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/login", function(){
        it("Valid login", async function(){
            const res = await chai.request(server).post("/login").send({username: TEST_USERNAME, password: "bull"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["token", "username"]);
            expect(res.body.username).to.equal(TEST_USERNAME);
        });

        it("Incorrect username", async function(){
            const res = await chai.request(server).post("/login").send({username: "BULL", password: "ash"});
            expect(res).to.have.status(401);
        });

        it("No username and password provided", async function(){
            const res = await chai.request(server).post("/login").send({});
            expect(res).to.have.status(400);
        });
    });

    describe("/signup", function(){
        it("Valid signup", async function(){
            const res = await chai.request(server).post("/signup").send({username: "signup", password: "bull"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["token", "username"]);
            expect(res.body.username).to.equal("signup");
        });

        it("Invalid username and password", async function(){
            const res = await chai.request(server).post("/signup").send({username: "a", password: "a"});
            expect(res).to.have.status(400);
        });

        it("No username and password provided", async function(){
            const res = await chai.request(server).post("/signup").send({});
            expect(res).to.have.status(400);
        });
    });

    it("/avatar", async function(){
        const res = await chai.request(server).get("/avatar").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
    });

    it("/theme", async function(){
        const res = await chai.request(server).get("/theme").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
    });

    it("/cosmetic GET", async function(){
        const res = await chai.request(server).get("/cosmetic").auth(TEST_TOKEN, {type: "bearer"});
        expect(res).to.have.status(200);
    });

    it("/cosmetic/extra", async function(){
        const res = await chai.request(server).get("/cosmetic/extra").query({
            background: THEME_SPECIAL_DIR + "love_swamp_background" + IMAGE_FILE_EXTENSION
        });
        expect(res).to.have.status(200);
        expect(res.body.extra).to.be.a("string");
        expect(res.body.extra).to.have.lengthOf.at.least(1);
    });

    describe("/cosmetic POST", function(){
        it("Valid cosmetics", async function(){
            const res = await chai.request(server).post("/cosmetic").send({
                setCosmetics: {
                    background: THEME_SPECIAL_DIR + "retro_background" + IMAGE_FILE_EXTENSION,
                    icon: THEME_SPECIAL_DIR + "retro_icon" + IMAGE_FILE_EXTENSION,
                    music: THEME_SPECIAL_DIR + "retro_music.ogg",
                    scene: SCENE_IMAGE_DIR + "giftshop_scene.glb"
                }
            }).auth(TEST_TOKEN, {type: "bearer"});

            expect(res).to.have.status(200);
            expect(res.body).to.have.keys(["background", "icon", "music", "scene"]);
            expect(res.body.background).to.include("retro_background");
            expect(res.body.icon).to.include("retro_icon");
            expect(res.body.music).to.include("retro_music");
            expect(res.body.scene).to.include("giftshop_scene");
        });

        it("Invalid cosmetics", async function(){
            const res = await chai.request(server).post("/cosmetic").send({
                setCosmetics: {
                    background: "background",
                    icon: "icon",
                    music: "music",
                    scene: "scene"
                }
            }).auth(TEST_TOKEN, {type: "bearer"});

            expect(res).to.have.status(403);
        });
    });
});