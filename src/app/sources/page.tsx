import Link from "next/link";
import { GitBranch, ExternalLink, CheckCircle2, XCircle, Terminal, Layers, ArrowLeft, Plus } from "lucide-react";
import { getSources, getStats } from "@/lib/wiki";
import AddSourceForm from "@/components/AddSourceForm";

export default function SourcesPage() {
  const sources = getSources();
  const stats = getStats();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
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
          Adicione qualquer repositório público do GitHub como fonte de conhecimento. O sistema
          processa, extrai e indexa os guias e tutoriais diretamente para a sua wiki.
        </p>
      </div>

      {/* Formulário Interativo de Adição e Ingestão */}
      <AddSourceForm />

      {/* Lista de Fontes Ativas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Repositórios Conectados ({sources.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total de {stats.total_projects} projetos indexados
          </span>
        </div>

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

                  <h3 className="text-xl font-bold text-white mb-1">
                    {source.name}
                  </h3>

                  <div className="text-xs font-mono text-slate-400 mb-3">
                    <span className="text-slate-500">Autor / Organização: </span>
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
                    href={`/projects?search=${encodeURIComponent(source.name)}`}
                    className="text-xs font-mono text-sky-400 hover:text-sky-300 underline"
                  >
                    Ver projetos desta fonte
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal CLI Shortcut */}
      <div className="rounded-xl border border-slate-800 bg-[#090d16] p-5 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-300 font-semibold">
          <Terminal className="h-4 w-4 text-sky-400" />
          Alternativa via Terminal CLI
        </div>
        <p className="text-slate-400 leading-relaxed">
          Você também pode adicionar e sincronizar repositórios diretamente pelo terminal com o comando:
        </p>
        <pre className="rounded-lg bg-slate-950 p-2.5 font-mono text-sky-300 border border-slate-900 overflow-x-auto">
{`python -m scripts.wiki.add https://github.com/vinta/awesome-python`}
        </pre>
      </div>
    </div>
  );
}
