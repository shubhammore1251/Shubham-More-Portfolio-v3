import type { ReactNode, SVGProps } from "react";
import { Code2 } from "lucide-react";
import { TechnologyItem } from "@/data/types";
import { Icon } from "@iconify/react";


export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}



export function TechLogo({
  tech,
  size = 18,
}: {
  tech: TechnologyItem;
  size?: number;
}) {
  if (tech.iconifyIcon) {
    return (
      <Icon
        icon={tech.iconifyIcon}
        width={size}
        height={size}
        aria-hidden="true"
        className="shrink-0"
        color={tech.iconColor}
      />
    );
  }

  return (
    <Code2
      aria-hidden="true"
      width={size}
      height={size}
      className="shrink-0 text-primary"
    />
  );
}


export function TechTag({ tech }: { tech: TechnologyItem }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
      <TechLogo tech={tech} size={12} />
      {tech.name}
    </li>
  );
}

export function ImageFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ink p-6">
      <div className="font-mono text-sm text-ink-foreground/80">
        <span className="text-primary">$</span>{" "}
        {label.toLowerCase().replace(/\s+/g, "-")}
        <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-primary" />
      </div>
    </div>
  );
}

export function formatMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
