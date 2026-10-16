import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin-api";

// export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

type AllowedMime = keyof typeof ALLOWED_TYPES;

function hasValidSignature(bytes: Uint8Array, mime: AllowedMime): boolean {
  if (mime === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (mime === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  return (
    mime === "image/webp" &&
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please select an image." },
      { status: 400 },
    );
  }

  if (folder !== "projects" && folder !== "blogs") {
    return NextResponse.json(
      { error: "Invalid image folder." },
      { status: 400 },
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be larger than 0 bytes and no bigger than 5 MB." },
      { status: 400 },
    );
  }

  const mime = file.type;
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  const allowedExtensions = ALLOWED_TYPES[mime];

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!hasValidSignature(bytes, mime)) {
    return NextResponse.json(
      { error: "The file contents do not match a supported image format." },
      { status: 400 },
    );
  }

  // Never use the user's original filename in the storage path.
  const storagePath = `${folder}/${crypto.randomUUID()}.${extension.slice(1)}`;

  const { error: uploadError } = await auth.supabase.storage
    .from("portfolio-images")
    .upload(storagePath, bytes, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    console.error("Image upload failed:", uploadError.message);

    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }

  const { data } = auth.supabase.storage
    .from("portfolio-images")
    .getPublicUrl(storagePath);

  return NextResponse.json(
    {
      url: data.publicUrl,
      path: storagePath,
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  let body: { path?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const path = body.path;

  if (
    typeof path !== "string" ||
    !/^(projects|blogs)\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i.test(path)
  ) {
    return NextResponse.json(
      { error: "Invalid image storage path." },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase.storage
    .from("portfolio-images")
    .remove([path]);

  if (error) {
    console.error("Image deletion failed:", error.message);

    return NextResponse.json(
      { error: "Failed to delete image." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
