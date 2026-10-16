
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EnrollAuthenticator() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkFactors() {
      const supabase = createClient();
      const { data, error } =
        await supabase.auth.mfa.listFactors();

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setEnabled(
          data.totp.some((factor) => factor.status === "verified")
        );
      }

      setChecking(false);
    }

    void checkFactors();

    return () => {
      cancelled = true;
    };
  }, []);

  async function startEnrollment() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) throw factorsError;

      const verifiedFactor = factors.totp.find(
        (factor) => factor.status === "verified"
      );

      if (verifiedFactor) {
        setEnabled(true);
        setMessage("An authenticator is already enabled.");
        return;
      }

      // Remove abandoned, unverified TOTP enrollments
      // before starting a fresh enrollment.
      for (const factor of factors.totp.filter(
        (item) => item.status !== "verified"
      )) {
        const { error: removeError } =
          await supabase.auth.mfa.unenroll({
            factorId: factor.id,
          });

        if (removeError) throw removeError;
      }

      const { data, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Portfolio Admin Authenticator",
        });

      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start authenticator enrollment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyEnrollment() {
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your authenticator.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code,
        });

      if (verifyError) throw verifyError;

      setEnabled(true);
      setFactorId("");
      setQrCode("");
      setSecret("");
      setCode("");
      setMessage("Authenticator enabled successfully.");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Code verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p>Checking authenticator status...</p>;
  }

  return (
    <section className="space-y-5 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">
        Authenticator app (TOTP)
      </h2>

      <p className="text-sm text-gray-500">
        Use Google Authenticator, Microsoft Authenticator,
        or another compatible TOTP app.
      </p>

      {enabled ? (
        <div className="space-y-3">
          <p className="font-medium text-green-600">
            Authenticator is enabled.
          </p>
          <p className="text-sm text-gray-500">
            Login enforcement is the next step. Enrollment
            alone does not require an OTP at every login.
          </p>
        </div>
      ) : !factorId ? (
        <button
          type="button"
          onClick={startEnrollment}
          disabled={loading}
          className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Preparing..." : "Set up authenticator"}
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">
            Scan this QR code with your authenticator app.
          </p>

          {qrCode && (
            <img
              src={
                qrCode.startsWith("data:")
                  ? qrCode
                  : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`
              }
              alt="Authenticator enrollment QR code"
              className="h-52 w-52 rounded-lg bg-white p-2"
            />
          )}

          <details>
            <summary className="cursor-pointer text-sm">
              Can't scan the QR code?
            </summary>
            <p className="mt-2 break-all font-mono text-sm">
              {secret}
            </p>
          </details>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void verifyEnrollment();
            }}
          >
            <label
              htmlFor="totp-code"
              className="block text-sm font-medium"
            >
              Six-digit verification code
            </label>

            <input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="123456"
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify and enable"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm text-green-600">
          {message}
        </p>
      )}
    </section>
  );
}
