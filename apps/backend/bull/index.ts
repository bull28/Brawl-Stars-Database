import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import "dotenv/config";

import brawler from "./routes/brawler";
import map from "./routes/map";
import event from "./routes/event";
import account from "./routes/account";
import collection from "./routes/collection";
import tradesview from "./routes/tradesview";
import tradesmodify from "./routes/tradesmodify";
import report from "./routes/report";
import accessory from "./routes/accessory";
import challenge from "./routes/challenge";
import bullgame from "./routes/bullgame";

const app = express();
app.disable("x-powered-by");
let port = 6969;

if (process.env["V1_PORT"] !== undefined){
    const portString = process.env["V1_PORT"];
    if (!isNaN(+portString)){
        port = parseInt(portString);
    }
}
if (process.env["NODE_ENV"] === "test" && process.env["V1_TEST_PORT"] !== undefined){
    const portString = process.env["V1_TEST_PORT"];
    if (!isNaN(+portString)){
        port = parseInt(portString);
    }
}

app.use(cors());
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    (express.json())(req, res, (error) => {
        if (error !== undefined){
            res.status(400).send("Incorrectly formatted json.");
            return;
        }
        if (typeof req.body !== "object" || req.body === null){
            req.body = {};
        }
        next();
    });
});

app.use(["/static/bullgame", "/collection", "/skinsearch"], compression({threshold: 8192}));
app.use("/image", express.static(path.join("assets")));
app.use("/static", express.static(path.join("assets")));

app.get("/", (req, res) => {
    res.send("FRANK API");
});

app.use("/", brawler);
app.use("/", map);
app.use("/event", event);
app.use("/", account);
app.use("/", collection);
app.use("/trade", tradesview);
app.use("/trade", tradesmodify);
app.use("/report", report);
app.use("/accessory", accessory);
app.use("/challenge", challenge);
app.use("/bullgame", bullgame);

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
});

app.listen(port, () => console.log(port));

export default app;
