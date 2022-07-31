// This route contains operations which manage user accounts

const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");

// Methods to query the database are contained in this module
const database = require("../modules/database");
const TABLE_NAME = process.env.DATABASE_TABLE_NAME || "brawl_stars_database";


/**
 * Creates a new json web token for a user, based on their username.
 * @param {Array} results all results from the database that match the query
 * @returns token if succesful, empty string otherwise
 */
function login(results){
    if (results.length > 0) {
        const user = {
            "username": results[0].username
        }
    
        const token = jsonwebtoken.sign(user, "THE KING WINS AGAIN");
        return token;
    }
    return "";
}


//----------------------------------------------------------------------------------------------------------------------

// Accepts user credentials and return a token if they are valid
router.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password){
        database.queryDatabase("SELECT username FROM " + TABLE_NAME + " WHERE username = ? AND password = ?", [username, password], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }
            // At this point, the query was successful (error was not found) so
            // either the login is successful or the username/password are incorrect
            const token = login(results);
            if (token == ""){
                res.status(401).send("Incorrect username or password");
            } else{
                res.send(token);
            }
        });
    } else{
        res.status(400).send("Username or password is missing.");
    }
});


// Creates a new account then returns a token with the given credentials
router.post("/signup", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password){
        database.queryDatabase("INSERT IGNORE INTO " + TABLE_NAME + " (username, password, brawlers) VALUES (?, ?, ?);", [username, password, "[]"], (error, results, fields) => {
            if (error){
                res.status(500).send("Could not connect to database.");
                return;
            }

            if (results.affectedRows == 0){
                res.status(401).send("Username already exists.");
            } else{
                database.queryDatabase("SELECT username FROM " + TABLE_NAME + " WHERE username = ? AND password = ?", [username, password], (error, results, fields) => {
                    if (error){
                        res.status(500).send("Could not connect to database.");
                        return;
                    }
                    // At this point, the query was successful (error was not found) so
                    // either the login is successful or the username/password are incorrect
                    const token = login(results);
                    if (token == ""){
                        res.status(401).send("Incorrect username or password");
                    } else{
                        res.send(token);
                    }
                });
            }
        });
    } else{
        res.status(400).send("Username or password is missing.");
    }
});

module.exports = router;
