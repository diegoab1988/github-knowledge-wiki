"""
Módulo de interpretação de Markdown e fontes (parser.py).
Interpreta o README e estruturas de dados dos repositórios.
Possui suporte específico para Build Your Own X e parser genérico para outros repositórios.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Callable, Dict, List


def slugify(text: str) -> str:
    """Converte um texto em um slug amigável para URL."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or "item"


def clean_title(title: str) -> str:
    """Remove itálicos, negritos e pontuações indesejadas do título."""
    cleaned = title.strip()
    # Remove _ no início e fim
    if cleaned.startswith("_") and cleaned.endswith("_"):
        cleaned = cleaned[1:-1].strip()
    # Remove aspas repetidas
    cleaned = cleaned.strip("\"'").strip()
    return cleaned


def parse_languages(raw_lang: str) -> List[str]:
    """Separa strings como 'C# / TypeScript / JavaScript' em lista de linguagens limpas."""
    if not raw_lang:
        return []
    # Divide por / ou ,
    parts = re.split(r"[/,]", raw_lang)
    langs = []
    for p in parts:
        lang = p.strip()
        if lang:
            langs.append(lang)
    return langs


def parse_tags(extra_text: str) -> List[str]:
    """Extrai tags como [video], [interactive], [free course] do sufixo."""
    if not extra_text:
        return []
    tags = re.findall(r"\[([a-zA-Z0-9_\-\s]+)\]", extra_text)
    return [t.strip().lower() for t in tags if t.strip()]


def parse_build_your_own_x(markdown_content: str, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Parser especializado para o repositório codecrafters-io/build-your-own-x.
    Extrai categorias, linguagens, títulos de projetos, links e tags.
    """
    pattern_with_lang = re.compile(
        r"^\s*[\*\-]\s+\[\*\*([^*]+)\*\*:\s*(.+?)\]\((https?://[^\s\)]+)\)(.*)$"
    )
    pattern_no_lang = re.compile(
        r"^\s*[\*\-]\s+\[(.+?)\]\((https?://[^\s\)]+)\)(.*)$"
    )

    lines = markdown_content.splitlines()
    projects: List[Dict[str, Any]] = []
    current_category: str | None = None
    seen_ids: set[str] = set()

    source_id = source.get("id", "build-your-own-x")
    source_name = source.get("name", "Build Your Own X")
    source_repo = f"{source.get('owner', '')}/{source.get('repository', '')}".strip("/")

    for line in lines:
        line_s = line.strip()

        # Cabeçalhos de categoria
        if line_s.startswith("#### "):
            heading = line_s[5:].strip()
            if heading.lower().startswith("build your own "):
                heading = heading[len("build your own ") :].strip()
            heading = heading.replace("`", "").strip()
            current_category = heading
            continue
        elif line_s.startswith("## Contribute") or line_s.startswith("## Origins"):
            current_category = None
            continue

        if not current_category or not (line_s.startswith("* ") or line_s.startswith("- ")):
            continue

        raw_lang = ""
        raw_title = ""
        url = ""
        extra = ""

        m_lang = pattern_with_lang.match(line_s)
        if m_lang:
            raw_lang, raw_title, url, extra = m_lang.groups()
        else:
            m_no_lang = pattern_no_lang.match(line_s)
            if m_no_lang:
                raw_title, url, extra = m_no_lang.groups()
            else:
                continue

        title = clean_title(raw_title)
        languages = parse_languages(raw_lang)
        tags = parse_tags(extra)

        cat_slug = slugify(current_category)
        title_slug = slugify(title)
        base_id = f"{cat_slug}-{title_slug}"[:60]
        final_id = base_id
        counter = 2
        while final_id in seen_ids:
            final_id = f"{base_id}-{counter}"
            counter += 1
        seen_ids.add(final_id)

        # Detecta se é link do GitHub
        is_github = "github.com" in url.lower()
        github_url = url if is_github else f"https://github.com/{source_repo}"

        project = {
            "id": final_id,
            "title": title,
            "description": f"Guia prático para construir {current_category} a partir do zero.",
            "category": current_category,
            "category_slug": cat_slug,
            "source_id": source_id,
            "source_name": source_name,
            "source_repo": source_repo,
            "github_url": github_url,
            "original_url": url,
            "languages": languages,
            "tags": tags,
            "raw_line": line_s,
        }
        projects.append(project)

    return projects


def parse_generic_markdown(markdown_content: str, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Parser genérico para repositórios futuros em Markdown estruturado com cabeçalhos e listas de links.
    """
    lines = markdown_content.splitlines()
    projects: List[Dict[str, Any]] = []
    current_category = "General"
    seen_ids: set[str] = set()

    source_id = source.get("id", "generic-source")
    source_name = source.get("name", "Generic Source")
    source_repo = f"{source.get('owner', '')}/{source.get('repository', '')}".strip("/")

    link_pattern = re.compile(r"\[([^\]]+)\]\((https?://[^\s\)]+)\)")

    for line in lines:
        line_s = line.strip()
        if line_s.startswith("#"):
            heading = re.sub(r"^#+\s*", "", line_s).strip("`").strip()
            if heading and not any(h in heading.lower() for h in ["license", "contribute", "author", "table of contents"]):
                current_category = heading
            continue

        if line_s.startswith("* ") or line_s.startswith("- "):
            match = link_pattern.search(line_s)
            if match:
                title = clean_title(match.group(1))
                url = match.group(2)
                cat_slug = slugify(current_category)
                title_slug = slugify(title)
                base_id = f"{cat_slug}-{title_slug}"[:60]
                final_id = base_id
                counter = 2
                while final_id in seen_ids:
                    final_id = f"{base_id}-{counter}"
                    counter += 1
                seen_ids.add(final_id)

                is_github = "github.com" in url.lower()
                github_url = url if is_github else f"https://github.com/{source_repo}"

                # Tenta extrair linguagens caso haja marcadores
                lang_match = re.search(r"\*\*([^*]+)\*\*", line_s)
                languages = parse_languages(lang_match.group(1)) if lang_match else []

                projects.append({
                    "id": final_id,
                    "title": title,
                    "description": "",
                    "category": current_category,
                    "category_slug": cat_slug,
                    "source_id": source_id,
                    "source_name": source_name,
                    "source_repo": source_repo,
                    "github_url": github_url,
                    "original_url": url,
                    "languages": languages,
                    "tags": [],
                    "raw_line": line_s,
                })

    return projects


# Registro de parsers por repositório ou ID
PARSER_REGISTRY: Dict[str, Callable[[str, Dict[str, Any]], List[Dict[str, Any]]]] = {
    "build-your-own-x": parse_build_your_own_x,
    "codecrafters-io/build-your-own-x": parse_build_your_own_x,
}


def parse_repository_content(markdown_content: str, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Despacha o parsing para a função correta baseado no repositório ou ID da fonte."""
    source_id = source.get("id", "")
    repo_key = f"{source.get('owner', '')}/{source.get('repository', '')}".strip("/")

    if source_id in PARSER_REGISTRY:
        return PARSER_REGISTRY[source_id](markdown_content, source)
    if repo_key in PARSER_REGISTRY:
        return PARSER_REGISTRY[repo_key](markdown_content, source)

    # Fallback para parser genérico
    return parse_generic_markdown(markdown_content, source)
