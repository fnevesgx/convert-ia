# convert.ia — notas obrigatórias para legado GeneXus

Checklist e atalhos específicos de GeneXus. Não substitui os contratos gerais de levantamento; fecha o buraco em que a KB “padrão” do MCP não é a do ambiente crawleado.

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

1. **Preferir diff/leitura do código gerado por ambiente** (`<Ambiente>/src/*.gx` ou estrutura equivalente no monorepo) quando o objetivo é o que realmente roda naquele deploy — costuma ser mais rápido e alinhado à UI do que só o objeto via MCP.
2. **MCP** continua útil para navegar a KB, listar objetos, propriedades e relações — mas só depois do checklist acima.
3. Em conflito entre export XML antigo, MCP na branch errada e `src` do ambiente: **o `src` do ambiente que a UI usa vence** para comportamento; depois alinhar inventário/MCP.

## Fecho transitivo em objetos GeneXus

Procedures compartilhadas (`PConsultaPermissao`, logs, etc.) aparecem em dezenas de telas. Isso **não** gera uma spec por occurrence — ver granularidade no estágio 3 de [`estrategia-crawl.md`](./estrategia-crawl.md) e no [`spec-generator`](../../.claude/skills/spec-generator/SKILL.md).
