import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderTree } from "lucide-react";
import { getProjectById, getProjects, getProjectsByCategory } from "@/lib/wiki";
import ProjectCard from "@/components/ProjectCard";
import ProjectDetailViewer from "@/components/ProjectDetailViewer";

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

        {/* Visualizador com Alternância Original vs PT-BR */}
        <ProjectDetailViewer project={project} />
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
