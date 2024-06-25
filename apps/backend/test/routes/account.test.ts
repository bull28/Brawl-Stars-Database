import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {IMAGE_FILE_EXTENSION, AVATAR_IMAGE_DIR, THEME_SPECIAL_DIR, SCENE_IMAGE_DIR, TOKENS_PER_REWARD, MAX_REWARD_STACK} from "../../bull/data/constants";
import {freeAvatarFiles, specialAvatarFiles} from "../../bull/modules/fileloader";
import {hashPassword, checkPassword} from "../../bull/modules/authenticate";
import server from "../../bull/index";
import {tables} from "../../bull/modules/database";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.account;
const TEST_USERNAME = "account";
const TEST_TOKEN_UPDATE = tokens.accountUpdate;
const TEST_USERNAME_UPDATE = "accountUpdate";
const TEST_PASSWORD = "bull";
let TEST_PASSWORD_HASH = "";

describe("Account endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        TEST_PASSWORD_HASH = await hashPassword(TEST_PASSWORD);

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, active_avatar, brawlers, avatars, themes, scenes, accessories, wild_card_pins, featured_item) VALUES
            (?, ?, "", "{}", "[]", ?, ?, "[]", "[]", ""),
            (?, ?, "", "{}", "[]", ?, ?, "[]", "[]", "");`,
            [
                // Used for all account endpoints except update
                TEST_USERNAME, TEST_PASSWORD_HASH, JSON.stringify(["retro"]), JSON.stringify(["giftshop"]),
                // Used for account update
                TEST_USERNAME_UPDATE, TEST_PASSWORD_HASH, JSON.stringify(["retro"]), JSON.stringify(["giftshop"])
            ]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/login", function(){
        it("Valid login", async function(){
            const res = await chai.request(server).post("/login").send({username: TEST_USERNAME, password: TEST_PASSWORD});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["token", "username"]);
            expect(res.body.username).to.equal(TEST_USERNAME);
        });

        it("Incorrect username", async function(){
            const res = await chai.request(server).post("/login").send({username: "BULL", password: "ash"});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Incorrect username or password.");
        });

        it("No username and password provided", async function(){
            const res = await chai.request(server).post("/login").send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is missing.");
        });
    });

    describe("/signup", function(){
        it("Valid signup", async function(){
            const res = await chai.request(server).post("/signup").send({username: "signup", password: TEST_PASSWORD});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["token", "username"]);
            expect(res.body.username).to.equal("signup");
        });

        it("Username and password are too short", async function(){
            const res = await chai.request(server).post("/signup").send({username: "/", password: "/"});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is too short. Minimum username length is 2 and password length is 3.");
        });

        it("Username and password are too long", async function(){
            const username = "///////////////////////////////";
            const password = "/////////////////////////////////////////////////////////////////////////////////////////////////////";
            const res = await chai.request(server).post("/signup").send({username: username, password: password});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is too long. Maximum username length is 30 and password length is 100.");
        });

        it("No username and password provided", async function(){
            const res = await chai.request(server).post("/signup").send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is missing.");
        });
    });

    describe("/update", function(){
        const initialAvatar = freeAvatarFiles[0].split(".")[0];
        const validAvatarImage = AVATAR_IMAGE_DIR + freeAvatarFiles[1];
        const lockedAvatarImage = AVATAR_IMAGE_DIR + specialAvatarFiles[0];
        const newPassword = "frank";

        beforeEach(async function(){
            await connection.query(
                `UPDATE ${tables.users} SET password = ?, active_avatar = ? WHERE username = ?;`,
                [TEST_PASSWORD_HASH, initialAvatar, TEST_USERNAME_UPDATE]
            );
        });

        it("Update avatar only", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({newPassword: "", newAvatar: validAvatarImage});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT active_avatar from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results).to.have.lengthOf(1);
            // The avatar is stored in the database without the image file extension so the full file name should
            // include the avatar name stored in the database
            expect(validAvatarImage).to.include(results[0].active_avatar);
        });

        it("Update password only", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: newPassword, newAvatar: ""});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results).to.have.lengthOf(1);
            expect(await checkPassword(results[0].password, newPassword)).to.be.true;
        });

        it("Update both avatar and password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: newPassword, newAvatar: validAvatarImage});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password, active_avatar from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results).to.have.lengthOf(1);
            expect(validAvatarImage).to.include(results[0].active_avatar);
            expect(await checkPassword(results[0].password, newPassword)).to.be.true;
        });

        it("No avatar or password provided", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("New password or new avatar is missing.");
        });

        it("New password is too short", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: "a", newAvatar: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("New password is too short. Minimum password length is 3.");
        });

        it("Incorrect current password given when updating password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: "incorrect password", newPassword: newPassword, newAvatar: ""});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Current password is incorrect.");
        });

        it("Current password not given when updating password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({newPassword: newPassword, newAvatar: ""});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Current password is required to change password.");
        });

        it("Not allowed to use avatar", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({newPassword: "", newAvatar: lockedAvatarImage});
            expect(res).to.have.status(403);
            expect(res.text).to.equal("You are not allowed to use that avatar.");
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
            expect(res.text).to.equal("You are not allowed to use one or more of those cosmetics.");
        });
    });

    describe("/claimtokens", function(){
        it("Get tokens available with no token doubler", async function(){
            await connection.query(`UPDATE ${tables.users} SET last_claim = ?, token_doubler = ? WHERE username = ?`, [1600000000000, 0, TEST_USERNAME]);

            const res = await chai.request(server).post("/claimtokens").auth(TEST_TOKEN, {type: "bearer"})
            .send({claim: false});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["tokensAvailable", "tokensEarned", "timeLeft"]);
            expect(res.body.timeLeft).to.have.keys(["season", "hour", "minute", "second", "hoursPerSeason", "maxSeasons"]);

            expect(res.body.tokensAvailable).to.equal(TOKENS_PER_REWARD * MAX_REWARD_STACK);
            expect(res.body.tokensEarned).to.equal(0);
        });

        it("Get tokens available with token doubler", async function(){
            await connection.query(`UPDATE ${tables.users} SET last_claim = ?, token_doubler = ? WHERE username = ?`, [1600000000000, 300, TEST_USERNAME]);

            const res = await chai.request(server).post("/claimtokens").auth(TEST_TOKEN, {type: "bearer"})
            .send({claim: false});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["tokensAvailable", "tokensEarned", "timeLeft"]);
            expect(res.body.timeLeft).to.have.keys(["season", "hour", "minute", "second", "hoursPerSeason", "maxSeasons"]);

            expect(res.body.tokensAvailable).to.equal(TOKENS_PER_REWARD * MAX_REWARD_STACK + Math.min(300, TOKENS_PER_REWARD * MAX_REWARD_STACK));
            expect(res.body.tokensEarned).to.equal(0);
        });

        it("Claim tokens with no token doubler", async function(){
            await connection.query(`UPDATE ${tables.users} SET last_claim = ?, token_doubler = ? WHERE username = ?`, [1600000000000, 0, TEST_USERNAME]);

            const res = await chai.request(server).post("/claimtokens").auth(TEST_TOKEN, {type: "bearer"})
            .send({claim: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["tokensAvailable", "tokensEarned", "timeLeft"]);
            expect(res.body.timeLeft).to.have.keys(["season", "hour", "minute", "second", "hoursPerSeason", "maxSeasons"]);

            expect(res.body.tokensAvailable).to.equal(0);
            expect(res.body.tokensEarned).to.equal(TOKENS_PER_REWARD * MAX_REWARD_STACK);
        });

        it("Claim tokens with token doubler", async function(){
            await connection.query(`UPDATE ${tables.users} SET last_claim = ?, token_doubler = ? WHERE username = ?`, [1600000000000, 300, TEST_USERNAME]);

            const res = await chai.request(server).post("/claimtokens").auth(TEST_TOKEN, {type: "bearer"})
            .send({claim: true});

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["tokensAvailable", "tokensEarned", "timeLeft"]);
            expect(res.body.timeLeft).to.have.keys(["season", "hour", "minute", "second", "hoursPerSeason", "maxSeasons"]);

            expect(res.body.tokensAvailable).to.equal(0);
            expect(res.body.tokensEarned).to.equal(TOKENS_PER_REWARD * MAX_REWARD_STACK + Math.min(300, TOKENS_PER_REWARD * MAX_REWARD_STACK));
        });
    });
});
