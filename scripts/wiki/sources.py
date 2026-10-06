"""
Módulo de carregamento e validação de fontes (sources.py).
Carrega as fontes configuradas em data/sources.json.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

DEFAULT_SOURCES_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "sources.json"


def validate_source(source: Dict[str, Any], index: int = 0) -> None:
    """Valida se uma entrada de fonte contém os campos obrigatórios."""
    required_fields = ["name", "owner", "repository"]
    for field in required_fields:
        if field not in source or not str(source[field]).strip():
            raise ValueError(
                f"Fonte no índice {index} inválida: campo obrigatório '{field}' ausente ou vazio."
            )

    if "enabled" not in source:
        source["enabled"] = True
    elif not isinstance(source["enabled"], bool):
        raise TypeError(f"Fonte '{source.get('name')}' possui valor inválido para 'enabled' (esperado booleano).")

    if "branch" not in source or not str(source["branch"]).strip():
        source["branch"] = "master"

    # Define um id padrão se não existir
    if "id" not in source or not str(source["id"]).strip():
        owner = source["owner"].strip().lower()
        repo = source["repository"].strip().lower()
        source["id"] = f"{owner}-{repo}".replace("/", "-")


def load_sources(sources_path: Path | str | None = None) -> List[Dict[str, Any]]:
    """Carrega todas as fontes do arquivo sources.json."""
    path = Path(sources_path) if sources_path else DEFAULT_SOURCES_PATH
    if not path.exists():
        raise FileNotFoundError(f"Arquivo de catálogo não encontrado: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict) or "sources" not in data or not isinstance(data["sources"], list):
        raise ValueError(f"Formato inválido em {path}: deve conter uma chave 'sources' com uma lista.")

    sources = data["sources"]
    for idx, source in enumerate(sources):
        validate_source(source, idx)

    return sources


def get_enabled_sources(sources_path: Path | str | None = None) -> List[Dict[str, Any]]:
    """Retorna apenas as fontes marcadas como enabled."""
    all_sources = load_sources(sources_path)
    return [s for s in all_sources if s.get("enabled", True)]
