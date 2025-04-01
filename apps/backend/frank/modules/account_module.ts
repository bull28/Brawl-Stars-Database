import jsonwebtoken, {UsernameJwtPayload} from "jsonwebtoken";
import {randomBytes, scrypt, timingSafeEqual} from "crypto";
import {UserTokenResult} from "../types";

declare module "jsonwebtoken"{
    export interface UsernameJwtPayload extends JwtPayload{
        username: string;
    }
}

let secret: jsonwebtoken.Secret = "THE KING WINS AGAIN";
const saltBytes = 32;
const hashLength = 64;
const hashCost = process.env["NODE_ENV"] === "test" ? 64 : 4096;
const hashSplit = "BULL";

if (process.env["TOKEN_SECRET"] !== undefined){
    secret = process.env["TOKEN_SECRET"];
}

export function signToken(username: string): UserTokenResult{
    const user: UsernameJwtPayload = {
        "username": username
    };

    const token = jsonwebtoken.sign(user, secret);

    const userInfo: UserTokenResult = {
        "token": token,
        "username": username
    };

    return userInfo;
}

export function validateToken(token: string): string{
    try{
        const data = jsonwebtoken.verify(token, secret) as UsernameJwtPayload;

        if (data.username === undefined){
            return "";
        }
        return data.username;
    } catch (error){
        return "";
    }
}

export async function hashPassword(password: string): Promise<string>{
    return new Promise((resolve, reject) => {
        const salt = randomBytes(saltBytes).toString("hex");
        scrypt(password, salt, hashLength, {cost: hashCost}, (error, passwordHash) => {
            if (error !== null){
                reject(error);
            }
            resolve(`${passwordHash.toString("hex")}${hashSplit}${salt}`);
        });
    });
}

export async function checkPassword(stored: string, password: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
        const storedValues = stored.split(hashSplit);
        if (storedValues.length !== 2){
            reject(new Error("Database is not set up properly."));
        }

        const storedHash = Buffer.from(storedValues[0], "hex");
        const salt = storedValues[1];
        scrypt(password, salt, hashLength, {cost: hashCost}, (error, passwordHash) => {
            if (error !== null){
                reject(error);
            }
            resolve(timingSafeEqual(storedHash, passwordHash));
        });
    });
}
