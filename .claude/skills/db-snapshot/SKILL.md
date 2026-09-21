---
name: convert-ia-db-snapshot
description: Use when the user asks to capture, photograph, or introspect the legacy database schema for convert.ia levantamento — physical columns, defaults, foreign keys, indexes, triggers — before assuming a relationship or a NULL/default convention that the source code only implies.
---

# Fotografia do banco — convert.ia

Orienta a captura, por introspecção somente leitura, do schema físico real do banco legado. É a quarta entrada da fase de levantamento, em paralelo ao catálogo de telas e ao inventário de fontes — cruza com o inventário pelo nome da tabela.

Contrato-alvo: [`docs/levantamento/schemas/fotografia-banco.schema.json`](../../docs/levantamento/schemas/fotografia-banco.schema.json). Processo completo: [`docs/levantamento/estrategia-fotografia-banco.md`](../../docs/levantamento/estrategia-fotografia-banco.md).

## Quando usar

- "Fotografar o banco", "capturar o schema do legado", "ver como as tabelas realmente estão"
- Precisar confirmar se uma FK sugerida pelo código é constraint física ou só convenção
- Investigar triggers/jobs que escrevem em tabela compartilhada antes de decidir uma regra na spec (seção 7)

## Quando NÃO usar

- Pedido de extrair ou exportar dados (linhas/registros) — isso é migração de dados, fora do escopo de levantamento
- Pedido de alterar schema (mesmo que aditivo) — levantamento só lê; mudança de schema é decisão de implementação, com gate humano (princípio 2 do `AGENTS.md`)
- Ainda não há inventário de fontes com nenhuma tabela citada — capturar tabelas soltas sem vínculo a objeto não prioriza nada; comece pelo inventário

## Princípios

1. **Homolog ou snapshot. Nunca produção.** Identidade confirmada por evidência do próprio servidor/instância (nome lógico, confirmação com DBA), não só pela string de conexão — princípio 6 do `AGENTS.md`.
2. **Somente leitura, sempre.** Toda consulta é introspecção de catálogo (`INFORMATION_SCHEMA`, `sys.*`, `pg_catalog`, DDL export) ou `SELECT COUNT(*)` para contagem aproximada — nunca escrita, nunca amostragem de dados sensíveis além do necessário para confirmar uma convenção.
3. **Escopo vem do inventário.** Capturar as tabelas já citadas em `inventario-fontes.objetos[].tabelas[]`; tabela relevante sem objeto correspondente vira órfão a investigar, mesmo tratamento da matriz de cruzamento.
4. **Nunca inventar** resumo de trigger/procedure — ler o corpo real. Nunca marcar `garantida_no_banco: true` sem a constraint física existir no catálogo.
5. **Fonte física vence suposição do código** quando divergem (ex.: FK sugerida por nome de coluna mas sem constraint) — registrar a divergência em `convencoes_observadas`, não silenciar.

## Pipeline (checklist)

```
- [ ] 0 Identidade de ambiente confirmada (servidor/instância, não só connection string)
- [ ] 1 Escopo definido a partir das tabelas do inventário de fontes
- [ ] 2 Introspecção por tabela: colunas, PK, FKs, índices, triggers, linhas_aprox
- [ ] 3 Convenções observadas registradas (defaults no lugar de NULL, flags disfarçadas de tipo, etc.)
- [ ] 4 Órfãos sinalizados (tabela relevante sem objeto no inventário, ou trigger que nenhum objeto do inventário explica)
```

## Erros comuns

| Desvio | Correção |
|---|---|
| Confiar só no hostname/connection string para identidade de ambiente | Confirmar nome lógico da instância com quem administra o banco |
| Rodar `UPDATE`/`INSERT` "só para testar" durante a captura | Nunca — introspecção é sempre leitura |
| Marcar FK como `garantida_no_banco: true` porque o nome da coluna sugere relação | Só `true` com constraint física confirmada no catálogo |
| Inventar o resumo de uma trigger sem ler o corpo | Ler o corpo real; se não for possível, deixar `resumo` genérico e sinalizar a limitação |
| Fotografar o banco inteiro de uma vez, sem vínculo com o inventário | Escopo = tabelas já citadas no inventário; ampliar só sob pedido |
| Tratar `linhas_aprox` como extração de dados | É só contagem para sizing/risco — nunca ler ou exportar registros |

## Depois deste skill

- Divergência entre FK sugerida pelo código e ausência de constraint física, ou trigger que escreve em tabela compartilhada → nota em `convencoes_observadas` e, quando afetar um item de backlog, seção 7 (`Dados`) da spec via [`spec-generator`](../spec-generator/SKILL.md).
- Tabela sem objeto correspondente no inventário → tratar como órfão na [matriz de cruzamento](../../docs/levantamento/README.md).
