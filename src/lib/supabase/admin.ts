import { createClient } from "@/lib/supabase/server";

export async function getAdminIdentity() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      reason: "unauthenticated" as const,
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    return {
      authorized: false as const,
      reason: "forbidden" as const,
    };
  }

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    return {
      authorized: false as const,
      reason: "mfa_required" as const,
    };
  }

  const verifiedFactors = factors.totp.filter(
    (factor) => factor.status === "verified",
  );

  const {
    data: assurance,
    error: assuranceError,
  } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  return {
    authorized: true as const,
    supabase,
    user,
    hasVerifiedFactor: verifiedFactors.length > 0,
    currentLevel: assuranceError
      ? null
      : assurance?.currentLevel ?? null,
  };
}

export async function getAdminSession() {
  const identity = await getAdminIdentity();

  if (!identity.authorized) {
    return identity;
  }

  if (
    !identity.hasVerifiedFactor ||
    identity.currentLevel !== "aal2"
  ) {
    return {
      authorized: false as const,
      reason: "mfa_required" as const,
    };
  }

  return {
    authorized: true as const,
    supabase: identity.supabase,
    user: identity.user,
  };
}