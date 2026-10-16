import { Navbar } from "@/components/portfolio/Navbar";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { AboutSection } from "@/components/portfolio/AboutSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { ExperienceSection } from "@/components/portfolio/ExperienceSection";
import { BlogSection } from "@/components/portfolio/BlogSection";
import { ContactSection, Footer } from "@/components/portfolio/ContactSection";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/portfolio/SectionSkeleton";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <Suspense fallback={<SectionSkeleton type="projects" />}>
          <ProjectsSection />
        </Suspense>

        <ExperienceSection />

        <Suspense fallback={<SectionSkeleton type="blogs" />}>
          <BlogSection />
        </Suspense>

        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
