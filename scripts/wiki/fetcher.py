"""
Módulo de busca de dados dos repositórios GitHub (fetcher.py).
Obtém o conteúdo raw do README ou arquivos do repositório de forma simples e eficiente.
"""

from __future__ import annotations

import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / ".cache" / "sources"


def get_raw_url(owner: str, repository: str, branch: str, filepath: str = "README.md") -> str:
    """Gera a URL raw do GitHub para um arquivo."""
    return f"https://raw.githubusercontent.com/{owner}/{repository}/{branch}/{filepath}"


def fetch_repository_readme(source: Dict[str, Any], use_cache: bool = True, force_refresh: bool = False) -> str:
    """
    Obtém o conteúdo do README.md da fonte especificada.
    Tenta primeiro o branch configurado, com fallback automático entre master e main.
    """
    owner = source["owner"]
    repo = source["repository"]
    branch = source.get("branch", "master")
    source_id = source.get("id", f"{owner}-{repo}".replace("/", "-"))

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{source_id}_README.md"

    if use_cache and not force_refresh and cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                content = f.read()
                if content.strip():
                    return content
        except Exception:
            pass

    # Lista de branches para tentar
    branches_to_try = [branch]
    if branch == "master" and "main" not in branches_to_try:
        branches_to_try.append("main")
    elif branch == "main" and "master" not in branches_to_try:
        branches_to_try.append("master")

    headers = {
        "User-Agent": "GitHubKnowledgeWiki-Ingestor/1.0 (+https://github.com/)",
        "Accept": "text/plain, text/markdown, */*",
    }

    last_error = None
    filenames_to_try = ["README.md", "readme.md", "Readme.md"]

    for b in branches_to_try:
        for fname in filenames_to_try:
            url = get_raw_url(owner, repo, b, fname)
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=15) as response:
                    content = response.read().decode("utf-8")
                    try:
                        with open(cache_file, "w", encoding="utf-8") as f:
                            f.write(content)
                    except Exception:
                        pass
                    return content
            except urllib.error.HTTPError as e:
                last_error = e
                if e.code == 404:
                    continue
                raise
            except Exception as e:
                last_error = e
                break
            last_error = e
            break

    raise RuntimeError(
        f"Não foi possível obter o README de {owner}/{repo} nos branches {branches_to_try}. Erro: {last_error}"
    )
