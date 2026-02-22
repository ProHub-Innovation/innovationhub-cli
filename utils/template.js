import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

const IGNORE_ON_COPY = new Set([
  "node_modules",
  "dist",
  "package-lock.json",
  ".ruff_cache",
  ".git",
  "addons",
  "addons.json",
  "template.json",
  "innovation_hub_api.egg-info",
]);

export async function getAvailableStacks() {
  const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
  const stacks = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metaFile = path.join(TEMPLATES_DIR, entry.name, "template.json");
    try {
      const raw = await fs.readFile(metaFile, "utf-8");
      const meta = JSON.parse(raw);
      stacks.push({
        value: entry.name,
        label: meta.label || entry.name,
        hint: meta.description || "",
        installCmd: meta.installCmd || "",
      });
    } catch {
      // template.json não existe, ignorar pasta
    }
  }

  return stacks;
}

/**
 * Lê o addons.json de uma stack e retorna as opções disponíveis.
 * Retorna array vazio se não existir addons.
 */
export async function getAvailableAddons(stack) {
  const addonsFile = path.join(TEMPLATES_DIR, stack, "addons", "addons.json");
  try {
    const raw = await fs.readFile(addonsFile, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Copia o template da stack para a pasta do projeto,
 * instala os addons selecionados e inicializa o git.
 */
export async function setupProject(stack, projectName, selectedAddons = []) {
  const s = p.spinner();
  s.start(`Preparando base ${stack}...`);

  try {
    const stackPath = path.join(TEMPLATES_DIR, stack);

    // Verificar se o template existe
    try {
      await fs.access(stackPath);
    } catch {
      throw new Error(`Template para '${stack}' não encontrado.`);
    }

    // Copiar template (filtrando arquivos desnecessários)
    await fs.cp(stackPath, projectName, {
      recursive: true,
      filter: (src) => {
        const basename = path.basename(src);
        return !IGNORE_ON_COPY.has(basename);
      },
    });

    // Instalar addons selecionados
    if (selectedAddons.length > 0) {
      const addonsConfig = await getAvailableAddons(stack);

      for (let i = 0; i < selectedAddons.length; i++) {
        const addonName = selectedAddons[i];
        const config = addonsConfig.find((a) => a.name === addonName);
        if (!config) continue;

        s.message(
          `Instalando addon ${i + 1}/${selectedAddons.length}: ${config.label}...`,
        );

        const addonSource = path.join(stackPath, "addons", addonName);
        try {
          await fs.access(addonSource);
        } catch {
          continue;
        }

        const addonDest = path.join(projectName, config.dest);
        await fs.mkdir(addonDest, { recursive: true });
        await fs.cp(addonSource, addonDest, { recursive: true });
      }
    }

    // Gerar .env a partir do .env.example
    const envExample = path.join(projectName, ".env.example");
    const envFile = path.join(projectName, ".env");
    try {
      await fs.access(envExample);
      await fs.copyFile(envExample, envFile);
      s.message("Arquivo .env criado a partir do .env.example");
    } catch {
      // .env.example não existe, seguir sem criar
    }

    // Inicializar git
    try {
      execSync("git init", { cwd: projectName, stdio: "ignore" });
      execSync("git add -A", { cwd: projectName, stdio: "ignore" });
      execSync(
        'git commit -m "chore: initial project setup via InnovationHub CLI"',
        { cwd: projectName, stdio: "ignore" },
      );
    } catch {
      // git pode não estar instalado, não é crítico
    }

    s.stop(pc.green("Projeto configurado com sucesso!"));
  } catch (error) {
    s.stop(pc.red("Erro ao configurar o projeto."));
    p.cancel(error.message);
    process.exit(1);
  }
}

/**
 * Instala as dependências do projeto.
 * @param {string} installCmd - Comando de instalação (vem do template.json)
 */
export async function installDependencies(projectName, installCmd) {
  if (!installCmd) return;

  p.log.step(`Instalando dependências (${pc.cyan(installCmd)})...\n`);

  try {
    execSync(installCmd, { cwd: projectName, stdio: "inherit" });
    console.log();
    p.log.success(pc.green("Dependências instaladas!"));
  } catch {
    console.log();
    p.log.warning(
      pc.yellow("Falha ao instalar dependências. Instale manualmente."),
    );
  }
}
