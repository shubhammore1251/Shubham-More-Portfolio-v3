import { experience } from "@/data/portfolio";
import type { PortfolioExperience } from "@/data/types";
import { SectionHeader, TechTag, formatMonth } from "./shared";

export function ExperienceTimeline({
  items,
}: {
  items: PortfolioExperience[];
}) {
  return (
    <ol className="relative">
      <span
        className="absolute bottom-2 left-[7px] top-2 w-px bg-border md:left-[calc(11rem+7px)]"
        aria-hidden="true"
      />
      {items.map((e) => (
        <li
          key={e.id}
          className="reveal relative grid gap-2 pb-14 pl-10 last:pb-0 md:grid-cols-[11rem_1fr] md:gap-10 md:pl-0"
        >
          <div className="font-mono text-xs text-muted-foreground md:pt-1.5 md:text-right md:pr-10">
            <p className={e.isCurrent ? "font-medium text-primary" : ""}>
              {formatMonth(e.startDate)} —{" "}
              {e.endDate ? formatMonth(e.endDate) : "Present"}
            </p>
            {e.employmentType && <p className="mt-1">{e.employmentType}</p>}
          </div>
          <span
            className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 md:left-[11rem] md:top-1.5 ${e.isCurrent ? "border-primary bg-primary marker-pulse" : "border-border bg-card"}`}
            aria-hidden="true"
          />
          <div className="md:pl-10">
            <h3 className="text-xl font-bold">{e.role}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {e.company}
              {e.location && <> · {e.location}</>}
            </p>
            <p className="mt-3 leading-relaxed">{e.summary}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {e.achievements.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="text-primary">—</span>
                  {a}
                </li>
              ))}
            </ul>
            <ul
              className="mt-4 flex flex-wrap gap-1.5"
              aria-label="Technologies"
            >
              {e.technologies.map((t) => (
                <TechTag key={t.id} tech={t} />
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ExperienceSection() {
  const sorted = [...experience].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section id="experience" className="container-page py-20 md:py-28">
      <SectionHeader
        eyebrow="Experience"
        title="Where I've built and grown."
        subtitle="A look at my professional journey, the products I've contributed to, and the experience I've gained along the way."
      />
      <ExperienceTimeline items={sorted} />
    </section>
  );
}
