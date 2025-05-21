import jsonwebtoken, {UsernameJwtPayload} from "jsonwebtoken";
import {randomBytes, scrypt, timingSafeEqual} from "crypto";
import {UserTokenResult} from "../types";

declare module "jsonwebtoken"{
    export interface UsernameJwtPayload extends JwtPayload{
        username: string;
    }
}

interface ValidateTokenResult{
    username: string;
    status: number;
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
    const user: UsernameJwtPayload = {username: username};

    const token = jsonwebtoken.sign(user, secret, {expiresIn: 604800});

    const userInfo: UserTokenResult = {token: token, username: username};

    return userInfo;
}

export function validateToken(token: string): ValidateTokenResult{
    try{
        const data = jsonwebtoken.verify(token, secret) as UsernameJwtPayload;

        if (data.username === undefined){
            return {username: "", status: 1};
        }
        return {username: data.username, status: 0};
    } catch (e){
        const error = e as Error;
        if (error.name === "TokenExpiredError"){
            return {username: "", status: 2};
        }
        if (error.name === "JsonWebTokenError"){
            return {username: "", status: 3};
        }
        return {username: "", status: 4};
    }
}

export async function hashPassword(password: string): Promise<string>{
    return new Promise((resolve, reject) => {
        randomBytes(saltBytes, (error, buffer) => {
            if (error !== null){
                reject(error);
            }
            const salt = buffer.toString("hex");
            scrypt(password, salt, hashLength, {cost: hashCost}, (error, passwordHash) => {
                if (error !== null){
                    reject(error);
                }
                resolve(`${passwordHash.toString("hex")}${hashSplit}${salt}`);
            });
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
