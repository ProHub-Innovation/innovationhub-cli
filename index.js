#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import {
  getAvailableStacks,
  getAvailableAddons,
  setupProject,
  installDependencies,
} from "./utils/template.js";

const require = createRequire(import.meta.url);
const { version } = require("./package.json");

// ── Parse CLI flags ──────────────────────────────────────────────
const { values: flags } = parseArgs({
  options: {
    name: { type: "string", short: "n" },
    stack: { type: "string", short: "s" },
    addons: { type: "string", short: "a" },
    install: { type: "boolean", short: "i", default: false },
    yes: { type: "boolean", short: "y", default: false },
    help: { type: "boolean", short: "h", default: false },
    version: { type: "boolean", short: "v", default: false },
  },
  strict: false,
});

if (flags.version) {
  console.log(`innovationhub-cli v${version}`);
  process.exit(0);
}

if (flags.help) {
  console.log(`
${pc.bgCyan(pc.black(" InnovationHub CLI "))} v${version}

${pc.bold("Uso:")}
  innovationhub [opções]

${pc.bold("Opções:")}
  -n, --name <nome>       Nome do projeto
  -s, --stack <stack>      Stack do backend
  -a, --addons <addons>    Addons separados por vírgula
  -i, --install            Instalar dependências automaticamente
  -y, --yes                Pular confirmação
  -v, --version            Mostrar versão
  -h, --help               Mostrar ajuda

${pc.bold("Exemplos:")}
  ${pc.dim("# Modo interativo")}
  innovationhub

  ${pc.dim("# Modo direto")}
  innovationhub --name meu-api --stack nest --addons cloudinary,.github --install

  ${pc.dim("# Mínimo (sem addons)")}
  innovationhub -n meu-api -s nest -y
`);
  process.exit(0);
}

async function main() {
  p.intro(pc.bgCyan(pc.black(` InnovationHub CLI v${version} `)));

  // Descobrir stacks disponíveis
  const availableStacks = await getAvailableStacks();
  if (availableStacks.length === 0) {
    p.cancel("Nenhum template encontrado em templates/.");
    process.exit(1);
  }

  const validStackNames = availableStacks.map((s) => s.value);

  // 1. Nome do projeto
  let projectName = flags.name;
  if (!projectName) {
    projectName = await p.text({
      message: "Qual o nome do seu projeto?",
      placeholder: "meu-projeto",
      validate: (value) => {
        if (!value) return "Por favor, insira um nome.";
        if (/[^a-z0-9-]/.test(value))
          return "Use apenas letras minúsculas, números e hífens.";
      },
    });

    if (p.isCancel(projectName)) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }
  }

  // 2. Verificar se a pasta já existe
  try {
    await fs.access(projectName);
    if (flags.yes) {
      await fs.rm(projectName, { recursive: true, force: true });
    } else {
      const overwrite = await p.confirm({
        message: `A pasta '${projectName}' já existe. Deseja sobrescrever?`,
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Operação cancelada.");
        process.exit(0);
      }

      await fs.rm(projectName, { recursive: true, force: true });
    }
  } catch {
    // Pasta não existe, seguir normalmente
  }

  // 3. Escolher stack
  let stack = flags.stack;
  if (stack && !validStackNames.includes(stack)) {
    p.cancel(
      `Stack '${stack}' inválida. Disponíveis: ${validStackNames.join(", ")}`,
    );
    process.exit(1);
  }

  if (!stack) {
    stack = await p.select({
      message: "Qual a stack do Backend?",
      options: availableStacks,
    });

    if (p.isCancel(stack)) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }
  }

  // 4. Ler addons disponíveis para a stack escolhida
  const availableAddons = await getAvailableAddons(stack);
  let selectedAddons = [];

  if (flags.addons) {
    selectedAddons = flags.addons.split(",").map((a) => a.trim());
    const validNames = availableAddons.map((a) => a.name);
    const invalid = selectedAddons.filter((a) => !validNames.includes(a));
    if (invalid.length > 0) {
      p.cancel(
        `Addon(s) inválido(s): ${invalid.join(", ")}\nDisponíveis: ${validNames.join(", ")}`,
      );
      process.exit(1);
    }
  } else if (availableAddons.length > 0) {
    const addonOptions = [
      { value: "none", label: "Nenhum", hint: "pule esta etapa" },
      ...availableAddons.map((a) => ({ value: a.name, label: a.label })),
    ];

    const addonsRaw = await p.multiselect({
      message: "Selecione os recursos opcionais:",
      options: addonOptions,
    });

    if (p.isCancel(addonsRaw)) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }

    selectedAddons = addonsRaw.filter((a) => a !== "none");
  }

  // 5. Resumo antes de executar
  const stackMeta = availableStacks.find((s) => s.value === stack);
  const stackLabel = stackMeta?.label || stack;
  const addonsLabel =
    selectedAddons.length > 0
      ? selectedAddons
          .map(
            (name) =>
              availableAddons.find((a) => a.name === name)?.label ?? name,
          )
          .join(", ")
      : "Nenhum";

  p.note(
    [
      `Projeto:  ${pc.cyan(projectName)}`,
      `Stack:    ${pc.cyan(stackLabel)}`,
      `Addons:   ${pc.cyan(addonsLabel)}`,
    ].join("\n"),
    "Resumo",
  );

  if (!flags.yes) {
    const confirmed = await p.confirm({
      message: "Confirma a criação do projeto?",
      initialValue: true,
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }
  }

  // 6. Criar projeto
  await setupProject(stack, projectName, selectedAddons);

  // 7. Instalar dependências
  const installCmd = stackMeta?.installCmd || "";
  let installed = false;

  if (installCmd && flags.install) {
    await installDependencies(projectName, installCmd);
    installed = true;
  } else if (installCmd && !flags.yes) {
    const shouldInstall = await p.confirm({
      message: "Deseja instalar as dependências agora?",
      initialValue: true,
    });

    if (!p.isCancel(shouldInstall) && shouldInstall) {
      await installDependencies(projectName, installCmd);
      installed = true;
    }
  }

  // 8. Próximos passos
  const steps = [`1. cd ${projectName}`];

  if (!installed && installCmd) {
    steps.push(`2. ${installCmd}`);
  }

  steps.push(
    `${steps.length + 1}. Preencha as variáveis no arquivo .env`,
    `${steps.length + 2}. docker compose up -d  ${pc.dim("# subir banco de dados")}`,
  );

  p.note(steps.join("\n"), "Próximos passos");

  p.outro(pc.green("Projeto criado com sucesso!"));
}

main().catch(console.error);
