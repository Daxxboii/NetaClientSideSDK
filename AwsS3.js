const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({
  accessKeyId: "",//Add AccessKey
  secretAccessKey: "",//Add SecretAccessKey
  region: "", // Add Region
});

const s3 = new AWS.S3();

const bucketName = ""; // Add Bucket Name

function UploadToS3(FilePath) {
  const fileData = fs.readFileSync(FilePath);

  const params = {
    Bucket: bucketName,
    Key: FilePath,
    Body: fileData,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("File uploaded successfully:", data.Location);
    }
  });
}

module.exports = UploadToS3;
