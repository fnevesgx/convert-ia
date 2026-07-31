# convert.ia

Framework de conversão de sistemas legados apoiado em IA. Mapeado a partir de processos observados e implementados em projetos reais (migrações GeneXus → TypeScript/AdonisJS/React/Inertia.js), com contratos de artefato entre fases para viabilizar, com maturidade, rodar o pipeline em loop.

## Princípios

- **O código é a verdade absoluta do sistema.** Levantamento parte dos fontes quando não há interface navegável publicada.
- **Base de dados reutilizada por padrão.** Não se cria estrutura nova; legado e sistema novo compartilham o mesmo banco durante a convivência. Migrations aditivas e retrocompatíveis (expand/contract) até o desligamento do legado — nunca rename/drop antes disso.
- **Strangler fig.** O sistema novo envolve o legado módulo a módulo, em produção real a cada sprint, em vez de big-bang.
- **O legado como oráculo.** Testes de caracterização nascem do grafo de navegação do levantamento (golden master) e validam paridade comportamental antes do cutover de cada módulo.
- **Humanos nos gates, não na execução.** Aprovação de orçamento, code review, aceite da área usuária — o resto é candidato a automação no modo loop.

## Para agentes de IA

Se você é um agente (Claude Code, Cursor, etc.) trabalhando neste projeto ou em um projeto que segue o convert.ia: leia [`CLAUDE.md`](./CLAUDE.md) (idêntico a `AGENTS.md`) antes de tocar em código ou migrations.

## Levar para um projeto novo

```
scripts/bootstrap-projeto.sh /caminho/do/projeto-alvo
```

Copia convenções, skills e contratos num comando — CLAUDE.md/AGENTS.md, `.claude/skills/` (as três skills), os contratos de `docs/` (READMEs + schemas) e o gate de CI. É interativo de propósito: pergunta o stack de migrations no meio da execução em vez de assumir um default; se não for AdonisJS/Lucid, pede o path real e ajusta o gate de CI sozinho. Fica de fora de propósito: os exemplos fictícios (o projeto novo gera os próprios a partir do primeiro item real) e `historico.csv` (calibração acumula entre projetos, fica centralizada aqui).

## Estrutura

```
CLAUDE.md / AGENTS.md      # convenções para agentes de IA (dados, migrations, triagem)
.github/workflows/          # gate de CI: bloqueia migration destrutiva com legado vivo
.claude/skills/              # path de auto-descoberta do Claude Code
├── screen-crawler/          # skill: crawl de telas em estágios (menu → score → backlog → cruzamento)
├── spec-generator/         # skill: gera rascunho de spec a partir da matriz de cruzamento
└── characterization-tester/ # skill: replay dos casos_replay contra o sistema novo (legado como oráculo)
scripts/
└── bootstrap-projeto.sh     # leva o framework para um projeto novo em um comando
docs/
├── diagramas/              # visão geral do processo em Mermaid (fase de análise, ciclo de execução, modo loop)
├── levantamento/            # contratos de artefato: catálogo de telas, inventário de fontes, matriz de cruzamento
│   ├── estrategia-crawl.md   # estágios do crawl até o catálogo rico
│   ├── schemas/              # JSON Schema
│   └── exemplos/              # registros preenchidos
├── specs/                    # template de spec por item de backlog + exemplo preenchido (CONV-0001) + critérios de arquitetura
├── cronograma/                # contrato de baseline de horas/orçamento + histórico de calibração
│   ├── schemas/
│   └── exemplos/
└── sprints/                   # contrato de mapeamento spec → issue tracker (GitHub Issues / Jira)
    ├── schemas/
    └── exemplos/
```

## Fases do processo

1. **Levantamento** — crawler de telas (estratégia em estágios + design system seco) e/ou leitura de fontes. Ver [`docs/levantamento/`](./docs/levantamento/) e [`estrategia-crawl.md`](./docs/levantamento/estrategia-crawl.md).
2. **Backlog** — cruzamento telas × fontes vira matriz e itens de backlog.
3. **Refinamento** — reforço de requisitos, regras de negócio, relato da área usuária, triagem (converter/descartar/redesenhar), incorporação do design system modernizado. Ver [`docs/specs/template.md`](./docs/specs/template.md).
4. **Cronograma e orçamento** — mede complexidade de desenvolvimento e de telas a partir do refinamento, vira baseline de horas e orçamento. Ver [`docs/cronograma/README.md`](./docs/cronograma/README.md).
5. **Sprints** — backlog cadastrado em GitHub Issues ou Jira; a partir daqui o tracker manda no status de execução. Ver [`docs/sprints/README.md`](./docs/sprints/README.md).
6. **Desenvolvimento** — execução com IA (plan mode, testes unitários e de interface, revisão manual).
7. **Branches** — feature branch por atividade, code review do tech lead.
8. **Qualidade** — validação da área usuária em QA; reprovado volta para desenvolvimento.
9. **Deploy** — merge para main, workflow de CI roda migrations, seeds e testes unitários/e2e em produção.
10. Ciclo reinicia a cada sprint até a conclusão do projeto.

Visão geral em diagramas: [`docs/diagramas/README.md`](./docs/diagramas/README.md).

## Status

Framework em documentação, validado por um piloto em andamento (projeto com interface navegável e fontes disponíveis). Pendências conhecidas:

- [x] Contrato de artefato de cronograma e orçamento (baseline por item a partir da complexidade registrada na spec).
- [x] Skill de geração de spec a partir da matriz de cruzamento.
- [x] CLAUDE.md/AGENTS.md com as convenções (dados, migrations, triagem) para consumo direto por agentes.
- [x] Gate de CI para bloquear rename/drop de coluna enquanto o legado estiver vivo (ajustar paths de migration ao stack real do projeto).
- [ ] Registro de calibração estimado × realizado do piloto — `docs/cronograma/historico.csv` criado, aguardando dados reais do primeiro projeto.
- [x] Skill de crawler de telas (orientação de processo em estágios) — [`.claude/skills/screen-crawler/`](./.claude/skills/screen-crawler/SKILL.md); caracterização/`casos_replay` permanece estágio 4 do levantamento.
- [x] Skill dedicada de caracterização (replay sistemático a partir do catálogo) — [`.claude/skills/characterization-tester/`](./.claude/skills/characterization-tester/SKILL.md).
- [x] Script de bootstrap para levar o framework a um projeto novo em um comando — [`scripts/bootstrap-projeto.sh`](./scripts/bootstrap-projeto.sh).
- [x] Exemplo ponta-a-ponta amarrado pelos mesmos ids: [catálogo](./docs/levantamento/exemplos/catalogo-telas.exemplo.json) → [inventário](./docs/levantamento/exemplos/inventario-fontes.exemplo.json) → [matriz](./docs/levantamento/exemplos/matriz-cruzamento.exemplo.md) → [spec CONV-0001](./docs/specs/exemplos/CONV-0001.md) → [baseline](./docs/cronograma/exemplos/baseline.exemplo.json) → [item de sprint](./docs/sprints/exemplos/item-sprint.exemplo.json).
- [x] Contrato de artefato da fase de sprints (mapeamento spec → GitHub Issues / Jira, tracker como fonte de verdade da execução) — [`docs/sprints/README.md`](./docs/sprints/README.md).
- [x] Critérios de apoio para a decisão de arquitetura (fullstack vs. legado-como-api-bff) — [`docs/specs/criterios-arquitetura.md`](./docs/specs/criterios-arquitetura.md).
