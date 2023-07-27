const fs = require('fs');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const KV = require('./KV.js')

async function fetch() {
    downloadAllOrMissingImages(JSON.parse(await KV.fetch("Assets").data.value), "./downloads");
}

async function downloadAllOrMissingImages(data, dir) {
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

        let serverHash = null;
        try {
            serverHash = (await KV.fetch(UID)).data.value;
        } catch(err) {
            console.error(`Error fetching hash from KV store for ${filename}:`, err.message);
        }

        let shouldDownload = true;
        if (fs.existsSync(filePath)) {
            const localHash = await getFileHash(filePath);
            shouldDownload = serverHash !== localHash;
        }

        if (shouldDownload) {
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
            updatedUpdateInfo.files.push({ ...fileInfo, status: true });
        }
    }
    fs.writeFileSync(path.join(dir, 'UpdateInfo.json'), JSON.stringify(updatedUpdateInfo, null, 2));
    console.log('UpdateInfo.json has been updated.');
}

async function getFileHash(path) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(path);
        
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
}

module.exports = fetch();
