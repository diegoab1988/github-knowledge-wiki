import Link from "next/link";
import { GitBranch, ShieldCheck, Terminal } from "lucide-react";

export default function Footer({ lastSync }: { lastSync?: string }) {
  const formattedSync = lastSync
    ? new Date(lastSync).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recente";

  return (
    <footer className="mt-auto border-t border-border bg-[#070a12] py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">GitHub Knowledge Wiki</span>
            <span>&bull;</span>
            <span className="text-xs font-mono">Sem banco de dados &bull; Custo zero &bull; 100% Git</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-sky-400" />
              Sincronizado: {formattedSync}
            </span>
            <Link
              href="/sources"
              className="flex items-center gap-1 hover:text-sky-400 transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Fontes Conectadas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
