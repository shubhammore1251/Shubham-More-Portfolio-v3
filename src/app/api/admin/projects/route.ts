import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects:", error.message);
    return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    id: _ignoredId,
    created_at: _ignoredCreatedAt,
    display_order: requestedDisplayOrder,
    is_featured: requestedFeatured,
    ...fields
  } = body;

  if (
    typeof fields.title !== "string" ||
    !fields.title.trim() ||
    typeof fields.slug !== "string" ||
    !fields.slug.trim()
  ) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  if (requestedDisplayOrder !== undefined &&
      (!Number.isInteger(requestedDisplayOrder) || Number(requestedDisplayOrder) < 1)) {
    return NextResponse.json({ error: "Display order must be a positive whole number." }, { status: 400 });
  }

  if (requestedFeatured !== undefined && typeof requestedFeatured !== "boolean") {
    return NextResponse.json({ error: "Featured must be true or false." }, { status: 400 });
  }

  const { data: lastProject, error: orderReadError } = await auth.supabase
    .from("projects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderReadError) {
    console.error("Failed to determine next display order:", orderReadError.message);
    return NextResponse.json({ error: "Failed to determine the next display order." }, { status: 500 });
  }

  const nextOrder = (lastProject?.display_order ?? 0) + 1;
  const { data: inserted, error: insertError } = await auth.supabase
    .from("projects")
    .insert({
      ...fields,
      is_featured: false,
      display_order: nextOrder,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Failed to create project:", insertError?.message);
    return NextResponse.json({ error: "Failed to create project. Check the submitted fields." }, { status: 400 });
  }

  const { error: reorderError } = await auth.supabase.rpc("admin_reorder_projects", {
    p_project_id: inserted.id,
    p_display_order: requestedFeatured === true ? null : nextOrder,
    p_is_featured: requestedFeatured === true,
  });

  if (reorderError) {
    console.error("Project created but ordering failed:", reorderError.message);
    await auth.supabase.from("projects").delete().eq("id", inserted.id);
    return NextResponse.json({ error: `Project ordering failed: ${reorderError.message}` }, { status: 500 });
  }

  const { data, error: finalReadError } = await auth.supabase
    .from("projects")
    .select("*")
    .eq("id", inserted.id)
    .single();

  if (finalReadError) {
    console.error("Failed to reload created project:", finalReadError.message);
    return NextResponse.json({ error: "Project created but could not be reloaded." }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}