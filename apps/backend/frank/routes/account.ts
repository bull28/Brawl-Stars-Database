import express from "express";
import {createError} from "../modules/utils";
import {signToken, hashPassword, checkPassword} from "../modules/account_module";
import {databaseErrorHandler, loginErrorHandler, userLogin, createNewUser, updateAccount} from "../modules/database";
import {Empty} from "../types";

const router = express.Router();


interface AuthReqBody{
    menuTheme: string;
}

interface LoginReqBody{
    username: string;
    password: string;
}

interface UpdateReqBody{
    currentPassword?: string;
    newPassword?: string;
    menuTheme?: string;
}

// Usernames must match this pattern
const validUsername = new RegExp(/^[A-Za-z0-9_]+$/);

// Validates a user's token
router.get("/authenticate", loginErrorHandler<Empty, AuthReqBody>(async (req, res, username) => {
    if (req.query.menuTheme === undefined){
        res.json({username: username});
        return;
    }

    const login = await userLogin({username: username});
    if (login === undefined){
        res.status(401).json(createError("GeneralTokenInvalid"));
        return;
    }

    res.json({
        username: login.username,
        menuTheme: login.menu_theme
    });
}));

// Accepts user credentials and returns a token if they are valid
router.post<Empty, Empty, LoginReqBody>("/login", databaseErrorHandler<LoginReqBody>(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (typeof username !== "string" || typeof password !== "string"){
        res.status(400).json(createError("LoginMissing"));
        return;
    }
    const login = await userLogin({username: username});

    if (login === undefined){
        // This actually means the account was not found but telling the user may reveal more information than needed
        res.status(401).json(createError("LoginIncorrect"));
        return;
    }
    if (typeof login.password !== "string"){
        res.status(500).json(createError("GeneralServerError"));
        return;
    }

    const match = await checkPassword(login.password, password);
    if (match === false){
        res.status(401).json(createError("LoginIncorrect"));
        return;
    }

    const userInfo = signToken(login.username);
    res.json(userInfo);
}));

// Creates a new account then returns a token with the given credentials
router.post<Empty, Empty, LoginReqBody>("/signup", databaseErrorHandler<LoginReqBody>(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if ((typeof username === "string" && typeof password === "string") === false){
        res.status(400).json(createError("LoginMissing"));
        return;
    }

    if (username.length > 20 || password.length > 100){
        res.status(400).json(createError("SignupLongUsername"));
        return;
    }
    if (username.length < 2 || password.length < 3){
        res.status(400).json(createError("SignupShortUsername"));
        return;
    }
    if (validUsername.test(username) === false){
        res.status(400).json(createError("SignupInvalidUsername"));
        return;
    }

    const hash = await hashPassword(password);

    await createNewUser({
        username: username,
        password: hash
    });

    const userInfo = signToken(username);
    res.json(userInfo);
}));

// Updates an account's information
router.post<Empty, Empty, UpdateReqBody>("/update", loginErrorHandler<UpdateReqBody>(async (req, res, currentUsername) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const newTheme = req.body.menuTheme;

    if (typeof newPassword !== "string" && typeof newTheme !== "string"){
        //const userInfo = signToken(currentUsername);
        //res.json(userInfo);
        res.json({message: "Account successfully updated."});
        return;
    }
    if (newPassword !== undefined && newPassword.length < 3){
        res.status(400).json(createError("UpdateShortPassword"));
        return;
    }

    // If the user leaves any of the new fields as empty, this means they do not want them changed. Get the current
    // values of these fields first and replace any empty strings with them.

    const login = await userLogin({username: currentUsername});
    if (login === undefined){
        res.status(404).json(createError("LoginIncorrect"));
        return;
    }

    // By default, the password will not be changed so set the new password hash to the same as what was already there.
    // If the user specifies a non-empty string as a new password, check their current password and if it is valid,
    // hash their new password then set their password to that.
    let newPasswordHash = login.password;
    let menuTheme = login.menu_theme;

    if (newPassword !== undefined){
        if (currentPassword === undefined){
            res.status(400).json(createError("UpdateMissing"));
            return;
        }

        const match = await checkPassword(login.password, currentPassword);
        if (match === false){
            res.status(401).json(createError("UpdateIncorrect"));
            return;
        }

        newPasswordHash = await hashPassword(newPassword);
    }
    if (newTheme !== undefined){
        menuTheme = newTheme.slice(0, 15);
    }

    await updateAccount({
        newPassword: newPasswordHash,
        newTheme: menuTheme,
        username: currentUsername
    });

    //const userInfo = signToken(currentUsername);
    //res.json(userInfo);
    res.json({message: "Account successfully updated."});
}));


export default router;
