#!/usr/bin/env bash
# convert.ia — instala o framework no diretório atual, sem precisar clonar este repo
# manualmente antes. Pensado pra rodar de DENTRO do projeto novo.
#
# Uso (de dentro do projeto novo, com `gh` autenticado e acesso ao repo privado):
#   gh api repos/fnevesgx/convert-ia/contents/scripts/bootstrap-remoto.sh --jq '.content' | base64 -d | bash
#
# O que faz: clona este repo (raso, num diretório temporário) e roda
# scripts/bootstrap-projeto.sh apontando pro diretório atual como destino — as
# mesmas perguntas interativas (arquitetura, stack) acontecem normalmente. Depois
# apaga o clone temporário. Zero lógica duplicada: quem faz o trabalho de verdade
# continua sendo bootstrap-projeto.sh.

set -euo pipefail

REPO="fnevesgx/convert-ia"
DESTINO="$(pwd)"

if ! command -v gh >/dev/null 2>&1; then
  echo "Precisa do GitHub CLI (gh) autenticado — https://cli.github.com" >&2
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "convert.ia → clonando framework temporariamente..."
gh repo clone "$REPO" "$TMP_DIR/convert-ia" -- --depth=1 --quiet

bash "$TMP_DIR/convert-ia/scripts/bootstrap-projeto.sh" "$DESTINO"
