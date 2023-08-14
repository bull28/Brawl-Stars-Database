let cdn = "http://localhost:6969";

if (process.env["REACT_APP_CDN"] !== void 0){
    cdn = process.env["REACT_APP_CDN"];
}

export default cdn;