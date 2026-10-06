import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { getCategories, getProjects, getStats } from "@/lib/wiki";
import SearchBar from "@/components/SearchBar";

export default function ProjectsPage() {
  const projects = getProjects();
  const categories = getCategories();
  const stats = getStats();

  const categoryNames = categories.map((c) => c.name);
  const languageNames = stats.top_languages.map((l) => l.name);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Layers className="h-7 w-7 text-sky-400" />
              Projetos &amp; Tutoriais
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Navegue e pesquise por todos os {projects.length} projetos catalogados. Use a busca e os filtros
              para encontrar tutoriais por linguagem, tecnologia ou categoria.
            </p>
          </div>
        </div>
      </div>

      {/* Busca e Lista com Filtros */}
      <SearchBar
        projects={projects}
        categories={categoryNames}
        languages={languageNames}
      />
    </div>
  );
}
