import chai, {expect} from "chai";
import "chai-http";
import {Connection} from "mysql2/promise";
import {hashPassword, checkPassword} from "../../../frank/modules/account_module";
import server from "../../../frank/index";
import {tables} from "../../../frank/modules/database_access";
import {createConnection, closeConnection, tokens} from "../database_setup";

const TEST_TOKEN = tokens.account;
const TEST_USERNAME = "account";
const TEST_TOKEN_UPDATE = tokens.accountUpdate;
const TEST_USERNAME_UPDATE = "accountUpdate";
const TEST_PASSWORD = "bull";
const TEST_USERNAME_SIGNUP = "signup";
const TEST_USERNAME_DUPLICATE = "signup2";
const TEST_THEME = "retropolis";
let TEST_PASSWORD_HASH = "";

describe("Account endpoints", function(){
    let connection: Connection;

    before(async function(){
        connection = await createConnection();

        TEST_PASSWORD_HASH = await hashPassword(TEST_PASSWORD);

        await connection.query(
            `INSERT INTO ${tables.users} (username, password, characters, accessories, menu_theme) VALUES
            (?, ?, ?, ?, ?),
            (?, ?, ?, ?, ?);`,
            [
                // Used for all account endpoints except update
                TEST_USERNAME, TEST_PASSWORD_HASH, Buffer.alloc(1), Buffer.alloc(1), TEST_THEME,
                // Used for account update
                TEST_USERNAME_UPDATE, TEST_PASSWORD_HASH, Buffer.alloc(1), Buffer.alloc(1), TEST_THEME
            ]
        );
    });

    after(async function(){
        if (connection !== undefined){
            await closeConnection(connection);
        }
    });

    describe("/authenticate", function(){
        it("Valid token", async function(){
            const res = await chai.request(server).get("/authenticate").auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["username"]);
            expect(res.body.username).to.equal(TEST_USERNAME);
        });

        it("Valid token with menu theme", async function(){
            const res = await chai.request(server).get("/authenticate").query({menuTheme: ""}).auth(TEST_TOKEN, {type: "bearer"});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["username", "menuTheme"]);
            expect(res.body.username).to.equal(TEST_USERNAME);
            expect(res.body.menuTheme).to.equal(TEST_THEME);
        });

        it("Invalid token", async function(){
            const res = await chai.request(server).get("/authenticate").auth("not a valid token", {type: "bearer"});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Invalid token.");
        });

        it("No token provided", async function(){
            const res = await chai.request(server).get("/authenticate");
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Token is missing.");
        });
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
            const res = await chai.request(server).post("/signup").send({username: TEST_USERNAME_SIGNUP, password: TEST_PASSWORD});
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(["token", "username"]);
            expect(res.body.username).to.equal(TEST_USERNAME_SIGNUP);

            const [results] = await connection.query(`SELECT username from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_SIGNUP]);
            expect(results[0].username).to.equal(TEST_USERNAME_SIGNUP);
        });

        it("Username and password are too short", async function(){
            const res = await chai.request(server).post("/signup").send({username: "/", password: "/"});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is too short. Minimum username length is 2 and password length is 3.");

            const [results] = await connection.query(`SELECT username from ${tables.users} WHERE username = ?;`, ["/"]);
            expect(results).to.have.lengthOf(0);
        });

        it("Username and password are too long", async function(){
            const username = "bulldarrylelprimofrankash";
            const password = "/////////////////////////////////////////////////////////////////////////////////////////////////////";
            const res = await chai.request(server).post("/signup").send({username: username, password: password});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is too long. Maximum username length is 20 and password length is 100.");

            const [results] = await connection.query(`SELECT username from ${tables.users} WHERE username = ?;`, [username]);
            expect(results).to.have.lengthOf(0);
        });

        it("Username contains invalid characters", async function(){
            const username = " \u00a0\u200b\u2800\u3164Otis";
            const password = "password";
            const res = await chai.request(server).post("/signup").send({username: username, password: password});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username can only contain letters, numbers, and underscores.");

            const [results] = await connection.query(`SELECT username from ${tables.users} WHERE username = ?;`, [username]);
            expect(results).to.have.lengthOf(0);
        });

        it("Username is taken", async function(){
            await connection.query(`DELETE from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_DUPLICATE]);

            const res1 = await chai.request(server).post("/signup").send({username: TEST_USERNAME_DUPLICATE, password: TEST_PASSWORD});
            expect(res1).to.have.status(200);

            const res2 = await chai.request(server).post("/signup").send({username: TEST_USERNAME_DUPLICATE, password: TEST_PASSWORD});
            expect(res2).to.have.status(401);
            expect(res2.text).to.equal("Username is already taken.");

            const [results] = await connection.query(`SELECT username from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_DUPLICATE]);
            expect(results).to.have.lengthOf(1);
            expect(results[0].username).to.equal(TEST_USERNAME_DUPLICATE);
        });

        it("No username and password provided", async function(){
            const res = await chai.request(server).post("/signup").send({});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Username or password is missing.");
        });
    });

    describe("/update", function(){
        const newPassword = "frank";
        const oldTheme = "bull";
        const newTheme = "retropolis";

        beforeEach(async function(){
            await connection.query(
                `UPDATE ${tables.users} SET password = ?, menu_theme = ? WHERE username = ?;`,
                [TEST_PASSWORD_HASH, oldTheme, TEST_USERNAME_UPDATE]
            );
        });

        it("Update theme only", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({menuTheme: newTheme});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(newTheme);
        });

        it("Update password only", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: newPassword});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            const check = await checkPassword(results[0].password, newPassword);
            expect(check).to.be.true;
            expect(results[0].menu_theme).to.equal(oldTheme);
        });

        it("Update both theme and password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: newPassword, menuTheme: newTheme});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            const check = await checkPassword(results[0].password, newPassword);
            expect(check).to.be.true;
            expect(results[0].menu_theme).to.equal(newTheme);
        });

        it("No data to update provided", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD});
            expect(res).to.have.status(200);

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(oldTheme);
        });

        it("New password is too short", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: TEST_PASSWORD, newPassword: "a"});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("New password is too short. Minimum password length is 3.");

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(oldTheme);
        });

        it("Incorrect current password given when updating password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({currentPassword: "incorrect password", newPassword: newPassword});
            expect(res).to.have.status(401);
            expect(res.text).to.equal("Current password is incorrect.");

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(oldTheme);
        });

        it("Current password not given when updating password", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({newPassword: newPassword});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Current password is required to change password.");

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(oldTheme);
        });

        it("Current password not given when updating password and theme", async function(){
            const res = await chai.request(server).post("/update").auth(TEST_TOKEN_UPDATE, {type: "bearer"})
            .send({newPassword: newPassword, menuTheme: newTheme});
            expect(res).to.have.status(400);
            expect(res.text).to.equal("Current password is required to change password.");

            const [results] = await connection.query(
                `SELECT password, menu_theme from ${tables.users} WHERE username = ?;`, [TEST_USERNAME_UPDATE]
            );
            expect(results[0].password).to.equal(TEST_PASSWORD_HASH);
            expect(results[0].menu_theme).to.equal(oldTheme);
        });
    });
});
