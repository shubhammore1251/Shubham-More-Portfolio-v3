import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validImagePath(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /^projects\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i.test(value)
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    id: _ignoredId,
    created_at: _ignoredCreatedAt,
    display_order: requestedDisplayOrder,
    ...fields
  } = body;

  if (
    "image_path" in fields &&
    fields.image_path !== null &&
    !validImagePath(fields.image_path)
  ) {
    return NextResponse.json({ error: "Invalid project image path." }, { status: 400 });
  }

  if (
    requestedDisplayOrder !== undefined &&
    (!Number.isInteger(requestedDisplayOrder) || Number(requestedDisplayOrder) < 1)
  ) {
    return NextResponse.json(
      { error: "Display order must be a positive whole number." },
      { status: 400 },
    );
  }

  if ("is_featured" in fields && typeof fields.is_featured !== "boolean") {
    return NextResponse.json({ error: "Featured must be true or false." }, { status: 400 });
  }

  const { data: current, error: readError } = await auth.supabase
    .from("projects")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("Failed to load project before update:", readError.message);
    return NextResponse.json({ error: "Failed to load project." }, { status: 500 });
  }

  if (!current) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (Object.keys(fields).length > 0) {
    const { error: updateError } = await auth.supabase
      .from("projects")
      .update(fields)
      .eq("id", id);

    if (updateError) {
      console.error("Project update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to update project." }, { status: 400 });
    }
  }

  // All featured and display-order changes go through the database ordering
  // function so the featured project remains at 1 and the rest are renumbered.
  if (requestedDisplayOrder !== undefined || "is_featured" in fields) {
    const { error: reorderError } = await auth.supabase.rpc("admin_reorder_projects", {
      p_project_id: id,
      p_display_order:
        typeof requestedDisplayOrder === "number" ? requestedDisplayOrder : null,
      p_is_featured:
        typeof fields.is_featured === "boolean" ? fields.is_featured : null,
    });

    if (reorderError) {
      console.error("Project reorder failed:", reorderError.message);
      return NextResponse.json(
        { error: `Project saved, but ordering failed: ${reorderError.message}` },
        { status: 500 },
      );
    }
  }

  const { data, error: finalReadError } = await auth.supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (finalReadError) {
    console.error("Failed to reload updated project:", finalReadError.message);
    return NextResponse.json({ error: "Project updated but could not be reloaded." }, { status: 500 });
  }

  const oldPath = current.image_path;
  const newPath = data.image_path;

  if (oldPath && oldPath !== newPath) {
    const { error: cleanupError } = await auth.supabase.storage
      .from("portfolio-images")
      .remove([oldPath]);

    if (cleanupError) {
      console.error("Old project image cleanup failed:", cleanupError.message);
      return NextResponse.json({
        project: data,
        warning: "Project updated, but the old image needs cleanup.",
      });
    }
  }

  return NextResponse.json({ project: data });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { data: current, error: readError } = await auth.supabase
    .from("projects")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "Failed to load project." }, { status: 500 });
  }
  if (!current) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const { error: deleteError } = await auth.supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Project delete failed:", deleteError.message);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }

  // Rebuild sequential display positions after deletion.
  const { error: reorderError } = await auth.supabase.rpc("admin_reorder_projects", {
    p_project_id: null,
    p_display_order: null,
    p_is_featured: null,
  });

  if (reorderError) {
    console.error("Project reorder after deletion failed:", reorderError.message);
    return NextResponse.json(
      { success: true, warning: `Project deleted, but ordering could not be normalized: ${reorderError.message}` },
    );
  }

  if (current.image_path) {
    const { error: cleanupError } = await auth.supabase.storage
      .from("portfolio-images")
      .remove([current.image_path]);

    if (cleanupError) {
      console.error("Deleted project image cleanup failed:", cleanupError.message);
      return NextResponse.json({ success: true, warning: "Project deleted, but its image needs cleanup." });
    }
  }

  return NextResponse.json({ success: true });
}
