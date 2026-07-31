# convert.ia — diagramas do framework

Três visões do processo de conversão de sistemas apoiado em IA: a fase de análise com seus contratos de artefato, o ciclo de execução com os gates humanos, e o modo loop (visão de maturidade).

> **Renderização:** GitHub, GitLab e a maioria dos editores Markdown renderizam Mermaid nativamente em blocos ` ```mermaid `. No Confluence é necessário um app de Mermaid (ex.: "Mermaid Diagrams for Confluence") ou colar a imagem exportada de https://mermaid.live. Se as cores dos `classDef` conflitarem com o tema, basta remover as linhas de estilo — a semântica está nos rótulos.

**Legenda de cores:** teal = fase de análise · cinza = artefato (contrato) / gestão · âmbar = gate humano · roxo = execução / agente.

## 1. Fase de análise e contratos de artefato

Cada fase produz um artefato padronizado que alimenta a fase seguinte. Enquanto esses artefatos forem prosa livre, o loop não fecha; estruturados, viram insumo de agentes. O crawl de interface sobe em estágios até o catálogo — ver [`../levantamento/estrategia-crawl.md`](../levantamento/estrategia-crawl.md).

```mermaid
flowchart TB
    LEV["Levantamento<br>crawl em estágios ou fontes"]
    BCK["Backlog<br>cruzamento telas × fontes"]
    REF["Refinamento<br>triagem: converter · descartar · redesenhar"]
    ORC["Cronograma e orçamento<br>gate: aprovação do cliente"]

    A1[/"Catálogo de telas + grafo<br>após estágios 0–4 do crawl"/]
    A2[/"Matriz tela × programa × regra<br>verdade do código"/]
    A3[/"Specs padronizadas<br>uma por item de backlog"/]
    A4[/"Baseline por item<br>base do estimado × realizado"/]

    LEV --> A1
    BCK --> A2
    REF --> A3
    ORC --> A4

    LEV --> BCK --> REF --> ORC

    classDef fase fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef artefato fill:#F1EFE8,stroke:#888780,color:#444441
    classDef gate fill:#FAEEDA,stroke:#BA7517,color:#633806
    class LEV,BCK,REF fase
    class ORC gate
    class A1,A2,A3,A4 artefato
```

## 2. Ciclo de execução (roda a cada sprint)

Os gates humanos permanecem mesmo no modo loop; tudo entre eles é candidato a automação. Item reprovado no QA retorna ao desenvolvimento.

```mermaid
flowchart TB
    SB["Sprint backlog<br>issues no GitHub ou Jira<br>(contrato: docs/sprints/)"]
    DEV["Desenvolvimento com IA<br>plan · código · testes · revisão manual"]
    CR{{"Code review<br>gate: tech lead"}}
    QA{{"QA<br>gate: área usuária"}}
    DEP["Deploy<br>qa → main · migrations · seeds · e2e"]

    SB --> DEV --> CR --> QA --> DEP
    QA -- "reprovado" --> DEV
    DEP -. "sprint seguinte, até a conclusão" .-> SB

    classDef exec fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef gate fill:#FAEEDA,stroke:#BA7517,color:#633806
    classDef gestao fill:#F1EFE8,stroke:#888780,color:#444441
    class DEV,DEP exec
    class CR,QA gate
    class SB gestao
```

## 3. Modo loop (visão de maturidade)

As fases viram agentes encadeados pelos contratos de artefato. O oráculo de caracterização — a suíte gerada a partir do grafo de navegação do levantamento, rodando os mesmos cenários contra o legado e o sistema novo (skill: [`characterization-tester`](../../.claude/skills/characterization-tester/SKILL.md)) — fecha o ciclo de validação automaticamente. Os humanos saem da execução e ficam nos gates.

```mermaid
flowchart LR
    AL["Agente levantamento<br>telas e fontes"]
    AS["Agente specs<br>backlog e regras"]
    AD["Agente dev<br>plan · código · PR"]
    OR["Testes de caracterização<br>legado como oráculo"]
    GH{{"Gates humanos<br>orçamento · code review · aceite"}}

    AL --> AS --> AD --> OR
    OR -- "reprova: itera" --> AD
    OR -- "aprova" --> GH

    classDef agente fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef oraculo fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef gate fill:#FAEEDA,stroke:#BA7517,color:#633806
    class AL,AS,AD agente
    class OR oraculo
    class GH gate
```

## Leitura em conjunto

O diagrama 1 é o que existe hoje formalizado com contratos; o 2 é o motor que roda a cada sprint; o 3 é para onde o framework caminha. O oráculo do diagrama 3 nasce do primeiro artefato do diagrama 1 (o grafo do crawler virando suíte de testes), e os gates do 3 são as mesmas caixas âmbar dos anteriores — o loop não exige inventar nada novo, apenas reorganizar o que já está no processo.
