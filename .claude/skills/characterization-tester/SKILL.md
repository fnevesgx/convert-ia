---
name: convert-ia-characterization-tester
description: Use when the user asks to generate or run characterization tests for a converted convert.ia item, derive tests from spec business rules for the new system, optionally consume casos_replay, or classify a divergence between new and legacy behavior — before marking any item as ready for QA.
---

# Testes de caracterização — convert.ia

Gera e roda testes no **sistema novo** a partir das regras da seção 6 / cenários da seção 9 da spec. O código legado é a verdade das regras; **replay ao vivo não é o caminho padrão**.

Contratos: spec ([`template.md`](../../docs/specs/template.md) ou [`template-leve.md`](../../docs/specs/template-leve.md), seções 5, 6, 9) e, se existir, `casos_replay` opcional no catálogo.

## Quando usar

- "Gerar/rodar testes de caracterização do CONV-XXXX", "cobrir as RN da spec", "validar paridade"
- Spec com seção 6 preenchida (regras com decisão `manter` / `ajustar`)
- Divergência novo×legado a classificar (seção 5 vs bug)

## Quando NÃO usar

- Spec inexistente ou seção 6 vazia → sinalizar; extrair regras do fonte antes
- Pedido de escrita no legado em produção / ambiente sem identidade clara → recusar
- Exigir `casos_replay` para destravar testes → **não**; caminho padrão é regra → teste no novo

## Princípios

1. **Regra extraída → teste no sistema novo.** Oráculo comportamental = seção 6 (+ seção 5 para divergências deliberadas).
2. **Replay ao vivo é exceção.** Só com pedido humano + checagem de identidade de ambiente na UI. Nunca inventar `saida_legado`.
3. **Divergência só é válida se listada na seção 5.** Não listada = bug (ou regra mal extraída — voltar ao fonte).
4. **Teste falhou ≠ teste errado.** Não ajustar asserção para passar.
5. **Suíte verde libera para QA humano**, não para produção.
6. Navegação no legado (se houver exceção de replay): menu/sessão, não só `goto`.

## Pipeline (checklist)

```
- [ ] 1 Ler spec §5, §6, §9 (+ catálogo só se houver casos_replay reais)
- [ ] 2 Um teste por cenário/regra testável no stack do sistema novo
- [ ] 3 Rodar a suíte
- [ ] 4 Classificar divergências (seção 5 · bug · regra mal extraída)
- [ ] 5 Relatar: verde → QA humano · vermelho → volta ao dev
```

### 1 — Localizar

1. Frontmatter `origem` + seções 6 e 9.
2. Para cada RN com decisão `manter`/`ajustar`, deve haver cenário na §9 ou o skill propõe um (sem inventar saída de replay).
3. `casos_replay` presente e capturado de verdade → pode enriquecer asserções; ausente → seguir só com regras.

### 2 — Gerar

1. Um teste por `TC-*` / RN, nome referenciando `spec_id` + id.
2. Asserções no comportamento do sistema novo (dados, mensagens, navegação), respeitando diferenças da seção 5.
3. Preferir o ferramental maduro do stack novo (unit/integration/e2e).

### 3–4 — Rodar / classificar

| Situação | Ação |
|---|---|
| Divergência listada na seção 5 | Teste espera o comportamento novo |
| Divergência não listada | Bug → volta ao dev com diff |
| Regra na §6 não bate com o fonte | Corrigir extração / spec — fonte vence |
| Pedido de re-captura no legado | Identidade de ambiente na UI; menu/sessão; atualizar catálogo só com captura real |

### 5 — Relatar

Por `spec_id`: cenários, verdes, divergências deliberadas, bugs. A skill relata; humano move status.

## O que este skill nunca faz

- Não inventa `saida_legado` nem exige estágio 4 para começar.
- Não edita a seção 5 para legalizar divergência.
- Não marca `concluido` nem cutover.
- Não escreve no legado sem pedido + identidade de ambiente.

## Erros comuns

| Desvio | Correção |
|---|---|
| Bloquear testes por falta de `casos_replay` | Derivar da seção 6 |
| Ajustar teste até passar | Bug ou seção 5 — não a asserção |
| Replay com `goto` / produção | Menu/sessão; identidade na UI |
| Comparar screenshot pixel a pixel | Comportamento; DS novo muda pixels de propósito |

## Depois deste skill

- Suíte verde → QA da área usuária
- Item fechado → `realizado_h` + §11 → calibração de cronograma
