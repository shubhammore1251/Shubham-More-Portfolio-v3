
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin";

export async function requireAdminApi() {
  const session = await getAdminSession();

  if (!session.authorized) {
    const status =
      session.reason === "unauthenticated" ? 401 : 403;

    const message =
      session.reason === "unauthenticated"
        ? "Authentication required."
        : session.reason === "mfa_required"
          ? "MFA verification required."
          : "Administrator access required.";

    return {
      ok: false as const,
      response: NextResponse.json(
        { error: message },
        { status },
      ),
    };
  }

  return {
    ok: true as const,
    supabase: session.supabase,
    user: session.user,
  };
}
