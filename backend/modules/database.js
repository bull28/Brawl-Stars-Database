const mysql2 = require("mysql2");

const databaseLogin = {
    host     : "localhost",
    user     : "bull",
    password : "darryl_roll",
    database : "bull2"
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


function queryDatabase(query, values, callback){
    if (success){
        connection.query(query, values, callback);
        return;
    }
    callback(new Error("ASH ERROR"), [], "");
}


// When ctrl+c is used then close the connection
// This function gets executed on "SIGINT" which is sent on ctrl+c
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
    closeConnection(() => {
        process.kill(process.pid, "SIGINT");
    });
});


exports.queryDatabase = queryDatabase;
