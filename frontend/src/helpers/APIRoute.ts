let api = "http://localhost:6969";

if (typeof process.env["REACT_APP_API"] !== "undefined"){
    api = process.env["REACT_APP_API"];
} else if (process.env.NODE_ENV !== "production"){
    api = "";
}

export let server = "http://localhost:11600";
if (typeof process.env["REACT_APP_SERVER"] !== "undefined"){
    server = process.env["REACT_APP_SERVER"];
}

export default api;
