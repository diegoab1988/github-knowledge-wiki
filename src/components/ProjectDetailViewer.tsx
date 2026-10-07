"use client";

import { useMemo, useState } from "react";
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
  Layers,
  Star,
  GitFork,
  AlertCircle,
  Clock,
  Calendar,
  Shield,
  Hash,
  ListTree,
  Server,
  Database,
  Cpu,
  Boxes,
} from "lucide-react";
import { Project, ProjectStatus } from "@/types/wiki";

interface HeadingItem {
  id: string;
  level: number;
  text: string;
}

function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings: HeadingItem[] = [];
  const seenSlugs = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim().replace(/[*_`]/g, "");
      const baseSlug = rawText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      let slug = baseSlug || "secao";
      let count = 2;
      while (seenSlugs.has(slug)) {
        slug = `${baseSlug}-${count}`;
        count++;
      }
      seenSlugs.add(slug);
      headings.push({ id: slug, level, text: rawText });
    }
  }
  return headings;
}

function formatDate(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; desc: string; badge: string }
> = {
  active: {
    label: "Ativo",
    desc: "Repositório mantido ativamente com atualizações recentes",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  development: {
    label: "Em Desenvolvimento",
    desc: "Em evolução ou manutenção periódica",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  study: {
    label: "Estudo / Tutorial",
    desc: "Guia prático de engenharia de software e implementação",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  experimental: {
    label: "Experimental",
    desc: "Projeto experimental ou prova de conceito",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  archived: {
    label: "Arquivado",
    desc: "Repositório arquivado ou em modo somente-leitura no GitHub",
    badge: "bg-slate-700/30 text-slate-400 border-slate-700/50",
  },
};

export default function ProjectDetailViewer({ project }: { project: Project }) {
  const hasPt = Boolean(
    project.name_pt || project.description_pt || project.markdown_content_pt
  );
  const [langMode, setLangMode] = useState<"pt" | "en">(hasPt ? "pt" : "en");

  const isPt = langMode === "pt";

  const title = isPt ? project.name_pt || project.name : project.name;
  const description = isPt
    ? project.description_pt || project.description
    : project.description;
  const markdownContent = isPt
    ? project.markdown_content_pt || project.markdown_content
    : project.markdown_content;

  // Extração determinística de títulos do README
  const headings = useMemo(
    () => extractHeadings(markdownContent || ""),
    [markdownContent]
  );

  const status = project.status || "study";
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.study;

  const stack = project.tech_stack || {};
  const hasStack = Object.values(stack).some((arr) => arr && arr.length > 0);

  const allTechPills = useMemo(() => {
    const list: string[] = [];
    if (project.languages) list.push(...project.languages);
    if (stack.frontend) list.push(...stack.frontend);
    if (stack.backend) list.push(...stack.backend);
    if (stack.data) list.push(...stack.data);
    if (stack.infrastructure) list.push(...stack.infrastructure);
    if (stack.other) list.push(...stack.other);
    return Array.from(new Set(list));
  }, [project.languages, stack]);

  const meta = project.metadata;
  const hasTimeline = Boolean(meta?.last_updated || meta?.created_at);

  return (
    <div className="space-y-8">
      {/* Container Principal */}
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

        {/* Badges de Categorias, Status e Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/categories/${project.category_slug}`}
            className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
          >
            <FolderTree className="h-3 w-3" />
            {project.category}
          </Link>

          <span
            className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded border ${statusInfo.badge}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusInfo.label}
          </span>

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
      </div>

      {/* 9. Visão Geral (Quick Overview) */}
      <div className="rounded-xl border border-border bg-[#0b1120] p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400">
          <Layers className="h-4 w-4" />
          <span>Visão Geral do Projeto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-[#080d1a] border border-border/60 space-y-1">
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">
              O Que É
            </span>
            <p className="text-slate-200 font-medium">
              {description || `Guia e implementação técnica de ${project.category}`}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#080d1a] border border-border/60 space-y-1">
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">
              Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
              <span className="text-slate-400 text-[11px]">{statusInfo.desc}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#080d1a] border border-border/60 space-y-1">
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">
              Stack &amp; Linguagens
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {allTechPills.length > 0 ? (
                allTechPills.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-mono"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 font-mono">Linguagem padrão da fonte</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#080d1a] border border-border/60 space-y-1">
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">
              Documentação
            </span>
            <p className="text-slate-200 font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              {headings.length > 1
                ? `Guia estruturado com ${headings.length} tópicos`
                : markdownContent
                ? "Referência direta e snippet disponível"
                : "Acesso disponível via link da fonte"}
            </p>
          </div>
        </div>
      </div>

      {/* 7. Resumo Técnico (Metadados Estruturados) */}
      <div className="rounded-xl border border-border bg-[#0b1120] p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <Cpu className="h-4 w-4 text-sky-400" />
          <span>Resumo Técnico &amp; Stack</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Linguagem Principal */}
          <div className="p-3.5 rounded-lg bg-[#080d1a] border border-border/60 space-y-1.5">
            <span className="font-mono text-slate-400 flex items-center gap-1 text-[11px]">
              <Code className="h-3 w-3 text-sky-400" />
              Linguagem Principal
            </span>
            <p className="text-white font-semibold text-sm">
              {meta?.primary_language || project.languages?.[0] || "Não especificada"}
            </p>
            {project.languages && project.languages.length > 1 && (
              <p className="text-[11px] text-slate-400 font-mono">
                Secundárias: {project.languages.slice(1).join(", ")}
              </p>
            )}
          </div>

          {/* Licença */}
          <div className="p-3.5 rounded-lg bg-[#080d1a] border border-border/60 space-y-1.5">
            <span className="font-mono text-slate-400 flex items-center gap-1 text-[11px]">
              <Shield className="h-3 w-3 text-sky-400" />
              Licença
            </span>
            <p className="text-white font-semibold text-sm">
              {meta?.license || "Conforme fonte / Repositório"}
            </p>
          </div>

          {/* GitHub Stars & Métricas */}
          {meta?.stars !== undefined && (
            <div className="p-3.5 rounded-lg bg-[#080d1a] border border-border/60 space-y-1.5">
              <span className="font-mono text-slate-400 flex items-center gap-1 text-[11px]">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                Métricas GitHub
              </span>
              <div className="flex items-center gap-3 text-slate-200 font-mono text-sm">
                <span>{meta.stars.toLocaleString()} ★</span>
                {meta.forks !== undefined && (
                  <span className="text-slate-400 text-xs">{meta.forks.toLocaleString()} forks</span>
                )}
              </div>
            </div>
          )}

          {/* Stack Tecnológica por Camada */}
          {hasStack && (
            <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-lg bg-[#080d1a] border border-border/60 space-y-3">
              <span className="font-mono text-slate-400 flex items-center gap-1 text-[11px]">
                <Boxes className="h-3.5 w-3.5 text-sky-400" />
                Arquitetura e Stack Detectada
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {stack.frontend && stack.frontend.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">Frontend</span>
                    <div className="flex flex-wrap gap-1">
                      {stack.frontend.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stack.backend && stack.backend.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">Backend</span>
                    <div className="flex flex-wrap gap-1">
                      {stack.backend.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stack.data && stack.data.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">Data / Storage</span>
                    <div className="flex flex-wrap gap-1">
                      {stack.data.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stack.infrastructure && stack.infrastructure.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">Infraestrutura</span>
                    <div className="flex flex-wrap gap-1">
                      {stack.infrastructure.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stack.other && stack.other.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px] uppercase">Sistemas &amp; Outros</span>
                    <div className="flex flex-wrap gap-1">
                      {stack.other.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 11. Timeline Básica (se houver dados) */}
      {hasTimeline && (
        <div className="rounded-xl border border-border bg-[#0b1120] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <Clock className="h-4 w-4 text-sky-400" />
            <span>Linha do Tempo</span>
          </div>

          <div className="space-y-3 border-l-2 border-slate-800 ml-2 pl-4 text-xs font-mono">
            {meta?.last_updated && (
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-400">{formatDate(meta.last_updated)}</span>
                <p className="text-slate-200 font-medium mt-0.5">Última atualização registrada no GitHub</p>
              </div>
            )}

            {meta?.created_at && (
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-500" />
                <span className="text-slate-400">{formatDate(meta.created_at)}</span>
                <p className="text-slate-300 mt-0.5">Repositório criado no GitHub</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Índice Automático do README (quando houver seções estruturadas) */}
      {headings.length > 1 && (
        <div className="rounded-xl border border-sky-900/50 bg-[#080e1e] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400">
            <ListTree className="h-4 w-4" />
            <span>Neste Documento (Índice)</span>
          </div>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className="text-slate-300 hover:text-sky-300 hover:underline flex items-center gap-1.5 truncate"
                style={{ paddingLeft: `${Math.max(0, (h.level - 2) * 12)}px` }}
              >
                <span className="text-slate-500">&bull;</span>
                <span className="truncate">{h.text}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Conteúdo Markdown Original/Formatado */}
      {markdownContent && (
        <div className="space-y-3">
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

          <pre className="rounded-xl border border-border bg-[#070a12] p-5 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
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
              <li key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/50">
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
