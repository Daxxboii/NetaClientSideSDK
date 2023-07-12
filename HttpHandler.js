const axios = require("axios");
const aws4 = require("aws4");

async function makeSignedPostRequest(endpoint, token, params) {
  const MAX_RETRIES = 3;
  let lastError;
  var host = endpoint
  .replace("https://", "")
  .replace("http://", "");

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const signedRequest = aws4.sign(
        {
          host: host,
          method: "POST",
          url: endpoint,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: params,
        },
        {
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        }
      );

      const response = await axios(signedRequest);
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed. Retrying...`);
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed. Giving up.`);
  throw lastError;
}

//makeSignedPostRequest("https://webhook.site/71f69857-1b39-4cc3-81f8-057d01293c2a", "token", { key: "value" });
//test 
module.exports = { makeSignedPostRequest };
