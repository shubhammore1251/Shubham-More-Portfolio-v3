
import { createClient } from "@/lib/supabase/server";

export async function getAdminSession() {
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

  // Step 1: Verify administrator membership.
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

  // Step 2: Require completed MFA verification (AAL2).
  const {
    data: assurance,
    error: assuranceError,
  } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (
    assuranceError ||
    assurance?.currentLevel !== "aal2"
  ) {
    return {
      authorized: false as const,
      reason: "mfa_required" as const,
    };
  }

  // Step 3: Authorize the verified administrator.
  return {
    authorized: true as const,
    supabase,
    user,
  };
}
