# convert.ia — contratos de artefato da fase de levantamento

Quatro artefatos: **catálogo de telas** (saída do crawler / evidência de UI), **inventário de fontes** (saída da leitura de código), **fotografia do banco** (saída de introspecção do schema físico real — opcional/exceção, complementa o inventário), **matriz de cruzamento** (saída do backlog, consumindo catálogo + inventário). Os três primeiros rodam em paralelo; a matriz depende de catálogo e inventário. A fotografia cruza com o inventário pelo nome da tabela e alimenta principalmente a seção 7 ("Dados") da spec.

Princípio: o **código legado** é a verdade das regras. O catálogo descreve a superfície navegável; os testes do sistema novo nascem das **regras extraídas** (inventário → seção 6 da spec), não de replay ao vivo obrigatório. `casos_replay` no schema é **opcional/exceção**.

**Descrições de controles (opção C):** preservar Description/Caption do fonte **e** o rótulo visto na UI. Inventário: `controles[]` por objeto (`nome`, `descricao` obrigatórios). Catálogo rico (estágio 4): em `campos`/`acoes`, `rotulo_ui` obrigatório e `nome_fonte` opcional; colunas de grid entram como campos com `tipo: "grid_column"`. Fonte manda; UI é evidência; **nunca inventar** `descricao` nem `rotulo_ui`. Na spec (seção 2), divergência = `sim` quando ambos existem e diferem após normalizar espaços/case.

Caminho operacional do crawl — descoberta de menu → score → backlog → cruzamento com critério de granularidade → (opcional) detalhe de UI/replay — em [`estrategia-crawl.md`](./estrategia-crawl.md). Skill: [`.claude/skills/screen-crawler/`](../../.claude/skills/screen-crawler/SKILL.md).

> **Ambiente:** nunca produção. Identidade na UI (rodapé/banner/build) antes de escrita — não só hostname.

## Arquivos

- [`estrategia-crawl.md`](./estrategia-crawl.md) — estágios do crawl e critério de parada do fecho.
- [`notas-genexus.md`](./notas-genexus.md) — checklist KB/branch/src para legado GeneXus.
- [`schemas/catalogo-telas.schema.json`](./schemas/catalogo-telas.schema.json) — schema do catálogo; `rotulo_ui`/`nome_fonte` em campos/ações; `casos_replay` opcional.
- [`schemas/inventario-fontes.schema.json`](./schemas/inventario-fontes.schema.json) — inventário; `controles[]`; regras com id estável (`RN-xxxx`).
- [`estrategia-fotografia-banco.md`](./estrategia-fotografia-banco.md) — captura do schema físico real por introspecção (opcional/exceção); cruza com `inventario-fontes.objetos[].tabelas[]`.
- [`schemas/fotografia-banco.schema.json`](./schemas/fotografia-banco.schema.json) — fotografia do banco; colunas, FKs, índices, triggers, convenções observadas.
- [`schemas/decisoes.schema.json`](./schemas/decisoes.schema.json) — registry das decisões tipadas do framework (confiança de vínculo, granularidade, triagem, decisão de regra, classificação de divergência); `valor` + `score` opcional + `evidencia` + `decidido_por`.
- [`schemas/matriz-cruzamento.schema.json`](./schemas/matriz-cruzamento.schema.json) — equivalente máquina da matriz; `threshold_confianca` e `confianca` por vínculo.
- [`exemplos/catalogo-telas.exemplo.json`](./exemplos/catalogo-telas.exemplo.json) — documento completo válido (inclui replay só como exemplo de exceção).
- [`exemplos/inventario-fontes.exemplo.json`](./exemplos/inventario-fontes.exemplo.json) — inventário preenchido (com `controles`).
- [`exemplos/fotografia-banco.exemplo.json`](./exemplos/fotografia-banco.exemplo.json) — fotografia preenchida, cruzando com o exemplo do inventário (`PEDIDO`, `PEDIDOITEM`, `FATURA`).
- [`exemplos/matriz-cruzamento.exemplo.md`](./exemplos/matriz-cruzamento.exemplo.md) — matriz → spec exemplo [`CONV-0001`](../specs/exemplos/CONV-0001.md).
- [`exemplos/matriz-cruzamento.exemplo.json`](./exemplos/matriz-cruzamento.exemplo.json) — mesma matriz na forma máquina, com scores e threshold.
- Design: [`docs/superpowers/specs/2026-08-03-descricao-controles-design.md`](../superpowers/specs/2026-08-03-descricao-controles-design.md) (descrição de controles) e [`2026-09-19-decisoes-tipadas-design.md`](../superpowers/specs/2026-09-19-decisoes-tipadas-design.md) (decisões tipadas e confiança).

