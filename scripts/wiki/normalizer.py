"""
Módulo de normalização de dados (normalizer.py).
Converte dados brutos extraídos de diferentes fontes em um formato canônico unificado.
"""

from __future__ import annotations

from typing import Any, Dict, List


def normalize_project(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normaliza um projeto para o modelo de dados padrão da wiki.
    Adiciona apenas os campos e informações que realmente existem na fonte.
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

    # Campos condicionais - apenas se presentes
    if raw.get("description"):
        item["description"] = raw["description"].strip()

    if raw.get("github_url"):
        item["github_url"] = raw["github_url"]

    languages = [l.strip() for l in raw.get("languages", []) if l.strip()]
    if languages:
        item["languages"] = languages

    tags = [t.strip() for t in raw.get("tags", []) if t.strip()]
    if tags:
        item["tags"] = tags

    if raw.get("raw_line"):
        item["markdown_content"] = raw["raw_line"].strip()

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
    # Ordenação determinística: por categoria e depois por nome
    normalized.sort(key=lambda x: (x.get("category", "").lower(), x.get("name", "").lower()))
    return normalized
