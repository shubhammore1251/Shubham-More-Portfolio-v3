import { skills } from "@/data/portfolio";
import type { SkillCategoryData } from "@/data/types";
import { SectionHeader, TechLogo } from "./shared";


export function SkillCategory({
  category,
  index,
}: {
  category: SkillCategoryData;
  index: number;
}) {
  const techs = [...category.technologies].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl border bg-card p-6 transition-colors duration-300 hover:border-primary/50">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 text-lg font-bold">
          {category.title}
        </h3>

        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {category.description}
      </p>

      <ul className="flex flex-wrap content-start gap-2">
        {techs.map((tech) => (
          <li
            key={tech.id}
            className={`group/tech inline-flex max-w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary ${
              tech.featured
                ? "border-primary/40 bg-background"
                : "border-border bg-background"
            }`}
            title={tech.name}
          >
            <span className="shrink-0 transition-transform duration-200 group-hover/tech:-translate-y-0.5">
              <TechLogo tech={tech} size={18} />
            </span>

            <span className="truncate">
              {tech.name}
            </span>

            {tech.featured && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                title="Core technology"
              />
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}


export function SkillsSection() {
  const sorted = [...skills].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <section
      id="skills"
      className="container-page py-20 md:py-28"
    >
      <SectionHeader
        eyebrow="Technical skills"
        title="The stack behind what I build."
        subtitle="From polished interfaces and backend systems to cloud infrastructure and AI-powered applications."
      >
        <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Currently exploring
        </p>
      </SectionHeader>

      <div className="reveal mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((category, index) => (
          <SkillCategory
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

