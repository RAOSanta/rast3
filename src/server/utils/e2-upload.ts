import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const E2_BUCKET = process.env.E2_BUCKET!;
const E2_ACCESS_KEY = process.env.E2_ACCESS_KEY!;
const E2_SECRET_KEY = process.env.E2_SECRET_KEY!;
const E2_ENDPOINT = process.env.E2_ENDPOINT!; // e.g. https://xxxx.idrivee2-xx.com

export const e2Client = new S3Client({
  region: "us-east-1", // E2 is S3-compatible, region is arbitrary
  endpoint: E2_ENDPOINT,
  credentials: {
    accessKeyId: E2_ACCESS_KEY,
    secretAccessKey: E2_SECRET_KEY,
  },
  forcePathStyle: true,
});

export async function uploadToE2(buffer: Buffer, mimetype: string): Promise<string> {
  const key = `kudos/${uuidv4()}`;
  await e2Client.send(
    new PutObjectCommand({
      Bucket: E2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
    })
  );
  return `${E2_ENDPOINT.replace(/\/$/, "")}/${E2_BUCKET}/${key}`;
}

export async function deleteFromE2(url: string): Promise<void> {
  try {
    // Extract the key from the URL
    const key = url.split(`/${E2_BUCKET}/`)[1];
    if (!key) {
      console.warn('Could not extract key from URL:', url);
      return;
    }
    
    await e2Client.send(
      new DeleteObjectCommand({
        Bucket: E2_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Error deleting file from E2:', error);
    // Don't throw - we don't want to fail the entire operation if file cleanup fails
  }
}
