import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "test";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "test";
const endpoint = process.env.AWS_ENDPOINT;

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || "drive-clon-bucket";
