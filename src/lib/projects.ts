
import {
  projects as fallbackProjects,
  technologies as T,
} from "@/data/portfolio";
import type { PortfolioProject, TechnologyItem } from "@/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

const PROJECTS_LIMIT = 10;
const STORAGE_BUCKET = "portfolio-images";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  image_path: string | null;
  image_alt: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: unknown[] | null;
  highlights: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
};

type GetProjectsOptions = {
  limit?: number;
  strict?: boolean;
};

function getSafeLimit(limit?: number): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return PROJECTS_LIMIT;
  }

  return Math.max(1, Math.min(Math.floor(limit), PROJECTS_LIMIT));
}

function mapTechnology(value: unknown): TechnologyItem | null {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    // Resolve references such as "T.nextjs" against the technology catalog.
    if (trimmed.startsWith("T.")) {
      const key = trimmed.slice(2);
      const technology = (
        T as unknown as Record<string, TechnologyItem | undefined>
      )[key];

      return technology ?? null;
    }

    // Support legacy technology IDs and names.
    const catalog = Object.values(T) as TechnologyItem[];
    const existing = catalog.find((technology) => {
      const item = technology as TechnologyItem & {
        id?: string;
        name?: string;
      };

      return item.id === trimmed || item.name === trimmed;
    });

    if (existing) {
      return existing;
    }

    return {
      id: trimmed,
      name: trimmed,
    } as TechnologyItem;
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;

    // Support serialized references such as { "id": "T.nextjs" }.
    if (typeof item.id === "string" && item.id.startsWith("T.")) {
      const key = item.id.slice(2);
      const technology = (
        T as unknown as Record<string, TechnologyItem | undefined>
      )[key];

      if (technology) {
        return technology;
      }
    }

    // Support technology objects already stored in the database.
    if (
      typeof item.id === "string" &&
      typeof item.name === "string"
    ) {
      return item as unknown as TechnologyItem;
    }
  }

  return null;
}

function getImageUrl(
  imagePath: string | null,
  supabase: Awaited<ReturnType<typeof createPublicClient>>,
): string {
  if (!imagePath) {
    return "";
  }

  // Allow legacy absolute URLs while preferring Storage paths.
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

function mapProject(
  row: ProjectRow,
  supabase: Awaited<ReturnType<typeof createPublicClient>>,
): PortfolioProject {
  const imagePublicUrl = getImageUrl(row.image_path, supabase);

  const technologies = (row.technologies ?? [])
    .map(mapTechnology)
    .filter(
      (technology): technology is TechnologyItem => technology !== null,
    );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    image_path: imagePublicUrl,
    image_alt: row.image_alt ?? row.title,
    github_url: row.github_url,
    live_url: row.live_url,
    technologies,
    highlights: row.highlights ?? [],
    is_published: row.is_published,
    is_featured: row.is_featured,
    display_order: row.display_order,
  } as PortfolioProject;
}

function sortProjects(projects: PortfolioProject[]): PortfolioProject[] {
  return [...projects].sort((a, b) => {
    const orderA = Number(a.display_order ?? 0);
    const orderB = Number(b.display_order ?? 0);

    return orderA - orderB;
  });
}

export async function getProjects(
  options: GetProjectsOptions = {},
): Promise<PortfolioProject[]> {
  const limit = getSafeLimit(options.limit);

  if (!isSupabaseConfigured()) {
    if (options.strict) {
      throw new Error(
        "Supabase is not configured. Check your Supabase environment variables.",
      );
    }

    return sortProjects(
      (fallbackProjects as PortfolioProject[])
        .filter((project) => project.is_published !== false)
        .slice(0, limit),
    );
  }

  try {
    const supabase = await createPublicClient();

    // Fetch published projects only. is_featured is deliberately NOT a filter.
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(
        `Supabase projects query failed: ${error.message} (code: ${error.code ?? "unknown"})`,
      );
    }

    const rows = (data ?? []) as ProjectRow[];

    if (rows.length === 0 && options.strict) {
      throw new Error(
        "Supabase returned zero published projects. Check the database records, project URL, and SELECT policies.",
      );
    }

    // Preserve the database display order. Featured status does not change
    // which projects are fetched or reorder the returned records.
    return rows.map((row) => mapProject(row, supabase));
  } catch (error) {
    console.error("Failed to fetch published projects:", error);

    if (options.strict) {
      throw error;
    }

    return sortProjects(
      (fallbackProjects as PortfolioProject[])
        .filter((project) => project.is_published !== false)
        .slice(0, limit),
    );
  }
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  // Fetch published projects using the same query rules.
  // The frontend should use is_featured to highlight the featured project.
  return getProjects({ limit: PROJECTS_LIMIT });
}
