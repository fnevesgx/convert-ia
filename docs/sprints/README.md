# convert.ia — contrato de artefato da fase de sprints

Ponte entre a baseline aprovada ([`docs/cronograma/`](../cronograma/README.md)) e o ciclo de execução (diagrama 2 em [`docs/diagramas/README.md`](../diagramas/README.md): dev → code review → QA → deploy). É o primeiro artefato do framework que vive **fora do repo** — GitHub Issues ou Jira — então o contrato aqui é o mapeamento semântico e o gate, não um dado local vivo.

## Gate

Nenhuma issue/ticket é criado para uma spec com `status` diferente de `aprovado`. A aprovação de cronograma (seção 3 de [`docs/cronograma/README.md`](../cronograma/README.md)) é o portão que libera esta fase — sem aprovação, nenhum item vira sprint.

## Princípio: a partir daqui, o tracker manda

O frontmatter `status` da spec **congela em `aprovado`** quando a issue/ticket é aberto. Da abertura até o fechamento (`em-dev`, `em-qa`), a fonte de verdade passa a ser o tracker — board, labels, workflow — não o arquivo da spec. O valor só volta pro frontmatter no fechamento do item (seção 11 da spec, junto com `realizado_h`).

Essa é uma escolha deliberada de simplicidade: nada de webhook ou sincronismo ao vivo entre tracker e git. O custo é que a spec, olhada isoladamente durante a execução, mostra um status desatualizado (`aprovado` mesmo com o item em QA) — isso é esperado; quem quer status ao vivo olha o tracker, não o repo.

## Mapeamento semântico

| Conceito | Spec (frontmatter) | GitHub Issues | Jira |
|---|---|---|---|
| Identificador de rastreio | `id` (`CONV-XXXX`) | prefixo no título (`[CONV-0001] ...`) + corpo linkando o path da spec | campo customizado `spec_id` (ou label) + descrição linkando o path da spec |
| Sprint/ciclo | baseline: `sprints_estimadas` (agregado, não por item) | Milestone | campo nativo Sprint |
| Status de execução | `status`, congelado em `aprovado` (ver princípio acima) | coluna do project board / label de status | workflow status (To Do / In Progress / In Review / QA / Done) |
| Sinalização de triagem/arquitetura/complexidade | frontmatter | labels (`triagem:converter`, `arquitetura:fullstack`, …) — opcional, útil para filtro do board | labels ou campos customizados — opcional |
| Corpo do item | seções 1 (contexto) e 8 (critérios de aceite) da spec | corpo em markdown | descrição |
| Fechamento | seção 11 (`realizado_h`, aprendizados) | issue fechada ao merge do PR — **fechar a issue não preenche `realizado_h` sozinho**: é tempo de execução, não tempo de calendário aberto→fechado; preenchimento é manual (ou de uma ferramenta de apontamento à parte) | ticket movido a Done — mesma ressalva |

## Schema do item de sprint (espelho leve, opcional)

[`schemas/item-sprint.schema.json`](./schemas/item-sprint.schema.json) — [`exemplos/item-sprint.exemplo.json`](./exemplos/item-sprint.exemplo.json), continuando o fio condutor de [`CONV-0001`](../specs/exemplos/CONV-0001.md).

Manter esse espelho local **não é obrigatório** — ele existe para quando o projeto quiser agregação/relatório sem bater na API do tracker toda hora. A fonte de verdade continua sendo o tracker, nunca este arquivo; se divergirem, o tracker vence.

## Como isso conecta com as fases vizinhas

- **Entrada:** baseline aprovada (`docs/cronograma/`) — uma linha por `spec_id`, spec com `status: aprovado`.
- **Saída:** issue/ticket aberto, iniciando o ciclo de execução — dev com IA, code review (gate: tech lead), QA (gate: área usuária), deploy.
- **Fechamento:** `realizado_h` + seção 11 da spec alimentam [`docs/cronograma/historico.csv`](../cronograma/README.md) — a calibração do próximo cronograma.
