import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin";
import ProjectForm from "../../ProjectForm";

type Props = {
  params: Promise<{ id: string }>;
};

function EditProjectFallback() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-page py-12 md:py-16">
        <p className="text-sm text-muted-foreground">
          Loading project editor...
        </p>
      </div>
    </main>
  );
}

async function EditProjectContent({ params }: Props) {
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

  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <div className="container-page py-12 md:py-16">
        <ProjectForm projectId={id} />
      </div>
    </main>
  );
}

export default function EditProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<EditProjectFallback />}>
      <EditProjectContent params={params} />
    </Suspense>
  );
}