# convert.ia — template de spec leve

Tier reduzido para satélites do fecho transitivo e itens pequenos que não merecem as 11 seções da [spec completa](./template.md). Mesmo `id` `CONV-XXXX`, mesmo fluxo de status e tracker.

**Quando usar:** objeto necessário à conversão da tela-mãe, sem superfície de produto própria, ou cadastro auxiliar de baixo impacto já agrupado no checkpoint humano do [`spec-generator`](../../.claude/skills/spec-generator/SKILL.md).

**Quando NÃO usar:** item de primeira linha do backlog (P1/fluxo crítico) — aí é [`template.md`](./template.md).

---

```yaml
---
id: CONV-0000
titulo: ""
sistema: ""
tier: leve                      # completa | leve — completa usa template.md
origem:
  telas: []                     # frequentemente vazio; herda contexto da mãe
  programas: []
  regras: []
tela_mae: ""                    # id CONV-XXXX ou TEL-XXXX da spec/tela âncora
triagem: converter              # converter | descartar | redesenhar
arquitetura: fullstack          # herdada da mãe, salvo decisão humana em contrário
complexidade:
  tela: baixa
  negocio: baixa
  dados: baixa
estimativa_h: 0
realizado_h: null
dependencias: []                # tipicamente inclui a tela_mae
status: rascunho                # rascunho | refinado | aprovado | … (mesmas regras da completa)
---
```

## 1. Por que existe (e relação com a mãe)

*Uma ou duas frases: o que este satélite faz e por que não está só embutido na spec `tela_mae`.*

## 2. Comportamento atual — verdade do código

*O que o objeto faz hoje, extraído do fonte. Sem opinião.*

## 6. Regras de negócio

| ID | Regra | Origem | Decisão |
|----|-------|--------|---------|
| RN-01 | *descrição* | *objeto* | manter / ajustar / remover |

## 8. Critérios de aceite

- [ ] *Critério verificável*
- [ ] *…*

## 9. Testes

*Cenários derivados das regras da seção 6, automatizados no sistema novo. Sem exigir `casos_replay`.*

| Cenário | Entrada / condição | Resultado esperado | Regra |
|---------|--------------------|--------------------|-------|
| TC-01 | *…* | *…* | RN-01 |

## 10. Fora de escopo

*O que fica na mãe ou em outro item.*

## 11. Registro de fechamento

*`realizado_h` + desvios — mesma calibração da spec completa.*

---

Seções 3, 4, 5 e 7 da completa ficam implícitas: relato/triagem/comportamento esperado/dados **herdam da `tela_mae`**, salvo nota explícita aqui. Se precisar divergir de verdade (triagem diferente, schema próprio), promover o item para [`template.md`](./template.md).
