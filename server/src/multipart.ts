import type { IncomingMessage } from "http";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal multipart/form-data parser
//
// Handles a single file field plus optional text fields.
// No third-party dependencies — just Node.js buffers.
//
// Supports:
//   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXXX
//
// Does NOT support nested multipart or multiple files per field (not needed here).
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedFile {
  fieldName: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface MultipartResult {
  files: ParsedFile[];
  fields: Record<string, string>;
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB hard limit

/**
 * Read the entire request body and parse it as multipart/form-data.
 * Throws if the content type is wrong, the body is too large, or parsing fails.
 */
export async function parseMultipart(req: IncomingMessage): Promise<MultipartResult> {
  const contentType = req.headers["content-type"] ?? "";

  // Extract boundary from Content-Type header
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/i);
  if (!boundaryMatch) {
    throw new Error("Missing boundary in Content-Type header.");
  }
  const boundary = boundaryMatch[1].replace(/^"(.*)"$/, "$1"); // strip optional quotes

  // Read raw body into a single Buffer
  const rawBody = await readRawBody(req, MAX_UPLOAD_BYTES);

  return parseParts(rawBody, boundary);
}

// ── Read raw body ─────────────────────────────────────────────────────────────

function readRawBody(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > maxBytes) {
        reject(new Error(`Upload exceeds the ${maxBytes / 1024 / 1024} MB limit.`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ── Parse parts ───────────────────────────────────────────────────────────────

function parseParts(body: Buffer, boundary: string): MultipartResult {
  const result: MultipartResult = { files: [], fields: {} };

  // Delimiter bytes: \r\n--<boundary>
  const delimiter = Buffer.from(`\r\n--${boundary}`);
  const firstDelimiter = Buffer.from(`--${boundary}`);

  // Split body on boundaries
  // We work with the body as a Buffer to handle binary file data correctly.
  const parts: Buffer[] = [];
  let searchStart = 0;

  // Find the first boundary
  const idx = indexOf(body, firstDelimiter, searchStart);
  if (idx === -1) return result; // malformed — return empty

  searchStart = idx + firstDelimiter.length;

  // Skip \r\n after opening boundary
  if (body[searchStart] === 0x0d && body[searchStart + 1] === 0x0a) {
    searchStart += 2;
  }

  while (searchStart < body.length) {
    // Find the next delimiter
    const nextIdx = indexOf(body, delimiter, searchStart);
    if (nextIdx === -1) break;

    parts.push(body.slice(searchStart, nextIdx));
    searchStart = nextIdx + delimiter.length;

    // Check for closing boundary (--)
    if (body[searchStart] === 0x2d && body[searchStart + 1] === 0x2d) break;

    // Skip \r\n after delimiter
    if (body[searchStart] === 0x0d && body[searchStart + 1] === 0x0a) {
      searchStart += 2;
    }
  }

  // Parse each part
  for (const part of parts) {
    parsePart(part, result);
  }

  return result;
}

function parsePart(part: Buffer, result: MultipartResult): void {
  // Split headers from body on \r\n\r\n
  const headerSep = Buffer.from("\r\n\r\n");
  const headerEnd = indexOf(part, headerSep, 0);
  if (headerEnd === -1) return;

  const headerStr = part.slice(0, headerEnd).toString("utf8");
  const bodyData = part.slice(headerEnd + 4); // skip \r\n\r\n

  // Parse Content-Disposition
  const dispositionMatch = headerStr.match(
    /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i
  );
  if (!dispositionMatch) return;

  const fieldName = dispositionMatch[1];
  const filename = dispositionMatch[2];

  if (filename !== undefined) {
    // File field
    const mimeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
    const mimeType = mimeMatch ? mimeMatch[1].trim() : "application/octet-stream";

    result.files.push({
      fieldName,
      filename: filename || "upload",
      mimeType,
      data: bodyData,
    });
  } else {
    // Text field
    result.fields[fieldName] = bodyData.toString("utf8");
  }
}

// ── Buffer indexOf helper ─────────────────────────────────────────────────────

function indexOf(haystack: Buffer, needle: Buffer, start: number): number {
  for (let i = start; i <= haystack.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
