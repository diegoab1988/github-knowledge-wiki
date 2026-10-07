"""
Módulo de interpretação de Markdown e fontes (parser.py).
Interpreta o README e estruturas de dados dos repositórios.
Garante a separação estrita entre conteúdo original e tradução (PT-BR),
sem inventar descrições e preservando integralmente o Markdown original.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Callable, Dict, List

from .translator import translate_batch, translate_text


def slugify(text: str) -> str:
    """Converte um texto em um slug amigável para URL."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or "item"


def clean_title(title: str) -> str:
    """Remove itálicos, negritos e pontuações indesejadas do título."""
    cleaned = title.strip()
    if cleaned.startswith("_") and cleaned.endswith("_"):
        cleaned = cleaned[1:-1].strip()
    cleaned = cleaned.strip("\"'").strip()
    return cleaned


def clean_category_name(heading: str, parent: str = "") -> str:
    """Higieniza nomes de categorias (remove 'Actual ', 'Various ', etc.)."""
    cat = heading.strip().strip("`")
    cat_lower = cat.lower()

    if cat_lower.startswith("actual "):
        cat = cat[7:].strip().title()
    elif cat_lower.startswith("libraries for creating "):
        cat = cat.replace("Libraries for creating", "Criação de").strip()
    elif cat_lower.startswith("various "):
        cat = cat[8:].strip().title()

    if parent and parent.lower() not in cat.lower() and len(cat) < 30:
        return f"{parent} - {cat}"
    return cat


def parse_languages(raw_lang: str) -> List[str]:
    """Separa strings como 'C# / TypeScript / JavaScript' em lista de linguagens limpas."""
    if not raw_lang:
        return []
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
    Extrai categorias, linguagens, títulos originais de projetos, links e tags.
    Separa título original de título traduzido (PT-BR) e NÃO inventa descrições inexistentes na fonte.
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

        is_github = "github.com" in url.lower()
        github_url = url if is_github else f"https://github.com/{source_repo}"

        project = {
            "id": final_id,
            "title": title,            # Título ORIGINAL intacto
            "title_pt": None,          # Será preenchido com tradução
            "description": None,       # BYOX NÃO possui descrições na fonte - não inventar
            "description_pt": None,
            "category": current_category,
            "category_slug": cat_slug,
            "source_id": source_id,
            "source_name": source_name,
            "source_repo": source_repo,
            "github_url": github_url,
            "original_url": url,
            "languages": languages,
            "tags": tags,
            "raw_line": line_s,        # Markdown original
            "raw_line_pt": None,       # Markdown traduzido
        }
        projects.append(project)

    # Tradução derivada de títulos em lote
    if projects:
        titles = [p["title"] for p in projects]
        translated_titles = translate_batch(titles, target_lang="pt-BR")

        for p, trans_title in zip(projects, translated_titles):
            if trans_title and trans_title.strip() != p["title"]:
                p["title_pt"] = trans_title.strip()

                raw = p["raw_line"]
                if f"_{p['title']}_" in raw:
                    p["raw_line_pt"] = raw.replace(f"_{p['title']}_", f"_{p['title_pt']}_")
                elif p["title"] in raw:
                    p["raw_line_pt"] = raw.replace(p["title"], p["title_pt"])

    return projects


