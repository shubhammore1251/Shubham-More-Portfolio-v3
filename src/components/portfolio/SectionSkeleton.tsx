interface SectionSkeletonProps {
  type: "projects" | "blogs";
}

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
    />
  );
}

function ProjectSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <SkeletonBlock className="aspect-[16/9] w-full rounded-none" />

      <div className="space-y-4 p-5">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-6 w-16 rounded-full"
            />
          ))}
        </div>

        <div className="flex gap-4 pt-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
      </div>
    </article>
  );
}

function BlogSkeleton() {
  return (
    <article className="space-y-5">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-2xl" />

      <SkeletonBlock className="h-3 w-36" />
      <SkeletonBlock className="h-5 w-11/12" />
      <SkeletonBlock className="h-5 w-3/4" />

      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>

      <div className="flex gap-2">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-20" />
      </div>

      <SkeletonBlock className="h-4 w-28" />
    </article>
  );
}

export function SectionSkeleton({
  type,
}: SectionSkeletonProps) {
  const isProjects = type === "projects";

  return (
    <section
      className={`border-t ${
        isProjects ? "bg-secondary/50" : "bg-card"
      } py-20 md:py-28`}
      aria-label={
        isProjects ? "Loading projects" : "Loading articles"
      }
      aria-busy="true"
    >
      <div className="container-page">
        <div className="mb-10 space-y-4">
          <SkeletonBlock className="h-3 w-36" />
          <SkeletonBlock className="h-9 w-3/4 max-w-xl" />
          {isProjects && (
            <SkeletonBlock className="h-9 w-2/3 max-w-md" />
          )}
        </div>

        <div
          className={
            isProjects
              ? "grid gap-6 lg:grid-cols-2"
              : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          }
        >
          {Array.from({
            length: isProjects ? 3 : 3,
          }).map((_, index) => (
            <div key={index}>
              {isProjects ? <ProjectSkeleton /> : <BlogSkeleton />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}