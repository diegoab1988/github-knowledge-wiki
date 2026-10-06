import Link from "next/link";
import { FolderTree, ArrowRight, Code } from "lucide-react";
import { Category } from "@/types/wiki";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-border bg-[#0f172a]/70 p-5 hover:border-sky-500/50 hover:bg-[#111c35]/80 transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
            <FolderTree className="h-4 w-4" />
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-semibold">
            {category.count} {category.count === 1 ? "projeto" : "projetos"}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors mb-2">
          {category.name}
        </h3>

        {category.languages && category.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {category.languages.slice(0, 4).map((lang) => (
              <span
                key={lang}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-800"
              >
                {lang}
              </span>
            ))}
            {category.languages.length > 4 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500">
                +{category.languages.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 group-hover:text-sky-400 transition-colors">
        <span className="font-mono text-[11px]">Explorar categoria</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
