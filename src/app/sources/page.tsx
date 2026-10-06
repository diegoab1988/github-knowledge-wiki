import Link from "next/link";
import { GitBranch, ExternalLink, CheckCircle2, XCircle, Terminal, Layers, ArrowLeft } from "lucide-react";
import { getSources, getStats } from "@/lib/wiki";

export default function SourcesPage() {
  const sources = getSources();
  const stats = getStats();

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
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-sky-400" />
          Fontes Conectadas
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Todos os repositórios públicos que alimentam esta wiki. O catálogo é definido em{" "}
          <code className="text-sky-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono text-xs">
            data/sources.json
          </code>.
        </p>
      </div>

      {/* Lista de Fontes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((source) => {
          const summary = stats.sources_summary.find((s) => s.id === source.id);
          const projectCount = summary?.projects_count || 0;

          return (
            <div
              key={source.id}
              className="rounded-xl border border-border bg-[#0f172a]/70 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {source.enabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        Habilitada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        <XCircle className="h-3 w-3" />
                        Desabilitada
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    branch: {source.branch || "master"}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {source.name}
                </h2>

                <div className="text-xs font-mono text-slate-400 mb-3">
                  <span className="text-slate-500">Autor: </span>
                  <span className="text-slate-300 font-semibold">{source.owner}</span>
                </div>

                <div className="bg-[#090d16] border border-border rounded-lg p-2.5 mb-4 font-mono text-xs text-sky-400 flex items-center justify-between">
                  <span>{source.owner}/{source.repository}</span>
                  <a
                    href={`https://github.com/${source.owner}/${source.repository}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Abrir</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {source.description && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {source.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-sky-400" />
                  <strong>{projectCount}</strong> projetos catalogados
                </span>

                <Link
                  href={`/projects?source=${source.id}`}
                  className="text-xs font-mono text-sky-400 hover:text-sky-300 underline"
                >
                  Filtrar projetos
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instruções para Adicionar Novas Fontes */}
      <div className="rounded-xl border border-slate-800 bg-[#090d16] p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Terminal className="h-4 w-4 text-sky-400" />
          Como adicionar uma nova fonte sem alterar o frontend?
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Para adicionar um novo repositório como fonte da wiki, basta incluir uma nova entrada no arquivo{" "}
          <code className="text-sky-400 font-mono">data/sources.json</code> e executar o comando de sincronização:
        </p>
        <pre className="rounded-lg bg-slate-950 p-3 text-xs font-mono text-sky-300 border border-slate-900 overflow-x-auto">
{`python -m scripts.wiki.sync`}
        </pre>
        <p className="text-xs text-slate-500">
          O motor de ingestão lerá o novo repositório, normalizará os dados e atualizará os arquivos estáticos consumidos pela aplicação.
        </p>
      </div>
    </div>
  );
}