def parse_generic_markdown(markdown_content: str, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Parser genérico para repositórios futuros em Markdown estruturado com cabeçalhos,
    listas de links (Awesome lists) ou tabelas.
    Mantém descrição original e traduzida estritamente separadas.
    """
    lines = markdown_content.splitlines()
    projects: List[Dict[str, Any]] = []
    current_category = "General"
    parent_category = ""
    seen_ids: set[str] = set()

    source_id = source.get("id", "generic-source")
    source_name = source.get("name", "Generic Source")
    source_repo = f"{source.get('owner', '')}/{source.get('repository', '')}".strip("/")

    inferred_lang = None
    repo_lower = source_repo.lower()
    for l_cand, l_name in [
        ("python", "Python"), ("rust", "Rust"), ("golang", "Go"), ("-go", "Go"),
        ("javascript", "JavaScript"), ("typescript", "TypeScript"), ("ruby", "Ruby"),
        ("java", "Java"), ("csharp", "C#"), ("cpp", "C++")
    ]:
        if l_cand in repo_lower or l_cand in source_name.lower():
            inferred_lang = l_name
            break

    link_pattern = re.compile(r"\[([^\]]+)\]\((https?://[^\s\)]+)\)(.*)")

    raw_descriptions: List[str] = []
    indices_to_translate: List[int] = []

    for line in lines:
        line_s = line.strip()
        if line_s.startswith("#"):
            hashes = len(line_s) - len(line_s.lstrip("#"))
            heading = re.sub(r"^#+\s*", "", line_s).strip("`").strip()
            heading_lower = heading.lower()

            if heading and not any(h in heading_lower for h in ["license", "licence", "contribute", "contributing", "author", "table of contents", "contents", "installation"]):
                if hashes <= 3:
                    parent_category = heading
                    current_category = heading
                else:
                    current_category = clean_category_name(heading, parent_category)
            continue

        is_list = line_s.startswith("* ") or line_s.startswith("- ")
        is_table = line_s.startswith("|") and "[" in line_s and "](" in line_s and not re.match(r"^\|[\s\-:|]+\|$", line_s)

        if is_list:
            match = link_pattern.search(line_s)
            if not match:
                continue
            title = clean_title(match.group(1))
            url = match.group(2)
            trailing = match.group(3).strip()
            description = ""
            if trailing:
                desc_clean = re.sub(r"^[\s\-–—:\.]+", "", trailing).strip()
                if desc_clean and len(desc_clean) > 3:
                    description = desc_clean
            tags = parse_tags(trailing)
        elif is_table:
            cols = [c.strip() for c in line_s.split("|")[1:-1]]
            if len(cols) < 2:
                continue
            match = re.search(r"\[([^\]]+)\]\((https?://[^\s\)]+)\)", cols[0])
            if not match:
                continue
            title = clean_title(match.group(1))
            url = match.group(2)
            trailing = ""
            description = cols[1] if len(cols) > 1 and len(cols[1]) > 3 else ""
            tags = []
        else:
            continue

        if url.startswith("#") or "shields.io" in url or "travis-ci" in url:
            continue

        cat_slug = slugify(current_category)
        title_slug = slugify(title)
        base_id = f"{source_id}-{cat_slug}-{title_slug}"[:60]
        final_id = base_id
        counter = 2
        while final_id in seen_ids:
            final_id = f"{base_id}-{counter}"
            counter += 1
        seen_ids.add(final_id)

        is_github = "github.com" in url.lower()
        github_url = url if is_github else f"https://github.com/{source_repo}"

        lang_match = re.search(r"\*\*([^*]+)\*\*", line_s)
        languages = parse_languages(lang_match.group(1)) if lang_match else []
        if not languages and inferred_lang:
            languages = [inferred_lang]

        orig_desc = description.strip() if description else None

        p_idx = len(projects)
        if orig_desc:
            raw_descriptions.append(orig_desc)
            indices_to_translate.append(p_idx)

        projects.append({
            "id": final_id,
            "title": title,                # Título ORIGINAL
            "title_pt": None,              # Título traduzido derivado
            "description": orig_desc,      # ORIGINAL real ou None (NUNCA inventada)
            "description_pt": None,        # Tradução derivada se houver descrição original
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
            "raw_line_pt": None,
        })

    # Tradução em lote das descrições reais encontradas
    if raw_descriptions:
        translated_descs = translate_batch(raw_descriptions, target_lang="pt-BR")
        for p_idx, trans in zip(indices_to_translate, translated_descs):
            if trans and trans.strip() != projects[p_idx]["description"]:
                projects[p_idx]["description_pt"] = trans.strip()

    # Tradução em lote de títulos compostos quando relevante
    titles_to_translate = [p["title"] for p in projects if len(p["title"].split()) > 2]
    if titles_to_translate:
        trans_titles = translate_batch(titles_to_translate, target_lang="pt-BR")
        t_iter = iter(trans_titles)
        for p in projects:
            if len(p["title"].split()) > 2:
                t_val = next(t_iter, None)
                if t_val and t_val.strip() != p["title"]:
                    p["title_pt"] = t_val.strip()

    # Gera representação markdown traduzida substituindo com segurança o conteúdo linguístico
    for p in projects:
        raw = p["raw_line"]
        modified = raw
        if p["title_pt"] and p["title"] in modified:
            modified = modified.replace(p["title"], p["title_pt"])
        if p["description"] and p["description_pt"] and p["description"] in modified:
            modified = modified.replace(p["description"], p["description_pt"])
        if modified != raw:
            p["raw_line_pt"] = modified

    return projects


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

    return parse_generic_markdown(markdown_content, source)
