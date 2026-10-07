"""
Testes unitários para o módulo enricher.py e enriquecimento determinístico de dados.
Executável via: python -m scripts.test_enricher
"""

import sys
from scripts.wiki.enricher import (
    extract_github_repo,
    detect_stack_heuristics,
    detect_stack_from_package_json,
    detect_stack_from_python_deps,
    detect_stack_from_docker,
    determine_status,
    enrich_project,
)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def test_extract_github_repo():
    cases = [
        ("https://github.com/torvalds/linux", ("torvalds", "linux")),
        ("https://github.com/codecrafters-io/build-your-own-x.git", ("codecrafters-io", "build-your-own-x")),
        ("https://github.com/avelino/awesome-go/blob/main/README.md", ("avelino", "awesome-go")),
        ("https://example.com/not-github", None),
        ("https://github.com/features/actions", None),
    ]
    for url, expected in cases:
        result = extract_github_repo(url)
        assert result == expected, f"Falha para {url}: esperado {expected}, obteve {result}"
    print("✓ Teste de extração de repositório GitHub passou com sucesso!")


def test_detect_stack_heuristics():
    # Caso 1: Python + Redis + Database
    stack1 = detect_stack_heuristics(
        languages=["Python"],
        category="Database",
        tags=["tutorial"],
        title="Build Your Own Redis",
    )
    assert "Python" in stack1.get("backend", [])
    assert "Redis" in stack1.get("data", [])
    assert "Database" in stack1.get("data", [])

    # Caso 2: TypeScript + React + Docker
    stack2 = detect_stack_heuristics(
        languages=["TypeScript"],
        category="Frontend",
        tags=["docker", "container"],
        title="React Dashboard with Docker",
    )
    assert "TypeScript" in stack2.get("frontend", []) or "TypeScript" in stack2.get("backend", [])
    assert "React" in stack2.get("frontend", [])
    assert "Docker" in stack2.get("infrastructure", [])

    print("✓ Teste de detecção heurística determinística de stack passou com sucesso!")


def test_detect_stack_from_package_json():
    pkg_json = """
    {
      "dependencies": {
        "next": "14.2.0",
        "react": "18.3.0",
        "tailwindcss": "3.4.0",
        "@prisma/client": "5.0.0"
      },
      "devDependencies": {
        "typescript": "5.0.0"
      }
    }
    """
    stack = detect_stack_from_package_json(pkg_json)
    assert "Next.js" in stack["frontend"]
    assert "React" in stack["frontend"]
    assert "Tailwind CSS" in stack["frontend"]
    assert "Prisma" in stack["data"]
    assert "TypeScript" in stack["other"]
    print("✓ Teste de análise de package.json passou com sucesso!")


def test_detect_stack_from_python_deps():
    req_txt = """
    fastapi>=0.100.0
    uvicorn==0.23.0
    sqlalchemy>=2.0.0
    psycopg2-binary
    redis
    pytest
    """
    stack = detect_stack_from_python_deps(req_txt)
    assert "FastAPI" in stack["backend"]
    assert "SQLAlchemy" in stack["backend"]
    assert "PostgreSQL" in stack["data"]
    assert "Redis" in stack["data"]
    assert "Testing" in stack["other"]
    print("✓ Teste de análise de requirements.txt passou com sucesso!")


def test_determine_status():
    # Caso 1: Arquivado
    st_arch = determine_status({"archived": True}, "generic", [])
    assert st_arch == "archived"

    # Caso 2: BYOX -> Study
    st_study = determine_status(None, "build-your-own-x", [])
    assert st_study == "study"

    # Caso 3: Tag experimental
    st_exp = determine_status(None, "generic", ["experimental"])
    assert st_exp == "experimental"

    print("✓ Teste de determinação determinística de status passou com sucesso!")


def test_enrich_project():
    project = {
        "id": "test-sample",
        "name": "Build Your Own Git",
        "category": "Git",
        "languages": ["Rust"],
        "tags": ["cli"],
        "original_url": "https://github.com/codecrafters-io/build-your-own-x",
        "source": {"id": "build-your-own-x", "name": "Build Your Own X"},
    }
    enriched = enrich_project(project)
    assert enriched["status"] == "study"
    assert "Rust" in enriched["tech_stack"].get("backend", []) or "Rust" in enriched["tech_stack"].get("other", [])
    assert "Git" in enriched["tech_stack"].get("infrastructure", [])
    assert enriched["metadata"]["primary_language"] == "Rust"
    assert enriched["metadata"]["owner"] == "codecrafters-io"
    assert enriched["metadata"]["repo"] == "build-your-own-x"
    print("✓ Teste de enriquecimento determinístico de projeto passou com sucesso!")


if __name__ == "__main__":
    test_extract_github_repo()
    test_detect_stack_heuristics()
    test_detect_stack_from_package_json()
    test_detect_stack_from_python_deps()
    test_determine_status()
    test_enrich_project()
    print("\nTodos os testes do enricher passaram com 100% de sucesso!")
