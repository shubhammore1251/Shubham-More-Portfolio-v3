import type { StaticImageData } from "next/image";

export interface PortfolioProfile {
  fullName: string;
  role: string;
  headline: string;
  introduction: string;
  location: string | null;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string | null;
  avatarUrl: string | StaticImageData| null;
  availabilityLabel: string | null;
}

export interface TechnologyItem {
  id: string;
  name: string;
  category: string;
  iconifyIcon: string | null;
  featured: boolean;
  sortOrder: number;
  iconColor?: string;
}

export interface SkillCategoryData {
  id: string;
  title: string;
  description: string;
  technologies: TechnologyItem[];
  sortOrder: number;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  imageUrl: string | StaticImageData | null;
  imageAlt: string;
  technologies: TechnologyItem[];
  liveUrl: string | null;
  repositoryUrl: string | null;
  highlights: string[];
  featured: boolean;
  sortOrder: number;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  employmentType: string | null;
  startDate: string; // YYYY-MM
  endDate: string | null; // YYYY-MM or null when current
  isCurrent: boolean;
  summary: string;
  achievements: string[];
  technologies: TechnologyItem[];
  sortOrder: number;
}

export interface PortfolioBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | StaticImageData | null;
  publishedAt: string; // ISO date
  readingTimeMinutes: number | null;
  tags: string[];
  url: string;
  source: "hashnode";
  sortOrder: number;
}
