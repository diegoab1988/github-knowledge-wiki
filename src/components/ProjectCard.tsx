import Link from "next/link";
import { ExternalLink, ArrowRight, Code, Video, Star, Layers } from "lucide-react";
import { Project, ProjectStatus } from "@/types/wiki";

interface ProjectCardProps {
  project: Project;
  showCategory?: boolean;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; badgeClass: string }> = {
  active: { label: "Ativo", badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  development: { label: "Em Dev", badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  study: { label: "Estudo", badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  experimental: { label: "Experimental", badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  archived: { label: "Arquivado", badgeClass: "bg-slate-700/30 text-slate-400 border-slate-700/50" },
};

export default function ProjectCard({ project, showCategory = true }: ProjectCardProps) {
  const isVideo = project.tags?.includes("video");
  const displayName = project.name_pt || project.name;
  const displayDesc = project.description_pt || project.description;
  const hasDistinctPt = Boolean(project.name_pt && project.name_pt !== project.name);

  // Status visual
  const statusInfo = project.status ? STATUS_CONFIG[project.status] : null;

  // Tecnologias adicionais além das linguagens já renderizadas
  const existingLangsLower = new Set((project.languages || []).map((l) => l.toLowerCase()));
  const extraTechs: string[] = [];
  if (project.tech_stack) {
    Object.values(project.tech_stack).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((t) => {
          if (!existingLangsLower.has(t.toLowerCase()) && !extraTechs.includes(t)) {
            extraTechs.push(t);
          }
        });
      }
    });
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-[#0f172a]/70 p-5 hover:border-sky-500/50 hover:bg-[#111c35]/80 transition-all duration-200">
      <div>
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {showCategory && (
            <Link
              href={`/categories/${project.category_slug}`}
              className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
            >
              {project.category}
            </Link>
          )}

          {statusInfo && (
            <span
              className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </span>
          )}

          {project.languages && project.languages.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                >
                  <Code className="h-2.5 w-2.5 text-sky-400" />
                  {lang}
                </span>
              ))}
            </div>
          )}

          {extraTechs.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#131d36] text-sky-300 border border-sky-900/40"
            >
              <Layers className="h-2 w-2 text-sky-400" />
              {tech}
            </span>
          ))}

          {isVideo && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Video className="h-2.5 w-2.5" />
              Vídeo
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 mb-1">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {displayName}
          </Link>
        </h3>

        {hasDistinctPt && (
          <p className="text-[11px] font-mono text-slate-400 line-clamp-1 mb-2">
            Original: {project.name}
          </p>
        )}

        {displayDesc && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
          {project.source.name}
        </span>

        <div className="flex items-center gap-3">
          <a
            href={project.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors font-mono"
            title="Acessar conteúdo original"
          >
            <span>Original</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <span>Detalhes</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
