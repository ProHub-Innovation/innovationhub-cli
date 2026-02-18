import { execa } from "execa";
import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";

const TEMPLATE_REPO =
    "https://github.com/ProHub-Innovation/innovation-templates.git";

    export async function setupProject(stack, projectName, addons = []) {
    const tempDir = `.temp-${Date.now()}`;
    const s = p.spinner();
    s.start(`Preparando base ${stack}...`);

    try {
        await execa("git", ["clone", "--depth", "1", TEMPLATE_REPO, tempDir]);
        const stackPath = path.join(tempDir, stack);
        try {
        await fs.access(stackPath);
        } catch {
        throw new Error( `Template para '${stack}' não encontrado no repositório.`);
        }

        await fs.cp(stackPath, projectName, { recursive: true });
        if (addons.length > 0) {
        s.message("Instalando addons...");
        for (const addon of addons) {
            const addonSource = path.join(tempDir, "addons", addon);
            try {
            await fs.access(addonSource);
            } catch {
            continue;
            }

            if (addon === "github") {
            const githubDest = path.join(projectName, ".github");
            await fs.mkdir(githubDest, { recursive: true });
            await fs.cp(addonSource, githubDest, { recursive: true });
            } else if (addon === "cloudinary") {
            const cloudinaryDest = path.join(projectName, "src/cloudinary");
            await fs.mkdir(cloudinaryDest, { recursive: true });
            await fs.cp(addonSource, cloudinaryDest, { recursive: true });
            } else {
            await fs.cp(addonSource, projectName, { recursive: true });
            }
        }
        }
        await fs.rm(tempDir, { recursive: true, force: true });
        const gitPath = path.join(projectName, ".git");
        await fs.rm(gitPath, { recursive: true, force: true }).catch(() => {});
        await execa("git", ["init"], { cwd: projectName });

        s.stop(pc.green("Projeto configurado com sucesso!"));

        p.note(
        `
            Próximos passos:
            1. cd ${projectName}
            2. npm install (ou gerenciador de preferência)
            3. Validar variáveis de ambiente (.env)
            `,
        "Tudo pronto!",
        );
    } catch (error) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

        s.stop(pc.red("Erro ao configurar o projeto."));
        p.cancel(error.message);
        process.exit(1);
    }
}