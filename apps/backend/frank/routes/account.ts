import express from "express";
import {signToken, hashPassword, checkPassword} from "../modules/account_module";
import {databaseErrorHandler, loginErrorHandler, userLogin, createNewUser, updateAccount} from "../modules/database";
import {Empty} from "../types";

const router = express.Router();


interface LoginReqBody{
    username: string;
    password: string;
}

interface UpdateReqBody{
    currentPassword?: string;
    newPassword?: string;
    menuTheme?: string;
}

// Validates a user's token
router.get("/authenticate", loginErrorHandler(async (req, res, username) => {
    const login = await userLogin({username: username});
    if (login === undefined){
        res.status(401).send("Invalid token.");
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
        res.status(400).send("Username or password is missing.");
        return;
    }
    const login = await userLogin({username: username});

    if (login === undefined){
        // This actually means the account was not found but telling the user may reveal more information than needed
        res.status(401).send("Incorrect username or password.");
        return;
    }
    if (typeof login.password !== "string"){
        res.status(500).send("Database is not set up properly.");
        return;
    }

    const match = await checkPassword(login.password, password);
    if (match === false){
        res.status(401).send("Incorrect username or password.");
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
        res.status(400).send("Username or password is missing.");
        return;
    }

    if (username.length > 30 || password.length > 100){
        res.status(400).send("Username or password is too long. Maximum username length is 30 and password length is 100.");
        return;
    }
    if (username.length < 2 || password.length < 3){
        res.status(400).send("Username or password is too short. Minimum username length is 2 and password length is 3.");
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
        const userInfo = signToken(currentUsername);
        res.json(userInfo);
        return;
    }
    if (newPassword !== undefined && newPassword.length < 3){
        res.status(400).send("New password is too short. Minimum password length is 3.");
        return;
    }

    // If the user leaves any of the new fields as empty, this means they do not want them changed. Get the current
    // values of these fields first and replace any empty strings with them.

    const login = await userLogin({username: currentUsername});
    if (login === undefined){
        res.status(404).send("Incorrect username or password.");
        return;
    }

    // By default, the password will not be changed so set the new password hash to the same as what was already there.
    // If the user specifies a non-empty string as a new password, check their current password and if it is valid,
    // hash their new password then set their password to that.
    let newPasswordHash = login.password;
    let menuTheme = login.menu_theme;

    if (newPassword !== undefined){
        if (currentPassword === undefined){
            res.status(400).send("Current password is required to change password.");
            return;
        }

        const match = await checkPassword(login.password, currentPassword);
        if (match === false){
            res.status(401).send("Current password is incorrect.");
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

    const userInfo = signToken(currentUsername);
    res.json(userInfo);
}));


export default router;
