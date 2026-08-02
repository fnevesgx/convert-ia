# convert.ia — contratos de artefato da fase de levantamento

Três artefatos, nesta ordem: **catálogo de telas** (saída do crawler / evidência de UI), **inventário de fontes** (saída da leitura de código), **matriz de cruzamento** (saída do backlog, consumindo os dois). Os dois primeiros rodam em paralelo; o terceiro depende de ambos.

Princípio: o **código legado** é a verdade das regras. O catálogo descreve a superfície navegável; os testes do sistema novo nascem das **regras extraídas** (inventário → seção 6 da spec), não de replay ao vivo obrigatório. `casos_replay` no schema é **opcional/exceção**.

Caminho operacional do crawl — descoberta de menu → score → backlog → cruzamento com critério de granularidade → (opcional) detalhe de UI/replay — em [`estrategia-crawl.md`](./estrategia-crawl.md). Skill: [`.claude/skills/screen-crawler/`](../../.claude/skills/screen-crawler/SKILL.md).

> **Ambiente:** nunca produção. Identidade na UI (rodapé/banner/build) antes de escrita — não só hostname.

## Arquivos

- [`estrategia-crawl.md`](./estrategia-crawl.md) — estágios do crawl e critério de parada do fecho.
- [`notas-genexus.md`](./notas-genexus.md) — checklist KB/branch/src para legado GeneXus.
- [`schemas/catalogo-telas.schema.json`](./schemas/catalogo-telas.schema.json) — schema do catálogo; `casos_replay` opcional.
- [`schemas/inventario-fontes.schema.json`](./schemas/inventario-fontes.schema.json) — inventário; regras com id estável (`RN-xxxx`).
- [`exemplos/catalogo-telas.exemplo.json`](./exemplos/catalogo-telas.exemplo.json) — documento completo válido (inclui replay só como exemplo de exceção).
- [`exemplos/inventario-fontes.exemplo.json`](./exemplos/inventario-fontes.exemplo.json) — inventário preenchido.
- [`exemplos/matriz-cruzamento.exemplo.md`](./exemplos/matriz-cruzamento.exemplo.md) — matriz → spec exemplo [`CONV-0001`](../specs/exemplos/CONV-0001.md).

## Matriz de cruzamento (saída do backlog)

Uma linha por vínculo tela↔objeto confirmado **que merece item de backlog**, mais órfãos dos dois lados. Não uma linha por nó do fecho transitivo — ver granularidade em [`estrategia-crawl.md`](./estrategia-crawl.md).

| Tela (id) | Objeto (id) | Regras (ids) | Status | Observação |
|---|---|---|---|---|
| TEL-0032 | OBJ-0014 | RN-01, RN-02 | confirmado | — |
| TEL-0033 | OBJ-0015 | RN-03 | a confirmar | programa_provavel não bate com o fluxo observado |

**Órfãos — telas sem objeto claro**

| Tela (id) | Hipótese | Ação sugerida |
|---|---|---|
| TEL-0041 | tela gerada por wrapper genérico | investigar antes do refinamento |

**Órfãos — objetos sem tela (candidatos a job/batch/dead code)**

| Objeto (id) | Gatilho observado | Ação sugerida |
|---|---|---|
| OBJ-0022 | job (nome na KB sugere rotina noturna) | confirmar com área usuária; se sem uso, candidato a `descartar` |
| OBJ-0031 | desconhecido | maior risco — investigar antes de descartar |

## Como isso alimenta as próximas fases

- Linha confirmada → frontmatter da spec ([completa](../specs/template.md) ou [leve](../specs/template-leve.md)) via [`spec-generator`](../../.claude/skills/spec-generator/SKILL.md), após checkpoint de granularidade.
- `regras_extraidas` → seção 6 → seção 9 → testes no sistema novo ([`characterization-tester`](../../.claude/skills/characterization-tester/SKILL.md)).
- Órfãos alimentam triagem (seção 4) quando virarem spec.
