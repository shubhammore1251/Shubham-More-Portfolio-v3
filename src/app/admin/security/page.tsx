import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminIdentity } from "@/lib/supabase/admin";
import { EnrollAuthenticator } from "@/components/admin/EnrollAuthenticator";

export const metadata = {
  title: "Security Settings | Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminSecurityPage() {
  const identity = await getAdminIdentity();

  if (!identity.authorized) {
    if (identity.reason === "unauthenticated") {
      redirect("/admin/login");
    }

    redirect("/");
  }

  if (
    identity.hasVerifiedFactor &&
    identity.currentLevel !== "aal2"
  ) {
    redirect("/admin/login?mfa=required");
  }

  const setupRequired = !identity.hasVerifiedFactor;

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={setupRequired ? "/admin/security" : "/admin"}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          {setupRequired ? "Security setup" : "← Back to dashboard"}
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="size-6"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Administrator
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {setupRequired ? "Secure your account" : "Security settings"}
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            {setupRequired
              ? "Set up an authenticator before accessing the admin dashboard. Your account remains restricted until verification succeeds."
              : "Manage your authenticator securely. A replacement is verified before your existing authenticator is removed."}
          </p>
        </header>

        {setupRequired && (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="font-medium">Authenticator setup required</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Dashboard and content-management access remain blocked until
              you complete MFA verification.
            </p>
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Two-factor authentication
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use an authenticator app that generates time-based codes.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium">
              {setupRequired ? "Setup needed" : "AAL2 verified"}
            </span>
          </div>

          <EnrollAuthenticator
            replacementMode={!setupRequired}
          />
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
          Never share your one-time codes or authenticator setup key.
        </p>
      </div>
    </main>
  );
}