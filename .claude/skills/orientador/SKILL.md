---
name: convert-ia-orientador
description: Use no início de qualquer trabalho num projeto que segue o convert.ia, ou sempre que não estiver claro em que fase da conversão o projeto está — "por onde eu começo", "em que fase estamos", "o que fazer agora", "retomando o projeto depois de um tempo". Determina a fase observando os artefatos que já existem em docs/ e no tracker, sem perguntar ao usuário, e aponta a próxima ação e a skill/contrato correspondente.
---

# Orientador — convert.ia

Roteiro ativo para descobrir em que fase da conversão o projeto está e o que fazer a seguir, observando o que já existe no repo em vez de perguntar. É o ponto de entrada — leia [`CLAUDE.md`](../../../CLAUDE.md) primeiro se ainda não leu.

## Quando usar

- Primeiro contato com um projeto que já rodou `npx github:fnevesgx/convert-ia bootstrap` (ou tem `CLAUDE.md`/`AGENTS.md` do convert.ia na raiz).
- "Por onde eu começo", "em que fase estamos", "o que fazer no item X agora".
- Retomando o projeto depois de um hiato, para recalibrar contexto rápido.

## Como determinar a fase

Verificar nesta ordem — parar no primeiro sinal que bater e agir a partir dali. Não pular etapas mesmo que pareçam óbvias: um catálogo com uma tela só ainda é "levantamento em andamento", não "pronto".

| Sinal observado | Fase atual | Próxima ação | Onde |
|---|---|---|---|
| `docs/levantamento/` só tem os contratos (README, schemas) — nenhum catálogo ou inventário real preenchido | Levantamento não começou | Determinar se há homolog navegável | Homolog → [`screen-crawler`](../screen-crawler/SKILL.md), estágio 0. Só fonte → preencher inventário de fontes direto pelo schema |
| Catálogo e/ou inventário têm registros reais, mas nenhuma matriz de cruzamento preenchida | Levantamento em andamento / Backlog não começou | Cruzar telas × fontes | [`docs/levantamento/README.md`](../../../docs/levantamento/README.md), seção "Matriz de cruzamento" |
| Matriz tem linhas `confirmado`, mas `docs/specs/` só tem `template.md` (nenhuma `CONV-XXXX.md` real) | Backlog pronto / Refinamento não começou | Gerar rascunho de spec por linha confirmada | [`spec-generator`](../spec-generator/SKILL.md) |
| Existem specs com `status: rascunho` ou `refinado` | Refinamento em andamento | Completar as seções humanas (1, 3, 4, 5, 7, 8, 10) e decidir `arquitetura` | [`docs/specs/criterios-arquitetura.md`](../../../docs/specs/criterios-arquitetura.md) |
| Existem specs `status: aprovado`, mas nenhuma baseline de cronograma do projeto | Refinamento pronto / Cronograma não começou | Gerar baseline a partir da complexidade registrada nas specs; gate: aprovação do cliente | [`docs/cronograma/README.md`](../../../docs/cronograma/README.md) |
| Baseline aprovada existe, spec `aprovado` sem issue/ticket correspondente no tracker | Cronograma aprovado / Sprints não começou | Abrir issue/ticket seguindo o mapeamento | [`docs/sprints/README.md`](../../../docs/sprints/README.md) |
| Spec com issue aberta — `status` da spec fica congelado em `aprovado` de propósito, o tracker é quem manda daqui pra frente | Execução (dev / code review / QA) | Antes do QA humano, rodar os `casos_replay` contra o sistema novo | [`characterization-tester`](../characterization-tester/SKILL.md) |
| Item fechado no tracker, mas spec sem `realizado_h` preenchido | Fechamento pendente | Preencher seção 11 da spec; o par estimado×realizado alimenta a calibração — repassar para o `historico.csv` central do convert.ia (este projeto não tem cópia local dele, de propósito) | Seção 11 do [template de spec](../../../docs/specs/template.md) |

Se nenhum sinal bater — projeto recém-criado pelo bootstrap, nada preenchido ainda — comece pelo topo: levantamento.

## O que este skill nunca faz

- Não decide triagem, arquitetura ou aprovação de cronograma sozinho — só identifica a fase e aponta a skill/contrato certo para quem decide.
- Não avança uma fase sem o gate correspondente (aprovação de cronograma, aprovação de QA, etc.) já ter acontecido de fato, mesmo que os artefatos pareçam "prontos o suficiente".
- Não inventa artefato que falta para destravar a fase seguinte — sinaliza o buraco (ex.: "matriz existe mas nenhuma linha confirmada ainda") em vez de assumir.
