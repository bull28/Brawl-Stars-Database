// This route contains operations which manage user accounts

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";

// functions to view and modify a pin collections
const pins = require("../modules/pins");
const fileLoader = require("../modules/fileloader");

// Load the skins json object
var allSkins = [];
const allSkinsPromise = fileLoader.allSkinsPromise;
allSkinsPromise.then((data) => {
    if (data !== undefined){
        allSkins = data;
    }
});

// Load the avatars
var allAvatars = {"free": [], "special": []};
const freeAvatarsPromise = fileLoader.freeAvatarsPromise;
freeAvatarsPromise.then((data) => {
    if (data !== undefined){
        allAvatars.free = data;
    }
});
const specialAvatarsPromise = fileLoader.specialAvatarsPromise;
specialAvatarsPromise.then((data) => {
    if (data !== undefined){
        allAvatars.special = data;
    }
});


/**
 * Creates a new json web token for the given username.
 * @param {String} username username to sign the token with
 * @returns json object with the token and the username
 */
function signToken(username){
    const user = {
        "username": username
    };

    const token = jsonwebtoken.sign(user, "THE KING WINS AGAIN");

    const userInfo = {
        "token": token,
        "username": username
    };

    return userInfo;
}


/**
 * Checks whether a token is valid and returns the username that the
 * token belongs to. If the token is not valid, returns an empty string.
 * Errors will be processed using the result of this function.
 * @param {Object} token the token to check
 * @returns username the token belongs to
 */
 function validateToken(token){
    try{
        const data = jsonwebtoken.verify(token, "THE KING WINS AGAIN");
            
        if (data.username === undefined){
            return "";
        }
        return data.username;
    } catch(error){
        return "";
    }
}


/**
 * Creates a new json web token for a user, based on their username.
 * @param {Array} results all results from the database that match the query
 * @returns token if succesful, empty string otherwise
 */
function login(results, res){
    if (results.length > 0) {
        if (!(results[0].hasOwnProperty("username"))){
            res.status(500).send("Database is not set up properly.");
            return;
        }

        const userInfo = signToken(results[0].username);
        res.json(userInfo);
    } else{
        res.status(401).send("Incorrect username or password");
    }
}


//----------------------------------------------------------------------------------------------------------------------

// Accepts user credentials and return a token if they are valid
router.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password){
        database.queryDatabase(
        "SELECT username FROM " + TABLE_NAME + " WHERE username = ? AND password = ?;",
        [username, password], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }
            // At this point, the query was successful (error was not found) so
            // either the login is successful or the username/password are incorrect
            login(results, res);
        });
    } else{
        res.status(400).send("Username or password is missing.");
    }
});

// Creates a new account then returns a token with the given credentials
router.post("/signup", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (username.length > 30 || password.length > 100){
        res.status(400).send("Username or password is too long. Maximum username length is 30 and password length is 100.");
        return;
    }
    if (username && password){
        database.queryDatabase(
        "INSERT IGNORE INTO " + TABLE_NAME +
        " (username, password, active_avatar, brawlers, avatars, backgrounds, trade_requests) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [username, password, "avatars/free/default.webp", "{}", "[]", "[]", "[]"], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }

            if (results.affectedRows == 0){
                res.status(401).send("Username already exists.");
            } else{
                database.queryDatabase(
                "SELECT username FROM " + TABLE_NAME + " WHERE username = ? AND password = ?;",
                [username, password], (error, results, fields) => {
                    if (error){
                        res.status(500).send("Could not connect to database.");
                        return;
                    }
                    // At this point, the query was successful (error was not found) so
                    // either the login is successful or the username/password are incorrect
                    login(results, res);
                });
            }
        });
    } else{
        res.status(400).send("Username or password is missing.");
    }
});

// Updates an account's information
router.post("/update", (req, res) => {
    let token = req.body.token;
    let currentPassword = req.body.currentPassword;
    let newUsername = req.body.newUsername;
    let newPassword = req.body.newPassword;
    let newAvatar = req.body.newAvatar;

    if (token && newUsername !== undefined && newPassword !== undefined && newAvatar !== undefined){
        let currentUsername = validateToken(token);
        if (currentUsername == ""){
            res.status(401).send("Invalid token.");
            return;
        }

        // If the user leaves any of the new fields as empty, this means
        // they do not want them changed. Get the current values of these
        // fields first and replace any empty strings with them.
        database.queryDatabase(
        "SELECT username, password, active_avatar, brawlers, avatars FROM " + TABLE_NAME + " WHERE username = ?;",
        [currentUsername], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }
            if (results.length == 0){
                res.status(404).send("Could not find the user in the database.");
                return;
            }

            if (newUsername == ""){
                newUsername = results[0].username;
            }

            if (newPassword == ""){
                currentPassword = results[0].password;
                newPassword = results[0].password;
            } else{
                if (currentPassword === undefined){
                    res.status(400).send("Current password is required to change password.");
                    return;
                }
            }

            if (newAvatar == ""){
                // Do not check the avatar if they are not planning on changing it
                // It's fine to keep it, if for some reason they have an invalid avatar
                newAvatar = results[0].active_avatar;
            } else{
                // Check to make sure the user's new avatar is unlocked
                const avatarsInfo = pins.getAvatars(allSkins, allAvatars, results[0].brawlers, results[0].avatars);
                if (!(avatarsInfo.includes(newAvatar))){
                    res.status(403).send("You are not allowed to use that avatar.");
                    return;
                }
            }

            // After all fields are set, check to make sure the user doesn't exist already
            database.queryDatabase(
            "SELECT username FROM " + TABLE_NAME + " WHERE username = ?;",
            [newUsername], (error, results, fields) => {
                if (error){
                    res.status(500).send("Could not connect to database.");
                    return;
                }
                    
                if (results.length > 0 && currentUsername.toLowerCase() != newUsername.toLowerCase()){
                    res.status(401).send("Username already exists.");
                    return;
                }

                // Update all columns of the database (new fields are guaranteed not to be empty strings)
                database.queryDatabase(
                "UPDATE " + TABLE_NAME + " SET username = ?, password = ?, active_avatar = ? WHERE username = ? AND password = ?;",
                [newUsername, newPassword, newAvatar, currentUsername, currentPassword], (error, results, fields) => {
                    if (error){
                        res.status(500).send("Could not connect to database.");
                        return;
                    }

                    if (results.affectedRows == 0){
                        res.status(401).send("Current password is incorrect.");
                    } else{
                        const userInfo = signToken(newUsername);
                        res.json(userInfo);
                    }
                    
                });
            });
        });
    } else{
        res.status(400).send("Token is missing.");
    }
});

// 
router.post("/avatar", (req, res) => {
    if (!(req.body.token)){
        res.status(400).send("Token is missing.");
        return;
    }
    let username = validateToken(req.body.token);

    if (username){
        database.queryDatabase(
        "SELECT brawlers, avatars FROM " + TABLE_NAME + " WHERE username = ?;",
        [username], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }
            if (results.length == 0){
                res.status(404).send("Could not find the user in the database.");
                return;
            }

            const avatarsInfo = pins.getAvatars(allSkins, allAvatars, results[0].brawlers, results[0].avatars);
            res.json(avatarsInfo);
        });
    } else{
        res.status(401).send("Invalid token.");
    }
});

module.exports = router;
