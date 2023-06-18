let api = "http://localhost:6969";

if (process.env.NODE_ENV !== "production"){
    api = "";
}

export let server = "http://localhost:11600";

export default api;
