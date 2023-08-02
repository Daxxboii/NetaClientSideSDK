const path = require('path');
const mime = require('mime-types');
const fs = require('fs').promises; // Use promises with fs
const axios = require('axios');
const FormData = require('form-data');

async function submitPFP(filePath) {
    try {
        const file = await fs.readFile(filePath, { encoding: 'base64' }); // read file as base64
        const buffer = Buffer.from(file, 'base64'); // convert base64 to buffer
        const filename = path.basename(filePath); // get the filename with extension
        const mimetype = mime.lookup(filePath); // get the MIME type of the file

        const data = new FormData(); // create form data
        data.append('file', buffer, {
            filename: filename, // provide actual file name
            contentType: mimetype || 'application/octet-stream', // provide actual file type or default to 'application/octet-stream'
        });

        const response = await axios({
            method: 'POST',
            url: endpoints["/uploadpfp"],
            data: data,
            headers: {
                ...data.getHeaders(), // append form-data specific headers
                'Authorization': Cache.getString("jwt") // your custom authorization header
            },
        });

        console.log('File uploaded successfully: ', response.data);
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
}
submitPFP("C:/Users/Daxx/Downloads/mummy.png");
