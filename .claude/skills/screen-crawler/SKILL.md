---
name: convert-ia-screen-crawler
description: Use when the user asks to crawl, map, or inventory navigable legacy screens for convert.ia levantamento, prioritize a screen backlog from UI density, or bridge menu discovery to the telas×fontes matrix — before inventing catalog fields, rotulo_ui, or casos_replay.
---

# Crawler de telas — convert.ia

Orienta o levantamento por interface navegável em **estágios**. Não versiona Playwright genérico: o agente adapta seletores e login ao shell do projeto. A sequência e os limites são inegociáveis.

Contrato-alvo: [`docs/levantamento/schemas/catalogo-telas.schema.json`](../../docs/levantamento/schemas/catalogo-telas.schema.json). Estratégia completa: [`docs/levantamento/estrategia-crawl.md`](../../docs/levantamento/estrategia-crawl.md).

## Quando usar

- “Rodar / adaptar o crawl de telas”, “mapear o menu do legado”, “priorizar backlog a partir do crawl”
- Projeto com homolog navegável e ainda sem catálogo / matriz
- Precisar cruzar URL/rota com inventário de fontes antes da matriz

## Quando NÃO usar

- Só há fontes, sem UI publicada → inventário de fontes, não este skill
- Matriz confirmada e pedido de spec → [`spec-generator`](../spec-generator/SKILL.md)
- Pedido de clicar em produção → recusar; só homolog/snapshot

## Princípios

1. **Homolog ou snapshot.** Nunca produção. Identidade de ambiente na UI (rodapé/banner/build) antes de qualquer escrita — não só hostname.
2. **Estágios 0–3 não inventam** `campos`, `acoes`, `arestas`, `rotulo_ui` nem `saida_legado`.
3. **Fonte vence a UI** em conflito de regra — o crawl registra o que a UI mostrou (`rotulo_ui` é evidência, não verdade de negócio).
4. **Menu path + estado de sessão** importam: navegar como o usuário; URL direta pode parecer bug sem ser.
5. **Fecho ≠ uma spec por objeto.** Granularidade no estágio 3; checkpoint humano antes de lote de specs.
6. Credenciais/URLs em config/env — não embutir segredos em relatório commitado.
7. GeneXus: [`notas-genexus.md`](../../docs/levantamento/notas-genexus.md) antes de ler fonte.
8. **Nunca inventar** Description/Caption (`controles[].descricao` no inventário) nem `rotulo_ui` — só o que foi lido no fonte ou visto na UI.

## Pipeline (checklist)

```
- [ ] 0 Identidade de ambiente + descoberta de menu → lista de alvos
- [ ] 1 Captura + score UI → relatório + screenshots
- [ ] 2 Priorização P1/P2/P3 + ids estáveis
- [ ] 3 Mapeamento URL→objeto + fecho com critério de parada → matriz / órfãos
- [ ] 4 (só se pedido) campos/ações com `rotulo_ui` (+ `nome_fonte` se cruzável); arestas e/ou casos_replay
```

### 0 — Descoberta

1. Confirmar identidade de ambiente na UI; se produção ou ambíguo → parar.
2. Login; descobrir módulos; excluir logout/portais irrelevantes.
3. Por módulo: expandir menus; coletar **folhas** com destino real.
4. Deduplicar por URL/rota; anotar `modulo`, `menu_path`, `link`, `url`.
5. DOM opaco → scripts de debug primeiro.

### 1 — Captura

1. Reabrir via caminho de menu; reidratar sessão se expirou.
2. Screenshot full-page; contar controles; score com pesos no relatório do projeto.
3. Não submeter formulários de escrita.

### 2 — Priorização

1. Score × impacto de negócio (lista do domínio).
2. Backlog com id `TEL-…`.
3. Tipo de tela só como heurística — não triagem.

### 3 — Cruzamento com fontes

1. URL/rota → objeto no inventário; registrar confiança.
2. Expandir deps; **parar** se abrir superfície de produto diferente → perguntar escopo.
3. Wizard/passos/modais → não viram linha de backlog própria; ficam na tela-mãe.
4. Satélites reutilizados → inventário; spec leve ou só menção, após checkpoint humano.
5. Ao ler o fonte do objeto: preencher `controles[]` (`nome` + `descricao` = Description/Caption literal; `tipo_controle`/`trecho_fonte` opcionais). **Não inventar** descrição.
6. Atualizar a [matriz](../../docs/levantamento/README.md).

### 4 — Opcional

Só com pedido explícito + ambiente seguro:

- `campos` / `acoes` / `arestas` observados; em cada campo/ação, `rotulo_ui` obrigatório (texto literal na UI) e `nome_fonte` opcional (alinha a `controles[].nome`).
- Colunas de grid → itens de `campos` com `tipo: "grid_column"`.
- `casos_replay` se pedido (nunca inventar `saida_legado`).

## Saídas esperadas por estágio

| Estágio | Pode gravar | Não pode gravar |
|---|---|---|
| 0–1 | alvos, métricas UI, screenshots | campos detalhados, `rotulo_ui`, replay |
| 2 | prioridade, id, justificativa | decisão `descartar` |
| 3 | vínculo tela↔objeto, órfãos, deps, `controles[]` do fonte | spec por cada nó do fecho; regras/descrições inventadas |
| 4 | UI detalhada (`rotulo_ui`) / replay (pedido) | inventar rótulo; divergência do legado fora da seção 5 da spec |

## Erros comuns

| Desvio | Correção |
|---|---|
| Tratar score como catálogo do schema | Score ≠ campos/arestas |
| Inventar `casos_replay` | Deixar vazio; testes vêm das regras |
| Inventar `rotulo_ui` ou Description | Só texto visto na UI / lido no fonte |
| `goto` direto ignorando menu/sessão | Reproduzir navegação do usuário |
| Confiar só no hostname | Identidade na UI |
| Uma spec por procedure do fecho | Checkpoint + leve / mãe |
| Gerar lote sem reconfirmar escopo | Perguntar ids e cortes antes |

## Depois deste skill

- Checkpoint + specs → [`spec-generator`](../spec-generator/SKILL.md)
- Testes no sistema novo → [`characterization-tester`](../characterization-tester/SKILL.md)
- Sizing → [`docs/cronograma/`](../../docs/cronograma/README.md)
