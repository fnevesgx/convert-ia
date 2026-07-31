# convert.ia — contratos de artefato da fase de levantamento

Três artefatos, nesta ordem: **catálogo de telas** (saída do crawler), **inventário de fontes** (saída da leitura de código), **matriz de cruzamento** (saída do backlog, consumindo os dois). Os dois primeiros rodam em paralelo; o terceiro depende de ambos.

Princípio do catálogo de telas: cada registro já nasce como *golden master* — a mesma captura que descreve a tela hoje é o caso de teste de caracterização de amanhã. Não é preciso desenhar dois artefatos.

Na prática, o catálogo rico (campos, arestas, `casos_replay`) raramente nasce no primeiro passe. O caminho operacional — descoberta de menu → score de UI → backlog priorizado → cruzamento com fontes → catálogo completo — está em [`estrategia-crawl.md`](./estrategia-crawl.md). O skill de processo: [`skills/screen-crawler/`](../../.claude/skills/screen-crawler/SKILL.md).

> **Ambiente:** o crawler nunca aponta para produção. Rode contra homologação ou um snapshot do legado — cliques em formulário viram INSERT de verdade.

## Arquivos

- [`estrategia-crawl.md`](./estrategia-crawl.md) — estágios do crawl de interface até o catálogo rico.
- [`schemas/catalogo-telas.schema.json`](./schemas/catalogo-telas.schema.json) — schema do catálogo de telas, com `casos_replay` embutido.
- [`schemas/inventario-fontes.schema.json`](./schemas/inventario-fontes.schema.json) — schema do inventário de objetos do legado; as regras extraídas carregam id estável (`RN-xxxx`), o mesmo citado na matriz e nas specs.
- [`exemplos/catalogo-telas.exemplo.json`](./exemplos/catalogo-telas.exemplo.json) — documento completo válido contra o schema, com duas telas e casos de replay.
- [`exemplos/inventario-fontes.exemplo.json`](./exemplos/inventario-fontes.exemplo.json) — inventário preenchido com os objetos que servem essas telas (e um órfão de job).
- [`exemplos/matriz-cruzamento.exemplo.md`](./exemplos/matriz-cruzamento.exemplo.md) — matriz preenchida amarrando os dois exemplos acima; a linha confirmada origina a spec de exemplo [`CONV-0001`](../specs/exemplos/CONV-0001.md).

## Matriz de cruzamento (saída do backlog)

Uma linha por vínculo tela↔objeto confirmado, mais uma seção separada de órfãos dos dois lados — é essa segunda parte que orienta a triagem (`converter` / `descartar` / candidato a item invisível).

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

- Cada linha confirmada da matriz vira um `origem.telas` + `origem.programas` no frontmatter do [item de spec](../specs/template.md).
- Cada `casos_replay` do catálogo é semente da seção 9 (**testes de caracterização**) da spec — o legado já respondeu, só falta rodar o mesmo cenário contra o sistema novo. O replay sistemático é o skill [`characterization-tester`](../../.claude/skills/characterization-tester/SKILL.md).
- Os órfãos entram na seção 4 (**decisão de triagem**) da spec correspondente, com a justificativa já meio pronta.
