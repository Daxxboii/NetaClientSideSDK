var HttpHandler = require("./HttpHandler");

const KV_endpoint = "url";//TBD
const token = "token";//TBD


async function fetch(key) {
    var params = undefined
    if (!key.isArray()) {
        params = {"key":key}
    } else {
        params = {"keys":key}
    }
    return await HttpHandler.makeSignedPostRequest(KV_endpoint,token,params);
} 

module.exports = { fetch };