"""
Módulo de tradução e enriquecimento textual (translator.py).
Traduz descrições e títulos para português com cache em disco e processamento em lote.
Opera com custo zero e sem necessidade de chaves de API pagas.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List

CACHE_FILE = Path(__file__).resolve().parent.parent.parent / ".cache" / "translations.json"

_memory_cache: Dict[str, str] = {}
_cache_loaded = False


def _load_cache() -> None:
    global _memory_cache, _cache_loaded
    if _cache_loaded:
        return
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    _memory_cache.update(data)
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


def translate_text(text: str, target_lang: str = "pt") -> str:
    """Traduz um texto individual utilizando cache local."""
    cleaned = text.strip()
    if not cleaned or len(cleaned) < 3:
        return cleaned

    _load_cache()
    if cleaned in _memory_cache:
        return _memory_cache[cleaned]

    results = translate_batch([cleaned], target_lang=target_lang)
    return results[0] if results else cleaned


def translate_batch(texts: List[str], target_lang: str = "pt", batch_size: int = 25) -> List[str]:
    """
    Traduz uma lista de textos em lotes otimizados, utilizando cache em disco.
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
        if t in _memory_cache:
            results[idx] = _memory_cache[t]
        else:
            to_fetch_indices.append(idx)
            to_fetch_texts.append(t)

    if not to_fetch_texts:
        return results

    # Processa em lotes de batch_size
    for i in range(0, len(to_fetch_texts), batch_size):
        chunk_texts = to_fetch_texts[i : i + batch_size]
        chunk_indices = to_fetch_indices[i : i + batch_size]

        delimiter = "\n\n"
        combined = delimiter.join(chunk_texts)

        try:
            url = (
                "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl="
                + target_lang
                + "&dt=t&q="
                + urllib.parse.quote(combined)
            )
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                translated_combined = "".join([part[0] for part in data[0] if part[0]])
                parts = [p.strip() for p in translated_combined.split(delimiter) if p.strip()]

                # Se a divisão coincidir com o número de itens enviados
                if len(parts) == len(chunk_texts):
                    for orig, trans, idx in zip(chunk_texts, parts, chunk_indices):
                        _memory_cache[orig] = trans
                        results[idx] = trans
                else:
                    # Fallback individual caso o delimitador tenha sido corrompido
                    for orig, idx in zip(chunk_texts, chunk_indices):
                        single_trans = _translate_single_remote(orig, target_lang)
                        _memory_cache[orig] = single_trans
                        results[idx] = single_trans

        except Exception as e:
            # Em caso de falha de conexão ou timeout, mantém o texto original
            for orig, idx in zip(chunk_texts, chunk_indices):
                _memory_cache[orig] = orig
                results[idx] = orig

    _save_cache()
    return results


def _translate_single_remote(text: str, target_lang: str = "pt") -> str:
    """Traduz uma única string remotamente com fallback para o original."""
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl="
            + target_lang
            + "&dt=t&q="
            + urllib.parse.quote(text)
        )
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return "".join([part[0] for part in data[0] if part[0]]).strip()
    except Exception:
        return text
