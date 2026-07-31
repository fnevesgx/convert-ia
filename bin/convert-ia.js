#!/usr/bin/env node
// convert.ia — leva convenções, skills e contratos de artefato para um projeto novo.
// Node puro, sem dependências externas — roda idêntico em Windows/Mac/Linux, tanto
// local (node bin/convert-ia.js bootstrap <path>) quanto via `npx github:...`.
//
// Uso:
//   npx github:fnevesgx/convert-ia bootstrap [path-do-projeto-alvo]
//   node bin/convert-ia.js bootstrap [path-do-projeto-alvo]
//
// Sem path: usa o diretório atual — pensado para rodar de DENTRO do projeto novo.
//
// Interativo de propósito: pergunta arquitetura predominante antes de stack, porque é
// ela que determina se o gate de CI de migration destrutiva se aplica (legado-como-
// -api-bff puro normalmente não roda migration contra o banco do legado) e qual stack
// sugerir a partir daí.
//
// Lembrete: no convert.ia arquitetura é decisão POR ITEM de backlog, não de projeto
// (docs/specs/criterios-arquitetura.md) — a pergunta aqui é só para calibrar o
// bootstrap, não substitui a decisão registrada em cada spec.
//
// O que copia: CLAUDE.md/AGENTS.md, .claude/skills/ (orientador, screen-crawler,
// spec-generator, characterization-tester), docs/{levantamento,specs,cronograma,
// sprints,diagramas} (só contratos — READMEs e schemas/), e o gate de CI quando
// aplicável.
//
// O que NÃO copia, de propósito:
//   - docs/*/exemplos/* — são o fio condutor fictício deste repo (ERP Pedidos), só para
//     aprender o padrão. O projeto novo gera os próprios exemplos a partir do primeiro
//     item real.
//   - docs/cronograma/historico.csv — a calibração acumula ENTRE projetos (o schema já
//     tem coluna `projeto`); mantenha centralizado aqui em vez de duplicar por projeto.

"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ORIGEM = path.join(__dirname, "..");
const DOCS_PASTAS = ["levantamento", "specs", "cronograma", "sprints", "diagramas"];

// rl.question() (promise ou callback) perde a 2ª pergunta com stdin via pipe: readline
// processa todas as linhas já bufferadas de uma vez e emite 'line' síncrono, mas o
// listener da pergunta seguinte só é religado depois de um `await` — a linha já foi
// emitida sem ouvinte e se perde, e o stream fecha por não ter mais nada pendente.
// Fila desacoplada de 'line' evita a corrida: funciona igual com stdin em pipe (teste
// automatizado) ou terminal real (humano digitando).
function criarPrompter(rl) {
  const buffer = [];
  const waiters = [];
  rl.on("line", (line) => {
    if (waiters.length > 0) waiters.shift()(line);
    else buffer.push(line);
  });
  return function question(texto) {
    process.stdout.write(texto);
    if (buffer.length > 0) return Promise.resolve(buffer.shift());
    return new Promise((resolve) => waiters.push(resolve));
  };
}

async function perguntar(question, texto, valido) {
  let resposta = "";
  while (!valido(resposta)) {
    resposta = (await question(texto)).trim();
    if (!valido(resposta)) {
      console.log(`\nResposta inválida: "${resposta}"`);
    }
  }
  return resposta;
}

function copiarArquivo(origem, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(origem, destino);
}

function copiarContratosDocs(origemRoot, destinoRoot) {
  for (const pasta of DOCS_PASTAS) {
    const origemPasta = path.join(origemRoot, "docs", pasta);
    const destinoPasta = path.join(destinoRoot, "docs", pasta);
    if (!fs.existsSync(origemPasta)) continue;
    fs.mkdirSync(destinoPasta, { recursive: true });

    for (const entrada of fs.readdirSync(origemPasta, { withFileTypes: true })) {
      if (entrada.isFile() && entrada.name.endsWith(".md")) {
        copiarArquivo(path.join(origemPasta, entrada.name), path.join(destinoPasta, entrada.name));
      }
    }

    const schemasOrigem = path.join(origemPasta, "schemas");
    if (fs.existsSync(schemasOrigem)) {
      fs.cpSync(schemasOrigem, path.join(destinoPasta, "schemas"), { recursive: true });
    }
  }
}

