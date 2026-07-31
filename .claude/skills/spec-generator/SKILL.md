---
name: convert-ia-spec-generator
description: Gera um rascunho de spec (docs/specs/template.md) a partir de uma linha confirmada da matriz de cruzamento do convert.ia. Use quando o usuário pedir para "gerar a spec do item X", "criar spec a partir da matriz" ou referenciar um id de tela/objeto já cruzado no levantamento.
---

# Gerador de spec — convert.ia

Preenche o rascunho inicial de uma spec de item de backlog (seção 1 a 11 do template), a partir dos artefatos já produzidos na fase de levantamento. O resultado é sempre um **rascunho para revisão humana** — este skill nunca marca uma spec como `status: refinado` ou `aprovado` sozinho.

## Quando usar

- O usuário aponta uma linha confirmada da matriz de cruzamento (`docs/levantamento/README.md`) e pede a spec correspondente.
- O usuário fornece diretamente um `id` de tela (`TEL-xxxx`) e/ou `id` de objeto (`OBJ-xxxx`).

## Entradas necessárias

1. `docs/levantamento/schemas/catalogo-telas.schema.json` + os dados reais do projeto (catálogo preenchido) — para extrair campos, ações, arestas e `casos_replay` da tela.
2. Inventário de fontes preenchido (schema em `docs/levantamento/schemas/inventario-fontes.schema.json`) — para extrair `regras_extraidas` do(s) objeto(s) vinculado(s).
3. A linha da matriz de cruzamento — para confirmar o vínculo tela↔objeto↔regras e saber se é um item confirmado ou "a confirmar".
4. `docs/specs/template.md` — o template alvo.

Se qualquer uma dessas entradas não existir ainda no projeto, pare e informe ao usuário o que falta antes de gerar a spec — não invente dados de tela ou regra que não estejam nos artefatos.

## Passo a passo

1. Localizar a(s) tela(s) e o(s) objeto(s) da linha da matriz.
2. Preencher o frontmatter YAML:
   - `id`: próximo `CONV-XXXX` disponível no diretório de specs do projeto (não reutilizar ids existentes).
   - `origem.telas` / `origem.programas` / `origem.regras`: ids confirmados na matriz.
   - `triagem`: deixar como `converter` por padrão — mudar para `descartar`/`redesenhar` é decisão humana (seção 4 da spec), nunca automática.
   - `complexidade`: deixar em `media`/`media`/`baixa` como ponto de partida — é estimativa humana, não gerada por heurística automática neste skill.
   - `status: rascunho`.
3. Seção 2 (Comportamento atual): compor a partir de `campos`, `acoes`, `arestas` da tela e `regras_extraidas` do(s) objeto(s) — em prosa, não copiar o JSON bruto.
4. Seção 6 (Regras de negócio): uma linha por regra extraída, com `Origem` apontando para o id do objeto.
5. Seção 9 (Testes de caracterização): para cada `casos_replay` da tela, gerar uma linha da tabela com o cenário, a entrada e a `saida_legado` já capturada — não inventar saída esperada.
6. Deixar as seções 1, 3, 4, 5, 7, 8, 10 e 11 com os placeholders do template intactos — são de preenchimento humano (contexto de negócio, relato da área usuária, decisão de triagem, comportamento esperado pós-conversão, dados, critérios de aceite, escopo, fechamento).
7. Salvar o rascunho em `docs/specs/<id>.md` (ou onde o projeto guardar specs) e avisar o usuário que é um rascunho pendente de refinamento humano.

## O que este skill nunca faz

- Não decide triagem (converter/descartar/redesenhar).
- Não inventa regra de negócio que não esteja em `regras_extraidas` ou explicitamente mencionada pelo usuário.
- Não marca a spec como pronta para desenvolvimento — o gate de aprovação é humano (ver `docs/cronograma/README.md`, seção 3).
