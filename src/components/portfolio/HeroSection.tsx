import { ArrowRight, FileText, Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon, LinkedinIcon } from "./shared";
import { X, Minus, Square } from "lucide-react";

function HighlightedHeadline({ text }: { text: string }) {
  const phrase = "thoughtful software";
  const i = text.indexOf(phrase);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="relative whitespace-nowrap text-primary">
        {phrase}
        <svg
          className="absolute -bottom-2 left-0 w-full text-coral/60"
          viewBox="0 0 200 8"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M2 6 Q 100 0 198 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {text.slice(i + phrase.length)}
    </>
  );
}


function CodePanel() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Decorative shapes */}
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-secondary"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-5 -left-5 h-16 w-16 rounded-full border-2 border-dashed border-primary/40"
        aria-hidden="true"
      />

      {/* Terminal window */}
      <div className="relative overflow-hidden rounded-2xl bg-ink shadow-lift">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-ink-foreground/10 px-5 py-4">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57]">
            <X className="cursor-pointer h-2 w-2 text-black/70 opacity-0 transition-opacity hover:opacity-100" />
          </span>
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FEBC2E]">
            <Minus className="cursor-pointer h-2 w-2 text-black/70 opacity-0 transition-opacity hover:opacity-100" />
          </span>
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#28C840]">
            <Square className="cursor-pointer h-1.5 w-1.5 fill-current text-black/70 opacity-0 transition-opacity hover:opacity-100" />
          </span>

          <span className="ml-3 font-mono text-xs text-ink-foreground/50">
            ~/shubham/now.ts
          </span>
          <span className="ml-auto rounded-md border border-ink-foreground/10 px-2 py-1 font-mono text-[10px] text-ink-foreground/40">
            TypeScript
          </span>
        </div>

        {/* Code */}
        <pre className="overflow-x-auto px-6 py-6 font-mono text-sm leading-7 text-ink-foreground/85">
          <code>
            <span className="text-ink-foreground/40">{"// A little about how I build"}</span>
            {"\n"}
            <span className="text-coral">const</span>{" "}
            <span className="text-ink-foreground">engineer</span> = {"{"}
            {"\n"}
            {"  "}focus: [
            <span className="text-primary">"web"</span>,{" "}
            <span className="text-primary">"mobile"</span>,{" "}
            <span className="text-primary">"AI"</span>],
            {"\n"}
            {"  "}stack: [
            <span className="text-primary">"TypeScript"</span>,{" "}
            <span className="text-primary">"Node.js"</span>,{" "}
            <span className="text-primary">"Python"</span>],
            {"\n"}
            {"  "}principles: [
            <span className="text-primary">"clarity"</span>,{" "}
            <span className="text-primary">"reliability"</span>],
            {"\n"}
            {"  "}mindset: <span className="text-primary">"build · learn · repeat"</span>,
            {"\n"}
            {"};"}
            {"\n\n"}
            <span className="text-ink-foreground/40">
              {"// From first commit to production"}
            </span>
            {"\n"}
            <span className="text-coral">await</span>{" "}
            <span className="text-ink-foreground">engineer</span>.
            <span className="text-primary">ship</span>();
            <span className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-primary" />
          </code>
        </pre>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-foreground/10 px-5 py-3 font-mono text-[11px] text-ink-foreground/50">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary marker-pulse" />
            main · up to date
          </span>
          <span className="text-primary/80">✓ all checks passed</span>
        </div>
      </div>
    </div>
  );
}


export function HeroSection() {
  const links = [
    {
      label: "GitHub",
      href: profile.github_url,
      icon: <GithubIcon className="h-4 w-4" />,
    },
    {
      label: "LinkedIn",
      href: profile.linkedinUrl,
      icon: <LinkedinIcon className="h-4 w-4" />,
    },
    {
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: <Mail className="h-4 w-4" />,
    },
    ...(profile.resumeUrl
      ? [
          {
            label: "View Résumé",
            href: profile.resumeUrl,
            icon: <FileText className="h-4 w-4" />,
          },
        ]
      : []),
  ];
  return (
    <section
      id="home"
      className="container-page grid items-center gap-16 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:py-32"
    >
      <div>
        {profile.availabilityLabel && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.availabilityLabel}
          </p>
        )}
        <p className="eyebrow mb-5">{profile.role}</p>
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[4.25rem]">
          <HighlightedHeadline text={profile.headline} />
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {profile.introduction}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover"
          >
            Explore My Work{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center rounded-full border bg-card px-6 py-3 font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Let's Connect
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.icon}
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <CodePanel />
    </section>
  );
}
