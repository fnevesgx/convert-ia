# Design: descrição de controles (fonte × UI)

**Data:** 2026-08-03  
**Status:** aprovado (contratos/docs/skills)  
**Escopo desta entrega:** somente schemas, exemplos de contrato, templates de spec, skills e este design. **Não** backfill das 98 `CONV-*.md` reais nesta rodada.

## Decisão

**Opção C** — preservar a descrição original dos controles:

1. **Description/Caption GeneXus** (ou equivalente) no inventário de fontes.
2. **Rótulo UI** observado no crawl (catálogo rico / estágio 4).

**Abordagem 2** — dois artefatos alinhados, cruzados na spec:

| Artefato | Campo | Papel |
|---|---|---|
| Inventário (`objetos[].controles[]`) | `nome`, `descricao` (obrig.); `tipo_controle`, `trecho_fonte` (opc.) | Fonte manda |
| Catálogo (`campos` / `acoes`) | `rotulo_ui` (obrig. no catálogo rico); `nome_fonte` (opc.) | UI é evidência |
| Spec §2 | tabela fonte × UI + `Divergência` | Consumo para conversão/QA |

## Regras inegociáveis

- **Nunca inventar** `controles[].descricao` nem `rotulo_ui`.
- Fonte vence regras de negócio; UI registra o que a tela mostrou.
- Colunas de grid entram como itens de `campos` com `tipo: "grid_column"`.
- `Divergência` = `sim` somente quando **ambos** descrição e rótulo existem e diferem após normalizar espaços e case; senão `não` ou `—` se faltar um lado.

## Formato exato da tabela na spec (seção 2)

```markdown
| Nome técnico | Descrição (fonte) | Rótulo UI | Tipo | Divergência |
|---|---|---|---|---|
```

Templates: `docs/specs/template.md`, `docs/specs/template-leve.md`.  
Critério de aceite de rótulos: seção 8 dos mesmos templates.

## Contratos alterados

- `docs/levantamento/schemas/inventario-fontes.schema.json` — `controles[]`
- `docs/levantamento/schemas/catalogo-telas.schema.json` — `rotulo_ui`, `nome_fonte`; `$defs.campo` / `$defs.acao`; grid columns
- Exemplos em `docs/levantamento/exemplos/`
- `docs/levantamento/README.md`, `docs/levantamento/estrategia-crawl.md`
- Skills: `spec-generator`, `screen-crawler`

## Plano de backfill (fora desta entrega)

Ordem sugerida; cada passo exige confirmação humana de escopo (ids / lotes), alinhado ao convert.ia:

1. **Inventário real** (`inventario-fontes.json`): para cada objeto de UI já inventariado, extrair `controles[]` **só** do fonte/KB (Description/Caption literais). Objetos sem controles visíveis → `controles: []`. Não preencher descrição “provável”.
2. **Catálogo rico (estágio 4):** sob pedido + ambiente homolog comprovado na UI, preencher `rotulo_ui` (e `nome_fonte` quando cruzável) em `campos`/`acoes`. **Pendente até estágio 4** — specs e inventário podem avançar com `Rótulo UI = —`.
3. **98 specs `CONV-*.md`:** backfill da tabela §2 a partir de `controles[]` + `rotulo_ui` quando existirem.
   - Com só fonte: preencher Nome técnico / Descrição / Tipo; `Rótulo UI` e `Divergência` = `—` (ou `não` se política local preferir quando um lado falta — default do template: `—`).
   - Com fonte + UI: calcular `Divergência`.
   - **Não inventar** células. Lote só após reconfirmar escopo (quais CONV-XXXX entram).
4. **Critério de aceite §8:** ao backfill, incluir o checkbox de rótulos do template se ainda ausente.
5. **Calibração:** não alterar `estimativa_h` / status / tracker só por causa do backfill de controles.

## Fora de escopo agora

- Editar as 98 `docs/specs/CONV-*.md` do projeto.
- Preencher `controles` / `rotulo_ui` no inventário/catálogo **reais** com dados inventados.
- Commit.
