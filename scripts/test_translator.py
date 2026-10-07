import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from scripts.wiki.translator import (
    protect_markdown,
    restore_markdown,
    translate_markdown,
    get_cache_key,
    translate_text
)

def test_markdown_protection():
    original = """
# Guide to Redis

Run `npm install redis` to install the client.
See the [Official Redis Documentation](https://redis.io/docs) for details.

```python
def connect_redis():
    client = redis.Redis(host="localhost", port=6379)
    return client
```

* Fast in-memory key-value store.
* High availability via Sentinel.
"""
    protected, tokens = protect_markdown(original)
    restored = restore_markdown(protected, tokens)

    assert restored == original, "Restauração de Markdown falhou!"
    assert "`npm install redis`" in restored, "Código inline foi modificado!"
    assert "https://redis.io/docs" in restored, "URL do link foi modificada!"
    assert "def connect_redis():" in restored, "Bloco de código foi modificado!"
    print("✓ Teste de proteção e restauração de Markdown passou com 100% de precisão!")

def test_cache_key():
    key = get_cache_key("Build your own Redis", "pt-BR")
    assert key.startswith("pt-BR:"), "Formato da chave de cache inválido!"
    print(f"✓ Formato da chave de cache validado: {key}")

def test_translation_preservation():
    line = "* [**Node.js**: _Building A Simple AI Chatbot_](https://example.com/bot)"
    res = translate_markdown(line)
    assert "https://example.com/bot" in res, "URL de link foi alterada durante translate_markdown!"
    assert "**Node.js**" in res, "Linguagem técnica em negrito foi alterada!"
    print("✓ Teste de tradução de Markdown com link preservou a URL perfeitamente!")

if __name__ == "__main__":
    test_markdown_protection()
    test_cache_key()
    test_translation_preservation()
    print("Todos os testes do tradutor passaram com sucesso!")
