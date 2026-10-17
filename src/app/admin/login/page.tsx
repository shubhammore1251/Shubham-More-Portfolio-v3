"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@iconify/react";

type LoginStep = "password" | "mfa";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<LoginStep>("password");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("mfa") === "required") {
      void resumeMfaChallenge();
    }
  }, []);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      // Verify administrator membership before allowing MFA login.
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut({ scope: "local" });

        throw new Error(
          "You are not authorized to access the admin dashboard.",
        );
      }

      // Find an already-enrolled, verified TOTP factor.
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        throw factorsError;
      }

      const verifiedFactor = factors.totp.find(
        (factor) => factor.status === "verified",
      );

      // if (!verifiedFactor) {
      //   await supabase.auth.signOut({ scope: "local" });

      //   throw new Error(
      //     "No verified authenticator is enrolled. Set up your authenticator before signing in.",
      //   );
      // }

      if (!verifiedFactor) {
        router.replace("/admin/security?setup=required");
        return;
      }

      // Start the MFA challenge. Do not navigate to /admin yet.
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: verifiedFactor.id,
        });

      if (challengeError) {
        throw challengeError;
      }

      setFactorId(verifiedFactor.id);
      setChallengeId(challenge.id);
      setOtp("");
      setStep("mfa");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const code = otp.trim();

    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit verification code.");
      return;
    }

    if (!factorId) {
      setError("Authenticator factor not found. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Create a fresh challenge and verify the code immediately.
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify(
        {
          factorId,
          code,
        },
      );

      if (verifyError) {
        throw verifyError;
      }

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (assuranceError || assurance.currentLevel !== "aal2") {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error(
          "MFA verification did not complete. Please sign in again.",
        );
      }

      window.location.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code. Please try again.",
      );

      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToLogin() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Clear the password-only session before restarting login.
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        throw signOutError;
      }

      setStep("password");
      setFactorId("");
      setChallengeId("");
      setOtp("");
      setPassword("");
    } catch {
      setError("Unable to end the current sign-in attempt. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resumeMfaChallenge() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // No active session: show the normal login form.
      if (userError || !user) {
        router.replace("/admin/login");
        return;
      }

      // The existing session must belong to an administrator.
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut({ scope: "local" });
        router.replace("/");
        return;
      }

      // If MFA was already completed, continue to the dashboard.
      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!assuranceError && assurance.currentLevel === "aal2") {
        router.replace("/admin");
        router.refresh();
        return;
      }

      // Find the enrolled TOTP factor.
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) throw factorsError;

      const factor = factors.totp.find((item) => item.status === "verified");

      // if (!factor) {
      //   await supabase.auth.signOut({ scope: "local" });
      //   router.replace("/admin/login");
      //   return;
      // }
      if (!factor) {
        router.replace("/admin/security?setup=required");
        return;
      }

      // Create a new challenge for this pending login.
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: factor.id,
        });

      if (challengeError) throw challengeError;

      setFactorId(factor.id);
      setChallengeId(challenge.id);
      setOtp("");
      setStep("mfa");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start MFA verification. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-primary">
            PORTFOLIO ADMIN
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            {step === "password" ? "Welcome back" : "Two-factor verification"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {step === "password"
              ? "Sign in to manage your projects and articles."
              : "Enter the six-digit code from your authenticator app to continue."}
          </p>
        </div>

        {step === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <div className="flex w-full items-center rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus-within:ring-2 focus-within:ring-primary">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <Icon
                    icon={
                      showPassword ? "akar-icons:eye-slashed" : "andrsrxn:eye"
                    }
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Authenticator code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full rounded-lg border bg-background px-3 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify and continue"}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={loading}
              className="w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
            >
              Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorized administrators only.
        </p>
      </div>
    </main>
  );
}
