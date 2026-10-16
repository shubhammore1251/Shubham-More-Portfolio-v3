"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { technologies as T } from "@/data/portfolio";
import { createClient } from "@/lib/supabase/client";

type Technology = (typeof T)[keyof typeof T];

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  image_path: string | null;
  image_alt: string | null;
  technologies: unknown[] | null;
  github_url: string | null;
  live_url: string | null;
  highlights: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
};

type Props = { projectId?: string };

const initialForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "",
  image_alt: "",
  github_url: "",
  live_url: "",
  highlights: "",
  is_published: false,
  is_featured: false,
  display_order: "1",
};

const inputClass =
  "w-full rounded-lg border border-zinc-400 bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-zinc-500 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-600 dark:hover:border-zinc-500";

const catalogEntries = Object.entries(T) as [string, Technology][];

function isValidGitHubUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["github.com", "www.github.com"].includes(url.hostname.toLowerCase()) &&
      url.pathname.split("/").filter(Boolean).length >= 1
    );
  } catch {
    return false;
  }
}

function isValidOptionalUrl(value: string) {
  if (!value.trim()) return true;
  try {
    return ["http:", "https:"].includes(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
}

function technologySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Older rows may contain technology names as strings. New rows store complete
 * technology objects. Resolve saved objects by stable id so catalog metadata
 * and icons stay current when the portfolio catalog is updated.
 */
function resolveSavedTechnologies(saved: unknown[] | null | undefined): Technology[] {
  if (!Array.isArray(saved)) return [];

  return saved
    .map((item) => {
      if (typeof item === "string") {
        // Database rows may store either catalog IDs ("nextjs") or catalog
        // keys ("T.nextjs"). Resolve both formats to the canonical catalog
        // object so the selected chip gets the same name and icon as the list.
        const normalizedKey = item.startsWith("T.") ? item.slice(2) : item;
        const byIdKeyOrName = catalogEntries.find(
          ([key, technology]) =>
            key === normalizedKey ||
            technology.id === item ||
            technology.id === normalizedKey ||
            technology.name.toLowerCase() === item.toLowerCase(),
        );
        if (byIdKeyOrName) return byIdKeyOrName[1];

        const id = technologySlug(item);
        return {
          id,
          name: item,
          category: "custom",
          iconifyIcon: null,
          featured: false,
          sortOrder: 999,
        } satisfies Technology;
      }

      if (item && typeof item === "object" && "id" in item) {
        const savedTechnology = item as { id?: unknown; name?: unknown };
        const savedId = typeof savedTechnology.id === "string" ? savedTechnology.id : "";
        const normalizedKey = savedId.startsWith("T.")
          ? savedId.slice(2)
          : savedId;
        const catalogMatch = catalogEntries.find(
          ([key, technology]) =>
            key === normalizedKey ||
            technology.id === savedId ||
            technology.id === normalizedKey,
        );
        if (catalogMatch) return catalogMatch[1];

        // Normalize custom/legacy objects to the current catalog type. If a
        // matching id is added to T later, the catalog match above takes over.
        const name = typeof savedTechnology.name === "string"
          ? savedTechnology.name
          : savedId || "Custom technology";
        return {
          id: savedId || technologySlug(name),
          name,
          category: "custom",
          iconifyIcon: null,
          featured: false,
          sortOrder: 999,
        } satisfies Technology;
      }

      return null;
    })
    .filter((technology): technology is Technology => Boolean(technology));
}

export default function ProjectForm({ projectId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);

  const [imagePath, setImagePath] = useState("");
  const [storedImagePreview, setStoredImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<Technology[]>([]);
  const [customTechnology, setCustomTechnology] = useState("");
  const [technologySearch, setTechnologySearch] = useState("");

  const sortedCatalog = useMemo(
    () =>
      [...catalogEntries].sort(
        ([, a], [, b]) =>
          String(a.category).localeCompare(String(b.category)) ||
          Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999) ||
          a.name.localeCompare(b.name),
      ),
    [],
  );

  const filteredCatalog = useMemo(() => {
    const query = technologySearch.trim().toLowerCase();
    if (!query) return sortedCatalog;
    return sortedCatalog.filter(([, technology]) =>
      `${technology.name} ${technology.category} ${technology.id}`
        .toLowerCase()
        .includes(query),
    );
  }, [sortedCatalog, technologySearch]);

  const highlightsReady = form.highlights.split("\n").some((value) => value.trim());
  const displayOrderValue =
    form.display_order.trim() === "" ? Number.NaN : Number(form.display_order);

  const canSubmit =
    form.title.trim().length > 0 &&
    /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(form.slug.trim()) &&
    form.description.trim().length > 0 &&
    form.category.trim().length > 0 &&
    Boolean(imageFile || imagePath) &&
    selectedTechnologies.length > 0 &&
    Boolean(highlightsReady) &&
    isValidGitHubUrl(form.github_url) &&
    (Boolean(projectId) ||
      (Number.isInteger(displayOrderValue) && displayOrderValue >= 0)) &&
    isValidOptionalUrl(form.live_url);

  useEffect(() => {
    // Reset every controlled field when opening the "New Project" form.
    // This prevents state from a previously edited project leaking into it
    // if Next.js reuses this client component between routes.
    if (!projectId) {
      setForm({ ...initialForm });
      setImagePath("");
      setStoredImagePreview("");
      setImageFile(null);
      setImagePreview("");
      setSelectedTechnologies([]);
      setCustomTechnology("");
      setTechnologySearch("");
      setError("");
      setNotice("");
      setSaving(false);
      setLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    let cancelled = false;

    async function loadProject() {
      try {
        const response = await fetch("/api/admin/projects", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load projects.");
        }

        const project: Project | undefined = result.projects?.find(
          (item: Project) => item.id === projectId,
        );

        if (!project) throw new Error("Project not found.");
        if (cancelled) return;

        setForm({
          title: project.title ?? "",
          slug: project.slug ?? "",
          summary: project.summary ?? "",
          description: project.description ?? "",
          category: project.category ?? "",
          image_alt: project.image_alt ?? "",
          github_url: project.github_url ?? "",
          live_url: project.live_url ?? "",
          highlights: (project.highlights ?? []).join("\n"),
          is_published: project.is_published ?? false,
          is_featured: project.is_featured ?? false,
          display_order: String(project.display_order ?? 0),
        });

        setSelectedTechnologies(resolveSavedTechnologies(project.technologies));

        const path = project.image_path ?? "";
        setImagePath(path);

        if (path) {
          const supabase = createClient();
          const { data } = supabase.storage
            .from("portfolio-images")
            .getPublicUrl(path);
          setStoredImagePreview(data.publicUrl);
          setImagePreview(data.publicUrl);
        } else {
          setStoredImagePreview("");
          setImagePreview("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProject();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function setField<K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTechnology(technology: Technology) {
    setSelectedTechnologies((current) => {
      const exists = current.some((item) => item.id === technology.id);
      return exists
        ? current.filter((item) => item.id !== technology.id)
        : [...current, technology];
    });
  }

  function addCustomTechnology() {
    const name = customTechnology.trim();
    if (!name) return;

    const slug = technologySlug(name);
    if (!slug) {
      setError("Enter a valid technology name.");
      return;
    }

    const existingCatalog = catalogEntries.find(
      ([, technology]) =>
        technology.id === slug ||
        technology.name.toLowerCase() === name.toLowerCase(),
    );

    const existingSelected = selectedTechnologies.some(
      (technology) =>
        technology.id === (existingCatalog?.[1].id ?? slug) ||
        technology.name.toLowerCase() === name.toLowerCase(),
    );

    if (existingSelected) {
      setError("That technology has already been selected.");
      return;
    }

    // Use the future catalog id when a matching catalog item exists.
    // For genuinely custom entries, use a stable slug so adding that id to T
    // later lets resolveSavedTechnologies() pick up the catalog icon/metadata.
    const technology = existingCatalog?.[1] ??
      ({
        id: slug,
        name,
        category: "custom",
        iconifyIcon: null,
        featured: false,
        sortOrder: selectedTechnologies.length + 1,
      } satisfies Technology);

    setSelectedTechnologies((current) => [...current, technology]);
    setCustomTechnology("");
    setError("");
  }

  function handleImageChange(file?: File) {
    if (!file) return;
    setError("");
    setNotice("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Select a JPG, PNG, or WebP image.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function cancelImageSelection() {
    setImageFile(null);
    setImagePreview(storedImagePreview);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setError("");
    setNotice("");
  }

  async function removeUploadedImage(path: string) {
    try {
      const response = await fetch("/api/admin/uploads/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!response.ok) {
        console.error("Uploaded image cleanup failed:", await response.text());
      }
    } catch (cleanupError) {
      console.error("Uploaded image cleanup failed:", cleanupError);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const title = form.title.trim();
    const slug = form.slug.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const githubUrl = form.github_url.trim();
    const highlights = form.highlights
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const displayOrder = Number(form.display_order);

    if (!title) return setError("Project title is required.");
    if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(slug)) {
      return setError("Use letters, numbers, and single hyphens between words for the slug.");
    }
    if (!description) return setError("Project description is required.");
    if (!category) return setError("Project category is required.");
    if (!imageFile && !imagePath) return setError("Please select a project image.");
    if (!selectedTechnologies.length) return setError("Select at least one technology.");
    if (!highlights.length) return setError("Add at least one project highlight.");
    if (!isValidGitHubUrl(githubUrl)) {
      return setError("Enter a valid GitHub URL, such as https://github.com/username/project.");
    }
    // Existing projects are reordered by the admin listing / server-side
    // ordering function. Do not submit a stale display_order from the edit form.
    if (
      !projectId &&
      (form.display_order.trim() === "" ||
        !Number.isInteger(displayOrder) ||
        displayOrder < 0)
    ) {
      return setError("Display order must be a non-negative whole number.");
    }
    if (!isValidOptionalUrl(form.live_url)) {
      return setError("Enter a valid live URL or leave the field empty.");
    }

    setSaving(true);
    let newlyUploadedPath: string | null = null;

    try {
      let finalImagePath = imagePath;

      if (imageFile) {
        const data = new FormData();
        data.append("file", imageFile);
        data.append("folder", "projects");

        const uploadResponse = await fetch("/api/admin/uploads/image", {
          method: "POST",
          body: data,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.error || "Image upload failed.");
        }
        if (!uploadResult.path) {
          throw new Error("Image upload returned no storage path.");
        }

        finalImagePath = uploadResult.path;
        newlyUploadedPath = uploadResult.path;
      }

      const payload = {
        title,
        slug,
        summary: form.summary.trim() || null,
        description,
        category,
        image_path: finalImagePath || null,
        image_alt: form.image_alt.trim() || null,
        // Store stable catalog IDs only. The read mapper resolves these IDs
        // back to the current T objects for names, icons, and metadata.
        technologies: selectedTechnologies.map((technology) => technology.id),
        github_url: githubUrl,
        live_url: form.live_url.trim() || null,
        highlights,
        is_published: form.is_published,
        is_featured: form.is_featured,
        ...(projectId ? {} : { display_order: displayOrder }),
      };

      const response = await fetch(
        projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects",
        {
          method: projectId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save project.");
      }

      newlyUploadedPath = null;
      if (result.warning) setNotice(result.warning);
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      if (newlyUploadedPath) await removeUploadedImage(newlyUploadedPath);
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-sm text-muted-foreground">Loading project...</div>;
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={saving} className="max-w-3xl space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">PORTFOLIO ADMIN</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {projectId ? "Edit Project" : "New Project"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fields marked with * are required.
          </p>
        </div>
        <Link
          href="/admin/projects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to projects
        </Link>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-lg border border-amber-400 p-3 text-sm text-amber-800 dark:text-amber-300">
          {notice}
        </div>
      )}

      <Field label="Title" required htmlFor="project-title">
        <input id="project-title" className={inputClass} required maxLength={200} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="My Awesome Project" />
      </Field>

      <Field label="Slug" required htmlFor="project-slug">
        <div className="space-y-2">
          <input id="project-slug" className={inputClass} required maxLength={200} pattern="[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*" title="Use letters, numbers, and single hyphens between words." value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="my-awesome-project" />
          <button type="button" className="text-sm font-medium text-primary underline-offset-4 hover:underline" onClick={() => setField("slug", form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}>
            Generate slug from title
          </button>
        </div>
      </Field>

      <Field label="Summary" htmlFor="project-summary">
        <textarea id="project-summary" className={inputClass} rows={2} maxLength={500} value={form.summary} onChange={(e) => setField("summary", e.target.value)} placeholder="A short summary displayed on project cards." />
      </Field>

      <Field label="Description" required htmlFor="project-description">
        <textarea id="project-description" className={inputClass} required rows={6} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the project, the problem it solves, and how it works." />
      </Field>

      <Field label="Category" required htmlFor="project-category">
        <input id="project-category" className={inputClass} required value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Web Application, AI, Backend..." />
      </Field>

      <Field label="Project image" required htmlFor="project-image-file">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-zinc-400 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-600">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-background text-xl dark:border-zinc-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {imageFile ? imageFile.name : imagePath ? "Current project image" : "Choose a project image"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or WebP · Maximum 5 MB</p>
              </div>
            </div>
            <label htmlFor="project-image-file" className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-400 bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary hover:bg-muted dark:border-zinc-600">
              {imageFile || imagePath ? "Choose another image" : "Browse images"}
            </label>
            <input ref={imageInputRef} id="project-image-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choose project image" aria-required="true" onChange={(e) => handleImageChange(e.target.files?.[0])} />
          </div>

          {imagePreview && (
            <div className="overflow-hidden rounded-xl border border-zinc-300 bg-background p-3 dark:border-zinc-600">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{imageFile ? "New image preview" : "Current image preview"}</p>
                  {imageFile && <p className="mt-1 text-xs text-muted-foreground">The new image will replace the current one when saved.</p>}
                </div>
                {imageFile && (
                  <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40" onClick={cancelImageSelection}>
                    <span aria-hidden="true" className="text-lg leading-none">×</span>
                    Cancel new image selection
                  </button>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt={form.image_alt || "Project image preview"} className="max-h-72 w-full rounded-lg object-contain" />
            </div>
          )}
        </div>
      </Field>

      <Field label="Image alt text" htmlFor="project-image-alt">
        <input id="project-image-alt" className={inputClass} value={form.image_alt} onChange={(e) => setField("image_alt", e.target.value)} placeholder="Describe the image for accessibility" />
      </Field>

      <Field label="Technologies" required htmlFor="technology-search">
        <div className="space-y-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
          <div>
            <label htmlFor="technology-search" className="mb-2 block text-sm font-medium">Search catalog</label>
            <input id="technology-search" className={inputClass} value={technologySearch} onChange={(e) => setTechnologySearch(e.target.value)} placeholder="Search React Native, TypeScript, Supabase..." />
            <p className="mt-2 text-xs text-muted-foreground">
              Select from your portfolio technology catalog to keep its icon and metadata.
            </p>
          </div>

          <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {filteredCatalog.map(([key, technology]) => {
              const selected = selectedTechnologies.some((item) => item.id === technology.id);
              return (
                <button key={key} type="button" aria-pressed={selected} onClick={() => toggleTechnology(technology)} className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700"}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                    {technology.iconifyIcon ? <Icon icon={technology.iconifyIcon} className="size-5" /> : <span className="text-xs font-semibold">{technology.name.slice(0, 2)}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{technology.name}</span>
                    <span className="block truncate text-xs capitalize text-muted-foreground">{technology.category}</span>
                  </span>
                  <span className={`text-xs font-semibold ${selected ? "text-primary" : "text-muted-foreground"}`}>{selected ? "Selected" : "Add"}</span>
                </button>
              );
            })}
            {filteredCatalog.length === 0 && <p className="col-span-full py-4 text-sm text-muted-foreground">No matching catalog technologies.</p>}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium">Selected technologies ({selectedTechnologies.length})</p>
            {selectedTechnologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTechnologies.map((technology) => (
                  <span key={`${technology.id}:${technology.name}`} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-muted/50 py-1 pl-2.5 pr-1.5 text-sm dark:border-zinc-700">
                    {technology.iconifyIcon ? <Icon icon={technology.iconifyIcon} className="size-4" /> : null}
                    <span>{technology.name}</span>
                    <button type="button" aria-label={`Remove ${technology.name}`} className="rounded-full px-1.5 text-muted-foreground hover:bg-background hover:text-foreground" onClick={() => setSelectedTechnologies((current) => current.filter((item) => item.id !== technology.id))}>×</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No technologies selected yet.</p>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <label htmlFor="custom-technology" className="block text-sm font-medium">Add a custom technology</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="custom-technology" className={inputClass} value={customTechnology} onChange={(e) => setCustomTechnology(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTechnology(); } }} placeholder="e.g. CrewAI" />
              <Button type="button" variant="outline" onClick={addCustomTechnology}>Add custom</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Custom entries are text-only. Their stable ID is based on the name; add a catalog entry with the same ID later to enable its icon and metadata.
            </p>
          </div>
        </div>
      </Field>

      <Field label="Highlights" required htmlFor="project-highlights">
        <textarea id="project-highlights" className={inputClass} required rows={4} value={form.highlights} onChange={(e) => setField("highlights", e.target.value)} placeholder={"Implemented authentication\nBuilt REST APIs\nOptimized application performance"} />
        <p className="text-xs text-muted-foreground">Enter at least one highlight, with one item per line.</p>
      </Field>

      <Field label="GitHub URL" required htmlFor="project-github-url">
        <input id="project-github-url" type="url" className={inputClass} required value={form.github_url} onChange={(e) => setField("github_url", e.target.value)} placeholder="https://github.com/username/project" />
      </Field>

      <Field label="Live URL" htmlFor="project-live-url">
        <input id="project-live-url" type="url" className={inputClass} value={form.live_url} onChange={(e) => setField("live_url", e.target.value)} placeholder="https://your-live-project.com" />
        <p className="text-xs text-muted-foreground">Optional. Leave blank if the project is not deployed.</p>
      </Field>

      <Field label="Display order" required htmlFor="project-display-order">
        <input
          id="project-display-order"
          type="number"
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
          required
          min={1}
          step={1}
          value={form.is_featured ? "1" : form.display_order}
          disabled
          readOnly
          aria-describedby="project-display-order-help"
        />
        <p id="project-display-order-help" className="text-xs text-muted-foreground">
          {form.is_featured
            ? "Featured projects are always assigned display order 1."
            : projectId
              ? "Display order is managed from the projects listing. Changes to Featured are applied when you save."
              : "Display order is assigned automatically when the project is created. You can change it from the projects listing afterward."}
        </p>
      </Field>

      <div className="space-y-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
        <p className="text-sm font-medium">Publishing options</p>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={form.is_published} onChange={(e) => setField("is_published", e.target.checked)} />
          <span>
            <span className="block text-sm font-medium">Published</span>
            <span className="mt-1 block text-xs text-muted-foreground">Allow this project to appear on the public portfolio.</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={form.is_featured}
            onChange={(e) => {
              const checked = e.target.checked;
              setForm((current) => ({
                ...current,
                is_featured: checked,
                display_order: checked ? "1" : current.display_order,
              }));
            }}
          />
          <span>
            <span className="block text-sm font-medium">Featured on homepage</span>
            <span className="mt-1 block text-xs text-muted-foreground">Mark this project as featured.</span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={saving || !canSubmit} className="min-w-36">
          {saving ? "Saving..." : projectId ? "Save changes" : "Create project"}
        </Button>
        <Link href="/admin/projects" className="inline-flex items-center justify-center rounded-lg border border-zinc-400 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted dark:border-zinc-600">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}