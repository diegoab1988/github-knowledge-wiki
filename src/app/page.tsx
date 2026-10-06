import Link from "next/link";
import {
  BookOpen,
  FolderTree,
  GitBranch,
  Layers,
  ArrowRight,
  ExternalLink,
  Code,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { getCategories, getProjects, getSources, getStats } from "@/lib/wiki";
import CategoryCard from "@/components/CategoryCard";
import ProjectCard from "@/components/ProjectCard";

export default function HomePage() {
  const stats = getStats();
  const categories = getCategories();
  const sources = getSources();
  const projects = getProjects();

  // Seleciona uma amostra diversificada de categorias e projetos recentes
  const featuredCategories = categories.slice(0, 6);
  const featuredProjects = projects.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-2xl border border-border bg-gradient-to-b from-[#0f172a] to-[#0b1120] p-6 sm:p-10 shadow-lg overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-mono text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Zero Database &bull; Git Source of Truth &bull; Custo Zero
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            GitHub Knowledge Wiki
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Acervo técnico pessoal com curadoria automática a partir de repositórios públicos
            do GitHub. Explore guias, implementações de sistemas do zero e referências de engenharia.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-sm"
            >
              <Layers className="h-4 w-4" />
              <span>Explorar Projetos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#090d16] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <FolderTree className="h-4 w-4 text-sky-400" />
              <span>Navegar por Categorias</span>
            </Link>

            <Link
              href="/sources"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#090d16] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <GitBranch className="h-4 w-4 text-sky-400" />
              <span>Ver Fontes</span>
            </Link>
          </div>
        </div>

        {/* Métricas e Estatísticas */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800 pt-6">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <GitBranch className="h-3.5 w-3.5 text-sky-400" />
              Fontes Ativas
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              {stats.total_sources}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              Projetos e Guias
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              {stats.total_projects}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <FolderTree className="h-3.5 w-3.5 text-sky-400" />
              Categorias
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              {stats.total_categories}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Code className="h-3.5 w-3.5 text-sky-400" />
              Linguagens
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-white">
              {stats.total_languages}
            </div>
          </div>
        </div>
      </section>

      {/* Top Linguagens / Tecnologias */}
      {stats.top_languages && stats.top_languages.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">
            Principais Linguagens &amp; Tecnologias
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.top_languages.slice(0, 12).map((lang) => (
              <Link
                key={lang.name}
                href={`/projects?search=${encodeURIComponent(lang.name)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/80 border border-border hover:border-sky-500/50 hover:bg-slate-800 transition-colors"
              >
                <Code className="h-3 w-3 text-sky-400" />
                <span className="text-slate-200">{lang.name}</span>
                <span className="text-slate-500 font-semibold">{lang.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorias em Destaque */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Categorias Técnicas
            </h2>
            <p className="text-xs text-slate-400">
              Navegue pelos projetos organizados por tipo de sistema ou disciplina.
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Ver todas ({categories.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* Fontes Disponíveis */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Fontes Conectadas
            </h2>
            <p className="text-xs text-slate-400">
              Repositórios públicos que alimentam o catálogo da wiki.
            </p>
          </div>
          <Link
            href="/sources"
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Gerenciar fontes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="rounded-xl border border-border bg-[#0f172a]/70 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    <CheckCircle2 className="h-3 w-3" />
                    Ativa
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    branch: {src.branch}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {src.name}
                </h3>
                <p className="text-xs font-mono text-sky-400 mb-3">
                  {src.owner}/{src.repository}
                </p>
                {src.description && (
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    {src.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">
                  {stats.sources_summary.find((s) => s.id === src.id)?.projects_count || stats.total_projects} projetos
                </span>

                <a
                  href={`https://github.com/${src.owner}/${src.repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-sky-400 font-mono transition-colors"
                >
                  <span>Ver no GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projetos em Destaque */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Amostra de Projetos
            </h2>
            <p className="text-xs text-slate-400">
              Alguns dos projetos mais populares indexados nesta versão.
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Ver todos ({projects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
