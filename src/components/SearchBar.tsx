"use client";

import { useMemo, useState } from "react";
import { Search, X, Filter, Code, FolderTree } from "lucide-react";
import { Project } from "@/types/wiki";
import ProjectCard from "./ProjectCard";

interface SearchBarProps {
  projects: Project[];
  categories?: string[];
  languages?: string[];
  initialCategory?: string;
}

export default function SearchBar({
  projects,
  categories = [],
  languages = [],
  initialCategory = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const filteredProjects = useMemo(() => {
    const q = query.toLowerCase().trim();

    return projects.filter((project) => {
      // Filtro de categoria
      if (selectedCategory && project.category_slug !== selectedCategory && project.category !== selectedCategory) {
        return false;
      }

      // Filtro de linguagem
      if (selectedLanguage && !project.languages?.includes(selectedLanguage)) {
        return false;
      }

      // Filtro de busca textual
      if (!q) return true;

      const inName = project.name.toLowerCase().includes(q);
      const inDesc = project.description?.toLowerCase().includes(q) ?? false;
      const inCat = project.category.toLowerCase().includes(q);
      const inSource = project.source.name.toLowerCase().includes(q);
      const inLang = project.languages?.some((l) => l.toLowerCase().includes(q)) ?? false;

      return inName || inDesc || inCat || inSource || inLang;
    });
  }, [projects, query, selectedCategory, selectedLanguage]);

  const hasActiveFilters = Boolean(query || selectedCategory || selectedLanguage);

  const clearAll = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedLanguage("");
  };

  return (
    <div className="w-full space-y-6">
      {/* Barra de controle e busca */}
      <div className="rounded-xl border border-border bg-[#0b1120] p-4 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tecnologia, nome do projeto, categoria ou linguagem..."
            className="w-full rounded-lg border border-border bg-[#080d1a] pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#080d1a] border border-border rounded-lg px-2.5 py-1.5">
              <FolderTree className="h-3.5 w-3.5 text-sky-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value="" className="bg-[#0b1120]">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0b1120]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {languages.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#080d1a] border border-border rounded-lg px-2.5 py-1.5">
              <Code className="h-3.5 w-3.5 text-sky-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value="" className="bg-[#0b1120]">Todas as Linguagens</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#0b1120]">
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 px-2 py-1 rounded hover:bg-sky-500/10 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Limpar filtros</span>
            </button>
          )}

          <div className="ml-auto font-mono text-[11px] text-slate-400">
            Exibindo <span className="text-sky-400 font-semibold">{filteredProjects.length}</span> de{" "}
            <span>{projects.length}</span> projetos
          </div>
        </div>
      </div>

      {/* Resultados da busca */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-[#0b1120]/50">
          <p className="text-base font-medium text-slate-300 mb-1">
            Nenhum projeto encontrado
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Tente refinar seus termos de busca ou remover os filtros aplicados.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
