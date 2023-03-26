const mysql2 = require("mysql2");

const databaseLogin = {
    host     : "localhost",
    port     : 3306,
    user     : "username",
    password : "password",
    database : "database_name"
};

const tableNames = {
    main: "users",
    trades: "trades",
    cosmetics: "cosmetics"
};

if (typeof process.env.DATABASE_HOST != "undefined"){
    databaseLogin.host = process.env.DATABASE_HOST;
} if (typeof process.env.DATABASE_PORT != "undefined"){
    const portString = process.env.DATABASE_PORT;
    if (isNaN(portString) == false){
        databaseLogin.port = parseInt(portString);
    }
} if (typeof process.env.DATABASE_USER != "undefined"){
    databaseLogin.user = process.env.DATABASE_USER;
} if (typeof process.env.DATABASE_PASSWORD != "undefined"){
    databaseLogin.password = process.env.DATABASE_PASSWORD;
} if (typeof process.env.DATABASE_NAME != "undefined"){
    databaseLogin.database = process.env.DATABASE_NAME;
} if (typeof process.env.DATABASE_TABLE_NAME != "undefined"){
    tableNames.main = process.env.DATABASE_TABLE_NAME;
} if (typeof process.env.DATABASE_TRADE_TABLE_NAME != "undefined"){
    tableNames.trades = process.env.DATABASE_TRADE_TABLE_NAME;
} if (typeof process.env.DATABASE_COSMETIC_TABLE_NAME != "undefined"){
    tableNames.cosmetics = process.env.DATABASE_COSMETIC_TABLE_NAME;
}

const connection = mysql2.createConnection(databaseLogin);

// Having a variable which checks whether the connection is successful
// instead of throwing an error when trying to connect allows the app
// to continue running even if the connection was unsuccessful. Other
// features of the app can be used even if this happens.
let success = true;

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
exports.tableNames = tableNames;
