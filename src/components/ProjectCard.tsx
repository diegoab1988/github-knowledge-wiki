import Link from "next/link";
import { ExternalLink, ArrowRight, Code, Video, BookOpen, Tag } from "lucide-react";
import { Project } from "@/types/wiki";

interface ProjectCardProps {
  project: Project;
  showCategory?: boolean;
}

export default function ProjectCard({ project, showCategory = true }: ProjectCardProps) {
  const isVideo = project.tags?.includes("video");

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-[#0f172a]/70 p-5 hover:border-sky-500/50 hover:bg-[#111c35]/80 transition-all duration-200">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {showCategory && (
            <Link
              href={`/categories/${project.category_slug}`}
              className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
            >
              {project.category}
            </Link>
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

          {isVideo && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Video className="h-2.5 w-2.5" />
              Vídeo
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 mb-2">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            {project.name}
          </Link>
        </h3>

        {project.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {project.description}
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
