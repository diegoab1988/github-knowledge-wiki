"""
Comando de sincronização e ingestão da Wiki (sync.py).
Executável via: python -m scripts.wiki.sync
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Set

from .enricher import fetch_github_metadata
from .fetcher import fetch_repository_readme
from .generator import generate_wiki_data
from .normalizer import normalize_all
from .parser import parse_repository_content
from .sources import get_enabled_sources

# Ajusta encoding da saída no Windows para suportar emojis e símbolos UTF-8
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"


def load_previous_projects() -> Dict[str, Dict[str, Any]]:
    """Carrega os projetos existentes para comparar alterações."""
    projects_file = DATA_DIR / "projects.json"
    if not projects_file.exists():
        return {}

    try:
        with open(projects_file, "r", encoding="utf-8") as f:
            items = json.load(f)
            if isinstance(items, list):
                return {item.get("id", ""): item for item in items if item.get("id")}
    except Exception:
        pass
    return {}


def detect_changes(
    prev_projects_map: Dict[str, Dict[str, Any]],
    current_source_projects: List[Dict[str, Any]],
    source_id: str,
) -> int:
    """Calcula quantidade de alterações (novos, modificados ou removidos) para uma fonte."""
    # Filtra projetos anteriores que pertenciam a essa fonte
    prev_for_source = {
        pid: p for pid, p in prev_projects_map.items()
        if p.get("source", {}).get("id") == source_id
    }

    current_ids: Set[str] = {p.get("id", "") for p in current_source_projects if p.get("id")}
    prev_ids: Set[str] = set(prev_for_source.keys())

    added = len(current_ids - prev_ids)
    removed = len(prev_ids - current_ids)

    modified = 0
    common_ids = current_ids.intersection(prev_ids)
    for pid in common_ids:
        curr_p = next(p for p in current_source_projects if p.get("id") == pid)
        prev_p = prev_for_source[pid]
        # Compara campos chave
        if (
            curr_p.get("name") != prev_p.get("name")
            or curr_p.get("original_url") != prev_p.get("original_url")
            or curr_p.get("category") != prev_p.get("category")
            or curr_p.get("languages") != prev_p.get("languages")
        ):
            modified += 1

    return added + removed + modified


def sync_all(force_refresh: bool = False) -> None:
    """Executa a sincronização de todas as fontes habilitadas."""
    print("Syncing sources...\n")

    try:
        enabled_sources = get_enabled_sources()
    except Exception as e:
        print(f"Erro ao carregar fontes: {e}", file=sys.stderr)
        sys.exit(1)

    if not enabled_sources:
        print("Nenhuma fonte habilitada encontrada em data/sources.json.")
        return

    prev_projects_map = load_previous_projects()
    is_initial_run = len(prev_projects_map) == 0

    all_normalized_projects: List[Dict[str, Any]] = []

    for source in enabled_sources:
        source_name = source.get("name", "Fonte")
        source_id = source.get("id", "")

        try:
            # Pre-cache GitHub metadata da fonte
            s_owner = source.get("owner", "")
            s_repo = source.get("repository", "")
            if s_owner and s_repo:
                try:
                    fetch_github_metadata(s_owner, s_repo, fetch_if_missing=True)
                except Exception:
                    pass

            # 1. Fetch README
            readme_content = fetch_repository_readme(source, force_refresh=force_refresh)

            # 2. Parse Markdown
            raw_projects = parse_repository_content(readme_content, source)

            # 3. Normalize
            normalized = normalize_all(raw_projects)
            all_normalized_projects.extend(normalized)

            # 4. Detect changes
            if is_initial_run:
                changes_text = f"{len(normalized)} items ingested (initial run)"
            else:
                changes_count = detect_changes(prev_projects_map, normalized, source_id)
                changes_text = f"{changes_count} changes detected"

            # Output no padrão requisitado
            print(f"✓ {source_name}")
            print(f"  {len(normalized)} projects")
            print(f"  {changes_text}\n")

        except Exception as e:
            print(f"✗ {source_name}")
            print(f"  Erro ao processar fonte: {e}\n", file=sys.stderr)

    # 5. Gera os arquivos JSON finais
    generate_wiki_data(all_normalized_projects, enabled_sources, DATA_DIR)

    print("Sync complete.")


if __name__ == "__main__":
    force = "--refresh" in sys.argv or "--force" in sys.argv
    sync_all(force_refresh=force)
