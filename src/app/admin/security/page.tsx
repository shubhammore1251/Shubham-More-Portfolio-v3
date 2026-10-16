
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/supabase/admin";
import { EnrollAuthenticator } from "@/components/admin/EnrollAuthenticator";

export const metadata = {
  title: "Admin Security",
  robots: {
    index: false,
    follow: false,
  },
};

function AdminSecurityFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page animate-pulse py-8 md:py-10">
        {/* Breadcrumb */}
        <div className="h-3 w-36 rounded bg-muted" />

        {/* Page heading */}
        <div className="mt-5 space-y-3">
          <div className="h-8 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-80 max-w-full rounded bg-muted" />
        </div>

        {/* Security settings card */}
        <div className="mt-8 overflow-hidden rounded-[22px] border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="h-5 w-44 rounded bg-muted" />
            <div className="mt-3 h-4 w-full max-w-md rounded bg-muted" />
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Authenticator status */}
            <div className="flex items-start gap-4 rounded-2xl border border-border p-4 sm:p-5">
              <div className="size-11 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-4 w-48 max-w-full rounded bg-muted" />
                <div className="h-3 w-full max-w-lg rounded bg-muted" />
                <div className="h-3 w-3/4 max-w-md rounded bg-muted" />
              </div>
            </div>

            {/* Setup instructions */}
            <div className="space-y-3">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-24 rounded-xl border border-border bg-muted/40" />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-36 rounded-xl bg-muted" />
              <div className="h-10 w-28 rounded-xl border border-border bg-card" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Loading security settings...
        </p>
      </div>
    </main>
  );
}

async function AdminSecurityContent() {
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
      <div className="container-page py-8 md:py-10">
        {/* Breadcrumb */}
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
          <span className="text-foreground">Security settings</span>
        </nav>

        {/* Page header */}
        <div className="mt-5">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Security settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Protect your admin account by setting up an authenticator app
            for two-factor authentication.
          </p>
        </div>

        {/* Security panel */}
        <section className="mt-8 overflow-hidden rounded-[22px] border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5 text-foreground"
                  aria-hidden="true"
                >
                  <path d="M12 3 19 6v5c0 4.5-2.9 7.7-7 10-4.1-2.3-7-5.5-7-10V6l7-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  Two-factor authentication
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Add another layer of protection using a time-based code
                  from your authenticator app.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <EnrollAuthenticator />
          </div>
        </section>

        {/* Security reminder */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>

          <p className="text-sm leading-6 text-muted-foreground">
            Keep your authenticator app accessible. If your account requires
            two-factor authentication, you may need a valid verification code
            to sign in.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminSecurityPage() {
  return (
    <Suspense fallback={<AdminSecurityFallback />}>
      <AdminSecurityContent />
    </Suspense>
  );
}
