"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  blog_url: string;
  cover_image_url: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
};

type BlogFormProps = {
  blogId?: string;
  initialValues?: Partial<BlogFormValues>;
};

const EMPTY_VALUES: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  blog_url: "",
  cover_image_url: "",
  tags: [],
  is_published: false,
  published_at: new Date().toISOString().slice(0, 10),
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function BlogForm({ blogId, initialValues }: BlogFormProps) {
  const router = useRouter();
  const isEditing = Boolean(blogId);

  const [form, setForm] = useState<BlogFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    tags: initialValues?.tags ?? [],
  });

  const [autoSlug, setAutoSlug] = useState(!initialValues?.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [form.cover_image_url]);

  function updateField<K extends keyof BlogFormValues>(
    field: K,
    value: BlogFormValues[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: autoSlug ? slugify(value) : current.slug,
    }));
  }

  function handleSlugChange(value: string) {
    setAutoSlug(false);
    updateField("slug", slugify(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a blog title.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a slug.");
      return;
    }

    if (!form.excerpt.trim()) {
      setError("Please enter a short description.");
      return;
    }

    if (!isValidHttpsUrl(form.blog_url)) {
      setError("Enter a valid HTTPS URL for the Hashnode article.");
      return;
    }

    if (form.cover_image_url.trim() && !isValidHttpsUrl(form.cover_image_url)) {
      setError("The cover image URL must be a valid HTTPS URL.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.excerpt.trim(),
        url: form.blog_url.trim(),
        image_url: form.cover_image_url.trim() || null,
        tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
        is_published: form.is_published,
        published_at: form.is_published
          ? form.published_at
            ? new Date(`${form.published_at}T12:00:00.000Z`).toISOString()
            : new Date().toISOString()
          : null,
      };

      const response = await fetch(
        blogId ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs",
        {
          method: blogId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Unable to ${isEditing ? "update" : "create"} the blog post.`,
        );
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the blog.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <main className="min-h-full bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-7">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Back to blog posts
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isEditing ? "Edit blog post" : "Create blog post"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Manage your article details and link to the full post on Hashnode.
              The article content stays on Hashnode.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-6">
              {/* Article details */}
              <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-semibold">Article details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Basic information displayed on your portfolio.
                  </p>
                </div>

                <div>
                  <label htmlFor="title" className={labelClass}>
                    Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Getting Started With React Native"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="slug" className={labelClass}>
                    Slug <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    required
                    maxLength={200}
                    value={form.slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    placeholder="getting-started-with-react-native"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    URL identifier generated from the title. You can edit it.
                  </p>
                </div>

                <div>
                  <label htmlFor="excerpt" className={labelClass}>
                    Short description{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    required
                    rows={4}
                    maxLength={500}
                    value={form.excerpt}
                    onChange={(event) =>
                      updateField("excerpt", event.target.value)
                    }
                    placeholder="A short summary shown on the blog card."
                    className={`${inputClass} resize-y`}
                  />
                  <div className="mt-1.5 flex justify-end text-xs text-muted-foreground">
                    {form.excerpt.length}/500
                  </div>
                </div>
              </section>

              {/* Hashnode URLs */}
              <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-semibold">
                    Article and cover image
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Paste the public URLs from Hashnode. No image upload is
                    needed.
                  </p>
                </div>

                <div>
                  <label htmlFor="blog_url" className={labelClass}>
                    Hashnode article URL{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="blog_url"
                    name="blog_url"
                    type="url"
                    required
                    value={form.blog_url}
                    onChange={(event) =>
                      updateField("blog_url", event.target.value)
                    }
                    placeholder="https://yourblog.hashnode.dev/your-article"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Readers will open the full article on Hashnode.
                  </p>
                </div>

                <div>
                  <label htmlFor="cover_image_url" className={labelClass}>
                    Cover image URL
                  </label>
                  <input
                    id="cover_image_url"
                    name="cover_image_url"
                    type="url"
                    value={form.cover_image_url}
                    onChange={(event) =>
                      updateField("cover_image_url", event.target.value)
                    }
                    placeholder="https://cdn.hashnode.com/res/hashnode/image/upload/..."
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Paste the full HTTPS image URL copied from Hashnode.
                  </p>
                </div>

                {form.cover_image_url.trim() &&
                  isValidHttpsUrl(form.cover_image_url) && (
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                        <p className="text-sm font-medium">
                          Cover image preview
                        </p>
                        {!imageError && (
                          <span className="text-xs text-emerald-600">
                            Preview
                          </span>
                        )}
                      </div>

                      {imageError ? (
                        <div className="flex min-h-36 flex-col items-center justify-center gap-2 p-5 text-center">
                          <p className="text-sm font-medium">
                            Image could not be loaded
                          </p>
                          <p className="max-w-sm break-all text-xs text-muted-foreground">
                            Check that the URL points to a publicly accessible
                            image.
                          </p>
                          <button
                            type="button"
                            onClick={() => setImageError(false)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      ) : (
                        <img
                          key={form.cover_image_url}
                          src={form.cover_image_url}
                          alt="Blog cover preview"
                          className="block max-h-80 w-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      )}

                      <div className="border-t border-border px-3 py-2.5">
                        <p className="break-all text-xs leading-5 text-muted-foreground">
                          {form.cover_image_url}
                        </p>
                      </div>
                    </div>
                  )}
              </section>

              {/* Tags */}
              <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-semibold">Tags</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Separate tags with commas.
                  </p>
                </div>

                <div>
                  <label htmlFor="tags" className={labelClass}>
                    Article tags
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    value={form.tags.join(", ")}
                    onChange={(event) =>
                      updateField(
                        "tags",
                        event.target.value.split(",").map((tag) => tag.trim()),
                      )
                    }
                    placeholder="React Native, JavaScript, Mobile"
                    className={inputClass}
                  />
                  {form.tags.filter(Boolean).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.tags.filter(Boolean).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Publishing sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-6">
              <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
                <div>
                  <h2 className="text-base font-semibold">Publishing</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Control the visibility of this portfolio entry.
                  </p>
                </div>

                <label
                  htmlFor="is_published"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="is_published"
                    name="is_published"
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) =>
                      updateField("is_published", event.target.checked)
                    }
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium">Published</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {form.is_published
                        ? "This post is marked as published."
                        : "This post remains a draft and is hidden publicly."}
                    </span>
                  </span>
                </label>

                <div>
                  <label htmlFor="published_at" className={labelClass}>
                    Publication date
                  </label>
                  <input
                    id="published_at"
                    name="published_at"
                    type="date"
                    value={form.published_at}
                    onChange={(event) =>
                      updateField("published_at", event.target.value)
                    }
                    disabled={!form.is_published}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Current status
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={`size-2 rounded-full ${
                        form.is_published ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {form.is_published ? "Published" : "Draft"}
                  </p>
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                      ? "Save changes"
                      : "Create blog post"}
                </button>

                <Link
                  href="/admin/blogs"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
                >
                  Cancel
                </Link>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  The full article remains hosted on Hashnode.
                </p>
              </section>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
