let api = "http://localhost:6969";

if (process.env["REACT_APP_API"] !== void 0){
    api = process.env["REACT_APP_API"];
} else if (process.env.NODE_ENV !== "production"){
    api = "";
}

export let server = "http://localhost:11600";
if (process.env["REACT_APP_SERVER"] !== void 0){
    server = process.env["REACT_APP_SERVER"];
}

export default api;
