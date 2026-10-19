import { connection } from "next/server";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { getFeaturedProjects } from "@/lib/projects";
import type { PortfolioProject } from "@/data/types";
import { GithubIcon, ImageFallback, SectionHeader, TechTag } from "./shared";
import { getProjectTiles, type ProjectTile } from "./project-grid-layout";

type ProjectCardProps = {
  project: PortfolioProject;
  variant: ProjectTile;
  index: number;
  total: number;
};

/**
 * Use explicit placement for the 3-project composition so CSS Grid never
 * creates implicit columns for the third card. Larger collections flow into
 * balanced pairs/triples using their assigned spans.
 */
function getPlacementClass(
  index: number,
  total: number,
  variant: ProjectTile,
): string {
  if (total === 1) return "md:col-span-2 lg:col-span-12";

  if (total === 3) {
    // One wide, horizontal feature followed by two balanced cards side by side.
    // Avoid row-span: the feature must never stretch to the combined height of
    // two separate cards.
    if (index === 0) return "md:col-span-2 lg:col-span-12";
    return "md:col-span-1 lg:col-span-6";
  }

  if (index === 0) return "md:col-span-2 lg:col-span-7";
  if (index === 1) return "md:col-span-1 lg:col-span-5";
  if (variant === "half") return "md:col-span-1 lg:col-span-6";
  return "md:col-span-1 lg:col-span-4";
}

function ProjectCard({ project, variant, index, total }: ProjectCardProps) {
  const featured = index === 0 || project.is_featured;
  const prominent = variant === "feature" || variant === "feature-wide";
  const compact = variant === "compact" || variant === "compact-horizontal";
  const panorama = variant === "feature-wide";
  const horizontalFeatured = total === 3 && index === 0;

  const visibleHighlights = project.highlights.slice(
    0,
    prominent ? 2 : variant === "half" ? 1 : 0,
  );
  const visibleTechnologies = project.technologies.slice(
    0,
    prominent ? 5 : compact ? 3 : 4,
  );
  const hiddenTechnologyCount = Math.max(
    0,
    project.technologies.length - visibleTechnologies.length,
  );

  const mediaRatio = panorama
    ? "aspect-[16/9]"
    : variant === "compact-horizontal"
      ? "aspect-[2/1]"
      : "aspect-[16/10]";

  const imageSizes =
    total === 1
      ? "(min-width: 1152px) 100vw, 100vw"
      : prominent
        ? "(min-width: 1152px) 58vw, (min-width: 768px) 100vw, 100vw"
        : "(min-width: 1152px) 38vw, (min-width: 768px) 50vw, 100vw";

  return (
    <article
      data-project-tile={variant}
      className={`group relative flex h-full min-w-0 flex-col overflow-visible rounded-2xl border bg-card transition-[transform,border-color,box-shadow] duration-300 hover:z-20 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lift focus-within:z-20 focus-within:border-primary/60 ${getPlacementClass(index, total, variant)} ${horizontalFeatured ? "lg:h-auto lg:flex-row" : ""} ${project.is_featured ? "border-primary/60 shadow-soft" : "border-border/80"}`}
    >
      <div
        className={`relative w-full shrink-0 overflow-hidden rounded-t-2xl border-b border-border/70 bg-secondary ${mediaRatio} ${prominent ? "p-2 sm:p-3" : "p-2"} ${horizontalFeatured ? "lg:aspect-auto lg:min-h-[22rem] lg:w-[48%] lg:rounded-l-2xl lg:rounded-tr-none lg:border-b-0 lg:border-r" : ""}`}
      >
        {project.image_path ? (
          <Image
            src={project.image_path}
            alt={project.image_alt}
            fill
            sizes={imageSizes}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="object-contain object-center p-1 transition-transform duration-500 group-hover:scale-[1.015]"
          />
        ) : (
          <ImageFallback label={project.title} />
        )}

        {featured && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 font-mono text-[11px] font-medium text-primary-foreground shadow-sm">
            Featured
          </span>
        )}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col p-4 sm:p-5 ${prominent ? "sm:p-6" : ""} ${horizontalFeatured ? "lg:w-[52%]" : ""}`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
          {project.category}
        </p>

        <h3
          className={`mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 font-semibold leading-snug tracking-tight ${prominent ? "text-xl sm:text-2xl" : "text-lg"}`}
        >
          <span className="min-w-0 break-words">{project.title}</span>
          <ArrowUpRight
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:h-[18px] sm:w-[18px]"
            aria-hidden="true"
          />
        </h3>

        <p
          className={`mt-2 text-sm font-medium leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {project.summary}
        </p>

        <p
          className={`mt-2 text-[13px] leading-relaxed text-muted-foreground ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {project.description}
        </p>

        {visibleHighlights.length > 0 && (
          <ul className="mt-3 space-y-1 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
            {visibleHighlights.map((highlight) => (
              <li key={highlight} className="flex min-w-0 gap-2">
                <span className="shrink-0 text-primary" aria-hidden="true">
                  →
                </span>
                <span className="min-w-0">{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {visibleTechnologies.map((tech) => (
            <TechTag key={tech.id} tech={tech} />
          ))}
          {hiddenTechnologyCount > 0 && (
            <li className="group/tech-overflow relative inline-flex">
              <button
                type="button"
                aria-label={`Show ${hiddenTechnologyCount} additional technologies`}
                aria-describedby={`project-tech-overflow-${project.id}`}
                title={`${hiddenTechnologyCount} additional technologies`}
                className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-primary transition-colors hover:border-primary/60 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                +{hiddenTechnologyCount} more
              </button>

              <div
                id={`project-tech-overflow-${project.id}`}
                role="tooltip"
                className="invisible pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-64 max-w-[80vw] translate-y-1 rounded-xl border border-border bg-card p-3 opacity-0 shadow-xl transition-all duration-150 group-hover/tech-overflow:visible group-hover/tech-overflow:translate-y-0 group-hover/tech-overflow:opacity-100 group-focus-within/tech-overflow:visible group-focus-within/tech-overflow:translate-y-0 group-focus-within/tech-overflow:opacity-100"
              >
                <p className="mb-2 text-[11px] font-semibold text-foreground">
                  Also built with
                </p>
                <ul
                  className="flex flex-wrap gap-1.5"
                  aria-label="Additional technologies"
                >
                  {project.technologies
                    .slice(visibleTechnologies.length)
                    .map((tech) => (
                      <TechTag key={tech.id} tech={tech} />
                    ))}
                </ul>
              </div>
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-xs font-semibold sm:text-sm">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover"
            >
              Live project <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="sr-only"> for {project.title}</span>
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"
            >
              <GithubIcon className="h-4 w-4" /> Source code
              <span className="sr-only"> for {project.title}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export async function ProjectsSection() {
  await connection();

  const projects = await getFeaturedProjects();
  if (projects.length === 0) return null;

  const tiles = getProjectTiles(projects.length);

  return (
    <section id="projects" className="border-t bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="WHAT I'VE BUILT"
          title="Exploring ideas through code, creativity, and engineering."
        >
          <a
            href="https://github.com/shubhammore1251?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View more projects
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </SectionHeader>

        <div
          className="reveal grid min-w-0 grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-5"
          data-project-grid
          data-project-count={projects.length}
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant={tiles[index] ?? "compact"}
              index={index}
              total={projects.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
