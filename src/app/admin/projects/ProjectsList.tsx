
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
};

type StatusFilter = "all" | "published" | "drafts";

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  tone?: "neutral" | "green" | "orange";
}) {
  const iconStyles = {
    neutral: "bg-[#f0e8df] text-[#29231f]",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-[20px] border border-[#e8ded4] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#766b62]">{label}</p>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconStyles[tone]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#211c18]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8a7e74]">{description}</p>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        published
          ? "bg-emerald-50 text-emerald-700"
          : "bg-orange-50 text-orange-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          published ? "bg-emerald-500" : "bg-orange-500"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="size-[18px]"
      aria-hidden="true"
    >
      <path d="M7 3.75h7l5 5V20a.75.75 0 0 1-.75.75h-11.5A.75.75 0 0 1 6 20V4.5a.75.75 0 0 1 .75-.75Z" />
      <path d="M14 4v5h5M9 13h6M9 16.5h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-[18px]"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-[18px]"
      aria-hidden="true"
    >
      <path d="m14 5 5 5M4 20l4.5-1 11-11a2.12 2.12 0 0 0-3-3l-11 11L4 20Z" />
    </svg>
  );
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const sortProjects = (items: Project[]) =>
    [...items].sort((a, b) => a.display_order - b.display_order);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load projects.");
      }

      setProjects(sortProjects(result.projects ?? []));
      setOrderDrafts({});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const updateProject = async (
    project: Project,
    changes: Partial<
      Pick<Project, "is_published" | "is_featured" | "display_order">
    >,
  ) => {
    setSaving(project.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update project.");
      }

      if (Array.isArray(result.projects)) {
        setProjects(sortProjects(result.projects));
        setOrderDrafts({});
      } else {
        await loadProjects();
      }

      setSuccess(`Updated "${project.title}".`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project.",
      );

      // Restore the saved values after a failed request.
      await loadProjects();
    } finally {
      setSaving(null);
    }
  };

  const changeDisplayOrder = (project: Project, rawValue: string) => {
    setOrderDrafts((current) => {
      const next = { ...current };
      delete next[project.id];
      return next;
    });

    if (rawValue.trim() === "") return;

    const value = Number(rawValue);

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > projects.length
    ) {
      setError(
        `Display order must be between 1 and ${projects.length}.`,
      );
      return;
    }

    if (value === project.display_order) return;

    void updateProject(project, { display_order: value });
  };

  const publishedCount = projects.filter(
    (project) => project.is_published,
  ).length;

  const draftCount = projects.length - publishedCount;

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && project.is_published) ||
        (filter === "drafts" && !project.is_published);

      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [projects, search, filter]);

  const featuredProject = projects.find((project) => project.is_featured);

  const filters: {
    value: StatusFilter;
    label: string;
    count: number;
  }[] = [
    { value: "all", label: "All projects", count: projects.length },
    { value: "published", label: "Published", count: publishedCount },
    { value: "drafts", label: "Drafts", count: draftCount },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <section
        aria-label="Project statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <SummaryCard
          label="Total projects"
          value={projects.length}
          description="All portfolio projects"
          icon={<DocumentIcon />}
        />
        <SummaryCard
          label="Published"
          value={publishedCount}
          description="Visible to your visitors"
          icon={<CheckIcon />}
          tone="green"
        />
        <SummaryCard
          label="Drafts"
          value={draftCount}
          description="Not currently published"
          icon={<PencilIcon />}
          tone="orange"
        />
      </section>

      {/* Project management panel */}
      <section className="overflow-hidden rounded-[22px] border border-[#e8ded4] bg-white shadow-sm">
        <div className="border-b border-[#e8ded4] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#211c18]">
                Your projects
              </h2>
              <p className="mt-1 text-sm text-[#82766d]">
                Manage your portfolio projects and publication status.
              </p>
            </div>

            <div className="relative w-full lg:max-w-[355px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a7e74]"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.3" />
                <path d="m15.5 15.5 4 4" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, slug, or description..."
                aria-label="Search projects"
                className="h-10 w-full rounded-2xl border border-[#e8ded4] bg-[#f8f5f1] pl-9 pr-4 text-sm text-[#29231f] outline-none transition placeholder:text-[#8a7e74] focus:border-[#ed6b3b] focus:ring-2 focus:ring-[#ed6b3b]/10"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter projects by status"
            >
              {filters.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      active
                        ? "border-[#28221e] bg-[#28221e] text-white"
                        : "border-[#e8ded4] bg-[#f8f5f1] text-[#766b62] hover:bg-[#f0e8df]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-[#eee5dc] text-[#766b62]"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-[#82766d]" aria-live="polite">
              {loading
                ? "Loading projects..."
                : `${filteredProjects.length} ${
                    filteredProjects.length === 1 ? "project" : "projects"
                  }`}
            </span>
          </div>
        </div>

        {/* Feedback messages */}
        {(error || success) && (
          <div className="space-y-2 px-5 pt-4 sm:px-6">
            {error && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="font-medium underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <span>{success}</span>
                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="font-medium underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {featuredProject && !loading && (
          <div className="mx-5 mt-4 rounded-xl border border-[#eee5dc] bg-[#faf7f3] px-4 py-3 text-xs text-[#766b62] sm:mx-6">
            <span className="font-semibold text-[#29231f]">
              Featured project:
            </span>{" "}
            {featuredProject.title}. Its display order is locked at position 1.
          </div>
        )}

        {/* Responsive table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-y border-[#e8ded4] bg-[#faf7f4]">
              <tr className="text-xs text-[#766b62]">
                <th scope="col" className="px-5 py-4 font-medium sm:px-6">
                  Project
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Created
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Featured
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Order
                </th>
                <th scope="col" className="px-5 py-4 text-right font-medium sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ded4]">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-[#82766d]"
                  >
                    Loading your projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#f0e8df] text-[#766b62]">
                      <DocumentIcon />
                    </div>
                    <p className="mt-3 font-medium text-[#29231f]">
                      {projects.length === 0
                        ? "No projects yet"
                        : "No matching projects"}
                    </p>
                    <p className="mt-1 text-sm text-[#82766d]">
                      {projects.length === 0
                        ? "Create your first project to start building your portfolio."
                        : "Try a different search or status filter."}
                    </p>
                    {projects.length === 0 && (
                      <Link
                        href="/admin/projects/new"
                        className="mt-4 inline-flex rounded-xl bg-[#ed6b3b] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#dc5b2e]"
                      >
                        + Create project
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const isFeatured = project.is_featured;
                  const isSaving = saving !== null;

                  return (
                    <tr
                      key={project.id}
                      className={`transition-colors hover:bg-[#fcfaf8] ${
                        saving === project.id ? "opacity-60" : ""
                      }`}
                    >
                      <td className="max-w-[420px] px-5 py-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e8ded4] bg-[#f8f4ef] text-xs font-semibold text-[#766b62]">
                            {project.title.trim().charAt(0).toUpperCase() || "P"}
                          </span>

                          <div className="min-w-0">
                            <p className="font-medium leading-5 text-[#29231f]">
                              {project.title}
                            </p>
                            <p className="mt-1 break-all text-xs text-[#82766d]">
                              /{project.slug}
                            </p>
                            {project.description && (
                              <p className="mt-2 line-clamp-2 max-w-md text-xs leading-5 text-[#82766d]">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge published={project.is_published} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#766b62]">
                        {formatDate(project.created_at)}
                      </td>

                      <td className="px-4 py-4">
                        <label className="inline-flex items-center gap-2 text-xs text-[#766b62]">
                          <input
                            type="checkbox"
                            checked={project.is_featured}
                            disabled={isSaving}
                            onChange={(event) =>
                              void updateProject(project, {
                                is_featured: event.target.checked,
                              })
                            }
                            className="size-4 rounded accent-[#ed6b3b] disabled:cursor-not-allowed"
                            aria-label={`Feature ${project.title}`}
                          />
                          {/* {project.is_featured ? "Yes" : "No"} */}
                          Yes
                        </label>
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min={1}
                          max={projects.length}
                          step={1}
                          value={
                            orderDrafts[project.id] ??
                            String(project.display_order)
                          }
                          disabled={isSaving || isFeatured}
                          onChange={(event) => {
                            const value = event.target.value;

                            setOrderDrafts((current) => ({
                              ...current,
                              [project.id]: value,
                            }));
                          }}
                          onBlur={(event) => {
                            const value =
                              orderDrafts[project.id] ?? event.target.value;

                            changeDisplayOrder(project, value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.currentTarget.blur();
                            }

                            if (event.key === "Escape") {
                              setOrderDrafts((current) => {
                                const next = { ...current };
                                delete next[project.id];
                                return next;
                              });
                            }
                          }}
                          aria-label={`Display order for ${project.title}`}
                          title={
                            isFeatured
                              ? "The featured project must stay at position 1."
                              : `Choose a position from 1 to ${projects.length}.`
                          }
                          className="w-[68px] rounded-lg border border-[#e8ded4] bg-white px-2.5 py-2 text-sm text-[#29231f] outline-none focus:border-[#ed6b3b] disabled:cursor-not-allowed disabled:bg-[#f8f5f1] disabled:opacity-60"
                        />
                        {isFeatured && (
                          <p className="mt-1 text-[10px] text-[#82766d]">
                            Locked
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-2">
                          {saving === project.id && (
                            <span className="text-[10px] text-[#82766d]">
                              Saving...
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                              void updateProject(project, {
                                is_published: !project.is_published,
                              })
                            }
                            className="rounded-xl border border-[#e8ded4] px-3 py-2 text-xs font-medium text-[#29231f] transition hover:bg-[#f8f5f1] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {project.is_published ? "Unpublish" : "Publish"}
                          </button>

                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="rounded-xl border border-[#e8ded4] px-3 py-2 text-xs font-medium text-[#29231f] transition hover:bg-[#f8f5f1]"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ded4] bg-[#fcfaf8] px-5 py-3 sm:px-6">
          <p className="text-xs text-[#82766d]">
            {loading
              ? "Loading project list..."
              : `Showing ${filteredProjects.length} of ${projects.length} ${
                  projects.length === 1 ? "project" : "projects"
                }`}
          </p>

          <button
            type="button"
            onClick={() => void loadProjects()}
            disabled={loading || saving !== null}
            className="text-xs font-medium text-[#29231f] transition hover:text-[#ed6b3b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh list"}
          </button>
        </div>
      </section>
    </div>
  );
}