"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  PlusCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AddSourceForm({ onSourceAdded }: { onSourceAdded?: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = url.trim();
    if (!targetUrl) return;

    setIsLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro desconhecido ao processar repositório.");
      }

      setSuccessData(data);
      setUrl("");
      if (onSourceAdded) onSourceAdded();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao conectar repositório.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggested: string) => {
    setUrl(suggested);
  };

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-[#0c1427] p-6 sm:p-8 shadow-xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md mb-2">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Ingestão Dinâmica</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Conectar Novo Repositório GitHub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Cole a URL ou identificador de qualquer repositório público do GitHub. O motor de ingestão fará o download do conteúdo, interpretará os guias e organizará tudo na wiki automaticamente.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex: https://github.com/vinta/awesome-python ou owner/repository"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700 bg-[#080d1a] pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-60 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ingerindo Conteúdo...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Conectar e Ingerir</span>
              </>
            )}
          </button>
        </div>

        {/* Sugestões de repositórios conhecidos */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Sugestões:
          </span>
          {[
            { label: "Awesome Python", url: "https://github.com/vinta/awesome-python" },
            { label: "Awesome Go", url: "https://github.com/avelino/awesome-go" },
            { label: "Project Based Learning", url: "https://github.com/practical-tutorials/project-based-learning" },
          ].map((s) => (
            <button
              key={s.url}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestion(s.url)}
              className="font-mono text-[11px] text-slate-300 hover:text-sky-300 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-0.5 rounded transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>

      {/* Alerta de Erro */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-300">Falha ao processar repositório</p>
            <p className="font-mono text-[11px] text-red-200/90 whitespace-pre-wrap">{error}</p>
          </div>
        </div>
      )}

      {/* Alerta de Sucesso */}
      {successData && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-300">
                Repositório conectado e conhecimento ingerido com sucesso!
              </p>
              <p className="text-slate-300">
                A wiki foi atualizada e os novos projetos já estão disponíveis para busca e navegação.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/projects")}
            className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors shrink-0"
          >
            <span>Ver Projetos</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
