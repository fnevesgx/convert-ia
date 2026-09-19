# Design: decisões tipadas e confiança calibrada

**Data:** 2026-09-19  
**Status:** aprovado (contratos/docs/skills)  
**Escopo desta entrega:** somente schemas, exemplos de contrato, skills, `CLAUDE.md`/`AGENTS.md` e este design. **Nenhum** backfill de artefato real e **nenhuma** integração com fornecedor de modelo.

## Problema

O framework mandava "registrar confiança" (`screen-crawler`, estágio 3) e listava enums de decisão em prosa espalhada — confiança de vínculo (`estrategia-crawl.md`), granularidade do fecho (tabela), triagem (§4 da spec), decisão por regra (§6), classificação de divergência (`characterization-tester`). Nenhum tinha campo tipado: `grep -rn "confianca"` devolvia uma única linha, e era prosa numa skill.

Consequência: os gates humanos eram binários. O checkpoint de granularidade — o que o `estrategia-crawl.md` diz que explode sem critério ("dezenas/centenas de specs quase vazias") — chegava ao humano como lista plana, sem ordem de incerteza.

## Decisão

1. **Registry canônico** de decisões em `docs/levantamento/schemas/decisoes.schema.json`. Toda decisão do framework com conjunto de respostas conhecido vira `$def`: `valor` (enum) + `score` (opcional, 0–1) + `evidencia` + `decidido_por`.
2. **A matriz vira schema-backed** (`matriz-cruzamento.schema.json`), fechando o quarto artefato do levantamento — os outros três já tinham schema. A tabela Markdown continua existindo: é o que o humano lê na revisão.
3. **Threshold com default e override**: `threshold_confianca`, default **0.85**. Projeto pode sobrescrever e então **deve** registrar o valor no artefato.
4. **Vendor-neutral por construção**: `decidido_por` (`humano` · `heuristica` · `agente` · `modelo`) registra a origem. O contrato vale igual com humano, heurística, LLM ou classificador tipado dedicado — nenhuma dependência nova entra no `package.json` ("Node puro, sem dependências externas").

## Regras inegociáveis

- **Gate duro não cede a score.** `triagem: descartar` (exige área usuária), identidade de ambiente (princípio 6), migration destrutiva (princípio 2 + gate de CI) e geração de spec em lote continuam decisões humanas **qualquer que seja o número**.
- **Score ordena, não decide.** Serve para ordenar o checkpoint por incerteza e para definir o que é obrigatório mostrar.
- **Ausência de score não promove nada.** Decisão sem calibração cai no checkpoint como qualquer outra — `score` ausente significa "sem calibração", não "confiança alta".
- **`evidencia` nunca é inventada** para justificar um score — mesma regra que já vale para `descricao`, `rotulo_ui` e `saida_legado`.
- **`listada_secao5` é lookup, não julgamento.** Se a divergência não está escrita na seção 5, nenhum score a torna deliberada (princípio 5).
- **Extração de regra com baixa confiança volta ao fonte**, que é a verdade (princípio 1) — não vira regra "provável" na spec.

## Contratos alterados

Criados:

- `docs/levantamento/schemas/decisoes.schema.json` — `$defs`: `base`, `confianca_vinculo`, `granularidade`, `triagem`, `decisao_regra`, `classificacao_divergencia`
- `docs/levantamento/schemas/matriz-cruzamento.schema.json`
- `docs/levantamento/exemplos/matriz-cruzamento.exemplo.json` — gêmeo do `.md`, mesmos ids

Modificados:

- `docs/levantamento/README.md` — coluna `Confiança`, threshold, novos arquivos
- `docs/levantamento/estrategia-crawl.md` — enum no estágio 3; coluna `granularidade` na tabela de parada; ordem da fila no checkpoint
- `docs/levantamento/exemplos/matriz-cruzamento.exemplo.md` — coluna `Confiança` + link para o gêmeo JSON
- `docs/levantamento/schemas/inventario-fontes.schema.json` — `regras_extraidas[].confianca`
- Skills: `screen-crawler`, `spec-generator`, `characterization-tester`
- `CLAUDE.md` / `AGENTS.md` — referências + ordenação por incerteza no bullet de lote

## Notas de implementação

- `$ref` entre schemas é relativo (`./decisoes.schema.json#/$defs/...`) e **só resolve se o schema que referencia tiver `$id`** — por isso `inventario-fontes.schema.json` ganhou um. `catalogo-telas` e `fotografia-banco` continuam sem, porque não referenciam nada. Validadores precisam carregar `decisoes.schema.json` junto (ajv: `-r`).
- Validado com `npx ajv-cli@5 --spec=draft2020 -c ajv-formats` (o `format: date-time` exige o plugin, como já acontecia nos schemas anteriores). O repo não versiona validador: `package.json` é Node puro, sem dependências.
- Enum usa `a_confirmar`; a tabela Markdown continua renderizando `a confirmar`.
- O `bin/convert-ia.js` copia `schemas/` recursivo, então os schemas novos chegam ao projeto alvo sem mudança no CLI; `exemplos/` continua deliberadamente fora do bootstrap.

## Fora de escopo agora

- Integração com qualquer fornecedor de modelo; nenhuma dependência nova.
- Backfill de matriz/inventário reais com `confianca` — exige reconfirmação de escopo, como todo lote.
- Calibrar o 0.85 com dado real: é ponto de partida, não número medido.
- Mexer na `Divergência` de rótulo da §2 — por contrato é `trim()`/`lowercase`, comparação determinística; colocar modelo ali mudaria o contrato, não o implementaria.
