# Matriz de cruzamento — exemplo (ERP Pedidos)

Exemplo preenchido do artefato descrito no [`README`](../README.md) da fase de levantamento, amarrado aos mesmos ids do [`catalogo-telas.exemplo.json`](./catalogo-telas.exemplo.json) e do [`inventario-fontes.exemplo.json`](./inventario-fontes.exemplo.json). A linha confirmada abaixo é a origem da spec de exemplo [`CONV-0001`](../../specs/exemplos/CONV-0001.md).

Cruzado em: 2026-07-30 · fontes: catálogo (estágios 0–4) + inventário da KB

## Vínculos tela ↔ objeto

| Tela (id) | Objeto (id) | Regras (ids) | Status | Observação |
|---|---|---|---|---|
| TEL-0032 | OBJ-0014 | RN-01, RN-02 | confirmado | rota `/pedidos/novo` bate com `programa_provavel` PPedidoNovo; deps expandem para OBJ-0015 (RN-03) |
| TEL-0033 | OBJ-0015 | RN-03 | a confirmar | tela de confirmação sugere PPedidoConfirma, mas o inventário só registra a transaction — investigar antes do refinamento |

## Órfãos — telas sem objeto claro

| Tela (id) | Hipótese | Ação sugerida |
|---|---|---|
| TEL-0041 | tela gerada por wrapper genérico de relatórios | investigar antes do refinamento |

## Órfãos — objetos sem tela (candidatos a job/batch/dead code)

| Objeto (id) | Gatilho observado | Ação sugerida |
|---|---|---|
| OBJ-0022 | job (PFaturamentoNoturno, roda à meia-noite) | **não é dead code**: escreve em PEDIDO (RN-09) — regra precisa valer dos dois lados na convivência; registrar na seção 7 das specs que tocam PEDIDO |

## Próximo passo

Cada linha `confirmado` alimenta o [`spec-generator`](../../../.claude/skills/spec-generator/SKILL.md) após checkpoint de granularidade: ids no frontmatter; regras da seção 6 semeiam a seção 9 (testes no sistema novo). Ver o resultado em [`CONV-0001`](../../specs/exemplos/CONV-0001.md).
