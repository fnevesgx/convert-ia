---
name: convert-ia-characterization-tester
description: Use when the user asks to generate or run characterization tests for a converted convert.ia item, validate behavioral parity with the legacy system, replay casos_replay from the screen catalog against the new system, or classify a divergence between new and legacy behavior — before marking any item as ready for QA.
---

# Testes de caracterização — convert.ia

Transforma os `casos_replay` do catálogo de telas em testes executáveis contra o sistema novo, usando o legado como oráculo. Fecha o elo entre o levantamento (estágio 4 do crawl) e a validação de paridade comportamental que antecede o QA humano.

Contratos consumidos: [`docs/levantamento/schemas/catalogo-telas.schema.json`](../../docs/levantamento/schemas/catalogo-telas.schema.json) (campo `casos_replay`) e a spec do item ([`docs/specs/template.md`](../../docs/specs/template.md), seções 5, 6 e 9).

## Quando usar

- "Gerar/rodar os testes de caracterização do CONV-XXXX", "validar paridade com o legado", "replay do item X"
- Item com spec e catálogo com `casos_replay` capturados para as telas de `origem.telas`
- Divergência detectada entre sistema novo e legado que precisa ser classificada (deliberada vs. bug)

## Quando NÃO usar

- Catálogo sem `casos_replay` para as telas do item → voltar ao estágio 4 do [`screen-crawler`](../screen-crawler/SKILL.md); **não inventar oráculo**
- Spec inexistente ou `status: rascunho` → sinalizar; sem a seção 5 preenchida não há como classificar divergência
- Pedido de replay de escrita em produção → recusar; homolog ou snapshot, sempre

## Princípios

1. **O legado é o oráculo.** `saida_legado` vem de captura real; nunca de memória, inferência ou "obviamente deveria ser".
2. **Divergência só é válida se listada na seção 5 da spec.** Não listada = bug do sistema novo (ou oráculo desatualizado — investigar, nunca ignorar).
3. **Oráculo tem validade.** `capturado_em` antigo com legado ainda recebendo manutenção = re-capturar antes de confiar. Re-captura roda o mesmo cenário **no legado** (homolog/snapshot) e atualiza `saida_legado` + `capturado_em` no catálogo.
4. **Teste falhou ≠ teste errado.** Nunca ajustar a asserção para o teste passar. Ou o código novo muda, ou a seção 5 da spec muda (decisão humana de refinamento), ou o oráculo é re-capturado.
5. **Suíte verde libera para o QA humano, não para produção.** A aprovação de caracterização não substitui nenhum gate.

## Pipeline (checklist)

Copie e marque conforme avança:

```
- [ ] 1 Localizar spec + casos_replay (origem.telas → catálogo)
- [ ] 2 Verificar frescor do oráculo (capturado_em × mudanças no legado)
- [ ] 3 Gerar um teste por caso TC-* no stack de teste do projeto
- [ ] 4 Rodar a suíte contra o sistema novo
- [ ] 5 Classificar cada divergência (seção 5 · bug · oráculo velho)
- [ ] 6 Relatar: verde → QA humano · vermelho → volta ao dev com o diff
```

### 1 — Localizar o oráculo

1. Ler o frontmatter da spec: `origem.telas` aponta os registros do catálogo; a seção 9 lista os cenários já semeados pelo [`spec-generator`](../spec-generator/SKILL.md).
2. Para cada tela, coletar os `casos_replay`. Tela do item sem nenhum caso → registrar o buraco na seção 9 e sinalizar; não prosseguir fingindo cobertura.

### 2 — Frescor

1. Comparar `capturado_em` de cada caso com a atividade recente no legado (deploys, chamados, mudanças na KB).
2. Caso suspeito: re-rodar a mesma `entrada` no legado (homolog/snapshot, pelo caminho de menu — não `goto` direto) e atualizar o catálogo. Se a saída mudou, o levantamento envelheceu: reavaliar se a spec ainda descreve o comportamento atual.

### 3 — Gerar

1. Um teste por caso `TC-*`, no stack de teste do projeto (unit/e2e conforme a camada que o caso exercita). Nome do teste referencia `spec_id` + id do caso.
2. Asserções cobrem `saida_legado` campo a campo: tela seguinte, mensagem, dado persistido.
3. Cenários da seção 9 sem replay capturado (derivados só de regra `RN-xx`) também viram teste, marcados como derivados de regra — cobertura menor, e o relatório deixa isso explícito.

### 4 — Rodar / 5 — Classificar

Tabela de decisão para cada divergência:

| Situação | Ação |
|---|---|
| Divergência listada na seção 5 da spec | Teste espera o comportamento novo; anotar a referência à seção 5 no teste |
| Divergência não listada | Bug — item volta ao desenvolvimento com o diff |
| `saida_legado` suspeita ou antiga | Re-capturar (estágio 2 deste pipeline); se o legado mudou, atualizar catálogo e reavaliar |
| Entrada irreproduzível (massa de homolog sumiu) | Recriar a massa ou marcar o caso como bloqueado — nunca "aproximar" a saída |

### 6 — Relatar

Resumo por `spec_id`: total de casos, verdes, divergências deliberadas (com referência à seção 5), bugs, bloqueados. Suíte toda verde → item segue para QA da área usuária; qualquer bug → volta ao dev. A skill relata; quem move o `status` da spec é humano.

## O que este skill nunca faz

- Não inventa nem "corrige" `saida_legado` sem re-captura real no legado.
- Não edita a seção 5 da spec para legalizar uma divergência — isso é decisão humana de refinamento.
- Não marca spec como `concluido` nem aprova cutover de módulo.
- Não roda replay de escrita em produção.

## Erros comuns

| Desvio | Correção |
|---|---|
| Ajustar o teste até passar | O oráculo manda; divergência vai para o dev ou para a seção 5, nunca para a asserção |
| Tratar seção 9 vazia como "sem testes necessários" | É buraco de levantamento — sinalizar e voltar ao estágio 4 |
| Replay com `goto` direto na URL | Reproduzir caminho de menu/sessão, como no crawl |
| Comparar telas por screenshot pixel a pixel | A asserção é sobre comportamento (dados, mensagens, navegação); o design system novo muda os pixels de propósito |
| Rodar a suíte uma vez e arquivar | Caracterização acompanha o item até o cutover do módulo; regressão no legado compartilhando banco também é sinal |

## Depois deste skill

- Suíte verde → QA da área usuária (gate humano)
- Item fechado → `realizado_h` + seção 11 da spec → [`docs/cronograma/historico.csv`](../../docs/cronograma/README.md) (calibração)
