"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, X, Filter, Code, FolderTree, ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/types/wiki";
import ProjectCard from "./ProjectCard";

interface SearchBarProps {
  projects: Project[];
  categories?: string[];
  languages?: string[];
  initialCategory?: string;
}

const ITEMS_PER_PAGE = 24;

export default function SearchBar({
  projects,
  categories = [],
  languages = [],
  initialCategory = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reseta para a página 1 ao alterar os filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedLanguage, selectedStatus]);

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

      // Filtro de status
      if (selectedStatus && project.status !== selectedStatus) {
        return false;
      }

      // Filtro de busca textual multi-termo
      if (!q) return true;

      const tokens = q.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return true;

      // Coleta todas as strings indexáveis do projeto
      const searchableTexts: string[] = [
        project.name,
        project.name_pt || "",
        project.description || "",
        project.description_pt || "",
        project.category,
        project.source.name,
        ...(project.languages || []),
        ...(project.tags || []),
        ...(project.metadata?.topics || []),
      ];

      if (project.tech_stack) {
        Object.values(project.tech_stack).forEach((list) => {
          if (Array.isArray(list)) searchableTexts.push(...list);
        });
      }

      const combinedLower = searchableTexts.join(" ").toLowerCase();

      // Todos os tokens precisam dar match em algum atributo do projeto (ex: "python docker")
      return tokens.every((token) => combinedLower.includes(token));
    });
  }, [projects, query, selectedCategory, selectedLanguage, selectedStatus]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const hasActiveFilters = Boolean(query || selectedCategory || selectedLanguage || selectedStatus);

  const clearAll = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedLanguage("");
    setSelectedStatus("");
    setCurrentPage(1);
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
            className="w-full rounded-lg border border-border bg-[#080d1a] pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors font-sans"
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
                className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs max-w-[200px] truncate"
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

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 bg-[#080d1a] border border-border rounded-lg px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-sky-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="" className="bg-[#0b1120]">Todos os Status</option>
              <option value="active" className="bg-[#0b1120]">Ativo</option>
              <option value="study" className="bg-[#0b1120]">Estudo / Tutorial</option>
              <option value="development" className="bg-[#0b1120]">Em Desenvolvimento</option>
              <option value="archived" className="bg-[#0b1120]">Arquivado</option>
              <option value="experimental" className="bg-[#0b1120]">Experimental</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 px-2 py-1 rounded hover:bg-sky-500/10 transition-colors font-mono"
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-mono">
              <span className="text-slate-400">
                Página <strong className="text-sky-400">{currentPage}</strong> de <strong>{totalPages}</strong> ({filteredProjects.length} resultados)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-[#0b1120] text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-[#0b1120] text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Próxima</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
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
