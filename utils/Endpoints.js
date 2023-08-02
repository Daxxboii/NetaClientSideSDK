const KV = require("./KV.js")

var endpoints = null;

var prod = false;
async function fetch() { 
    if (endpoints != null) return endpoints;
    //Send Test Endpoint if not prod
    return endpoints = JSON.parse(await KV.fetch("endpoints").data.value);
}


module.exports = endpoints;
