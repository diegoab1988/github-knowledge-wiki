import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderTree, ArrowLeft, Code } from "lucide-react";
import { getCategories, getCategoryBySlug, getProjectsByCategory } from "@/lib/wiki";
import SearchBar from "@/components/SearchBar";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const categories = getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const projects = getProjectsByCategory(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Breadcrumb e Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para todas as categorias</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <FolderTree className="h-3.5 w-3.5" />
              <span>Categoria</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {category.name}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Guias e implementações passo a passo para construir seu próprio {category.name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-border text-slate-300">
              <strong>{projects.length}</strong> {projects.length === 1 ? "projeto" : "projetos"}
            </span>
          </div>
        </div>
      </div>

      {/* Linguagens presentes na categoria */}
      {category.languages.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono">Linguagens nesta categoria:</span>
          {category.languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
            >
              <Code className="h-2.5 w-2.5 text-sky-400" />
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Busca e Lista de Projetos dentro da Categoria */}
      <SearchBar
        projects={projects}
        languages={category.languages}
        initialCategory={category.slug}
      />
    </div>
  );
}
