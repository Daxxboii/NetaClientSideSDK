var HttpHandler = require("./HttpHandler");

const KV_endpoint = "url";//TBD
const token = "token";//TBD


async function FetchDataFromKV(key) {
    var params = {"key":key};

    var data = await HttpHandler.makeSignedPostRequest(KV_endpoint,token,params);
} 

module.exports = { FetchDataFromKV };

//NOTE:JWT token is passed to the client OnUserCreation and is passed by the client to this function