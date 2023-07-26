const KV = require("./KV.js")

var endpoints = null;
async function fetch() { 
    if (endpoints != null) return endpoints;
    return endpoints = JSON.parse(await KV.fetch("endpoints").data.value);
}
fetchEndpoints();

module.exports = {fetch}
