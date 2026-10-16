import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin";
import ProjectForm from "../ProjectForm";

function NewProjectFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page py-12 md:py-16">
        <p className="text-sm text-muted-foreground">
          Loading project form...
        </p>
      </div>
    </main>
  );
}

async function NewProjectContent() {
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
        <ProjectForm />
      </div>
    </main>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<NewProjectFallback />}>
      <NewProjectContent />
    </Suspense>
  );
}