async function main() {
  const [subcomando, pathArg] = process.argv.slice(2);

  if (subcomando !== "bootstrap") {
    console.error("Uso: convert-ia bootstrap [path-do-projeto-alvo]");
    console.error("Sem path: usa o diretório atual.");
    process.exit(1);
  }

  const destino = path.resolve(pathArg || process.cwd());
  if (!fs.existsSync(destino) || !fs.statSync(destino).isDirectory()) {
    console.error(`Diretório alvo não existe: ${destino}`);
    process.exit(1);
  }

  console.log(`convert.ia → ${destino}`);
  console.log("");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  const question = criarPrompter(rl);

  // 1. Arquitetura predominante — sem default silencioso.
  const arquitetura = await perguntar(
    question,
    "Arquitetura predominante do projeto (fullstack/legado-como-api-bff): ",
    (r) => r === "fullstack" || r === "legado-como-api-bff"
  );

  let copiarGate = true;
  let stack = "";
  let migrationPath = "";

  if (arquitetura === "fullstack") {
    const resp = await question(
      "\nStack sugerida: adonisjs (TypeScript/AdonisJS/Lucid — validada no piloto do framework). Enter para aceitar, ou digite outra: "
    );
    stack = resp.trim() || "adonisjs";
  } else {
    console.log(
      "\nlegado-como-api-bff normalmente não roda migration contra o banco do legado — quem é dono do schema continua sendo o legado."
    );
    const resposta = await perguntar(
      question,
      "Projeto é 100% BFF sobre API do legado, ou tem/vai ter itens fullstack também? (so-bff/misto): ",
      (r) => r === "so-bff" || r === "misto"
    );
    if (resposta === "so-bff") {
      copiarGate = false;
    } else {
      const resp = await question(
        "\nStack sugerida para a parte fullstack: adonisjs. Enter para aceitar, ou digite outra: "
      );
      stack = resp.trim() || "adonisjs";
    }
  }

  if (copiarGate && stack !== "adonisjs") {
    migrationPath = await perguntar(
      question,
      "\nPath das migrations do projeto, sem barra final nem glob (ex.: db/migrate): ",
      (r) => r.length > 0
    );
  }

  rl.close();

  console.log("");
  console.log("Copiando...");

  // 2. Convenções para agentes de IA
  copiarArquivo(path.join(ORIGEM, "CLAUDE.md"), path.join(destino, "CLAUDE.md"));
  copiarArquivo(path.join(ORIGEM, "AGENTS.md"), path.join(destino, "AGENTS.md"));
  console.log("  CLAUDE.md / AGENTS.md");

  // 3. Skills — path de auto-descoberta do Claude Code
  fs.mkdirSync(path.join(destino, ".claude", "skills"), { recursive: true });
  fs.cpSync(path.join(ORIGEM, ".claude", "skills"), path.join(destino, ".claude", "skills"), {
    recursive: true,
  });
  console.log("  .claude/skills/ (orientador, screen-crawler, spec-generator, characterization-tester)");

  // 4. Contratos de artefato — READMEs, estratégia e schemas; nunca os exemplos ou o histórico
  copiarContratosDocs(ORIGEM, destino);
  console.log("  docs/{levantamento,specs,cronograma,sprints,diagramas} (contratos, sem exemplos/histórico)");

  // 5. Gate de CI — só quando aplicável; ajustado ao path informado quando o stack não é AdonisJS/Lucid
  if (copiarGate) {
    const gateOrigem = path.join(ORIGEM, ".github", "workflows", "gate-migration-destrutiva.yml");
    const gateDestino = path.join(destino, ".github", "workflows", "gate-migration-destrutiva.yml");
    fs.mkdirSync(path.dirname(gateDestino), { recursive: true });

    let conteudo = fs.readFileSync(gateOrigem, "utf8");
    if (migrationPath) {
      conteudo = conteudo.split("database/migrations").join(migrationPath);
      fs.writeFileSync(gateDestino, conteudo);
      console.log(`  .github/workflows/gate-migration-destrutiva.yml (path ajustado para ${migrationPath}/)`);
    } else {
      fs.writeFileSync(gateDestino, conteudo);
      console.log("  .github/workflows/gate-migration-destrutiva.yml (path default: database/migrations/)");
    }
  } else {
    console.log(
      `  gate de CI não copiado — projeto 100% legado-como-api-bff não roda migration contra o banco do legado. Se um item fullstack aparecer depois, copiar manualmente de ${path.join(ORIGEM, ".github", "workflows", "gate-migration-destrutiva.yml")}.`
    );
  }

  console.log("");
  console.log(
    `Pronto. Não copiado de propósito: docs/*/exemplos/* (fictícios) e historico.csv (calibração fica centralizada em ${ORIGEM}).`
  );
  if (copiarGate) {
    console.log(
      "Próximo passo: revisar CLAUDE.md/AGENTS.md com o time e decidir quem pode aplicar a label 'legado-desligado' no gate de CI."
    );
  } else {
    console.log("Próximo passo: revisar CLAUDE.md/AGENTS.md com o time.");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
