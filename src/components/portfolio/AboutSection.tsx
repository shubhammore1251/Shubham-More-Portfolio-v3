import { MapPin } from "lucide-react";
import { about, profile } from "@/data/portfolio";
import Image, { type StaticImageData } from "next/image";

export function ProfileAvatar({
  src,
  name,
}: {
  src: string | StaticImageData | null;
  name: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <div className="relative mx-auto h-60 w-60 md:h-72 md:w-72">
      <div
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-secondary"
        aria-hidden="true"
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-card shadow-lift ring-2 ring-primary/70">
        {src ? (
          <Image
            src={src}
            alt={`Portrait of ${name}`}
            width={288}
            height={288}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-5xl font-extrabold text-primary">
            {initials}
          </div>
        )}
      </div>
      <span
        className="absolute -right-1 top-8 h-4 w-4 rounded-full bg-coral"
        aria-hidden="true"
      />
    </div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="border-y bg-card py-20 md:py-28">
      <div className="container-page reveal grid items-center gap-14 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            About me
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {about.heading}
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {about.principles.map((p, i) => (
              <li key={p.title} className="border-t-2 border-primary/80 pt-4">
                <span className="font-mono text-xs text-primary">0{i + 1}</span>
                <h3 className="mt-1 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-first text-center md:order-none">
          <ProfileAvatar src={profile.avatarUrl} name={profile.fullName} />
          {profile.location && (
            <p className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Currently running on IST
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
