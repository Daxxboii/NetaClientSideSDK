const fs = require('fs');
const axios = require('axios');
const path = require('path');

//Use Jacob's Signed Request script to fetch the update data from the server

async function DownloadAllOrMissingImages(data, dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    let updateInfo = { files: [] };
    if (fs.existsSync(path.join(dir, 'UpdateInfo.json'))) {
        updateInfo = JSON.parse(fs.readFileSync(path.join(dir, 'UpdateInfo.json'), 'utf8'));
    }

    const updatedUpdateInfo = { files: [] };
    
    for (const fileInfo of data) {
        const { filename, UID, URI } = fileInfo;
        const filePath = path.join(dir, filename);

        // Check if file marked as downloaded is deleted
        const fileInfoInUpdateInfo = updateInfo.files.find(file => file.UID === UID);
        if (fileInfoInUpdateInfo && fileInfoInUpdateInfo.status === true && !fs.existsSync(filePath)) {
            console.log(`File ${filename} was marked as downloaded but is missing. Attempting to re-download...`);
        }

        if (!fs.existsSync(filePath) || (fileInfoInUpdateInfo && fileInfoInUpdateInfo.status === true && !fs.existsSync(filePath))) {
            try {
                console.log(`Downloading ${filename} from ${URI}`);
                const response = await axios.get(URI, { responseType: 'stream' });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                console.log(`Downloaded ${filename}`);
                
                updatedUpdateInfo.files.push({ UID, status: true });
            } catch (err) {
                console.log(`Failed to download ${filename}:`, err.message);
                updatedUpdateInfo.files.push({ UID, status: false });
            }
        } else {
            // If the file exists and its status hasn't changed, we keep the previous status
            updatedUpdateInfo.files.push(fileInfoInUpdateInfo);
        }
    }
    fs.writeFileSync(path.join(dir, 'UpdateInfo.json'), JSON.stringify(updatedUpdateInfo, null, 2));
    console.log('UpdateInfo.json has been updated.');
}



