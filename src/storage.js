// storage.js — Shelby S3-compatible storage integration
// sustore uses Shelby’s verifiable object storage for all product files

const AWS = require(“aws-sdk”);
require(“dotenv”).config();

// Configure Shelby S3-compatible endpoint
const shelby = new AWS.S3({
endpoint: “https://storage.shelby.xyz”,
accessKeyId: process.env.SHELBY_API_KEY,
secretAccessKey: process.env.SHELBY_SECRET_KEY,
s3ForcePathStyle: true,
signatureVersion: “v4”,
region: “global”,
});

const BUCKET = process.env.SHELBY_BUCKET || “sustore-products”;

/**

- Upload a digital product file to Shelby storage
- Returns a verifiable object URL + cryptographic receipt
  */
  async function uploadProduct(fileBuffer, fileName, metadata = {}) {
  const key = `products/${Date.now()}-${fileName}`;

const params = {
Bucket: BUCKET,
Key: key,
Body: fileBuffer,
Metadata: {
uploader: metadata.creator || “anonymous”,
category: metadata.category || “general”,
price: String(metadata.price || “0”),
},
};

const result = await shelby.upload(params).promise();

return {
url: result.Location,
key: key,
etag: result.ETag, // Cryptographic hash — verifiable proof of content
uploadedAt: new Date().toISOString(),
};
}

/**

- List all available products from Shelby storage
  */
  async function listProducts(prefix = “products/”) {
  const params = {
  Bucket: BUCKET,
  Prefix: prefix,
  };

const result = await shelby.listObjectsV2(params).promise();
return result.Contents || [];
}

/**

- Get a signed URL for a purchased product (time-limited access)
  */
  async function getDownloadUrl(key, expiresInSeconds = 3600) {
  const params = {
  Bucket: BUCKET,
  Key: key,
  Expires: expiresInSeconds,
  };

return shelby.getSignedUrlPromise(“getObject”, params);
}

/**

- Delete a product from Shelby storage
  */
  async function deleteProduct(key) {
  const params = { Bucket: BUCKET, Key: key };
  return shelby.deleteObject(params).promise();
  }

module.exports = {
uploadProduct,
listProducts,
getDownloadUrl,
deleteProduct,
};
