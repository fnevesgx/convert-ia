#!/usr/bin/env bash
# convert.ia — leva convenções, skills e contratos de artefato para um projeto novo.
#
# Uso:
#   scripts/bootstrap-projeto.sh <path-do-projeto-alvo>
#
# Interativo de propósito: pergunta arquitetura predominante antes de stack, porque é
# ela que determina se o gate de CI de migration destrutiva se aplica (legado-como-
# -api-bff puro normalmente não roda migration contra o banco do legado — quem é dono
# do schema continua sendo o legado) e qual stack sugerir a partir daí.
#
# Lembrete: no convert.ia arquitetura é decisão POR ITEM de backlog, não de projeto
# (docs/specs/criterios-arquitetura.md) — a pergunta aqui é só para calibrar o
# bootstrap, não substitui a decisão registrada em cada spec.
#
# O que copia: CLAUDE.md/AGENTS.md, .claude/skills/ (orientador, screen-crawler,
# spec-generator, characterization-tester), docs/{levantamento,specs,cronograma,sprints,
# diagramas} (só contratos — READMEs e schemas/), e o gate de CI quando aplicável.
#
# O que NÃO copia, de propósito:
#   - docs/*/exemplos/* — são o fio condutor fictício deste repo (ERP Pedidos), só para
#     aprender o padrão. O projeto novo gera os próprios exemplos a partir do primeiro
#     item real.
#   - docs/cronograma/historico.csv — a calibração acumula ENTRE projetos (o schema já
#     tem coluna `projeto`); mantenha centralizado aqui em vez de duplicar por projeto.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <path-do-projeto-alvo>" >&2
  exit 1
fi

DESTINO="$1"
ORIGEM="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$DESTINO" ]; then
  echo "Diretório alvo não existe: $DESTINO" >&2
  exit 1
fi
DESTINO="$(cd "$DESTINO" && pwd)"

echo "convert.ia → $DESTINO"
echo

# 1. Arquitetura predominante — sem default silencioso. Determina se o gate de CI se
# aplica e qual stack sugerir a seguir.
ARQUITETURA=""
while [ "$ARQUITETURA" != "fullstack" ] && [ "$ARQUITETURA" != "legado-como-api-bff" ]; do
  read -r -p "Arquitetura predominante do projeto (fullstack/legado-como-api-bff): " ARQUITETURA
  if [ "$ARQUITETURA" != "fullstack" ] && [ "$ARQUITETURA" != "legado-como-api-bff" ]; then
    echo "Responda 'fullstack' ou 'legado-como-api-bff'."
  fi
done

COPIAR_GATE=true
STACK=""
MIGRATION_PATH=""

if [ "$ARQUITETURA" = "fullstack" ]; then
  read -r -p "Stack sugerida: adonisjs (TypeScript/AdonisJS/Lucid — validada no piloto do framework). Enter para aceitar, ou digite outra: " STACK
  STACK="${STACK:-adonisjs}"
else
  echo "legado-como-api-bff normalmente não roda migration contra o banco do legado — quem é dono do schema continua sendo o legado."
  RESPOSTA=""
  while [ "$RESPOSTA" != "so-bff" ] && [ "$RESPOSTA" != "misto" ]; do
    read -r -p "Projeto é 100% BFF sobre API do legado, ou tem/vai ter itens fullstack também? (so-bff/misto): " RESPOSTA
    if [ "$RESPOSTA" != "so-bff" ] && [ "$RESPOSTA" != "misto" ]; then
      echo "Responda 'so-bff' ou 'misto'."
    fi
  done
  if [ "$RESPOSTA" = "so-bff" ]; then
    COPIAR_GATE=false
  else
    read -r -p "Stack sugerida para a parte fullstack: adonisjs. Enter para aceitar, ou digite outra: " STACK
    STACK="${STACK:-adonisjs}"
  fi
fi

if [ "$COPIAR_GATE" = true ] && [ "$STACK" != "adonisjs" ]; then
  read -r -p "Path das migrations do projeto, sem barra final nem glob (ex.: db/migrate): " MIGRATION_PATH
  while [ -z "$MIGRATION_PATH" ]; do
    read -r -p "Não pode ficar em branco — path das migrations: " MIGRATION_PATH
  done
fi

echo
echo "Copiando..."

# 2. Convenções para agentes de IA
cp "$ORIGEM/CLAUDE.md" "$DESTINO/CLAUDE.md"
cp "$ORIGEM/AGENTS.md" "$DESTINO/AGENTS.md"
echo "  CLAUDE.md / AGENTS.md"

# 3. Skills — path de auto-descoberta do Claude Code
mkdir -p "$DESTINO/.claude/skills"
cp -r "$ORIGEM/.claude/skills/." "$DESTINO/.claude/skills/"
echo "  .claude/skills/ (orientador, screen-crawler, spec-generator, characterization-tester)"

# 4. Contratos de artefato — READMEs, estratégia e schemas; nunca os exemplos ou o histórico
for pasta in levantamento specs cronograma sprints diagramas; do
  mkdir -p "$DESTINO/docs/$pasta"
  find "$ORIGEM/docs/$pasta" -maxdepth 1 -type f -name "*.md" -exec cp {} "$DESTINO/docs/$pasta/" \;
  if [ -d "$ORIGEM/docs/$pasta/schemas" ]; then
    mkdir -p "$DESTINO/docs/$pasta/schemas"
    cp -r "$ORIGEM/docs/$pasta/schemas/." "$DESTINO/docs/$pasta/schemas/"
  fi
done
echo "  docs/{levantamento,specs,cronograma,sprints,diagramas} (contratos, sem exemplos/histórico)"

# 5. Gate de CI — só quando aplicável; ajustado ao path informado quando o stack não é AdonisJS/Lucid
if [ "$COPIAR_GATE" = true ]; then
  mkdir -p "$DESTINO/.github/workflows"
  cp "$ORIGEM/.github/workflows/gate-migration-destrutiva.yml" "$DESTINO/.github/workflows/"
  if [ -n "$MIGRATION_PATH" ]; then
    sed -i.bak "s|database/migrations|$MIGRATION_PATH|g" "$DESTINO/.github/workflows/gate-migration-destrutiva.yml"
    rm -f "$DESTINO/.github/workflows/gate-migration-destrutiva.yml.bak"
    echo "  .github/workflows/gate-migration-destrutiva.yml (path ajustado para $MIGRATION_PATH/)"
  else
    echo "  .github/workflows/gate-migration-destrutiva.yml (path default: database/migrations/)"
  fi
else
  echo "  gate de CI não copiado — projeto 100% legado-como-api-bff não roda migration contra o banco do legado. Se um item fullstack aparecer depois, copiar manualmente de $ORIGEM/.github/workflows/gate-migration-destrutiva.yml."
fi

echo
echo "Pronto. Não copiado de propósito: docs/*/exemplos/* (fictícios) e historico.csv" \
     "(calibração fica centralizada em $ORIGEM)."
if [ "$COPIAR_GATE" = true ]; then
  echo "Próximo passo: revisar CLAUDE.md/AGENTS.md com o time e decidir quem pode aplicar" \
       "a label 'legado-desligado' no gate de CI."
else
  echo "Próximo passo: revisar CLAUDE.md/AGENTS.md com o time."
fi
