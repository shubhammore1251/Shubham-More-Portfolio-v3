import { ArrowRight, ArrowUpRight } from "lucide-react";
import { blogPosts, hashnodeUrl } from "@/data/portfolio";
import type { PortfolioBlogPost } from "@/data/types";
import { SectionHeader } from "./shared";
import Image from "next/image";

export function BlogCard({ post }: { post: PortfolioBlogPost }) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col"
    >
      <div className="aspect-[1200/630] overflow-hidden rounded-xl border bg-secondary transition-colors group-hover:border-primary/60">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            width={1200}
            height={630}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-secondary p-5 transition-transform duration-500 group-hover:scale-105">
            <span className="text-4xl font-extrabold leading-none text-primary/25">
              {post.tags[0] ?? "Notes"}
            </span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <time dateTime={post.publishedAt}>{date}</time>
        {post.readingTimeMinutes && (
          <>
            <span>·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </>
        )}
      </div>
      <h3 className="mt-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {post.excerpt}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <li key={t} className="font-mono text-[11px] text-coral">
            #{t.toLowerCase().replace(/\s+/g, "")}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
        Read article{" "}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </span>
    </a>
  );
}

export async function BlogSection() {
  const sorted = [...blogPosts].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <section id="blog" className="border-t bg-card py-20 md:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="Notes from the build process"
          title="Things I've learned about building software."
        >
          <a
            href={hashnodeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View all articles <ArrowUpRight className="h-4 w-4" />
          </a>
        </SectionHeader>
        <div className="reveal grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
