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
import report from "./routes/report";

const app = express();
app.disable("x-powered-by");
let port = 6969;

if (process.env["PORT"] !== void 0){
    const portString = process.env["PORT"];
    if (!isNaN(+portString)){
        port = parseInt(portString);
    }
}

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    (bodyParser.json())(req, res, (error) => {
        if (error !== void 0){
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
app.use("/report", report);

app.get("/bullgame", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "assets", "index.html"));
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);    
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Not Found");
});

app.listen(port, () => console.log(port));
