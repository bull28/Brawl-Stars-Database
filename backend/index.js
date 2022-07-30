const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 6969;

const brawler = require("./routes/brawler");
const map = require("./routes/map");
const event = require("./routes/event");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            res.status(400).send("Incorrectly formatted json.");
            return;
        }
        next();
    });
});

// Serves static image and model files
app.use("/image", express.static(path.join("assets", "images")));

// Main routes
app.use("/", brawler);
app.use("/", map);
app.use("/event", event);

// Error handler
app.use((error, req, res, next) => {
    console.error(error.stack);//??????????????
    if (error.type == "FILE_DOES_NOT_EXIST"){
        res.send("ASH THREW THAT FILE IN THE TRASH ! ! !");
    }
    
    next();
});

app.listen(port, () => console.log(port));
