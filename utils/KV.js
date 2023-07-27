const AxiosSigned = require("./AxiosSigned.js");
const Endpoints = require("./Endpoints.js")
const endpoint = "https://replace_with_endpoint/getKV"

async function fetch(key) {
    var params = undefined
    if (!key.isArray()) {
        params = {"key":key}
    } else {
        params = {"keys":key}
    }
    return await AxiosSigned.get({uri : endpoint, queryString : params})
} 

module.exports = { fetch };