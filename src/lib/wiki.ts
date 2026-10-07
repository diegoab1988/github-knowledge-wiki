import fs from "fs";
import path from "path";
import { Category, Project, Source, WikiStats } from "@/types/wiki";

const DATA_DIR = path.join(process.cwd(), "data");

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Erro ao ler ${filename}:`, error);
    return fallback;
  }
}

export function getSources(): Source[] {
  const data = readJsonFile<{ sources: Source[] }>("sources.json", { sources: [] });
  return data.sources || [];
}

export function getProjects(): Project[] {
  return readJsonFile<Project[]>("projects.json", []);
}

export function getCategories(): Category[] {
  return readJsonFile<Category[]>("categories.json", []);
}

export function getStats(): WikiStats {
  return readJsonFile<WikiStats>("stats.json", {
    total_sources: 0,
    total_projects: 0,
    total_categories: 0,
    total_languages: 0,
    top_languages: [],
    sources_summary: [],
    last_sync: new Date().toISOString(),
  });
}

export function getProjectById(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const categories = getCategories();
  return categories.find((c) => c.slug === slug);
}

export function getProjectsByCategory(categorySlug: string): Project[] {
  const projects = getProjects();
  return projects.filter((p) => p.category_slug === categorySlug);
}

export function getProjectsBySource(sourceId: string): Project[] {
  const projects = getProjects();
  return projects.filter((p) => p.source.id === sourceId);
}

export function getRelatedProjects(target: Project, limit: number = 3): Project[] {
  const allProjects = getProjects();
  const otherProjects = allProjects.filter((p) => p.id !== target.id);

  const targetLangs = new Set(target.languages || []);
  const targetTags = new Set(target.tags || []);
  const targetTopics = new Set(target.metadata?.topics || []);

  const targetTechs = new Set<string>();
  if (target.tech_stack) {
    Object.values(target.tech_stack).forEach((list) => {
      if (Array.isArray(list)) list.forEach((t) => targetTechs.add(t.toLowerCase()));
    });
  }

  const scored = otherProjects.map((p) => {
    let score = 0;
    // Categoria compartilhada
    if (p.category_slug === target.category_slug) {
      score += 3;
    }
    // Linguagens compartilhadas
    if (p.languages) {
      p.languages.forEach((l) => {
        if (targetLangs.has(l)) score += 2;
      });
    }
    // Tecnologias compartilhadas na stack
    if (p.tech_stack) {
      Object.values(p.tech_stack).forEach((list) => {
        if (Array.isArray(list)) {
          list.forEach((t) => {
            if (targetTechs.has(t.toLowerCase())) score += 2;
          });
        }
      });
    }
    // Tags / Topics compartilhados
    if (p.tags) {
      p.tags.forEach((t) => {
        if (targetTags.has(t)) score += 1;
      });
    }
    if (p.metadata?.topics) {
      p.metadata.topics.forEach((t) => {
        if (targetTopics.has(t)) score += 1;
      });
    }

    return { project: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.project);
  if (relevant.length > 0) return relevant;

  // Fallback: mesma categoria se nenhum critério de score atingir
  return getProjectsByCategory(target.category_slug)
    .filter((p) => p.id !== target.id)
    .slice(0, limit);
}
