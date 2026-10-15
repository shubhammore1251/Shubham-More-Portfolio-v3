import { ArrowUp, FileText, Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon, LinkedinIcon } from "./shared";
import { Wordmark } from "./Navbar";
import { CopyrightYear } from "./CopyrightYear";

export function ContactSection() {
  return (
    <section id="contact" className="container-page py-20 md:py-28">
      <div className="reveal relative overflow-hidden rounded-3xl border bg-secondary px-6 py-14 text-center md:px-16 md:py-20">
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[28px] border-primary/10"
          aria-hidden="true"
        />
        <p className="eyebrow mb-5">Have an interesting problem to solve?</p>
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance md:text-5xl">
          Let's build something{" "}
          <span className="text-primary">meaningful.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
          I'm always happy to talk about engineering roles, collaborations, or a
          project you're excited about. My inbox is open.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Mail className="h-4 w-4" /> Email me
          </a>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-6 py-3 font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <FileText className="h-4 w-4" /> View résumé
            </a>
          )}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-card transition-colors hover:border-primary hover:text-primary"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-card transition-colors hover:border-primary hover:text-primary"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-1 text-sm text-muted-foreground">
            Full-stack engineer building thoughtful software.
          </p>
        </div>
        <div className="flex items-center gap-5 text-muted-foreground">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:text-primary"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-primary"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="hover:text-primary"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            © <CopyrightYear /> {profile.fullName}
          </span>
          <a
            href="#home"
            className="inline-flex items-center gap-1 font-medium hover:text-primary"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
