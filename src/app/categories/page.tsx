import Link from "next/link";
import { FolderTree, ArrowLeft, Layers } from "lucide-react";
import { getCategories, getProjects } from "@/lib/wiki";
import CategoryCard from "@/components/CategoryCard";

export default function CategoriesPage() {
  const categories = getCategories();
  const projects = getProjects();

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
              <FolderTree className="h-7 w-7 text-sky-400" />
              Categorias Técnicas
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Navegue pelos projetos classificados por tipo de tecnologia, subsistema ou objetivo.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-border">
              <strong>{categories.length}</strong> categorias
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-border">
              <strong>{projects.length}</strong> projetos
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    </div>
  );
}
