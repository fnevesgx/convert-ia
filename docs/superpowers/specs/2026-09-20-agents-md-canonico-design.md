# Design: AGENTS.md canônico, CLAUDE.md como import

**Data:** 2026-09-20  
**Status:** aprovado (contratos/docs/skills)  
**Escopo desta entrega:** movimentação de conteúdo entre os dois arquivos de convenção, referências cruzadas e README. **Nenhuma** regra de convenção mudou.

## Problema

O `README.md` afirmava que `CLAUDE.md` era "idêntico a `AGENTS.md`". Não era: o `AGENTS.md` estava sem a linha da fotografia do banco no princípio 2, perdida na entrega de 2026-08-03. A entrega de 2026-09-19 precisou ser aplicada manualmente nos dois arquivos — segunda vez que a duplicação cobrou pedágio.

O que torna o drift perigoso é a regra de precedência do Claude Code:

| Repositório tem | Claude lê |
|---|---|
| `AGENTS.md`, sem `CLAUDE.md` | `AGENTS.md` |
| `AGENTS.md` **e** `CLAUDE.md` | **só `CLAUDE.md`** |
| `CLAUDE.md` que importa `AGENTS.md` | `CLAUDE.md` + `AGENTS.md` via import |

O bootstrap copia os dois arquivos, então todo projeto alvo cai na linha do meio: o Claude Code lê o arquivo completo e ignora o `AGENTS.md`. O drift degradava silenciosamente só quem usa **Cursor, Codex e outros agentes** — exatamente o público que o `AGENTS.md` existe para servir. Ninguém percebia porque quem mantém o framework usa Claude Code.

## Decisão

1. **`AGENTS.md` é a fonte canônica.** Recebeu o conteúdo íntegro do `CLAUDE.md`, com o parágrafo de abertura reescrito para explicar a estrutura.
2. **`CLAUDE.md` contém uma linha:** `@AGENTS.md`. Zero conteúdo duplicável, portanto zero drift possível.
3. **Referências cruzadas apontam para `AGENTS.md`** (20 ocorrências de "princípio N do CLAUDE.md" em schemas, docs, skills e no gate de CI). Onde o texto já citava os dois arquivos juntos (`CLAUDE.md`/`AGENTS.md`), ficou como estava — continua correto.

## Por que não apagar o CLAUDE.md

O Claude Code lê `AGENTS.md` nativamente quando não existe `CLAUDE.md`, o que tornaria um arquivo só suficiente — **exceto** nos ambientes em que esse suporte não está disponível: Amazon Bedrock e outros provedores terceiros, versões anteriores à 2.1.277, `disableAllHooks`/`allowManagedHooksOnly`, plugin `agents-md` desabilitado. Boa parte dos clientes do framework é corporativa e cai justamente nesses casos. O `CLAUDE.md` com o import é o que garante a entrega das convenções lá.

## Regras inegociáveis

- **Editar o `AGENTS.md`, nunca o `CLAUDE.md`.** Qualquer conteúdo escrito no `CLAUDE.md` passa a ser invisível para as outras ferramentas e reabre o buraco que esta entrega fechou.
- **Não "simplificar" removendo o `CLAUDE.md`** — ver a seção acima.
- **Não reintroduzir cópia do conteúdo** no `CLAUDE.md` "para conveniência".

## Contratos alterados

- `AGENTS.md` — conteúdo canônico (era cópia defasada)
- `CLAUDE.md` — reduzido a `@AGENTS.md`
- `README.md` — afirmação de identidade removida; bloco "Estrutura" e Status atualizados
- Referências: `docs/levantamento/schemas/{decisoes,matriz-cruzamento,inventario-fontes,fotografia-banco}`, `docs/levantamento/{estrategia-crawl,estrategia-fotografia-banco}.md`, `docs/levantamento/exemplos/fotografia-banco.exemplo.json`, `docs/specs/{criterios-arquitetura.md,exemplos/CONV-0001.md}`, `.claude/skills/{orientador,db-snapshot}`, `.github/workflows/gate-migration-destrutiva.yml`

## Fora de escopo

- `bin/convert-ia.js` — já copia os dois arquivos; nenhuma mudança de código necessária.
- Alterar qualquer regra de convenção: esta entrega move conteúdo, não muda contrato.
