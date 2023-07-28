const fs = require('fs');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const KV = require('./KV.js')

const isTesting = true;
async function fetch() {
    
    if(!isTesting)downloadAllOrMissingImages(JSON.parse(await KV.fetch("Assets").data.value), "./downloads");
    else downloadAllOrMissingImages([{filename:"Daxx.png",UID:0,URI:"https://i.pinimg.com/736x/1d/99/e7/1d99e7d885f3257fd2294529b11501cf.jpg",serverHash:":3"}], "./test/downloads");
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
        const { filename, UID, URI , serverHash } = fileInfo;
        const filePath = path.join(dir, filename);
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
fetch()
module.exports = fetch();
