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
