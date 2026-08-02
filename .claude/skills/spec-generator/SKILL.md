---
name: convert-ia-spec-generator
description: Use when the user asks to generate a convert.ia spec from a confirmed matrix row, create specs in batch from levantamento, or choose between complete vs light spec tiers after screen-crawler stage 3.
---

# Gerador de spec — convert.ia

Preenche o rascunho inicial de uma spec a partir dos artefatos de levantamento. Sempre **rascunho para revisão humana** — nunca marca `refinado` ou `aprovado` sozinho.

Templates: [`docs/specs/template.md`](../../docs/specs/template.md) (completa) e [`docs/specs/template-leve.md`](../../docs/specs/template-leve.md) (leve).

## Quando usar

- Linha `confirmado` na matriz e pedido de spec
- Ids `TEL-xxxx` / `OBJ-xxxx` já cruzados
- Lote após estágio 3 — **somente depois do checkpoint de granularidade**

## Entradas necessárias

1. Catálogo / evidência de telas do projeto (pode estar parcial — estágios 0–3 bastam para rascunho).
2. Inventário de fontes com `regras_extraidas`.
3. Linha(s) da matriz.
4. Template adequado (`tier`).

Falta artefato → parar e informar; não inventar regra nem `saida_legado`.

## Checkpoint de granularidade (antes de lote)

Obrigatório quando for mais de uma spec ou quando o fecho tiver muitos nós:

```
- [ ] Listar candidatos agrupados por tela-mãe
- [ ] Marcar: completa | leve | só inventário / subseção da mãe
- [ ] Passos de wizard / modal → mãe (não spec separada)
- [ ] Superfície de produto diferente no fecho → perguntar escopo (não assumir)
- [ ] Humano confirmou a lista (ids + cortes) nesta mensagem — não reutilizar "faça todas" ambíguo
```

Sem confirmação explícita do escopo do lote → não gerar arquivos.

## Escolha de tier

| Critério | Tier |
|---|---|
| Tela-mãe / item P1 ou fluxo crítico de primeira linha | `completa` |
| Satélite do fecho, sem UI de negócio própria, baixo impacto | `leve` |
| Utilitário transversal (permissão, log) sem item de backlog | sem spec — inventário + menção nas regras da mãe |

## Passo a passo (uma spec)

1. Localizar tela(s)/objeto(s) da linha; aplicar checkpoint se lote.
2. Frontmatter:
   - `id`: próximo `CONV-XXXX` livre
   - `tier`: `completa` ou `leve`
   - `origem.*` da matriz; `tela_mae` se leve
   - `triagem: converter` (mudar é humano)
   - `complexidade`: ponto de partida `media`/`media`/`baixa` (completa) ou `baixa` (leve)
   - `status: rascunho`
3. Seção 2: prosa a partir de evidência de tela + `regras_extraidas` — não colar JSON bruto.
4. Seção 6: uma linha por regra, `Origem` = id do objeto.
5. Seção 9: **uma linha por regra testável** (resultado esperado derivado da regra). Se houver `casos_replay` capturado de verdade, pode complementar — **nunca inventar** `saida_legado`. Buraco de replay não bloqueia o rascunho.
6. Completa: deixar seções 1, 3, 4, 5, 7, 8, 10, 11 com placeholders humanos. Leve: só as seções do `template-leve.md`.
7. Salvar em `docs/specs/<id>.md` e avisar que é rascunho.

## O que este skill nunca faz

- Não decide triagem nem promove `tier` leve→completa sem humano.
- Não inventa regra fora de `regras_extraidas` / menção explícita do usuário.
- Não gera spec separada por passo de wizard.
- Não gera lote sem reconfirmação de escopo na hora.
- Não marca spec pronta para desenvolvimento.
