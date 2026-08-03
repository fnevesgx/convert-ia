# convert.ia — template de spec por item (completa)

Este é o contrato de saída da fase de **refinamento** e o contrato de entrada da fase de **desenvolvimento**. Uma spec por item de backlog de **primeira linha**. O frontmatter YAML é a parte legível por máquina — é o que permite agentes consumirem a spec no modo loop e o que alimenta a calibração de estimado × realizado. As seções em prosa são a parte legível por humanos.

Satélites do fecho transitivo e itens pequenos: usar [`template-leve.md`](./template-leve.md) (`tier: leve`).

Convenção de preenchimento: substitua os textos em itálico; remova seções não aplicáveis apenas se marcar o motivo no frontmatter — não se aplica silenciosamente.

---

```yaml
---
id: CONV-0000
titulo: ""
sistema: ""                     # sistema/módulo de origem
tier: completa                  # completa | leve — leve usa template-leve.md
origem:
  telas: []                     # ids do catálogo de telas (levantamento)
  programas: []                 # objetos/fontes do legado (ex.: objetos da KB GeneXus)
  regras: []                    # ids da matriz tela × programa × regra
triagem: converter              # converter | descartar | redesenhar
arquitetura: fullstack          # fullstack | legado-como-api-bff — critérios de apoio: ./criterios-arquitetura.md (decisão humana, agente não infere)
design_system_ref: ""           # link (Figma, site publicado) ou path de um HTML exportado — referência do design modernizado, insumo externo ao levantamento
complexidade:
  tela: media                   # baixa | media | alta
  negocio: media                # baixa | media | alta
  dados: baixa                  # baixa | media | alta
estimativa_h: 0
realizado_h: null               # preencher no fechamento
dependencias: []                # ids de outros itens (CONV-XXXX)
status: rascunho                # rascunho | refinado | aprovado | em-dev | em-qa | concluido — a partir de 'aprovado' o tracker manda (docs/sprints/README.md); este campo só é atualizado de novo no fechamento
---
```

## 1. Contexto e objetivo

*O que este item entrega quando concluído e por que existe. Duas ou três frases, linguagem de negócio.*

## 2. Comportamento atual — verdade do código

*O que o legado faz hoje, extraído dos fontes e do crawler. Fluxo de telas (referencie os ids do grafo de navegação), programas envolvidos e o comportamento observável. Aqui não entra opinião: é o que o código diz.*

### Controles (fonte × UI)

*Uma linha por controle relevante. `Descrição (fonte)` = Description/Caption do inventário (`controles[]`) — nunca inventar. `Rótulo UI` = `rotulo_ui` do catálogo (estágio 4); se ainda não houver catálogo rico, usar `—`. `Divergência` = `sim` somente quando **ambos** existem e diferem após normalizar espaços e case; caso contrário `não` (ou `—` se faltar um dos lados).*

| Nome técnico | Descrição (fonte) | Rótulo UI | Tipo | Divergência |
|---|---|---|---|---|
| *PedClienteId* | *Cliente* | *Código do Cliente* | *edit* | *sim* |

## 3. Relato da área usuária

*O complemento humano: exceções que só quem opera conhece, casos reais, gambiarras de uso, o que ninguém documentou. É o que separa converter o sistema de converter os bugs junto.*

## 4. Decisão de triagem

*Justificativa do valor escolhido no frontmatter (`converter`, `descartar` ou `redesenhar`). Se `redesenhar`, descreva o comportamento novo e o motivo. Se `descartar`, registre a evidência (regra morta, funcionalidade sem uso).*

## 5. Comportamento esperado — pós-conversão

*O que muda e o que permanece. Componentes do design system modernizado aplicados às telas — ver `design_system_ref` no frontmatter (link ou HTML exportado; não confundir com o `design_system.tokens` do catálogo de telas, que é o levantamento seco do que o **legado** usa hoje, não o alvo). Diferenças deliberadas em relação ao legado devem estar listadas aqui — qualquer diferença não listada é bug.*

## 6. Regras de negócio

| ID | Regra | Origem | Decisão |
|----|-------|--------|---------|
| RN-01 | *descrição da regra* | *fonte (programa) ou relato* | manter / ajustar / remover |

## 7. Dados

*Premissa do convert.ia: a base existente é reutilizada — legado e sistema novo compartilham o mesmo banco durante a convivência; estrutura nova só em exceção justificada. Documente aqui:*

- *Tabelas e campos envolvidos, com o mapeamento nome legado → model do sistema novo.*
- *Convenções herdadas que o sistema novo deve respeitar (ex.: valores vazios/zerados no lugar de NULL, integridade referencial garantida na aplicação e não no banco, redundâncias e fórmulas materializadas).*
- *Quem mais escreve nessas tabelas enquanto o legado estiver vivo (programas, jobs, triggers) e as regras de negócio que precisam existir dos dois lados nesse período.*
- *Mudanças de schema necessárias — sempre aditivas e retrocompatíveis com o legado (expand/contract): nada de rename ou drop antes do desligamento; refatoração de modelo é projeto pós-conversão.*
- *Caso raro — topologia com sincronização: se este item roda numa instalação standalone que sincroniza com um servidor central (padrão app móvel offline-first), documentar aqui a estratégia de resolução de conflito de escrita assíncrona (last-write-wins, fila de operações, merge manual). As convenções acima cobrem escritor concorrente simultâneo; sincronização assíncrona é um problema à parte.*

## 8. Critérios de aceite

- [ ] *Critério verificável pela área usuária no QA*
- [ ] *Rótulos exibidos batem com a coluna «Rótulo UI» da seção 2 quando houver captura de estágio 4; onde só existe «Descrição (fonte)», o rótulo do sistema novo preserva essa descrição (salvo diferença deliberada listada na seção 5)*
- [ ] *…*

## 9. Testes de caracterização

*Caminho padrão: cenários derivados das regras da seção 6, automatizados no **sistema novo**. A verdade da regra veio do código legado (seção 2/6); a execução do teste não exige replay ao vivo. Se existir `casos_replay` no catálogo (exceção / estágio 4), pode enriquecer a tabela — nunca inventar `saida_legado`.*

| Cenário | Passos / entrada | Resultado esperado | Regra coberta | Origem |
|---------|------------------|--------------------|---------------|--------|
| TC-01 | *…* | *…* | RN-01 | regra / replay |

## 10. Fora de escopo

*O que explicitamente não entra neste item, para proteger a estimativa.*

## 11. Registro de fechamento

*Preenchido ao concluir: `realizado_h` no frontmatter, desvios em relação à estimativa e o porquê, aprendizados. Esta seção alimenta a calibração de cronograma e orçamento dos próximos projetos — é o framework aprendendo com ele mesmo.*
