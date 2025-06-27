import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import "dotenv/config";

import {ASSETS_ROOT_DIR} from "./data/constants";
import {createError} from "./modules/utils";
import {endConnection} from "./modules/database_access";
import brawlers from "./routes/brawlers";
import events from "./routes/events";
import account from "./routes/account";
import report from "./routes/report";
import challenge from "./routes/challenges";
import accessory from "./routes/accessories";
import resources from "./routes/resources";
import bullgame from "./routes/bullgame";

const app = express();
app.disable("x-powered-by");
let port = 6969;

if (process.env["PORT"] !== undefined){
    const portString = process.env["PORT"];
    if (!isNaN(Number(portString))){
        port = parseInt(portString);
    }
}
if (process.env["NODE_ENV"] === "test" && process.env["TEST_PORT"] !== undefined){
    const portString = process.env["TEST_PORT"];
    if (!isNaN(Number(portString))){
        port = parseInt(portString);
    }
}

app.use(cors());
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    (express.json())(req, res, (error) => {
        if (error !== undefined){
            //res.status(400).send("Incorrectly formatted json.");
            res.status(400).json(createError("GeneralInvalidJson"));
            return;
        }
        if (typeof req.body !== "object" || req.body === null){
            req.body = {};
        }
        next();
    });
});

app.use(["/static/bullgame", "/enemies"], compression({threshold: 8192}));
app.use("/static", express.static(path.resolve(ASSETS_ROOT_DIR)));

app.get("/", (req, res) => {
    res.set({"Content-Type": "text/plain"}).send("FRANK API");
});

app.use("/", brawlers);
app.use("/", events);
app.use("/", account);
app.use("/report", report);
app.use("/challenges", challenge);
app.use("/accessories", accessory);
app.use("/", resources);
app.use("/bullgame", bullgame);

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);
    next();
});

app.use((req: Request, res: Response) => {
    res.status(404).json(createError("GeneralNotFound"));
});

const server = app.listen(port, (error) => {
    if (error !== undefined){
        console.error(error);
    }
    console.log(port);
});

async function closeServer(): Promise<void>{
    let exitError = false;

    try{
        await (new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error !== undefined){
                    reject(error);
                }
                resolve();
            });
            server.closeAllConnections();
        }));
        console.log("Server closed");
    } catch (error){
        exitError = true;
        console.log(error);
    }

    try{
        await endConnection();
    } catch (error){
        exitError = true;
        console.log(error);
    }

    if (exitError === true){
        process.exit(1);
    }
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);

export default app;
