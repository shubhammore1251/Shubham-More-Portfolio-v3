"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  replacementMode: boolean;
};

export function EnrollAuthenticator({ replacementMode }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [oldFactorIds, setOldFactorIds] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function startEnrollment() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { data: factors, error: listError } =
        await supabase.auth.mfa.listFactors();

      if (listError) throw listError;

      const verified = factors.totp.filter(
        (factor) => factor.status === "verified",
      );

      if (replacementMode && verified.length === 0) {
        throw new Error(
          "No existing verified authenticator was found. Refresh this page and try initial setup.",
        );
      }

      if (!replacementMode && verified.length > 0) {
        setMessage("An authenticator is already enabled. Refresh this page.");
        router.refresh();
        return;
      }

      // Remove abandoned, unverified enrollments only.
      for (const pending of factors.totp.filter(
        (factor) => factor.status !== "verified",
      )) {
        const { error: removeError } =
          await supabase.auth.mfa.unenroll({
            factorId: pending.id,
          });

        if (removeError) throw removeError;
      }

      const { data, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: `Portfolio Admin Authenticator ${crypto.randomUUID()}`,
        });

      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setOldFactorIds(verified.map((factor) => factor.id));
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start enrollment.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyEnrollment() {
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code,
        });

      if (verifyError) throw verifyError;

      // The replacement is verified first. Only then remove old factors.
      const removalFailures: string[] = [];

      for (const oldId of oldFactorIds) {
        const { error: removeError } =
          await supabase.auth.mfa.unenroll({
            factorId: oldId,
          });

        if (removeError) removalFailures.push(oldId);
      }

      setFactorId("");
      setOldFactorIds([]);
      setQrCode("");
      setSecret("");
      setCode("");

      if (removalFailures.length > 0) {
        setMessage(
          "The new authenticator is verified, but an old factor could not be removed. Keep the new authenticator and review your security settings.",
        );
        router.refresh();
        return;
      }

      if (replacementMode) {
        setMessage("Authenticator replaced successfully.");
        router.refresh();
      } else {
        router.replace("/admin");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Check the code and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!factorId ? (
        <>
          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                1
              </div>
              <div>
                <h3 className="font-medium">
                  {replacementMode
                    ? "Register a replacement"
                    : "Register your authenticator"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Open an authenticator app on your phone, then generate a
                  new setup QR code. Your existing verified factor stays
                  enabled during replacement.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={startEnrollment}
              disabled={loading}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? "Preparing setup…"
                : replacementMode
                  ? "Set up replacement"
                  : "Set up authenticator"}
            </button>
          </div>

          {replacementMode && (
            <p className="text-sm leading-6 text-muted-foreground">
              You must verify the replacement before the previous
              authenticator can be removed.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border p-5">
              <p className="text-sm font-medium">Step 1 · Scan the QR code</p>
              <div className="mt-4 flex min-h-56 items-center justify-center rounded-xl bg-white p-4">
                {qrCode && (
                  // Supabase supplies the QR code as a data URL.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCode}
                    alt="Authenticator enrollment QR code"
                    className="h-52 w-52 max-w-full object-contain"
                  />
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Scan this code only with your authenticator app. Do not
                share it.
              </p>
            </div>

            <div className="rounded-2xl border border-border p-5">
              <p className="text-sm font-medium">
                Step 2 · Or enter the setup key
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                If scanning is unavailable, enter this key manually in
                your authenticator app.
              </p>

              <div className="mt-4 break-all rounded-xl border border-border bg-muted/40 p-3 font-mono text-sm">
                {secret}
              </div>

              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(secret).then(
                    () => setMessage("Setup key copied."),
                    () => setError("Unable to copy. Select and copy the key manually."),
                  );
                }}
                className="mt-3 text-sm font-medium underline underline-offset-4"
              >
                Copy setup key
              </button>

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Treat this key like a password. Anyone with it could
                generate your authentication codes.
              </p>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verifyEnrollment();
            }}
            className="rounded-2xl border border-border p-5 sm:p-6"
          >
            <p className="text-sm font-medium">Step 3 · Verify ownership</p>
            <label
              htmlFor="authenticator-code"
              className="mt-4 block text-sm text-muted-foreground"
            >
              Enter the six-digit code from your authenticator
            </label>

            <input
              id="authenticator-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="mt-2 min-h-14 w-full rounded-xl border border-border bg-background px-4 text-center font-mono text-2xl tracking-[0.45em] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verifying…"
                : replacementMode
                  ? "Verify and replace authenticator"
                  : "Verify and enable MFA"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setFactorId("");
                setOldFactorIds([]);
                setQrCode("");
                setSecret("");
                setCode("");
                setError("");
                setMessage("");
              }}
              className="mt-3 w-full py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Cancel enrollment
            </button>
          </form>
        </>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm leading-6 text-red-600"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-border bg-muted/40 p-4 text-sm leading-6"
        >
          {message}
        </div>
      )}
    </div>
  );
}