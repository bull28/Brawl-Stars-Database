let api = "http://localhost:6969";

if (process.env.NODE_ENV !== "production"){
    api = "";
}

export default api;
