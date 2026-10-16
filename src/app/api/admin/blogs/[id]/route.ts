
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin-api";
import { invalidateBlogPostsCache } from "@/lib/blogs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const EDITABLE_FIELDS = [
  "title",
  "slug",
  "description",
  "url",
  "image_url",
  "tags",
  "reading_time_minutes",
  "published_at",
  "is_published",
] as const;

type BlogFields = Record<string, unknown>;

function isRecord(value: unknown): value is BlogFields {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function pickEditableFields(body: BlogFields): BlogFields {
  const fields: BlogFields = {};

  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      fields[field] = body[field];
    }
  }

  return fields;
}

function validateFields(fields: BlogFields): string | null {
  if ("title" in fields) {
    if (
      typeof fields.title !== "string" ||
      !fields.title.trim()
    ) {
      return "Title cannot be empty.";
    }

    if (fields.title.length > 200) {
      return "Title cannot exceed 200 characters.";
    }
  }

  if ("slug" in fields) {
    if (
      typeof fields.slug !== "string" ||
      !fields.slug.trim()
    ) {
      return "Slug cannot be empty.";
    }

    if (fields.slug.length > 200) {
      return "Slug cannot exceed 200 characters.";
    }
  }

  if ("description" in fields) {
    if (
      fields.description !== null &&
      typeof fields.description !== "string"
    ) {
      return "Description must be a string or null.";
    }

    if (
      typeof fields.description === "string" &&
      fields.description.length > 1000
    ) {
      return "Description cannot exceed 1000 characters.";
    }
  }

  if ("url" in fields) {
    if (
      typeof fields.url !== "string" ||
      !fields.url.trim() ||
      !isValidHttpUrl(fields.url)
    ) {
      return "Enter a valid HTTP or HTTPS article URL.";
    }
  }

  if (
    "image_url" in fields &&
    fields.image_url !== null &&
    fields.image_url !== ""
  ) {
    if (
      typeof fields.image_url !== "string" ||
      !isValidHttpUrl(fields.image_url)
    ) {
      return "Enter a valid HTTP or HTTPS image URL.";
    }
  }

  if (
    "tags" in fields &&
    (
      !Array.isArray(fields.tags) ||
      !fields.tags.every(
        (tag: unknown) => typeof tag === "string",
      )
    )
  ) {
    return "Tags must be an array of strings.";
  }

  if ("reading_time_minutes" in fields) {
    const value = fields.reading_time_minutes;

    if (
      value !== null &&
      (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1
      )
    ) {
      return "Reading time must be a positive integer or null.";
    }
  }

  if ("published_at" in fields) {
    const value = fields.published_at;

    if (
      value !== null &&
      (
        typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value))
      )
    ) {
      return "Publication date must be a valid date or null.";
    }
  }

  if (
    "is_published" in fields &&
    typeof fields.is_published !== "boolean"
  ) {
    return "Publication status must be a boolean.";
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Blog ID is required." },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const fields = pickEditableFields(body);

  if (Object.keys(fields).length === 0) {
    return NextResponse.json(
      { error: "No editable fields provided." },
      { status: 400 },
    );
  }

  const validationError = validateFields(fields);

  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 },
    );
  }

  const { data: existingBlog, error: readError } = await auth.supabase
    .from("blogs")
    .select("id, published_at, is_published")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("Failed to load blog:", readError);

    return NextResponse.json(
      { error: "Failed to load blog." },
      { status: 500 },
    );
  }

  if (!existingBlog) {
    return NextResponse.json(
      { error: "Blog not found." },
      { status: 404 },
    );
  }

  // Normalize text fields before saving.
  if (typeof fields.title === "string") {
    fields.title = fields.title.trim();
  }

  if (typeof fields.slug === "string") {
    fields.slug = fields.slug.trim();
  }

  if (typeof fields.url === "string") {
    fields.url = fields.url.trim();
  }

  if (typeof fields.description === "string") {
    fields.description = fields.description.trim();
  }

  if (typeof fields.image_url === "string") {
    fields.image_url = fields.image_url.trim() || null;
  }

  if (Array.isArray(fields.tags)) {
    fields.tags = fields.tags
      .map((tag: string) => tag.trim())
      .filter(Boolean);
  }

  // Clear the publication date when unpublishing.
  if (fields.is_published === false) {
    fields.published_at = null;
  } else if (
    fields.is_published === true &&
    !("published_at" in fields) &&
    !existingBlog.published_at
  ) {
    // Set a date when publishing a draft for the first time.
    fields.published_at = new Date().toISOString();
  }

  const { data: blog, error } = await auth.supabase
    .from("blogs")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update blog:", error);

    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "A blog post with this slug already exists."
            : "Failed to update blog. Check your database columns and submitted fields.",
      },
      { status: 400 },
    );
  }

  invalidateBlogPostsCache();

  return NextResponse.json({ blog });
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Blog ID is required." },
      { status: 400 },
    );
  }

  const { data: existingBlog, error: readError } = await auth.supabase
    .from("blogs")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("Failed to load blog:", readError);

    return NextResponse.json(
      { error: "Failed to load blog." },
      { status: 500 },
    );
  }

  if (!existingBlog) {
    return NextResponse.json(
      { error: "Blog not found." },
      { status: 404 },
    );
  }

  // The image is hosted externally, so there is no Supabase Storage
  // object to delete.
  const { error: deleteError } = await auth.supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete blog:", deleteError);

    return NextResponse.json(
      { error: "Failed to delete blog." },
      { status: 500 },
    );
  }

  invalidateBlogPostsCache();

  return NextResponse.json({ success: true });
}
