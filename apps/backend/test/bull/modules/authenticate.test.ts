import {expect} from "chai";
import {signToken, validateToken, hashPassword, checkPassword} from "../../../bull/modules/authenticate";

describe("Authentication module", function(){
    describe("Signing and validating tokens", function(){
        const signed = signToken("test");

        expect(signed).to.have.property("token");
        expect(signed).to.have.property("username", "test");

        it("Valid token", function(){
            expect(validateToken(signed.token)).to.equal("test");
        });

        it("Invalid token", function(){
            expect(validateToken("not a valid token")).to.equal("");
        });
    });

    describe("Hashing and checking passwords", function(){
        it("Correct password", async function(){
            const hashed = await hashPassword("test");
            expect(await checkPassword(hashed, "test")).to.be.true;
        });

        it("Incorrect password", async function(){
            const hashed = await hashPassword("test");
            expect(await checkPassword(hashed, "incorrect")).to.be.false;
        });
    });
});
