export interface Source {
  id: string;
  name: string;
  owner: string;
  repository: string;
  branch: string;
  enabled: boolean;
  description?: string;
  projects_count?: number;
}

export interface Reference {
  title: string;
  url: string;
}

export type ProjectStatus = "active" | "development" | "study" | "experimental" | "archived";

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  data?: string[];
  infrastructure?: string[];
  other?: string[];
}

export interface ProjectMetadata {
  owner?: string;
  repo?: string;
  default_branch?: string;
  primary_language?: string;
  languages?: string[];
  topics?: string[];
  license?: string;
  stars?: number;
  forks?: number;
  open_issues?: number;
  size_kb?: number;
  last_updated?: string;
  created_at?: string;
  status?: ProjectStatus;
  has_readme?: boolean;
}

export interface Project {
  id: string;
  name: string;
  name_pt?: string;

  category: string;
  category_slug: string;

  description?: string;
  description_pt?: string;

  source: {
    id: string;
    name: string;
    repository: string;
  };

  original_url: string;
  github_url?: string;

  languages?: string[];
  tags?: string[];

  // Metadados enriquecidos
  metadata?: ProjectMetadata;
  tech_stack?: TechStack;
  status?: ProjectStatus;

  markdown_content?: string;
  markdown_content_pt?: string;

  references?: Reference[];
}

export interface Category {
  name: string;
  slug: string;
  count: number;
  languages: string[];
  sources: string[];
}

export interface WikiStats {
  total_sources: number;
  total_projects: number;
  total_categories: number;
  total_languages: number;
  total_technologies?: number;
  top_languages: { name: string; count: number }[];
  top_technologies?: { name: string; count: number }[];
  status_counts?: Record<string, number>;
  sources_summary: Source[];
  last_sync: string;
}
