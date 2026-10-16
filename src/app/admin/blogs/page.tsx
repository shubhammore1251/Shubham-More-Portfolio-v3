"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  tags: string[] | null;
};

type BlogFilter = "all" | "published" | "drafts";

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BlogFilter>("all");

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/blogs", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load blog posts.");
      }

      setBlogs(Array.isArray(result.blogs) ? result.blogs : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load blog posts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBlogs();
  }, [loadBlogs]);

  const publishedCount = blogs.filter((blog) => blog.is_published).length;
  const draftCount = blogs.length - publishedCount;

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && blog.is_published) ||
        (filter === "drafts" && !blog.is_published);

      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.slug.toLowerCase().includes(query) ||
        (blog.excerpt ?? "").toLowerCase().includes(query) ||
        (blog.tags ?? []).some((tag) => tag.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [blogs, filter, search]);

  async function togglePublished(blog: Blog) {
    setBusyId(blog.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !blog.is_published }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update publication status.");
      }

      setBlogs((current) =>
        current.map((item) =>
          item.id === blog.id
            ? { ...item, is_published: !blog.is_published }
            : item,
        ),
      );

      setSuccess(
        `"${blog.title}" is now ${
          !blog.is_published ? "published" : "a draft"
        }.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update blog post.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteBlog(blog: Blog) {
    const confirmed = window.confirm(
      `Delete "${blog.title}" permanently? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyId(blog.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete blog post.");
      }

      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      setSuccess(`Deleted "${blog.title}".`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete blog post.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const filterOptions: { label: string; value: BlogFilter; count: number }[] = [
    { label: "All posts", value: "all", count: blogs.length },
    { label: "Published", value: "published", count: publishedCount },
    { label: "Drafts", value: "drafts", count: draftCount },
  ];

  if (loading) {
    return <AdminBlogsSkeleton />;
  }

  return (
    <main className="min-h-full bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-7">
        {/* Page header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Link> */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground"
              >
                Admin
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground">Blogs</span>
            </nav>

            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              Blog posts
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Create articles, manage drafts, and control what appears on your
              portfolio.
            </p>
          </div>

          <Link
            href="/admin/blogs/new"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:self-auto"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            Create blog
          </Link>
        </header>

        {/* Summary cards */}
        <section
          aria-label="Blog post statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Total posts
              </p>
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="M7 3.75h7l5 5V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 4v5h5M8.5 13h7M8.5 16.5h7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "—" : blogs.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              All articles and drafts
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Published
              </p>
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "—" : publishedCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Visible to your readers
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                Drafts
              </p>
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="m15.5 5.5 3 3M4 20l4.5-1 10.8-10.8a2.12 2.12 0 0 0-3-3L5.5 16 4 20Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "—" : draftCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Still being worked on
            </p>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => void loadBlogs()}
              className="shrink-0 self-start font-semibold text-foreground underline underline-offset-4 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm"
          >
            <p className="text-foreground">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss notification"
              className="text-lg leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}

        {/* Posts area */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Your articles</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage content and publication status.
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4 4" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, slug, or tag..."
                  aria-label="Search blog posts"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {filterOptions.map((option) => {
                const active = filter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    aria-pressed={active}
                    className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {option.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                        active ? "bg-background/15" : "bg-muted"
                      }`}
                    >
                      {loading ? "—" : option.count}
                    </span>
                  </button>
                );
              })}

              <span className="ml-auto text-xs text-muted-foreground">
                {loading
                  ? "Loading posts…"
                  : `${filteredBlogs.length} ${
                      filteredBlogs.length === 1 ? "post" : "posts"
                    }`}
              </span>
            </div>
          </div>

          {loading ? (
            <div
              className="space-y-4 p-5 sm:p-6"
              aria-label="Loading blog posts"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 py-3"
                >
                  <div className="size-11 shrink-0 rounded-xl bg-muted" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-2/5 rounded bg-muted" />
                    <div className="h-3 w-1/4 rounded bg-muted" />
                  </div>
                  <div className="hidden h-6 w-20 rounded-full bg-muted sm:block" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border bg-muted/60">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                >
                  <path
                    d="M7 3.75h7l5 5V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 4v5h5M8.5 13h7M8.5 16.5h4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-semibold">No blog posts yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Your articles will appear here. Create your first blog post to
                start sharing your work and ideas.
              </p>

              <Link
                href="/admin/blogs/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
                Create your first blog
              </Link>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-6"
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4 4" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold">No matching posts</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search or change the publication filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 font-medium text-muted-foreground">
                        Article
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-5 py-4 font-medium text-muted-foreground">
                        Published date
                      </th>
                      <th className="px-6 py-4 text-right font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filteredBlogs.map((blog) => (
                      <tr
                        key={blog.id}
                        className={`transition-colors hover:bg-muted/25 ${
                          busyId === blog.id ? "opacity-60" : ""
                        }`}
                      >
                        <td className="max-w-xl px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-sm font-semibold text-muted-foreground">
                              {blog.title.trim().charAt(0).toUpperCase() || "B"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold leading-5 text-foreground">
                                {blog.title}
                              </p>
                              <p className="mt-1 break-all text-xs text-muted-foreground">
                                /{blog.slug}
                              </p>
                              {blog.excerpt && (
                                <p className="mt-2 line-clamp-2 max-w-lg text-xs leading-5 text-muted-foreground">
                                  {blog.excerpt}
                                </p>
                              )}
                              {!!blog.tags?.length && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {blog.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ${
                              blog.is_published
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                blog.is_published
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {blog.is_published ? "Published" : "Draft"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-muted-foreground">
                          {blog.is_published
                            ? formatDate(blog.published_at)
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() => void togglePublished(blog)}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busyId === blog.id
                                ? "Saving…"
                                : blog.is_published
                                  ? "Unpublish"
                                  : "Publish"}
                            </button>

                            <Link
                              href={`/admin/blogs/${blog.id}/edit`}
                              aria-label={`Edit ${blog.title}`}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() => void deleteBlog(blog)}
                              className="rounded-lg px-2 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-border md:hidden">
                {filteredBlogs.map((blog) => (
                  <article key={blog.id} className="space-y-4 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-sm font-semibold text-muted-foreground">
                        {blog.title.trim().charAt(0).toUpperCase() || "B"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold leading-5">
                          {blog.title}
                        </h3>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          /{blog.slug}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                          blog.is_published
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {blog.is_published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {blog.excerpt && (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {blog.excerpt}
                      </p>
                    )}

                    {!!blog.tags?.length && (
                      <div className="flex flex-wrap gap-1.5">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {blog.is_published
                        ? `Published ${formatDate(blog.published_at)}`
                        : `Created ${formatDate(blog.created_at)}`}
                    </p>

                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                      >
                        Edit post
                      </Link>

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => void togglePublished(blog)}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                      >
                        {busyId === blog.id
                          ? "Saving…"
                          : blog.is_published
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => void deleteBlog(blog)}
                        className="inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {!loading && blogs.length > 0 && (
            <footer className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing {filteredBlogs.length} of {blogs.length} posts
              </span>
              <button
                type="button"
                onClick={() => void loadBlogs()}
                disabled={busyId !== null}
                className="self-start font-medium text-foreground transition hover:underline disabled:opacity-50 sm:self-auto"
              >
                Refresh list
              </button>
            </footer>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminBlogsSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page animate-pulse py-8 md:py-10">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-36 rounded bg-muted" />
            <div className="h-8 w-44 rounded bg-muted" />
            <div className="h-4 w-80 max-w-full rounded bg-muted" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-muted" />
        </div>

        {/* Summary cards */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-border bg-card p-5"
            >
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="size-10 rounded-full bg-muted" />
              </div>
              <div className="mt-5 h-8 w-12 rounded bg-muted" />
              <div className="mt-2 h-3 w-36 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Articles panel */}
        <div className="mt-6 overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-56 rounded bg-muted" />
              </div>
              <div className="h-10 w-full max-w-sm rounded-xl bg-muted sm:w-80" />
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-9 w-28 rounded-xl bg-muted" />
              <div className="h-9 w-28 rounded-xl bg-muted" />
              <div className="h-9 w-24 rounded-xl bg-muted" />
            </div>
          </div>

          {/* Article rows */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 border-t border-border p-5 sm:p-6"
            >
              <div className="size-10 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-4 w-full max-w-lg rounded bg-muted" />
                <div className="h-3 w-full max-w-md rounded bg-muted" />
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3].map((tag) => (
                    <div key={tag} className="h-6 w-14 rounded-full bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between border-t border-border p-4">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
