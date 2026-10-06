import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">
        Página ou Projeto não encontrado
      </h2>
      <p className="text-sm text-slate-400">
        O recurso solicitado não existe no índice da wiki ou foi renomeado na fonte.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao início</span>
        </Link>
      </div>
    </div>
  );
}
