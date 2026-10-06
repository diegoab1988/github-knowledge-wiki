"""
Módulo para adicionar um repositório GitHub como fonte e sincronizar o conteúdo imediatamente.
Uso via CLI: python -m scripts.wiki.add <url_do_repositorio>
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, Tuple

from .sources import DEFAULT_SOURCES_PATH, load_sources
from .sync import sync_all

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def parse_repo_url(input_str: str) -> Tuple[str, str]:
    """Extrai (owner, repository) a partir de uma URL ou string 'owner/repo'."""
    clean = input_str.strip()
    # Remove prefixos comuns e .git
    clean = re.sub(r"^git@github\.com:", "", clean)
    clean = re.sub(r"^https?://github\.com/", "", clean)
    clean = re.sub(r"\.git$", "", clean)
    clean = clean.strip("/")

    parts = [p for p in clean.split("/") if p]
    if len(parts) < 2:
        raise ValueError(
            f"Formato inválido: '{input_str}'. Esperado 'owner/repo' ou 'https://github.com/owner/repo'."
        )

    owner = parts[0].strip()
    repository = parts[1].strip()
    return owner, repository


def fetch_repo_metadata(owner: str, repository: str) -> Dict[str, Any]:
    """Obtém metadados básicos do repositório via GitHub API ou cabeçalhos raw."""
    api_url = f"https://api.github.com/repos/{owner}/{repository}"
    headers = {
        "User-Agent": "GitHubKnowledgeWiki-Ingestor/1.0 (+https://github.com/)",
        "Accept": "application/vnd.github.v3+json",
    }

    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
            name = data.get("name", repository).replace("-", " ").replace("_", " ").title()
            return {
                "name": name,
                "description": data.get("description", "") or "",
                "branch": data.get("default_branch", "main"),
            }
    except Exception:
        # Fallback sem API se houver rate limit ou falha de rede
        name = repository.replace("-", " ").replace("_", " ").title()
        return {
            "name": name,
            "description": f"Repositório {owner}/{repository} importado para a wiki.",
            "branch": "main",
        }


def add_source(repo_url: str) -> Dict[str, Any]:
    """
    Adiciona a fonte em data/sources.json e executa a sincronização imediatamente.
    """
    owner, repository = parse_repo_url(repo_url)
    source_id = f"{owner.lower()}-{repository.lower()}".replace("/", "-")

    metadata = fetch_repo_metadata(owner, repository)

    sources_path = DEFAULT_SOURCES_PATH
    sources_data = {"sources": []}
    if sources_path.exists():
        with open(sources_path, "r", encoding="utf-8") as f:
            sources_data = json.load(f)

    sources = sources_data.get("sources", [])

    # Verifica se já existe
    existing_index = None
    for idx, s in enumerate(sources):
        if s.get("owner", "").lower() == owner.lower() and s.get("repository", "").lower() == repository.lower():
            existing_index = idx
            break

    new_source = {
        "id": source_id,
        "name": metadata["name"],
        "owner": owner,
        "repository": repository,
        "branch": metadata["branch"],
        "description": metadata["description"],
        "enabled": true if "true" in globals() else True,
    }

    if existing_index is not None:
        sources[existing_index]["enabled"] = True
        sources[existing_index]["branch"] = metadata["branch"]
        if metadata.get("description") and not sources[existing_index].get("description"):
            sources[existing_index]["description"] = metadata["description"]
        print(f"Fonte '{owner}/{repository}' já existia no catálogo. Reativando e atualizando...")
    else:
        sources.append(new_source)
        print(f"Adicionando nova fonte '{metadata['name']}' ({owner}/{repository})...")

    sources_data["sources"] = sources
    with open(sources_path, "w", encoding="utf-8") as f:
        json.dump(sources_data, f, indent=2, ensure_ascii=False)

    print("Catálogo data/sources.json atualizado.")
    print("Iniciando ingestão de dados...\n")

    # Executa a sincronização imediatamente
    sync_all(force_refresh=True)

    # Carrega estatísticas finais
    stats_file = sources_path.parent / "stats.json"
    stats = {}
    if stats_file.exists():
        with open(stats_file, "r", encoding="utf-8") as f:
            stats = json.load(f)

    summary = next((s for s in stats.get("sources_summary", []) if s.get("id") == source_id), None)
    projects_count = summary.get("projects_count", 0) if summary else 0

    return {
        "success": True,
        "source": new_source,
        "projects_count": projects_count,
        "total_projects": stats.get("total_projects", 0),
        "total_categories": stats.get("total_categories", 0),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python -m scripts.wiki.add <url_ou_owner_repo>")
        print("Exemplo: python -m scripts.wiki.add https://github.com/vinta/awesome-python")
        sys.exit(1)

    url_arg = sys.argv[1]
    try:
        result = add_source(url_arg)
        print(f"\n✓ Sucesso! {result['projects_count']} itens indexados da fonte '{result['source']['name']}'.")
        print(f"Total na Wiki: {result['total_projects']} projetos em {result['total_categories']} categorias.")
    except Exception as e:
        print(f"\n✗ Erro ao adicionar fonte: {e}", file=sys.stderr)
        sys.exit(1)
