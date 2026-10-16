import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getAdminSession } from "@/lib/supabase/admin";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

function AdminDashboardFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page animate-pulse py-12 md:py-16">
        {/* Dashboard header */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-8 w-44 rounded-lg bg-muted" />
            <div className="h-4 w-72 max-w-full rounded bg-muted" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-40 rounded-xl border bg-card" />
            <div className="h-10 w-24 rounded-xl bg-muted" />
          </div>
        </div>

        {/* Dashboard navigation cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <section
              key={index}
              className="rounded-[20px] border border-border bg-card p-6"
            >
              <div className="rounded-[18px] border border-border p-6">
                {/* Card title */}
                <div className="h-5 w-32 rounded bg-muted" />

                {/* Description lines */}
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </div>

                {/* Navigation link */}
                <div className="mt-5 h-4 w-32 rounded bg-muted" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

async function AdminDashboardContent() {
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">PORTFOLIO ADMIN</p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your portfolio projects and articles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/security"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span aria-hidden="true">⚙</span>
              Security Settings
            </Link>

            <LogoutButton />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border bg-card p-6">
            <Link
              href="/admin/projects"
              className="block rounded-xl border bg-card p-6 transition-colors hover:bg-muted/30"
            >
              <h2 className="text-lg font-semibold">Projects</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Add projects, edit details, and manage publication and featured
                status.
              </p>

              <p className="mt-4 text-sm font-medium text-primary">
                Manage projects →
              </p>
            </Link>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <Link
              href="/admin/blogs"
              className="block rounded-xl border bg-card p-6 transition-colors hover:bg-muted/30"
            >
              <h2 className="text-lg font-semibold">Blog posts</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Manage article links, descriptions, cover images, and
                publication status.
              </p>

              <p className="mt-4 text-sm font-medium text-primary">
                Manage blogs →
              </p>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminDashboardFallback />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
