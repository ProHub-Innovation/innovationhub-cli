#!/usr/bin/env node
import * as p from "@clack/prompts";
import { setupProject } from "./utils/git.js";

async function main() {
    p.intro("InnovationHub Project Generator");

    const projectName = await p.text({
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

    const stack = await p.select({
        message: "Qual a stack do Backend?",
        options: [
        { value: "nest", label: "NestJS" },
        { value: "python", label: "Python (FastAPI)" },
        ],
    });

    if (p.isCancel(stack)) {
        p.cancel("Operação cancelada.");
        process.exit(0);
    }

    const addons = await p.multiselect({
        message: "Selecione os recursos opcionais para o projeto:",
        options: [
        { value: "cloudinary", label: "Cloudinary (Upload de Imagens)" },
        { value: "github", label: "GitHub Actions (CI/CD)" },
        { value: "husky", label: "Husky (Lint & Commits)" },
        ],
        required: false,
    });

    if (p.isCancel(addons)) {
        p.cancel("Operação cancelada.");
        process.exit(0);
    }

    await setupProject(stack, projectName, addons);

    p.outro("Projeto criado com sucesso!");
}

main().catch(console.error);
