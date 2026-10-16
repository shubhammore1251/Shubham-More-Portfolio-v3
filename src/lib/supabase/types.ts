export interface ProjectRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  github_url: string | null;
  live_url: string | null;
  technologies: string[];
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogRecord {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}