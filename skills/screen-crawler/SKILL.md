---
name: convert-ia-screen-crawler
description: Use when the user asks to crawl, map, or inventory navigable legacy screens for convert.ia levantamento, prioritize a screen backlog from UI density, or bridge menu discovery to the telas×fontes matrix — before inventing catalog fields or casos_replay.
---

# Crawler de telas — convert.ia

Orienta o levantamento por interface navegável em **estágios**. Não versiona Playwright genérico: o agente adapta seletores e login ao shell do projeto. A sequência e os limites são inegociáveis.

Contrato-alvo: [`docs/levantamento/schemas/catalogo-telas.schema.json`](../../docs/levantamento/schemas/catalogo-telas.schema.json). Estratégia completa: [`docs/levantamento/estrategia-crawl.md`](../../docs/levantamento/estrategia-crawl.md).

## Quando usar

- “Rodar / adaptar o crawl de telas”, “mapear o menu do legado”, “priorizar backlog a partir do crawl”
- Projeto com homolog navegável e ainda sem catálogo rico (ou só com screenshots soltos)
- Precisar cruzar URL/rota com inventário de fontes antes da matriz

## Quando NÃO usar

- Só há fontes, sem UI publicada → inventário de fontes, não este skill
- Spec já com `casos_replay` e matriz confirmada → [`spec-generator`](../spec-generator/SKILL.md)
- Pedido de clicar em produção → recusar; só homolog/snapshot

## Princípios

1. **Homolog ou snapshot.** Nunca produção.
2. **Estágios 0–3 não inventam** `campos`, `acoes`, `arestas` nem `saida_legado`. Só o que foi observado/capturado.
3. **Fonte vence a UI** em conflito de regra — mas o crawl registra o que a UI mostrou.
4. **Menu path + estado de sessão** importam: preferir navegar como o usuário, não só abrir a URL final.
5. Credenciais e URLs ficam em config/env do projeto — não embutir segredos em relatório commitado.

## Pipeline (checklist)

Copie e marque conforme avança:

```
- [ ] 0 Descoberta de menu → lista de alvos
- [ ] 1 Captura + score UI → relatório + screenshots
- [ ] 2 Priorização P1/P2/P3 (ou equivalente) + ids estáveis
- [ ] 3 Mapeamento URL→objeto + fecho de deps → matriz / órfãos
- [ ] 4 (só se pedido) catálogo rico + casos_replay no legado
```

### 0 — Descoberta

1. Confirmar base URL de homolog e fluxo de login (incl. banners/cookies se houver).
2. Descobrir módulos do menu principal; excluir logout/portais irrelevantes.
3. Por módulo: expandir top-level e submenus; coletar **folhas** com destino real.
4. Deduplicar por URL/rota; anotar `modulo`, `menu_path`, `link`, `url`.
5. Se o DOM for opaco (menu GeneXus, frames, hover): scripts de debug primeiro — não chutar seletores.

### 1 — Captura

Para cada alvo (e home do módulo se aplicável):

1. Reabrir via caminho de menu; reidratar sessão se expirou.
2. Screenshot full-page.
3. Contar controles visíveis; calcular score com pesos **documentados no relatório do projeto**.
4. Gravar json/csv/md: título, url, menu_path, métricas, path do screenshot.

Não submeter formulários de escrita neste estágio.

### 2 — Priorização

1. Combinar score com módulos/keywords de impacto de negócio do domínio (o projeto define a lista).
2. Emitir backlog ordenado com id estável (`TEL-…` recomendado para alinhar ao schema).
3. Inferir tipo de tela só como heurística (grid/form/mista) — não como triagem.

### 3 — Cruzamento com fontes

1. Mapear URL/rota → objeto no [`inventario-fontes`](../../docs/levantamento/schemas/inventario-fontes.schema.json) (ou export/KB do projeto).
2. Registrar confiança do mapeamento; ambíguos e não encontrados viram órfãos na matriz.
3. Expandir dependências a partir do inventário; não inventar procedures/tabelas ausentes do índice/fonte.
4. Atualizar a [matriz de cruzamento](../../docs/levantamento/README.md).

### 4 — Catálogo rico (opcional neste skill)

Só com pedido explícito e ambiente seguro:

1. Preencher `campos` / `acoes` / `arestas` observados.
2. Capturar `casos_replay` no legado — `saida_legado` é oráculo, não chute.
3. Validar mentalmente contra o schema antes de declarar o catálogo “completo”.

## Saídas esperadas por estágio

| Estágio | Pode gravar | Não pode gravar |
|---|---|---|
| 0–1 | alvos, métricas UI, screenshots | campos detalhados, replay |
| 2 | prioridade, id, justificativa | decisão `descartar` |
| 3 | vínculo tela↔objeto, órfãos, deps observadas | regras de negócio inventadas |
| 4 | registro conforme schema do catálogo | divergência do legado fora da seção 5 da spec |

## Erros comuns

| Desvio | Correção |
|---|---|
| Tratar relatório de score como catálogo do schema | Score ≠ campos/arestas/replay |
| Inventar `casos_replay` para destravar spec | Deixar vazio e sinalizar |
| `goto` direto ignorando menu/sessão | Reproduzir navegação do usuário |
| Crawl em produção | Parar; apontar homolog |
| Priorizar só por rótulo “Muito Alta” em shell denso | Usar score absoluto + keywords de negócio |
| Decidir `descartar` no backlog do crawl | Triagem é humana na spec |

## Depois deste skill

- Linha confirmada na matriz → [`spec-generator`](../spec-generator/SKILL.md)
- Sizing de horas → complexidade na spec + [`docs/cronograma/`](../../docs/cronograma/README.md)
