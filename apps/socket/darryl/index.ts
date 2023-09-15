import "dotenv/config";

import server from "./server";
let serverPort = 11601;

if (typeof process.env["SERVER_PORT"] !== "undefined"){
    const portString = process.env["SERVER_PORT"];
    if (!isNaN(+portString)){
        serverPort = parseInt(portString);
    }
}

server.listen(serverPort, () => console.log(serverPort));
