# convert.ia — notas obrigatórias para legado GeneXus

Checklist e atalhos específicos de GeneXus. Não substitui os contratos gerais de levantamento; fecha dois buracos: a KB “padrão” do MCP não ser a do ambiente crawleado, e a KB não mostrar tudo o que o código gerado faz.

## Antes de ler qualquer fonte (obrigatório)

Copie e marque no início de todo projeto (e ao retomar depois de trocar de KB/ambiente):

```
- [ ] Ambiente de UI confirmado (homolog/snapshot) — identidade na tela, não só URL
- [ ] Versão/branch da KB alinhada a esse ambiente (nome + evidência)
- [ ] MCP / ferramenta apontando para essa mesma KB — não a “ativa por default”
- [ ] Caminho do código gerado do ambiente localizado (<Ambiente>/src ou equivalente do projeto)
```

**Por quê:** KBs GeneXus têm múltiplas versões/branches. A ativa no MCP frequentemente **não** é a que serve a homolog crawleada. Specs escritas contra a branch errada parecem corretas até o comportamento real divergir.

Registrar no inventário ou README do levantamento do projeto: `kb`, `versão/branch`, `ambiente UI`, `path src gerado`, `data da confirmação`.

## Como ler fonte com menos atrito

1. **Preferir diff/leitura do código gerado por ambiente** (`<Ambiente>/src` — `.cs`, `.java` ou equivalente do gerador — ou estrutura equivalente no monorepo) quando o objetivo é o que realmente roda naquele deploy — costuma ser mais rápido e alinhado à UI do que só o objeto via MCP.
2. **MCP** continua útil para navegar a KB, listar objetos, propriedades e relações — mas só depois do checklist acima.
3. Em conflito entre export XML antigo, MCP na branch errada e `src` do ambiente: **o `src` do ambiente que a UI usa vence** para comportamento; depois alinhar inventário/MCP.

## KB × código gerado — de onde vem cada regra

Princípio 1 do `AGENTS.md` aplicado ao GeneXus: “o código” são duas camadas.

- **KB** — mostra a **intenção**: transações, procedures, web panels, regras declaradas.
- **Código gerado** (`.cs`, `.java`… em `<Ambiente>/src`) — mostra o **comportamento real**, inclusive o que a KB não deixa explícito.

**Quando divergem, vale o código gerado** (do ambiente certo — ver checklist acima). A divergência é registrada na spec, não resolvida em silêncio.

### Ordem de leitura

1. Ler primeiro os objetos da KB relacionados ao item.
2. Abrir o código gerado **apenas do objeto em análise**, e só quando houver dúvida sobre o comportamento real. Casos típicos:
   - integridade referencial automática (validação de FK, delete/update em cascata);
   - fórmulas inline, verticais ou horizontais;
   - ordem de disparo das regras (`on insert`, `on update`, `on delete`, `after confirm`, `after trn` etc.);
   - comportamentos implícitos do gerador que não aparecem na KB.
3. **Nunca** ler o código gerado do sistema inteiro nem de objetos fora do escopo do item (economia de contexto — o fecho transitivo já diz quais objetos importam).
4. Usar o fluxo de navegação e o catálogo de telas para confirmar em qual tela e em qual momento a regra se manifesta.
5. Não copiar código gerado para a spec/inventário: referenciar arquivo e método (`trecho_fonte`, `confirmacao_codigo_gerado`).

### Situação de cada regra extraída

Campo `situacao` em `regras_extraidas[]` do [inventário de fontes](./schemas/inventario-fontes.schema.json):

| `situacao` | Quando | Vai para |
|---|---|---|
| `confirmada` | Entendida na KB e, quando necessário, confirmada no código gerado | Seção 6 da spec → testes (seção 9) |
| `duvidosa` | Comportamento ambíguo, divergência KB × gerado não explicada, ou depende de dado real para entender | Pendências de validação da spec (6.1) |
| `suspeita_codigo_morto` | Nenhum fluxo, tela ou chamada conhecida a aciona | Pendências de validação da spec (6.1) |

Regras:

- **Seguir sem travar:** prosseguir com as confirmadas; não parar a extração/spec para perguntar a cada dúvida.
- Duvidosas e suspeitas de código morto **não** vão para implementação nem viram teste — ficam nas pendências.
- **Não inventar regra para preencher lacuna.** Se não está claro, é `duvidosa`.
- Suspeita de código morto **não** é `triagem: descartar` — descartar continua exigindo validação com a área usuária (`AGENTS.md`).
- Se a falta de uma regra duvidosa impedir a implementação do item, a spec registra o **bloqueio** e qual regra precisa ser validada (não sobe para `aprovado` com bloqueio aberto).

### Validação das pendências (gate humano)

Pendências não são validadas item a item: são **consolidadas por sprint ou por módulo** e validadas de uma vez pela área usuária / responsável pelo negócio. Regra aprovada passa a `confirmada` (inventário + seção 6 da spec) e o item volta para a fila; regra rejeitada sai da pendência com a decisão anotada.

## Fecho transitivo em objetos GeneXus

Procedures compartilhadas (`PConsultaPermissao`, logs, etc.) aparecem em dezenas de telas. Isso **não** gera uma spec por occurrence — ver granularidade no estágio 3 de [`estrategia-crawl.md`](./estrategia-crawl.md) e no [`spec-generator`](../../.claude/skills/spec-generator/SKILL.md).
