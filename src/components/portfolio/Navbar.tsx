"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems, profile } from "@/data/portfolio";

export function Wordmark() {
  const [first, ...rest] = profile.fullName.split(" ");
  return (
    <a href="/" className="text-lg font-extrabold tracking-tight">
      {first.toLowerCase()}
      {rest.length > 0 && (
        <span className="text-muted-foreground">
          {rest.join("").toLowerCase()}
        </span>
      )}
      <span className="text-primary">.</span>
    </a>
  );
}

export function Navbar() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = navItems
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <nav
        className="container-page flex h-16 items-center justify-between"
        aria-label="Main"
      >
        <Wordmark />
        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "true" : undefined}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${active === n.id ? "text-foreground" : "text-muted-foreground"}`}
              >
                {n.label}
                <span
                  className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary transition-transform duration-300 ${active === n.id ? "scale-x-100" : "scale-x-0"}`}
                />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:inline-flex"
          >
            Let's Connect
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <div
        className={`overflow-hidden border-t bg-background transition-[max-height,opacity] duration-300 lg:hidden ${open ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
      >
        <ul className="container-page flex flex-col py-4">
          {navItems.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b py-3.5 text-lg font-semibold"
              >
                {n.label}
                {active === n.id && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </a>
            </li>
          ))}
          <li className="pt-5">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex justify-center rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground"
            >
              Let's Connect
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
