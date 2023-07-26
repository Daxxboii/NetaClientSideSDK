const axios = require('axios');

async function get(uri, jwt = null, qStringJson = null, body = null) {
    let options = {
        method: 'GET',
        url: uri,
        params: qStringJson,  // query string in the form of JSON
        data: body,  // body data
    };

    // Add authorization header if jwt token is provided
    if (jwt) {
        options.headers = {
            'Authorization': jwt
        };
    }

    try {
        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.error(`Error in GET request: ${error}`);
        throw error;
    }
}
