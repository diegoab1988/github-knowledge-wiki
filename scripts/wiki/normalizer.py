"""
Módulo de normalização de dados (normalizer.py).
Converte dados brutos extraídos de diferentes fontes em um formato canônico unificado,
preservando estritamente os campos originais e suas representações derivadas em PT-BR.
"""

from __future__ import annotations

from typing import Any, Dict, List


def normalize_project(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normaliza um projeto para o modelo de dados padrão da wiki.
    Separa de forma inequívoca o conteúdo original da camada derivada de localização em PT-BR.
    """
    item: Dict[str, Any] = {
        "id": str(raw.get("id", "")).strip(),
        "name": str(raw.get("title", "")).strip(),
        "category": str(raw.get("category", "Geral")).strip(),
        "category_slug": str(raw.get("category_slug", "geral")).strip(),
        "source": {
            "id": raw.get("source_id", ""),
            "name": raw.get("source_name", ""),
            "repository": raw.get("source_repo", ""),
        },
        "original_url": raw.get("original_url", ""),
    }

    # Título traduzido derivado (PT-BR)
    if raw.get("title_pt"):
        item["name_pt"] = raw["title_pt"].strip()

    # Descrição original (SOMENTE se presente na fonte, NUNCA inventada)
    if raw.get("description"):
        item["description"] = raw["description"].strip()

    # Descrição traduzida derivada (SOMENTE se houver descrição original)
    if raw.get("description_pt"):
        item["description_pt"] = raw["description_pt"].strip()

    if raw.get("github_url"):
        item["github_url"] = raw["github_url"]

    languages = [l.strip() for l in raw.get("languages", []) if l.strip()]
    if languages:
        item["languages"] = languages

    tags = [t.strip() for t in raw.get("tags", []) if t.strip()]
    if tags:
        item["tags"] = tags

    # Markdown original da linha/conteúdo
    if raw.get("raw_line"):
        item["markdown_content"] = raw["raw_line"].strip()

    # Markdown traduzido derivado (com URLs e código preservados)
    if raw.get("raw_line_pt"):
        item["markdown_content_pt"] = raw["raw_line_pt"].strip()

    references: List[Dict[str, str]] = []
    if raw.get("original_url"):
        references.append({"title": "Tutorial / Link Original", "url": raw["original_url"]})
    if raw.get("github_url") and raw.get("github_url") != raw.get("original_url"):
        references.append({"title": "Repositório GitHub", "url": raw["github_url"]})

    if references:
        item["references"] = references

    return item


def normalize_all(raw_projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Normaliza e ordena uma lista completa de projetos."""
    normalized = [normalize_project(p) for p in raw_projects]
    # Ordenação determinística: por categoria e depois por nome original
    normalized.sort(key=lambda x: (x.get("category", "").lower(), x.get("name", "").lower()))
    return normalized
