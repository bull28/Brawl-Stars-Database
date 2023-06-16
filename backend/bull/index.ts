import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import "dotenv/config";

import brawler from "./routes/brawler";
import map from "./routes/map";
import event from "./routes/event";
import account from "./routes/account";
import collection from "./routes/collection";
import tradesview from "./routes/tradesview";
import tradesmodify from "./routes/tradesmodify";
import challenge from "./routes/challenge";

import server from "./server";

const app = express();
let port = 6969;
let serverPort = 11600;

if (typeof process.env["PORT"] !== "undefined"){
    const portString = process.env["PORT"];
    if (!isNaN(+portString)){
        port = parseInt(portString);
    }
} if (typeof process.env["SERVER_PORT"] !== "undefined"){
    const portString = process.env["SERVER_PORT"];
    if (!isNaN(+portString)){
        serverPort = parseInt(portString);
    }
}

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    (bodyParser.json())(req, res, (error) => {
        if (typeof error !== "undefined"){
            res.status(400).send("Incorrectly formatted json.");
            return;
        }
        next();
    });
});

app.use("/image", express.static(path.join("assets", "images")));

app.use("/", brawler);
app.use("/", map);
app.use("/event", event);
app.use("/", account);
app.use("/", collection);
app.use("/trade", tradesview);
app.use("/trade", tradesmodify);
app.use("/challenge", challenge);

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);    
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
});

app.listen(port, () => console.log(port));

server.listen(serverPort, () => console.log(serverPort));
