import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects } from "@/lib/projects";
import type { PortfolioProject } from "@/data/types";
import { GithubIcon, ImageFallback, SectionHeader, TechTag } from "./shared";
import Image from "next/image";


export function ProjectCard({ project }: { project: PortfolioProject }) {
  const f = project.is_featured;
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lift focus-within:border-primary/60 ${f ? "lg:col-span-2 lg:grid lg:grid-cols-[1.35fr_1fr]" : ""}`}
    >
      <div
        className={`relative overflow-hidden border-b bg-secondary ${f ? "aspect-[16/10] lg:aspect-auto lg:border-b-0 lg:border-r" : "aspect-[16/10]"}`}
      >
        {project.image_path ? (
          <Image
            src={project.image_path}
            alt={project.image_alt}
            width={1280}
            height={800}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            fetchPriority="high"
          />
        ) : (
          <ImageFallback label={project.title} />
        )}
        {f && (
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 font-mono text-[11px] font-medium text-primary-foreground">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {project.category}
        </p>
        <h3 className="mt-2 flex items-start justify-between gap-3 text-xl font-bold md:text-2xl">
          {project.title}
          <ArrowUpRight
            className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </h3>
        <p className="mt-2 font-medium">{project.summary}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        {project.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-primary">→</span>
                {h}
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.map((t) => (
            <TechTag key={t.id} tech={t} />
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-4 pt-6 text-sm font-semibold">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover"
            >
              Live project <ArrowUpRight className="h-4 w-4" />
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
  // const sorted = [...projects].sort(
  //   (a, b) =>
  //     Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder,
  // );
  await connection();
  const sorted = await getFeaturedProjects();
  return (
    <section id="projects" className="border-t bg-secondary/50 py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="PERSONAL PROJECTS"
          title="Ideas I've turned into working software."
        >
          <a
            href={"https://github.com/shubhammore1251?tab=repositories"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View more projects <ArrowUpRight className="h-4 w-4" />
          </a>
        </SectionHeader>
        <div className="reveal grid gap-6 lg:grid-cols-2">
          {sorted.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
