const jsonwebtoken = require("jsonwebtoken");

const secret = "THE KING WINS AGAIN";

/**
 * Creates a new json web token for the given username.
 * @param {String} username username to sign the token with
 * @returns json object with the token and the username
 */
function signToken(username){
    const user = {
        "username": username
    };

    const token = jsonwebtoken.sign(user, secret);

    const userInfo = {
        "token": token,
        "username": username
    };

    return userInfo;
}


/**
 * Checks whether a token is valid and returns the username that the
 * token belongs to. If the token is not valid, returns an empty string.
 * Errors will be processed using the result of this function.
 * @param {Object} token the token to check
 * @returns username the token belongs to
 */
 function validateToken(token){
    try{
        const data = jsonwebtoken.verify(token, secret);
            
        if (data.username == undefined){
            return "";
        }
        return data.username;
    } catch(error){
        return "";
    }
}

exports.signToken = signToken;
exports.validateToken = validateToken;
