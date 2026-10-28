import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

function getConfigValue(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function requireEnv(key: string): string {
  const value = getConfigValue(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getPublicBaseUrl(): string {
  return requireEnv("FILEBASE_PUBLIC_URL").replace(/\/$/, "");
}

function getEndpoint(): string {
  return (getConfigValue("FILEBASE_ENDPOINT") ?? "https://s3.filebase.com").replace(/\/$/, "");
}

function getBucketName(): string {
  return requireEnv("FILEBASE_BUCKET_NAME");
}

function getAccessKeyId(): string {
  return requireEnv("FILEBASE_ACCESS_KEY_ID");
}

function getSecretAccessKey(): string {
  return requireEnv("FILEBASE_SECRET_ACCESS_KEY");
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;

  client = new S3Client({
    region: getConfigValue("FILEBASE_REGION") ?? "us-east-1",
    endpoint: getEndpoint(),
    credentials: {
      accessKeyId: getAccessKeyId(),
      secretAccessKey: getSecretAccessKey(),
    },
  });

  return client;
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export function isAllowedImageType(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  slot: string
): Promise<UploadResult> {
  if (!isAllowedImageType(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const suffix = crypto.randomBytes(4).toString("hex");
  const key = `${folder}/${slot}-${suffix}${ALLOWED_MIME_TYPES[mimeType]}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { key, url: `${getPublicBaseUrl()}/${key}` };
}

export async function deleteImage(keyOrUrl: string): Promise<void> {
  const publicBase = getPublicBaseUrl();
  const key = keyOrUrl.startsWith(publicBase)
    ? keyOrUrl.slice(publicBase.length + 1)
    : keyOrUrl;

  if (!key || !key.startsWith("products/")) return;

  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucketName(), Key: key })
  );
}

export function basename(keyOrUrl: string): string {
  return path.posix.basename(keyOrUrl);
}
