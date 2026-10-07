"""
Módulo de tradução e localização técnica (translator.py).
Isola completamente o mecanismo de tradução e garante:
1. Separação estrita entre conteúdo original e tradução (PT-BR).
2. Preservação integral de código, URLs, imagens e estruturas Markdown.
3. Cache persistente em .cache/translations.json indexado por idioma e hash do conteúdo original.
4. Resiliência: falhas no serviço de tradução nunca interrompem o pipeline.
"""

from __future__ import annotations

import hashlib
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List, Tuple

CACHE_FILE = Path(__file__).resolve().parent.parent.parent / ".cache" / "translations.json"

# Termos técnicos consolidados que não devem ser traduzidos
TECHNICAL_TERMS_PRESERVE = {
    "node.js", "nodejs", "python", "javascript", "typescript", "golang", "go",
    "rust", "c++", "c#", "ruby", "java", "php", "docker", "kubernetes", "k8s",
    "redis", "postgres", "postgresql", "mysql", "sqlite", "mongodb", "graphql",
    "rest", "api", "apis", "sdk", "cli", "linux", "git", "github", "compiler",
    "interpreter", "ray tracing", "middleware", "middlewares", "endpoint",
    "runtime", "framework", "pull request", "commit", "branch", "repository"
}


class TranslationProvider:
    """Interface abstrata para provedores de tradução."""

    def translate_chunk(self, text_chunk: str, target_lang: str) -> str:
        raise NotImplementedError


class GoogleWebTranslationProvider(TranslationProvider):
    """
    Provedor padrão utilizando endpoint HTTP público.
    Não requer chaves pagas e opera com custo zero.
    """

    def translate_chunk(self, text_chunk: str, target_lang: str) -> str:
        # Mapeia pt-BR para pt na API
        lang_code = "pt" if "pt" in target_lang.lower() else target_lang

        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl="
            + lang_code
            + "&dt=t&q="
            + urllib.parse.quote(text_chunk)
        )
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return "".join([part[0] for part in data[0] if part[0]])


# Provedor ativo configurável
_active_provider: TranslationProvider = GoogleWebTranslationProvider()

_memory_cache: Dict[str, Dict[str, str]] = {}
_cache_loaded = False


def get_cache_key(text: str, target_lang: str = "pt-BR") -> str:
    """Gera chave de cache determinística com target_lang + sha256 do texto original."""
    clean = text.strip()
    text_hash = hashlib.sha256(clean.encode("utf-8")).hexdigest()[:16]
    return f"{target_lang}:{text_hash}"


def _load_cache() -> None:
    global _memory_cache, _cache_loaded
    if _cache_loaded:
        return

    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    for k, val in data.items():
                        if isinstance(val, dict) and "translation" in val:
                            _memory_cache[k] = val
                        elif isinstance(val, str):
                            # Migração transparente de cache legado flat
                            c_key = get_cache_key(k, "pt-BR")
                            _memory_cache[c_key] = {
                                "source": k,
                                "translation": val
                            }
        except Exception:
            pass

    _cache_loaded = True


def _save_cache() -> None:
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_memory_cache, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def protect_markdown(md_text: str) -> Tuple[str, Dict[str, str]]:
    """
    Substitui elementos técnicos intocáveis do Markdown por tokens seguros.
    Protege:
    - Code fences (``` ... ```)
    - Inline code (` ... `)
    - Imagens (![...](...))
    - URLs em links ([texto](URL)) -> protege a URL, preserva o texto para tradução
    - URLs puras (https://...)
    - Tags HTML (<...>)
    """
    tokens: Dict[str, str] = {}
    counter = 0

    def make_token(val: str, prefix: str) -> str:
        nonlocal counter
        t = f"__PROTECTED_{prefix}_{counter}__"
        counter += 1
        tokens[t] = val
        return t

    text = md_text

    # 1. Fenced code blocks ```...```
    def replace_fenced(m: re.Match) -> str:
        return make_token(m.group(0), "FENCE")
    text = re.sub(r"```[\w\-]*\n[\s\S]*?```", replace_fenced, text)

    # 2. Inline code `...`
    def replace_inline(m: re.Match) -> str:
        return make_token(m.group(0), "INLINE")
    text = re.sub(r"`[^`\n]+`", replace_inline, text)

    # 3. Imagens ![alt](url)
    def replace_image(m: re.Match) -> str:
        return make_token(m.group(0), "IMG")
    text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", replace_image, text)

    # 4. Links Markdown [text](url) -> protege apenas a URL entre parênteses
    def replace_link_url(m: re.Match) -> str:
        link_text = m.group(1)
        url = m.group(2)
        url_token = make_token(url, "URL")
        return f"[{link_text}]({url_token})"
    text = re.sub(r"\[([^\]]+)\]\(([^\s\)]+)\)", replace_link_url, text)

    # 5. Raw URLs isoladas
    def replace_raw_url(m: re.Match) -> str:
        return make_token(m.group(0), "RAWURL")
    text = re.sub(r"(?<!\(|\[)https?://[^\s\)\],]+", replace_raw_url, text)

    # 6. Tags HTML
    def replace_html(m: re.Match) -> str:
        return make_token(m.group(0), "HTML")
    text = re.sub(r"<[^>]+>", replace_html, text)

    return text, tokens


