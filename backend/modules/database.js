const mysql2 = require("mysql2");

const databaseLogin = {
    host     : process.env.DATABASE_HOST || "localhost",
    port     : process.env.DATABASE_PORT || 3306,
    user     : process.env.DATABASE_USER || "username",
    password : process.env.DATABASE_PASSWORD || "password",
    database : process.env.DATABASE_NAME || "database_name"
}

const connection = mysql2.createConnection(databaseLogin);

// Having a variable which checks whether the connection is successful
// instead of throwing an error when trying to connect allows the app
// to continue running even if the connection was unsuccessful. Other
// features of the app can be used even if this happens.
var success = true;

connection.connect((error) => {
    if (error){
        console.log("Could not connect to database.");
        success = false;
    }
});


/**
 * Sends a query to the database using the connection. The callback is
 * then executed with (error, result, fields) being passed to it.
 * @param {String} query sql query for the database
 * @param {Array} values any values to include in the query
 * @param {Function} callback function to execute after the query
 * @returns same type that the callback returns
 */
function queryDatabase(query, values, callback){
    if (success){
        connection.query(query, values, callback);
        return;
    }
    callback(new Error("ASH ERROR"), [], "");
}


/**
 * Closes an active connection then exeuctes a callback.
 * When ctrl+c is used then close the connection
 * This function gets executed on "SIGINT" which is sent on ctrl+c
 * @param {Function} callback function to execute
 */
function closeConnection(callback){
    connection.end((error) => {
        if (error){
            throw new Error("ASH THREW YOUR CONNECTION IN THE TRASH ! ! !");
        }
        console.log("Database connection ended");
    });   
    callback();
};

process.on("SIGINT", () => {
    if (success == false){
        return;
    }
    closeConnection(() => {
        process.kill(process.pid, "SIGINT");
    });
});


exports.queryDatabase = queryDatabase;
