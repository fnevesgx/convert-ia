# convert.ia — cronograma e orçamento

Este é o contrato de saída da fase de **cronograma e orçamento** e o gate de aprovação do cliente antes das sprints começarem. Consome o `complexidade` já registrado no frontmatter de cada [spec](../specs/template.md) e devolve uma baseline de horas por item, agregável em cronograma.

A régua de complexidade não nasce arbitrária: começa como uma tabela de referência (abaixo) calibrada por julgamento de quem já rodou projetos parecidos, e é recalibrada a cada projeto concluído com o `realizado_h` real — ver seção de calibração no fim.

---

## 1. Tabela de referência (ponto de partida — recalibrar por projeto)

Horas por combinação de complexidade de tela × negócio × dados. Estes números são um ponto de partida de exemplo, não uma verdade — a primeira ação em cada projeto novo é ajustar esta tabela pela experiência acumulada em `docs/cronograma/historico.csv` (ver seção 4).

| Tela | Negócio | Dados | Horas (dev) | Horas (QA/caracterização) |
|------|---------|-------|-------------|----------------------------|
| baixa | baixa | baixa | 4 | 2 |
| baixa | media | baixa | 6 | 3 |
| media | media | baixa | 10 | 4 |
| media | media | media | 14 | 6 |
| alta | media | media | 20 | 8 |
| media | alta | media | 22 | 9 |
| alta | alta | alta | 32 | 14 |

Regras de leitura:
- **Tela**: quantidade de campos, validações visíveis, componentes não triviais (grids editáveis, wizards, upload).
- **Negócio**: quantidade e interdependência de regras da seção 6 da spec; regra que atravessa múltiplas telas conta como alta.
- **Dados**: joins/tabelas envolvidas, presença de escritores duplos (legado + novo escrevendo na mesma tabela durante a convivência), necessidade de transformação (rara, já que a base é reutilizada — ver princípio no README raiz).

## 2. Schema da baseline por item (`baseline.schema.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "convert.ia — Baseline de cronograma e orçamento",
  "type": "object",
  "required": ["projeto", "gerado_em", "itens"],
  "properties": {
    "projeto": { "type": "string" },
    "gerado_em": { "type": "string", "format": "date-time" },
    "moeda": { "type": "string", "default": "BRL" },
    "valor_hora": { "type": "number", "description": "usado para converter horas em orçamento" },
    "itens": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["spec_id", "complexidade", "estimativa_h"],
        "properties": {
          "spec_id": { "type": "string", "description": "ex.: CONV-0000, referencia o id da spec" },
          "complexidade": {
            "type": "object",
            "properties": {
              "tela": { "type": "string", "enum": ["baixa", "media", "alta"] },
              "negocio": { "type": "string", "enum": ["baixa", "media", "alta"] },
              "dados": { "type": "string", "enum": ["baixa", "media", "alta"] }
            }
          },
          "estimativa_h": { "type": "number" },
          "origem_estimativa": {
            "type": "string",
            "enum": ["tabela-referencia", "ajuste-manual"],
            "description": "se ajuste-manual, justificar em observacao"
          },
          "observacao": { "type": "string" }
        }
      }
    },
    "totais": {
      "type": "object",
      "properties": {
        "horas_dev": { "type": "number" },
        "horas_qa": { "type": "number" },
        "sprints_estimadas": { "type": "number" },
        "orcamento": { "type": "number" }
      }
    }
  }
}
```

## 3. Gate de aprovação

A baseline gerada é apresentada ao cliente como cronograma e orçamento formal. Aprovação registrada aqui é o que libera a fase de **sprints** — cadastro do backlog em GitHub Issues/Jira, conforme o contrato em [`docs/sprints/README.md`](../sprints/README.md). Sem aprovação, nenhum item avança para desenvolvimento.

## 4. Calibração (o framework aprendendo com ele mesmo)

Ao fechar cada item (seção 11 da spec, "Registro de fechamento"), o `realizado_h` real é conhecido. Consolidar esses pares estimado × realizado em `docs/cronograma/historico.csv` — colunas sugeridas: `projeto,spec_id,tela,negocio,dados,estimativa_h,realizado_h,desvio_pct`.

Esse histórico, acumulado entre projetos, é o que permite recalibrar a tabela de referência da seção 1 a cada novo cronograma — cronogramas ficam mais precisos conforme o convert.ia acumula projetos, não porque alguém "chuta melhor".
