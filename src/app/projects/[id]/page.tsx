import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  FolderTree,
  Code,
  Tag,
  FileText,
  Bookmark,
  Share2,
  Terminal,
} from "lucide-react";
import { getProjectById, getProjects, getProjectsByCategory } from "@/lib/wiki";
import ProjectCard from "@/components/ProjectCard";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const projects = getProjects();
  return projects.map((p) => ({ id: p.id }));
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const relatedProjects = getProjectsByCategory(project.category_slug)
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Navegação Superior */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para projetos</span>
          </Link>

          <Link
            href={`/categories/${project.category_slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 hover:underline"
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>{project.category}</span>
          </Link>
        </div>

        {/* Card Principal do Projeto */}
        <div className="rounded-2xl border border-border bg-[#0f172a] p-6 sm:p-8 space-y-6">
          {/* Badges de Topo */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/categories/${project.category_slug}`}
              className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
            >
              <FolderTree className="h-3 w-3" />
              {project.category}
            </Link>

            {project.languages?.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
              >
                <Code className="h-3 w-3 text-sky-400" />
                {lang}
              </span>
            ))}

            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Título e Descrição */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Botões de Ação Direta */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={project.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-sm"
            >
              <span>Acessar Tutorial Original</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#090d16] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <GitBranch className="h-4 w-4 text-sky-400" />
                <span>Repositório no GitHub</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            )}
          </div>

          {/* Fonte de Verdade e Proveniência */}
          <div className="rounded-xl border border-border bg-[#090d16] p-4 text-xs space-y-2">
            <div className="text-slate-400 font-mono flex items-center justify-between">
              <span>Fonte de Verdade:</span>
              <span className="text-sky-400 font-semibold">{project.source.name}</span>
            </div>
            <div className="text-slate-400 font-mono flex items-center justify-between">
              <span>Repositório de Origem:</span>
              <a
                href={`https://github.com/${project.source.repository}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-sky-300 flex items-center gap-1 underline"
              >
                {project.source.repository}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Conteúdo Disponível na Fonte */}
          {project.markdown_content && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <FileText className="h-3.5 w-3.5 text-sky-400" />
                Conteúdo Original na Fonte (Markdown)
              </div>
              <pre className="rounded-xl border border-border bg-[#070a12] p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {project.markdown_content}
              </pre>
            </div>
          )}

          {/* Referências e Links */}
          {project.references && project.references.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Bookmark className="h-3.5 w-3.5 text-sky-400" />
                Referências e Links
              </div>
              <ul className="divide-y divide-slate-800 rounded-xl border border-border bg-[#090d16] overflow-hidden">
                {project.references.map((ref, idx) => (
                  <li key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/50">
                    <span className="font-mono text-slate-300">{ref.title}</span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Projetos Relacionados */}
      {relatedProjects.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Mais guias em &quot;{project.category}&quot;
            </h2>
            <Link
              href={`/categories/${project.category_slug}`}
              className="text-xs font-mono text-sky-400 hover:underline"
            >
              Ver categoria completa
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} showCategory={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
