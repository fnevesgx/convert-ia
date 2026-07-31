# convert.ia — convenções para agentes

Este arquivo é lido por agentes de IA (Claude Code, Cursor, etc.) trabalhando em projetos de conversão que seguem o framework convert.ia. Copie/adapte para o `CLAUDE.md` ou `AGENTS.md` do projeto alvo, na raiz do monorepo.

## Por onde começar

Antes de tocar em código, determine em que fase da conversão este projeto está — observando o que já existe em `docs/` e no tracker, não perguntando ao usuário. Pare no primeiro sinal que bater e aja a partir dali; não pule etapas mesmo que pareçam óbvias.

| Sinal observado | Fase atual | Próxima ação | Onde |
|---|---|---|---|
| `docs/levantamento/` só tem os contratos (README, schemas) — nenhum catálogo ou inventário real preenchido | Levantamento não começou | Determinar se há homolog navegável | Homolog → skill de crawl, estágio 0. Só fonte → preencher inventário de fontes direto pelo schema |
| Catálogo e/ou inventário têm registros reais, mas nenhuma matriz de cruzamento preenchida | Levantamento em andamento / Backlog não começou | Cruzar telas × fontes | `docs/levantamento/README.md`, seção "Matriz de cruzamento" |
| Matriz tem linhas `confirmado`, mas `docs/specs/` só tem `template.md` (nenhuma `CONV-XXXX.md` real) | Backlog pronto / Refinamento não começou | Gerar rascunho de spec por linha confirmada | skill de spec |
| Existem specs com `status: rascunho` ou `refinado` | Refinamento em andamento | Completar as seções humanas (1, 3, 4, 5, 7, 8, 10) e decidir `arquitetura` | `docs/specs/criterios-arquitetura.md` |
| Existem specs `status: aprovado`, mas nenhuma baseline de cronograma do projeto | Refinamento pronto / Cronograma não começou | Gerar baseline a partir da complexidade registrada nas specs; gate: aprovação do cliente | `docs/cronograma/README.md` |
| Baseline aprovada existe, spec `aprovado` sem issue/ticket correspondente no tracker | Cronograma aprovado / Sprints não começou | Abrir issue/ticket seguindo o mapeamento | `docs/sprints/README.md` |
| Spec com issue aberta — `status` da spec fica congelado em `aprovado` de propósito, o tracker manda daqui pra frente | Execução (dev / code review / QA) | Antes do QA humano, rodar os `casos_replay` contra o sistema novo | skill de caracterização |
| Item fechado no tracker, mas spec sem `realizado_h` preenchido | Fechamento pendente | Preencher seção 11 da spec; o par estimado×realizado alimenta a calibração — repassar para o `historico.csv` central do convert.ia (este projeto não tem cópia local dele, de propósito) | Seção 11 do template de spec |

Se nenhum sinal bater — projeto recém-criado, nada preenchido ainda — comece pelo topo: levantamento. Se estiver usando Claude Code, a skill `orientador` (`.claude/skills/orientador/SKILL.md`) roda esse mesmo roteiro sob demanda.

## Princípios inegociáveis

1. **O código legado é a verdade absoluta do sistema.** Em caso de conflito entre o que a documentação diz e o que o fonte faz, o fonte vence. Regras de negócio não documentadas em uma spec devem ser extraídas do código antes de qualquer conversão.

2. **A base de dados é reutilizada, não recriada.** Legado e sistema novo compartilham o mesmo banco durante toda a fase de convivência.
   - **Nunca gerar migration com `dropColumn`, `renameColumn`, `dropTable` ou `renameTable`** enquanto o legado ainda estiver em produção lendo/escrevendo nessas tabelas. Mudanças de schema são sempre aditivas (expand/contract): adicionar coluna, nunca remover ou renomear a antiga.
   - Respeitar as convenções herdadas do legado: valores default (vazio/zero/data mínima) no lugar de `NULL`, integridade referencial garantida na aplicação e não necessariamente no banco. Não assumir que uma FK ausente é erro — pode ser deliberado.
   - Antes de escrever em qualquer tabela compartilhada, verificar se há programas do legado (jobs, triggers, outros objetos) que também escrevem nela — regras de negócio precisam valer dos dois lados durante a convivência.

3. **Toda tarefa de conversão parte de uma spec, não de uma descrição solta.** Antes de implementar um item, localizar a spec correspondente em `docs/specs/` (ou onde o projeto as armazenar) e ler: comportamento atual (seção 2), decisão de triagem (seção 4), comportamento esperado (seção 5) e critérios de aceite (seção 8). Se a spec não existir ou estiver com `status: rascunho`, sinalizar antes de codificar — não inferir requisito.

4. **Testes de caracterização usam o legado como oráculo.** Ao gerar testes para um item convertido, buscar os `casos_replay` do catálogo de telas (`docs/levantamento/schemas/catalogo-telas.schema.json`) associados àquela spec — a saída esperada já foi capturada rodando o cenário no legado, não deve ser inventada.

5. **Diferenças de comportamento em relação ao legado só são válidas se estiverem listadas na seção 5 da spec** ("Comportamento esperado — pós-conversão"). Qualquer divergência não listada ali é bug, não melhoria espontânea.

## Fluxo de trabalho esperado

1. Ler a spec do item (modo plan antes de codificar).
2. Implementar respeitando os princípios acima.
3. Gerar testes unitários e testes de interface cobrindo os critérios de aceite e os casos de replay.
4. Deixar claro no PR/commit qual spec (`spec_id`) está sendo implementada.

## O que NÃO fazer sem confirmação humana explícita

- Alterar schema de forma destrutiva (drop/rename) antes do desligamento formal do legado.
- Decidir sozinho entre arquitetura fullstack vs. legado-como-API+BFF — essa decisão é registrada no frontmatter da spec (`arquitetura`), não inferida pelo agente. Critérios de apoio para a conversa com o humano: `docs/specs/criterios-arquitetura.md`.
- Marcar um item de triagem como `descartar` — essa decisão exige validação com a área usuária (ver seção 4 da spec).

## Referências

- Template de spec: `docs/specs/template.md`
- Critérios de escolha de arquitetura (fullstack vs. legado-como-api-bff): `docs/specs/criterios-arquitetura.md`
- Contratos de levantamento: `docs/levantamento/README.md`
- Estratégia de crawl de telas: `docs/levantamento/estrategia-crawl.md`
- Skill de orientação (por onde começar / em que fase estamos): `.claude/skills/orientador/SKILL.md`
- Skill de crawl (processo): `.claude/skills/screen-crawler/SKILL.md`
- Skill de spec: `.claude/skills/spec-generator/SKILL.md`
- Skill de caracterização (replay): `.claude/skills/characterization-tester/SKILL.md`
- Contrato de cronograma: `docs/cronograma/README.md`
- Contrato de sprints (mapeamento spec → issue tracker): `docs/sprints/README.md`
- Diagramas do processo completo: `docs/diagramas/README.md`
