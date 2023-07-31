const axios = require('axios');

async function get(data) {
    const {uri, jwt, body, queryString, queryStr, params} = data;
    if (queryString != undefined) {
        queryStr = queryString;
        params = queryString;
    }
    if (queryStr != undefined) {
        queryString = queryStr;
        params = queryStr;
    }
    if (params != undefined) {
        queryStr = params;
        queryString = params;
    }
    return await get(uri, jwt, queryStr, body)
}
async function get(uri, jwt = null, qString = null, body = null) {
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

async function post(data) {
    const {uri, jwt, body, queryString, queryStr, params} = data;
    if (queryString != undefined) {
        queryStr = queryString;
        params = queryString;
    }
    if (queryStr != undefined) {
        queryString = queryStr;
        params = queryStr;
    }
    if (params != undefined) {
        queryStr = params;
        queryString = params;
    }
    return await post(uri, jwt, queryStr, body)
}

async function post(uri, jwt = null, qString = null, body = null) {
    let options = {
        method: 'POST',
        url: uri,
        params: qString,  // query string
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
        console.error(`Error in POST request: ${error}`);
        throw error;
    }
}

async function put(data) {
    const {uri, jwt, body, queryString, queryStr, params} = data;
    if (queryString != undefined) {
        queryStr = queryString;
        params = queryString;
    }
    if (queryStr != undefined) {
        queryString = queryStr;
        params = queryStr;
    }
    if (params != undefined) {
        queryStr = params;
        queryString = params;
    }
    return await put(uri, jwt, queryStr, body)
}

async function put(uri, jwt = null, qString = null, body = null) {
    let options = {
        method: 'PUT',
        url: uri,
        params: qString,  // query string
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
        console.error(`Error in PUT request: ${error}`);
        throw error;
    }
}


module.exports = {get, post, put}