## Matriz de cruzamento (saída do backlog)

Uma linha por vínculo tela↔objeto confirmado **que merece item de backlog**, mais órfãos dos dois lados. Não uma linha por nó do fecho transitivo — ver granularidade em [`estrategia-crawl.md`](./estrategia-crawl.md).

A coluna `Confiança` usa o enum de [`decisoes.schema.json`](./schemas/decisoes.schema.json) (`exato` · `normalizado` · `ambiguo` · `nao_encontrado`); o score entre parênteses é opcional e só aparece quando a decisão foi calibrada.

| Tela (id) | Objeto (id) | Regras (ids) | Status | Confiança | Observação |
|---|---|---|---|---|---|
| TEL-0032 | OBJ-0014 | RN-01, RN-02 | confirmado | exato (0.97) | — |
| TEL-0033 | OBJ-0015 | RN-03 | a confirmar | ambiguo (0.41) | programa_provavel não bate com o fluxo observado |

**Threshold de escalonamento.** Vínculo com score abaixo de `threshold_confianca` (default do framework: **0.85**) vai a checkpoint humano antes de virar spec. O projeto pode sobrescrever o valor — e então precisa registrá-lo no artefato, para a revisão saber qual corte foi aplicado. Vínculo **sem** score também cai no checkpoint: ausência de calibração não promove nada. O score **ordena** o que o humano olha primeiro (mais ambíguo no topo); não substitui gate nenhum — `descartar`, identidade de ambiente, migration destrutiva e lote de specs continuam decisões humanas qualquer que seja o número.

**Órfãos — telas sem objeto claro**

| Tela (id) | Hipótese | Ação sugerida | Confiança |
|---|---|---|---|
| TEL-0041 | tela gerada por wrapper genérico | investigar antes do refinamento | nao_encontrado (0.22) |

**Órfãos — objetos sem tela (candidatos a job/batch/dead code)**

| Objeto (id) | Gatilho observado | Ação sugerida |
|---|---|---|
| OBJ-0022 | job (nome na KB sugere rotina noturna) | confirmar com área usuária; se sem uso, candidato a `descartar` |
| OBJ-0031 | desconhecido | maior risco — investigar antes de descartar |

## Como isso alimenta as próximas fases

- Linha confirmada → frontmatter da spec ([completa](../specs/template.md) ou [leve](../specs/template-leve.md)) via [`spec-generator`](../../.claude/skills/spec-generator/SKILL.md), após checkpoint de granularidade.
- `controles[]` (inventário) × `rotulo_ui`/`nome_fonte` (catálogo) → tabela de controles na **seção 2** da spec (`Nome técnico | Descrição (fonte) | Rótulo UI | Tipo | Divergência`).
- `regras_extraidas` → seção 6 → seção 9 → testes no sistema novo ([`characterization-tester`](../../.claude/skills/characterization-tester/SKILL.md)).
- Órfãos alimentam triagem (seção 4) quando virarem spec.
- Fotografia do banco (`colunas`, `chaves_estrangeiras`, `gatilhos`, `convencoes_observadas`) → **seção 7** ("Dados") da spec: mapeamento nome legado → model novo, convenções herdadas (defaults no lugar de NULL, FK sem constraint física) e quem mais escreve na tabela durante a convivência. Ver [`estrategia-fotografia-banco.md`](./estrategia-fotografia-banco.md).
