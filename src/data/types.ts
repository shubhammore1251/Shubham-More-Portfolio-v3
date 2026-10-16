import type { StaticImageData } from "next/image";

export interface PortfolioProfile {
  fullName: string;
  role: string;
  headline: string;
  introduction: string;
  location: string | null;
  email: string;
  github_url: string;
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
  image_path: string | StaticImageData | null;
  image_alt: string;
  technologies: TechnologyItem[];
  live_url: string | null;
  github_url: string | null;
  highlights: string[];
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
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
