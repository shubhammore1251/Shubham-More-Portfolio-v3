import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin";
import { ProjectsList } from "./ProjectsList";

function ProjectsFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page py-12 md:py-16 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-9 w-64 max-w-full rounded-lg bg-muted" />
            <div className="h-4 w-80 max-w-full rounded bg-muted" />
          </div>

          <div className="h-10 w-36 rounded-xl bg-muted" />
        </div>

        {/* Summary cards skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="size-10 rounded-full bg-muted" />
              </div>

              <div className="mt-5 h-8 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-36 max-w-full rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="mt-8 rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-64 max-w-full rounded bg-muted" />
            </div>

            <div className="h-10 w-64 max-w-full rounded-xl bg-muted" />
          </div>

          {/* Content rows */}
          <div className="space-y-0 divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-6">
                <div className="size-10 shrink-0 rounded-full bg-muted" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-48 max-w-full rounded bg-muted" />
                  <div className="h-3 w-72 max-w-full rounded bg-muted" />
                </div>

                <div className="hidden h-8 w-20 rounded-lg bg-muted sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

async function AdminProjectsContent() {
  const session = await getAdminSession();

  if (!session.authorized) {
    if (session.reason === "unauthenticated") {
      redirect("/admin/login");
    }

    if (session.reason === "mfa_required") {
      redirect("/admin/login?mfa=required");
    }

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container-page py-12 md:py-16">
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
          <span className="text-foreground">Projects</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">PORTFOLIO ADMIN</p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Projects
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Create, edit, and manage your portfolio projects.
            </p>
          </div>

          <Link
            href="/admin/projects/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            + New Project
          </Link>
        </div>

        <div className="mt-8">
          <ProjectsList />
        </div>
      </div>
    </main>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <AdminProjectsContent />
    </Suspense>
  );
}
