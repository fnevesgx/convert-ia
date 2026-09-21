# Matriz de cruzamento — exemplo (ERP Pedidos)

Exemplo preenchido do artefato descrito no [`README`](../README.md) da fase de levantamento, amarrado aos mesmos ids do [`catalogo-telas.exemplo.json`](./catalogo-telas.exemplo.json) e do [`inventario-fontes.exemplo.json`](./inventario-fontes.exemplo.json). A linha confirmada abaixo é a origem da spec de exemplo [`CONV-0001`](../../specs/exemplos/CONV-0001.md).

Cruzado em: 2026-07-30 · fontes: catálogo (estágios 0–4) + inventário da KB · `threshold_confianca`: 0.85 (default do framework)

Mesma matriz na forma máquina: [`matriz-cruzamento.exemplo.json`](./matriz-cruzamento.exemplo.json).

## Vínculos tela ↔ objeto

| Tela (id) | Objeto (id) | Regras (ids) | Status | Confiança | Observação |
|---|---|---|---|---|---|
| TEL-0032 | OBJ-0014 | RN-01, RN-02 | confirmado | exato (0.97) | rota `/pedidos/novo` bate com `programa_provavel` PPedidoNovo; deps expandem para OBJ-0015 (RN-03) |
| TEL-0033 | OBJ-0015 | RN-03 | a confirmar | ambiguo (0.41) | tela de confirmação sugere PPedidoConfirma, mas o inventário só registra a transaction — **abaixo do threshold**, primeiro da fila no checkpoint |

## Órfãos — telas sem objeto claro

*Nenhum neste exemplo* — toda tela do [catálogo](./catalogo-telas.exemplo.json) casou com um objeto do inventário. O bloco continua fazendo parte do contrato; formato na tabela genérica do [`README`](../README.md).

## Órfãos — objetos sem tela (candidatos a job/batch/dead code)

| Objeto (id) | Gatilho observado | Ação sugerida |
|---|---|---|
| OBJ-0022 | job (PFaturamentoNoturno, roda à meia-noite) | **não é dead code**: escreve em PEDIDO (RN-09) — regra precisa valer dos dois lados na convivência; registrar na seção 7 das specs que tocam PEDIDO |

## Próximo passo

Cada linha `confirmado` alimenta o [`spec-generator`](../../../.claude/skills/spec-generator/SKILL.md) após checkpoint de granularidade: ids no frontmatter; regras da seção 6 semeiam a seção 9 (testes no sistema novo). Ver o resultado em [`CONV-0001`](../../specs/exemplos/CONV-0001.md).

TEL-0033 (0.41) fica abaixo do threshold e entra no checkpoint humano antes do refinamento. Com mais de um item abaixo do corte, a fila é ordenada do mais ambíguo para o menos — o score ordena; quem decide continua sendo o humano.
