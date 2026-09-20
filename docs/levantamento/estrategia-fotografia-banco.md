# convert.ia — fotografia do banco

Como chegar à [fotografia do banco](./schemas/fotografia-banco.schema.json): schema físico real do banco legado, obtido por **introspecção** (catalog views / `INFORMATION_SCHEMA` / DDL exportado), não por leitura de código aplicativo. É a quarta entrada da fase de levantamento — roda em paralelo ao catálogo de telas e ao inventário de fontes, e cruza com ambos pelo nome da tabela.

> **Ambiente:** nunca produção. Homologação ou snapshot. Identidade confirmada por evidência do próprio servidor/instância (nome lógico, confirmação com DBA), não só pela string de conexão — ver princípio 6 do `AGENTS.md`. Captura é **somente leitura**: nenhuma consulta desta fase escreve no banco.

## Por que isso importa (e por que não é redundante com o inventário)

O inventário de fontes (`inventario-fontes.objetos[].tabelas[]`) registra **quais tabelas** um objeto do legado toca — descoberto lendo código. A fotografia do banco registra **o que essas tabelas realmente são hoje** — descoberto lendo o catálogo do SGBD. As duas coisas divergem com frequência:

- Código mapeia um cenário lógico (ex.: "PEDCODIGO é FK para CLIENTE") que nunca virou constraint física — comum em legado, onde integridade referencial é garantida na aplicação (princípio 2 do `AGENTS.md`), não no banco.
- Defaults físicos (`'19000101'`, `''`, `0`) confirmam ou corrigem a convenção que uma regra extraída do código só descreve por inferência.
- Triggers físicas escrevem em tabelas compartilhadas sem que nenhum objeto do inventário "chame" isso — só aparecem na fotografia, nunca na leitura de fonte aplicativo.
- Colunas existem no banco sem uso aparente em nenhum objeto lido — candidatas a dead code ou a objetos ainda não mapeados no inventário.

Sem a fotografia, specs herdam suposições sobre o banco em vez de fatos.

## Processo (captura de leitura, sem estágios)

Ao contrário do crawl de telas, a captura do banco não tem sequência de estágios — é uma passada de introspecção somente leitura. O trabalho real está em **decidir o escopo** (quais tabelas) e em **não inventar** o que a introspecção não trouxe.

1. **Gate de ambiente.** Confirmar com evidência do próprio servidor (nome lógico da instância, confirmação humana com DBA/infra) que a conexão aponta para homolog/snapshot, nunca produção. Se ambíguo → parar e perguntar.
2. **Definir escopo.** Partir das tabelas já citadas em `inventario-fontes.objetos[].tabelas[]` (todas as capturadas até o momento) — a fotografia normalmente não precisa cobrir o banco inteiro, só o que o levantamento já tocou. Tabelas descobertas na fotografia sem nenhum objeto correspondente no inventário viram candidatas a órfão (mesma lógica de "objetos sem tela" da matriz de cruzamento).
3. **Introspecção somente leitura**, por tabela do escopo:
   - colunas: nome, tipo físico, nulidade, default, chave primária
   - chaves estrangeiras físicas (constraint) — e, quando o código sugere uma FK que não é `garantida_no_banco`, registrar isso explicitamente em vez de omitir
   - índices
   - triggers — nome, evento, e um resumo do que o corpo faz (lido, nunca inventado)
   - contagem aproximada de linhas (sinal de volume/risco, não precisão contábil)
4. **Registrar convenções observadas** por tabela: valores usados no lugar de `NULL`, colunas com significado que o tipo físico não expressa (ex.: `char(1)` como flag), redundâncias. Isso alimenta diretamente a seção 7 ("Dados") da spec.
5. **Cruzar com o inventário**: nenhuma edição no inventário é necessária — o cruzamento é implícito pelo nome da tabela. Se a fotografia encontrar uma trigger ou uma tabela relevante que nenhum objeto do inventário toca, sinalizar como órfão para investigação (mesmo tratamento de "objetos sem tela" na matriz).

## O que a fotografia do banco deliberadamente não faz

- Não escreve, nem em tabela de log ou staging — introspecção é sempre leitura.
- Não decide `garantida_no_banco: true` por suposição — só quando a constraint física existe no catálogo.
- Não substitui o inventário de fontes: regras de negócio continuam vindo do código (princípio 1 do `AGENTS.md`), a fotografia só documenta a estrutura física.
- Não gera migration nem sugere mudança de schema — é levantamento, não execução (ver princípio 2: mudanças de schema compartilhado exigem confirmação humana explícita).
- Não infere volume de dados por amostragem de linhas específicas além da contagem aproximada — não é extração de dados, é fotografia de estrutura.

## Relação com os contratos

```
inventário de fontes   →  quais tabelas o código toca (por objeto)
fotografia do banco    →  o que essas tabelas realmente são (colunas, FKs, triggers, convenções)
cruzamento (implícito) →  nome da tabela; divergências viram nota em convencoes_observadas
spec seção 7 (Dados)   →  consome as duas: mapeamento nome legado → model novo + convenções herdadas
```

## Arquivos

- [`schemas/fotografia-banco.schema.json`](./schemas/fotografia-banco.schema.json) — contrato do artefato.
- [`exemplos/fotografia-banco.exemplo.json`](./exemplos/fotografia-banco.exemplo.json) — documento completo válido, cruzando com o exemplo do inventário de fontes (`PEDIDO`, `PEDIDOITEM`, `FATURA`).
