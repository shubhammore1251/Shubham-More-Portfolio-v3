import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin-api";
import { invalidateBlogPostsCache } from "@/lib/blogs";

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
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function validateBlogFields(
  fields: BlogFields,
  isCreate = false,
): string | null {
  if (typeof fields.title !== "string" || !fields.title.trim()) {
    return "Title is required.";
  }

  if (typeof fields.slug !== "string" || !fields.slug.trim()) {
    return "Slug is required.";
  }

  if (fields.title.length > 200) {
    return "Title cannot exceed 200 characters.";
  }

  if (fields.slug.length > 200) {
    return "Slug cannot exceed 200 characters.";
  }

  if ("description" in fields) {
    if (fields.description !== null && typeof fields.description !== "string") {
      return "Description must be a string or null.";
    }

    if (
      typeof fields.description === "string" &&
      fields.description.length > 1000
    ) {
      return "Description cannot exceed 1000 characters.";
    }
  }

  if (isCreate && (typeof fields.url !== "string" || !fields.url.trim())) {
    return "The article URL is required.";
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
    (!Array.isArray(fields.tags) ||
      !fields.tags.every((tag: unknown) => typeof tag === "string"))
  ) {
    return "Tags must be an array of strings.";
  }

  if ("reading_time_minutes" in fields) {
    const value = fields.reading_time_minutes;

    if (
      value !== null &&
      (typeof value !== "number" || !Number.isInteger(value) || value < 1)
    ) {
      return "Reading time must be a positive integer or null.";
    }
  }

  if ("published_at" in fields) {
    const value = fields.published_at;

    if (
      value !== null &&
      (typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value)))
    ) {
      return "Publication date must be a valid date or null.";
    }
  }

  if ("is_published" in fields && typeof fields.is_published !== "boolean") {
    return "Publication status must be a boolean.";
  }

  return null;
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

export async function GET() {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch blogs:", error);

    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500 },
    );
  }

  return NextResponse.json({ blogs: data });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const fields = pickEditableFields(body);
  const validationError = validateBlogFields(fields, true);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Normalize optional fields and user-entered text.
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
    fields.tags = fields.tags.map((tag: string) => tag.trim()).filter(Boolean);
  }

  // Drafts do not need a publication date.
  if (fields.is_published === false) {
    fields.published_at = null;
  } else if (fields.is_published === true && !fields.published_at) {
    fields.published_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from("blogs")
    .insert(fields)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create blog post:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    if (error.code === "23505") {
      const constraint = `${error.message} ${error.details ?? ""}`;

      if (/blogs_slug_unique_idx/i.test(constraint)) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists." },
          { status: 409 },
        );
      }

      if (/blogs_url_key/i.test(constraint)) {
        return NextResponse.json(
          { error: "A blog post with this article URL already exists." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error:
            "A database uniqueness conflict occurred. Check the server logs.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create blog post. Check the server logs for details.",
      },
      { status: 400 },
    );
  }

  invalidateBlogPostsCache();

  return NextResponse.json({ blog: data }, { status: 201 });
}
