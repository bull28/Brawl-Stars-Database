import chai from "chai";
import chaiHttp from "chai-http";
import {createConnection, closeConnection, clearTables} from "./database_setup";

export async function mochaGlobalSetup(){
    chai.use(chaiHttp);
}

export async function mochaGlobalTeardown(){
    const connection = await createConnection();
    await clearTables(connection);
    await closeConnection(connection);
}