def restore_markdown(protected_text: str, tokens: Dict[str, str]) -> str:
    """Restaura todos os elementos protegidos na ordem inversa."""
    text = protected_text
    for token, original_val in reversed(list(tokens.items())):
        text = text.replace(token, original_val)
    return text


def translate_text(text: str, target_lang: str = "pt-BR") -> str:
    """Traduz uma string textual com consulta ao cache e fallback seguro."""
    cleaned = text.strip()
    if not cleaned or len(cleaned) < 2:
        return cleaned

    # Não traduz se for puramente um termo técnico isolado
    if cleaned.lower() in TECHNICAL_TERMS_PRESERVE:
        return cleaned

    _load_cache()
    key = get_cache_key(cleaned, target_lang)
    if key in _memory_cache:
        return _memory_cache[key]["translation"]

    results = translate_batch([cleaned], target_lang=target_lang)
    return results[0] if results else cleaned


def translate_batch(texts: List[str], target_lang: str = "pt-BR", batch_size: int = 25) -> List[str]:
    """
    Traduz uma lista de textos em lotes com cache em disco e tolerância a falhas.
    Se o tradutor falhar, retorna o texto original intacto.
    """
    _load_cache()

    results: List[str] = [""] * len(texts)
    to_fetch_indices: List[int] = []
    to_fetch_texts: List[str] = []

    for idx, raw_t in enumerate(texts):
        t = raw_t.strip()
        if not t:
            results[idx] = ""
            continue

        # Termos técnicos conhecidos permanecem inalterados
        if t.lower() in TECHNICAL_TERMS_PRESERVE:
            results[idx] = t
            continue

        key = get_cache_key(t, target_lang)
        if key in _memory_cache:
            results[idx] = _memory_cache[key]["translation"]
        else:
            to_fetch_indices.append(idx)
            to_fetch_texts.append(t)

    if not to_fetch_texts:
        return results

    # Processamento em lotes com delimitador preservado
    for i in range(0, len(to_fetch_texts), batch_size):
        chunk_texts = to_fetch_texts[i : i + batch_size]
        chunk_indices = to_fetch_indices[i : i + batch_size]

        delimiter = "\n\n"
        combined = delimiter.join(chunk_texts)

        try:
            translated_combined = _active_provider.translate_chunk(combined, target_lang)
            parts = [p.strip() for p in translated_combined.split(delimiter) if p.strip()]

            if len(parts) == len(chunk_texts):
                for orig, trans, idx in zip(chunk_texts, parts, chunk_indices):
                    key = get_cache_key(orig, target_lang)
                    _memory_cache[key] = {"source": orig, "translation": trans}
                    results[idx] = trans
            else:
                # Fallback por item em caso de desalinhamento do delimitador
                for orig, idx in zip(chunk_texts, chunk_indices):
                    try:
                        single_trans = _active_provider.translate_chunk(orig, target_lang).strip()
                        key = get_cache_key(orig, target_lang)
                        _memory_cache[key] = {"source": orig, "translation": single_trans}
                        results[idx] = single_trans
                    except Exception:
                        results[idx] = orig
        except Exception:
            # Fallback seguro: se o provedor falhar, preserva os textos originais
            for orig, idx in zip(chunk_texts, chunk_indices):
                results[idx] = orig

    _save_cache()
    return results


def translate_markdown(markdown_text: str, target_lang: str = "pt-BR") -> str:
    """
    Traduz conteúdo Markdown preservando blocos de código, código inline, URLs e tabelas.
    """
    if not markdown_text or not markdown_text.strip():
        return markdown_text

    protected, tokens = protect_markdown(markdown_text)

    # Traduz o texto com os tokens protegidos
    translated_protected = translate_text(protected, target_lang=target_lang)

    # Restaura todos os blocos de código, URLs e elementos intocáveis
    return restore_markdown(translated_protected, tokens)
