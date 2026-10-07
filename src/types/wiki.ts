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
  top_languages: { name: string; count: number }[];
  sources_summary: Source[];
  last_sync: string;
}
