import mysql2, {PoolConnection, RowDataPacket, ResultSetHeader} from "mysql2/promise";

class EmptyResultsError extends Error{
    ash: number;

    constructor(message: string){
        super(message);
        this.ash = 404;
    }
}

class NoUpdateError extends Error{
    frank: number;

    constructor(message: string){
        super(message);
        this.frank = 500;
    }
}


export const databaseLogin: mysql2.PoolOptions = {
    host: "localhost",
    port: 3306,
    user: "username",
    password: "password",
    database: "database",
    connectionLimit: 12,
    maxIdle: 12
};

export const tables = {
    users: "users",
    challenges: "challenges"
};


// Read environment variables first before connecting
let success = true;

if (process.env["DATABASE_HOST"] !== undefined){
    databaseLogin.host = process.env["DATABASE_HOST"];
} else{
    console.log("No database host provided.");
    success = false;
}

if (process.env["DATABASE_PORT"] !== undefined){
    const portString = process.env["DATABASE_PORT"];
    if (isNaN(+portString) === false){
        databaseLogin.port = parseInt(portString);
    }
} if (process.env["DATABASE_USER"] !== undefined){
    databaseLogin.user = process.env["DATABASE_USER"];
} if (process.env["DATABASE_PASSWORD"] !== undefined){
    databaseLogin.password = process.env["DATABASE_PASSWORD"];
}
if (process.env["NODE_ENV"] === "test"){
    if (process.env["TEST_DATABASE_NAME"] !== undefined){
        databaseLogin.database = process.env["TEST_DATABASE_NAME"];
    }
} else if (process.env["DATABASE_NAME"] !== undefined){
    databaseLogin.database = process.env["DATABASE_NAME"];
}

if (process.env["TABLE_NAME"] !== undefined){
    tables.users = process.env["TABLE_NAME"];
} if (process.env["CHALLENGE_TABLE_NAME"] !== undefined){
    tables.challenges = process.env["CHALLENGE_TABLE_NAME"];
}


const pool = mysql2.createPool(databaseLogin);


if (success === true){
    pool.query("SELECT 69", []).catch((error) => {
        if (error !== null && error !== undefined){
            console.log("Could not connect to database.");
            success = false;
        }
    });
}


process.on("SIGINT", async () => {
    try{
        await pool.end();
        console.log("Database connection ended");
    } catch(error){
        throw new Error("ASH THREW YOUR CONNECTION IN THE TRASH ! ! !");
    }
    process.kill(process.pid, "SIGINT");
});


function isDatabaseError(error: Error): error is mysql2.QueryError{
    return ((error as mysql2.QueryError).errno !== undefined);
}

function isEmptyResultsError(error: Error): error is EmptyResultsError{
    return ((error as EmptyResultsError).ash !== undefined);
}

function isNoUpdateError(error: Error): error is NoUpdateError{
    return ((error as NoUpdateError).frank !== undefined);
}

/**
 * Gets the message and status code for an error when a route callback fails.
 * @param reason promise rejection reason
 * @returns error status code and message
 */
export function getErrorMessage(error: Error): {status: number; message: string;}{
    if (isDatabaseError(error)){
        // This represents sql errors (duplicate primary key, foreign key violated, ...)
        if (error.errno === 1062){
            // Duplicate primary key
            if (error.message.includes(`${tables.users}.PRIMARY`) === true){
                return {status: 401, message: "Username is already taken."};
            }
            return {status: 401, message: "Username (or something else) already exists."};
        } else if (error.errno === 1644){
            // Trigger threw an error
            return {status: 403, message: error.message};
        }
        return {status: 500, message: "Could not connect to database."};
    } else if (isEmptyResultsError(error)){
        return {status: error.ash, message: error.message};
    } else if (isNoUpdateError(error)){
        return {status: error.frank, message: error.message};
    } else if (typeof error.message === "string"){
        // This represents all other errors (no connection, king golm, ...)
        return {status: 500, message: error.message};
    }
    // Otherwise, send a generic error message
    return {status: 500, message: "Some other error occurred."};
}


/**
 * Queries the database with the given prepared statement and values. Returns a promise that resolves to the result if
 * successful, or throws the error from the database if unsuccessful. This function should only be used when the query
 * returns results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowEmptyResults whether or not to allow an empty results array (true) or throw an error (false)
 * @param query sql query string
 * @returns promise resolving to the result
 */
export async function queryDatabase<Result>(values: (string | number | Uint8Array)[], allowEmptyResults: boolean, query: string): Promise<(Result & RowDataPacket)[]>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    const connection = pool;
    const [results] = await connection.query<(Result & RowDataPacket)[]>(query, values);
    if (results.length === 0 && allowEmptyResults === false){
        throw new EmptyResultsError("Could not find the content in the database.");
    }
    return results;
}

/**
 * Executes an update to the database with the given prepared statement and values. Returns a promise that resolves to a
 * result set header if successful, or throws the error from the database if unsuccessful. This function should only be
 * used when the query does not return results.
 * @param connection database connection
 * @param values prepared statement values
 * @param allowNoUpdate whether or not to allow updating no rows (true) or to throw an error (false)
 * @param query sql query string
 * @returns promise resolving to the result set header
 */
export async function updateDatabase(values: (string | number | Uint8Array)[], allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    const connection = pool;
    const [results] = await connection.query<ResultSetHeader>(query, values);
    if (results.affectedRows === 0 && allowNoUpdate === false){
        throw new NoUpdateError("Could not update the database.");
    }
    return results;
}

/**
 * Executes an update to the database with the given prepared statement and values. Returns a promise that resolves to a
 * result set header if successful, or throws the error from the database if unsuccessful. This function should only be
 * used during a transaction involving multiple updates.
 * @param connection single connection from a pool
 * @param values prepared statement values
 * @param allowNoUpdate whether or not to throw an error when no rows were updated
 * @param query sql query string
 * @returns promise resolving to the result set header
 */
export async function transactionUpdate(connection: PoolConnection, values: (string | number | Uint8Array)[], allowNoUpdate: boolean, query: string): Promise<ResultSetHeader>{
    const [results] = await connection.query<ResultSetHeader>(query, values);
    if (results.affectedRows === 0 && allowNoUpdate === false){
        //await connection.rollback();
        throw new NoUpdateError("Could not update the database.");
    }
    return results;
}

/**
 * Starts a transaction, executes queries, then commits to the database. The queries executed in the callback should
 * use transactionUpdate instead of updateDatabase because they must rollback if there is an error.
 * @param callback function that executes the queries using transactionUpdate
 * @returns empty promise
 */
export async function transaction(callback: (connection: PoolConnection) => Promise<void>): Promise<void>{
    if (success === false){
        throw new Error("Could not connect to database.");
    }
    try{
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try{
            await callback(connection);
        } catch (error){
            await connection.rollback();
            pool.releaseConnection(connection);
            throw error;
        }

        try{
            await connection.commit();
            pool.releaseConnection(connection);
            return;
        } catch (error){
            await connection.rollback();
            pool.releaseConnection(connection);
            throw error;
        }
    } catch(error){
        throw new Error("Could not connect to database.");
    }
}
