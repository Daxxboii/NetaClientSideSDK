const Endpoints = require("./Endpoints.js")
var endpoint;
async function fetchEndpoint() {
  endpoint = await Endpoints.fetch()["/uploadpfp"];
}
fetchEndpoint()

const axios = require('axios');
const RNFS = require('react-native-fs'); // used to read the file
const Endpoints = require('./Endpoints.js');
var endpoint;

async function fetchEndpoint() {
    endpoint = await Endpoints.fetch()['/uploadpfp'];
}
fetchEndpoint()

async function upload(filePath) {
    try {
        const file = await RNFS.readFile(filePath, 'base64');  // read file as base64
        const data = new FormData();  // create form data
        data.append('file', {
            name: 'pfp.jpg',  // provide file name
            type: 'image/jpeg',  // provide file type
            data: file  // file data in base64 format
        });

        const response = await axios({
            method: 'POST',
            url: endpoint,
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data', // important header when uploading files
            },
        });

        console.log('File uploaded successfully: ', response.data);
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
}

module.exports = upload;