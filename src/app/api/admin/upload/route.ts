import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth-utils";

const UPLOAD_CONFIG = {
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize: 5 * 1024 * 1024, // 5MB
    dir: "products",
  },
  video: {
    types: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    maxSize: 100 * 1024 * 1024, // 100MB
    dir: "videos",
  },
  audio: {
    types: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp3", "audio/webm", "audio/aac"],
    maxSize: 20 * 1024 * 1024, // 20MB
    dir: "audio",
  },
  file: {
    types: ["application/pdf", "application/zip", "application/x-rar-compressed", "application/octet-stream"],
    maxSize: 50 * 1024 * 1024, // 50MB
    dir: "files",
  },
};

type UploadType = keyof typeof UPLOAD_CONFIG;

function detectUploadType(mimeType: string): UploadType | null {
  for (const [type, config] of Object.entries(UPLOAD_CONFIG)) {
    if (config.types.includes(mimeType)) return type as UploadType;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const forcedType = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No file provided" } },
        { status: 400 }
      );
    }

    // Determine upload type
    const uploadType = forcedType && forcedType in UPLOAD_CONFIG
      ? forcedType as UploadType
      : detectUploadType(file.type);

    if (!uploadType) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: `File type "${file.type}" is not allowed` } },
        { status: 400 }
      );
    }

    const config = UPLOAD_CONFIG[uploadType];

    if (!config.types.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: `File type "${file.type}" is not allowed for ${uploadType}` } },
        { status: 400 }
      );
    }

    if (file.size > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: `File size must be under ${maxMB}MB` } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create cryptographically unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || uploadType === "image" ? "png" : uploadType === "video" ? "mp4" : uploadType === "audio" ? "mp3" : "bin";
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const filename = `${timestamp}-${randomSuffix}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", config.dir);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${config.dir}/${filename}`;

    return NextResponse.json({
      success: true,
      data: { url, filename, type: uploadType, size: file.size, mimeType: file.type },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_ERROR", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}
