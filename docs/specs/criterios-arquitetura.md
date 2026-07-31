# convert.ia — critérios de escolha de arquitetura

Apoio à decisão do campo `arquitetura` (`fullstack` | `legado-como-api-bff`) no frontmatter da [spec](./template.md). **Isto é decisão humana** — o CLAUDE.md/AGENTS.md é explícito: o agente não escolhe sozinho, só apresenta os sinais abaixo.

## A pergunta estratégica primeiro

`legado-como-api-bff` não é um passo intermediário do strangler fig — é uma parada permanente. Nela, o legado continua rodando e sendo dono da lógica de negócio daquele módulo para sempre; o sistema novo só troca a camada de apresentação por cima. `fullstack` é o único caminho que termina em desligamento de fato do legado naquele módulo.

Pergunte primeiro: **este módulo precisa desligar do legado algum dia, ou pode conviver atrás de uma API indefinidamente?** Só depois disso os sinais táticos abaixo fazem sentido.

## Sinais táticos

| Sinal | Puxa para `fullstack` | Puxa para `legado-como-api-bff` |
|---|---|---|
| `complexidade.negocio` (frontmatter da spec) | baixa/média, regras já bem mapeadas na seção 6 | alta, muitas regras interdependentes e ainda mal documentadas — reimplementar é onde mais se perde comportamento sutil |
| Seção 5 da spec tem diferenças deliberadas de comportamento | sim — fullstack dá controle total sobre o comportamento novo | não — comportamento deve ficar idêntico ao legado; api-bff fica refém do que o legado já faz |
| Prioridade estratégica do módulo | alta prioridade de modernização, orçamento para reimplementar | baixa prioridade, ganho de UX rápido é suficiente por ora |

## Gates (eliminam a opção, não só pesam)

- **Objeto do legado não é exponível como serviço** (sem service layer, sem webservice gerado) → só `fullstack`. Confirmar viabilidade técnica antes de considerar api-bff, não depois.
- **Deploy standalone local sem o motor de aplicação do legado embarcado** (ex.: aplicação Electron rodando isolada, só com uma cópia local do banco do legado, sem o backend/motor do legado rodando junto) → só `fullstack`. Não existe serviço do legado para chamar; o único substrato disponível é o banco, que é exatamente o que `fullstack` já ataca via o princípio 2 do CLAUDE.md. Ver nota de sincronização na seção 7 do template, para o caso (raro) desse standalone também sincronizar com um servidor central.

## O que isto não é

- Não é fórmula que o agente aplica sozinho para preencher `arquitetura` na spec. Os sinais acima organizam a conversa; quem decide e assina é humano (ver "O que NÃO fazer sem confirmação humana explícita" no `CLAUDE.md`/`AGENTS.md`).
- Não é um teste único no início do projeto — a decisão é por item de backlog. Módulos diferentes do mesmo legado podem ter arquiteturas diferentes, inclusive um mesmo módulo pode migrar de `legado-como-api-bff` para `fullstack` num item futuro, se a prioridade estratégica mudar.
