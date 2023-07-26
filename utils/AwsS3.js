const Endpoints = require("./Endpoints.js")
var endpoint;
async function fetchEndpoint() {
  endpoint = await Endpoints.fetch()["/uploadpfp"];
}
fetchEndpoint()

function fetch(filePath) {
  /// use axios to upload file to endpoint
}

module.exports = UploadToS3;
