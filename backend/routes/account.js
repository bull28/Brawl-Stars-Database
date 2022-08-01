// This route contains operations which manage user accounts

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";


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
        "INSERT IGNORE INTO " + TABLE_NAME + " (username, password, avatar, brawlers, backgrounds, trade_requests) VALUES (?, ?, ?, ?, ?, ?);",
        [username, password, "default", "{}", "[]", "[]"], (error, results, fields) => {
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

    if (token && currentPassword && newUsername !== undefined && newPassword !== undefined && newAvatar !== undefined){
        let currentUsername = validateToken(token);
        if (currentUsername == ""){
            res.status(401).send("Invalid token.");
            return;
        }

        // If the user leaves any of the new fields as empty, this means
        // they do not want them changed. Get the current values of these
        // fields first and replace any empty strings with them.
        database.queryDatabase(
        "SELECT username, password, avatar FROM " + TABLE_NAME + " WHERE username = ?;",
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
                newPassword = results[0].password;
            }
            if (newAvatar == ""){
                newAvatar = results[0].avatar;
            }

            // After all fields are set, check to make sure the user doesn't exist already
            database.queryDatabase(
            "SELECT username FROM brawl_stars_database WHERE username = ?;",
            [newUsername], (error, results, fields) => {
                if (error){
                    res.status(500).send("Could not connect to database.");
                    return;
                }
                    
                if (results.length > 0 && currentUsername != newUsername){
                    res.status(401).send("Username already exists.");
                    return;
                }

                // Update all columns of the database (new fields are guaranteed not to be empty strings)
                database.queryDatabase(
                "UPDATE brawl_stars_database SET username = ?, password = ?, avatar = ? WHERE username = ? AND password = ?;",
                [newUsername, newPassword, newAvatar, currentUsername, currentPassword], (error, results, fields) => {
                    if (error){
                        res.status(500).send("Could not connect to database.");
                        return;
                    }
                    
                    if (results.affectedRows == 0){
                        res.status(401).send("Existing username and password do not match.");
                    } else{
                        const userInfo = signToken(newUsername);
                        res.json(userInfo);
                    }
                    
                });
            });

        });
    } else{
        res.status(400).send("At least one of token, current password, or new username is missing.");
    }
});

module.exports = router;
