import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare R2 client
//
// R2 exposes an S3-compatible API. The only difference from real S3 is the
// endpoint URL, which follows the pattern:
//   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
//
// Required env vars (see .env.example):
//   R2_ACCOUNT_ID
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET_NAME
//   R2_PUBLIC_URL   — the public base URL for your bucket, e.g.
//                     https://pub-<hash>.r2.dev  (if using R2's public bucket)
//                     or your custom domain
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  const accountId = requireEnv("R2_ACCOUNT_ID");
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return _client;
}

// ── Allowed image MIME types ──────────────────────────────────────────────────

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

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  /** The key (path) stored in R2, e.g. "products/42/main-a3f9c2.jpg" */
  key: string;
  /** The full public URL to embed in <img src="..."> */
  url: string;
}

/**
 * Upload an image buffer to R2.
 *
 * @param buffer     Raw image bytes
 * @param mimeType   e.g. "image/jpeg"
 * @param folder     R2 key prefix, e.g. "products/42"
 * @param slot       "main" | "gallery-0" | "gallery-1" etc.
 */
export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  slot: string
): Promise<UploadResult> {
  if (!isAllowedImageType(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const ext = ALLOWED_MIME_TYPES[mimeType];
  // Include a short random suffix so re-uploads bust CDN cache automatically
  const suffix = crypto.randomBytes(4).toString("hex");
  const key = `${folder}/${slot}-${suffix}${ext}`;
  const bucket = requireEnv("R2_BUCKET_NAME");

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Cache images aggressively at the CDN — they change rarely
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const publicBase = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  const url = `${publicBase}/${key}`;

  return { key, url };
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete an image from R2 by its key.
 * The key is extracted from a full R2 URL by stripping the public base URL.
 */
export async function deleteImage(keyOrUrl: string): Promise<void> {
  const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ?? "";
  // If a full URL was passed, strip the base to get the key
  const key = keyOrUrl.startsWith(publicBase)
    ? keyOrUrl.slice(publicBase.length + 1) // +1 for the leading slash
    : keyOrUrl;

  if (!key) return; // nothing to delete

  // Only delete keys that look like product images to prevent accidental deletes
  if (!key.startsWith("products/")) return;

  const bucket = requireEnv("R2_BUCKET_NAME");
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}

// ── Key extraction helper ─────────────────────────────────────────────────────

/** Extract just the filename (last segment) from a key or URL */
export function basename(keyOrUrl: string): string {
  return path.posix.basename(keyOrUrl);
}
