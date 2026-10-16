
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BlogForm,
  type BlogFormValues,
} from "@/components/admin/blog-form";

type BlogRecord = {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  url: string;
  image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  is_published: boolean;
};

function EditBlogPageContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [blog, setBlog] = useState<BlogFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBlog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/blogs", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load blog post.");
      }

      const record = (result.blogs as BlogRecord[] | undefined)?.find(
        (item) => item.id === id,
      );

      if (!record) {
        throw new Error("Blog post not found.");
      }

      setBlog({
        title: record.title ?? "",
        slug: record.slug ?? "",
        excerpt: record.description ?? "",
        blog_url: record.url ?? "",
        cover_image_url: record.image_url ?? "",
        tags: record.tags ?? [],
        published_at: record.published_at
          ? record.published_at.slice(0, 10)
          : "",
        is_published: record.is_published ?? false,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load blog post.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadBlog();
  }, [loadBlog]);

  if (loading) {
    return (
      <div className="rounded-xl border p-8 text-sm text-muted-foreground">
        Loading blog post...
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="space-y-4 rounded-xl border p-6">
        <p role="alert" className="text-sm text-destructive">
          {error || "Blog post not found."}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadBlog()}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Try again
          </button>

          <Link
            href="/admin/blogs"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link
          href="/admin/blogs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to blog posts
        </Link>

        <h1 className="mt-3 text-2xl font-bold">Edit blog post</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the article details and publication settings.
        </p>
      </div>

      <BlogForm key={id} blogId={id} initialValues={blog} />
    </div>
  );
}

export default function EditBlogPage() {
  return (
    <Suspense
      fallback={
        <main className="container-page py-12">
          <p className="text-sm text-muted-foreground">
            Loading blog editor...
          </p>
        </main>
      }
    >
      <EditBlogPageContent />
    </Suspense>
  );
}