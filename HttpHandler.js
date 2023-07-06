const axios = require("axios");

async function makeSignedPostRequest(url, token, postData) {
  const MAX_RETRIES = 3;
  let lastError;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.post(url, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed. Retrying...`);
    }
  }

  console.error(`All ${MAX_RETRIES} attempts failed. Giving up.`);
  throw lastError;
}

module.exports = { makeSignedPostRequest };
