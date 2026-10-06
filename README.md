# GitHub Knowledge Wiki

Aplicação web pessoal de conhecimento técnico alimentada diretamente por repositórios públicos do GitHub.

---

## Princípio Arquitetural

> **O GitHub é a fonte de verdade.**
> A aplicação é uma camada pura de ingestão + organização + apresentação.

```text
                    GITHUB
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   Build Your Own X   Repo B      Repo C
          │            │            │
          └────────────┼────────────┘
                       ▼
                    PYTHON
                       │
              ┌────────┴────────┐
              │                 │
           Fetcher            Parser
              │                 │
              └────────┬────────┘
                       ▼
                  Normalizer
                       │
                       ▼
                 JSON / Markdown
                       │
                       ▼
                    NEXT.JS
                       │
                       ▼
                    VERCEL
```

- **Sem banco de dados** (sem PostgreSQL, MySQL, SQLite, MongoDB).
- **Sem BaaS / PaaS pagos** (sem Firebase, Supabase, Redis).
- **Sem serviços de IA**.
- **Sem backend persistente**.
- **Custo zero de operação**.

---

## Estrutura do Projeto

```text
github-knowledge-wiki/
├── data/
│   ├── sources.json          # Catálogo declarativo de fontes GitHub
│   ├── projects.json         # Acervo completo de projetos normalizados
│   ├── categories.json       # Índice consolidado de categorias e tecnologias
│   └── stats.json            # Métricas e contadores globais
├── scripts/
│   └── wiki/
│       ├── __init__.py
│       ├── sources.py        # Validação do catálogo sources.json
│       ├── fetcher.py        # Download de arquivos raw do GitHub
│       ├── parser.py         # Interpretador de Markdown e estruturas
│       ├── normalizer.py     # Conversor para o modelo canônico de dados
│       ├── generator.py      # Gerador de arquivos consumidos pelo frontend
│       └── sync.py           # CLI de sincronização com detecção de mudanças
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Layout raiz com tema técnico e rodapé
│   │   ├── page.tsx          # Página inicial com métricas e destaques
│   │   ├── sources/          # Listagem de repositórios conectados
│   │   ├── categories/       # Navegação por categorias e rotas dinâmicas [slug]
│   │   └── projects/         # Listagem geral, busca client-side e [id] do projeto
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx     # Filtros instantâneos por texto, categoria e linguagem
│   │   ├── ProjectCard.tsx
│   │   └── CategoryCard.tsx
│   ├── lib/
│   │   └── wiki.ts           # Utilitários tipados de consulta aos arquivos estáticos
│   └── types/
│       └── wiki.ts           # Definições de tipos TypeScript
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Como Adicionar Novas Fontes

Para adicionar um novo repositório, basta incluir uma entrada no catálogo `data/sources.json`:

```json
{
  "sources": [
    {
      "name": "Build Your Own X",
      "owner": "codecrafters-io",
      "repository": "build-your-own-x",
      "branch": "master",
      "enabled": true
    }
  ]
}
```

E rodar o comando de sincronização:

```bash
python -m scripts.wiki.sync
```

O ingestion engine processará a nova fonte e atualizará a wiki automaticamente sem requerer nenhuma alteração no código do frontend.

---

## Execução Local

### Pré-requisitos
- Node.js 18+ (ou 20+)
- Python 3.10+

### 1. Ingestão e Sincronização dos Dados
```bash
python -m scripts.wiki.sync
```

### 2. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

### 3. Build de Produção (SSG)
```bash
npm run build
```

---

## Deploy na Vercel

1. Suba o repositório para o seu GitHub:
   ```bash
   git add .
   git commit -m "feat: initial commit of GitHub Knowledge Wiki"
   git push origin main
   ```
2. Importe o repositório no dashboard da [Vercel](https://vercel.com).
3. O build (`next build`) gerará todas as páginas estáticas pré-renderizadas com custo zero e performance máxima.
