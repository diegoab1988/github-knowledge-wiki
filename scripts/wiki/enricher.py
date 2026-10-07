"""
Módulo de enriquecimento determinístico de metadados e stack tecnológica (enricher.py).
Extrai informações reais de repositórios GitHub, analisa arquivos de configuração
(package.json, requirements.txt, Dockerfile, etc.) e classifica a stack de forma determinística,
sem utilizar IA nem inventar dados ausentes.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / ".cache"
GITHUB_META_CACHE = CACHE_DIR / "github_meta"
REPO_FILES_CACHE = CACHE_DIR / "repo_files"

GITHUB_HEADERS = {
    "User-Agent": "GitHubKnowledgeWiki-Enricher/1.0 (+https://github.com/)",
    "Accept": "application/vnd.github.v3+json",
}

# Mapeamentos determinísticos de bibliotecas/pacotes para stacks conhecidas
NPM_FRONTEND = {
    "react": "React",
    "react-dom": "React",
    "next": "Next.js",
    "vue": "Vue.js",
    "nuxt": "Nuxt.js",
    "svelte": "Svelte",
    "@sveltejs/kit": "SvelteKit",
    "@angular/core": "Angular",
    "tailwindcss": "Tailwind CSS",
    "vite": "Vite",
    "sass": "Sass",
    "bootstrap": "Bootstrap",
    "@reduxjs/toolkit": "Redux",
    "zustand": "Zustand",
    "mobx": "MobX",
    "astro": "Astro",
}

NPM_BACKEND = {
    "express": "Express",
    "fastify": "Fastify",
    "@nestjs/core": "NestJS",
    "koa": "Koa",
    "hapi": "Hapi",
    "apollo-server": "Apollo GraphQL",
    "trpc": "tRPC",
    "@trpc/server": "tRPC",
    "socket.io": "Socket.io",
}

NPM_DATA = {
    "prisma": "Prisma",
    "@prisma/client": "Prisma",
    "typeorm": "TypeORM",
    "mongoose": "Mongoose",
    "mongodb": "MongoDB",
    "pg": "PostgreSQL",
    "mysql2": "MySQL",
    "ioredis": "Redis",
    "redis": "Redis",
    "sqlite3": "SQLite",
    "better-sqlite3": "SQLite",
    "@supabase/supabase-js": "Supabase",
    "firebase": "Firebase",
    "drizzle-orm": "Drizzle ORM",
}

NPM_INFRA = {
    "docker": "Docker",
}

PYTHON_BACKEND = {
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "tornado": "Tornado",
    "celery": "Celery",
    "sqlalchemy": "SQLAlchemy",
    "uvicorn": "Uvicorn",
    "gunicorn": "Gunicorn",
}

PYTHON_DATA = {
    "psycopg2": "PostgreSQL",
    "psycopg2-binary": "PostgreSQL",
    "pymongo": "MongoDB",
    "redis": "Redis",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "alembic": "Alembic",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-Learn",
}


def extract_github_repo(url: str) -> Optional[Tuple[str, str]]:
    """Extrai (owner, repo) de uma URL do GitHub, se for válida."""
    if not url or "github.com" not in url:
        return None

    clean = url.split("?")[0].split("#")[0].strip()
    match = re.search(r"github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)", clean)
    if not match:
        return None

    owner, repo = match.group(1), match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]

    # Ignora links para páginas estáticas do GitHub, assets ou repositórios reservados
    if owner.lower() in ["features", "pricing", "topics", "collections", "events"]:
        return None

    return owner, repo


def fetch_github_metadata(
    owner: str,
    repo: str,
    use_cache: bool = True,
    fetch_if_missing: bool = False,
) -> Optional[Dict[str, Any]]:
    """
    Busca metadados do repositório no GitHub via API pública, com cache local persistente em disco.
    Por padrão (fetch_if_missing=False), apenas consulta o cache local para evitar rate limits.
    """
    GITHUB_META_CACHE.mkdir(parents=True, exist_ok=True)
    cache_path = GITHUB_META_CACHE / f"{owner.lower()}_{repo.lower()}.json"

    if use_cache and cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    if not fetch_if_missing:
        return None

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    req = urllib.request.Request(api_url, headers=GITHUB_HEADERS)

    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            try:
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            except Exception:
                pass
            return data
    except urllib.error.HTTPError as e:
        if e.code in [403, 429]:
            # Rate limit do GitHub atingido: grava fallback nulo para não insistir
            return None
        return None
    except Exception:
        return None


def fetch_repo_file(owner: str, repo: str, branch: str, filepath: str, use_cache: bool = True) -> Optional[str]:
    """Obtém o conteúdo raw de um arquivo do repositório com cache local."""
    REPO_FILES_CACHE.mkdir(parents=True, exist_ok=True)
    safe_fp = filepath.replace("/", "_").replace("\\", "_")
    cache_path = REPO_FILES_CACHE / f"{owner.lower()}_{repo.lower()}_{safe_fp}"

    if use_cache and cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            pass

    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{filepath}"
    req = urllib.request.Request(raw_url, headers=GITHUB_HEADERS)

    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            content = resp.read().decode("utf-8")
            try:
                with open(cache_path, "w", encoding="utf-8") as f:
                    f.write(content)
            except Exception:
                pass
            return content
    except Exception:
        return None


def detect_stack_from_package_json(content: str) -> Dict[str, Set[str]]:
    """Analisa package.json e extrai tecnologias reais."""
    stack: Dict[str, Set[str]] = {"frontend": set(), "backend": set(), "data": set(), "infrastructure": set(), "other": set()}
    try:
        data = json.loads(content)
        deps = {}
        if isinstance(data.get("dependencies"), dict):
            deps.update(data["dependencies"])
        if isinstance(data.get("devDependencies"), dict):
            deps.update(data["devDependencies"])

        for pkg in deps.keys():
            pkg_l = pkg.lower()
            if pkg_l in NPM_FRONTEND:
                stack["frontend"].add(NPM_FRONTEND[pkg_l])
            if pkg_l in NPM_BACKEND:
                stack["backend"].add(NPM_BACKEND[pkg_l])
            if pkg_l in NPM_DATA:
                stack["data"].add(NPM_DATA[pkg_l])
            if pkg_l in NPM_INFRA:
                stack["infrastructure"].add(NPM_INFRA[pkg_l])

            if "typescript" in pkg_l:
                stack["other"].add("TypeScript")
            elif "jest" in pkg_l or "vitest" in pkg_l or "playwright" in pkg_l or "cypress" in pkg_l:
                stack["other"].add("Testing")
    except Exception:
        pass
    return stack


def detect_stack_from_python_deps(content: str) -> Dict[str, Set[str]]:
    """Analisa requirements.txt ou pyproject.toml."""
    stack: Dict[str, Set[str]] = {"frontend": set(), "backend": set(), "data": set(), "infrastructure": set(), "other": set()}
    lines = content.splitlines()
    for line in lines:
        clean = line.strip().split("==")[0].split(">=")[0].split("<=")[0].split("~=")[0].strip().lower()
        if clean in PYTHON_BACKEND:
            stack["backend"].add(PYTHON_BACKEND[clean])
        if clean in PYTHON_DATA:
            stack["data"].add(PYTHON_DATA[clean])
        if clean in ["docker", "ansible"]:
            stack["infrastructure"].add(clean.title())
        if clean in ["pytest", "unittest"]:
            stack["other"].add("Testing")
    return stack


def detect_stack_from_docker(content: str) -> Dict[str, Set[str]]:
    """Analisa Dockerfile ou docker-compose.yml."""
    stack: Dict[str, Set[str]] = {"frontend": set(), "backend": set(), "data": set(), "infrastructure": set(), "other": set()}
    stack["infrastructure"].add("Docker")

    content_lower = content.lower()
    if "nginx" in content_lower:
        stack["infrastructure"].add("Nginx")
    if "postgres" in content_lower:
        stack["data"].add("PostgreSQL")
    if "redis" in content_lower:
        stack["data"].add("Redis")
    if "mysql" in content_lower:
        stack["data"].add("MySQL")
    if "mongo" in content_lower:
        stack["data"].add("MongoDB")

    return stack


def detect_stack_heuristics(
    languages: List[str],
    category: str,
    tags: List[str],
    title: str,
) -> Dict[str, List[str]]:
    """
    Classificação determinística da stack a partir de linguagens, categorias e tags já conhecidas.
    Sem inventar nada, apenas organiza os termos reais.
    """
    frontend: Set[str] = set()
    backend: Set[str] = set()
    data: Set[str] = set()
    infrastructure: Set[str] = set()
    other: Set[str] = set()

    cat_l = category.lower()
    title_l = title.lower()
    combined_text = f"{cat_l} {title_l} {' '.join(tags).lower()}"

    # Classificação de Linguagens
    for lang in languages:
        l_clean = lang.strip()
        l_lower = l_clean.lower()

        if l_lower in ["javascript", "typescript"]:
            if any(term in combined_text for term in ["react", "vue", "frontend", "front-end", "ui", "web", "css", "html", "browser"]):
                frontend.add(l_clean)
            elif any(term in combined_text for term in ["node", "express", "backend", "server", "api"]):
                backend.add(l_clean)
            else:
                backend.add(l_clean)
        elif l_lower in ["html", "css", "sass", "scss"]:
            frontend.add(l_clean)
        elif l_lower in ["python", "go", "golang", "rust", "java", "kotlin", "c#", "csharp", "ruby", "php", "elixir", "scala", "clojure", "erlang"]:
            backend.add(l_clean)
        elif l_lower in ["c", "c++", "cpp", "zig", "assembly", "wasm", "webassembly"]:
            other.add(l_clean)
        elif l_lower in ["sql"]:
            data.add("SQL")
        elif l_lower in ["shell", "bash", "powershell"]:
            infrastructure.add("Shell / CLI")
        else:
            other.add(l_clean)

    # Tecnologias identificáveis pela Categoria ou Título
    if any(k in combined_text for k in ["docker", "container"]):
        infrastructure.add("Docker")
    if any(k in combined_text for k in ["git", "vcs", "version control"]):
        infrastructure.add("Git")
    if any(k in combined_text for k in ["redis", "key-value"]):
        data.add("Redis")
    if any(k in combined_text for k in ["database", "sqlite", "rdbms", "sql database"]):
        data.add("Database")
    if "react" in combined_text:
        frontend.add("React")
    if "vue" in combined_text:
        frontend.add("Vue.js")
    if "next.js" in combined_text or "nextjs" in combined_text:
        frontend.add("Next.js")
    if any(k in combined_text for k in ["neural network", "machine learning", "deep learning"]):
        data.add("Machine Learning")
    if any(k in combined_text for k in ["blockchain", "bitcoin", "cryptocurrency"]):
        other.add("Blockchain")
    if any(k in combined_text for k in ["compiler", "interpreter", "parser"]):
        other.add("Compiler / Interpreter")
    if any(k in combined_text for k in ["operating system", "os", "kernel"]):
        other.add("Operating System")
    if any(k in combined_text for k in ["web server", "http server"]):
        infrastructure.add("HTTP / Web Server")
    if any(k in combined_text for k in ["bittorrent", "torrent", "p2p"]):
        other.add("P2P / BitTorrent")
    if any(k in combined_text for k in ["game", "raytracer", "3d renderer", "graphics"]):
        other.add("Graphics / 3D")

    result: Dict[str, List[str]] = {}
    if frontend:
        result["frontend"] = sorted(list(frontend))
    if backend:
        result["backend"] = sorted(list(backend))
    if data:
        result["data"] = sorted(list(data))
    if infrastructure:
        result["infrastructure"] = sorted(list(infrastructure))
    if other:
        result["other"] = sorted(list(other))

    return result


def determine_status(
    github_meta: Optional[Dict[str, Any]],
    source_id: str,
    tags: List[str],
) -> str:
    """
    Determina o status do projeto de forma 100% determinística.
    Valores possíveis: active, development, study, experimental, archived.
    """
    # 1. Se o repositório estiver arquivado no GitHub
    if github_meta and github_meta.get("archived"):
        return "archived"

    # 2. Se possuir tag explícita
    tag_set = {t.lower() for t in tags}
    if "archived" in tag_set:
        return "archived"
    if "experimental" in tag_set:
        return "experimental"

    # 3. Se for de fontes conhecidas de guias e estudos práticos
    if source_id in ["build-your-own-x", "codecrafters-io/build-your-own-x", "ebookfoundation-free-programming-books"]:
        return "study"

    # 4. Se tiver metadados do GitHub sobre atualização
    if github_meta:
        pushed_at = github_meta.get("pushed_at") or github_meta.get("updated_at")
        if pushed_at:
            try:
                # Compara com a data atual
                dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                days_ago = (now - dt).days
                if days_ago <= 180:
                    return "active"
                elif days_ago <= 365 * 2:
                    return "development"
                else:
                    return "study"
            except Exception:
                pass

    return "study"


def enrich_project(
    project: Dict[str, Any],
    source_info: Optional[Dict[str, Any]] = None,
    fetch_remote_meta: bool = False,
) -> Dict[str, Any]:
    """
    Enriquece um projeto existente com metadados estruturados, stack tecnológica e status determinístico.
    Preserva todos os campos existentes.
    """
    languages = project.get("languages", [])
    primary_lang = languages[0] if languages else None
    tags = project.get("tags", [])
    category = project.get("category", "")
    title = project.get("name", "")
    source_id = project.get("source", {}).get("id", "")

    # Tenta extrair owner/repo do GitHub
    gh_url = project.get("github_url") or project.get("original_url") or ""
    repo_pair = extract_github_repo(gh_url)

    github_meta = None
    if repo_pair:
        owner, repo = repo_pair
        github_meta = fetch_github_metadata(owner, repo, fetch_if_missing=fetch_remote_meta)

    # Se não temos github_meta do projeto mas a fonte é um repositório GitHub
    if not github_meta and source_info:
        s_owner = source_info.get("owner")
        s_repo = source_info.get("repository")
        if s_owner and s_repo:
            github_meta = fetch_github_metadata(s_owner, s_repo, fetch_if_missing=fetch_remote_meta)

    # 1. Monta Tech Stack
    tech_stack = detect_stack_heuristics(languages, category, tags, title)

    # 2. Status do projeto
    status = determine_status(github_meta, source_id, tags)

    # 3. Metadados reais
    metadata: Dict[str, Any] = {
        "status": status,
        "has_readme": bool(project.get("markdown_content")),
    }

    if primary_lang:
        metadata["primary_language"] = primary_lang
    if languages:
        metadata["languages"] = languages
    if tags:
        metadata["topics"] = tags

    if repo_pair:
        metadata["owner"] = repo_pair[0]
        metadata["repo"] = repo_pair[1]

    if github_meta:
        if github_meta.get("owner", {}).get("login"):
            metadata["owner"] = github_meta["owner"]["login"]
        if github_meta.get("name"):
            metadata["repo"] = github_meta["name"]
        if github_meta.get("default_branch"):
            metadata["default_branch"] = github_meta["default_branch"]
        if github_meta.get("language") and not primary_lang:
            metadata["primary_language"] = github_meta["language"]
        if github_meta.get("topics"):
            existing_topics = set(metadata.get("topics", []))
            existing_topics.update(github_meta["topics"])
            metadata["topics"] = sorted(list(existing_topics))
        if github_meta.get("license"):
            lic = github_meta["license"]
            metadata["license"] = lic.get("spdx_id") or lic.get("name")
        if "stargazers_count" in github_meta:
            metadata["stars"] = github_meta["stargazers_count"]
        if "forks_count" in github_meta:
            metadata["forks"] = github_meta["forks_count"]
        if "open_issues_count" in github_meta:
            metadata["open_issues"] = github_meta["open_issues_count"]
        if "size" in github_meta:
            metadata["size_kb"] = github_meta["size"]
        if github_meta.get("pushed_at") or github_meta.get("updated_at"):
            metadata["last_updated"] = github_meta.get("pushed_at") or github_meta.get("updated_at")
        if github_meta.get("created_at"):
            metadata["created_at"] = github_meta["created_at"]

    # Adiciona ao projeto sem apagar dados anteriores
    project["tech_stack"] = tech_stack
    project["status"] = status
    project["metadata"] = metadata

    return project
