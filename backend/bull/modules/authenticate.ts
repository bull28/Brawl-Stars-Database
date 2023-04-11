import jsonwebtoken, {UsernameJwtPayload} from "jsonwebtoken";
import {UserTokenResult} from "../types";

declare module "jsonwebtoken"{
    export interface UsernameJwtPayload extends JwtPayload{
        username: string;
    }
}

const secret: jsonwebtoken.Secret = "THE KING WINS AGAIN";

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
        const data = <UsernameJwtPayload>jsonwebtoken.verify(token, secret);
            
        if (data.username == undefined){
            return "";
        }
        return data.username;
    } catch (error){
        return "";
    }
}
