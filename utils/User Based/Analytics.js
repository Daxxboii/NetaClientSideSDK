const AxiosSigned = require("../AxiosSigned.js");
const Cache = require("../Cache.js");
const Endpoints = require("../Endpoints.js");
var endpoints;



async function fetchEndpoints() {
    endpoints = await Endpoints.fetch();
}

fetchEndpoints()

//#region Analytics 
//event = { event: "Ni", phoneNumber: "734873487348", value: "ahshshs" }
async function SendAnalytics(event) {
    const endpoint = endpoints["/RecordEvent"];
    const jwt = Cache.getString("jwt");
    const res = await AxiosSigned.get(endpoint, jwt, event, null);
    return res;
}

//#endregion

module.exports = {SendAnalytics};