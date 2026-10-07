"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  GitBranch,
  FolderTree,
  Code,
  Tag,
  FileText,
  Bookmark,
  Languages,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Project } from "@/types/wiki";

export default function ProjectDetailViewer({ project }: { project: Project }) {
  // Se houver tradução para PT-BR, o padrão pode ser PT-BR, com controle explícito
  const hasPt = Boolean(project.name_pt || project.description_pt || project.markdown_content_pt);
  const [langMode, setLangMode] = useState<"pt" | "en">(hasPt ? "pt" : "en");

  const isPt = langMode === "pt";

  const title = isPt ? (project.name_pt || project.name) : project.name;
  const description = isPt ? (project.description_pt || project.description) : project.description;
  const markdownContent = isPt
    ? (project.markdown_content_pt || project.markdown_content)
    : project.markdown_content;

  return (
    <div className="rounded-2xl border border-border bg-[#0f172a] p-6 sm:p-8 space-y-6">
      {/* Barra de Seleção de Idioma (Original vs Localização PT-BR) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-sky-400" />
            Visualização:
          </span>
          <div className="inline-flex rounded-lg border border-border bg-[#090d16] p-0.5 text-xs font-mono">
            <button
              onClick={() => setLangMode("pt")}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                isPt
                  ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🇧🇷 Português</span>
              {hasPt && <span className="text-[10px] text-sky-400">&bull;</span>}
            </button>
            <button
              onClick={() => setLangMode("en")}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                !isPt
                  ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🇺🇸 Original (EN)</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          {isPt ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Localização PT-BR ativa (código e links preservados)
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Exibindo texto original da fonte
            </span>
          )}
        </div>
      </div>

      {/* Badges de Categorias, Linguagens e Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/categories/${project.category_slug}`}
          className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
        >
          <FolderTree className="h-3 w-3" />
          {project.category}
        </Link>

        {project.languages?.map((lang) => (
          <span
            key={lang}
            className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
          >
            <Code className="h-3 w-3 text-sky-400" />
            {lang}
          </span>
        ))}

        {project.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      {/* Título e Descrição */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {title}
        </h1>

        {isPt && project.name_pt && project.name_pt !== project.name && (
          <p className="mt-1 text-xs font-mono text-slate-400">
            Original: <span className="text-slate-300">{project.name}</span>
          </p>
        )}

        {description && (
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Botões de Ação Direta */}
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href={project.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-sm"
        >
          <span>Acessar Link Original</span>
          <ExternalLink className="h-4 w-4" />
        </a>

        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-[#090d16] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <GitBranch className="h-4 w-4 text-sky-400" />
            <span>Repositório no GitHub</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        )}
      </div>

      {/* Proveniência e Fonte de Verdade */}
      <div className="rounded-xl border border-border bg-[#090d16] p-4 text-xs space-y-2">
        <div className="text-slate-400 font-mono flex items-center justify-between">
          <span>Fonte de Verdade:</span>
          <span className="text-sky-400 font-semibold">{project.source.name}</span>
        </div>
        <div className="text-slate-400 font-mono flex items-center justify-between">
          <span>Repositório de Origem:</span>
          <a
            href={`https://github.com/${project.source.repository}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-sky-300 flex items-center gap-1 underline"
          >
            {project.source.repository}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Conteúdo Markdown */}
      {markdownContent && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              {isPt ? "Conteúdo Formatado (PT-BR)" : "Conteúdo Original na Fonte (Markdown)"}
            </span>
            <button
              onClick={() => setLangMode(isPt ? "en" : "pt")}
              className="text-[11px] lowercase text-sky-400 hover:underline"
            >
              {isPt ? "ver original em inglês" : "ver tradução em português"}
            </button>
          </div>
          <pre className="rounded-xl border border-border bg-[#070a12] p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {markdownContent}
          </pre>
        </div>
      )}

      {/* Referências e Links */}
      {project.references && project.references.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <Bookmark className="h-3.5 w-3.5 text-sky-400" />
            Referências e Links
          </div>
          <ul className="divide-y divide-slate-800 rounded-xl border border-border bg-[#090d16] overflow-hidden">
            {project.references.map((ref, idx) => (
              <li key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/50">
                <span className="font-mono text-slate-300">{ref.title}</span>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                >
                  <span>Abrir</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
