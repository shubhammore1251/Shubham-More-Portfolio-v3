
import type { PortfolioBlogPost } from "@/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import { revalidatePath } from "next/cache";

type BlogRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  url: string;
  image_url: string;
  tags: string[];
  reading_time_minutes: number | null;
  published_at: string;
  created_at: string;
  is_published: boolean;
};

// function randomSample<T>(items: T[], count: number): T[] {
//   const shuffled = [...items];

//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }

//   return shuffled.slice(0, count);
// }

export async function getBlogPosts(
  count = 3,
): Promise<PortfolioBlogPost[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured; no database blogs loaded.");
    return [];
  }

  try {
    const supabase = await createPublicClient();

    const { data, error } = await supabase
      .from("blogs")
      .select(
        [
          "id",
          "title",
          "slug",
          "description",
          "url",
          "image_url",
          "tags",
          "reading_time_minutes",
          "published_at",
          "created_at",
          "is_published",
        ].join(", "),
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as unknown as BlogRow[];

    const posts: PortfolioBlogPost[] = rows.map((row, index) => ({
      id: row.id,
      title: row.title,
      slug: row.slug ?? row.id,

      // The database column is "description".
      // The frontend property is "excerpt".
      excerpt: row.description,

      // Hashnode hosts the cover image; no Supabase Storage lookup.
      coverImageUrl: row.image_url || null,

      publishedAt: row.published_at ?? row.created_at,
      readingTimeMinutes: row.reading_time_minutes,
      tags: row.tags ?? [],

      // Open the full article hosted on Hashnode.
      url: row.url,

      source: "hashnode",
      sortOrder: index + 1,
    }));

    return posts.slice(0, Math.max(0, count));
  } catch (error) {
    console.error("Failed to fetch published blog posts:", error);
    return [];
  }
}

export function invalidateBlogPostsCache(): void {
  revalidatePath("/");
  revalidatePath("/blogs");
}
