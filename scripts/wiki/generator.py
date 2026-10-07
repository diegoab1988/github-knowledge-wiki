"""
Módulo de geração de dados para o frontend (generator.py).
Gera os arquivos JSON consumidos diretamente pelo Next.js (projects.json, categories.json, stats.json).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def generate_categories(projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Gera o catálogo de categorias com contagens e metadados."""
    cat_map: Dict[str, Dict[str, Any]] = {}

    for p in projects:
        cat_name = p.get("category", "Geral")
        cat_slug = p.get("category_slug", "geral")

        if cat_slug not in cat_map:
            cat_map[cat_slug] = {
                "name": cat_name,
                "slug": cat_slug,
                "count": 0,
                "languages": set(),
                "sources": set(),
            }

        cat_map[cat_slug]["count"] += 1
        for lang in p.get("languages", []):
            cat_map[cat_slug]["languages"].add(lang)

        source_name = p.get("source", {}).get("name")
        if source_name:
            cat_map[cat_slug]["sources"].add(source_name)

    categories = []
    for c in cat_map.values():
        categories.append({
            "name": c["name"],
            "slug": c["slug"],
            "count": c["count"],
            "languages": sorted(list(c["languages"])),
            "sources": sorted(list(c["sources"])),
        })

    # Ordena alfabeticamente pelo nome da categoria
    categories.sort(key=lambda x: x["name"].lower())
    return categories


def generate_stats(
    projects: List[Dict[str, Any]],
    categories: List[Dict[str, Any]],
    sources: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Gera estatísticas globais para a página inicial e métricas da wiki."""
    all_langs: Dict[str, int] = {}
    all_techs: Dict[str, int] = {}
    sources_count: Dict[str, int] = {}
    status_counts: Dict[str, int] = {}

    for p in projects:
        for lang in p.get("languages", []):
            all_langs[lang] = all_langs.get(lang, 0) + 1

        # Conta status
        st = p.get("status", "study")
        status_counts[st] = status_counts.get(st, 0) + 1

        # Conta tecnologias da stack
        stack = p.get("tech_stack", {})
        if isinstance(stack, dict):
            for sec, tech_list in stack.items():
                if isinstance(tech_list, list):
                    for tech in tech_list:
                        all_techs[tech] = all_techs.get(tech, 0) + 1

        src_id = p.get("source", {}).get("id", "")
        if src_id:
            sources_count[src_id] = sources_count.get(src_id, 0) + 1

    top_languages = [
        {"name": k, "count": v}
        for k, v in sorted(all_langs.items(), key=lambda x: (-x[1], x[0].lower()))
    ]

    top_technologies = [
        {"name": k, "count": v}
        for k, v in sorted(all_techs.items(), key=lambda x: (-x[1], x[0].lower()))
    ]

    sources_summary = []
    for s in sources:
        s_id = s.get("id", "")
        sources_summary.append({
            "id": s_id,
            "name": s.get("name", ""),
            "owner": s.get("owner", ""),
            "repository": s.get("repository", ""),
            "branch": s.get("branch", "master"),
            "enabled": s.get("enabled", True),
            "description": s.get("description", ""),
            "projects_count": sources_count.get(s_id, 0),
        })

    return {
        "total_sources": len(sources),
        "total_projects": len(projects),
        "total_categories": len(categories),
        "total_languages": len(top_languages),
        "total_technologies": len(top_technologies),
        "top_languages": top_languages[:15],
        "top_technologies": top_technologies[:20],
        "status_counts": status_counts,
        "sources_summary": sources_summary,
        "last_sync": datetime.now(timezone.utc).isoformat(),
    }


def write_json_file(filepath: Path, data: Any) -> None:
    """Escreve dados em formato JSON formatado com UTF-8."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def generate_wiki_data(
    projects: List[Dict[str, Any]],
    sources: List[Dict[str, Any]],
    target_dir: Path | None = None,
) -> Dict[str, Any]:
    """Executa a geração completa de projects.json, categories.json e stats.json."""
    output_dir = target_dir or DATA_DIR
    categories = generate_categories(projects)
    stats = generate_stats(projects, categories, sources)

    write_json_file(output_dir / "projects.json", projects)
    write_json_file(output_dir / "categories.json", categories)
    write_json_file(output_dir / "stats.json", stats)

    return {
        "projects_count": len(projects),
        "categories_count": len(categories),
        "sources_count": len(sources),
    }
