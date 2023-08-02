const AxiosSigned = require("../AxiosSigned");

async function SendAnalytics() {
    const res = await AxiosSigned.get("http://localhost:3000/RecordEvent/", null, {event:"Ni",phoneNumber:"734873487348",value:"ahshshs"},null );
}

SendAnalytics();